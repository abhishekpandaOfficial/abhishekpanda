-- Create table for storing WebAuthn passkey credentials
CREATE TABLE public.passkey_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_name TEXT,
  device_type TEXT,
  transports TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own passkeys"
ON public.passkey_credentials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passkeys"
ON public.passkey_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passkeys"
ON public.passkey_credentials
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passkeys"
ON public.passkey_credentials
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all passkeys"
ON public.passkey_credentials
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_passkey_credentials_user_id ON public.passkey_credentials(user_id);
CREATE INDEX idx_passkey_credentials_credential_id ON public.passkey_credentials(credential_id);