import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Binary,
  Blocks,
  Bot,
  Braces,
  Cable,
  CircuitBoard,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  ListFilter,
  Newspaper,
  RotateCcw,
  Search,
  Workflow,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ArticlesGrid from "@/components/articles/ArticlesGrid";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleDetail from "@/components/articles/ArticleDetail";
import { ARTICLES, ARTICLES_BY_SLUG, compareArticles } from "@/content/articles";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
type ArticleSortMode = "latest" | "top" | "title" | "date";

const HERO_ICONS = [
  { icon: Braces, label: "Code" },
  { icon: Cpu, label: "Systems" },
  { icon: Database, label: "Data" },
  { icon: Workflow, label: "Pipelines" },
  { icon: Cloud, label: "Cloud" },
  { icon: Bot, label: "AI" },
  { icon: GitBranch, label: "Architecture" },
  { icon: CircuitBoard, label: "Infra" },
  { icon: Binary, label: "Low Level" },
  { icon: Cable, label: "Messaging" },
  { icon: Blocks, label: ".NET" },
];

const ARTICLE_STACK_LOGOS = [
  { src: "/brand-logos/stacks/csharp.svg", alt: "C#" },
  { src: "/brand-logos/stacks/dotnet.svg", alt: ".NET" },
  { src: "/brand-logos/stacks/docker.svg", alt: "Docker" },
  { src: "/brand-logos/stacks/kubernetes.svg", alt: "Kubernetes" },
  { src: "/brand-logos/stacks/kafka.svg", alt: "Kafka" },
  { src: "/brand-logos/stacks/openai.svg", alt: "OpenAI" },
  { src: "/brand-logos/stacks/github.svg", alt: "GitHub" },
  { src: "/brand-logos/stacks/postgresql.svg", alt: "PostgreSQL" },
  { src: "/brand-logos/stacks/microsoftazure.svg", alt: "Azure" },
  { src: "/brand-logos/stacks/aws.svg", alt: "AWS" },
];

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
      if (filter === "latest") return dateB - dateA || featuredSort || a.title.localeCompare(b.title);
      return featuredSort || dateB - dateA;
    });
  }, [filter, search, selectedDate, selectedTag]);

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
          <div className="w-full px-0">
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
                  className="relative overflow-hidden border-y border-border/60 bg-card/90 px-4 py-8 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.55)] md:px-6 md:py-10 lg:px-8"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.9))] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))]" />
                  <div className="relative grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        <Newspaper className="h-4 w-4" />
                        Articles
                      </div>
                      <h1 className="editorial-title mt-5 max-w-4xl text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
                        Sharp reads for engineers who build.
                      </h1>

                      <div className="mt-6 max-w-3xl rounded-[28px] border border-border/70 bg-background/80 p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
                        <div className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-card/80 px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Search className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search multithreading, system design, microservices, .NET, AI, architecture..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground md:text-[15px]"
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
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
                            Everything
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
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative min-w-0 overflow-hidden">
                      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-card/95 to-transparent" />
                      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card/95 to-transparent" />
                      <motion.div
                        animate={{ x: [0, -420, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="flex gap-4 overflow-visible py-2 pr-10"
                      >
                        {filteredArticles.slice(0, Math.min(6, filteredArticles.length)).map((entry, index) => (
                          <div
                            key={entry.slug}
                            className={`w-[320px] shrink-0 ${index % 2 === 0 ? "translate-y-0" : "translate-y-8"} md:w-[360px]`}
                          >
                            <ArticleCard article={entry} featured={index < 2} />
                          </div>
                        ))}
                      </motion.div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {HERO_ICONS.map(({ icon: Icon, label }) => (
                          <div
                            key={label}
                            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75 backdrop-blur"
                          >
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                <section className="mt-8 flex flex-col gap-4 border-y border-border/60 bg-card/75 px-4 py-5 md:px-6 lg:px-8">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        <ListFilter className="h-3.5 w-3.5" />
                        Sorting + Filters
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {ARTICLE_STACK_LOGOS.map((logo) => (
                          <span
                            key={logo.alt}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-white/85 p-2 shadow-sm dark:bg-slate-950/70"
                            title={logo.alt}
                          >
                            <img src={logo.src} alt={logo.alt} className="h-full w-full object-contain" loading="lazy" />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as ArticleSortMode)}
                      className="min-w-[180px] rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-primary/5 px-4 py-3 text-sm font-semibold text-foreground outline-none shadow-[0_18px_35px_-25px_rgba(34,211,238,0.55)] dark:from-slate-950 dark:to-primary/10"
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
                      className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-95"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                    </div>
                  </div>
                </section>

                <section className="mt-10 space-y-10">
                  <section className="px-4 md:px-6 lg:px-8">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
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
