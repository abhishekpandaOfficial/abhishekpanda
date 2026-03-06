import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Newspaper, Timer } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Markdown } from "@/components/blog/Markdown";
import { useTheme } from "@/components/ThemeProvider";
import {
  LOCAL_BLOG_LOGOS,
  getLocalBlogRelatedPosts,
  getRenderableLocalBlogHtml,
  type LocalBlogPostRecord,
} from "@/content/blogs";
import { ARTICLES } from "@/content/articles";

type LocalBlogPostViewProps = {
  post: LocalBlogPostRecord;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://www.abhishekpanda.com";

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function LocalBlogPostView({ post }: LocalBlogPostViewProps) {
  const { theme } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [frameHeight, setFrameHeight] = useState(1000);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const htmlContent = useMemo(() => getRenderableLocalBlogHtml(post), [post]);
  const relatedBlogs = useMemo(() => getLocalBlogRelatedPosts(post), [post]);
  const relatedArticles = useMemo(
    () =>
      ARTICLES.filter((article) => article.tags.some((tag) => post.tags.includes(tag)))
        .slice(0, 3),
    [post.tags]
  );

  const updateFrameHeight = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    const body = iframe.contentDocument.body;
    const doc = iframe.contentDocument.documentElement;
    setFrameHeight(Math.max(body.scrollHeight, body.offsetHeight, doc?.scrollHeight || 0, 900));
  };

  const canonical = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | Abhishek Panda Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto max-w-[1320px] px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="min-w-0">
              <Link
                to="/blog"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <header className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                    Website Blog
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {post.publishedAt}
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {post.readingTimeMinutes} min read
                  </span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">{post.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{post.excerpt}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] font-semibold text-foreground/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="mt-8 rounded-[2rem] border border-border/60 bg-card/80 p-5 md:p-7">
                {htmlContent ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white">
                    <iframe
                      ref={iframeRef}
                      title={post.title}
                      srcDoc={htmlContent}
                      className="w-full border-0"
                      style={{ height: frameHeight }}
                      onLoad={() => {
                        updateFrameHeight();
                        window.setTimeout(updateFrameHeight, 150);
                        window.setTimeout(updateFrameHeight, 500);
                      }}
                    />
                  </div>
                ) : (
                  <Markdown
                    value={post.content}
                    codeTheme={theme === "dark" ? "github-dark-default" : "github-light-default"}
                  />
                )}
              </div>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Timer className="h-4 w-4" />
                  Reading Timer
                </div>
                <div className="mt-4 text-3xl font-black tracking-tight text-foreground">{formatElapsed(elapsedSeconds)}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Current reading session timer. Estimated completion is {post.readingTimeMinutes} minutes.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Clock className="h-4 w-4" />
                  Blog Signals
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {LOCAL_BLOG_LOGOS.map((logo) => {
                    const Icon = logo.icon;
                    return (
                      <div
                        key={logo.name}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm font-semibold"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{logo.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <BookOpen className="h-4 w-4" />
                  Related Blogs
                </div>
                <div className="mt-4 space-y-3">
                  {relatedBlogs.length ? (
                    relatedBlogs.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/blog/${item.slug}`}
                        className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.excerpt}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
                      Upload more markdown or HTML blog files into the blog content folder to build related blog recommendations.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Newspaper className="h-4 w-4" />
                  Related Articles
                </div>
                <div className="mt-4 space-y-3">
                  {relatedArticles.length ? (
                    relatedArticles.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/articles/${item.slug}`}
                        className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
                      Matching website articles will appear here when tags overlap.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
