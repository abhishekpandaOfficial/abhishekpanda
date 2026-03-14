import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";

type MasteryEmbedPageProps = {
  title: string;
  embedPath: string;
  version: string;
  backgroundClassName?: string;
  sectionLabel?: string;
  sectionHref?: string;
};

export function MasteryEmbedPage({
  title,
  embedPath,
  version,
  backgroundClassName = "bg-[#080c14]",
  sectionLabel,
  sectionHref,
}: MasteryEmbedPageProps) {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const location = useLocation();

  const resolvedSection = useMemo(() => {
    if (sectionLabel && sectionHref) {
      return { label: sectionLabel, href: sectionHref };
    }

    if (location.pathname.startsWith("/ai-ml-hub")) {
      return { label: "AI / ML Hub", href: "/ai-ml-hub" };
    }

    if (location.pathname.startsWith("/techhub")) {
      return { label: "TechHub", href: "/techhub" };
    }

    return {
      label: sectionLabel || "Blogs",
      href: sectionHref || "/blogs",
    };
  }, [location.pathname, sectionHref, sectionLabel]);

  const src = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("theme", initialThemeRef.current);
    params.set("v", version);
    return `${embedPath}?${params.toString()}`;
  }, [embedPath, version]);

  useEffect(() => {
    syncThemeToEmbeddedFrame(iframeRef.current, theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex h-screen w-full flex-col overflow-hidden pt-16 md:pt-20">
        <div className="border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <Breadcrumb>
            <BreadcrumbList className="text-xs md:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={resolvedSection.href}>{resolvedSection.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className={`min-h-0 flex-1 ${backgroundClassName}`}>
          <iframe
            ref={iframeRef}
            title={title}
            src={src}
            className="block h-full w-full border-0"
            allow="same-origin"
            onLoad={() => syncThemeToEmbeddedFrame(iframeRef.current, theme)}
          />
        </div>
      </main>
    </div>
  );
}
