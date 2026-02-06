-- Fix admin_otp_codes RLS policy by dropping the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON admin_otp_codes;

-- Create a proper restrictive policy - only authenticated users can see their own codes
-- (service role in edge functions bypasses RLS automatically)
CREATE POLICY "Users can only view their own unexpired OTP codes"
ON admin_otp_codes FOR SELECT
USING (auth.uid() = user_id AND used = false AND expires_at > now());

-- Create table for OTP rate limiting
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- user_id or IP address
  identifier_type text NOT NULL CHECK (identifier_type IN ('user_id', 'ip_address')),
  attempt_count integer NOT NULL DEFAULT 1,
  first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (identifier, identifier_type)
);

-- Enable RLS on rate limits table
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits (edge functions)
CREATE POLICY "Service role manages rate limits"
ON public.otp_rate_limits FOR ALL
USING (true)
WITH CHECK (true);

-- Make family-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'family-photos';