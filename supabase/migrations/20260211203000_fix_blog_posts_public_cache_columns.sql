-- Fix schema drift: sync_blog_posts_public_cache() writes these fields.
-- Ensure the cache table has all referenced columns to avoid publish failures.
alter table public.blog_posts_public_cache
add column if not exists content text;

alter table public.blog_posts_public_cache
add column if not exists section_id uuid;

alter table public.blog_posts_public_cache
add column if not exists sort_order integer;

alter table public.blog_posts_public_cache
add column if not exists color text;

alter table public.blog_posts_public_cache
add column if not exists code_theme text;

alter table public.blog_posts_public_cache
add column if not exists is_locked boolean;
