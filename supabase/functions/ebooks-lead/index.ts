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

type LeadRequest = {
  name?: string;
  email?: string;
  mobile?: string;
  ebookSlug?: string;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing Supabase server configuration" });
  }

  try {
    const payload = (await req.json().catch(() => ({}))) as LeadRequest;
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(String(payload.email || ""));
    const mobile = String(payload.mobile || "").trim();
    const ebookSlug = String(payload.ebookSlug || "").trim();
    const clientIp = getClientIp(req);

    if (!name || !email || !mobile || !ebookSlug) {
      return json(400, { error: "Missing required fields" });
    }
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });
    if (!isValidMobile(mobile)) return json(400, { error: "Invalid mobile" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const nowIso = new Date().toISOString();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: ebook, error: ebookErr } = await supabase
      .from("ebooks")
      .select("slug,is_free,is_coming_soon")
      .eq("slug", ebookSlug)
      .maybeSingle();
    if (ebookErr || !ebook) return json(404, { error: "Ebook not found" });
    if (!ebook.is_free || ebook.is_coming_soon) {
      return json(403, { error: "OTP download is available for free published ebooks only" });
    }

    const [{ count: emailCount }, { count: otpCount }, { count: ipCount }] = await Promise.all([
      supabase
        .from("ebook_lead_captures")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", fifteenMinutesAgo),
      supabase
        .from("ebook_otp_codes")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .eq("ebook_slug", ebookSlug)
        .gte("created_at", tenMinutesAgo),
      supabase
        .from("ebook_lead_captures")
        .select("*", { count: "exact", head: true })
        .eq("request_ip", clientIp)
        .gte("created_at", fifteenMinutesAgo),
    ]);

    if ((emailCount ?? 0) >= 6) return json(429, { error: "Too many attempts. Please try later." });
    if ((otpCount ?? 0) >= 3) return json(429, { error: "OTP retry limit reached. Please wait 10 minutes." });
    if (clientIp !== "unknown" && (ipCount ?? 0) >= 20) {
      return json(429, { error: "Too many requests from this location." });
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: leadInsertError } = await supabase.from("ebook_lead_captures").insert({
      name,
      email,
      mobile,
      ebook_slug: ebookSlug,
      request_ip: clientIp,
      created_at: nowIso,
    });
    if (leadInsertError) {
      console.error("lead insert error", leadInsertError);
      return json(500, { error: "Failed to save lead" });
    }

    const { error: otpInsertError } = await supabase.from("ebook_otp_codes").insert({
      email,
      ebook_slug: ebookSlug,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      request_ip: clientIp,
      created_at: nowIso,
    });
    if (otpInsertError) {
      console.error("otp insert error", otpInsertError);
      return json(500, { error: "Failed to create OTP" });
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing; OTP email skipped.");
      return json(200, { success: true, message: "OTP generated. Email provider is not configured yet." });
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#06070f;color:#f5f7ff;border-radius:16px;border:1px solid #1e2438;">
        <h1 style="font-size:22px;margin:0 0 8px;">Your Ebook Download OTP</h1>
        <p style="margin:0 0 14px;color:#b6bfd6;">Use this OTP to unlock your free ebook download.</p>
        <div style="font-size:34px;font-weight:800;letter-spacing:7px;background:#0f1323;border:1px solid #2a3352;border-radius:12px;padding:16px;text-align:center;">${otp}</div>
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
        subject: "Your OTP for free ebook download",
        html,
      }),
    });

    if (!emailRes.ok) {
      const details = await emailRes.text();
      console.error("resend error", details);
      return json(502, { error: "OTP was generated but email delivery failed." });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error("ebooks-lead error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
