import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Home, Menu, Newspaper, PanelsTopLeft, Printer, Sparkles } from "lucide-react";
import { GiscusComments } from "@/components/blog/GiscusComments";
import { LongformEngagementBar, useLongformEngagement } from "@/components/content/LongformEngagementBar";
import { LongformSidebar } from "@/components/content/LongformSidebar";
import { LongformSummaryDialog } from "@/components/content/LongformSummaryDialog";
import { getRelatedArticles, type ArticleRecord } from "@/content/articles";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/ThemeProvider";
import {
  buildTocFromRoot,
  computeScrollProgress,
  getActiveHeadingId,
  type LongformTocItem,
} from "@/lib/longformNavigation";
import {
  applyEmbeddedThemeBridge,
  buildIframeExportPayload,
  downloadEpub,
  downloadPdfViaPrint,
  openPrintWindow,
} from "@/lib/readerActions";

type ArticleDetailProps = {
  article: ArticleRecord;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://www.abhishekpanda.com";

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const { personalPosts } = usePublishedPersonalBlogs();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeCleanupRef = useRef<(() => void) | null>(null);

  const [toc, setToc] = useState<LongformTocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const commentsSectionId = `article-comments-${article.slug}`;
  const canonical = `${SITE_URL}${location.pathname}`;
  const engagement = useLongformEngagement({
    canonical,
    title: article.title,
    description: article.description,
    commentsTargetId: commentsSectionId,
  });

  const relatedArticles = useMemo(
    () =>
      getRelatedArticles(article, 5).map((item) => ({
        title: item.title,
        to: `/articles/${item.slug}`,
        description: item.description,
      })),
    [article],
  );

  const popularBlogs = useMemo(
    () =>
      personalPosts
        .filter((post) => post.slug)
        .slice(0, 5)
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

  const iframeSrc = `${article.assetUrl}${location.hash || ""}`;
  const navLinks = [
    {
      title: "Back to Articles Hub",
      description: "Return to the full routed articles collection.",
      to: "/articles",
      icon: ArrowLeft,
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
    {
      title: "Case Studies",
      description: "Open the case-study hub for more long-form deep dives.",
      to: "/case-studies",
      icon: BookOpen,
    },
  ];

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!iframe || !doc || !win) return;

    iframeCleanupRef.current?.();
    applyEmbeddedThemeBridge(doc, theme);

    const { items, elements } = buildTocFromRoot(doc);
    setToc(items);
    setActiveHeadingId(items[0]?.id || null);

    const update = () => {
      const root = doc.documentElement;
      setScrollProgress(computeScrollProgress(win.scrollY, root.scrollHeight, win.innerHeight));
      setActiveHeadingId(getActiveHeadingId(elements));
    };

    update();
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
    iframeRef.current?.contentWindow?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollBottom = () => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (win && doc) {
      win.scrollTo({ top: doc.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  const buildExportPayload = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    return buildIframeExportPayload(doc, {
      title: article.title,
      slug: article.slug,
      description: article.description,
      author: "Abhishek Panda",
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
    const points = [...article.keyPoints, ...toc.slice(0, 4).map((item) => item.text)].filter(Boolean);
    return Array.from(new Set(points)).slice(0, 6);
  }, [article.keyPoints, toc]);

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
            <span className="sr-only">Open article navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[88vw] max-w-sm border-border/60 bg-background/95 p-0 backdrop-blur">
          <SheetHeader className="border-b border-border/60 px-6 py-5 pr-12">
            <SheetTitle>Article Navigation</SheetTitle>
            <SheetDescription className="line-clamp-2">{article.title}</SheetDescription>
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
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">On This Page</p>
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

              {relatedArticles.length ? (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Related Articles</p>
                  </div>
                  <div className="space-y-3">
                    {relatedArticles.slice(0, 4).map((item) => (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className="block rounded-2xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <p className="font-semibold text-foreground">{item.title}</p>
                          {item.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </section>
              ) : null}

              {popularBlogs.length ? (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Popular Blog Chapters</p>
                  </div>
                  <div className="space-y-3">
                    {popularBlogs.slice(0, 4).map((item) => (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className="block rounded-2xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <p className="font-semibold text-foreground">{item.title}</p>
                          {item.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
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

      <article className="min-w-0 space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
          <div className="relative aspect-[16/8] min-h-[280px] w-full md:min-h-[360px]">
            <img
              src={article.heroImage}
              alt={article.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent dark:from-background dark:via-slate-950/40 dark:to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_40%,rgba(15,23,42,0.12))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(2,6,23,0.34))]" />
          </div>

          <div className="relative -mt-24 px-5 pb-5 md:px-8 md:pb-8">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/88 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-950/72 md:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {article.eyebrow}
                </span>
                <span className="rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  {article.publishedAt}
                </span>
                <span className="rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  {article.readMinutes} min read
                </span>
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-foreground md:text-5xl">
                {article.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {article.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-foreground/85"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <iframe
          ref={iframeRef}
          title={article.title}
          src={iframeSrc}
          loading="eager"
          className="block h-[82vh] min-h-[720px] w-full border-0 bg-background md:min-h-[760px] xl:h-[calc(100vh-7rem)] xl:min-h-[calc(100vh-7rem)]"
          onLoad={handleIframeLoad}
        />

        <LongformEngagementBar
          title={article.title}
          controller={engagement}
          placement="bottom"
          variant="share-footer"
        />

        <section
          id={commentsSectionId}
          className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur md:p-6"
        >
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Community</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Comments on this article</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              Share your take, add follow-up questions, or drop improvements for this article.
            </p>
          </div>
          <GiscusComments />
        </section>
      </article>

      <aside className="border-t border-border/60 pt-6 xl:sticky xl:top-24 xl:self-start xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
        <LongformSidebar
          readMinutes={article.readMinutes}
          progressPercent={scrollProgress}
          toc={toc}
          activeHeadingId={activeHeadingId}
          actions={quickActions}
          showMobileActions
          popularTitle="Popular Blog Chapters"
          popularItems={popularBlogs}
          popularCta={{ label: "Open all blogs", to: "/blogs" }}
          secondaryTitle="Continue Reading"
          secondaryItems={[...relatedArticles.slice(0, 3), ...article.relatedBlogs.slice(0, 2)]}
          newsletterTitle="Weekly engineering and article updates"
          newsletterDescription="Get new articles, blog chapters, and architecture notes from this website in one weekly drop."
          onTocClick={handleTocClick}
          onScrollTop={handleScrollTop}
          onScrollBottom={handleScrollBottom}
        />
      </aside>

      <LongformSummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        title={article.title}
        overview={article.intro || article.description}
        bulletTitle="What this article covers"
        bullets={summaryBullets}
        tags={article.tags}
      />
    </div>
  );
}
