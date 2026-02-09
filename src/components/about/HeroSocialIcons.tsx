import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

export const HeroSocialIcons = () => {
  const { data: profiles } = usePublicSocialProfiles();
  const visible = useMemo(() => {
    const rows = (profiles ?? []) as any[];
    return rows.filter((r) => r.profile_url).slice(0, 12);
  }, [profiles]);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((p: any, index: number) => {
        const Icon: any = iconForKey(p.icon_key);
        return (
          <motion.a
            key={p.platform}
            href={p.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.15, y: -2 }}
            className="group relative w-9 h-9 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all duration-300"
            title={p.display_name}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 blur transition-opacity" />
            <span className="relative">
              <Icon className="w-4 h-4" />
            </span>
          </motion.a>
        );
      })}
    </div>
  );
};
