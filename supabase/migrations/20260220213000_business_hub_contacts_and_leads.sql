-- Business contacts and leads for each company.

create table if not exists public.business_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.business_companies(id) on delete set null,
  full_name text not null,
  role text,
  contact_type text not null default 'business',
  relationship_stage text not null default 'active',
  email text,
  mobile text,
  associated_since date,
  last_contacted_at timestamptz,
  reason text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_contacts_user_id_idx on public.business_contacts (user_id);
create index if not exists business_contacts_company_id_idx on public.business_contacts (company_id);

alter table public.business_contacts enable row level security;

drop policy if exists "Admins can manage business contacts" on public.business_contacts;
create policy "Admins can manage business contacts"
on public.business_contacts
for all
using (public.has_role(auth.uid(), 'admin'));
