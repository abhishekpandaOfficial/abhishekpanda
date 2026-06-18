-- Blog sections (OneNote-style)
create table if not exists public.blog_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

alter table public.blog_sections enable row level security;

create policy "Anyone can view blog sections"
  on public.blog_sections for select
  using (true);

create policy "Admins can manage blog sections"
  on public.blog_sections for all
  using (public.has_role(auth.uid(), 'admin'));

alter table public.blog_posts
add column if not exists section_id uuid references public.blog_sections(id);

alter table public.blog_posts_public_cache
add column if not exists section_id uuid;

-- Ensure cache sync includes section_id
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
      section_id
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
      new.section_id
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
      section_id = excluded.section_id;
  else
    delete from public.blog_posts_public_cache where id = new.id;
  end if;

  return new;
end;
$$;

-- Seed default section if none
insert into public.blog_sections (name, slug, description)
values ('General', 'general', 'Default section')
on conflict (slug) do nothing;
