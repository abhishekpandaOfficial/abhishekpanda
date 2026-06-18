import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewDeviceAlertRequest {
  email: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  ipAddress?: string;
  location?: string;
  timestamp: string;
}

// HTML escape function to prevent XSS/injection attacks
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Rate limiting map (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 alerts per minute per IP

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
};

const sendSMS = async (message: string): Promise<boolean> => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
  const toPhone = Deno.env.get("ADMIN_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromPhone || !toPhone) {
    console.log("Twilio credentials not configured, skipping SMS");
    return false;
  }

  try {
    const credentials = btoa(`${accountSid}:${authToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toPhone,
          From: fromPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio SMS error:", errorText);
      return false;
    }

    console.log("SMS sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for new device alerts from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data: NewDeviceAlertRequest = await req.json();
    console.log("New device alert received:", JSON.stringify(data, null, 2));

    const {
      email,
      deviceName,
      deviceType,
      browser,
      ipAddress,
      location,
      timestamp,
    } = data;

    // Input validation
    if (!email || !deviceName || !browser) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all inputs for HTML rendering
    const safeEmail = escapeHtml(email.slice(0, 255));
    const safeDeviceName = escapeHtml(deviceName.slice(0, 100));
    const safeDeviceType = escapeHtml((deviceType || 'unknown').slice(0, 50));
    const safeBrowser = escapeHtml(browser.slice(0, 100));
    const safeIpAddress = escapeHtml((ipAddress || 'Unknown IP').slice(0, 45));
    const safeLocation = escapeHtml((location || 'Unknown location').slice(0, 200));

    const formattedTime = new Date(timestamp || Date.now()).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });

    // Email HTML content (all user inputs are now escaped)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 30px; border: 1px solid #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .icon { font-size: 48px; margin-bottom: 15px; }
          .title { font-size: 24px; font-weight: bold; color: #10b981; }
          .subtitle { color: #888; margin-top: 8px; }
          .device-card { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
          .device-name { font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 10px; }
          .details { background: #0d0d0d; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #888; }
          .value { color: #10b981; font-weight: 500; }
          .warning { background: #422006; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px; }
          .warning-text { color: #fbbf24; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .action-btn { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🔐</div>
            <div class="title">New Device Login Detected</div>
            <div class="subtitle">A new device just logged into your admin panel</div>
          </div>
          
          <div class="device-card">
            <div class="device-name">📱 ${safeDeviceName}</div>
            <p style="color: #888; margin: 0;">${safeBrowser} • ${safeDeviceType}</p>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Account:</span>
              <span class="value">${safeEmail}</span>
            </div>
            <div class="detail-row">
              <span class="label">Device:</span>
              <span class="value">${safeDeviceName} (${safeDeviceType})</span>
            </div>
            <div class="detail-row">
              <span class="label">Browser:</span>
              <span class="value">${safeBrowser}</span>
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span>
              <span class="value">${safeIpAddress}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${safeLocation}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formattedTime}</span>
            </div>
          </div>
          
          <div class="warning">
            <strong class="warning-text">⚠️ Wasn't you?</strong>
            <p class="warning-text" style="margin: 10px 0 0 0; font-size: 14px;">
              If you didn't log in from this device, your account may be compromised. 
              Log in to your Command Center immediately and terminate all other sessions.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated security alert from abhishekpanda.com Command Center</p>
            <p>You received this because a new device accessed your admin account.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Email
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "contact@abhishekpanda.com";
    const emailResult = await resend.emails.send({
      from: "Security Alert <security@abhishekpanda.com>",
      to: [adminEmail, email],
      subject: `🔐 New Device Login: ${safeDeviceName} (${safeBrowser})`,
      html: emailHtml,
    });

    console.log("Email sent:", emailResult);

    // Always send SMS for new device logins (critical security event)
    // Plain text SMS doesn't need HTML escaping, but we still use sanitized values
    const smsMessage = `🔐 NEW LOGIN ALERT!\n\nDevice: ${safeDeviceName}\nBrowser: ${safeBrowser}\nIP: ${safeIpAddress}\nLocation: ${safeLocation}\nTime: ${new Date(timestamp || Date.now()).toLocaleString()}\n\nIf this wasn't you, secure your account NOW!\n\n- abhishekpanda.com`;
    
    const smsSent = await sendSMS(smsMessage);
    console.log("SMS sent:", smsSent);

    return new Response(
      JSON.stringify({ success: true, message: "New device alert sent", emailSent: true, smsSent }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in new-device-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
