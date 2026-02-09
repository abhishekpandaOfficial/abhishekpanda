-- Social profiles configuration used across public site and admin panel.

create table if not exists public.social_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- stable unique platform key, e.g. 'x', 'linkedin', 'stackcraft'
  platform text not null unique,
  display_name text not null,
  category text not null default 'social' check (category in ('social','blog','platform','website')),

  username text,
  profile_url text,
  icon_key text not null, -- used by frontend icon mapping
  brand_color text,       -- css color (optional)
  brand_bg text,          -- css background utility (optional)
  description text,

  followers integer not null default 0,
  connected boolean not null default true,
  is_visible boolean not null default true,
  sort_order integer not null default 0,

  -- non-secret metadata only; if you need real secrets, store them in Supabase Edge Function secrets.
  credential_hints jsonb
);

create index if not exists social_profiles_category_sort_idx
  on public.social_profiles(category, sort_order, display_name);

alter table public.social_profiles enable row level security;

drop policy if exists "Public can view visible social profiles" on public.social_profiles;
create policy "Public can view visible social profiles"
on public.social_profiles
for select
using (is_visible = true);

drop policy if exists "Admins can manage social profiles" on public.social_profiles;
create policy "Admins can manage social profiles"
on public.social_profiles
for all
using (has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_social_profiles_updated_at on public.social_profiles;
create trigger trg_social_profiles_updated_at
before update on public.social_profiles
for each row
execute procedure public.set_updated_at();

-- Seed defaults (idempotent).
insert into public.social_profiles (platform, display_name, category, username, profile_url, icon_key, brand_color, brand_bg, description, sort_order, connected, is_visible)
values
  ('instagram', 'Instagram', 'social', 'the_abhishekpanda', 'https://www.instagram.com/the_abhishekpanda/', 'instagram', '#E4405F', 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]', 'Photo & Reels content', 10, true, true),
  ('facebook', 'Facebook', 'social', null, null, 'facebook', '#1877F2', 'bg-[#1877F2]', 'Facebook page', 15, false, false),
  ('youtube', 'YouTube', 'social', 'abhishekpanda_official', 'https://www.youtube.com/@abhishekpanda_official', 'youtube', '#FF0000', 'bg-[#FF0000]', 'Video tutorials & content', 20, true, true),
  ('linkedin', 'LinkedIn', 'social', 'abhishekpandaofficial', 'https://www.linkedin.com/in/abhishekpandaofficial/', 'linkedin', '#0A66C2', 'bg-[#0A66C2]', 'Professional network', 30, true, true),
  ('github', 'GitHub', 'social', 'abhishekpandaOfficial', 'https://github.com/abhishekpandaOfficial', 'github', '#111827', 'bg-[#333]', 'Open source & code', 40, true, true),
  ('x', 'X (Twitter)', 'social', 'Panda_Abhishek8', 'https://x.com/Panda_Abhishek8', 'x', '#000000', 'bg-black', 'Tweets & threads', 50, true, true),

  ('stackcraft', 'Stackcraft', 'blog', 'abhishekpanda', 'https://stackcraft.io/abhishekpanda', 'stackcraft', '#111827', 'bg-black', 'Main engineering blog (OriginX Labs)', 60, true, true),
  ('medium', 'Medium', 'blog', 'official.abhishekpanda', 'https://medium.com/@official.abhishekpanda', 'medium', '#00AB6C', 'bg-black', 'Blog articles', 70, true, true),
  ('substack', 'Substack', 'blog', 'abhishekpanda08', 'https://substack.com/@abhishekpanda08', 'substack', '#FF6719', 'bg-[#FF6719]', 'Newsletter', 80, true, true),
  ('hashnode', 'Hashnode', 'blog', 'abhishekpanda', 'https://hashnode.com/@abhishekpanda', 'hashnode', '#2962FF', 'bg-[#2962FF]', 'Developer blog', 90, true, true),

  ('stackexchange', 'Stack Exchange', 'platform', 'abhishek-official', 'https://writing.stackexchange.com/users/82639/abhishek-official', 'stackexchange', '#F48024', 'bg-[#F48024]', 'Writing StackExchange profile', 100, true, true),
  ('website', 'Website', 'website', 'abhishekpanda.com', 'https://www.abhishekpanda.com', 'website', '#10B981', 'bg-primary', 'Personal website', 110, true, true)
on conflict (platform) do update
set
  display_name = excluded.display_name,
  category = excluded.category,
  username = excluded.username,
  profile_url = excluded.profile_url,
  icon_key = excluded.icon_key,
  brand_color = excluded.brand_color,
  brand_bg = excluded.brand_bg,
  description = excluded.description,
  sort_order = excluded.sort_order,
  connected = excluded.connected,
  is_visible = excluded.is_visible;

