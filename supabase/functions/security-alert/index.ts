import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  alertType: 'failed_biometric' | 'suspicious_login' | 'multiple_failures';
  email: string;
  attemptCount: number;
  failedStage: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
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
const RATE_LIMIT_MAX = 10; // 10 alerts per minute per IP

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
      console.log(`Rate limit exceeded for security alerts from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data: SecurityAlertRequest = await req.json();
    console.log("Security alert received:", JSON.stringify(data, null, 2));

    const {
      alertType,
      email,
      attemptCount,
      failedStage,
      ipAddress,
      userAgent,
      location,
      timestamp,
      deviceInfo,
    } = data;

    // Input validation
    if (!email || !failedStage || !ipAddress) {
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
    const safeFailedStage = escapeHtml(failedStage.slice(0, 100));
    const safeIpAddress = escapeHtml(ipAddress.slice(0, 45));
    const safeUserAgent = escapeHtml((userAgent || '').slice(0, 500));

    const locationStr = location 
      ? `${escapeHtml(location.city || 'Unknown')}, ${escapeHtml(location.country || 'Unknown')}` 
      : 'Unknown location';

    const deviceStr = deviceInfo
      ? `${escapeHtml(deviceInfo.browser || 'Unknown')} on ${escapeHtml(deviceInfo.os || 'Unknown')} (${escapeHtml(deviceInfo.device || 'Unknown device')})`
      : escapeHtml(safeUserAgent);

    // Determine alert severity
    const severity = attemptCount >= 3 ? '🚨 CRITICAL' : '⚠️ WARNING';
    const alertTitle = alertType === 'multiple_failures' 
      ? 'Multiple Failed Login Attempts Detected'
      : alertType === 'suspicious_login'
      ? 'Suspicious Login Activity'
      : 'Biometric Verification Failed';

    // Email HTML content (all user inputs are now escaped)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 30px; border: 1px solid #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .severity { font-size: 24px; font-weight: bold; color: ${attemptCount >= 3 ? '#ef4444' : '#f59e0b'}; }
          .title { font-size: 20px; margin-top: 10px; color: #fff; }
          .details { background: #0d0d0d; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #888; }
          .value { color: #10b981; font-weight: 500; }
          .warning { background: #7f1d1d; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="severity">${severity}</div>
            <div class="title">${escapeHtml(alertTitle)}</div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Email Attempted:</span>
              <span class="value">${safeEmail}</span>
            </div>
            <div class="detail-row">
              <span class="label">Failed Stage:</span>
              <span class="value">${safeFailedStage}</span>
            </div>
            <div class="detail-row">
              <span class="label">Attempt Count:</span>
              <span class="value">${Number(attemptCount) || 0}</span>
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span>
              <span class="value">${safeIpAddress}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${locationStr}</span>
            </div>
            <div class="detail-row">
              <span class="label">Device:</span>
              <span class="value">${deviceStr}</span>
            </div>
            <div class="detail-row">
              <span class="label">Timestamp:</span>
              <span class="value">${new Date(timestamp || Date.now()).toLocaleString()}</span>
            </div>
          </div>
          
          ${attemptCount >= 3 ? `
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This account has had ${Number(attemptCount)} failed authentication attempts. 
            Consider reviewing recent activity and potentially taking protective action.
          </div>
          ` : ''}
          
          <div class="footer">
            <p>This is an automated security alert from abhishekpanda.com Command Center</p>
            <p>If this was you, please ensure your biometric device is working properly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Email
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "contact@abhishekpanda.com";
    const emailResult = await resend.emails.send({
      from: "Security Alert <security@abhishekpanda.com>",
      to: [adminEmail],
      subject: `${severity} ${alertTitle} - ${safeEmail}`,
      html: emailHtml,
    });

    console.log("Email sent:", emailResult);

    // Send SMS for critical alerts (2+ failures)
    if (attemptCount >= 2) {
      // Plain text SMS doesn't need HTML escaping, but we still sanitize
      const smsMessage = `${severity} Security Alert!\n\nFailed ${safeFailedStage} attempt #${attemptCount}\nEmail: ${safeEmail}\nIP: ${safeIpAddress}\nLocation: ${locationStr}\nTime: ${new Date(timestamp || Date.now()).toLocaleString()}\n\n- abhishekpanda.com`;
      
      await sendSMS(smsMessage);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Security alert sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in security-alert function:", error);
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
