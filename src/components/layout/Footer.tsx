import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, BookOpen, Sparkles, ScrollText, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import { supabase } from "@/integrations/supabase/client";
import { resolveSocialProfiles } from "@/lib/social/resolveProfiles";
import { OriginXAnimatedLogo } from "@/components/ui/OriginXAnimatedLogo";

const footerLinks = {
  website: [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Articles", path: "/articles" },
    { name: "Blogs", path: "/blogs" },
    { name: "Scriptures", path: "/scriptures" },
    { name: "Case Studies", path: "/case-studies" },
    { name: "Projects", path: "/projects" },
    { name: "Stackcraft.io", url: "https://www.stackcraft.io/", external: true, note: "Platform · Coming Soon" },
    { name: "NEWSTACK.LIVE", url: "https://newstack.live", external: true, note: "All global news at one place" },
    { name: "CHRONYX", url: "https://www.getchronyx.com", external: true, note: "Personal one-place destination" },
  ],
  products: [
    { name: "Courses", path: "/courses" },
    { name: "Ebooks", path: "/ebooks" },
    { name: "Mentorship", path: "/mentorship" },
    { name: "Products", path: "/products" },
    { name: "LLM Galaxy", path: "/llm-galaxy" },
    { name: "LLM Visualizer", path: "/llm-visualizer" },
    { name: "OpenOwl", path: "/openowl" },
  ],
  scriptures: [
    { name: "Bhagavad Gita", path: "/scriptures/bhagavad-gita-guide" },
    { name: "Holy Quran", path: "/scriptures/holy-quran-complete-guide" },
    { name: "Holy Bible", path: "/scriptures/holy-bible-complete-guide" },
    { name: "Buddhism Guide", path: "/scriptures/buddhism-complete-guide" },
    { name: "Jainism Guide", path: "/scriptures/jainism-complete-guide" },
  ],
  books: [
    { name: "Awake While Alive!", url: "https://amzn.in/d/f2kbz5j", external: true },
    { name: "Buy on Flipkart", url: "https://www.flipkart.com/awake-while-alive/p/itmc8fc663e9b8aa", external: true },
    { name: "Kindle Edition", url: "https://amzn.in/d/hUih88n", external: true },
    { name: "Notion Press", url: "https://notionpress.com/in/read/awake-while-alive/", external: true },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Refund Policy", path: "/refund" },
  ],
};

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
          className={`group relative ${props.sizeClass} rounded-lg bg-muted flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow`}
          aria-label={p.display_name}
        >
          <span className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${bg}`} />
          <Icon className={`relative ${props.iconClass} text-muted-foreground group-hover:text-white`} />
        </a>
      </TooltipTrigger>
      <TooltipContent>{p.display_name}</TooltipContent>
    </Tooltip>
  );
}

export const Footer = () => {
  const { data: profiles } = usePublicSocialProfiles();
  const [visitCount, setVisitCount] = useState<number | null>(null);

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
    <footer className="relative border-t border-border bg-card">
      {/* Gradient overlay */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Brand Section */}
          <div className="sm:col-span-2 xl:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <AbhishekAnimatedLogo size="md" animate />
              <span className="font-bold text-xl">
                <span className="text-foreground">abhishek</span>
                <span className="gradient-text">panda</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 text-sm">
              Engineering ideas into reality, one clean build at a time. 
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              .NET Architect • AI/ML Engineer • Cloud-Native Specialist
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Founder,{" "}
              <span className="inline-flex items-center gap-2">
                <OriginXAnimatedLogo size="sm" />
                <span className="text-secondary">OriginX Labs</span>
              </span>
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {social.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="w-9 h-9" iconClass="w-4 h-4" />
              ))}
            </div>

            {/* Blog & Platform Icons */}
            <div className="flex flex-wrap items-center gap-2">
              {blogAndPlatforms.map((p: any) => (
                <ProfileIconLink key={p.platform} p={p} sizeClass="w-9 h-9" iconClass="w-4 h-4" />
              ))}
            </div>
          </div>

          <div className="xl:col-start-3 xl:row-start-1">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              Website
            </h4>
            <ul className="space-y-2">
              {footerLinks.website.map((link) => (
                <li key={link.path || link.url}>
                  {"path" in link ? (
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {"note" in link && link.note ? (
                        <div className="text-[11px] text-muted-foreground/70 mt-0.5">{link.note}</div>
                      ) : null}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="xl:col-start-4 xl:row-start-1">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Products
            </h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="xl:col-start-5 xl:row-start-1">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <ScrollText className="h-4 w-4 text-primary" />
              Scriptures
            </h4>
            <ul className="space-y-2">
              {footerLinks.scriptures.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="xl:col-start-6 xl:row-start-1">
            <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              My Books
            </h4>
            <ul className="space-y-2">
              {footerLinks.books.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Attribution Section */}
        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">LLM Galaxy</span> — Created & Maintained by{" "}
                <span className="text-foreground font-medium">Abhishek Panda</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                OriginX Labs R&amp;D Division
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">CEO &amp; Founder of</span>
              <a
                href="https://www.originxlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                <span className="inline-flex items-center gap-2">
                  <OriginXAnimatedLogo size="sm" />
                  <span>OriginX Labs (www.originxlabs.com)</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-border/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Abhishek Panda. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6">
            <span className="text-xs text-muted-foreground">
              Visitors: {visitCount === null ? "—" : visitCount.toLocaleString()}
            </span>
            {footerLinks.legal.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
