alter table public.classified_access_requests
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists country text,
  add column if not exists isp text,
  add column if not exists timezone text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists source text,
  add column if not exists user_agent text;

create index if not exists idx_classified_access_requests_created
  on public.classified_access_requests(created_at desc);

create index if not exists idx_classified_access_requests_country_created
  on public.classified_access_requests(country, created_at desc);

alter table public.classified_access_otp_codes
  add column if not exists request_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'classified_access_otp_codes_request_id_fkey'
  ) then
    alter table public.classified_access_otp_codes
      add constraint classified_access_otp_codes_request_id_fkey
      foreign key (request_id)
      references public.classified_access_requests(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_classified_access_otp_request_id
  on public.classified_access_otp_codes(request_id);

drop policy if exists "classified_access_requests_admin_read" on public.classified_access_requests;
create policy "classified_access_requests_admin_read"
on public.classified_access_requests
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

drop policy if exists "classified_access_requests_admin_delete" on public.classified_access_requests;
create policy "classified_access_requests_admin_delete"
on public.classified_access_requests
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

grant select, delete on public.classified_access_requests to authenticated;
