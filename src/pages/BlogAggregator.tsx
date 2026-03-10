import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import { BLOG_SERIES, matchesBlogSeries } from "@/lib/blogSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";

const matchesSeriesSearch = (query: string, series: (typeof BLOG_SERIES)[number]) => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")}`.toLowerCase();
  return source.includes(query);
};

export default function BlogAggregator() {
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();
  const { personalPosts } = usePublishedPersonalBlogs();

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

  const filteredSeries = useMemo(
    () => (query ? BLOG_SERIES.filter((series) => matchesSeriesSearch(query, series)) : BLOG_SERIES),
    [query],
  );

  const visibleSeriesCounts = useMemo(
    () => new Map(filteredSeries.map((series) => [series.slug, seriesCounts.get(series.slug) || 0])),
    [filteredSeries, seriesCounts],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <BookOpen className="h-4 w-4" />
                All Cheatsheets Hub
              </div>
              <h1 className="editorial-title mt-6 text-4xl font-black md:text-5xl lg:text-6xl">
                Explore Every <span className="gradient-text">Cheatsheet Series</span>
              </h1>
              <p className="editorial-copy mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                Open any mastery card to jump directly into that series TOC and static guide.
                This is the main route for all mastery cheatsheets and structured series tracks.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative mx-auto mt-8 max-w-2xl"
            >
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search cheatsheets or series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-2xl border-border bg-card pl-12 text-lg"
              />
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="editorial-kicker text-primary">Series Library</p>
              <h2 className="editorial-title mt-2 text-3xl font-black text-foreground md:text-4xl">Explore Cheatsheet Series</h2>
              <p className="editorial-copy mt-3 max-w-3xl text-sm text-muted-foreground">
                Open any mastery track directly from its own responsive card with the right hero visual, logo stack, and tags.
              </p>
            </div>
            <div className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
              {filteredSeries.length} of {BLOG_SERIES.length} series
            </div>
          </div>

          <div className="mt-8">
            {filteredSeries.length ? (
              <BlogSeriesGrid counts={visibleSeriesCounts} seriesList={filteredSeries} />
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/70 p-8 text-center text-muted-foreground">
                No series cards match that search.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
