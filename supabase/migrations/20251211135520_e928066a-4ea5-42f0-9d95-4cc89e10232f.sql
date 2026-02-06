-- Create IP access rules table for whitelist/blacklist management
CREATE TABLE public.ip_access_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('whitelist', 'blacklist')),
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, rule_type)
);

-- Create login location confirmations table
CREATE TABLE public.login_location_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  city TEXT,
  country TEXT,
  confirmation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'denied', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ip_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_location_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ip_access_rules
CREATE POLICY "Admins can manage IP rules"
ON public.ip_access_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for login_location_confirmations
CREATE POLICY "Admins can view all confirmations"
ON public.login_location_confirmations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert confirmations"
ON public.login_location_confirmations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own confirmations"
ON public.login_location_confirmations
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ip_access_rules_updated_at
BEFORE UPDATE ON public.ip_access_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();