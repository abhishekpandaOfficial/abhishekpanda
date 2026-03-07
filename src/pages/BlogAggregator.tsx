import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BLOG_SERIES, matchesBlogSeries } from "@/lib/blogSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";

const matchesSeriesSearch = (query: string, series: (typeof BLOG_SERIES)[number]) => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")}`.toLowerCase();
  return source.includes(query);
};

export default function BlogAggregator() {
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();
  const { personalPosts, isLoading, getTagStyle } = usePublishedPersonalBlogs();

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

  const filteredPosts = useMemo(
    () =>
      personalPosts.filter((post) => {
        if (!query) return true;
        const source = `${post.title} ${post.excerpt || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
        return source.includes(query);
      }),
    [personalPosts, query],
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
                All Blogs Hub
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                Explore Every <span className="gradient-text">Blog Series</span> and Post
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                Open any mastery card to jump directly into that series TOC, then continue into the website blog posts connected to it.
                This is the main route for all blog series and all readable website blog cards.
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
                placeholder="Search series or blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-2xl border-border bg-card pl-12 text-lg"
              />
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Blog Cards</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Read Any Blog Card Directly</h2>
              </div>
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open Engineering Blog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-80 rounded-2xl border border-border/60 bg-card/60" />
                ))}
              </div>
            ) : filteredPosts.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post, index) => (
                  <BlogPostCard key={post.slug} post={post} index={index} getTagStyle={getTagStyle} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-border/70 bg-card/70 p-10 text-center">
                <h3 className="text-xl font-bold text-foreground">No matching blog cards found.</h3>
                <p className="mt-3 text-muted-foreground">Try a different search or add more folder-backed blog posts to the website pipeline.</p>
              </div>
            )}
          </div>

          <div className="mt-10 rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Series Library</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">Explore Blog Series</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                  After the blog cards, open any numbered mastery series to jump straight into its TOC with modules, chapters, topics, and attached website posts.
                </p>
              </div>
              <div className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
                {filteredSeries.length} of {BLOG_SERIES.length} series
              </div>
            </div>

            <div className="mt-6">
              {filteredSeries.length ? (
                <BlogSeriesGrid counts={visibleSeriesCounts} seriesList={filteredSeries} />
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-background/70 p-8 text-center text-muted-foreground">
                  No series cards match that search.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
