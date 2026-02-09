import { motion } from "framer-motion";
import {
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";

const socialLinks = [
  { name: "X (Twitter)", icon: Twitter, url: "https://x.com/Panda_Abhishek8", color: "hover:bg-[#000]" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpandaofficial/", color: "hover:bg-[#0077B5]" },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@abhishekpanda_official", color: "hover:bg-[#FF0000]" },
  { name: "GitHub", icon: Github, url: "https://github.com/abhishekpandaOfficial", color: "hover:bg-[#333]" },
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/the_abhishekpanda/", color: "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]" },
  { name: "Stackcraft", icon: StackcraftIcon, url: "https://stackcraft.io/abhishekpanda", color: "hover:bg-black" },
  { name: "Medium", icon: BookOpen, url: "https://medium.com/@official.abhishekpanda", color: "hover:bg-[#000]" },
  { name: "Substack", icon: Layers, url: "https://substack.com/@abhishekpanda08", color: "hover:bg-[#FF6719]" },
  { name: "Hashnode", icon: ExternalLink, url: "https://hashnode.com/@abhishekpanda", color: "hover:bg-[#2962FF]" },
  { name: "Stack Exchange", icon: Layers, url: "https://writing.stackexchange.com/users/82639/abhishek-official", color: "hover:bg-[#F48024]" },
];

export const SocialSection = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
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
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className={`group glass-card w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${social.color} hover:text-primary-foreground hover:shadow-glow`}
            >
              <social.icon className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[10px] md:text-xs font-medium opacity-70 group-hover:opacity-100">
                {social.name}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
