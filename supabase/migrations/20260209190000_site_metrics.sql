-- Basic site-wide visitor counter.

create table if not exists public.site_metrics (
  slug text primary key,
  visits bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_metrics enable row level security;

drop policy if exists "Public can read site metrics" on public.site_metrics;
create policy "Public can read site metrics"
  on public.site_metrics
  for select
  using (true);

-- Increment counter and return updated value.
create or replace function public.increment_site_visit(_slug text default 'site')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_visits bigint;
begin
  insert into public.site_metrics (slug, visits)
  values (_slug, 1)
  on conflict (slug) do update
    set visits = public.site_metrics.visits + 1,
        updated_at = now()
  returning visits into new_visits;

  return new_visits;
end;
$$;
