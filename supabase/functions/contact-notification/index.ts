import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "hello@abhishekpanda.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  reason: string;
  intent: string;
}

// HTML escape function to prevent XSS/injection attacks
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Rate limiting map (in-memory, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, reason, intent }: ContactNotificationRequest = await req.json();

    // Input validation
    if (!name || !email || !reason || !intent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all inputs
    const safeName = escapeHtml(name.slice(0, 100));
    const safeEmail = escapeHtml(email.slice(0, 255));
    const safeReason = escapeHtml(reason.slice(0, 200));
    const safeIntent = escapeHtml(intent.slice(0, 1000));

    console.log("Received contact notification request:", { name: safeName, email: safeEmail, reason: safeReason });

    // Send notification email to admin using Resend API directly
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Abhishek Panda Website <no-reply@abhishekpanda.com>",
        to: [ADMIN_EMAIL],
        subject: `New Contact Request: ${safeReason}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Request</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Someone wants to connect with you!</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Name:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Email:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <a href="mailto:${safeEmail}" style="color: #3B82F6;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Reason:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                    ${safeReason}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <strong style="color: #64748b;">Message:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #1e293b;">
                    ${safeIntent}
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(reason)}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Reply to ${safeName}
                </a>
              </div>
            </div>
            
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
              Sent from abhishekpanda.com contact form
            </p>
          </div>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin email sent:", adminResult);

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Abhishek Panda <no-reply@abhishekpanda.com>",
        to: [email],
        subject: "Thanks for reaching out!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Hey ${safeName}! 👋</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
                Thank you for reaching out! I've received your message about <strong>${safeReason}</strong> and I'll get back to you as soon as possible.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                In the meantime, feel free to explore my work:
              </p>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://abhishekpanda.com/blog" style="display: inline-block; margin: 5px; color: #3B82F6; text-decoration: none;">Blog</a> •
                <a href="https://abhishekpanda.com/courses" style="display: inline-block; margin: 5px; color: #3B82F6; text-decoration: none;">Courses</a> •
                <a href="https://linkedin.com/in/abhishekpandaofficial" style="display: inline-block; margin: 5px; color: #3B82F6; text-decoration: none;">LinkedIn</a>
              </div>
              
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                Best regards,<br/>
                <strong>Abhishek Panda</strong><br/>
                <span style="color: #64748b; font-size: 14px;">.NET Architect | AI/ML Engineer | Cloud-Native Specialist</span>
              </p>
            </div>
            
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} Abhishek Panda. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    const userResult = await userEmailResponse.json();
    console.log("User confirmation email sent:", userResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminResult, 
        userEmail: userResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in contact-notification function:", error);
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
