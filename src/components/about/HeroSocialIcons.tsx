import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { cn } from "@/lib/utils";
import type { SocialProfileRow } from "@/hooks/useSocialProfiles";
import { resolveSocialProfiles, type ResolvedSocialProfile } from "@/lib/social/resolveProfiles";
import { useTheme } from "@/components/ThemeProvider";

type HeroSocialIconsProps = {
  profiles?: Array<SocialProfileRow | ResolvedSocialProfile>;
  className?: string;
};

const OFFICIAL_BRAND_COLORS: Record<string, string> = {
  x: "#111111",
  linkedin: "#0a66c2",
  instagram: "#e1306c",
  youtube: "#ff0000",
  github: "#181717",
  medium: "#12100e",
  substack: "#ff6719",
  hashnode: "#2962ff",
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");

export const HeroSocialIcons = ({ profiles: providedProfiles, className }: HeroSocialIconsProps) => {
  const { data: queriedProfiles } = usePublicSocialProfiles();
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const visible = useMemo(() => {
    const rows = (providedProfiles ?? queriedProfiles ?? []) as SocialProfileRow[];
    return resolveSocialProfiles(rows);
  }, [providedProfiles, queriedProfiles]);

  const resolvedIconColor = (platform: string, brandColor?: string | null) => {
    const effectiveColor = OFFICIAL_BRAND_COLORS[normalize(platform)] || brandColor;
    if (!effectiveColor) return "hsl(var(--foreground))";
    const color = effectiveColor.toLowerCase();
    if (theme === "dark" && isVeryDark(color)) return "#e2e8f0";
    if (theme === "light" && isVeryLight(color)) return "#0f172a";
    return color;
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-2.5 sm:gap-3", className)}>
      {visible.map((p, index: number) => {
        const Icon: any = iconForKey(p.icon_key);
        const iconColor = resolvedIconColor(p.platform, p.brand_color);
        const distance = hoveredIndex === null ? 99 : Math.abs(hoveredIndex - index);
        const scale = hoveredIndex === null ? 1 : distance === 0 ? 1.42 : distance === 1 ? 1.2 : distance === 2 ? 1.09 : 1;
        const y = hoveredIndex === null ? 0 : distance === 0 ? -16 : distance === 1 ? -9 : distance === 2 ? -4 : 0;
        const blur = hoveredIndex !== null && distance > 2 ? "blur(0.7px)" : "blur(0px)";
        const skewX = hoveredIndex === null ? 0 : distance === 0 ? -2 : distance === 1 ? -1 : 0;

        return (
          <Tooltip key={p.platform}>
            <TooltipTrigger asChild>
              <motion.a
                href={p.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.display_name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                style={{
                  scale,
                  y,
                  x: hoveredIndex === null ? 0 : hoveredIndex > index ? -2 : hoveredIndex < index ? 2 : 0,
                  skewX,
                  filter: blur,
                  zIndex: hoveredIndex === null ? 1 : Math.max(1, 10 - distance),
                }}
                whileHover={{ rotateX: -10, rotateY: 10 }}
                className="group relative flex h-12 w-12 origin-bottom items-center justify-center rounded-[1.15rem] border border-white/55 bg-white/65 backdrop-blur-lg shadow-[0_10px_24px_rgba(15,23,42,0.13)] transition-[box-shadow,border-color,background-color] duration-300 hover:shadow-[0_26px_60px_-20px_rgba(59,130,246,0.58)] sm:h-14 sm:w-14 dark:border-white/20 dark:bg-slate-900/65 dark:shadow-[0_10px_28px_rgba(2,6,23,0.58)]"
                title={p.display_name}
              >
                <span className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 opacity-70 transition-opacity group-hover:opacity-100" />
                <span className="absolute inset-x-[15%] -bottom-1 h-3 rounded-full bg-sky-500/20 blur-md transition-all duration-300 group-hover:bg-sky-500/40 group-hover:blur-lg" />
                <span className="absolute -bottom-5 left-1/2 h-4 w-[76%] -translate-x-1/2 rounded-full bg-slate-950/12 blur-lg transition-all duration-300 group-hover:w-[88%] group-hover:bg-slate-950/20 dark:bg-black/45 dark:group-hover:bg-black/60" />
                <motion.span
                  className="relative flex items-center justify-center"
                  animate={hoveredIndex === index ? { scale: 1.2, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                >
                  <Icon className="relative h-5 w-5 sm:h-6 sm:w-6" style={{ color: iconColor }} />
                </motion.span>
              </motion.a>
            </TooltipTrigger>
            <TooltipContent>{p.display_name}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

function isVeryDark(color: string): boolean {
  const hex = normalizeHex(color);
  if (!hex) return false;
  const [r, g, b] = hexToRgb(hex);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 58;
}

function isVeryLight(color: string): boolean {
  const hex = normalizeHex(color);
  if (!hex) return false;
  const [r, g, b] = hexToRgb(hex);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 225;
}

function normalizeHex(color: string): string | null {
  const value = color.trim();
  if (!value.startsWith("#")) return null;
  if (value.length === 4) {
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (value.length === 7) return value.toLowerCase();
  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}
