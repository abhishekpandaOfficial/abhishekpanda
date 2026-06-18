import { useMemo, useState } from "react";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { resolveSocialProfiles } from "@/lib/social/resolveProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { useTheme } from "@/components/ThemeProvider";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const OFFICIAL_BRAND_COLORS: Record<string, string> = {
  x: "#111111",
  whatsapp: "#25d366",
  linkedin: "#0a66c2",
  instagram: "#e1306c",
  threads: "#000000",
  youtube: "#ff0000",
  github: "#181717",
  medium: "#12100e",
  substack: "#ff6719",
  hashnode: "#2962ff",
};

const DARK_THEME_VISIBLE_COLORS: Record<string, string> = {
  x: "#f5f5f5",
  threads: "#f5f5f5",
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

  // Collapsed by default — user must click to open
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (profiles.length === 0) return null;

  return (
    <>
      {/* ── Desktop: fixed right sidebar ── */}
      <aside className="pointer-events-none fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:flex items-center xl:right-0">
        {/* Toggle tab — always visible */}
        <button
          onClick={() => setDesktopOpen((v) => !v)}
          className="pointer-events-auto flex flex-col items-center justify-center gap-1 rounded-l-2xl border border-r-0 border-border/70 bg-background/88 px-1.5 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-all duration-200 hover:bg-primary/8 hover:border-primary/30"
          aria-label={desktopOpen ? "Collapse social sidebar" : "Expand social sidebar"}
          title={desktopOpen ? "Collapse" : "Social Links"}
          style={{ writingMode: "vertical-rl" }}
        >
          {desktopOpen ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {!desktopOpen && (
            <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mt-1">
              Social
            </span>
          )}
        </button>

        {/* Icons panel — slides in/out */}
        <div
          className={`pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out ${
            desktopOpen ? "w-[68px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-[68px] rounded-l-none rounded-2xl border border-l-0 border-border/70 bg-background/88 p-2.5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl">
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
        </div>
      </aside>

      {/* ── Mobile: fixed bottom bar ── */}
      <aside className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 lg:hidden">
        {/* Toggle tab — always visible, sits on top */}
        <div className="pointer-events-auto flex justify-center">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-t-xl border border-b-0 border-border/70 bg-background/92 px-4 py-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase shadow-sm backdrop-blur-xl transition-all hover:bg-primary/8 hover:text-foreground"
            aria-label={mobileOpen ? "Collapse social links" : "Expand social links"}
          >
            {mobileOpen ? (
              <>
                <ChevronDown className="h-3 w-3" />
                Hide
              </>
            ) : (
              <>
                <ChevronUp className="h-3 w-3" />
                Social
              </>
            )}
          </button>
        </div>

        {/* Icons row — slides up/down */}
        <div
          className={`pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto w-full max-w-md rounded-t-2xl border border-b-0 border-border/70 bg-background/92 p-2 shadow-[0_-16px_40px_-18px_rgba(2,6,23,0.35)] backdrop-blur-xl">
            <nav aria-label="Social profiles mobile">
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
        </div>
      </aside>
    </>
  );
};
