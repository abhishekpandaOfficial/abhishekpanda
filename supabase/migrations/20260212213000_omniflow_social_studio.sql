-- OmniFlow Social Studio: approval-first multi-platform publishing foundation
-- Date: 2026-02-12

create table if not exists public.omniflow_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  base_content text not null,
  source_type text not null default 'manual' check (source_type in ('manual','blog','course','product')),
  source_url text,
  selected_platforms text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','in_review','approved','published','rejected')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.omniflow_post_variants (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.omniflow_posts(id) on delete cascade,
  platform text not null,
  generated_content text not null,
  hashtags text[] not null default '{}',
  compressed_url text,
  seo_score integer not null default 0 check (seo_score >= 0 and seo_score <= 100),
  ai_score integer not null default 0 check (ai_score >= 0 and ai_score <= 100),
  quality_notes text[] not null default '{}',
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','regenerate_requested')),
  publish_status text not null default 'draft' check (publish_status in ('draft','ready','published','failed')),
  preview_payload jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  unique(post_id, platform)
);

create table if not exists public.omniflow_publish_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.omniflow_posts(id) on delete cascade,
  variant_id uuid references public.omniflow_post_variants(id) on delete set null,
  platform text not null,
  status text not null check (status in ('queued','published','failed')),
  request_payload jsonb,
  response_payload jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_omniflow_posts_status_created_at on public.omniflow_posts(status, created_at desc);
create index if not exists idx_omniflow_variants_post_platform on public.omniflow_post_variants(post_id, platform);
create index if not exists idx_omniflow_variants_approval_publish on public.omniflow_post_variants(approval_status, publish_status);
create index if not exists idx_omniflow_logs_post_created_at on public.omniflow_publish_logs(post_id, created_at desc);

alter table public.omniflow_posts enable row level security;
alter table public.omniflow_post_variants enable row level security;
alter table public.omniflow_publish_logs enable row level security;

drop policy if exists "Admins can manage omniflow posts" on public.omniflow_posts;
create policy "Admins can manage omniflow posts"
  on public.omniflow_posts for all
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage omniflow post variants" on public.omniflow_post_variants;
create policy "Admins can manage omniflow post variants"
  on public.omniflow_post_variants for all
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage omniflow publish logs" on public.omniflow_publish_logs;
create policy "Admins can manage omniflow publish logs"
  on public.omniflow_publish_logs for all
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_omniflow_posts_updated_at on public.omniflow_posts;
create trigger trg_omniflow_posts_updated_at
before update on public.omniflow_posts
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_omniflow_post_variants_updated_at on public.omniflow_post_variants;
create trigger trg_omniflow_post_variants_updated_at
before update on public.omniflow_post_variants
for each row execute function public.update_updated_at_column();
