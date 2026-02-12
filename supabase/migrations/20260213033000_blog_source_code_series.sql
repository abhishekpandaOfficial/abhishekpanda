-- Blog metadata expansion: explicit source code URL + explicit series controls
-- Date: 2026-02-13

alter table public.blog_posts
  add column if not exists source_code_url text,
  add column if not exists series_name text,
  add column if not exists series_order integer;

alter table public.blog_posts_public_cache
  add column if not exists source_code_url text,
  add column if not exists series_name text,
  add column if not exists series_order integer;

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
    is_locked,
    source_code_url,
    series_name,
    series_order
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
    new.is_locked,
    new.source_code_url,
    new.series_name,
    new.series_order
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
    is_locked = excluded.is_locked,
    source_code_url = excluded.source_code_url,
    series_name = excluded.series_name,
    series_order = excluded.series_order;

  return new;
end;
$$;

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
  is_locked,
  source_code_url,
  series_name,
  series_order
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
  bp.is_locked,
  bp.source_code_url,
  bp.series_name,
  bp.series_order
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
  is_locked = excluded.is_locked,
  source_code_url = excluded.source_code_url,
  series_name = excluded.series_name,
  series_order = excluded.series_order;
