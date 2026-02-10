-- Admin module persistence + ebook publishing + storage buckets

-- 1) Ebooks publish flag
alter table public.ebooks
  add column if not exists is_published boolean not null default true;

update public.ebooks
  set is_published = true
  where is_published is null;

alter table public.ebooks
  alter column is_published set default false;

-- Allow admins to manage ebooks
drop policy if exists "Admins can manage ebooks" on public.ebooks;
create policy "Admins can manage ebooks"
on public.ebooks
for all
using (public.has_role(auth.uid(), 'admin'));

-- 2) Nimbus Desk notes
create table if not exists public.nimbus_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  category text not null default 'note',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nimbus_notes enable row level security;

drop policy if exists "Admins can manage nimbus notes" on public.nimbus_notes;
create policy "Admins can manage nimbus notes"
on public.nimbus_notes
for all
using (public.has_role(auth.uid(), 'admin'));

-- 3) Integrations (API keys + webhooks)
create table if not exists public.admin_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  api_key text not null,
  status text not null default 'active',
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  last_used timestamptz
);

create table if not exists public.admin_webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  status text not null default 'active',
  success_rate numeric not null default 100,
  events jsonb not null default '[]'::jsonb,
  last_triggered timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_api_keys enable row level security;
alter table public.admin_webhooks enable row level security;

drop policy if exists "Admins can manage api keys" on public.admin_api_keys;
create policy "Admins can manage api keys"
on public.admin_api_keys
for all
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage webhooks" on public.admin_webhooks;
create policy "Admins can manage webhooks"
on public.admin_webhooks
for all
using (public.has_role(auth.uid(), 'admin'));

-- 4) Automation workflows
create table if not exists public.automation_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  trigger text not null,
  is_active boolean not null default true,
  status text not null default 'idle',
  run_count integer not null default 0,
  last_run timestamptz,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.automation_workflows enable row level security;

drop policy if exists "Admins can manage workflows" on public.automation_workflows;
create policy "Admins can manage workflows"
on public.automation_workflows
for all
using (public.has_role(auth.uid(), 'admin'));

-- 5) Drive items (metadata)
create table if not exists public.drive_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  size_bytes bigint,
  mime_type text,
  storage_path text,
  parent_id uuid references public.drive_items(id) on delete set null,
  tags text[] not null default '{}',
  is_starred boolean not null default false,
  is_encrypted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drive_items enable row level security;

drop policy if exists "Admins can manage drive items" on public.drive_items;
create policy "Admins can manage drive items"
on public.drive_items
for all
using (public.has_role(auth.uid(), 'admin'));

-- 6) Storage buckets
-- Ebooks assets bucket (public)
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', true)
on conflict (id) do nothing;

drop policy if exists "Public read ebooks bucket" on storage.objects;
create policy "Public read ebooks bucket"
on storage.objects for select
using (bucket_id = 'ebooks');

drop policy if exists "Admins can write ebooks bucket" on storage.objects;
create policy "Admins can write ebooks bucket"
on storage.objects for all
using (bucket_id = 'ebooks' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'ebooks' and public.has_role(auth.uid(), 'admin'));

-- Astra Vault bucket (private)
insert into storage.buckets (id, name, public)
values ('astra-vault', 'astra-vault', false)
on conflict (id) do nothing;

drop policy if exists "Admins can manage astra-vault" on storage.objects;
create policy "Admins can manage astra-vault"
on storage.objects for all
using (bucket_id = 'astra-vault' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'astra-vault' and public.has_role(auth.uid(), 'admin'));
