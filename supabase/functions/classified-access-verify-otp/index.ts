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
  name?: string;
  email?: string;
  code?: string;
  userAgent?: string;
  operator?: {
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    isp?: string;
    timezone?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    source?: string;
  } | null;
};

const asText = (value: unknown, max = 255) => {
  if (typeof value !== "string") return null;
  const next = value.trim();
  return next ? next.slice(0, max) : null;
};

const asNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_DOWNLOAD_SECRET) {
    return json(500, { error: "Missing server configuration" });
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as VerifyRequest;
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(String(payload.email || ""));
    const code = String(payload.code || "").trim();
    const clientIp = getClientIp(req);
    const operator = payload.operator && typeof payload.operator === "object" ? payload.operator : null;

    if (!name || !email || !code) return json(400, { error: "Missing required fields" });
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });
    if (!/^\d{6}$/.test(code)) return json(400, { error: "OTP must be 6 digits" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: otpRow, error: otpFetchError } = await supabase
      .from("classified_access_otp_codes")
      .select("id, code_hash, attempts, expires_at, request_id")
      .eq("email", email)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError || !otpRow) return json(400, { error: "OTP not found. Request a new code." });
    if (new Date(otpRow.expires_at).getTime() < Date.now()) return json(400, { error: "OTP expired. Request a new code." });
    if (otpRow.attempts >= 5) return json(429, { error: "Too many attempts. Request a new OTP." });

    const valid = await verifyOtpHash(code, otpRow.code_hash);
    if (!valid) {
      await supabase
        .from("classified_access_otp_codes")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id);
      return json(400, { error: "Invalid OTP" });
    }

    await supabase
      .from("classified_access_otp_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpRow.id);

    const requestIp = clientIp !== "unknown" ? clientIp : asText(operator?.ip, 64);
    const requestPatch: Record<string, unknown> = {
      verified_at: new Date().toISOString(),
      request_ip: requestIp,
      name,
    };
    const city = asText(operator?.city, 120);
    const region = asText(operator?.region, 120);
    const country = asText(operator?.country, 120);
    const isp = asText(operator?.isp, 180);
    const timezone = asText(operator?.timezone, 120);
    const latitude = asNumber(operator?.latitude);
    const longitude = asNumber(operator?.longitude);
    const source = asText(operator?.source, 80);
    const userAgent = asText(payload.userAgent, 1200);
    if (city) requestPatch.city = city;
    if (region) requestPatch.region = region;
    if (country) requestPatch.country = country;
    if (isp) requestPatch.isp = isp;
    if (timezone) requestPatch.timezone = timezone;
    if (latitude !== null) requestPatch.latitude = latitude;
    if (longitude !== null) requestPatch.longitude = longitude;
    if (source) requestPatch.source = source;
    if (userAgent) requestPatch.user_agent = userAgent;

    if (otpRow.request_id) {
      await supabase
        .from("classified_access_requests")
        .update(requestPatch)
        .eq("id", otpRow.request_id);
    } else {
      const { data: latestRequest } = await supabase
        .from("classified_access_requests")
        .select("id")
        .eq("email", email)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRequest?.id) {
        await supabase
          .from("classified_access_requests")
          .update(requestPatch)
          .eq("id", latestRequest.id);
      } else {
        await supabase.from("classified_access_requests").insert({
          name,
          email,
          ...requestPatch,
        });
      }
    }

    const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
    const token = await signDownloadToken(
      {
        sub: email,
        name,
        jti: randomHex(16),
        aud: "classified-access",
        exp,
      },
      JWT_DOWNLOAD_SECRET,
    );

    return json(200, {
      accessToken: token,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch (error) {
    console.error("classified-access-verify-otp error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
