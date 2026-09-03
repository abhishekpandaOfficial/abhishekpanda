import { SiGithub, SiInstagram, SiLinkedin, SiSubstack, SiX, SiYoutube } from "react-icons/si";
import { PrefetchLink } from "@/components/PrefetchLink";

const socialLinks = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/iamabhishekpanda/", icon: SiLinkedin, color: "hover:text-[#0A66C2]" },
  { name: "X", url: "https://x.com/Stacked_in", icon: SiX, color: "hover:text-slate-950 dark:hover:text-white" },
  { name: "Instagram", url: "https://www.instagram.com/i_am_abhishekPanda", icon: SiInstagram, color: "hover:text-[#E4405F]" },
  { name: "YouTube", url: "https://www.youtube.com/@stackedin", icon: SiYoutube, color: "hover:text-[#FF0000]" },
  { name: "Substack", url: "https://stackedin.substack.com/", icon: SiSubstack, color: "hover:text-[#FF6719]" },
  { name: "GitHub", url: "https://github.com/abhishekpandaOfficial", icon: SiGithub, color: "hover:text-slate-950 dark:hover:text-white" },
];

export const Footer = () => (
  <footer className="mt-16 w-full border-t border-border/60 bg-background">
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Abhishek Panda social profiles">
        {socialLinks.map(({ name, url, icon: Icon, color }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:border-current hover:shadow-sm ${color}`}
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="Footer navigation">
        <PrefetchLink to="/blog" className="transition hover:text-foreground">Blog</PrefetchLink>
        <PrefetchLink to="/insights" className="transition hover:text-foreground">Insights</PrefetchLink>
        <PrefetchLink to="/privacy" className="transition hover:text-foreground">Privacy</PrefetchLink>
        <PrefetchLink to="/terms" className="transition hover:text-foreground">Terms</PrefetchLink>
      </nav>

      <p className="border-t border-border/50 pt-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Abhishek Panda. All rights reserved.
      </p>
    </div>
  </footer>
);
