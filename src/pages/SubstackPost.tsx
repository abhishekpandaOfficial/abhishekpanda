import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Check, Clock, Copy, ExternalLink, UserRound } from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { LongformSidebar } from "@/components/content/LongformSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { buildTocFromRoot, computeScrollProgress, getActiveHeadingId, type LongformTocItem } from "@/lib/longformNavigation";
import { fetchSubstackArchive, fetchSubstackPost, sanitizeSubstackHtml, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";

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
          to: `/blog/substack/${item.slug}`,
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
  }, [safeHtml]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-muted/40" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 transition-[width] duration-150" style={{ width: `${progressPercent}%` }} />
      </div>

      {post ? (
        <Helmet>
          <title>{post.title} | StackedIN</title>
          <meta name="description" content={post.subtitle || "Read this StackedIN article by Abhishek Panda."} />
          <link rel="canonical" href={post.canonicalUrl} />
          {post.heroImage ? <meta property="og:image" content={post.heroImage} /> : null}
        </Helmet>
      ) : null}

      <main className="pb-24 pt-28 md:pt-32">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <Link to="/blog#stackedin-posts" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
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
              <header className="mx-auto mt-8 max-w-[1120px] text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">StackedIN Publication</div>
                <h1 className="mt-6 text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.5rem]">{post.title}</h1>
                {post.subtitle ? <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">{post.subtitle}</p> : null}

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 font-semibold text-foreground"><UserRound className="h-4 w-4 text-primary" />Abhishek Panda</span>
                  {formatDate(post.publishedAt) ? <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span> : null}
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{post.readingTimeMinutes} min read</span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#004182]">
                    <FaLinkedinIn className="h-4 w-4" /> Share to LinkedIn
                  </a>
                  <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <FaXTwitter className="h-4 w-4" /> Share to X
                  </a>
                  <button type="button" onClick={() => void copyArticleLink()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/30 hover:text-primary">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy link"}
                  </button>
                  <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/30 hover:text-primary">Original post <ExternalLink className="h-4 w-4" /></a>
                </div>
              </header>

              <div className="relative mx-auto mt-12 max-w-[1200px] xl:pr-[380px]">
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
                      <Link to="/blog#stackedin-posts" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground sm:mt-0">Browse all posts <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
                    </div>
                  </div>
                </article>

                <aside className="reader-fixed-sidebar reader-sidebar-scrollbar mt-10 min-w-0 xl:mt-0">
                  <div className="mb-4 rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                    <p className="text-sm font-semibold text-foreground">Share the original article</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">These links share the canonical StackedIN URL.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004182]">
                        <FaLinkedinIn className="h-4 w-4" /> LinkedIn
                      </a>
                      <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                        <FaXTwitter className="h-4 w-4" /> X
                      </a>
                    </div>
                  </div>
                  <LongformSidebar
                    readMinutes={post.readingTimeMinutes}
                    progressPercent={progressPercent}
                    toc={toc}
                    activeHeadingId={activeHeadingId}
                    popularTitle="Latest from StackedIN"
                    popularItems={relatedPosts}
                    popularCta={{ label: "View the full archive", to: "/blog#stackedin-posts" }}
                    newsletterTitle="Read StackedIN in your inbox"
                    newsletterDescription="Practical notes on architecture, cloud, AI, and building software that lasts."
                    newsletterTo="/#newsletter"
                    onTocClick={handleTocClick}
                    onScrollTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    onScrollBottom={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
