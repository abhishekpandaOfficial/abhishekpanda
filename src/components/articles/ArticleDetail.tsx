import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Layers3, Newspaper, Timer } from "lucide-react";
import { getRelatedArticles, type ArticleRecord } from "@/content/articles";

type ArticleDetailProps = {
  article: ArticleRecord;
};

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const relatedArticles = useMemo(() => getRelatedArticles(article), [article]);

  return (
    <div className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0 xl:h-full xl:min-h-0">
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-white shadow-sm xl:h-full xl:min-h-0">
          <iframe
            title={article.title}
            src={article.assetUrl}
            loading="eager"
            className="block h-[80vh] min-h-[620px] w-full border-0 bg-white md:h-[84vh] md:min-h-[760px] xl:h-full"
          />
        </div>
      </article>

      <aside className="space-y-5 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-1">
        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Timer className="h-4 w-4" />
            Reading Timer
          </div>
          <div className="mt-4 text-3xl font-black tracking-tight text-foreground">{formatElapsed(elapsedSeconds)}</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live timer for the current reading session. Estimated completion is {article.readMinutes} minutes based on article text length.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Clock3 className="h-4 w-4" />
            Technical Signals
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {article.logos.map((logo) => {
              const Icon = logo.icon;
              return (
                <div
                  key={logo.name}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold ${logo.bgClass}`}
                >
                  <Icon className={`h-4 w-4 ${logo.colorClass}`} />
                  <span className="text-foreground">{logo.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Layers3 className="h-4 w-4" />
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
                Upload more HTML files into the Articles folder and related article cards will appear here automatically.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Newspaper className="h-4 w-4" />
            Blogs & Internal Links
          </div>
          <div className="mt-4 space-y-3">
            {article.relatedBlogs.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <p className="font-semibold text-foreground">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <ArrowRight className="h-4 w-4" />
            Auto Routing
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Each HTML file in the Articles folder becomes a card on `/articles` and a routed page at `/articles/&lt;file-name&gt;`.
          </p>
        </div>
      </aside>
    </div>
  );
}
