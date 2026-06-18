import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  corsHeaders,
  getClientIp,
  isValidEmail,
  json,
  normalizeEmail,
  randomHex,
  signDownloadToken,
  verifyOtpHash,
} from "../_shared/ebooks-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const JWT_DOWNLOAD_SECRET = Deno.env.get("JWT_DOWNLOAD_SECRET");

type VerifyRequest = {
  email?: string;
  code?: string;
  ebookSlug?: string;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_DOWNLOAD_SECRET) {
    return json(500, { error: "Missing server configuration" });
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as VerifyRequest;
    const email = normalizeEmail(String(payload.email || ""));
    const code = String(payload.code || "").trim();
    const ebookSlug = String(payload.ebookSlug || "").trim();
    const clientIp = getClientIp(req);

    if (!email || !code || !ebookSlug) return json(400, { error: "Missing required fields" });
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });
    if (!/^\d{6}$/.test(code)) return json(400, { error: "OTP must be 6 digits" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: otpRow, error: otpFetchError } = await supabase
      .from("ebook_otp_codes")
      .select("id, code_hash, attempts, expires_at")
      .eq("email", email)
      .eq("ebook_slug", ebookSlug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError || !otpRow) return json(400, { error: "OTP not found. Request a new code." });
    if (new Date(otpRow.expires_at).getTime() < Date.now()) return json(400, { error: "OTP expired. Request a new code." });
    if (otpRow.attempts >= 5) return json(429, { error: "Too many attempts. Request a new OTP." });

    const valid = await verifyOtpHash(code, otpRow.code_hash);
    if (!valid) {
      const { error: attemptsErr } = await supabase
        .from("ebook_otp_codes")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id);
      if (attemptsErr) console.error("attempt update error", attemptsErr);
      return json(400, { error: "Invalid OTP" });
    }

    const { error: leadUpdateErr } = await supabase
      .from("ebook_lead_captures")
      .update({ verified_at: new Date().toISOString(), request_ip: clientIp })
      .eq("email", email)
      .eq("ebook_slug", ebookSlug)
      .is("verified_at", null);
    if (leadUpdateErr) {
      console.error("lead update error", leadUpdateErr);
      return json(500, { error: "Failed to verify lead" });
    }

    const jti = randomHex(16);
    const exp = Math.floor(Date.now() / 1000) + 15 * 60;
    const token = await signDownloadToken(
      {
        sub: email,
        ebookSlug,
        jti,
        exp,
      },
      JWT_DOWNLOAD_SECRET,
    );

    const { error: sessionErr } = await supabase.from("ebook_download_sessions").insert({
      email,
      ebook_slug: ebookSlug,
      token_jti: jti,
      expires_at: new Date(exp * 1000).toISOString(),
    });
    if (sessionErr) {
      console.error("session insert error", sessionErr);
      return json(500, { error: "Failed to create download session" });
    }

    return json(200, { downloadToken: token });
  } catch (error) {
    console.error("ebooks-verify-otp error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
