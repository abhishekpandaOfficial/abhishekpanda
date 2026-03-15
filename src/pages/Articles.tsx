import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Newspaper,
  Search,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ArticlesGrid from "@/components/articles/ArticlesGrid";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleDetail from "@/components/articles/ArticleDetail";
import { ARTICLES, ARTICLES_BY_SLUG, compareArticles } from "@/content/articles";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
type ArticleSortMode = "latest" | "top" | "title" | "date";

const parseArticleDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function Articles() {
  const { slug } = useParams();
  const article = slug ? ARTICLES_BY_SLUG.get(slug) : null;
  const isDetail = Boolean(slug);
  const isBoundDetail = Boolean(isDetail && article);

  const title = article ? `${article.title} | Articles | Abhishek Panda` : "Articles | Abhishek Panda";
  const description = article
    ? article.description
    : "A clean archive of engineering articles with focused cards and fast filtering.";
  const canonical = `${SITE_URL}${isDetail ? `/articles/${slug}` : "/articles"}`;

  const [filter, setFilter] = useState<ArticleSortMode>("latest");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const tagGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of ARTICLES) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

    let list = ARTICLES.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesTag = selectedTag === "All" || entry.tags.includes(selectedTag);
      return matchesQuery && matchesTag;
    });

    if (filter === "date" && selectedDateObj) {
      list = list.filter((entry) => {
        const articleDate = parseArticleDate(entry.publishedAt);
        return articleDate ? articleDate.toDateString() === selectedDateObj.toDateString() : false;
      });
    }

    return [...list].sort((a, b) => {
      const featuredSort = compareArticles(a, b);
      const dateA = parseArticleDate(a.publishedAt)?.getTime() ?? 0;
      const dateB = parseArticleDate(b.publishedAt)?.getTime() ?? 0;
      if (filter === "top") return b.readMinutes - a.readMinutes || dateB - dateA;
      if (filter === "title") return a.title.localeCompare(b.title);
      if (filter === "latest") return featuredSort;
      return featuredSort || dateB - dateA;
    });
  }, [filter, search, selectedDate, selectedTag]);

  const latestPublishedAt = ARTICLES[0]?.publishedAt ?? "Recently";
  const totalReadMinutes = ARTICLES.reduce((sum, entry) => sum + entry.readMinutes, 0);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        {isBoundDetail ? (
          <div className="w-full px-0 md:px-4 xl:px-6">
            <ArticleDetail article={article} />
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {isDetail ? (
              <section className="py-20 text-center">
                <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10">
                  <p className="editorial-kicker text-primary">Article not found</p>
                  <h1 className="editorial-title mt-3 text-3xl font-black text-foreground">That article route does not exist yet.</h1>
                  <p className="editorial-copy mt-4 text-muted-foreground">
                    Future HTML files can be integrated into this hub and bound to their own article routes.
                  </p>
                  <Link
                    to="/articles"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Return to Articles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/90 p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.55)] md:p-8 lg:p-10"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.9))] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))]" />
                  <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_320px]">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        <Newspaper className="h-4 w-4" />
                        Articles Hub
                      </div>
                      <h1 className="editorial-title mt-5 max-w-3xl text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
                        Clean article cards with tighter alignment.
                      </h1>
                      <p className="editorial-copy mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
                        Browse the archive with stronger tech-stack tagging, faster filtering, and cards that stay balanced at every screen size.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          key="All"
                          type="button"
                          onClick={() => setSelectedTag("All")}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selectedTag === "All"
                              ? "border-foreground bg-foreground text-background"
                              : "border-border/70 bg-background/75 text-foreground hover:border-foreground/40"
                          }`}
                        >
                          All
                        </button>
                        {tagGroups.map((item) => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => setSelectedTag(item.tag)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              selectedTag === item.tag
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/70 bg-background/75 text-foreground hover:border-foreground/40"
                            }`}
                          >
                            {item.tag}
                            <span className={`ml-2 text-xs ${selectedTag === item.tag ? "text-background/80" : "text-muted-foreground"}`}>
                              {item.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                      <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background/95 to-cyan-500/10 p-5">
                        <p className="editorial-kicker text-muted-foreground">Published</p>
                        <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground">{ARTICLES.length}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Live cards in the archive.</p>
                      </div>
                      <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background/95 to-blue-500/10 p-5">
                        <p className="editorial-kicker text-muted-foreground">Latest update</p>
                        <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-foreground">{latestPublishedAt}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Most recent publish date.</p>
                      </div>
                      <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background/95 to-indigo-500/10 p-5">
                        <p className="editorial-kicker text-muted-foreground">Reading time</p>
                        <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-foreground">{totalReadMinutes} mins</p>
                        <p className="mt-2 text-sm text-muted-foreground">Total estimated reading time.</p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                <section className="mt-8 flex flex-col gap-4 rounded-[28px] border border-border/60 bg-card/75 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search title, description, or tags"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as ArticleSortMode)}
                      className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground outline-none"
                    >
                      <option value="latest">Latest first</option>
                      <option value="top">Longest reads</option>
                      <option value="title">Title A-Z</option>
                      <option value="date">Specific date</option>
                    </select>

                    {filter === "date" ? (
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground outline-none"
                      />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSelectedTag("All");
                        setSelectedDate("");
                        setFilter("latest");
                      }}
                      className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition hover:border-foreground/30"
                    >
                      Reset
                    </button>
                  </div>
                </section>

                <section className="mt-10 space-y-10">
                  <section>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="editorial-kicker text-primary">All articles</p>
                        <h2 className="editorial-title mt-2 text-3xl font-black text-foreground">Browse the archive</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{filteredArticles.length}</span> article{filteredArticles.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ArticlesGrid articles={filteredArticles} />
                  </section>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
