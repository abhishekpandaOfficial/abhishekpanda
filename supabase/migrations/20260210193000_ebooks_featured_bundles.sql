-- Add featured + sections metadata to ebooks
alter table public.ebooks
add column if not exists is_featured boolean not null default false;

alter table public.ebooks
add column if not exists sections text[] not null default '{}';

-- Backfill sections based on existing categories
update public.ebooks
set sections = array_remove(array_remove(array_cat(
  case when category = 'INTERVIEW' then ARRAY['interview']::text[] else ARRAY[]::text[] end,
  case when category in ('DOTNET_ARCHITECT','SOLID_DESIGN_PATTERNS') then ARRAY['architect']::text[] else ARRAY[]::text[] end
), 'featured'), 'featured');

-- Ebook bundles
create table if not exists public.ebook_bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  discount_label text,
  price_label text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ebook_bundles enable row level security;

create policy "Public can read ebook bundles"
on public.ebook_bundles
for select
using (is_active = true);

insert into public.ebook_bundles (slug, title, subtitle, discount_label, price_label, sort_order)
values
('architect-pro', 'Architect Pro Bundle', '.NET + SOLID + Architect Interview', 'Save 22%', '₹44,999', 1),
('interview-mastery', 'Interview Mastery Bundle', 'All Interview Packs (.NET + Microservices + Patterns)', 'Save 35%', '₹1,999', 2)
on conflict (slug) do nothing;
