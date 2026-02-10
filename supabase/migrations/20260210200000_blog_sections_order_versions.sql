-- Add ordering for sections and pages
alter table public.blog_sections
add column if not exists sort_order integer not null default 0;
alter table public.blog_sections
add column if not exists color text default '#2563eb';

alter table public.blog_posts
add column if not exists sort_order integer not null default 0;
alter table public.blog_posts
add column if not exists color text;

alter table public.blog_posts_public_cache
add column if not exists sort_order integer;

-- Blog post version history
create table if not exists public.blog_post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.blog_posts(id) on delete cascade,
  title text,
  excerpt text,
  content text,
  hero_image text,
  tags text[],
  meta_title text,
  meta_description text,
  section_id uuid,
  color text,
  created_at timestamptz not null default now()
);

alter table public.blog_post_versions enable row level security;

create policy "Admins can manage blog post versions"
  on public.blog_post_versions for all
  using (public.has_role(auth.uid(), 'admin'));

-- Ensure cache sync includes sort_order
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
      color
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
      new.color
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
      color = excluded.color;
  else
    delete from public.blog_posts_public_cache where id = new.id;
  end if;

  return new;
end;
$$;
