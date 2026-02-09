import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

type PublicProfile = {
  platform: string;
  display_name: string;
  profile_url: string | null;
  icon_key: string;
};

export const SocialLinksCard = () => {
  const { data: profiles } = usePublicSocialProfiles();
  const links = useMemo(() => {
    const rows = (profiles ?? []) as any[];
    return rows.filter((r) => r.profile_url);
  }, [profiles]);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 tracking-tight">
            Find Me <span className="gradient-text">Online</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Connect with me across platforms for insights, tutorials, and collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Glassmorphism Card */}
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/50 via-secondary/50 to-purple/50 opacity-50 blur-sm" />
            <div className="relative glass-card rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {links.map((link: PublicProfile, index: number) => {
                  const Icon: any = iconForKey(link.icon_key);
                  return (
                  <motion.a
                    key={link.platform}
                    href={link.profile_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -4 }}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/10 transition-all duration-300"
                  >
                    {/* Icon Container */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 blur-lg transition-opacity" />
                      <div className="relative w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 border border-border/50 group-hover:border-primary/30">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* Label */}
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                      {link.display_name}
                    </span>
                  </motion.a>
                )})}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
