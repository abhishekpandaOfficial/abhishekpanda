-- Ensure PostgREST can expose llm_source_updates to anon/authenticated clients.

grant select on table public.llm_source_updates to anon;
grant select on table public.llm_source_updates to authenticated;
