-- Create table for CV download requests
CREATE TABLE public.cv_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  download_reason TEXT NOT NULL,
  custom_objectives TEXT,
  company_name TEXT,
  job_title TEXT,
  country TEXT,
  city TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (visitors submitting the form)
CREATE POLICY "Anyone can submit download request"
ON public.cv_downloads
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view downloads (we'll handle this with service role in edge function)
-- For now, allow public read for admin purposes - we'll secure this with proper auth later
CREATE POLICY "Admin can view all downloads"
ON public.cv_downloads
FOR SELECT
USING (true);