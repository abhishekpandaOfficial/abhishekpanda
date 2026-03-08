import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Eye, House, ChevronRight, Printer, Sparkles, FileText, BookOpen } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Markdown } from "@/components/blog/Markdown";
import { GiscusComments } from "@/components/blog/GiscusComments";
import { useTheme } from "@/components/ThemeProvider";
import { LongformEngagementBar, useLongformEngagement } from "@/components/content/LongformEngagementBar";
import { LongformSidebar, type LongformSidebarLink } from "@/components/content/LongformSidebar";
import { LongformSummaryDialog } from "@/components/content/LongformSummaryDialog";
import {
  getLocalBlogRelatedPosts,
  getRenderableLocalBlogHtml,
  type LocalBlogPostRecord,
} from "@/content/blogs";
import { ARTICLES } from "@/content/articles";
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
  buildIframeExportPayload,
  downloadEpub,
  downloadPdfViaPrint,
  openPrintWindow,
} from "@/lib/readerActions";

type LocalBlogPostViewProps = {
  post: LocalBlogPostRecord;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://www.abhishekpanda.com";

export function LocalBlogPostView({ post }: LocalBlogPostViewProps) {
  const { theme } = useTheme();
  const { personalPosts } = usePublishedPersonalBlogs();
  const htmlContent = useMemo(() => getRenderableLocalBlogHtml(post), [post]);
  const articleBodyRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeCleanupRef = useRef<(() => void) | null>(null);

  const [frameHeight, setFrameHeight] = useState(920);
  const [toc, setToc] = useState<LongformTocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const relatedBlogs = useMemo(() => getLocalBlogRelatedPosts(post), [post]);
  const relatedArticles = useMemo(
    () =>
      ARTICLES.filter((article) => article.tags.some((tag) => post.tags.includes(tag)))
        .slice(0, 4)
        .map((article) => ({
          title: article.title,
          to: `/articles/${article.slug}`,
          description: article.description,
        }) satisfies LongformSidebarLink),
    [post.tags],
  );
  const popularBlogs = useMemo(
    () =>
      personalPosts
        .filter((item) => item.slug !== post.slug)
        .slice(0, 5)
        .map((item) => ({
          title: item.title,
          to: `/blog/${item.slug}`,
          description: item.excerpt || undefined,
        }) satisfies LongformSidebarLink),
    [personalPosts, post.slug],
  );

  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const commentsSectionId = `blog-comments-${post.slug}`;
  const engagement = useLongformEngagement({
    canonical,
    title: post.title,
    description: post.excerpt,
    commentsTargetId: commentsSectionId,
  });

  useEffect(() => {
    if (!htmlContent || !articleBodyRef.current) return;

    const { items, elements } = buildTocFromRoot(articleBodyRef.current);
    setToc(items);
    setActiveHeadingId(items[0]?.id || null);

    const update = () => {
      const doc = document.documentElement;
      setScrollProgress(computeScrollProgress(window.scrollY, doc.scrollHeight, window.innerHeight));
      setActiveHeadingId(getActiveHeadingId(elements));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [htmlContent, post.content]);

  useEffect(() => {
    if (!htmlContent) return;
    return () => {
      iframeCleanupRef.current?.();
      iframeCleanupRef.current = null;
    };
  }, [htmlContent]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      applyEmbeddedThemeBridge(doc, theme);
    }
  }, [theme]);

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
      const body = doc.body;
      const root = doc.documentElement;
      setFrameHeight(Math.max(body.scrollHeight, body.offsetHeight, root.scrollHeight, 920));
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
    if (htmlContent) {
      const doc = iframeRef.current?.contentDocument;
      const target = doc?.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    if (htmlContent) {
      iframeRef.current?.contentWindow?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollBottom = () => {
    if (htmlContent) {
      const win = iframeRef.current?.contentWindow;
      const doc = iframeRef.current?.contentDocument;
      if (win && doc) {
        win.scrollTo({ top: doc.documentElement.scrollHeight, behavior: "smooth" });
      }
      return;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  const buildExportPayload = () => {
    if (htmlContent) {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return null;
      return buildIframeExportPayload(doc, {
        title: post.title,
        slug: post.slug,
        description: post.excerpt,
        author: "Abhishek Panda",
      });
    }

    const bodyHtml = articleBodyRef.current?.innerHTML;
    if (!bodyHtml) return null;
    return buildHtmlExportPayload({
      title: post.title,
      slug: post.slug,
      description: post.excerpt,
      author: "Abhishek Panda",
      bodyHtml: `<article><h1>${post.title}</h1><p class="ap-export-lead">${post.excerpt}</p>${bodyHtml}</article>`,
      stylesCss: `
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0f172a;
          background: #ffffff;
          padding: 32px;
        }
        .ap-export-lead {
          color: #475569;
          font-size: 1.05rem;
          margin-bottom: 24px;
        }
      `,
      lang: "en",
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
    const points = [
      ...relatedBlogs.slice(0, 2).map((item) => item.title),
      ...toc.slice(0, 4).map((item) => item.text),
    ].filter(Boolean);
    return Array.from(new Set(points)).slice(0, 6);
  }, [relatedBlogs, toc]);

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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | Abhishek Panda Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-28 lg:pb-20">
        <section className="container mx-auto max-w-[1360px] px-4">
          <div className="mb-6">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-6 md:p-8 lg:p-10">
            <div className="editorial-meta inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              <House className="h-3.5 w-3.5" />
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/blogs" className="hover:text-foreground">Blogs</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="max-w-[18rem] truncate text-foreground">{post.title}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/80"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="editorial-title mt-6 max-w-5xl text-4xl font-black text-foreground md:text-5xl xl:text-6xl">
              {post.title}
            </h1>
            <p className="editorial-copy mt-5 max-w-4xl text-base text-muted-foreground md:text-lg">{post.excerpt}</p>

            <div className="editorial-meta mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2">
                <Clock className="h-4 w-4 text-primary" />
                {post.readingTimeMinutes} min read
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2">
                <Calendar className="h-4 w-4 text-primary" />
                {post.publishedAt}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2">
                <Eye className="h-4 w-4 text-primary" />
                Website chapter
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <article className="min-w-0">
              <div className="space-y-6">
                <LongformEngagementBar title={post.title} controller={engagement} placement="top" />

                <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 md:p-6">
                {htmlContent ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white shadow-sm">
                    <iframe
                      ref={iframeRef}
                      title={post.title}
                      srcDoc={htmlContent}
                      className="block w-full border-0 bg-white"
                      style={{ height: Math.max(frameHeight, 820) }}
                      onLoad={handleIframeLoad}
                    />
                  </div>
                ) : (
                  <div ref={articleBodyRef} className="editorial-shell rounded-[1.5rem] bg-background p-2 md:p-4">
                    <Markdown
                      value={post.content}
                      codeTheme={theme === "dark" ? "github-dark-default" : "github-light-default"}
                    />
                  </div>
                )}
                </div>

                <LongformEngagementBar title={post.title} controller={engagement} placement="bottom" />

                <section
                  id={commentsSectionId}
                  className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur md:p-6"
                >
                  <div className="mb-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Community</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Comments on this chapter</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                      Share feedback, ask follow-up questions, or suggest the next chapter to expand.
                    </p>
                  </div>
                  <GiscusComments />
                </section>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <LongformSidebar
                readMinutes={post.readingTimeMinutes}
                progressPercent={scrollProgress}
                toc={toc}
                activeHeadingId={activeHeadingId}
                actions={quickActions}
                showMobileActions
                popularTitle="Popular Blog Chapters"
                popularItems={popularBlogs}
                popularCta={{ label: "View all blogs", to: "/blogs" }}
                secondaryTitle="Continue Reading"
                secondaryItems={[
                  ...relatedBlogs.slice(0, 2).map((item) => ({
                    title: item.title,
                    to: `/blog/${item.slug}`,
                    description: item.excerpt,
                  })),
                  ...relatedArticles.slice(0, 2),
                ]}
                newsletterTitle=".NET, Architecture, and AI updates"
                newsletterDescription="Get deeper tutorials, chapter drops, and architecture notes from this website in the newsletter."
                onTocClick={handleTocClick}
                onScrollTop={handleScrollTop}
                onScrollBottom={handleScrollBottom}
              />
            </aside>
          </div>
        </section>
      </main>

      <LongformSummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        title={post.title}
        overview={post.excerpt}
        bulletTitle="What this post covers"
        bullets={summaryBullets}
        tags={post.tags}
      />

      <Footer />
    </div>
  );
}
