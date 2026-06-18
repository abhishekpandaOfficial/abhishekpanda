create table if not exists public.argus_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ship', 'drone', 'missile', 'satellite', 'conflict')),
  code text,
  name text not null,
  type_label text,
  flag text,
  status text,
  details text,
  lat double precision,
  lng double precision,
  target_lat double precision,
  target_lng double precision,
  heading double precision,
  speed double precision,
  altitude double precision,
  orbit text,
  inclination double precision,
  casualty_level text,
  severity text,
  color text,
  polygon jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.argus_view_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null default 'screen_load',
  page_path text not null default '/classified',
  session_id text,
  ip_address text,
  city text,
  region text,
  country text,
  isp text,
  timezone text,
  latitude double precision,
  longitude double precision,
  user_agent text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.argus_assets enable row level security;
alter table public.argus_view_events enable row level security;

drop policy if exists "argus_assets_public_read" on public.argus_assets;
create policy "argus_assets_public_read"
on public.argus_assets
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "argus_assets_admin_all" on public.argus_assets;
create policy "argus_assets_admin_all"
on public.argus_assets
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

drop policy if exists "argus_view_events_public_insert" on public.argus_view_events;
create policy "argus_view_events_public_insert"
on public.argus_view_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "argus_view_events_admin_read" on public.argus_view_events;
create policy "argus_view_events_admin_read"
on public.argus_view_events
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

drop policy if exists "argus_view_events_admin_delete" on public.argus_view_events;
create policy "argus_view_events_admin_delete"
on public.argus_view_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

grant select on public.argus_assets to anon, authenticated;
grant insert, update, delete on public.argus_assets to authenticated;
grant insert on public.argus_view_events to anon, authenticated;
grant select, delete on public.argus_view_events to authenticated;

drop trigger if exists trg_argus_assets_updated_at on public.argus_assets;
create trigger trg_argus_assets_updated_at
before update on public.argus_assets
for each row
execute procedure public.set_updated_at();
