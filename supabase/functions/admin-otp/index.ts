import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// Check and update rate limit
const checkRateLimit = async (
  supabase: any,
  identifier: string,
  identifierType: 'user_id' | 'ip_address'
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: string }> => {
  const now = new Date();
  
  // Get existing rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('otp_rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching rate limit:', fetchError);
    // Allow on error to not block legitimate users
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (!existing) {
    // First attempt - create record
    await supabase.from('otp_rate_limits').insert({
      identifier,
      identifier_type: identifierType,
      attempt_count: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
    });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Check if currently locked out
  if (existing.locked_until) {
    const lockedUntil = new Date(existing.locked_until);
    if (now < lockedUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        lockedUntil: existing.locked_until 
      };
    }
    // Lockout expired - reset
    await supabase
      .from('otp_rate_limits')
      .update({
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
        locked_until: null,
      })
      .eq('id', existing.id);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Check if window has expired
  const firstAttempt = new Date(existing.first_attempt_at);
  const windowExpired = (now.getTime() - firstAttempt.getTime()) > RATE_LIMIT_WINDOW_MS;

  if (windowExpired) {
    // Reset window
    await supabase
      .from('otp_rate_limits')
      .update({
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
        locked_until: null,
      })
      .eq('id', existing.id);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Within window - check attempt count
  const newAttemptCount = existing.attempt_count + 1;
  
  if (newAttemptCount > MAX_ATTEMPTS) {
    // Lock out user
    const lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
    await supabase
      .from('otp_rate_limits')
      .update({
        attempt_count: newAttemptCount,
        last_attempt_at: now.toISOString(),
        locked_until: lockedUntil.toISOString(),
      })
      .eq('id', existing.id);
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      lockedUntil: lockedUntil.toISOString() 
    };
  }

  // Increment attempt count
  await supabase
    .from('otp_rate_limits')
    .update({
      attempt_count: newAttemptCount,
      last_attempt_at: now.toISOString(),
    })
    .eq('id', existing.id);

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - newAttemptCount };
};

// Reset rate limit on successful verification
const resetRateLimit = async (
  supabase: any,
  identifier: string,
  identifierType: 'user_id' | 'ip_address'
) => {
  await supabase
    .from('otp_rate_limits')
    .delete()
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId, email, otp } = await req.json();

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    console.log(`Admin OTP action: ${action} for user: ${userId}, IP: ${clientIP}`);

    if (action === "send") {
      // Check rate limit by user ID
      const userRateLimit = await checkRateLimit(supabase, userId, 'user_id');
      if (!userRateLimit.allowed) {
        console.log(`Rate limit exceeded for user ${userId}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Too many attempts. Please try again after ${new Date(userRateLimit.lockedUntil!).toLocaleTimeString()}.`,
            lockedUntil: userRateLimit.lockedUntil
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Also check by IP to prevent distributed attacks
      if (clientIP !== 'unknown') {
        const ipRateLimit = await checkRateLimit(supabase, clientIP, 'ip_address');
        if (!ipRateLimit.allowed) {
          console.log(`Rate limit exceeded for IP ${clientIP}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Too many attempts from this location. Please try again later.`,
              lockedUntil: ipRateLimit.lockedUntil
            }),
            { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Invalidate any existing OTP codes for this user
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("user_id", userId)
        .eq("used", false);

      // Store new OTP in database
      const { error: insertError } = await supabase
        .from("admin_otp_codes")
        .insert({
          user_id: userId,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error("Error storing OTP:", insertError);
        throw new Error("Failed to generate verification code");
      }

      // Send OTP via Resend API directly
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 420px; margin: 0 auto; background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #262626; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">🛡️</span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">Command Center</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">Admin Verification</p>
            </div>
            <div style="padding: 32px 24px;">
              <p style="margin: 0 0 24px; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                Your verification code for admin access is:
              </p>
              <div style="background: #1a1a1a; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #3b82f6; font-family: 'SF Mono', Monaco, monospace;">
                  ${otpCode}
                </span>
              </div>
              <p style="margin: 0 0 8px; color: #a3a3a3; font-size: 13px;">
                ⏱️ This code expires in <strong style="color: #ffffff;">10 minutes</strong>
              </p>
              <p style="margin: 0; color: #737373; font-size: 12px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            <div style="padding: 20px 24px; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0; color: #525252; font-size: 11px;">
                🔒 Secured with 2FA • abhishekpanda.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Command Center <security@abhishekpanda.com>",
          to: [email],
          subject: "🔐 Your Admin Verification Code",
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Resend API error:", errorText);
        throw new Error("Failed to send verification email");
      }

      console.log("Email sent successfully");

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          remainingAttempts: userRateLimit.remainingAttempts
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "verify") {
      // Check rate limit for verification attempts
      const userRateLimit = await checkRateLimit(supabase, userId, 'user_id');
      if (!userRateLimit.allowed) {
        console.log(`Rate limit exceeded for verification, user ${userId}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Too many failed attempts. Account locked until ${new Date(userRateLimit.lockedUntil!).toLocaleTimeString()}.`,
            lockedUntil: userRateLimit.lockedUntil
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find valid OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from("admin_otp_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("otp_code", otp)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        console.log("OTP verification failed:", fetchError);
        
        // Add artificial delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid or expired verification code",
            remainingAttempts: userRateLimit.remainingAttempts
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark OTP as used
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      // Update server-side MFA session state (4h window), so AdminLayout can enforce it.
      try {
        const sessionExpires = new Date(Date.now() + 4 * 60 * 60 * 1000);
        await supabase.from("admin_mfa_sessions").upsert(
          {
            user_id: userId,
            otp_verified_at: new Date().toISOString(),
            expires_at: sessionExpires.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (e) {
        console.error("Failed to update admin_mfa_sessions:", e);
      }

      // Reset rate limit on successful verification
      await resetRateLimit(supabase, userId, 'user_id');
      if (clientIP !== 'unknown') {
        await resetRateLimit(supabase, clientIP, 'ip_address');
      }

      console.log("OTP verified successfully for user:", userId);

      return new Response(
        JSON.stringify({ success: true, message: "Verification successful" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    throw new Error("Invalid action");

  } catch (error: any) {
    console.error("Error in admin-otp function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
