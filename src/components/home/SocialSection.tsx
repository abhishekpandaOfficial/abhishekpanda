import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

export const SocialSection = () => {
  const { data: profiles } = usePublicSocialProfiles();
  const links = useMemo(() => {
    const rows = (profiles ?? []) as any[];
    return rows.filter((r) => r.profile_url);
  }, [profiles]);

  return (
    <section className="py-10 md:py-12 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Connect with me
          </h2>
          <p className="text-muted-foreground">
            Follow my journey across platforms
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {links.map((social: any, index: number) => {
            const Icon: any = iconForKey(social.icon_key);
            const bgClass = social.brand_bg || "bg-muted";
            return (
            <motion.a
              key={social.platform}
              href={social.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className={`group glass-card w-14 h-14 md:w-18 md:h-18 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${bgClass} hover:text-primary-foreground hover:shadow-glow`}
            >
              <Icon className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[10px] md:text-xs font-medium opacity-70 group-hover:opacity-100">
                {social.display_name}
              </span>
            </motion.a>
          )})}
        </motion.div>
      </div>
    </section>
  );
};
