import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Abhishek Panda <hello@abhishekpanda.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://www.abhishekpanda.com";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing Supabase server configuration" });
  }

  if (!RESEND_API_KEY) {
    return json(500, { error: "Missing RESEND_API_KEY" });
  }

  try {
    const payload = await req.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const redirectTo =
      typeof payload?.redirectTo === "string" && payload.redirectTo.trim().length > 0
        ? payload.redirectTo.trim()
        : `${SITE_URL}/login`;

    if (!email || !isValidEmail(email)) {
      return json(400, { error: "A valid email is required" });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("generateLink error", linkError);
      return json(500, { error: "Failed to generate magic link" });
    }

    const actionLink = linkData.properties.action_link;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: "Your sign-in link for Abhishek Panda",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0b0b14;color:#f5f7ff;border-radius:16px;border:1px solid #23273a;">
            <h1 style="font-size:24px;line-height:1.2;margin:0 0 10px;">Sign in to Abhishek Panda</h1>
            <p style="margin:0 0 20px;color:#c5c8d7;">Use this secure magic link to continue.</p>
            <a href="${actionLink}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:linear-gradient(90deg,#4f46e5,#06b6d4);color:#fff;text-decoration:none;font-weight:700;">Sign In</a>
            <p style="margin:20px 0 0;color:#9aa0b4;font-size:13px;">If the button does not work, use this link:</p>
            <p style="word-break:break-all;color:#d8def8;font-size:12px;">${actionLink}</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const details = await emailRes.text();
      console.error("Resend send failed", details);
      return json(502, { error: "Failed to send email" });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error("send-magic-link error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
