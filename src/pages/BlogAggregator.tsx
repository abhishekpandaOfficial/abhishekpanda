import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  Box,
  Braces,
  Cable,
  Cloud,
  Code2,
  Database,
  GitBranch,
  HardDrive,
  Layers3,
  ListFilter,
  RotateCcw,
  ScrollText,
  Search,
  ServerCog,
  Workflow,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import { BLOG_SERIES, getBlogSeriesHref, matchesBlogSeries } from "@/lib/blogSeries";
import { getBlogSeriesVisual } from "@/lib/blogVisuals";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";

const HERO_ICONS = [
  { icon: Braces, label: "Backend" },
  { icon: Blocks, label: ".NET" },
  { icon: Database, label: "Data" },
  { icon: Box, label: "Containers" },
  { icon: Cloud, label: "Cloud" },
  { icon: Workflow, label: "Architecture" },
  { icon: Cable, label: "Distributed" },
  { icon: GitBranch, label: "Patterns" },
  { icon: ServerCog, label: "Platform" },
  { icon: HardDrive, label: "Systems" },
  { icon: Layers3, label: "Stacks" },
  { icon: Code2, label: "Engineering" },
];

const TECH_STACK_LOGOS = [
  { src: "/brand-logos/stacks/csharp.svg", alt: "C#" },
  { src: "/brand-logos/stacks/dotnet.svg", alt: ".NET" },
  { src: "/brand-logos/stacks/docker.svg", alt: "Docker" },
  { src: "/brand-logos/stacks/kubernetes.svg", alt: "Kubernetes" },
  { src: "/brand-logos/stacks/kafka.svg", alt: "Kafka" },
  { src: "/brand-logos/stacks/postgresql.svg", alt: "PostgreSQL" },
  { src: "/brand-logos/stacks/microsoftsqlserver.svg", alt: "SQL Server" },
  { src: "/brand-logos/stacks/github.svg", alt: "GitHub" },
  { src: "/brand-logos/stacks/linux.svg", alt: "Linux" },
  { src: "/brand-logos/stacks/go.svg", alt: "Go" },
  { src: "/brand-logos/stacks/microsoftazure.svg", alt: "Azure" },
  { src: "/brand-logos/stacks/angular.svg", alt: "Angular" },
];

const TECH_TOPICS = ["C#", ".NET", "Docker", "Kubernetes", "Kafka", "PostgreSQL", "Linux", "Architecture"];
type TechHubSortMode = "latest" | "coverage" | "title";

const matchesSeriesSearch = (query: string, series: (typeof BLOG_SERIES)[number]) => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")} ${series.keywords.join(" ")}`.toLowerCase();
  return source.includes(query);
};

export default function BlogAggregator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<TechHubSortMode>("latest");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const query = searchQuery.trim().toLowerCase();
  const { personalPosts } = usePublishedPersonalBlogs();
  const { theme } = useTheme();

  const seriesCounts = useMemo(
    () =>
      new Map(
        BLOG_SERIES.map((series) => [
          series.slug,
          personalPosts.filter((post) => matchesBlogSeries(series, post)).length,
        ]),
      ),
    [personalPosts],
  );

  const filteredSeries = useMemo(() => {
    const list = BLOG_SERIES.filter((series) => {
      const matchesQuery = !query || matchesSeriesSearch(query, series);
      const matchesTopic =
        selectedTopic === "All" ||
        series.tags.some((tag) => tag.toLowerCase().includes(selectedTopic.toLowerCase())) ||
        series.keywords.some((keyword) => keyword.toLowerCase().includes(selectedTopic.toLowerCase()));

      return matchesQuery && matchesTopic;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "title") return a.title.localeCompare(b.title);
      if (sortMode === "coverage") {
        return (seriesCounts.get(b.slug) || 0) - (seriesCounts.get(a.slug) || 0) || a.title.localeCompare(b.title);
      }
      return BLOG_SERIES.findIndex((item) => item.slug === a.slug) - BLOG_SERIES.findIndex((item) => item.slug === b.slug);
    });
  }, [query, selectedTopic, sortMode, seriesCounts]);

  const visibleSeriesCounts = useMemo(
    () => new Map(filteredSeries.map((series) => [series.slug, seriesCounts.get(series.slug) || 0])),
    [filteredSeries, seriesCounts],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden border-y border-border/60 py-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.13),transparent_30%)]" />
          <div className="relative w-full px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start"
            >
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <ScrollText className="h-4 w-4" />
                  TechHub
                </div>
                <h1 className="editorial-title mt-5 max-w-4xl text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
                  Master the stacks that ship.
                </h1>

                <div className="mt-6 max-w-3xl rounded-[28px] border border-border/70 bg-background/80 p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
                  <div className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-card/80 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="h-4 w-4" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search C#, .NET internals, Docker, Kubernetes, PostgreSQL, architecture, Linux..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 md:text-[15px]"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TECH_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(topic);
                          setSearchQuery(topic);
                        }}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          selectedTopic === topic
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/70 bg-background/75 text-foreground hover:border-foreground/40"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

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

                <div className="mt-4 flex flex-wrap gap-2">
                  {TECH_STACK_LOGOS.map((logo) => (
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

              <div className="relative min-w-0 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-card/95 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card/95 to-transparent" />
                <motion.div
                  animate={{ x: [0, -420, 0] }}
                  transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                  className="flex gap-4 overflow-visible py-2 pr-10"
                >
                  {filteredSeries.slice(0, Math.min(6, filteredSeries.length)).map((series, index) => (
                    <motion.div
                      key={series.slug}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className={`w-[320px] shrink-0 ${index % 2 === 0 ? "translate-y-0" : "translate-y-8"} md:w-[360px]`}
                    >
                      <Link
                        to={getBlogSeriesHref(series)}
                        className="group block overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_80px_rgba(59,130,246,0.16)]"
                      >
                        <div className="aspect-[16/10] overflow-hidden border-b border-border/60">
                          <img
                            src={getBlogSeriesVisual(series, theme)}
                            alt={series.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl font-black text-foreground">{series.title}</h3>
                            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-foreground/60 transition group-hover:translate-x-1 group-hover:text-foreground" />
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{series.subtitle}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {series.tags.slice(0, 3).map((tag) => (
                              <span
                                key={`${series.slug}-${tag}`}
                                className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/85"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/75 px-4 py-5 md:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <ListFilter className="h-3.5 w-3.5" />
                Sorting + Filters
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TECH_STACK_LOGOS.map((logo) => (
                  <span
                    key={`bar-${logo.alt}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-white/85 p-2 shadow-sm dark:bg-slate-950/70"
                    title={logo.alt}
                  >
                    <img src={logo.src} alt={logo.alt} className="h-full w-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as TechHubSortMode)}
                className="min-w-[180px] rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-primary/5 px-4 py-3 text-sm font-semibold text-foreground outline-none shadow-[0_18px_35px_-25px_rgba(34,211,238,0.55)] dark:from-slate-950 dark:to-primary/10"
              >
                <option value="latest">Latest first</option>
                <option value="coverage">Most coverage</option>
                <option value="title">Title A-Z</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTopic("All");
                  setSortMode("latest");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-95"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <div className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
                {filteredSeries.length} of {BLOG_SERIES.length} series
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-4 md:px-6 lg:px-8">
          {filteredSeries.length ? (
            <BlogSeriesGrid counts={visibleSeriesCounts} seriesList={filteredSeries} />
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/70 p-8 text-center text-muted-foreground">
              No TechHub series cards match that search.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
