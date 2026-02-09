import { motion } from "framer-motion";
import {
  Youtube,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const socialLinks = [
  // Order requested: Stackcraft, LinkedIn, GitHub, YouTube, then others.
  { name: "Stackcraft", icon: StackcraftIcon, url: "https://stackcraft.io/abhishekpanda", color: "hover:bg-black", glowRgb: "17 24 39" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpandaofficial/", color: "hover:bg-[#0077B5]", glowRgb: "0 119 181" },
  { name: "GitHub", icon: Github, url: "https://github.com/abhishekpandaOfficial", color: "hover:bg-[#333]", glowRgb: "51 51 51" },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@abhishekpanda_official", color: "hover:bg-[#FF0000]", glowRgb: "255 0 0" },
  { name: "X (Twitter)", icon: Twitter, url: "https://x.com/Panda_Abhishek8", color: "hover:bg-[#000]", glowRgb: "0 0 0" },
  { name: "Medium", icon: BookOpen, url: "https://medium.com/@official.abhishekpanda", color: "hover:bg-[#000]", glowRgb: "0 0 0" },
  { name: "Substack", icon: Layers, url: "https://substack.com/@abhishekpanda08", color: "hover:bg-[#FF6719]", glowRgb: "255 103 25" },
  { name: "Hashnode", icon: ExternalLink, url: "https://hashnode.com/@abhishekpanda", color: "hover:bg-[#2962FF]", glowRgb: "41 98 255" },
  { name: "Stack Exchange", icon: Layers, url: "https://writing.stackexchange.com/users/82639/abhishek-official", color: "hover:bg-[#F48024]", glowRgb: "244 128 36" },
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
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 justify-items-center gap-3 max-w-4xl mx-auto"
        >
          {socialLinks.map((social, index) => {
            const iconClass =
              social.name === "Stackcraft"
                ? "w-6 h-6 md:w-7 md:h-7 opacity-95 text-white group-hover:text-amber-200 transition-colors"
                : "w-6 h-6 md:w-7 md:h-7";
            return (
              <Tooltip key={social.name}>
                <TooltipTrigger asChild>
                  <motion.a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    style={{ ["--brand-rgb" as any]: social.glowRgb }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className={`group glass-card brand-glow-card brand-square-glow w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${social.color} hover:text-primary-foreground hover:shadow-glow`}
                  >
                    <social.icon className={iconClass} />
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent>{social.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
