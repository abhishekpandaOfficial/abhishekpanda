-- OmniFlow Social: seed additional core platform profiles for staged integrations
-- Date: 2026-02-13

insert into public.social_profiles (
  platform,
  display_name,
  category,
  username,
  profile_url,
  icon_key,
  brand_color,
  brand_bg,
  description,
  sort_order,
  connected,
  is_visible
)
values
  ('threads', 'Threads', 'social', null, null, 'threads', '#000000', 'bg-black', 'Short-form conversations and threads', 55, false, false),
  ('reddit', 'Reddit', 'social', null, null, 'reddit', '#FF4500', 'bg-[#FF4500]', 'Community discussions and deep-dive posts', 58, false, false),
  ('telegram', 'Telegram', 'social', null, null, 'telegram', '#229ED9', 'bg-[#229ED9]', 'Broadcast channel and community updates', 60, false, false),
  ('discord', 'Discord', 'social', null, null, 'discord', '#5865F2', 'bg-[#5865F2]', 'Community server announcements and chats', 62, false, false),
  ('tiktok', 'TikTok', 'social', null, null, 'tiktok', '#000000', 'bg-black', 'Short-form vertical video promotion', 64, false, false),
  ('pinterest', 'Pinterest', 'social', null, null, 'pinterest', '#E60023', 'bg-[#E60023]', 'Visual content discovery and growth', 66, false, false)
on conflict (platform) do update
set
  display_name = excluded.display_name,
  category = excluded.category,
  icon_key = excluded.icon_key,
  brand_color = excluded.brand_color,
  brand_bg = excluded.brand_bg,
  description = excluded.description,
  sort_order = excluded.sort_order;
