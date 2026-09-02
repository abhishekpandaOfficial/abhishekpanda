import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Check, Clock, Copy, ExternalLink, UserRound, ZoomIn, ZoomOut } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Footer } from "@/components/layout/Footer";
import { LongformSidebar } from "@/components/content/LongformSidebar";
import { StackedInReaderHeader } from "@/components/blog/StackedInReaderHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { buildTocFromRoot, computeScrollProgress, getActiveHeadingId, type LongformTocItem } from "@/lib/longformNavigation";
import { fetchSubstackArchive, fetchSubstackPost, sanitizeSubstackHtml, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";

const SITE_URL = "https://www.abhishekpanda.com";

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

export default function SubstackPost() {
  const { slug } = useParams();
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const headingElementsRef = useRef<HTMLElement[]>([]);
  const [toc, setToc] = useState<LongformTocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [instagramReady, setInstagramReady] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["stackedin-substack-post", slug],
    queryFn: () => fetchSubstackPost(slug!),
    enabled: Boolean(slug),
    staleTime: 15 * 60 * 1000,
  });
  const { data: archive } = useQuery({
    queryKey: ["stackedin-substack-archive"],
    queryFn: () => fetchSubstackArchive(),
    staleTime: 5 * 60 * 1000,
  });

  const safeHtml = useMemo(() => (post?.bodyHtml ? sanitizeSubstackHtml(post.bodyHtml) : ""), [post?.bodyHtml]);
  const originalUrl = post?.canonicalUrl || (slug ? `${STACKEDIN_PUBLICATION_URL}/p/${slug}` : STACKEDIN_PUBLICATION_URL);
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(originalUrl)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(originalUrl)}&text=${encodeURIComponent(post?.title || "Read this StackedIN article")}`;
  const relatedPosts = useMemo(
    () =>
      (archive?.posts || [])
        .filter((item) => item.slug !== slug)
        .slice(0, 4)
        .map((item) => ({
          title: item.title,
          to: `/blog/stackedin/${item.slug}`,
          description: item.subtitle || `${item.readingTimeMinutes} min read`,
        })),
    [archive?.posts, slug],
  );

  useEffect(() => {
    const root = articleBodyRef.current;
    if (!root || !safeHtml) {
      setToc([]);
      headingElementsRef.current = [];
      return;
    }
    const built = buildTocFromRoot(root);
    const leadImage = root.querySelector<HTMLImageElement>("img");
    if (leadImage) {
      leadImage.loading = "eager";
      leadImage.fetchPriority = "high";
    }
    setToc(built.items);
    headingElementsRef.current = built.elements;
    setActiveHeadingId(built.items[0]?.id || null);

    const openImage = (image: HTMLImageElement) => {
      setImageZoom(1);
      setLightboxImage({ src: image.currentSrc || image.src, alt: image.alt || post?.title || "Article image" });
    };
    const handleImageClick = (event: MouseEvent) => {
      const image = (event.target as HTMLElement | null)?.closest("img");
      if (image && root.contains(image)) {
        event.preventDefault();
        event.stopPropagation();
        openImage(image);
      }
    };
    const handleImageKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const image = (event.target as HTMLElement | null)?.closest("img");
      if (!image || !root.contains(image)) return;
      event.preventDefault();
      openImage(image);
    };
    root.querySelectorAll("img").forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `Open ${image.alt || "article image"} in zoom viewer`);
    });
    root.addEventListener("click", handleImageClick);
    root.addEventListener("keydown", handleImageKeyDown);
    return () => {
      root.removeEventListener("click", handleImageClick);
      root.removeEventListener("keydown", handleImageKeyDown);
    };
  }, [post?.title, safeHtml]);

  useEffect(() => {
    let frame = 0;
    const updateReadingState = () => {
      frame = 0;
      const root = document.documentElement;
      setProgressPercent(computeScrollProgress(root.scrollTop, root.scrollHeight, root.clientHeight));
      if (headingElementsRef.current.length) setActiveHeadingId(getActiveHeadingId(headingElementsRef.current, 150));
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateReadingState);
    };
    updateReadingState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [safeHtml]);

  const handleTocClick = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copyArticleLink = useCallback(async () => {
    await navigator.clipboard.writeText(originalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [originalUrl]);

  const shareToInstagram = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title || "StackedIN article", text: post?.subtitle || undefined, url: originalUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(originalUrl);
    setInstagramReady(true);
    window.setTimeout(() => setInstagramReady(false), 2200);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }, [originalUrl, post?.subtitle, post?.title]);

  const localCanonicalUrl = slug ? `${SITE_URL}/blog/stackedin/${slug}` : `${SITE_URL}/blog/stackedin`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StackedInReaderHeader progressPercent={progressPercent} />

      {post ? (
        <Helmet>
          <title>{post.title} | StackedIN</title>
          <meta name="description" content={post.subtitle || "Read this StackedIN article by Abhishek Panda."} />
          <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
          <link rel="canonical" href={localCanonicalUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.subtitle || "Read this StackedIN article by Abhishek Panda."} />
          <meta property="og:url" content={localCanonicalUrl} />
          <meta property="og:site_name" content="StackedIN by Abhishek Panda" />
          {post.heroImage ? <meta property="og:image" content={post.heroImage} /> : null}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.subtitle || "Read this StackedIN article by Abhishek Panda."} />
          {post.heroImage ? <meta name="twitter:image" content={post.heroImage} /> : null}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.subtitle || undefined,
              image: post.heroImage || undefined,
              datePublished: post.publishedAt || undefined,
              dateModified: post.updatedAt || post.publishedAt || undefined,
              mainEntityOfPage: { "@type": "WebPage", "@id": localCanonicalUrl },
              author: { "@type": "Person", name: "Abhishek Panda", url: `${SITE_URL}/about` },
              publisher: {
                "@type": "Organization",
                name: "StackedIN",
                url: "https://stackedin.substack.com",
                logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/stackedin/icon.webp` },
              },
              isBasedOn: originalUrl,
              wordCount: post.wordCount || undefined,
              timeRequired: `PT${post.readingTimeMinutes}M`,
              inLanguage: "en-US",
            })}
          </script>
        </Helmet>
      ) : null}

      <main className="pb-24 pt-20 md:pt-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <Link to="/blog/stackedin" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> StackedIN archive
          </Link>

          {isLoading ? (
            <div className="mt-8 space-y-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-16 w-5/6" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="aspect-[16/7] w-full rounded-[2rem]" />
              <div className="grid gap-10 xl:grid-cols-[minmax(0,820px)_360px]"><Skeleton className="h-[680px] rounded-3xl" /><Skeleton className="h-[480px] rounded-3xl" /></div>
            </div>
          ) : error || !post ? (
            <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-lg md:p-12">
              <h1 className="text-2xl font-black text-foreground md:text-3xl">This post could not be loaded here.</h1>
              <p className="mt-3 text-muted-foreground">The original article is still available on StackedIN.</p>
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
                Read on StackedIN <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <>
              <header className="mx-auto mt-5 max-w-[1040px] text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">StackedIN Publication</div>
                <h1 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">{post.title}</h1>
                {post.subtitle ? <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{post.subtitle}</p> : null}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 font-semibold text-foreground"><UserRound className="h-4 w-4 text-primary" />Abhishek Panda</span>
                  {formatDate(post.publishedAt) ? <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span> : null}
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{post.readingTimeMinutes} min read</span>
                </div>

              </header>

              <div className="relative mx-auto mt-8 max-w-[1240px] xl:pr-[410px]">
                <article className="min-w-0 rounded-[1.75rem] border border-border bg-card px-5 py-8 shadow-sm sm:px-8 md:px-12 md:py-12">
                  {safeHtml ? (
                    <div ref={articleBodyRef} className="reader-prose" dangerouslySetInnerHTML={{ __html: safeHtml }} />
                  ) : (
                    <div className="rounded-2xl border border-border bg-muted/30 p-7 text-center">
                      <p className="text-muted-foreground">Substack did not expose the full body through the public feed.</p>
                      <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-primary">Continue on StackedIN <ExternalLink className="h-4 w-4" /></a>
                    </div>
                  )}

                  <div className="mt-12 border-t border-border pt-8">
                    <div className="rounded-2xl bg-muted/55 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.15em] text-primary">Keep reading</p>
                        <h2 className="mt-2 text-xl font-black text-foreground">More architecture, cloud, and AI insights</h2>
                      </div>
                      <Link to="/blog/stackedin" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground sm:mt-0">Browse all posts <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
                    </div>
                  </div>
                </article>

                <aside className="reader-fixed-sidebar reader-sidebar-scrollbar mt-10 min-w-0 xl:mt-0">
                  <LongformSidebar
                    readMinutes={post.readingTimeMinutes}
                    progressPercent={progressPercent}
                    toc={toc}
                    activeHeadingId={activeHeadingId}
                    popularTitle="Latest from StackedIN"
                    popularItems={relatedPosts}
                    popularCta={{ label: "View the full archive", to: "/blog/stackedin" }}
                    newsletterTitle="Read StackedIN in your inbox"
                    newsletterDescription="Practical notes on architecture, cloud, AI, and building software that lasts."
                    newsletterTo="/#newsletter"
                    onTocClick={handleTocClick}
                    onScrollTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    onScrollBottom={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
                    tocFirst
                    afterToc={
                      <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                        <p className="text-sm font-semibold text-foreground">Share this article</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Shares the original StackedIN publication URL.</p>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-[#004182]">
                            <FaLinkedinIn className="h-4 w-4" /> LinkedIn
                          </a>
                          <button type="button" onClick={() => void shareToInstagram()} aria-label="Share on Instagram" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] px-2 py-2.5 text-xs font-semibold text-white transition hover:brightness-110">
                            <FaInstagram className="h-4 w-4" /> Instagram
                          </button>
                          <a href={xShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                            <FaXTwitter className="h-4 w-4" /> X
                          </a>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <button type="button" onClick={() => void copyArticleLink()} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary">
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Link copied" : "Copy link"}
                          </button>
                          <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary">Original <ExternalLink className="h-3.5 w-3.5" /></a>
                        </div>
                        {instagramReady ? <p role="status" className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Link copied—paste it into Instagram.</p> : null}
                      </div>
                    }
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      <Dialog
        open={Boolean(lightboxImage)}
        onOpenChange={(open) => {
          if (!open) {
            setLightboxImage(null);
            setImageZoom(1);
          }
        }}
      >
        <DialogContent className="h-[92vh] w-[96vw] max-w-[96vw] overflow-hidden border-white/15 bg-black/95 p-0 text-white sm:rounded-2xl">
          <DialogTitle className="sr-only">Article image viewer</DialogTitle>
          <DialogDescription className="sr-only">Zoom and inspect this article image.</DialogDescription>
          <div
            className="h-full overflow-auto overscroll-contain p-4 pt-16 sm:p-8 sm:pt-16"
            onWheel={(event) => {
              if (!event.ctrlKey && !event.metaKey) return;
              event.preventDefault();
              setImageZoom((value) => Math.min(4, Math.max(0.5, value + (event.deltaY < 0 ? 0.2 : -0.2))));
            }}
          >
            <div className="flex min-h-full min-w-full items-center justify-center">
              {lightboxImage ? (
                <img
                  src={lightboxImage.src}
                  alt={lightboxImage.alt}
                  className="h-auto object-contain transition-[width] duration-200"
                  style={{ width: `${imageZoom * 100}%`, maxWidth: "none" }}
                  draggable={false}
                />
              ) : null}
            </div>
          </div>
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/75 p-1.5 shadow-xl backdrop-blur">
            <button type="button" onClick={() => setImageZoom((value) => Math.max(0.5, value - 0.25))} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15" aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setImageZoom(1)} className="min-w-14 rounded-full px-2 py-2 text-xs font-bold text-white transition hover:bg-white/15" aria-label="Reset zoom">
              {Math.round(imageZoom * 100)}%
            </button>
            <button type="button" onClick={() => setImageZoom((value) => Math.min(4, value + 0.25))} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15" aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
