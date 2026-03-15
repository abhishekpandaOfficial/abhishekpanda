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

export const HeroSocialIcons = ({ profiles: providedProfiles, className }: HeroSocialIconsProps) => {
  const { data: queriedProfiles } = usePublicSocialProfiles();
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const visible = useMemo(() => {
    const rows = (providedProfiles ?? queriedProfiles ?? []) as SocialProfileRow[];
    return resolveSocialProfiles(rows);
  }, [providedProfiles, queriedProfiles]);

  const resolvedIconColor = (brandColor?: string | null) => {
    if (!brandColor) return "hsl(var(--foreground))";
    if (theme === "dark" && isVeryDark(brandColor)) return "#e2e8f0";
    if (theme === "light" && isVeryLight(brandColor)) return "#0f172a";
    return brandColor;
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-2.5 sm:gap-3", className)}>
      {visible.map((p, index: number) => {
        const Icon: any = iconForKey(p.icon_key);
        const iconColor = resolvedIconColor(p.brand_color);
        const distance = hoveredIndex === null ? 99 : Math.abs(hoveredIndex - index);
        const scale = hoveredIndex === null ? 1 : distance === 0 ? 1.28 : distance === 1 ? 1.14 : distance === 2 ? 1.06 : 1;
        const y = hoveredIndex === null ? 0 : distance === 0 ? -12 : distance === 1 ? -7 : distance === 2 ? -3 : 0;
        const blur = hoveredIndex !== null && distance > 2 ? "blur(0.5px)" : "blur(0px)";

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
                  filter: blur,
                  zIndex: hoveredIndex === null ? 1 : Math.max(1, 10 - distance),
                }}
                whileHover={{ rotateX: -8, rotateY: 6 }}
                className="group relative flex h-12 w-12 origin-bottom items-center justify-center rounded-[1.15rem] border border-white/55 bg-white/65 backdrop-blur-lg shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-[box-shadow,border-color] duration-300 hover:shadow-[0_20px_45px_-18px_rgba(59,130,246,0.55)] sm:h-14 sm:w-14 dark:border-white/20 dark:bg-slate-900/65 dark:shadow-[0_8px_22px_rgba(2,6,23,0.55)]"
                title={p.display_name}
              >
                <span className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 opacity-70 transition-opacity group-hover:opacity-100" />
                <span className="absolute inset-x-[18%] bottom-1 h-2 rounded-full bg-sky-500/20 blur-md transition-all duration-300 group-hover:bg-sky-500/35" />
                <motion.span
                  className="relative flex items-center justify-center"
                  animate={hoveredIndex === index ? { scale: 1.18 } : { scale: 1 }}
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
