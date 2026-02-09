-- Admin MFA hardening: server-verified WebAuthn + session state + realtime audit

-- 1) WebAuthn challenges table (short-lived)
create table if not exists public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge text not null,
  kind text not null check (kind in ('registration', 'authentication')),
  rp_id text not null,
  origin text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used boolean not null default false
);

create index if not exists idx_webauthn_challenges_user_kind_created
  on public.webauthn_challenges(user_id, kind, created_at desc);

alter table public.webauthn_challenges enable row level security;

-- Only service role / admins can read these; normal users should not.
drop policy if exists "Admins can read webauthn challenges" on public.webauthn_challenges;
create policy "Admins can read webauthn challenges"
on public.webauthn_challenges
for select
using (has_role(auth.uid(), 'admin'));

-- No direct user inserts/updates; edge functions use service role.

-- 2) Server-side MFA session state for admin access (4h)
create table if not exists public.admin_mfa_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  otp_verified_at timestamptz,
  webauthn_step4_verified_at timestamptz,
  webauthn_step5_verified_at timestamptz,
  fully_verified_at timestamptz,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_mfa_sessions enable row level security;

drop policy if exists "Users can read their admin mfa session" on public.admin_mfa_sessions;
create policy "Users can read their admin mfa session"
on public.admin_mfa_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can manage all admin mfa sessions" on public.admin_mfa_sessions;
create policy "Admins can manage all admin mfa sessions"
on public.admin_mfa_sessions
for all
using (has_role(auth.uid(), 'admin'));

-- 3) Realtime: make login_audit_logs streamable
alter table public.login_audit_logs replica identity full;

do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.login_audit_logs';
  exception when duplicate_object then
    -- already added
    null;
  end;
end $$;

