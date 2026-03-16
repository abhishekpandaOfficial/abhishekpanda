import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, BookOpen, Boxes, Compass, FolderKanban, Rocket, ScrollText, Sparkles, Stars } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { supabase } from "@/integrations/supabase/client";
import { resolveSocialProfiles } from "@/lib/social/resolveProfiles";
import { OriginXAnimatedLogo } from "@/components/ui/OriginXAnimatedLogo";
import { PrefetchLink } from "@/components/PrefetchLink";
import { getAdminDesktopDownloadUrl } from "@/lib/adminRuntime";

type FooterLink = {
  name: string;
  path?: string;
  url?: string;
  external?: boolean;
  note?: string;
};

type FooterSection = {
  title: string;
  icon: typeof Compass;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Websites",
    icon: Compass,
    links: [
      { name: "Home", path: "/" },
      { name: "TechHub", path: "/techhub" },
      { name: "AI/ML Hub", path: "/ai-ml-hub" },
      { name: "Articles", path: "/articles" },
      { name: "Case Studies", path: "/case-studies" },
      { name: "Scriptures", path: "/scriptures" },
      { name: "Classified", path: "/classified" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    links: [
      { name: "Projects Hub", path: "/projects" },
      { name: "OpenOwl", path: "/openowl" },
      { name: "Chronyx", path: "/chronyx" },
      { name: "OriginX Labs", url: "https://www.originxlabs.com", external: true },
      { name: "NEWSTACK.LIVE", url: "https://newstack.live", external: true },
      { name: "Stackcraft.io", url: "https://www.stackcraft.io/", external: true, note: "Platform in progress" },
    ],
  },
  {
    title: "Features",
    icon: Stars,
    links: [
      { name: "LLM Galaxy", path: "/llm-galaxy" },
      { name: "LLM Visualizer", path: "/llm-visualizer" },
      { name: "Desktop App", path: "/desktop-app" },
      { name: "Online Editor", path: "/dsa-mastery-csharp/practice" },
      { name: "Interview", path: "/interview" },
      { name: "Courses", path: "/courses" },
      { name: "Mentorship", path: "/mentorship" },
    ],
  },
  {
    title: "My Books",
    icon: BookOpen,
    links: [
      { name: "Awake While Alive!", url: "https://amzn.in/d/f2kbz5j", external: true },
      { name: "Kindle Edition", url: "https://amzn.in/d/hUih88n", external: true },
      { name: "Buy on Flipkart", url: "https://www.flipkart.com/awake-while-alive/p/itmc8fc663e9b8aa", external: true },
      { name: "Notion Press", url: "https://notionpress.com/in/read/awake-while-alive/", external: true },
      { name: "Ebooks", path: "/ebooks" },
    ],
  },
  {
    title: "Products",
    icon: Boxes,
    links: [
      { name: "Products", path: "/products" },
      { name: "Courses", path: "/courses" },
      { name: "Ebooks", path: "/ebooks" },
      { name: "Mentorship", path: "/mentorship" },
      { name: "Contact", path: "/contact" },
      { name: "About", path: "/about" },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Refund Policy", path: "/refund" },
];

type PublicProfile = {
  platform: string;
  display_name: string;
  category: string;
  profile_url: string | null;
  icon_key: string;
  brand_bg: string | null;
};

function ProfileIconLink(props: { p: PublicProfile; sizeClass: string; iconClass: string }) {
  const { p } = props;
  const Icon: any = iconForKey(p.icon_key);
  const bg = p.brand_bg || "bg-primary";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={p.profile_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative ${props.sizeClass} flex items-center justify-center rounded-2xl border border-border/60 bg-background/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.45)]`}
          aria-label={p.display_name}
        >
          <span className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 ${bg}`} />
          <Icon className={`relative ${props.iconClass} text-muted-foreground group-hover:text-white`} />
        </a>
      </TooltipTrigger>
      <TooltipContent>{p.display_name}</TooltipContent>
    </Tooltip>
  );
}

function FooterNavLink({ link }: { link: FooterLink }) {
  if (link.path) {
    return (
      <PrefetchLink
        to={link.path}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <span>{link.name}</span>
      </PrefetchLink>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      <span>{link.name}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export const Footer = () => {
  const { data: profiles } = usePublicSocialProfiles();
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const desktopDownloadUrl = getAdminDesktopDownloadUrl();

  const { social, blogAndPlatforms } = useMemo(() => {
    const rows = resolveSocialProfiles((profiles ?? []) as any[]);
    const social = rows.filter((r) => r.category === "social" && r.profile_url);
    const blog = rows.filter((r) => r.category === "blog" && r.profile_url);
    const platform = rows.filter((r) => r.category === "platform" && r.profile_url);
    return { social, blogAndPlatforms: [...blog, ...platform] };
  }, [profiles]);

  useEffect(() => {
    let mounted = true;
    supabase
      .rpc("increment_site_visit", { _slug: "site" })
      .then(({ data, error }) => {
        if (error || !mounted) return;
        if (typeof data === "number") setVisitCount(data);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="relative mt-16 w-full overflow-hidden border-t border-border/60 bg-card/95">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(168,85,247,0.12),transparent_28%)]" />

      <div className="relative w-full px-4 py-10 md:px-6 md:py-14 xl:px-8">
        <div className="grid gap-8 border-b border-border/50 pb-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] xl:gap-12">
          <div className="min-w-0">
            <PrefetchLink to="/" className="inline-flex items-center gap-3">
              <AbhishekAnimatedLogo size="md" animate />
              <span className="text-xl font-black tracking-tight text-foreground">
                abhishek<span className="gradient-text">panda</span>
              </span>
            </PrefetchLink>

            <div className="mt-5 max-w-2xl rounded-[28px] border border-border/60 bg-background/75 p-5 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Rocket className="h-3.5 w-3.5" />
                Build. Learn. Ship.
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-[15px]">
                Full-width engineering hub for deep technical learning, products, books, projects, and hands-on systems content across modern software stacks.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[".NET Architect", "AI/ML Engineer", "Cloud-Native", "Builder", "Author"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {social.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="h-10 w-10" iconClass="h-4 w-4" />
              ))}
              {blogAndPlatforms.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="h-10 w-10" iconClass="h-4 w-4" />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2">
                <OriginXAnimatedLogo size="sm" />
                OriginX Labs
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2">
                Visitors: {visitCount === null ? "—" : visitCount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">
            {footerSections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.title}
                  className="rounded-[28px] border border-border/60 bg-background/75 p-5 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur"
                >
                  <h4 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.path || link.url}>
                        <FooterNavLink link={link} />
                        {link.note ? <p className="mt-1 text-[11px] text-muted-foreground/70">{link.note}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Abhishek Panda</span> builds technical learning systems, production products, and long-form engineering knowledge.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Abhishek Panda. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <PrefetchLink
                key={link.path}
                to={link.path!}
                className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.name}
              </PrefetchLink>
            ))}
            <a
              href={desktopDownloadUrl}
              target={desktopDownloadUrl.startsWith("http") ? "_blank" : undefined}
              rel={desktopDownloadUrl.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-600"
            >
              <Download className="h-3.5 w-3.5" />
              Download App
            </a>
            <PrefetchLink
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Connect
            </PrefetchLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
