-- Create admin_sessions table for server-side session tracking
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  device_name text NOT NULL,
  device_type text NOT NULL,
  browser text NOT NULL,
  ip_address text,
  location text,
  user_agent text,
  last_active_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active boolean NOT NULL DEFAULT true
);

-- Create index for faster lookups
CREATE INDEX idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_active ON public.admin_sessions(is_active, expires_at);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
ON public.admin_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.admin_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own sessions (for heartbeat)
CREATE POLICY "Users can update their own sessions"
ON public.admin_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON public.admin_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.admin_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for admin_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;

-- Create admin_settings table for storing user preferences (like inactivity timeout)
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  inactivity_timeout integer NOT NULL DEFAULT 60000,
  sound_enabled boolean NOT NULL DEFAULT true,
  haptic_enabled boolean NOT NULL DEFAULT true,
  volume numeric NOT NULL DEFAULT 0.7,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all settings"
ON public.admin_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own settings"
ON public.admin_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();