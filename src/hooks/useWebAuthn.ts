import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const base64urlToBuffer = (base64url: string): ArrayBuffer => {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const normalizeCreationOptions = (options: any): PublicKeyCredentialCreationOptions => ({
  ...options,
  challenge: base64urlToBuffer(options.challenge),
  user: {
    ...options.user,
    id: base64urlToBuffer(options.user.id),
  },
  excludeCredentials: (options.excludeCredentials ?? []).map((cred: any) => ({
    ...cred,
    id: base64urlToBuffer(cred.id),
  })),
});

const normalizeRequestOptions = (options: any): PublicKeyCredentialRequestOptions => ({
  ...options,
  challenge: base64urlToBuffer(options.challenge),
  allowCredentials: (options.allowCredentials ?? []).map((cred: any) => ({
    ...cred,
    id: base64urlToBuffer(cred.id),
  })),
});

const credentialToJSON = (cred: PublicKeyCredential) => {
  const rawId = bufferToBase64url(cred.rawId);
  const response = cred.response as AuthenticatorResponse;
  const clientExtensionResults = cred.getClientExtensionResults?.() ?? {};

  if ("attestationObject" in response) {
    const attRes = response as AuthenticatorAttestationResponse;
    return {
      id: cred.id,
      rawId,
      type: cred.type,
      response: {
        clientDataJSON: bufferToBase64url(attRes.clientDataJSON),
        attestationObject: bufferToBase64url(attRes.attestationObject),
        transports: attRes.getTransports ? attRes.getTransports() : undefined,
      },
      clientExtensionResults,
    };
  }

  const asrRes = response as AuthenticatorAssertionResponse;
  return {
    id: cred.id,
    rawId,
    type: cred.type,
    response: {
      clientDataJSON: bufferToBase64url(asrRes.clientDataJSON),
      authenticatorData: bufferToBase64url(asrRes.authenticatorData),
      signature: bufferToBase64url(asrRes.signature),
      userHandle: asrRes.userHandle ? bufferToBase64url(asrRes.userHandle) : null,
    },
    clientExtensionResults,
  };
};

interface WebAuthnCredential {
  id: string;
  deviceName: string;
  biometricType: "faceid" | "touchid" | "fingerprint" | "windows-hello";
  lastUsed: Date;
  createdAt: Date;
}

interface WebAuthnDebugState {
  lastAction: string | null;
  lastEdgeResponse: unknown | null;
  lastEdgeError: { name?: string; message?: string; status?: number } | null;
  lastWebAuthnError: { name?: string; message?: string } | null;
}

interface UseWebAuthnReturn {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  availableMethods: string[];
  credentials: WebAuthnCredential[];
  debug: WebAuthnDebugState;
  registerCredential: () => Promise<boolean>;
  authenticateWithCredential: (opts?: { step?: 4 | 5 }) => Promise<boolean>;
  removeCredential: (id: string) => Promise<void>;
  resetPasskeyState: () => Promise<boolean>;
  detectCapabilities: () => void;
  loadCredentials: () => Promise<void>;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [debug, setDebug] = useState<WebAuthnDebugState>({
    lastAction: null,
    lastEdgeResponse: null,
    lastEdgeError: null,
    lastWebAuthnError: null,
  });

  const isSupported =
    typeof window !== "undefined" &&
    "PublicKeyCredential" in window &&
    typeof window.PublicKeyCredential === "function";

  const loadCredentials = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from("passkey_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (fetchError) return;

      if (data) {
        setCredentials(
          data.map((cred) => ({
            id: cred.credential_id,
            deviceName: cred.device_name || "Admin Device",
            biometricType: (cred.device_type as WebAuthnCredential["biometricType"]) || "fingerprint",
            lastUsed: cred.last_used_at ? new Date(cred.last_used_at) : new Date(cred.created_at),
            createdAt: new Date(cred.created_at),
          }))
        );
      }
    } catch {
      // ignore
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
        if (/iphone|ipad/.test(ua)) methods.push("FaceID", "TouchID");
        else if (/mac/.test(ua)) methods.push("TouchID");
        else if (/android/.test(ua)) methods.push("Fingerprint");
        else if (/windows/.test(ua)) methods.push("Windows Hello");
        else methods.push("Biometric");
      }
    } catch {
      // ignore
    }

    setAvailableMethods(methods);
  }, [isSupported]);

  const recordEdge = useCallback((action: string, data: unknown, err?: any) => {
    setDebug((prev) => ({
      ...prev,
      lastAction: action,
      lastEdgeResponse: data ?? null,
      lastEdgeError: err
        ? {
            name: err?.name,
            message: err?.message,
            status: err?.status,
          }
        : null,
    }));
  }, []);

  const recordWebAuthnError = useCallback((err: any) => {
    if (!err) return;
    setDebug((prev) => ({
      ...prev,
      lastWebAuthnError: {
        name: err?.name,
        message: err?.message,
      },
    }));
  }, []);

  const registerCredential = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("WebAuthn is not supported on this device");
      return false;
    }

    const isInIframe = window !== window.top;
    if (isInIframe) {
      setError("Passkey registration cannot work inside an embedded preview frame. Open the app directly.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: optErr } = await supabase.functions.invoke("admin-webauthn", {
        body: { action: "registration_options" },
      });
      recordEdge("registration_options", data, optErr);
      if (optErr) throw optErr;
      const options = data?.options;
      if (!options) throw new Error("Missing registration options.");

      const cred = (await navigator.credentials.create({
        publicKey: normalizeCreationOptions(options),
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("No credential returned.");

      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("admin-webauthn", {
        body: { action: "registration_verify", response: credentialToJSON(cred) },
      });
      recordEdge("registration_verify", verifyData, verifyErr);
      if (verifyErr) throw verifyErr;
      if (!verifyData?.verified) throw new Error("Passkey verification failed.");

      localStorage.setItem("admin_passkey_registered", "true");
      await loadCredentials();
      return true;
    } catch (err: any) {
      recordWebAuthnError(err);
      setError(err?.message || "Failed to register passkey");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, loadCredentials, recordEdge, recordWebAuthnError]);

  const authenticateWithCredential = useCallback(
    async (opts?: { step?: 4 | 5 }): Promise<boolean> => {
      if (!isSupported) {
        setError("WebAuthn is not supported");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: optErr } = await supabase.functions.invoke("admin-webauthn", {
          body: { action: "authentication_options" },
        });
        recordEdge("authentication_options", data, optErr);
        if (optErr) throw optErr;
        const options = data?.options;
        if (!options) throw new Error("Missing authentication options.");
        if (options?.allowCredentials?.length) {
          try {
            const key = "passkey_discoverable_warned";
            const warned =
              typeof window !== "undefined" && typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem(key)
                : "true";
            if (!warned) {
              toast.warning(
                "This passkey isn't discoverable in this Chrome profile, so you may see a phone QR prompt. Re-register on this browser at www.abhishekpanda.com to fix it.",
              );
              sessionStorage.setItem(key, "true");
            }
          } catch {
            // ignore storage errors
          }
        }

        const assertion = (await navigator.credentials.get({
          publicKey: normalizeRequestOptions(options),
        })) as PublicKeyCredential | null;
        if (!assertion) throw new Error("No assertion returned.");

        const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("admin-webauthn", {
          body: { action: "authentication_verify", step: opts?.step ?? null, response: credentialToJSON(assertion) },
        });
        recordEdge("authentication_verify", verifyData, verifyErr);
        if (verifyErr) throw verifyErr;
        if (!verifyData?.verified) throw new Error("Authentication verification failed.");

        await loadCredentials();
        return true;
      } catch (err: any) {
        recordWebAuthnError(err);
        setError(err?.message || "Authentication failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, loadCredentials, recordEdge, recordWebAuthnError]
  );

  const removeCredential = useCallback(
    async (credentialId: string): Promise<void> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("passkey_credentials")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("credential_id", credentialId);

        await loadCredentials();
      } catch {
        // ignore
      }
    },
    [loadCredentials]
  );

  const resetPasskeyState = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_passkey_registered");
        sessionStorage.removeItem("biometric_verified");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: resetErr } = await supabase
          .from("passkey_credentials")
          .update({ is_active: false })
          .eq("user_id", user.id);
        if (resetErr) throw resetErr;
      }

      await loadCredentials();
      return true;
    } catch (err: any) {
      recordWebAuthnError(err);
      setError(err?.message || "Failed to reset passkey state");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadCredentials, recordWebAuthnError]);

  return {
    isSupported,
    isLoading,
    error,
    availableMethods,
    credentials,
    debug,
    registerCredential,
    authenticateWithCredential,
    removeCredential,
    resetPasskeyState,
    detectCapabilities,
    loadCredentials,
  };
};
