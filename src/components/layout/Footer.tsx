import { useMemo, useState } from "react";
import { ExternalLink, Compass, FolderKanban, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { resolveSocialProfiles } from "@/lib/social/resolveProfiles";
import { PrefetchLink } from "@/components/PrefetchLink";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BIz1l1qK9lu1oZEIJOBmDS?mode=gi_t";
const WHATSAPP_QR_LOCAL_PATH = "/payments/whatsapp-group-qr.png";
const WHATSAPP_QR_FALLBACK =
  "https://api.qrserver.com/v1/create-qr-code/?size=320x320&format=png&margin=10&data=https%3A%2F%2Fchat.whatsapp.com%2FBIz1l1qK9lu1oZEIJOBmDS%3Fmode%3Dgi_t";

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
    title: "Explore",
    icon: Compass,
    links: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Projects", path: "/projects" },
      { name: "Insights", path: "/insights" },
      { name: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    links: [
      { name: "Projects Hub", path: "/projects" },
      { name: "LLM Galaxy", path: "/llm-galaxy" },
      { name: "Scriptures", path: "/scriptures" },
      { name: "OpenOwl", path: "/openowl" },
      { name: "Chronyx", path: "/chronyx" },
    ],
  },
  {
    title: "Resources",
    icon: Sparkles,
    links: [
      { name: "LLM Visualizer", path: "/llm-visualizer" },
      { name: "Courses", path: "/courses" },
      { name: "Mentorship", path: "/mentorship" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
    ],
  },
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
  const [useQrFallback, setUseQrFallback] = useState(false);
  const { social, blogAndPlatforms } = useMemo(() => {
    const rows = resolveSocialProfiles((profiles ?? []) as any[]);
    const social = rows.filter((r) => r.category === "social" && r.profile_url);
    const blog = rows.filter((r) => r.category === "blog" && r.profile_url);
    const platform = rows.filter((r) => r.category === "platform" && r.profile_url);
    return { social, blogAndPlatforms: [...blog, ...platform] };
  }, [profiles]);

  return (
    <footer className="mt-16 w-full border-t border-border/60 bg-card/90">
      <div className="w-full px-4 py-10 md:px-6 xl:px-8">
        <div className="grid gap-8">
          <div className="min-w-0 text-center">
            <PrefetchLink to="/" className="inline-flex items-center justify-center gap-3">
              <AbhishekAnimatedLogo size="md" animate />
              <span className="text-xl font-black tracking-tight text-foreground">
                Abhishek Panda
              </span>
            </PrefetchLink>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              Technical architect, founder, and author building practical systems across .NET, cloud, AI, and product engineering.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {social.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="h-10 w-10" iconClass="h-4 w-4" />
              ))}
              {blogAndPlatforms.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="h-10 w-10" iconClass="h-4 w-4" />
              ))}
            </div>

            <section className="mx-auto mt-6 w-full max-w-[220px] rounded-2xl border border-border/60 bg-background/70 p-3">
              <h4 className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                  <SiWhatsapp className="h-4 w-4" />
                </span>
                WhatsApp Group
              </h4>
              <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="group mx-auto mt-3 block w-full max-w-[168px] rounded-xl border border-border/60 bg-white p-1.5">
                <img
                  src={useQrFallback ? WHATSAPP_QR_FALLBACK : WHATSAPP_QR_LOCAL_PATH}
                  alt="OriginX Labs WhatsApp group QR code"
                  className="w-full rounded-lg"
                  loading="lazy"
                  onError={() => setUseQrFallback(true)}
                />
              </a>
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <SiWhatsapp className="h-3.5 w-3.5" />
                Join WhatsApp Group
              </a>
            </section>
          </div>

          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {footerSections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <h4 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.path || link.url}>
                        <FooterNavLink link={link} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Abhishek Panda. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <PrefetchLink to="/contact" className="transition-colors hover:text-foreground">
              Contact
            </PrefetchLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
