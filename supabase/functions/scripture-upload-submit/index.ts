import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  corsHeaders,
  getClientIp,
  isValidEmail,
  isValidMobile,
  json,
  normalizeEmail,
  sha256Hex,
  verifyOtpHash,
} from "../_shared/ebooks-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "hello@abhishekpanda.com";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Abhishek Panda <no-reply@abhishekpanda.com>";

type Payload = {
  name?: string;
  email?: string;
  mobile?: string;
  location?: string;
  otp?: string;
  fileName?: string;
  fileContent?: string;
};

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchFirst = (value: string, regex: RegExp) => value.match(regex)?.[1]?.trim() || "";

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
    const locationText = String(payload.location || "").trim();
    const otp = String(payload.otp || "").trim();
    const fileName = String(payload.fileName || "").trim();
    const fileContent = String(payload.fileContent || "");

    if (!name || !email || !mobile || !otp || !fileName || !fileContent) {
      return json(400, { error: "Missing required fields" });
    }
    if (!isValidEmail(email)) return json(400, { error: "Invalid email" });
    if (!isValidMobile(mobile)) return json(400, { error: "Invalid mobile" });
    if (!/\.html?$/i.test(fileName)) return json(400, { error: "Only .html files are allowed" });
    if (fileContent.length < 200) return json(400, { error: "File content looks too short" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: otpRow, error: otpError } = await supabase
      .from("scripture_upload_otp_codes")
      .select("id, code_hash, expires_at, attempts, used_at")
      .eq("email", email)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRow) return json(400, { error: "OTP not found. Request a new OTP." });
    if (new Date(otpRow.expires_at).getTime() < Date.now()) return json(400, { error: "OTP expired. Request a new OTP." });
    if (otpRow.attempts >= 5) return json(429, { error: "Too many attempts. Request a new OTP." });

    const valid = await verifyOtpHash(otp, otpRow.code_hash);
    if (!valid) {
      await supabase.from("scripture_upload_otp_codes").update({ attempts: otpRow.attempts + 1 }).eq("id", otpRow.id);
      return json(400, { error: "Invalid OTP" });
    }

    await supabase.from("scripture_upload_otp_codes").update({ used_at: new Date().toISOString() }).eq("id", otpRow.id);

    const normalizedForHash = fileContent.replace(/\s+/g, " ").trim().toLowerCase();
    const contentHash = await sha256Hex(normalizedForHash);

    const { data: existing } = await supabase
      .from("scripture_upload_submissions")
      .select("id")
      .eq("content_hash", contentHash)
      .maybeSingle();

    if (existing) {
      return json(409, { error: "This scripture appears to be already submitted." });
    }

    const title = matchFirst(fileContent, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description =
      matchFirst(fileContent, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      stripTags(matchFirst(fileContent, /<p[^>]*>([\s\S]*?)<\/p>/i));

    const headers = req.headers;
    const requestIp = getClientIp(req);
    const requestCity = headers.get("x-vercel-ip-city") || null;
    const requestRegion = headers.get("x-vercel-ip-country-region") || null;
    const requestCountry = headers.get("x-vercel-ip-country") || null;
    const userAgent = headers.get("user-agent") || null;

    const { error: insertError } = await supabase.from("scripture_upload_submissions").insert({
      uploader_name: name,
      email,
      mobile,
      location_text: locationText || null,
      request_ip: requestIp,
      request_city: requestCity,
      request_region: requestRegion,
      request_country: requestCountry,
      user_agent: userAgent,
      file_name: fileName,
      file_size_bytes: fileContent.length,
      file_content: fileContent,
      content_hash: contentHash,
      scripture_title: title || null,
      scripture_description: description || null,
      status: "pending",
      verified_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("scripture submission insert error", insertError);
      return json(500, { error: "Failed to save submission" });
    }

    if (RESEND_API_KEY) {
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:12px;">
          <h2>New Scripture Upload Request</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Mobile:</b> ${mobile}</p>
          <p><b>Location (user):</b> ${locationText || "N/A"}</p>
          <p><b>Auto Location:</b> ${requestCity || ""}, ${requestRegion || ""}, ${requestCountry || ""}</p>
          <p><b>IP:</b> ${requestIp}</p>
          <p><b>File:</b> ${fileName} (${fileContent.length} chars)</p>
          <p><b>Parsed Title:</b> ${title || "N/A"}</p>
          <p><b>Parsed Description:</b> ${description?.slice(0, 320) || "N/A"}</p>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [ADMIN_EMAIL],
          subject: `Scripture upload: ${title || fileName}`,
          html: adminHtml,
        }),
      }).catch((e) => console.error("scripture admin email error", e));
    }

    return json(200, { success: true, message: "Upload submitted successfully and sent for review." });
  } catch (error) {
    console.error("scripture-upload-submit error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
