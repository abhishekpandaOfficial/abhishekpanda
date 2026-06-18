import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, ScrollText } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";
import { ARTICLES } from "@/content/articles";
import { BLOG_SERIES_BY_SLUG, getBlogSeriesDisplayTitle, matchesBlogSeries } from "@/lib/blogSeries";

type CheatsheetGuideShellProps = {
  iframeSrc: string;
  iframeTitle: string;
  seriesSlug: string;
  sidebarTop?: React.ReactNode;
  onIframeLoad?: (iframe: HTMLIFrameElement | null) => void;
  iframeClassName?: string;
};

export function CheatsheetGuideShell({
  iframeSrc,
  iframeTitle,
  seriesSlug,
  sidebarTop,
  onIframeLoad,
  iframeClassName,
}: CheatsheetGuideShellProps) {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);
  const series = BLOG_SERIES_BY_SLUG.get(seriesSlug) || null;

  useEffect(() => {
    const calc = () => {
      const navH = window.matchMedia("(min-width: 768px)").matches ? 80 : 64;
      setIframeHeight(window.innerHeight - navH);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    syncThemeToEmbeddedFrame(iframeRef.current, theme);
  }, [theme]);

  const relatedArticles = useMemo(() => {
    if (!series) return [];
    return ARTICLES.filter((article) =>
      matchesBlogSeries(series, {
        title: article.title,
        excerpt: article.description,
        tags: article.tags,
      }),
    ).slice(0, 6);
  }, [series]);

  const topStacks = useMemo(() => {
    const counts = new Map<string, number>();
    relatedArticles.forEach((article) => {
      article.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [relatedArticles]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-hidden">
            <iframe
              ref={iframeRef}
              title={iframeTitle}
              src={iframeSrc}
              className={iframeClassName || "block w-full border-0"}
              style={{ height: iframeHeight }}
              allow="same-origin"
              onLoad={() => {
                syncThemeToEmbeddedFrame(iframeRef.current, theme);
                onIframeLoad?.(iframeRef.current);
              }}
            />
          </div>

          <aside className="border-l border-border/60 bg-card/70 xl:sticky xl:top-20 xl:h-[calc(100vh-80px)]">
            <div className="space-y-6 p-5">
              {sidebarTop}

              <section className="rounded-[1.75rem] border border-border/60 bg-background/80 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <ScrollText className="h-3.5 w-3.5" />
                  Cheatsheet
                </div>
                <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">
                  {series ? getBlogSeriesDisplayTitle(series) : "Cheatsheet Guide"}
                </h1>
                {series ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{series.subtitle}</p> : null}
                <Link
                  to="/cheatsheets"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Browse all cheatsheets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>

              {topStacks.length ? (
                <section className="rounded-[1.75rem] border border-border/60 bg-background/80 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Tech Stack Tags</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topStacks.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-foreground/85"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-[1.75rem] border border-border/60 bg-background/80 p-5">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Related Articles</p>
                </div>
                <div className="mt-4 space-y-3">
                  {relatedArticles.length ? (
                    relatedArticles.map((article) => (
                      <Link
                        key={article.slug}
                        to={`/articles/${article.slug}`}
                        className="block rounded-2xl border border-border/60 bg-card/80 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <p className="font-semibold text-foreground">{article.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={`${article.slug}-${tag}`} className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 p-4 text-sm text-muted-foreground">
                      Related routed articles for this cheatsheet will appear here as they are tagged and published.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
