# Abhishek Panda Portfolio - Complete Self-Hosting Migration Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Database Schema](#database-schema)
5. [Storage Buckets](#storage-buckets)
6. [Edge Functions](#edge-functions)
7. [Environment Variables & Secrets](#environment-variables--secrets)
8. [Migration Steps](#migration-steps)
9. [Security Configuration](#security-configuration)
10. [PWA Configuration](#pwa-configuration)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This document provides a complete guide to migrate the Abhishek Panda portfolio/admin platform from Lovable Cloud to a self-hosted Supabase instance or any PostgreSQL-compatible database.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth + WebAuthn/Passkeys
- **File Storage**: Supabase Storage
- **PWA**: vite-plugin-pwa

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Pages: Index, About, Academy, Blog, Admin, LLM Galaxy      │
│  Components: Navigation, Footer, Admin Dashboard            │
│  Hooks: useAdminAuth, useWebAuthn, useSessionLock           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Backend                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Auth       │   Database   │   Storage    │ Edge Functions │
│              │  (PostgreSQL)│              │    (Deno)      │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Email/Pass   │ 30+ Tables   │ products     │ admin-otp      │
│ Passkeys     │ RLS Policies │ family-photos│ security-alert │
│ Sessions     │ Triggers     │              │ razorpay       │
│              │              │              │ contact-notify │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## Prerequisites

1. **Supabase Account** (or self-hosted Supabase)
2. **Node.js** 18+ and npm/bun
3. **Supabase CLI** (for edge functions)
4. **Domain** (for production deployment)
5. **External Services**:
   - Resend (email delivery)
   - Twilio (SMS alerts - optional)
   - Razorpay (payments - optional)
   - Mapbox (maps - optional)

---

## Database Schema

### Complete Table List

| Table Name | Description | RLS |
|------------|-------------|-----|
| `profiles` | User profile data | ✅ |
| `user_roles` | Admin/moderator/user roles | ✅ |
| `admin_sessions` | Active login sessions | ✅ |
| `admin_settings` | Per-user admin preferences | ✅ |
| `admin_otp_codes` | 2FA OTP codes | ✅ |
| `otp_rate_limits` | Rate limiting for OTP | ✅ |
| `passkey_credentials` | WebAuthn passkeys | ✅ |
| `login_audit_logs` | Login attempt history | ✅ |
| `login_location_confirmations` | Location verification | ✅ |
| `activity_log` | Global activity tracking | ✅ |
| `blog_posts` | Blog content | ✅ |
| `courses` | Academy courses | ✅ |
| `enrollments` | Course enrollments | ✅ |
| `products` | Digital products | ✅ |
| `payments` | Payment records | ✅ |
| `invoices` | Invoice records | ✅ |
| `contact_requests` | Contact form submissions | ✅ |
| `cv_downloads` | CV download tracking | ✅ |
| `page_views` | Analytics - page views | ✅ |
| `user_interactions` | Analytics - interactions | ✅ |
| `notification_settings` | Email notification prefs | ✅ |
| `email_templates` | Email template builder | ✅ |
| `scheduled_jobs` | Cron job configurations | ✅ |
| `job_executions` | Job execution logs | ✅ |
| `ip_access_rules` | IP whitelist/blacklist | ✅ |
| `llm_models` | LLM Galaxy model data | ✅ |
| `dashboard_widgets` | Admin dashboard layout | ✅ |
| `personal_todos` | Personal OS - Todos | ✅ |
| `study_sessions` | Personal OS - Study | ✅ |
| `loans` | Personal OS - Loans | ✅ |
| `emi_payments` | Personal OS - EMI | ✅ |
| `insurance_policies` | Personal OS - Insurance | ✅ |
| `insurance_documents` | Personal OS - Docs | ✅ |
| `life_settings` | Personal OS - Lifespan | ✅ |
| `life_achievements` | Personal OS - Achievements | ✅ |
| `family_members` | Family tree data | ✅ |

### Complete Migration SQL

```sql
-- See docs/complete_migration.sql for the full schema
-- This includes all tables, indexes, RLS policies, triggers, and functions
```

### Key Database Functions

```sql
-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### App Role Enum

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

---

## Storage Buckets

### Required Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `products` | Yes | Digital product files and thumbnails |
| `family-photos` | No | Private family member photos |

### Storage Policies (Example)

```sql
-- Products bucket - public read access
CREATE POLICY "Public product files"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Products bucket - admin upload
CREATE POLICY "Admins can upload products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  has_role(auth.uid(), 'admin')
);

-- Family photos - owner only
CREATE POLICY "Users manage own family photos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'family-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Edge Functions

### Function List

| Function | JWT Required | Purpose |
|----------|--------------|---------|
| `admin-otp` | No | Send/verify 2FA OTP codes |
| `admin-setup` | No | Initial admin account setup |
| `security-alert` | No | Send security alert emails/SMS |
| `contact-notification` | No | Send contact form notifications |
| `razorpay` | No | Payment processing webhook |
| `cron-executor` | No | Execute scheduled jobs |
| `location-confirmation` | No | New location email confirmation |
| `new-device-alert` | No | New device login alerts |
| `mapbox-token` | Yes | Secure Mapbox token retrieval |
| `family-photo-url` | Yes | Generate signed URLs for family photos |

### Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy admin-otp
```

### Function Configuration (`supabase/config.toml`)

```toml
project_id = "YOUR_PROJECT_ID"

[functions.admin-otp]
verify_jwt = false

[functions.security-alert]
verify_jwt = false

[functions.razorpay]
verify_jwt = false

[functions.family-photo-url]
verify_jwt = true
```

---

## Environment Variables & Secrets

### Frontend Environment (`.env`)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

### Supabase Edge Function Secrets

Set these in Supabase Dashboard → Edge Functions → Secrets:

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (never expose publicly) |
| `SUPABASE_ANON_KEY` | Yes | Anonymous/publishable key |
| `RESEND_API_KEY` | Yes | For sending emails |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account for SMS |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio phone number |
| `ADMIN_PHONE_NUMBER` | Optional | Admin phone for SMS alerts |
| `RAZORPAY_KEY_ID` | Optional | Razorpay payment key |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret |
| `MAPBOX_PUBLIC_TOKEN` | Optional | Mapbox for threat maps |

---

## Migration Steps

### Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down project URL and keys

### Step 2: Run Database Migration

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and paste contents of docs/complete_migration.sql

# Option 2: Via CLI
supabase db push
```

### Step 3: Create Storage Buckets

```sql
-- In SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('family-photos', 'family-photos', false);
```

### Step 4: Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates
4. Set Site URL and Redirect URLs

### Step 5: Set Environment Secrets

```bash
# Via CLI
supabase secrets set RESEND_API_KEY=your_key_here
supabase secrets set TWILIO_ACCOUNT_SID=your_sid_here
# ... etc
```

### Step 6: Deploy Edge Functions

```bash
supabase functions deploy
```

### Step 7: Update Frontend Config

Update `.env` with new project credentials:

```env
VITE_SUPABASE_URL=https://NEW_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=NEW_ANON_KEY
VITE_SUPABASE_PROJECT_ID=NEW_PROJECT_ID
```

### Step 8: Create Admin User

1. Sign up via your app
2. Run SQL to grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'admin');
```

### Step 9: Test All Features

- [ ] Email login
- [ ] OTP verification
- [ ] Passkey registration
- [ ] Admin dashboard access
- [ ] Blog creation
- [ ] Course creation
- [ ] Contact form
- [ ] CV downloads

---

## Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public tables**: `blog_posts`, `courses`, `products`, `llm_models` (read-only for public)
- **User tables**: Users can only access their own data
- **Admin tables**: Only admins can access sensitive data

### Authentication Flow

1. **Email/Password** → Supabase Auth
2. **2FA OTP** → `admin-otp` edge function
3. **Passkey** → WebAuthn (stored in `passkey_credentials`)
4. **Session Lock** → Auto-lock after inactivity

### Rate Limiting

- OTP attempts: 5 per 15 minutes
- Security alerts: 10 per minute per IP
- Edge function rate limits via Supabase

---

## PWA Configuration

### Manifest (`public/manifest.webmanifest`)

```json
{
  "name": "Abhishek Panda Command Center",
  "short_name": "AP Admin",
  "start_url": "/admin/login",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#0f172a"
}
```

### Service Worker

Configured via `vite-plugin-pwa` in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      // API caching strategies
    ]
  }
})
```

---

## Troubleshooting

### Passkey Registration Fails on iOS

**Solution**: Ensure:
1. Site is served over HTTPS
2. Domain matches RP ID
3. Not in an iframe (deploy to production URL)
4. Face ID/Touch ID is enabled in device settings

### OTP Emails Not Sending

**Check**:
1. `RESEND_API_KEY` is set correctly
2. Sender domain is verified in Resend
3. Check edge function logs

### Session Locks Immediately

**Solution**: Increase grace period:
```typescript
useSessionLock({
  gracePeriod: 60000, // 60 seconds
})
```

### RLS Policies Blocking Access

**Debug**:
```sql
-- Check user's roles
SELECT * FROM user_roles WHERE user_id = 'UUID';

-- Test policy
SELECT has_role('UUID', 'admin');
```

---

## Support

For issues or questions:
- Email: contact@abhishekpanda.com
- GitHub: [abhishekpandaOfficial](https://github.com/abhishekpandaOfficial)

---

*Last Updated: February 2026*
