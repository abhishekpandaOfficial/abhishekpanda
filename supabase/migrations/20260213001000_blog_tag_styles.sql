-- Blog tag styles: admin-managed per-tag colors for public UI
-- Date: 2026-02-13

create table if not exists public.blog_tag_styles (
  tag text primary key,
  bg_color text not null default '#EEF2FF',
  text_color text not null default '#3730A3',
  border_color text not null default '#C7D2FE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_tag_styles enable row level security;

drop policy if exists "Public can read blog tag styles" on public.blog_tag_styles;
create policy "Public can read blog tag styles"
  on public.blog_tag_styles for select
  using (true);

drop policy if exists "Admins can manage blog tag styles" on public.blog_tag_styles;
create policy "Admins can manage blog tag styles"
  on public.blog_tag_styles for all
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_blog_tag_styles_updated_at on public.blog_tag_styles;
create trigger update_blog_tag_styles_updated_at
before update on public.blog_tag_styles
for each row execute function public.update_updated_at_column();

