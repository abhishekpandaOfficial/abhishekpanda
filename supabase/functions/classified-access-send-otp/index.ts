import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  corsHeaders,
  generateOtp,
  getClientIp,
  hashOtp,
  isValidEmail,
  json,
  normalizeEmail,
} from "../_shared/ebooks-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM =
  Deno.env.get("EMAIL_FROM") ||
  Deno.env.get("RESEND_FROM") ||
  "Abhishek Panda <no-reply@abhishekpanda.com>";

type SendRequest = {
  name?: string;
  email?: string;
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing Supabase server configuration" });
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as SendRequest;
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(String(payload.email || ""));
    const clientIp = getClientIp(req);
    const operator = payload.operator && typeof payload.operator === "object" ? payload.operator : null;

    if (!name || !email) return json(400, { error: "Missing required fields" });
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const [{ count: emailCount }, { count: otpCount }, { count: ipCount }] = await Promise.all([
      supabase
        .from("classified_access_requests")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", fifteenMinutesAgo),
      supabase
        .from("classified_access_otp_codes")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", tenMinutesAgo),
      supabase
        .from("classified_access_requests")
        .select("*", { count: "exact", head: true })
        .eq("request_ip", clientIp)
        .gte("created_at", fifteenMinutesAgo),
    ]);

    if ((emailCount ?? 0) >= 6) return json(429, { error: "Too many attempts. Please try later." });
    if ((otpCount ?? 0) >= 4) return json(429, { error: "OTP retry limit reached. Please wait 10 minutes." });
    if (clientIp !== "unknown" && (ipCount ?? 0) >= 25) {
      return json(429, { error: "Too many requests from this location." });
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const requestIp = clientIp !== "unknown" ? clientIp : asText(operator?.ip, 64);
    const { data: requestRow, error: reqInsertError } = await supabase
      .from("classified_access_requests")
      .insert({
        name,
        email,
        request_ip: requestIp,
        city: asText(operator?.city, 120),
        region: asText(operator?.region, 120),
        country: asText(operator?.country, 120),
        isp: asText(operator?.isp, 180),
        timezone: asText(operator?.timezone, 120),
        latitude: asNumber(operator?.latitude),
        longitude: asNumber(operator?.longitude),
        source: asText(operator?.source, 80),
        user_agent: asText(payload.userAgent, 1200),
      })
      .select("id")
      .single();
    if (reqInsertError) {
      console.error("classified request insert error", reqInsertError);
      return json(500, { error: "Failed to create access request" });
    }
    if (!requestRow?.id) {
      return json(500, { error: "Failed to create access request" });
    }

    const { error: otpInsertError } = await supabase.from("classified_access_otp_codes").insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      request_ip: requestIp,
      request_id: requestRow.id,
    });
    if (otpInsertError) {
      console.error("classified otp insert error", otpInsertError);
      return json(500, { error: "Failed to create OTP" });
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing; classified OTP email skipped.");
      return json(200, { success: true, message: "OTP generated. Email provider is not configured yet." });
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#050811;color:#f3f6ff;border-radius:16px;border:1px solid #1f2940;">
        <h1 style="font-size:22px;margin:0 0 8px;">Classified Access Verification</h1>
        <p style="margin:0 0 14px;color:#b6bfd6;">Use this OTP to access ARGUS VIII Classified preview.</p>
        <div style="font-size:34px;font-weight:800;letter-spacing:7px;background:#10172a;border:1px solid #2f3f67;border-radius:12px;padding:16px;text-align:center;">${otp}</div>
        <p style="margin:14px 0 0;color:#9aa5c2;font-size:12px;">Valid for 10 minutes. If this wasn't you, ignore this email.</p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Your OTP for ARGUS Classified access",
        html,
      }),
    });

    if (!emailRes.ok) {
      const details = await emailRes.text();
      console.error("classified otp email error", details);
      return json(502, { error: "OTP was generated but email delivery failed." });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error("classified-access-send-otp error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
