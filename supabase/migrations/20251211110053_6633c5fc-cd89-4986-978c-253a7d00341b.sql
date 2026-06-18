-- Create table for storing OTP codes for 2FA
CREATE TABLE public.admin_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view their own OTP codes
CREATE POLICY "Users can view their own OTP codes"
ON public.admin_otp_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to insert/update OTP codes (via edge function)
CREATE POLICY "Service role can manage OTP codes"
ON public.admin_otp_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_admin_otp_user_expires ON public.admin_otp_codes(user_id, expires_at) WHERE used = FALSE;