import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Home, Menu, Newspaper, PanelsTopLeft, Printer, Sparkles } from "lucide-react";
import { LongformSidebar } from "@/components/content/LongformSidebar";
import { LongformSummaryDialog } from "@/components/content/LongformSummaryDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/ThemeProvider";
import { ARTICLES } from "@/content/articles";
import { type CaseStudyRecord, getRelatedCaseStudies } from "@/content/caseStudies";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";
import {
  buildTocFromRoot,
  computeScrollProgress,
  getActiveHeadingId,
  type LongformTocItem,
} from "@/lib/longformNavigation";
import {
  applyEmbeddedThemeBridge,
  buildHtmlExportPayload,
  downloadEpub,
  downloadPdfViaPrint,
  openPrintWindow,
} from "@/lib/readerActions";

type CaseStudyDetailProps = {
  caseStudy: CaseStudyRecord;
};

export default function CaseStudyDetail({ caseStudy }: CaseStudyDetailProps) {
  const { theme } = useTheme();
  const { personalPosts } = usePublishedPersonalBlogs();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeCleanupRef = useRef<(() => void) | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [toc, setToc] = useState<LongformTocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const relatedCaseStudies = useMemo(
    () =>
      getRelatedCaseStudies(caseStudy, 5).map((item) => ({
        title: item.title,
        to: `/case-studies/${item.slug}`,
        description: item.description,
      })),
    [caseStudy],
  );

  const relatedArticles = useMemo(
    () =>
      ARTICLES.filter((item) => item.slug !== "15-case-studies-dotnet")
        .slice(0, 3)
        .map((item) => ({
          title: item.title,
          to: `/articles/${item.slug}`,
          description: item.description,
        })),
    [],
  );

  const popularBlogs = useMemo(
    () =>
      personalPosts
        .filter((post) => post.slug)
        .slice(0, 3)
        .map((post) => ({
          title: post.title,
          to: `/blog/${post.slug}`,
          description: post.excerpt || undefined,
        })),
    [personalPosts],
  );

  useEffect(() => {
    return () => {
      iframeCleanupRef.current?.();
      iframeCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      applyEmbeddedThemeBridge(doc, theme);
    }
  }, [theme]);

  const navLinks = [
    {
      title: "Back to Case Studies Hub",
      description: "Return to the routed case-study library.",
      to: "/case-studies",
      icon: ArrowLeft,
    },
    {
      title: "Open 15 Case Studies Guide",
      description: "View the full flagship guide in the Articles hub.",
      to: "/articles/15-case-studies-dotnet",
      icon: Newspaper,
    },
    {
      title: "Home",
      description: "Go back to the website landing page.",
      to: "/",
      icon: Home,
    },
    {
      title: "Blogs",
      description: "Browse chapter-style blog series and topic tracks.",
      to: "/blogs",
      icon: FileText,
    },
  ];

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!iframe || !doc || !win) return;

    iframeCleanupRef.current?.();
    applyEmbeddedThemeBridge(doc, theme);

    const section = doc.getElementById(caseStudy.anchorId || "") as HTMLElement | null;
    sectionRef.current = section;
    const contentRoot = section || doc;
    const { items, elements } = buildTocFromRoot(contentRoot);
    setToc(items);
    setActiveHeadingId(items[0]?.id || null);

    const update = () => {
      const root = doc.documentElement;
      if (!section) {
        setScrollProgress(computeScrollProgress(win.scrollY, root.scrollHeight, win.innerHeight));
        setActiveHeadingId(getActiveHeadingId(elements));
        return;
      }

      const start = Math.max(section.offsetTop - 24, 0);
      const effectiveHeight = Math.max(section.offsetHeight, win.innerHeight);
      const relativeScroll = Math.max(win.scrollY - start, 0);
      setScrollProgress(computeScrollProgress(relativeScroll, effectiveHeight, win.innerHeight));
      setActiveHeadingId(getActiveHeadingId(elements));
    };

    requestAnimationFrame(() => {
      if (section) {
        win.scrollTo({ top: Math.max(section.offsetTop - 24, 0), behavior: "auto" });
      }
      update();
    });

    win.addEventListener("scroll", update, { passive: true });
    win.addEventListener("resize", update);

    iframeCleanupRef.current = () => {
      win.removeEventListener("scroll", update);
      win.removeEventListener("resize", update);
    };
  };

  const handleTocClick = (id: string) => {
    const doc = iframeRef.current?.contentDocument;
    const target = doc?.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    const win = iframeRef.current?.contentWindow;
    const section = sectionRef.current;
    if (win && section) {
      win.scrollTo({ top: Math.max(section.offsetTop - 24, 0), behavior: "smooth" });
      return;
    }
    win?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollBottom = () => {
    const win = iframeRef.current?.contentWindow;
    const section = sectionRef.current;
    const doc = iframeRef.current?.contentDocument;
    if (win && section) {
      win.scrollTo({ top: Math.max(section.offsetTop + section.offsetHeight - win.innerHeight, 0), behavior: "smooth" });
      return;
    }
    if (win && doc) {
      win.scrollTo({ top: doc.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  const buildExportPayload = () => {
    const doc = iframeRef.current?.contentDocument;
    const section = sectionRef.current;
    if (!doc || !section) return null;

    const stylesCss = Array.from(doc.querySelectorAll("style"))
      .map((node) => node.textContent || "")
      .join("\n");
    const stylesheets = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
      .map((node) => node.getAttribute("href"))
      .filter((href): href is string => Boolean(href));

    return buildHtmlExportPayload({
      title: caseStudy.title,
      slug: caseStudy.slug,
      description: caseStudy.description,
      author: "Abhishek Panda",
      bodyHtml: `<article><h1>${caseStudy.title}</h1>${section.innerHTML}</article>`,
      stylesCss,
      stylesheets,
      lang: doc.documentElement.lang || "en",
    });
  };

  const handlePrint = () => {
    const payload = buildExportPayload();
    if (!payload) return;
    openPrintWindow(payload);
  };

  const handleDownloadPdf = () => {
    const payload = buildExportPayload();
    if (!payload) return;
    downloadPdfViaPrint(payload);
  };

  const handleDownloadEpub = async () => {
    const payload = buildExportPayload();
    if (!payload) return;
    await downloadEpub(payload);
  };

  const summaryBullets = useMemo(() => {
    const points = [...caseStudy.keyPoints, ...toc.slice(0, 4).map((item) => item.text)].filter(Boolean);
    return Array.from(new Set(points)).slice(0, 6);
  }, [caseStudy.keyPoints, toc]);

  const quickActions = [
    {
      key: "summary",
      label: "AI Summary",
      shortLabel: "Summary",
      icon: Sparkles,
      onClick: () => setShowSummary(true),
      accentClass: "text-violet-500",
    },
    {
      key: "print",
      label: "Print",
      shortLabel: "Print",
      icon: Printer,
      onClick: handlePrint,
    },
    {
      key: "pdf",
      label: "Save PDF",
      shortLabel: "PDF",
      icon: FileText,
      onClick: handleDownloadPdf,
    },
    {
      key: "epub",
      label: "Save EPUB",
      shortLabel: "EPUB",
      icon: BookOpen,
      onClick: () => void handleDownloadEpub(),
    },
  ];

  if (!caseStudy.assetUrl) {
    return (
      <div className="rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Case study unavailable</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">{caseStudy.title}</h1>
        <p className="mt-4 text-muted-foreground">This case study route is reserved, but the detailed content has not been attached yet.</p>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-24 z-40 h-11 w-11 rounded-full border-border/70 bg-background/90 shadow-lg backdrop-blur md:left-6"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open case study navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[88vw] max-w-sm border-border/60 bg-background/95 p-0 backdrop-blur">
          <SheetHeader className="border-b border-border/60 px-6 py-5 pr-12">
            <SheetTitle>Case Study Navigation</SheetTitle>
            <SheetDescription className="line-clamp-2">{caseStudy.title}</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-5.5rem)]">
            <div className="space-y-8 p-6">
              <section className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Back Links</p>
                <div className="space-y-3">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <span className="mt-0.5 rounded-xl border border-border/60 bg-background p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-foreground">{item.title}</span>
                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                          </span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </section>

              {toc.length ? (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PanelsTopLeft className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">This Case Study</p>
                  </div>
                  <div className="space-y-2">
                    {toc.map((item, index) => (
                      <SheetClose asChild key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleTocClick(item.id)}
                          className={`block w-full rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5 ${
                            item.depth === 3 ? "ml-4 w-[calc(100%-1rem)]" : ""
                          }`}
                        >
                          <span className="mr-2 text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                          <span className="text-sm font-medium text-foreground">{item.text}</span>
                        </button>
                      </SheetClose>
                    ))}
                  </div>
                </section>
              ) : null}

              {relatedCaseStudies.length ? (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Other Case Studies</p>
                  </div>
                  <div className="space-y-3">
                    {relatedCaseStudies.slice(0, 4).map((item) => (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className="block rounded-2xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <article className="min-w-0">
        <iframe
          ref={iframeRef}
          title={caseStudy.title}
          src={caseStudy.assetUrl}
          loading="eager"
          className="block h-[82vh] min-h-[720px] w-full border-0 bg-background md:min-h-[760px] xl:h-[calc(100vh-7rem)] xl:min-h-[calc(100vh-7rem)]"
          onLoad={handleIframeLoad}
        />
      </article>

      <aside className="border-t border-border/60 pt-6 xl:sticky xl:top-24 xl:self-start xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
        <LongformSidebar
          readMinutes={caseStudy.readMinutes}
          progressPercent={scrollProgress}
          toc={toc}
          activeHeadingId={activeHeadingId}
          actions={quickActions}
          showMobileActions
          popularTitle="Other Case Studies"
          popularItems={relatedCaseStudies}
          popularCta={{ label: "Open case studies hub", to: "/case-studies" }}
          secondaryTitle="Related Articles & Blogs"
          secondaryItems={[...relatedArticles, ...popularBlogs]}
          newsletterTitle="Weekly engineering and case-study updates"
          newsletterDescription="Get new case studies, articles, and blog chapters from this website in one weekly drop."
          onTocClick={handleTocClick}
          onScrollTop={handleScrollTop}
          onScrollBottom={handleScrollBottom}
        />
      </aside>

      <LongformSummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        title={caseStudy.title}
        overview={caseStudy.intro || caseStudy.description}
        bulletTitle="What this case study covers"
        bullets={summaryBullets}
        tags={caseStudy.tags}
      />
    </div>
  );
}
