import { FALLBACK_SOCIAL_LINKS } from "@/constants/socialLinks";
import type { SocialProfileRow } from "@/hooks/useSocialProfiles";

export type ResolvedSocialProfile = {
  platform: string;
  display_name: string;
  category: "social" | "blog" | "platform" | "website";
  profile_url: string;
  icon_key: string;
  brand_color: string | null;
  brand_bg: string | null;
  sort_order: number;
};

function isHttpUrl(value?: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizePlatform(value?: string | null): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, "");
}

export function resolveSocialProfiles(rows?: SocialProfileRow[] | null): ResolvedSocialProfile[] {
  const remote = (rows || []).filter((r) => isHttpUrl(r.profile_url));
  const merged = new Map<string, ResolvedSocialProfile>();

  for (const fallback of FALLBACK_SOCIAL_LINKS) {
    merged.set(normalizePlatform(fallback.platform), {
      platform: fallback.platform,
      display_name: fallback.display_name,
      category: fallback.category,
      profile_url: fallback.profile_url,
      icon_key: fallback.icon_key,
      brand_color: fallback.brand_color,
      brand_bg: null,
      sort_order: fallback.sort_order,
    });
  }

  for (const row of remote) {
    const key = normalizePlatform(row.platform || row.display_name);
    if (!key || !isHttpUrl(row.profile_url)) continue;

    const base = merged.get(key);
    merged.set(key, {
      platform: key,
      display_name: row.display_name || base?.display_name || row.platform || "Profile",
      category: (row.category as ResolvedSocialProfile["category"]) || base?.category || "social",
      profile_url: row.profile_url,
      icon_key: row.icon_key || base?.icon_key || "website",
      brand_color: row.brand_color || base?.brand_color || null,
      brand_bg: row.brand_bg || null,
      sort_order: row.sort_order ?? base?.sort_order ?? 99,
    });
  }

  return Array.from(merged.values()).sort((a, b) => a.sort_order - b.sort_order || a.display_name.localeCompare(b.display_name));
}
