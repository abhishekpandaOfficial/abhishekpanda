import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebAuthnCredential {
  id: string;
  deviceName: string;
  biometricType: "faceid" | "touchid" | "fingerprint" | "windows-hello";
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
  authenticateWithCredential: (opts?: { step?: 4 | 5 }) => Promise<boolean>;
  removeCredential: (id: string) => Promise<void>;
  detectCapabilities: () => void;
  loadCredentials: () => Promise<void>;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);

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
      if (optErr) throw optErr;
      const options = data?.options;
      if (!options) throw new Error("Missing registration options.");

      const cred = (await navigator.credentials.create({
        publicKey: options,
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("No credential returned.");

      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("admin-webauthn", {
        body: { action: "registration_verify", response: cred },
      });
      if (verifyErr) throw verifyErr;
      if (!verifyData?.verified) throw new Error("Passkey verification failed.");

      localStorage.setItem("admin_passkey_registered", "true");
      await loadCredentials();
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to register passkey");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, loadCredentials]);

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
        if (optErr) throw optErr;
        const options = data?.options;
        if (!options) throw new Error("Missing authentication options.");

        const assertion = (await navigator.credentials.get({
          publicKey: options,
        })) as PublicKeyCredential | null;
        if (!assertion) throw new Error("No assertion returned.");

        const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("admin-webauthn", {
          body: { action: "authentication_verify", step: opts?.step ?? null, response: assertion },
        });
        if (verifyErr) throw verifyErr;
        if (!verifyData?.verified) throw new Error("Authentication verification failed.");

        await loadCredentials();
        return true;
      } catch (err: any) {
        setError(err?.message || "Authentication failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, loadCredentials]
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

