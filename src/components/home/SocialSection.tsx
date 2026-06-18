import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

export const SocialSection = () => {
  const { data: profiles = [] } = usePublicSocialProfiles();
  const visible = profiles.filter((p) => p.profile_url).slice(0, 12);

  if (visible.length === 0) return null;

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Connect with me</h2>
          <p className="text-muted-foreground">Live profile links synced from CMS Studio</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 justify-items-center gap-3 max-w-4xl mx-auto"
        >
          {visible.map((profile, index) => {
            const Icon: any = iconForKey(profile.icon_key);
            return (
              <Tooltip key={profile.platform}>
                <TooltipTrigger asChild>
                  <motion.a
                    href={profile.profile_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={profile.display_name}
                    title={profile.display_name}
                    style={{ ["--brand-rgb" as string]: "37 99 235" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="group glass-card brand-glow-card brand-square-glow w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:shadow-glow dark:bg-slate-900/85 dark:border-slate-700/70"
                  >
                    <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-white/80 p-1.5 flex items-center justify-center shadow-sm text-slate-700">
                      <Icon className="w-full h-full" />
                    </span>
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent>{profile.display_name}</TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
