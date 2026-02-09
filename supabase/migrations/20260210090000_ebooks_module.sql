-- Ebooks module core schema
create type public.ebook_category as enum (
  'DOTNET_ARCHITECT',
  'SOLID_DESIGN_PATTERNS',
  'INTERVIEW',
  'KAFKA',
  'AI_LLM',
  'ROADMAP'
);

create type public.ebook_level as enum (
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'ARCHITECT'
);

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category public.ebook_category not null,
  level public.ebook_level not null,
  is_free boolean not null default false,
  is_coming_soon boolean not null default false,
  price_in_inr integer,
  cover_image_url text,
  preview_pdf_url text,
  epub_url text,
  pdf_url text,
  toc_json jsonb,
  tech_stack text[] not null default '{}',
  libraries text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ebook_lead_captures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  mobile text not null,
  ebook_slug text not null,
  request_ip text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ebook_lead_email_slug on public.ebook_lead_captures(email, ebook_slug);

create table if not exists public.ebook_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ebook_slug text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  request_ip text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ebook_otp_email_slug on public.ebook_otp_codes(email, ebook_slug, created_at desc);
create index if not exists idx_ebook_otp_expires_at on public.ebook_otp_codes(expires_at);
create index if not exists idx_ebook_lead_created_at on public.ebook_lead_captures(created_at);

create table if not exists public.ebook_download_sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ebook_slug text not null,
  token_jti text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ebook_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  ebook_slug text not null,
  status text not null default 'pending',
  provider_ref text,
  created_at timestamptz not null default now()
);

alter table public.ebooks enable row level security;
alter table public.ebook_lead_captures enable row level security;
alter table public.ebook_otp_codes enable row level security;
alter table public.ebook_download_sessions enable row level security;
alter table public.ebook_purchases enable row level security;

create policy "Public can read ebooks"
on public.ebooks
for select
using (true);

create or replace function public.touch_ebooks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_ebooks_updated_at on public.ebooks;
create trigger trg_touch_ebooks_updated_at
before update on public.ebooks
for each row
execute function public.touch_ebooks_updated_at();

insert into public.ebooks (slug, title, subtitle, description, category, level, is_free, is_coming_soon, price_in_inr, cover_image_url, preview_pdf_url, epub_url, pdf_url, toc_json, tech_stack, libraries)
values
('dotnet-architect-blueprint', '.NET Architect Blueprint', 'Production Architecture Patterns for Scale', 'Premium architect guide', 'DOTNET_ARCHITECT', 'ARCHITECT', false, false, 24999, '/ebooks/covers/dotnet-architect-blueprint.svg', '/ebooks/files/dotnet-architect-blueprint.pdf', '/ebooks/files/dotnet-architect-blueprint.epub', '/ebooks/files/dotnet-architect-blueprint.pdf', '["Architecture Principles","Bounded Context Design"]'::jsonb, ARRAY['.NET','C#','Azure','Microservices','Kubernetes','PostgreSQL','Redis','Kafka','gRPC'], ARRAY['ASP.NET Core','EF Core','MediatR','Polly','FluentValidation','Serilog','OpenTelemetry']),
('solid-design-patterns-field-guide', 'SOLID & Design Patterns Field Guide', 'Maintainable Code in Enterprise Teams', 'Premium field guide', 'SOLID_DESIGN_PATTERNS', 'ADVANCED', false, false, 14999, '/ebooks/covers/solid-design-patterns-field-guide.svg', '/ebooks/files/solid-design-patterns-field-guide.pdf', '/ebooks/files/solid-design-patterns-field-guide.epub', '/ebooks/files/solid-design-patterns-field-guide.pdf', '["SOLID in Practice","Pattern Selection"]'::jsonb, ARRAY['.NET','C#','DDD','SOLID'], ARRAY['xUnit','NSubstitute','AutoMapper','FluentValidation']),
('architect-interview-playbook', 'Architect Interview Playbook', 'System Design + Leadership Rounds', 'Premium interview prep', 'INTERVIEW', 'ARCHITECT', false, false, 9999, '/ebooks/covers/architect-interview-playbook.svg', '/ebooks/files/architect-interview-playbook.pdf', '/ebooks/files/architect-interview-playbook.epub', '/ebooks/files/architect-interview-playbook.pdf', '["Interview Framework","System Design Case Studies"]'::jsonb, ARRAY['System Design','Cloud','Microservices'], ARRAY['Architecture Review Templates']),
('dotnet-interview-questions-core', '.NET Interview Questions: Core', 'High-Signal Questions + Answers', 'Free interview prep', 'INTERVIEW', 'BEGINNER', true, false, null, '/ebooks/covers/dotnet-interview-questions-core.svg', '/ebooks/files/dotnet-interview-questions-core.pdf', '/ebooks/files/dotnet-interview-questions-core.epub', '/ebooks/files/dotnet-interview-questions-core.pdf', '["Runtime & CLR","ASP.NET Core"]'::jsonb, ARRAY['.NET','C#','ASP.NET Core'], ARRAY['EF Core','LINQ']),
('microservices-interview-questions-core', 'Microservices Interview Questions: Core', 'Distributed System Interview Essentials', 'Free interview prep', 'INTERVIEW', 'INTERMEDIATE', true, false, null, '/ebooks/covers/microservices-interview-questions-core.svg', '/ebooks/files/microservices-interview-questions-core.pdf', '/ebooks/files/microservices-interview-questions-core.epub', '/ebooks/files/microservices-interview-questions-core.pdf', '["Service Boundaries","Event-Driven Systems"]'::jsonb, ARRAY['Microservices','Kafka','Docker','Kubernetes','Redis'], ARRAY['Polly','MassTransit','OpenTelemetry']),
('design-patterns-interview-questions-core', 'Design Patterns Interview Questions: Core', 'Pattern Selection Under Pressure', 'Free interview prep', 'INTERVIEW', 'INTERMEDIATE', true, false, null, '/ebooks/covers/design-patterns-interview-questions-core.svg', '/ebooks/files/design-patterns-interview-questions-core.pdf', '/ebooks/files/design-patterns-interview-questions-core.epub', '/ebooks/files/design-patterns-interview-questions-core.pdf', '["Creational","Structural","Behavioral"]'::jsonb, ARRAY['SOLID','DDD','C#'], ARRAY['Refactoring Checklist'])
on conflict (slug) do nothing;
