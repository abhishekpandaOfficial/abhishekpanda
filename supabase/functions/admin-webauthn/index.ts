import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "https://esm.sh/@simplewebauthn/server@10.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getBearerToken = (req: Request) => {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice("bearer ".length).trim();
};

const base64urlToUint8 = (v: string) => {
  const base64 = v.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((v.length + 3) % 4);
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

const uint8ToBase64url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const stringToUint8 = (v: string) => new TextEncoder().encode(v);
const ENFORCED_RP_ID = "www.abhishekpanda.com";
const ENFORCED_ORIGIN = "https://www.abhishekpanda.com";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Missing Supabase env." });

    const token = getBearerToken(req);
    if (!token) return json(401, { error: "Missing Authorization bearer token." });

    const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userRes, error: userErr } = await sbAdmin.auth.getUser(token);
    if (userErr || !userRes?.user) return json(401, { error: "Invalid token." });
    const user = userRes.user;

    // Admin only
    const { data: roleRow } = await sbAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json(403, { error: "Admin role required." });

    const origin = req.headers.get("origin") || "";
    if (!origin) return json(400, { error: "Missing Origin header." });
    if (origin !== ENFORCED_ORIGIN) {
      return json(403, { error: "Origin not allowed." });
    }
    const rpID = ENFORCED_RP_ID;
    const expectedOrigin = ENFORCED_ORIGIN;

    const { action, step, response } = await req.json().catch(() => ({}));
    if (!action) return json(400, { error: "Missing action." });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 min

    const log = async (status: string, failure_reason: string | null = null) => {
      try {
        await sbAdmin.from("login_audit_logs").insert({
          email: user.email ?? "unknown",
          status,
          failure_reason,
          user_agent: req.headers.get("user-agent"),
          ip_address:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("cf-connecting-ip") ??
            null,
        });
      } catch {
        // ignore audit failures
      }
    };

    if (action === "registration_options") {
      const { data: existingCreds } = await sbAdmin
        .from("passkey_credentials")
        .select("credential_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const opts = await generateRegistrationOptions({
        rpName: "Abhishek Panda Admin",
        rpID,
        userID: stringToUint8(user.id),
        userName: user.email ?? user.id,
        timeout: 120000,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
        residentKey: "required",
        requireResidentKey: true,
      },
        supportedAlgorithmIDs: [-7, -257], // ES256, RS256
      excludeCredentials: (existingCreds ?? []).map((c) => ({
        id: c.credential_id,
        type: "public-key" as const,
      })),
      });

      await sbAdmin.from("webauthn_challenges").insert({
        user_id: user.id,
        challenge: opts.challenge,
        kind: "registration",
        rp_id: rpID,
        origin: expectedOrigin,
        expires_at: expiresAt.toISOString(),
      });

      await log("webauthn_reg_options");
      return json(200, { options: opts });
    }

    if (action === "registration_verify") {
      if (!response) return json(400, { error: "Missing response." });

      const { data: row, error } = await sbAdmin
        .from("webauthn_challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("kind", "registration")
        .eq("used", false)
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error || !row) return json(400, { error: "No active registration challenge." });

      let verification;
      try {
        verification = await verifyRegistrationResponse({
          response,
          expectedChallenge: row.challenge,
          expectedOrigin: row.origin,
          expectedRPID: row.rp_id,
          requireUserVerification: false,
        });
      } catch (e) {
        await log("webauthn_reg_failed", e instanceof Error ? e.message : String(e));
        return json(400, { verified: false, error: "Registration verification failed." });
      }

      if (!verification.verified || !verification.registrationInfo) {
        await log("webauthn_reg_failed", "Not verified.");
        return json(400, { verified: false, error: "Not verified." });
      }

      const info = verification.registrationInfo;
      await sbAdmin.from("passkey_credentials").upsert(
        {
          user_id: user.id,
          credential_id: uint8ToBase64url(info.credentialID),
          public_key: uint8ToBase64url(info.credentialPublicKey),
          counter: info.counter,
          device_name: "Admin Device",
          device_type: "platform",
          transports: (response?.response?.transports ?? null) as string[] | null,
          is_active: true,
        },
        { onConflict: "credential_id" },
      );

      await sbAdmin.from("webauthn_challenges").update({ used: true }).eq("id", row.id);

      await log("webauthn_reg_verified");
      return json(200, { verified: true });
    }

    if (action === "authentication_options") {
      const { data: creds } = await sbAdmin
        .from("passkey_credentials")
        .select("credential_id, transports")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!creds || creds.length === 0) {
        return json(400, { error: "No passkey registered." });
      }

      const opts = await generateAuthenticationOptions({
        rpID,
        timeout: 60000,
        userVerification: "preferred",
      allowCredentials: creds.map((c) => ({
        id: c.credential_id,
        type: "public-key" as const,
        transports: (c.transports ?? undefined) as any,
      })),
      });

      await sbAdmin.from("webauthn_challenges").insert({
        user_id: user.id,
        challenge: opts.challenge,
        kind: "authentication",
        rp_id: rpID,
        origin: expectedOrigin,
        expires_at: expiresAt.toISOString(),
      });

      await log("webauthn_auth_options");
      return json(200, { options: opts });
    }

    if (action === "authentication_verify") {
      if (!response) return json(400, { error: "Missing response." });

      const { data: chal, error: chalErr } = await sbAdmin
        .from("webauthn_challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("kind", "authentication")
        .eq("used", false)
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (chalErr || !chal) return json(400, { error: "No active authentication challenge." });

      const credentialID: string = response?.id;
      if (!credentialID) return json(400, { error: "Missing credential id." });

      // Normalize ID to base64url without padding (simplewebauthn uses base64url strings).
      const normId = String(credentialID).replace(/=+$/g, "");

      const { data: cred } = await sbAdmin
        .from("passkey_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("credential_id", normId)
        .eq("is_active", true)
        .maybeSingle();
      if (!cred) return json(400, { error: "Credential not found." });

      let verification;
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: chal.challenge,
          expectedOrigin: chal.origin,
          expectedRPID: chal.rp_id,
          authenticator: {
            credentialID: base64urlToUint8(cred.credential_id),
            credentialPublicKey: base64urlToUint8(cred.public_key),
            counter: cred.counter,
            transports: (cred.transports ?? undefined) as any,
          },
          requireUserVerification: false,
        });
      } catch (e) {
        await log("webauthn_auth_failed", e instanceof Error ? e.message : String(e));
        return json(400, { verified: false, error: "Authentication verification failed." });
      }

      if (!verification.verified) {
        await log("webauthn_auth_failed", "Not verified.");
        return json(400, { verified: false, error: "Not verified." });
      }

      // Update counter + last_used.
      await sbAdmin
        .from("passkey_credentials")
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: now.toISOString(),
        })
        .eq("id", cred.id);

      await sbAdmin.from("webauthn_challenges").update({ used: true }).eq("id", chal.id);

      // Track steps server-side (4h)
      const sessionExpires = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const stepCol =
        step === 4 ? "webauthn_step4_verified_at" : step === 5 ? "webauthn_step5_verified_at" : null;

      const patch: Record<string, unknown> = {
        user_id: user.id,
        expires_at: sessionExpires.toISOString(),
        updated_at: now.toISOString(),
      };
      if (stepCol) patch[stepCol] = now.toISOString();

      // If both webauthn steps + OTP done, mark fully verified.
      const { data: existing } = await sbAdmin
        .from("admin_mfa_sessions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const otpOk = !!existing?.otp_verified_at;
      const s4Ok = step === 4 ? true : !!existing?.webauthn_step4_verified_at;
      const s5Ok = step === 5 ? true : !!existing?.webauthn_step5_verified_at;
      if (otpOk && s4Ok && s5Ok) {
        patch.fully_verified_at = now.toISOString();
      }

      await sbAdmin.from("admin_mfa_sessions").upsert(patch, { onConflict: "user_id" });

      await log("webauthn_auth_verified");
      return json(200, { verified: true });
    }

    if (action === "mfa_status") {
      const { data: s } = await sbAdmin
        .from("admin_mfa_sessions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      const ok = !!s?.fully_verified_at && new Date(s.expires_at).getTime() > Date.now();
      return json(200, { ok, session: s ?? null });
    }

    return json(400, { error: "Unknown action." });
  } catch (e) {
    console.error("admin-webauthn handler error", e);
    return json(500, { error: "Internal Server Error" });
  }
};

serve(handler);
