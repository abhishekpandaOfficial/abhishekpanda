import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebAuthnCredential {
  id: string;
  deviceName: string;
  biometricType: 'faceid' | 'touchid' | 'fingerprint' | 'windows-hello';
  lastUsed: Date;
  createdAt: Date;
}

interface UseWebAuthnReturn {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  availableMethods: string[];
  credentials: WebAuthnCredential[];
  registerCredential: () => Promise<boolean>;
  authenticateWithCredential: () => Promise<boolean>;
  removeCredential: (id: string) => Promise<void>;
  detectCapabilities: () => void;
  loadCredentials: () => Promise<void>;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);

  const isSupported = typeof window !== 'undefined' && 
    'PublicKeyCredential' in window &&
    typeof window.PublicKeyCredential === 'function';

  // Load credentials from Supabase on mount
  const loadCredentials = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('passkey_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (fetchError) {
        console.error('Error loading credentials:', fetchError);
        return;
      }

      if (data) {
        const mapped: WebAuthnCredential[] = data.map((cred) => ({
          id: cred.credential_id,
          deviceName: cred.device_name || 'Unknown Device',
          biometricType: (cred.device_type as WebAuthnCredential['biometricType']) || 'fingerprint',
          lastUsed: cred.last_used_at ? new Date(cred.last_used_at) : new Date(cred.created_at),
          createdAt: new Date(cred.created_at),
        }));
        setCredentials(mapped);
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const detectCapabilities = useCallback(async () => {
    if (!isSupported) {
      setAvailableMethods([]);
      return;
    }

    const methods: string[] = [];
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad/.test(ua)) {
          methods.push('FaceID', 'TouchID');
        } else if (/mac/.test(ua)) {
          methods.push('TouchID');
        } else if (/android/.test(ua)) {
          methods.push('Fingerprint');
        } else if (/windows/.test(ua)) {
          methods.push('Windows Hello');
        } else {
          methods.push('Biometric');
        }
      }
    } catch {
      // Platform authenticator not available
    }

    setAvailableMethods(methods);
  }, [isSupported]);

  const registerCredential = useCallback(async (): Promise<boolean> => {
    console.log('=== useWebAuthn: registerCredential called ===');
    
    if (!isSupported) {
      console.error('WebAuthn not supported');
      setError('WebAuthn is not supported on this device');
      return false;
    }

    // Check if we're in an iframe - WebAuthn doesn't work in iframes without special permissions
    const isInIframe = window !== window.top;
    if (isInIframe) {
      console.error('Detected iframe environment');
      setError('Passkey registration cannot work inside an embedded preview frame. Please open the deployed app URL directly in a new browser tab to register passkeys.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        setError('You must be logged in to register a passkey');
        setIsLoading(false);
        return false;
      }

      console.log('Starting WebAuthn registration for user:', user.id);

      // Detect if on Apple device for specific handling
      const ua = navigator.userAgent.toLowerCase();
      const isAppleDevice = /iphone|ipad|ipod|macintosh|mac os x/.test(ua);
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
      
      console.log('Device detection:', { isAppleDevice, isIOS, isSafari });

      // Check if platform authenticator is available
      let platformAvailable = false;
      try {
        platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('Platform authenticator available:', platformAvailable);
      } catch (e) {
        console.warn('Could not check platform authenticator:', e);
        // Continue anyway - some browsers don't support this check
        platformAvailable = true;
      }

      if (!platformAvailable) {
        console.error('No platform authenticator available');
        setError('No platform authenticator available. Please ensure Touch ID/Face ID is set up on your device in Settings.');
        setIsLoading(false);
        return false;
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Use user's email to create deterministic user ID
      const encoder = new TextEncoder();
      const userIdData = encoder.encode(user.id);
      const userId = new Uint8Array(userIdData.slice(0, 64));

      // Apple-optimized WebAuthn options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Abhishek Panda Admin',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: user.email || 'admin@abhishekpanda.com',
          displayName: user.email?.split('@')[0] || 'Admin User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 (best for Apple devices)
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          // For iOS/iPadOS, use platform authenticator for Touch ID/Face ID
          authenticatorAttachment: 'platform',
          // Use 'preferred' instead of 'required' for better iOS compatibility
          userVerification: isAppleDevice ? 'preferred' : 'required',
          // For iOS 16+, resident keys work well; for older versions, discourage
          residentKey: isIOS ? 'preferred' : 'discouraged',
          requireResidentKey: false,
        },
        // Longer timeout for Apple devices (they can be slower to respond)
        timeout: isAppleDevice ? 120000 : 60000, // 2 minutes for Apple, 1 minute for others
        attestation: 'none', // No attestation for better compatibility
      };

      // Try to add exclude credentials, but don't fail if it errors
      try {
        if (credentials.length > 0) {
          const excludeList: PublicKeyCredentialDescriptor[] = [];
          for (const c of credentials) {
            try {
              // Handle base64url encoding
              const base64 = c.id.replace(/-/g, '+').replace(/_/g, '/');
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              excludeList.push({ 
                id: bytes, 
                type: 'public-key',
                // Add transports hint for better compatibility
                transports: isAppleDevice ? ['internal'] : undefined
              });
            } catch (e) {
              console.warn('Could not parse credential ID for exclusion:', c.id);
            }
          }
          if (excludeList.length > 0) {
            publicKeyCredentialCreationOptions.excludeCredentials = excludeList;
          }
        }
      } catch (e) {
        console.warn('Could not set exclude credentials:', e);
      }

      console.log('WebAuthn creation options:', {
        rpId: publicKeyCredentialCreationOptions.rp.id,
        userName: publicKeyCredentialCreationOptions.user.name,
        timeout: publicKeyCredentialCreationOptions.timeout,
        authenticatorAttachment: publicKeyCredentialCreationOptions.authenticatorSelection?.authenticatorAttachment,
        userVerification: publicKeyCredentialCreationOptions.authenticatorSelection?.userVerification,
        isAppleDevice,
      });

      console.log('=== Calling navigator.credentials.create() ===');
      console.log('This should trigger the Touch ID/FaceID system prompt now...');
      console.log('Waiting for user interaction with biometric sensor...');
      
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      console.log('navigator.credentials.create() completed');


      if (credential) {
        console.log('Credential created successfully:', credential.id);
        
        const ua = navigator.userAgent.toLowerCase();
        let biometricType: WebAuthnCredential['biometricType'] = 'fingerprint';
        let deviceName = 'Unknown Device';

        // Better device detection
        if (/iphone/.test(ua)) {
          biometricType = 'faceid';
          deviceName = 'iPhone';
        } else if (/ipad/.test(ua)) {
          biometricType = 'touchid';
          deviceName = 'iPad';
        } else if (/macintosh|mac os x/.test(ua)) {
          biometricType = 'touchid';
          // Try to detect Mac type
          if (/macbook/.test(ua)) {
            deviceName = 'MacBook';
          } else {
            deviceName = 'iMac / Mac';
          }
        } else if (/android/.test(ua)) {
          biometricType = 'fingerprint';
          deviceName = 'Android Device';
        } else if (/windows/.test(ua)) {
          biometricType = 'windows-hello';
          deviceName = 'Windows PC';
        }

        // Get the public key from the response
        const response = credential.response as AuthenticatorAttestationResponse;
        let publicKeyBase64 = '';
        
        try {
          const publicKeyBuffer = response.getPublicKey?.();
          if (publicKeyBuffer) {
            publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
          }
        } catch (pkError) {
          console.warn('Could not extract public key, using attestation object instead');
          // Fallback to attestation object
          publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(response.attestationObject)));
        }

        // Save to Supabase
        const { error: insertError } = await supabase
          .from('passkey_credentials')
          .insert({
            user_id: user.id,
            credential_id: credential.id,
            public_key: publicKeyBase64,
            device_name: deviceName,
            device_type: biometricType,
            counter: 0,
            transports: response.getTransports?.() || [],
          });

        if (insertError) {
          console.error('Error saving credential:', insertError);
          setError('Failed to save credential to database');
          setIsLoading(false);
          return false;
        }

        const newCredential: WebAuthnCredential = {
          id: credential.id,
          deviceName,
          biometricType,
          lastUsed: new Date(),
          createdAt: new Date(),
        };

        setCredentials(prev => [...prev, newCredential]);
        localStorage.setItem('admin_passkey_registered', 'true');
        
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      console.error('WebAuthn registration error:', err);
      
      // More specific error messages
      if (err.name === 'NotAllowedError') {
        setError('Authentication was cancelled or not allowed. Please try again and touch the Touch ID sensor when prompted.');
      } else if (err.name === 'InvalidStateError') {
        setError('A passkey already exists for this account. Try using existing passkey or remove it first.');
      } else if (err.name === 'NotSupportedError') {
        setError('This browser or device does not support passkeys. Try Safari on Mac or Chrome with Touch ID enabled.');
      } else if (err.name === 'SecurityError') {
        setError('Security error. Ensure you are using HTTPS and Touch ID is enabled in System Preferences.');
      } else if (err.name === 'AbortError') {
        setError('The operation was aborted. Please try again.');
      } else {
        setError(err.message || 'Failed to create passkey. Please check Touch ID is set up correctly.');
      }
    }

    setIsLoading(false);
    return false;
  }, [isSupported]);

  const authenticateWithCredential = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('WebAuthn is not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (assertion) {
        // Update last used timestamp in Supabase
        if (user) {
          await supabase
            .from('passkey_credentials')
            .update({ last_used_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('credential_id', assertion.id);
        }

        // Update local state
        setCredentials(prev => prev.map(c => 
          c.id === assertion.id ? { ...c, lastUsed: new Date() } : c
        ));
        
        localStorage.setItem('biometric_verified', Date.now().toString());
        sessionStorage.setItem('biometric_verified', Date.now().toString());
        
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }

    setIsLoading(false);
    return false;
  }, [isSupported]);

  const removeCredential = useCallback(async (credentialId: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Soft delete by setting is_active to false
      const { error: deleteError } = await supabase
        .from('passkey_credentials')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('credential_id', credentialId);

      if (deleteError) {
        console.error('Error removing credential:', deleteError);
        return;
      }

      setCredentials(prev => prev.filter(c => c.id !== credentialId));
      
      if (credentials.length <= 1) {
        localStorage.removeItem('admin_passkey_registered');
      }
    } catch (err) {
      console.error('Error removing credential:', err);
    }
  }, [credentials.length]);

  return {
    isSupported,
    isLoading,
    error,
    availableMethods,
    credentials,
    registerCredential,
    authenticateWithCredential,
    removeCredential,
    detectCapabilities,
    loadCredentials,
  };
};
