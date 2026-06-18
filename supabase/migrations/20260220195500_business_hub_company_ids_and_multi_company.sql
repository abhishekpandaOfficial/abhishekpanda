-- Extend business companies with statutory IDs and allow multiple companies per user.

alter table if exists public.business_companies
  add column if not exists pan_number text,
  add column if not exists tan_number text,
  add column if not exists gst_number text,
  add column if not exists startup_india_id text,
  add column if not exists regulatory_ids text[] not null default '{}';

alter table if exists public.business_companies
  drop constraint if exists business_companies_user_id_key;
