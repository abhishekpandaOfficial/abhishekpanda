-- Add per-post code theme selection
alter table public.blog_posts
add column if not exists code_theme text default 'github-light';

alter table public.blog_posts_public_cache
add column if not exists code_theme text;

alter table public.blog_post_versions
add column if not exists code_theme text;

-- Ensure cache sync includes code_theme
create or replace function public.sync_blog_posts_public_cache()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE') then
    delete from public.blog_posts_public_cache where id = old.id;
    return old;
  end if;

  if (new.is_published) then
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
      meta_title,
      meta_description,
      updated_at,
      content,
      section_id,
      sort_order,
      color,
      code_theme
    ) values (
      new.id,
      new.title,
      new.slug,
      new.excerpt,
      new.hero_image,
      new.tags,
      new.is_premium,
      new.is_published,
      new.published_at,
      new.meta_title,
      new.meta_description,
      new.updated_at,
      new.content,
      new.section_id,
      new.sort_order,
      new.color,
      new.code_theme
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
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      updated_at = excluded.updated_at,
      content = excluded.content,
      section_id = excluded.section_id,
      sort_order = excluded.sort_order,
      color = excluded.color,
      code_theme = excluded.code_theme;
  else
    delete from public.blog_posts_public_cache where id = new.id;
  end if;

  return new;
end;
$$;
