-- LLM Galaxy: Google News based daily AI/LLM feed + local company logos.

create table if not exists public.llm_news_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  article_url text not null,
  source_name text not null,
  source_url text,
  source_domain text,
  source_logo_url text,
  published_at timestamptz not null,
  tags text[] default '{}'::text[],
  is_active boolean not null default true,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_url)
);

create index if not exists idx_llm_news_updates_published_at on public.llm_news_updates (published_at desc);
create index if not exists idx_llm_news_updates_source_name on public.llm_news_updates (source_name);

alter table public.llm_news_updates enable row level security;

drop policy if exists "Public can read llm news" on public.llm_news_updates;
create policy "Public can read llm news"
  on public.llm_news_updates
  for select
  using (is_active = true);

grant select on table public.llm_news_updates to anon;
grant select on table public.llm_news_updates to authenticated;

-- Keep updated_at fresh.
drop trigger if exists update_llm_news_updates_updated_at on public.llm_news_updates;
create trigger update_llm_news_updates_updated_at
before update on public.llm_news_updates
for each row execute function public.update_updated_at_column();

-- Seed with one safe placeholder row (replaced automatically on first scrape).
insert into public.llm_news_updates (
  title,
  summary,
  article_url,
  source_name,
  source_url,
  source_domain,
  source_logo_url,
  published_at,
  tags,
  is_active,
  scraped_at
)
values (
  'Google News AI/LLM feed initialized',
  'Daily ingestion is active. Fresh stories will be available after the next sync run.',
  'https://news.google.com/',
  'Google News',
  'https://news.google.com/',
  'news.google.com',
  '/llm-logos/news.svg',
  now(),
  array['AI','LLM'],
  true,
  now()
)
on conflict (article_url) do nothing;

-- Add a daily scheduled job entry for news refresh via edge function.
update public.scheduled_jobs
set
  description = 'Scrape latest AI/LLM headlines from Google News RSS and refresh llm_news_updates table.',
  schedule = '0 6 * * *',
  schedule_description = 'Every day at 06:00 UTC',
  job_type = 'edge_function',
  edge_function_name = 'refresh-ai-news',
  payload = jsonb_build_object('max_items', 40),
  is_active = true,
  updated_at = now()
where name = 'Daily AI News Refresh';

insert into public.scheduled_jobs (
  name,
  description,
  schedule,
  schedule_description,
  job_type,
  edge_function_name,
  payload,
  is_active
)
select
  'Daily AI News Refresh',
  'Scrape latest AI/LLM headlines from Google News RSS and refresh llm_news_updates table.',
  '0 6 * * *',
  'Every day at 06:00 UTC',
  'edge_function',
  'refresh-ai-news',
  jsonb_build_object('max_items', 40),
  true
where not exists (
  select 1 from public.scheduled_jobs where name = 'Daily AI News Refresh'
);

-- Replace remote logo URLs with downloaded local icons for better rendering reliability.
update public.llm_models set logo = '/llm-logos/openai.png' where lower(company) like '%openai%';
update public.llm_models set logo = '/llm-logos/anthropic.png' where lower(company) like '%anthropic%';
update public.llm_models set logo = '/llm-logos/google.png' where lower(company) like '%google%';
update public.llm_models set logo = '/llm-logos/meta.png' where lower(company) like '%meta%';
update public.llm_models set logo = '/llm-logos/deepseek.png' where lower(company) like '%deepseek%';
update public.llm_models set logo = '/llm-logos/mistral.png' where lower(company) like '%mistral%';
update public.llm_models set logo = '/llm-logos/microsoft.png' where lower(company) like '%microsoft%';
update public.llm_models set logo = '/llm-logos/xai.png' where lower(company) like '%xai%' or lower(company) = 'x.ai';
update public.llm_models set logo = '/llm-logos/nvidia.png' where lower(company) like '%nvidia%';
update public.llm_models set logo = '/llm-logos/moonshot.png' where lower(company) like '%moonshot%';
update public.llm_models set logo = '/llm-logos/qwen.png' where lower(company) like '%qwen%';
update public.llm_models set logo = '/llm-logos/huggingface.png' where lower(company) like '%hugging face%';
