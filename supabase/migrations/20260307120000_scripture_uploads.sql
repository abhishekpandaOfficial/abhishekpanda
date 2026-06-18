create table if not exists public.scripture_upload_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  request_ip text,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists idx_scripture_upload_otp_email_created
  on public.scripture_upload_otp_codes(email, created_at desc);
create index if not exists idx_scripture_upload_otp_expires
  on public.scripture_upload_otp_codes(expires_at);

create table if not exists public.scripture_upload_submissions (
  id uuid primary key default gen_random_uuid(),
  uploader_name text not null,
  email text not null,
  mobile text not null,
  location_text text,
  request_ip text,
  request_city text,
  request_region text,
  request_country text,
  user_agent text,
  file_name text not null,
  file_size_bytes integer not null,
  file_content text not null,
  content_hash text not null,
  scripture_title text,
  scripture_description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  duplicate_reason text,
  created_at timestamptz not null default now(),
  verified_at timestamptz not null default now()
);

create unique index if not exists uq_scripture_upload_submissions_content_hash
  on public.scripture_upload_submissions(content_hash);
create index if not exists idx_scripture_upload_submissions_created
  on public.scripture_upload_submissions(created_at desc);

alter table public.scripture_upload_otp_codes enable row level security;
alter table public.scripture_upload_submissions enable row level security;
