-- Blog parity: metadata hardening + pending CMS tasks
-- Date: 2026-02-12

-- 1) Blog metadata fields
alter table public.blog_posts
  add column if not exists level text,
  add column if not exists original_published_at timestamptz;

alter table public.blog_posts
  drop constraint if exists blog_posts_level_check;

alter table public.blog_posts
  add constraint blog_posts_level_check
  check (level is null or level in ('beginner', 'fundamentals', 'intermediate', 'general', 'architect'));

update public.blog_posts
set original_published_at = coalesce(original_published_at, published_at)
where published_at is not null;

alter table public.blog_posts_public_cache
  add column if not exists level text,
  add column if not exists original_published_at timestamptz,
  add column if not exists views integer not null default 0;

-- 2) Pending CMS tasks for blogs
create table if not exists public.blog_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  related_post_id uuid references public.blog_posts(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_tasks enable row level security;

drop policy if exists "Admins can manage blog tasks" on public.blog_tasks;
create policy "Admins can manage blog tasks"
  on public.blog_tasks for all
  using (public.has_role(auth.uid(), 'admin'));

create index if not exists idx_blog_tasks_status_priority on public.blog_tasks(status, priority);
create index if not exists idx_blog_tasks_related_post_id on public.blog_tasks(related_post_id);

drop trigger if exists update_blog_tasks_updated_at on public.blog_tasks;
create trigger update_blog_tasks_updated_at
before update on public.blog_tasks
for each row execute function public.update_updated_at_column();

-- 3) Keep cache table in sync with all public-facing metadata
create or replace function public.sync_blog_posts_public_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wc integer;
  rt integer;
begin
  if (tg_op = 'DELETE') then
    delete from public.blog_posts_public_cache where id = old.id;
    return old;
  end if;

  if coalesce(new.is_published, false) = false then
    delete from public.blog_posts_public_cache where id = new.id;
    return new;
  end if;

  wc := case
    when btrim(coalesce(new.content, '')) = '' then 0
    else coalesce(array_length(regexp_split_to_array(btrim(new.content), '\\s+'), 1), 0)
  end;
  rt := ceil(wc / 200.0);

  insert into public.blog_posts_public_cache (
    id,
    title,
    slug,
    excerpt,
    hero_image,
    tags,
    is_premium,
    is_published,
    published_at,
    original_published_at,
    level,
    meta_title,
    meta_description,
    word_count,
    reading_time_minutes,
    views,
    created_at,
    updated_at,
    content,
    section_id,
    sort_order,
    color,
    code_theme,
    is_locked
  ) values (
    new.id,
    new.title,
    new.slug,
    new.excerpt,
    new.hero_image,
    new.tags,
    coalesce(new.is_premium, false),
    coalesce(new.is_published, false),
    new.published_at,
    coalesce(new.original_published_at, new.published_at),
    new.level,
    new.meta_title,
    new.meta_description,
    wc,
    rt,
    coalesce(new.views, 0),
    new.created_at,
    new.updated_at,
    new.content,
    new.section_id,
    new.sort_order,
    new.color,
    new.code_theme,
    new.is_locked
  )
  on conflict (id) do update set
    title = excluded.title,
    slug = excluded.slug,
    excerpt = excluded.excerpt,
    hero_image = excluded.hero_image,
    tags = excluded.tags,
    is_premium = excluded.is_premium,
    is_published = excluded.is_published,
    published_at = excluded.published_at,
    original_published_at = excluded.original_published_at,
    level = excluded.level,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    word_count = excluded.word_count,
    reading_time_minutes = excluded.reading_time_minutes,
    views = excluded.views,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at,
    content = excluded.content,
    section_id = excluded.section_id,
    sort_order = excluded.sort_order,
    color = excluded.color,
    code_theme = excluded.code_theme,
    is_locked = excluded.is_locked;

  return new;
end;
$$;

-- Backfill/refresh cache rows from canonical table
insert into public.blog_posts_public_cache (
  id,
  title,
  slug,
  excerpt,
  hero_image,
  tags,
  is_premium,
  is_published,
  published_at,
  original_published_at,
  level,
  meta_title,
  meta_description,
  word_count,
  reading_time_minutes,
  views,
  created_at,
  updated_at,
  content,
  section_id,
  sort_order,
  color,
  code_theme,
  is_locked
)
select
  bp.id,
  bp.title,
  bp.slug,
  bp.excerpt,
  bp.hero_image,
  bp.tags,
  coalesce(bp.is_premium, false),
  coalesce(bp.is_published, false),
  bp.published_at,
  coalesce(bp.original_published_at, bp.published_at),
  bp.level,
  bp.meta_title,
  bp.meta_description,
  case
    when btrim(coalesce(bp.content, '')) = '' then 0
    else coalesce(array_length(regexp_split_to_array(btrim(bp.content), '\\s+'), 1), 0)
  end as word_count,
  ceil(
    case
      when btrim(coalesce(bp.content, '')) = '' then 0
      else coalesce(array_length(regexp_split_to_array(btrim(bp.content), '\\s+'), 1), 0)
    end / 200.0
  )::int as reading_time_minutes,
  coalesce(bp.views, 0),
  bp.created_at,
  bp.updated_at,
  bp.content,
  bp.section_id,
  bp.sort_order,
  bp.color,
  bp.code_theme,
  bp.is_locked
from public.blog_posts bp
where coalesce(bp.is_published, false) = true
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  hero_image = excluded.hero_image,
  tags = excluded.tags,
  is_premium = excluded.is_premium,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  original_published_at = excluded.original_published_at,
  level = excluded.level,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  word_count = excluded.word_count,
  reading_time_minutes = excluded.reading_time_minutes,
  views = excluded.views,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  content = excluded.content,
  section_id = excluded.section_id,
  sort_order = excluded.sort_order,
  color = excluded.color,
  code_theme = excluded.code_theme,
  is_locked = excluded.is_locked;

-- 4) Seed initial pending tasks (idempotent by title)
insert into public.blog_tasks (title, description, status, priority)
select * from (
  values
    (
      'Refine Stackcraft tracks content system',
      'Move Stackcraft/blog strategy into CMS-managed backlog and align landing copy hierarchy.',
      'pending',
      'high'
    ),
    (
      'Polish blog listing cards metadata',
      'Ensure level, published/updated dates, views, and read-time are consistently visible on cards.',
      'pending',
      'high'
    ),
    (
      'Publish flow QA for preview -> publish',
      'Validate CMS preview/publish path and cache sync for metadata, tags, and visibility.',
      'pending',
      'medium'
    )
) as seed(title, description, status, priority)
where not exists (
  select 1 from public.blog_tasks t where t.title = seed.title
);
