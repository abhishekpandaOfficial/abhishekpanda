-- Create login audit logs table for IP tracking and login attempts
CREATE TABLE public.login_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'attempt', -- attempt, success, failed, blocked
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view login logs" 
ON public.login_audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert logs (for tracking failed attempts)
CREATE POLICY "Anyone can insert login logs" 
ON public.login_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_login_audit_created_at ON public.login_audit_logs(created_at DESC);
CREATE INDEX idx_login_audit_email ON public.login_audit_logs(email);
CREATE INDEX idx_login_audit_ip ON public.login_audit_logs(ip_address);