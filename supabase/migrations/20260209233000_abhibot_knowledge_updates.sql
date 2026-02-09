-- ABHIBOT knowledge base + OriginX latest updates feed.

create table if not exists public.site_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  summary text not null,
  route text,
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.originx_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  url text,
  tag text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_site_knowledge_title_unique on public.site_knowledge_base (title);
create unique index if not exists idx_originx_updates_title_unique on public.originx_updates (title);
create index if not exists idx_originx_updates_published_at on public.originx_updates (published_at desc);

alter table public.site_knowledge_base enable row level security;
alter table public.originx_updates enable row level security;

drop policy if exists "Public can read site knowledge base" on public.site_knowledge_base;
create policy "Public can read site knowledge base"
  on public.site_knowledge_base
  for select
  using (true);

drop policy if exists "Public can read published originx updates" on public.originx_updates;
create policy "Public can read published originx updates"
  on public.originx_updates
  for select
  using (is_published = true);

insert into public.site_knowledge_base (category, title, summary, route, priority)
values
  ('website', 'OriginX Website Overview', 'Official portal for OriginX Labs ecosystem: products, academy, mentorship, blogs, and enterprise collaboration.', '/', 100),
  ('chronyx', 'CHRONYX', 'Personal system of record for planning, notes, finance tracking, and life management workflows.', '/chronyx', 98),
  ('llm-galaxy', 'LLM Galaxy', 'Database-backed map for model families, benchmarks, trend signals, and use-case guidance.', '/llm-galaxy', 98),
  ('academy', 'Academy', 'Learning catalog with architecture, AI, and engineering tracks curated by Abhishek Panda.', '/academy', 85),
  ('contact', 'Contact & Mentorship', 'Direct contact, mentorship booking, and strategic collaboration workflow.', '/contact', 82)
on conflict (title) do update
set
  category = excluded.category,
  summary = excluded.summary,
  route = excluded.route,
  priority = excluded.priority,
  updated_at = now();

insert into public.originx_updates (title, summary, url, tag, is_published, published_at)
values
  ('CHRONYX visual refresh and guided experience release', 'CHRONYX branding and navigation were upgraded for high-visibility discovery across the website.', '/chronyx', 'Product', true, '2026-02-09T18:00:00Z'),
  ('ABHIBOT assistant launched on landing experience', 'ABHIBOT now provides fast context on products, pages, and latest OriginX updates using database-backed knowledge.', '/', 'Platform', true, '2026-02-09T19:00:00Z'),
  ('LLM Galaxy data stack expanded for February 2026 families', 'Latest model-family updates are integrated across Galaxy UI for benchmarks, trends, and discovery.', '/llm-galaxy', 'AI', true, '2026-02-09T20:00:00Z')
on conflict (title) do update
set
  summary = excluded.summary,
  url = excluded.url,
  tag = excluded.tag,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  updated_at = now();
