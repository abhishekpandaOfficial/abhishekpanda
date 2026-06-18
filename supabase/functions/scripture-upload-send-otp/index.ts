import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  corsHeaders,
  generateOtp,
  getClientIp,
  hashOtp,
  isValidEmail,
  isValidMobile,
  json,
  normalizeEmail,
} from "../_shared/ebooks-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Abhishek Panda <no-reply@abhishekpanda.com>";

type Payload = {
  name?: string;
  email?: string;
  mobile?: string;
  location?: string;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing Supabase server configuration" });
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as Payload;
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(String(payload.email || ""));
    const mobile = String(payload.mobile || "").trim();

    if (!name || !email || !mobile) return json(400, { error: "Name, email and mobile are required" });
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });
    if (!isValidMobile(mobile)) return json(400, { error: "Invalid mobile" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = Date.now();
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("scripture_upload_otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return json(429, { error: "OTP retry limit reached. Please wait 10 minutes." });
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();

    const { error: otpError } = await supabase.from("scripture_upload_otp_codes").insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      request_ip: getClientIp(req),
    });

    if (otpError) {
      console.error("scripture otp insert error", otpError);
      return json(500, { error: "Failed to create OTP" });
    }

    if (!RESEND_API_KEY) {
      return json(200, { success: true, message: "OTP generated. Email provider is not configured yet." });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#070a13;color:#f7f9ff;border-radius:12px;border:1px solid #233154;">
        <h2 style="margin:0 0 10px;">Scripture Upload Verification</h2>
        <p style="margin:0 0 14px;color:#b8c2da;">Use this OTP to verify your scripture upload request.</p>
        <div style="font-size:34px;font-weight:800;letter-spacing:7px;background:#10182c;border:1px solid #2b3f6e;border-radius:12px;padding:14px;text-align:center;">${otp}</div>
        <p style="font-size:12px;color:#9aa8c8;margin-top:12px;">Valid for 10 minutes.</p>
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
        subject: "Your OTP for scripture upload",
        html,
      }),
    });

    if (!emailRes.ok) {
      const details = await emailRes.text();
      console.error("scripture otp email error", details);
      return json(502, { error: "OTP was generated but email delivery failed." });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error("scripture-upload-send-otp error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
