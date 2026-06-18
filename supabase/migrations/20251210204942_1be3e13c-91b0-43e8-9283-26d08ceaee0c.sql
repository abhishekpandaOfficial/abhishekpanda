-- Create page_views table for analytics tracking
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_interactions table for tracking engagement
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_type TEXT NOT NULL, -- 'click', 'scroll', 'form_submit', 'download', etc.
  element_id TEXT,
  element_name TEXT,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for page_views - anyone can insert (for tracking), only admins can read
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all page views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for user_interactions - anyone can insert, only admins can read
CREATE POLICY "Anyone can insert interactions" ON public.user_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all interactions" ON public.user_interactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better query performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);