import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, Grid3X3, Rows3, Search, Tags } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ArticleCard from "@/components/articles/ArticleCard";
import { ARTICLES, compareArticles, type ArticleRecord } from "@/content/articles";

type ViewMode = "grid" | "list";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export default function Insights() {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of ARTICLES) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...ARTICLES]
      .filter((item) => {
        const matchesQuery =
          !normalized ||
          item.title.toLowerCase().includes(normalized) ||
          item.description.toLowerCase().includes(normalized) ||
          item.tags.some((tag) => tag.toLowerCase().includes(normalized));
        const matchesTag = selectedTag === "All" || item.tags.includes(selectedTag);
        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        const order = compareArticles(a, b);
        if (order !== 0) return order;
        return parseDate(b.publishedAt) - parseDate(a.publishedAt);
      });
  }, [query, selectedTag]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Insights | Abhishek Panda</title>
        <meta
          name="description"
          content="Unified insights hub with every routed HTML article in grid and list views, searchable and grouped with tags."
        />
        <link rel="canonical" href={`${SITE_URL}/insights`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden border-y border-border/60 bg-card/85 px-4 py-10 md:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,250,252,0.94))] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.2),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
              <Tags className="h-4 w-4" />
              Insights Hub
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              One place for all technical insights
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">
              TechHub, AI/ML, and Articles are consolidated here. Every routed HTML article is searchable, filterable by tags, and available in both grid and list views.
            </p>

            <div className="mt-7 grid gap-3 rounded-3xl border border-border/60 bg-background/80 p-3 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.5)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
                <Search className="h-4 w-4 text-primary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, description, or tags"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>

              <div className="inline-flex overflow-hidden rounded-xl border border-border/70 bg-card/80">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${
                    viewMode === "grid"
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-2 border-l border-border/70 px-4 py-2.5 text-sm font-semibold transition ${
                    viewMode === "list"
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Rows3 className="h-4 w-4" />
                  List
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag("All")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedTag === "All"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 bg-background/80 text-foreground hover:border-foreground/40"
                }`}
              >
                All ({ARTICLES.length})
              </button>
              {tags.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setSelectedTag(item.tag)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedTag === item.tag
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/70 bg-background/80 text-foreground hover:border-foreground/40"
                  }`}
                >
                  {item.tag} ({item.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> insight{filtered.length === 1 ? "" : "s"}
              {selectedTag !== "All" ? ` in ${selectedTag}` : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/50 p-10 text-center">
              <h2 className="text-2xl font-black text-foreground">No insights found</h2>
              <p className="mt-3 text-muted-foreground">Try a different keyword or switch to another tag.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
              {filtered.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((article) => (
                <InsightListItem key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

type InsightListItemProps = {
  article: ArticleRecord;
};

function InsightListItem({ article }: InsightListItemProps) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group block rounded-3xl border border-border/70 bg-card/80 p-5 transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_20px_45px_-35px_rgba(15,23,42,0.6)]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{article.eyebrow}</p>
          <h2 className="mt-1 line-clamp-2 text-xl font-black text-foreground md:text-2xl">{article.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground">
            Open
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
