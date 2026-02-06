-- ============================================
-- COMPLETE ABHISHEKPANDA.COM MIGRATION SCRIPT
-- CIA-Level Security Admin Command Center
-- Version: 1.0.0
-- Date: December 2024
-- ============================================

-- ============================================
-- PART 1: ENUMS
-- ============================================

-- Create app_role enum for role-based access control
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PART 2: CORE AUTHENTICATION TABLES
-- ============================================

-- Profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user'::app_role,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Admin OTP codes for 2FA
CREATE TABLE IF NOT EXISTS public.admin_otp_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Passkey credentials for WebAuthn (FaceID/TouchID)
CREATE TABLE IF NOT EXISTS public.passkey_credentials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    device_name TEXT,
    device_type TEXT,
    transports TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Login audit logs for security tracking
CREATE TABLE IF NOT EXISTS public.login_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'attempt',
    failure_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT,
    device_type TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Login location confirmations for geo-blocking
CREATE TABLE IF NOT EXISTS public.login_location_confirmations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    city TEXT,
    country TEXT,
    confirmation_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IP access rules (whitelist/blacklist)
CREATE TABLE IF NOT EXISTS public.ip_access_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    reason TEXT,
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 3: ADMIN DASHBOARD TABLES
-- ============================================

-- Notification settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email_contact_requests BOOLEAN DEFAULT true,
    email_cv_downloads BOOLEAN DEFAULT true,
    email_course_enrollments BOOLEAN DEFAULT true,
    email_payments BOOLEAN DEFAULT true,
    email_templates JSONB DEFAULT '{}'::jsonb,
    sound_enabled BOOLEAN DEFAULT true,
    sound_volume NUMERIC DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dashboard widgets (customizable layout)
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    widget_type TEXT NOT NULL,
    widget_config JSONB DEFAULT '{}'::jsonb,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 4: CONTENT MANAGEMENT TABLES
-- ============================================

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    hero_image TEXT,
    author_id UUID,
    tags TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    thumbnail TEXT,
    duration TEXT,
    level TEXT,
    price_amount INTEGER DEFAULT 0,
    price_currency TEXT DEFAULT 'INR',
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    requirements TEXT[],
    outcomes TEXT[],
    tags TEXT[],
    modules JSONB,
    students_count INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    amount_paid INTEGER,
    progress JSONB DEFAULT '{}'::jsonb,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Products (digital marketplace)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    thumbnail TEXT,
    file_url TEXT,
    price_amount INTEGER DEFAULT 0,
    price_currency TEXT DEFAULT 'INR',
    is_published BOOLEAN DEFAULT false,
    tags TEXT[],
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 5: PAYMENT TABLES
-- ============================================

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    product_id UUID NOT NULL,
    product_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    billing_details JSONB,
    status TEXT DEFAULT 'generated',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 6: ANALYTICS TABLES
-- ============================================

-- Page views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT,
    device_type TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User interactions
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    page_path TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    element_id TEXT,
    element_name TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    intent TEXT NOT NULL,
    reason TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CV downloads
CREATE TABLE IF NOT EXISTS public.cv_downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_name TEXT NOT NULL,
    visitor_email TEXT,
    company_name TEXT,
    job_title TEXT,
    download_reason TEXT NOT NULL,
    custom_objectives TEXT,
    ip_address TEXT,
    user_agent TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 7: LLM ATLAS TABLES
-- ============================================

-- LLM models
CREATE TABLE IF NOT EXISTS public.llm_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    company TEXT NOT NULL,
    description TEXT,
    color TEXT,
    logo TEXT,
    parameters TEXT,
    context_window TEXT,
    pricing TEXT,
    speed TEXT,
    architecture TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    use_cases TEXT[],
    api_docs_url TEXT,
    is_open_source BOOLEAN DEFAULT false,
    is_multimodal BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    release_date TEXT,
    benchmarks JSONB,
    versions JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 8: PERSONAL OS TABLES
-- ============================================

-- Family members (LifeMap)
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    parent_id TEXT,
    spouse_id TEXT,
    date_of_birth DATE,
    occupation TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    photo_url TEXT,
    notes TEXT,
    generation INTEGER NOT NULL DEFAULT 1,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 9: SCHEDULER TABLES
-- ============================================

-- Scheduled jobs (Chronos)
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    schedule TEXT NOT NULL,
    schedule_description TEXT,
    job_type TEXT NOT NULL DEFAULT 'edge_function',
    edge_function_name TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    cron_job_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job executions
CREATE TABLE IF NOT EXISTS public.job_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'running',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    output TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 10: EMAIL TEMPLATES TABLE
-- ============================================

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    body_html TEXT,
    variables TEXT[] DEFAULT '{}'::text[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 11: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_location_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 12: DATABASE FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user signup (creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================
-- PART 13: DATABASE TRIGGERS
-- ============================================

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers for all relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON public.dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON public.scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ip_access_rules_updated_at ON public.ip_access_rules;
CREATE TRIGGER update_ip_access_rules_updated_at
  BEFORE UPDATE ON public.ip_access_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_llm_models_updated_at ON public.llm_models;
CREATE TRIGGER update_llm_models_updated_at
  BEFORE UPDATE ON public.llm_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_members_updated_at ON public.family_members;
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 14: ROW LEVEL SECURITY POLICIES
-- ============================================

-- ================== PROFILES ==================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== USER ROLES ==================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== ADMIN OTP CODES ==================
DROP POLICY IF EXISTS "Users can view their own OTP codes" ON public.admin_otp_codes;
CREATE POLICY "Users can view their own OTP codes"
ON public.admin_otp_codes FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.admin_otp_codes;
CREATE POLICY "Service role can manage OTP codes"
ON public.admin_otp_codes FOR ALL
USING (true)
WITH CHECK (true);

-- ================== PASSKEY CREDENTIALS ==================
DROP POLICY IF EXISTS "Users can view their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can view their own passkeys"
ON public.passkey_credentials FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can insert their own passkeys"
ON public.passkey_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can update their own passkeys"
ON public.passkey_credentials FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can delete their own passkeys"
ON public.passkey_credentials FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all passkeys" ON public.passkey_credentials;
CREATE POLICY "Admins can manage all passkeys"
ON public.passkey_credentials FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== LOGIN AUDIT LOGS ==================
DROP POLICY IF EXISTS "Anyone can insert login logs" ON public.login_audit_logs;
CREATE POLICY "Anyone can insert login logs"
ON public.login_audit_logs FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view login logs" ON public.login_audit_logs;
CREATE POLICY "Admins can view login logs"
ON public.login_audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== LOGIN LOCATION CONFIRMATIONS ==================
DROP POLICY IF EXISTS "Anyone can insert confirmations" ON public.login_location_confirmations;
CREATE POLICY "Anyone can insert confirmations"
ON public.login_location_confirmations FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update their own confirmations" ON public.login_location_confirmations;
CREATE POLICY "Anyone can update their own confirmations"
ON public.login_location_confirmations FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Admins can view all confirmations" ON public.login_location_confirmations;
CREATE POLICY "Admins can view all confirmations"
ON public.login_location_confirmations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== IP ACCESS RULES ==================
DROP POLICY IF EXISTS "Admins can manage IP rules" ON public.ip_access_rules;
CREATE POLICY "Admins can manage IP rules"
ON public.ip_access_rules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== NOTIFICATION SETTINGS ==================
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.notification_settings;
CREATE POLICY "Users can manage their own settings"
ON public.notification_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all settings" ON public.notification_settings;
CREATE POLICY "Admins can manage all settings"
ON public.notification_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== DASHBOARD WIDGETS ==================
DROP POLICY IF EXISTS "Users can manage their own widgets" ON public.dashboard_widgets;
CREATE POLICY "Users can manage their own widgets"
ON public.dashboard_widgets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all widgets" ON public.dashboard_widgets;
CREATE POLICY "Admins can manage all widgets"
ON public.dashboard_widgets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== BLOG POSTS ==================
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== COURSES ==================
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses"
ON public.courses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== ENROLLMENTS ==================
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
CREATE POLICY "Users can view their enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins can manage all enrollments"
ON public.enrollments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== PRODUCTS ==================
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products"
ON public.products FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== PAYMENTS ==================
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;
CREATE POLICY "Users can view their payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== INVOICES ==================
DROP POLICY IF EXISTS "Users can view their invoices" ON public.invoices;
CREATE POLICY "Users can view their invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== PAGE VIEWS ==================
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
CREATE POLICY "Admins can view all page views"
ON public.page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== USER INTERACTIONS ==================
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.user_interactions;
CREATE POLICY "Anyone can insert interactions"
ON public.user_interactions FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all interactions" ON public.user_interactions;
CREATE POLICY "Admins can view all interactions"
ON public.user_interactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== CONTACT REQUESTS ==================
DROP POLICY IF EXISTS "Anyone can submit contact request" ON public.contact_requests;
CREATE POLICY "Anyone can submit contact request"
ON public.contact_requests FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact requests" ON public.contact_requests;
CREATE POLICY "Admins can view contact requests"
ON public.contact_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== CV DOWNLOADS ==================
DROP POLICY IF EXISTS "Anyone can submit download request" ON public.cv_downloads;
CREATE POLICY "Anyone can submit download request"
ON public.cv_downloads FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all downloads" ON public.cv_downloads;
CREATE POLICY "Admin can view all downloads"
ON public.cv_downloads FOR SELECT
USING (true);

-- ================== LLM MODELS ==================
DROP POLICY IF EXISTS "Anyone can view models" ON public.llm_models;
CREATE POLICY "Anyone can view models"
ON public.llm_models FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage models" ON public.llm_models;
CREATE POLICY "Admins can manage models"
ON public.llm_models FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== FAMILY MEMBERS ==================
DROP POLICY IF EXISTS "Users can manage their own family members" ON public.family_members;
CREATE POLICY "Users can manage their own family members"
ON public.family_members FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all family members" ON public.family_members;
CREATE POLICY "Admins can manage all family members"
ON public.family_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== SCHEDULED JOBS ==================
DROP POLICY IF EXISTS "Admins can view scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can view scheduled jobs"
ON public.scheduled_jobs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can create scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can create scheduled jobs"
ON public.scheduled_jobs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can update scheduled jobs"
ON public.scheduled_jobs FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can delete scheduled jobs"
ON public.scheduled_jobs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================== JOB EXECUTIONS ==================
DROP POLICY IF EXISTS "Admins can view job executions" ON public.job_executions;
CREATE POLICY "Admins can view job executions"
ON public.job_executions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can create job executions" ON public.job_executions;
CREATE POLICY "Admins can create job executions"
ON public.job_executions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ================== EMAIL TEMPLATES ==================
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PART 15: STORAGE BUCKETS
-- ============================================

-- Create products bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create family-photos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products
DROP POLICY IF EXISTS "Anyone can view product files" ON storage.objects;
CREATE POLICY "Anyone can view product files"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can upload product files" ON storage.objects;
CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can update product files" ON storage.objects;
CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete product files" ON storage.objects;
CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Storage policies for family photos
DROP POLICY IF EXISTS "Anyone can view family photos" ON storage.objects;
CREATE POLICY "Anyone can view family photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-photos');

DROP POLICY IF EXISTS "Admins can upload family photos" ON storage.objects;
CREATE POLICY "Admins can upload family photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can update family photos" ON storage.objects;
CREATE POLICY "Admins can update family photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete family photos" ON storage.objects;
CREATE POLICY "Admins can delete family photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- PART 16: REALTIME CONFIGURATION
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cv_downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- ============================================
-- PART 17: GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Run this script on your self-hosted Supabase or Neon PostgreSQL
-- After running, configure edge functions and secrets separately
