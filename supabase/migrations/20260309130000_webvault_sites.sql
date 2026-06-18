create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  url text,
  description text,
  what_it_does text,
  why_built text,
  domain_provider text,
  hosting text,
  status text not null default 'active',
  type text not null default 'personal',
  tech_stack jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.websites enable row level security;

drop policy if exists "webvault_admin_all" on public.websites;

create policy "webvault_admin_all"
on public.websites
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

grant select, insert, update, delete on public.websites to authenticated;

drop trigger if exists trg_websites_updated_at on public.websites;

create trigger trg_websites_updated_at
before update on public.websites
for each row
execute procedure public.set_updated_at();
