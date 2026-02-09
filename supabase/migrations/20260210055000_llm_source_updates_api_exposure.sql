-- Ensure llm_source_updates is queryable via PostgREST and refresh schema cache.

grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant select on table public.llm_source_updates to anon;
grant select on table public.llm_source_updates to authenticated;

alter table public.llm_source_updates enable row level security;

drop policy if exists "Public can read llm source updates" on public.llm_source_updates;
create policy "Public can read llm source updates"
  on public.llm_source_updates
  for select
  using (true);

notify pgrst, 'reload schema';
