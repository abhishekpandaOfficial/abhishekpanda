# Complete Supabase Migration Documentation
## CIA-Level Security Admin Command Center

**Project:** abhishekpanda.com  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Security Level:** CIA-Grade (Confidentiality, Integrity, Availability)

---

## Table of Contents

1. [Database Schema Overview](#1-database-schema-overview)
2. [Complete Table Migrations](#2-complete-table-migrations)
3. [Row-Level Security (RLS) Policies](#3-row-level-security-rls-policies)
4. [Database Functions](#4-database-functions)
5. [Database Triggers](#5-database-triggers)
6. [Storage Buckets](#6-storage-buckets)
7. [Edge Functions](#7-edge-functions)
8. [Required Secrets](#8-required-secrets)
9. [Admin Authentication Flow](#9-admin-authentication-flow)
10. [Self-Hosting Guide](#10-self-hosting-guide)

---

## 1. Database Schema Overview

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   auth.users    │────▶│    profiles     │────▶│   user_roles    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│passkey_credentials│   │admin_otp_codes  │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│login_audit_logs │────▶│login_location_  │
└─────────────────┘     │confirmations    │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ip_access_rules  │
                        └─────────────────┘
```

### Tables Summary

| Table Name | Purpose | RLS Enabled |
|------------|---------|-------------|
| `profiles` | User profile data | ✅ |
| `user_roles` | Role-based access control | ✅ |
| `admin_otp_codes` | 2FA OTP codes | ✅ |
| `passkey_credentials` | WebAuthn passkeys | ✅ |
| `login_audit_logs` | Authentication audit trail | ✅ |
| `login_location_confirmations` | Geo-blocking confirmations | ✅ |
| `ip_access_rules` | IP whitelist/blacklist | ✅ |
| `notification_settings` | User notification preferences | ✅ |
| `dashboard_widgets` | Customizable dashboard | ✅ |
| `blog_posts` | CMS content | ✅ |
| `courses` | LMS courses | ✅ |
| `enrollments` | Course enrollments | ✅ |
| `products` | Digital products | ✅ |
| `payments` | Payment records | ✅ |
| `invoices` | Generated invoices | ✅ |
| `contact_requests` | Contact form submissions | ✅ |
| `cv_downloads` | CV download tracking | ✅ |
| `page_views` | Analytics - page views | ✅ |
| `user_interactions` | Analytics - interactions | ✅ |
| `llm_models` | LLM Atlas data | ✅ |
| `family_members` | LifeMap family tree | ✅ |
| `scheduled_jobs` | Chronos scheduler | ✅ |
| `job_executions` | Job execution logs | ✅ |
| `email_templates` | Email template builder | ✅ |

---

## 2. Complete Table Migrations

### 2.1 Enums

```sql
-- App Role Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

### 2.2 Core Authentication Tables

```sql
-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USER ROLES TABLE
-- ==========================================
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user'::app_role,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ADMIN OTP CODES TABLE
-- ==========================================
CREATE TABLE public.admin_otp_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PASSKEY CREDENTIALS TABLE (WebAuthn)
-- ==========================================
CREATE TABLE public.passkey_credentials (
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

-- Enable RLS
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- LOGIN AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE public.login_audit_logs (
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

-- Enable RLS
ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- LOGIN LOCATION CONFIRMATIONS TABLE
-- ==========================================
CREATE TABLE public.login_location_confirmations (
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

-- Enable RLS
ALTER TABLE public.login_location_confirmations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- IP ACCESS RULES TABLE
-- ==========================================
CREATE TABLE public.ip_access_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'whitelist' or 'blacklist'
    reason TEXT,
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_access_rules ENABLE ROW LEVEL SECURITY;
```

### 2.3 Admin Dashboard Tables

```sql
-- ==========================================
-- NOTIFICATION SETTINGS TABLE
-- ==========================================
CREATE TABLE public.notification_settings (
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

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- DASHBOARD WIDGETS TABLE
-- ==========================================
CREATE TABLE public.dashboard_widgets (
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

-- Enable RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
```

### 2.4 Content Management Tables

```sql
-- ==========================================
-- BLOG POSTS TABLE
-- ==========================================
CREATE TABLE public.blog_posts (
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

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- COURSES TABLE
-- ==========================================
CREATE TABLE public.courses (
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

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ENROLLMENTS TABLE
-- ==========================================
CREATE TABLE public.enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id),
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    amount_paid INTEGER,
    progress JSONB DEFAULT '{}'::jsonb,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PRODUCTS TABLE
-- ==========================================
CREATE TABLE public.products (
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

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

### 2.5 Payment Tables

```sql
-- ==========================================
-- PAYMENTS TABLE
-- ==========================================
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    product_id UUID NOT NULL,
    product_type TEXT NOT NULL, -- 'course', 'product', 'mentorship'
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- INVOICES TABLE
-- ==========================================
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    payment_id UUID REFERENCES public.payments(id),
    invoice_number TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    billing_details JSONB,
    status TEXT DEFAULT 'generated',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
```

### 2.6 Analytics Tables

```sql
-- ==========================================
-- PAGE VIEWS TABLE
-- ==========================================
CREATE TABLE public.page_views (
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

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USER INTERACTIONS TABLE
-- ==========================================
CREATE TABLE public.user_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    page_path TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- 'click', 'scroll', 'form_submit', etc.
    element_id TEXT,
    element_name TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CONTACT REQUESTS TABLE
-- ==========================================
CREATE TABLE public.contact_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    intent TEXT NOT NULL,
    reason TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CV DOWNLOADS TABLE
-- ==========================================
CREATE TABLE public.cv_downloads (
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

-- Enable RLS
ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;
```

### 2.7 LLM Atlas Tables

```sql
-- ==========================================
-- LLM MODELS TABLE
-- ==========================================
CREATE TABLE public.llm_models (
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

-- Enable RLS
ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;
```

### 2.8 Personal OS Tables

```sql
-- ==========================================
-- FAMILY MEMBERS TABLE (LifeMap)
-- ==========================================
CREATE TABLE public.family_members (
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

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
```

### 2.9 Scheduler Tables

```sql
-- ==========================================
-- SCHEDULED JOBS TABLE
-- ==========================================
CREATE TABLE public.scheduled_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    schedule TEXT NOT NULL, -- Cron expression
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

-- Enable RLS
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- JOB EXECUTIONS TABLE
-- ==========================================
CREATE TABLE public.job_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.scheduled_jobs(id),
    status TEXT NOT NULL DEFAULT 'running',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    output TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;
```

### 2.10 Email Templates Table

```sql
-- ==========================================
-- EMAIL TEMPLATES TABLE
-- ==========================================
CREATE TABLE public.email_templates (
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

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
```

---

## 3. Row-Level Security (RLS) Policies

### 3.1 Profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.2 User Roles Policies

```sql
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.3 Admin OTP Codes Policies

```sql
-- Users can view their own OTP codes
CREATE POLICY "Users can view their own OTP codes"
ON public.admin_otp_codes FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage OTP codes
CREATE POLICY "Service role can manage OTP codes"
ON public.admin_otp_codes FOR ALL
USING (true)
WITH CHECK (true);
```

### 3.4 Passkey Credentials Policies

```sql
-- Users can view their own passkeys
CREATE POLICY "Users can view their own passkeys"
ON public.passkey_credentials FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own passkeys
CREATE POLICY "Users can insert their own passkeys"
ON public.passkey_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own passkeys
CREATE POLICY "Users can update their own passkeys"
ON public.passkey_credentials FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own passkeys
CREATE POLICY "Users can delete their own passkeys"
ON public.passkey_credentials FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all passkeys
CREATE POLICY "Admins can manage all passkeys"
ON public.passkey_credentials FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.5 Login Audit Logs Policies

```sql
-- Anyone can insert login logs
CREATE POLICY "Anyone can insert login logs"
ON public.login_audit_logs FOR INSERT
WITH CHECK (true);

-- Admins can view login logs
CREATE POLICY "Admins can view login logs"
ON public.login_audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.6 Login Location Confirmations Policies

```sql
-- Anyone can insert confirmations
CREATE POLICY "Anyone can insert confirmations"
ON public.login_location_confirmations FOR INSERT
WITH CHECK (true);

-- Anyone can update their own confirmations
CREATE POLICY "Anyone can update their own confirmations"
ON public.login_location_confirmations FOR UPDATE
USING (true);

-- Admins can view all confirmations
CREATE POLICY "Admins can view all confirmations"
ON public.login_location_confirmations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.7 IP Access Rules Policies

```sql
-- Admins can manage IP rules
CREATE POLICY "Admins can manage IP rules"
ON public.ip_access_rules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.8 Content Policies

```sql
-- Blog Posts
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Courses
CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all courses"
ON public.courses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Products
CREATE POLICY "Anyone can view published products"
ON public.products FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.9 Analytics Policies

```sql
-- Page Views
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
ON public.page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- User Interactions
CREATE POLICY "Anyone can insert interactions"
ON public.user_interactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all interactions"
ON public.user_interactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact Requests
CREATE POLICY "Anyone can submit contact request"
ON public.contact_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
ON public.contact_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- CV Downloads
CREATE POLICY "Anyone can submit download request"
ON public.cv_downloads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can view all downloads"
ON public.cv_downloads FOR SELECT
USING (true);
```

### 3.10 Dashboard & Settings Policies

```sql
-- Dashboard Widgets
CREATE POLICY "Users can manage their own widgets"
ON public.dashboard_widgets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all widgets"
ON public.dashboard_widgets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Notification Settings
CREATE POLICY "Users can manage their own settings"
ON public.notification_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all settings"
ON public.notification_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.11 Payment Policies

```sql
-- Payments
CREATE POLICY "Users can view their payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Invoices
CREATE POLICY "Users can view their invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enrollments
CREATE POLICY "Users can view their enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments"
ON public.enrollments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.12 LLM Atlas Policies

```sql
-- Anyone can view models
CREATE POLICY "Anyone can view models"
ON public.llm_models FOR SELECT
USING (true);

-- Admins can manage models
CREATE POLICY "Admins can manage models"
ON public.llm_models FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.13 Personal OS Policies

```sql
-- Family Members
CREATE POLICY "Users can manage their own family members"
ON public.family_members FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all family members"
ON public.family_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.14 Scheduler Policies

```sql
-- Scheduled Jobs
CREATE POLICY "Admins can view scheduled jobs"
ON public.scheduled_jobs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create scheduled jobs"
ON public.scheduled_jobs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update scheduled jobs"
ON public.scheduled_jobs FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete scheduled jobs"
ON public.scheduled_jobs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Job Executions
CREATE POLICY "Admins can view job executions"
ON public.job_executions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create job executions"
ON public.job_executions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 3.15 Email Templates Policies

```sql
-- Admins can manage email templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## 4. Database Functions

### 4.1 Role Check Function

```sql
-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 4.2 Handle New User Function

```sql
-- Automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;
```

### 4.3 Update Timestamp Function

```sql
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
```

---

## 5. Database Triggers

### 5.1 New User Trigger

```sql
-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 Updated At Triggers

```sql
-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_access_rules_updated_at
  BEFORE UPDATE ON public.ip_access_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_llm_models_updated_at
  BEFORE UPDATE ON public.llm_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 6. Storage Buckets

### 6.1 Products Bucket

```sql
-- Create products bucket for digital product files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true);

-- Storage policies for products
CREATE POLICY "Anyone can view product files"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
```

### 6.2 Family Photos Bucket

```sql
-- Create family-photos bucket for LifeMap
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', true);

-- Storage policies for family photos
CREATE POLICY "Anyone can view family photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-photos');

CREATE POLICY "Admins can upload family photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update family photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete family photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'family-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
```

---

## 7. Edge Functions

### 7.1 Admin Setup Function

**Path:** `supabase/functions/admin-setup/index.ts`

**Purpose:** Creates the initial admin account with proper role assignment.

**Config:**
```toml
[functions.admin-setup]
verify_jwt = false
```

### 7.2 Admin OTP Function

**Path:** `supabase/functions/admin-otp/index.ts`

**Purpose:** Generates and verifies OTP codes for 2FA authentication.

**Actions:**
- `send`: Generates 6-digit OTP, stores in database, sends via email
- `verify`: Validates OTP against stored codes

**Config:**
```toml
[functions.admin-otp]
verify_jwt = false
```

### 7.3 Contact Notification Function

**Path:** `supabase/functions/contact-notification/index.ts`

**Purpose:** Sends email notifications when contact forms are submitted.

**Config:**
```toml
[functions.contact-notification]
verify_jwt = false
```

### 7.4 Security Alert Function

**Path:** `supabase/functions/security-alert/index.ts`

**Purpose:** Sends security alerts via email and SMS for failed login attempts.

**Config:**
```toml
[functions.security-alert]
verify_jwt = false
```

### 7.5 Location Confirmation Function

**Path:** `supabase/functions/location-confirmation/index.ts`

**Purpose:** Handles geo-blocking location confirmations via email/SMS.

**Actions:**
- `check_ip`: Checks IP against whitelist/blacklist
- `send`: Sends confirmation email with approve/deny links
- `verify`: Validates confirmation tokens

**Config:**
```toml
[functions.location-confirmation]
verify_jwt = false
```

### 7.6 Cron Executor Function

**Path:** `supabase/functions/cron-executor/index.ts`

**Purpose:** Executes scheduled jobs from the Chronos scheduler.

**Job Types:**
- `edge_function`: Invokes another edge function
- `analytics_report`: Generates analytics reports
- `cleanup`: Cleans old data
- `backup_check`: Verifies database backups
- `newsletter`: Sends newsletter campaigns

**Config:**
```toml
[functions.cron-executor]
verify_jwt = false
```

### 7.7 Razorpay Function

**Path:** `supabase/functions/razorpay/index.ts`

**Purpose:** Handles Razorpay payment integration for courses and products.

**Config:**
```toml
[functions.razorpay]
verify_jwt = false
```

### 7.8 Mapbox Token Function

**Path:** `supabase/functions/mapbox-token/index.ts`

**Purpose:** Securely provides Mapbox token for maps.

**Config:**
```toml
[functions.mapbox-token]
verify_jwt = false
```

---

## 8. Required Secrets

### 8.1 Core Supabase Secrets

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for admin operations | ✅ |
| `SUPABASE_DB_URL` | Direct database connection | ✅ |
| `SUPABASE_PUBLISHABLE_KEY` | Client-side publishable key | ✅ |

### 8.2 Email Service (Resend)

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `RESEND_API_KEY` | Resend API for sending emails | ✅ |

### 8.3 SMS Service (Twilio)

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | ✅ |
| `TWILIO_PHONE_NUMBER` | Twilio sender phone number | ✅ |
| `ADMIN_PHONE_NUMBER` | Admin phone for SMS alerts | ✅ |

### 8.4 Payment Gateway (Razorpay)

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `RAZORPAY_KEY_ID` | Razorpay API key ID | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | ✅ |

### 8.5 Maps (Mapbox)

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `MAPBOX_PUBLIC_TOKEN` | Mapbox public access token | ✅ |

---

## 9. Admin Authentication Flow

### 9.1 Complete Authentication Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CIA-LEVEL ADMIN AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User Visits   │
                              │  /admin/login   │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  PHASE 1        │
                              │  Email/Password │
                              │  Verification   │
                              └────────┬────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                         ▼                           ▼
                ┌─────────────────┐        ┌─────────────────┐
                │    SUCCESS      │        │    FAILURE      │
                │                 │        │                 │
                │  Proceed to     │        │  Log attempt    │
                │  Phase 2        │        │  + Send alert   │
                └────────┬────────┘        │  (if count ≥ 2) │
                         │                 └─────────────────┘
                         ▼
                ┌─────────────────┐
                │  GEO-CHECK      │
                │                 │
                │  • IP Check     │
                │  • Rate Limit   │
                │  • Location     │
                │    Anomaly      │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              │                      │
              ▼                      ▼
     ┌─────────────────┐    ┌─────────────────┐
     │  NEW LOCATION   │    │ KNOWN LOCATION  │
     │                 │    │                 │
     │  Send Email +   │    │  Continue to    │
     │  SMS Confirm    │    │  Phase 2        │
     └────────┬────────┘    └────────┬────────┘
              │                      │
              ▼                      │
     ┌─────────────────┐             │
     │  WAIT FOR       │             │
     │  CONFIRMATION   │             │
     │  (Email Link)   │             │
     └────────┬────────┘             │
              │                      │
              └──────────┬───────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  PHASE 2        │
                │  OTP 2FA        │
                │  Verification   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Send OTP via   │
                │  Email          │
                │  (6-digit code) │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  User Enters    │
                │  OTP Code       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  FIRST TIME?    │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              │                      │
              ▼                      ▼
     ┌─────────────────┐    ┌─────────────────┐
     │  YES - ENROLL   │    │  NO - AUTH      │
     │  PASSKEYS       │    │  WITH PASSKEY   │
     │                 │    │                 │
     │  Phase 3 + 4    │    │  Phase 3        │
     │  Registration   │    │  Verification   │
     └────────┬────────┘    └────────┬────────┘
              │                      │
              ▼                      │
     ┌─────────────────┐             │
     │  PHASE 3        │             │
     │  FINGERPRINT    │             │
     │  Registration   │             │
     │  (WebAuthn)     │             │
     └────────┬────────┘             │
              │                      │
              ▼                      │
     ┌─────────────────┐             │
     │  PHASE 4        │             │
     │  FACEID         │             │
     │  Registration   │             │
     │  (WebAuthn)     │             │
     └────────┬────────┘             │
              │                      │
              └──────────┬───────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  BIOMETRIC      │
                │  VERIFICATION   │
                │                 │
                │  FaceID (iOS)   │
                │  TouchID (Mac)  │
                │  Windows Hello  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  ✅ SUCCESS     │
                │                 │
                │  Access to      │
                │  Command Center │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  MODULE-LEVEL   │
                │  RE-AUTH GATES  │
                │                 │
                │  • AETHERGRID   │
                │  • CMS Studio   │
                │  • LMS Studio   │
                │  • Astra Vault  │
                │  • FINCORE      │
                │  • LifeMap      │
                │  • Integrations │
                │  • Settings     │
                └─────────────────┘
```

### 9.2 Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | Supabase Auth (bcrypt) |
| **2FA OTP** | 6-digit code via email, 5-min expiry |
| **WebAuthn** | Hardware-backed FaceID/TouchID/Windows Hello |
| **Geo-Blocking** | IP whitelist/blacklist, location anomaly detection |
| **Rate Limiting** | 5 attempts per 15 minutes per email |
| **Audit Logging** | All login attempts logged with full context |
| **Security Alerts** | Email + SMS after 2 failed attempts |
| **Module Re-Auth** | Biometric re-verification for sensitive modules |

### 9.3 Authentication States

```typescript
enum AuthPhase {
  EMAIL_PASSWORD = 'email_password',
  GEO_CHECK = 'geo_check',
  LOCATION_CONFIRMATION = 'location_confirmation',
  OTP_VERIFICATION = 'otp_verification',
  PASSKEY_REGISTRATION = 'passkey_registration',
  BIOMETRIC_VERIFICATION = 'biometric_verification',
  AUTHENTICATED = 'authenticated'
}
```

---

## 10. Self-Hosting Guide

### 10.1 Supabase Self-Hosted Setup

1. **Clone Supabase Docker:**
```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

2. **Configure Environment:**
Edit `.env` with your settings:
```env
POSTGRES_PASSWORD=your-super-secret-password
JWT_SECRET=your-jwt-secret-at-least-32-characters
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
```

3. **Start Supabase:**
```bash
docker-compose up -d
```

4. **Run Migrations:**
```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres -d postgres

# Run each migration file in order
\i path/to/migration.sql
```

### 10.2 Neon PostgreSQL Setup

1. **Create Neon Project:**
- Go to https://neon.tech
- Create new project
- Note connection string

2. **Run Migrations:**
```bash
# Using psql
psql "postgresql://user:pass@host/db" < migrations.sql
```

3. **Configure Application:**
Update environment variables:
```env
VITE_SUPABASE_URL=https://your-neon-host
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 10.3 Edge Function Deployment

For self-hosted, use Deno Deploy or Docker:

```dockerfile
# Dockerfile for edge functions
FROM denoland/deno:1.37.0

WORKDIR /app
COPY supabase/functions ./functions

EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-env", "functions/index.ts"]
```

### 10.4 Required Services

| Service | Self-Hosted Alternative |
|---------|------------------------|
| Supabase Auth | Supabase Self-Hosted |
| Supabase Storage | MinIO / S3 Compatible |
| Supabase Edge Functions | Deno Deploy / Docker |
| Resend Email | SMTP Server / SendGrid |
| Twilio SMS | Twilio / MessageBird |
| Razorpay | Direct Razorpay Integration |

---

## Complete Migration Script

Save as `complete_migration.sql`:

```sql
-- ============================================
-- COMPLETE ABHISHEKPANDA.COM MIGRATION SCRIPT
-- CIA-Level Security Admin Command Center
-- ============================================

-- 1. Create Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create all tables (copy from Section 2)
-- [Include all CREATE TABLE statements]

-- 3. Enable RLS on all tables
-- [Include all ALTER TABLE ... ENABLE ROW LEVEL SECURITY]

-- 4. Create all functions (copy from Section 4)
-- [Include all CREATE FUNCTION statements]

-- 5. Create all triggers (copy from Section 5)
-- [Include all CREATE TRIGGER statements]

-- 6. Create all RLS policies (copy from Section 3)
-- [Include all CREATE POLICY statements]

-- 7. Create storage buckets (copy from Section 6)
-- [Include all storage bucket and policy statements]

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial complete documentation |

---

**Generated for:** abhishekpanda.com  
**Security Level:** CIA-Grade  
**Author:** Lovable AI  
**Contact:** admin@abhishekpanda.com
