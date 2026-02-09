import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";

type SocialLink = {
  name: string;
  url: string;
  glowRgb: string;
  hoverClass: string;
  iconSrc?: string;
  customIcon?: "stackcraft";
};

const socialLinks: SocialLink[] = [
  { name: "Stackcraft", customIcon: "stackcraft", url: "https://stackcraft.io/abhishekpanda", hoverClass: "hover:bg-black", glowRgb: "17 24 39" },
  { name: "LinkedIn", iconSrc: "/brand-logos/social/linkedin.svg", url: "https://www.linkedin.com/in/abhishekpandaofficial/", hoverClass: "hover:bg-[#0077B5]", glowRgb: "0 119 181" },
  { name: "GitHub", iconSrc: "/brand-logos/social/github.svg", url: "https://github.com/abhishekpandaOfficial", hoverClass: "hover:bg-[#181717]", glowRgb: "24 23 23" },
  { name: "YouTube", iconSrc: "/brand-logos/social/youtube.svg", url: "https://www.youtube.com/@abhishekpanda_official", hoverClass: "hover:bg-[#FF0000]", glowRgb: "255 0 0" },
  { name: "X (Twitter)", iconSrc: "/brand-logos/social/x.svg", url: "https://x.com/Panda_Abhishek8", hoverClass: "hover:bg-black", glowRgb: "0 0 0" },
  { name: "Medium", iconSrc: "/brand-logos/social/medium.svg", url: "https://medium.com/@official.abhishekpanda", hoverClass: "hover:bg-[#12100E]", glowRgb: "18 16 14" },
  { name: "Substack", iconSrc: "/brand-logos/social/substack.svg", url: "https://substack.com/@abhishekpanda08", hoverClass: "hover:bg-[#FF6719]", glowRgb: "255 103 25" },
  { name: "Hashnode", iconSrc: "/brand-logos/social/hashnode.svg", url: "https://hashnode.com/@abhishekpanda", hoverClass: "hover:bg-[#2962FF]", glowRgb: "41 98 255" },
  { name: "Stack Exchange", iconSrc: "/brand-logos/social/stackexchange.svg", url: "https://writing.stackexchange.com/users/82639/abhishek-official", hoverClass: "hover:bg-[#F48024]", glowRgb: "244 128 36" },
];

export const SocialSection = () => {
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
          <p className="text-muted-foreground">Follow my journey across platforms</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 justify-items-center gap-3 max-w-4xl mx-auto"
        >
          {socialLinks.map((social, index) => (
            <Tooltip key={social.name}>
              <TooltipTrigger asChild>
                <motion.a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  style={{ ["--brand-rgb" as string]: social.glowRgb }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className={`group glass-card brand-glow-card brand-square-glow w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${social.hoverClass} hover:shadow-glow dark:bg-slate-900/85 dark:border-slate-700/70`}
                >
                  {social.customIcon === "stackcraft" ? (
                    <StackcraftIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  ) : (
                    <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-white/80 p-1.5 flex items-center justify-center shadow-sm">
                      <img
                        src={social.iconSrc}
                        alt=""
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </span>
                  )}
                </motion.a>
              </TooltipTrigger>
              <TooltipContent>{social.name}</TooltipContent>
            </Tooltip>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
