import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
const adminPhoneNumber = Deno.env.get("ADMIN_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LocationConfirmationRequest {
  action: 'send' | 'verify' | 'check_ip';
  email?: string;
  userId?: string;
  ipAddress?: string;
  city?: string;
  country?: string;
  token?: string;
  response?: 'confirm' | 'deny';
}

// Generate a secure random token
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Send SMS via Twilio
const sendSMS = async (to: string, message: string) => {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log("Twilio credentials not configured, skipping SMS");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          To: to,
          From: twilioPhoneNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio SMS error:", error);
      return false;
    }

    console.log("SMS sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LocationConfirmationRequest = await req.json();
    const { action, email, userId, ipAddress, city, country, token, response } = body;

    console.log(`Location confirmation action: ${action}`, { email, ipAddress, city, country });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'check_ip') {
      // Check if IP is whitelisted or blacklisted
      const { data: rules } = await supabase
        .from('ip_access_rules')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('is_active', true);

      if (rules && rules.length > 0) {
        const blacklisted = rules.find(r => r.rule_type === 'blacklist');
        const whitelisted = rules.find(r => r.rule_type === 'whitelist');

        if (blacklisted) {
          // Check expiry
          if (blacklisted.expires_at && new Date(blacklisted.expires_at) < new Date()) {
            // Rule expired, deactivate it
            await supabase
              .from('ip_access_rules')
              .update({ is_active: false })
              .eq('id', blacklisted.id);
          } else {
            return new Response(
              JSON.stringify({ 
                allowed: false, 
                reason: 'IP address is blacklisted',
                rule: blacklisted 
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        if (whitelisted) {
          if (whitelisted.expires_at && new Date(whitelisted.expires_at) < new Date()) {
            await supabase
              .from('ip_access_rules')
              .update({ is_active: false })
              .eq('id', whitelisted.id);
          } else {
            return new Response(
              JSON.stringify({ 
                allowed: true, 
                whitelisted: true,
                reason: 'IP address is whitelisted' 
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ allowed: true, whitelisted: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'send') {
      if (!email || !ipAddress) {
        throw new Error("Email and IP address required");
      }

      // Generate confirmation token
      const confirmationToken = generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store confirmation request
      const { error: insertError } = await supabase
        .from('login_location_confirmations')
        .insert({
          user_id: userId || crypto.randomUUID(),
          email,
          ip_address: ipAddress,
          city: city || null,
          country: country || null,
          confirmation_token: confirmationToken,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error("Failed to store confirmation:", insertError);
        throw new Error("Failed to create confirmation request");
      }

      // Send email notification
      const locationStr = city && country ? `${city}, ${country}` : 'Unknown location';
      
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ New Login Location Detected</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e0e0e0;">
            <p style="margin: 0 0 20px;">A login attempt was detected from a new location:</p>
            <div style="background: #252542; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${locationStr}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="margin-bottom: 20px;">If this was you, click the button below to confirm. If not, deny immediately and change your password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl}/functions/v1/location-confirmation?action=confirm&token=${confirmationToken}" 
                 style="background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px;">
                ✓ Yes, this was me
              </a>
              <a href="${supabaseUrl}/functions/v1/location-confirmation?action=deny&token=${confirmationToken}" 
                 style="background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                ✗ This wasn't me
              </a>
            </div>
            <p style="font-size: 12px; color: #888; text-align: center;">This confirmation link expires in 15 minutes.</p>
          </div>
        </div>
      `;

      const { error: emailError } = await resend.emails.send({
        from: "Security Alert <security@abhishekpanda.com>",
        to: [email],
        subject: `⚠️ New Login Location: ${locationStr}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Email send error:", emailError);
      } else {
        console.log("Confirmation email sent to:", email);
      }

      // Send SMS to admin
      if (adminPhoneNumber) {
        const smsMessage = `🚨 New login location detected!\n\nEmail: ${email}\nIP: ${ipAddress}\nLocation: ${locationStr}\n\nCheck admin panel for details.`;
        await sendSMS(adminPhoneNumber, smsMessage);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Confirmation request sent",
          token: confirmationToken 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'verify') {
      if (!token) {
        throw new Error("Token required for verification");
      }

      // Find the confirmation request
      const { data: confirmation, error: findError } = await supabase
        .from('login_location_confirmations')
        .select('*')
        .eq('confirmation_token', token)
        .single();

      if (findError || !confirmation) {
        return new Response(
          JSON.stringify({ success: false, status: 'not_found' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if expired
      if (new Date(confirmation.expires_at) < new Date()) {
        await supabase
          .from('login_location_confirmations')
          .update({ status: 'expired' })
          .eq('id', confirmation.id);

        return new Response(
          JSON.stringify({ success: false, status: 'expired' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: confirmation.status,
          confirmation 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: any) {
    console.error("Location confirmation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Handle GET requests for email confirmation links
serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle GET requests from email links
  if (req.method === 'GET' && url.searchParams.has('action')) {
    const action = url.searchParams.get('action');
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response("Invalid request", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find and update confirmation
    const { data: confirmation } = await supabase
      .from('login_location_confirmations')
      .select('*')
      .eq('confirmation_token', token)
      .single();

    if (!confirmation) {
      return new Response(createHtmlResponse("Invalid or expired link", "error"), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (new Date(confirmation.expires_at) < new Date()) {
      await supabase
        .from('login_location_confirmations')
        .update({ status: 'expired' })
        .eq('id', confirmation.id);

      return new Response(createHtmlResponse("This link has expired", "expired"), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    const newStatus = action === 'confirm' ? 'confirmed' : 'denied';
    
    await supabase
      .from('login_location_confirmations')
      .update({ 
        status: newStatus,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', confirmation.id);

    // If denied, optionally blacklist the IP
    if (action === 'deny') {
      await supabase
        .from('ip_access_rules')
        .upsert({
          ip_address: confirmation.ip_address,
          rule_type: 'blacklist',
          reason: `Auto-blocked: User denied login from ${confirmation.city || 'Unknown'}, ${confirmation.country || 'Unknown'}`,
          is_active: true,
        }, { onConflict: 'ip_address,rule_type' });
    }

    const message = action === 'confirm' 
      ? "Login confirmed! You can close this window."
      : "Login denied. The IP has been blocked and you should change your password.";

    return new Response(createHtmlResponse(message, action as string), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  return handler(req);
});

function createHtmlResponse(message: string, status: string): string {
  const color = status === 'confirm' ? '#10b981' : status === 'deny' ? '#ef4444' : '#f59e0b';
  const icon = status === 'confirm' ? '✓' : status === 'deny' ? '✗' : '⚠';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0f;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            padding: 40px;
            max-width: 400px;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .message {
            font-size: 18px;
            line-height: 1.6;
          }
          .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            background: ${color}20;
            color: ${color};
            font-weight: bold;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${icon}</div>
          <p class="message">${message}</p>
          <div class="status">${status.toUpperCase()}</div>
        </div>
      </body>
    </html>
  `;
}
