-- Business Hub module: company profile, products, credentials, and documents.

create table if not exists public.business_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null default 'OriginX Labs',
  brand_name text not null default 'OriginX Labs',
  website text,
  website_urls text[] not null default '{}',
  registered_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.business_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.business_companies(id) on delete set null,
  name text not null,
  description text,
  tags text[] not null default '{}',
  product_url text,
  documentation_url text,
  hosting text,
  platform_web boolean not null default false,
  platform_mobile boolean not null default false,
  platform_desktop boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.business_companies(id) on delete set null,
  product_id uuid references public.business_products(id) on delete set null,
  label text not null,
  system text,
  username text,
  secret_hint text,
  notes text,
  last_rotated_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.business_companies(id) on delete set null,
  product_id uuid references public.business_products(id) on delete set null,
  title text not null,
  description text,
  tags text[] not null default '{}',
  document_url text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_companies enable row level security;
alter table public.business_products enable row level security;
alter table public.business_credentials enable row level security;
alter table public.business_documents enable row level security;

drop policy if exists "Admins can manage business companies" on public.business_companies;
create policy "Admins can manage business companies"
on public.business_companies
for all
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage business products" on public.business_products;
create policy "Admins can manage business products"
on public.business_products
for all
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage business credentials" on public.business_credentials;
create policy "Admins can manage business credentials"
on public.business_credentials
for all
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage business documents" on public.business_documents;
create policy "Admins can manage business documents"
on public.business_documents
for all
using (public.has_role(auth.uid(), 'admin'));

-- Private storage bucket for business docs.
insert into storage.buckets (id, name, public)
values ('business-docs', 'business-docs', false)
on conflict (id) do nothing;

drop policy if exists "Admins can manage business-docs" on storage.objects;
create policy "Admins can manage business-docs"
on storage.objects for all
using (bucket_id = 'business-docs' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'business-docs' and public.has_role(auth.uid(), 'admin'));
