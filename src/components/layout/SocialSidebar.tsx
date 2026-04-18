import { useMemo } from "react";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { resolveSocialProfiles } from "@/lib/social/resolveProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { useTheme } from "@/components/ThemeProvider";

const OFFICIAL_BRAND_COLORS: Record<string, string> = {
  x: "#111111",
  whatsapp: "#25d366",
  linkedin: "#0a66c2",
  instagram: "#e1306c",
  youtube: "#ff0000",
  github: "#181717",
  medium: "#12100e",
  substack: "#ff6719",
  hashnode: "#2962ff",
};

const DARK_THEME_VISIBLE_COLORS: Record<string, string> = {
  x: "#f5f5f5",
  whatsapp: "#25d366",
  github: "#f0f6fc",
  medium: "#fafafa",
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");
const colorForProfile = (theme: string, platform: string, fallback?: string | null) => {
  const key = normalize(platform);
  if (theme === "dark" && DARK_THEME_VISIBLE_COLORS[key]) return DARK_THEME_VISIBLE_COLORS[key];
  return OFFICIAL_BRAND_COLORS[key] || fallback || "hsl(var(--foreground))";
};

export const SocialSidebar = () => {
  const { data } = usePublicSocialProfiles();
  const { theme } = useTheme();
  const profiles = useMemo(() => resolveSocialProfiles(data), [data]);

  if (profiles.length === 0) return null;

  return (
    <>
      <aside className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-4">
        <div className="pointer-events-auto w-[68px] rounded-2xl border border-border/70 bg-background/88 p-2.5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <nav aria-label="Social profiles" className="space-y-2">
            {profiles.map((profile) => {
              const Icon = iconForKey(profile.icon_key);
              const iconColor = colorForProfile(theme, profile.platform, profile.brand_color);

              return (
                <a
                  key={profile.platform}
                  href={profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center rounded-xl border border-transparent px-2 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/8 hover:shadow-[0_14px_24px_-18px_rgba(59,130,246,0.55)]"
                  aria-label={profile.display_name}
                  title={profile.display_name}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/90 shadow-sm transition group-hover:border-primary/30">
                    <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      <aside className="pointer-events-none fixed bottom-3 left-0 right-0 z-50 px-3 lg:hidden">
        <div className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl border border-border/70 bg-background/92 p-2 shadow-[0_16px_40px_-18px_rgba(2,6,23,0.75)] backdrop-blur-xl">
          <nav aria-label="Social profiles mobile" className="overflow-hidden transition-all duration-300 max-h-40 opacity-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {profiles.map((profile) => {
                const Icon = iconForKey(profile.icon_key);
                const iconColor = colorForProfile(theme, profile.platform, profile.brand_color);
                return (
                  <a
                    key={`m-${profile.platform}`}
                    href={profile.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/85"
                    aria-label={profile.display_name}
                    title={profile.display_name}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};
