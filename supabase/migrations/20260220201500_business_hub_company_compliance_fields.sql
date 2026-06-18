-- Additional compliance and location fields for business companies.

alter table if exists public.business_companies
  add column if not exists cin text,
  add column if not exists gstin text,
  add column if not exists udyam_registration text,
  add column if not exists dpiit_recognition text,
  add column if not exists incorporation_date date,
  add column if not exists company_type text,
  add column if not exists registered_office text,
  add column if not exists corporate_offices text[] not null default '{}';

-- Backfill gstin from existing gst_number when available.
update public.business_companies
set gstin = coalesce(gstin, gst_number)
where gstin is null and gst_number is not null;
