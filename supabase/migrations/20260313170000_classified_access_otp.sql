create table if not exists public.classified_access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  request_ip text,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists idx_classified_access_requests_email_created
  on public.classified_access_requests(email, created_at desc);

create table if not exists public.classified_access_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  request_ip text,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists idx_classified_access_otp_email_created
  on public.classified_access_otp_codes(email, created_at desc);

create index if not exists idx_classified_access_otp_expires
  on public.classified_access_otp_codes(expires_at);

alter table public.classified_access_requests enable row level security;
alter table public.classified_access_otp_codes enable row level security;
