-- Fix 1: Drop permissive OTP rate limits policy and create restrictive one
DROP POLICY IF EXISTS "Service role manages rate limits" ON public.otp_rate_limits;

CREATE POLICY "No public access to rate limits"
ON public.otp_rate_limits FOR ALL
USING (false);

-- Fix 2: Drop the permissive family-photos upload policy
DROP POLICY IF EXISTS "Users can upload family photos" ON storage.objects;

-- Ensure only the admin policy remains for family-photos INSERT
DROP POLICY IF EXISTS "Admins can upload family photos" ON storage.objects;

CREATE POLICY "Admins can upload family photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);