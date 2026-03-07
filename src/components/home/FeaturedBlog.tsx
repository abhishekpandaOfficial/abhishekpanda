import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import { BLOG_SERIES, matchesBlogSeries } from "@/lib/blogSeries";
import { usePublishedPersonalBlogs, type BlogIndexRow } from "@/hooks/usePublishedPersonalBlogs";
import { LOCAL_BLOG_POSTS } from "@/content/blogs";

export const FeaturedBlog = () => {
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

  const featuredSeries = useMemo(
    () =>
      [...BLOG_SERIES]
        .sort((a, b) => (seriesCounts.get(b.slug) ?? 0) - (seriesCounts.get(a.slug) ?? 0))
        .slice(0, 6),
    [seriesCounts],
  );

  const visibleSeries = featuredSeries.length ? featuredSeries : BLOG_SERIES.slice(0, 6);

  const featuredSeriesCounts = useMemo(
    () => new Map(visibleSeries.map((series) => [series.slug, seriesCounts.get(series.slug) ?? 0])),
    [visibleSeries, seriesCounts],
  );

  const localFallbackPosts = useMemo<BlogIndexRow[]>(
    () =>
      LOCAL_BLOG_POSTS.slice(0, 3).map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        hero_image: post.heroImage,
        tags: post.tags,
        is_premium: false,
        is_published: true,
        level: post.level,
        original_published_at: post.publishedAt,
        published_at: post.publishedAt,
        meta_title: post.title,
        meta_description: post.excerpt,
        reading_time_minutes: post.readingTimeMinutes,
        views: 0,
        updated_at: post.updatedAt,
        series_name: post.seriesName,
        series_order: post.seriesOrder,
      })),
    [],
  );

  const latestPosts = useMemo(
    () => (personalPosts.length ? personalPosts.slice(0, 3) : localFallbackPosts),
    [personalPosts, localFallbackPosts],
  );

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Blog Learning Tracks
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 tracking-tight">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium learning tracks and deep dives across architecture, cloud, data, and AI. Follow a structured path from fundamentals to architect-level depth.
          </p>
        </motion.div>

        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Read from Blog Series</h3>
            <Link to="/blogs" className="text-sm font-semibold text-primary inline-flex items-center gap-2">
              Open all series
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <BlogSeriesGrid counts={featuredSeriesCounts} seriesList={visibleSeries} />
        </div>

        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Latest from Blogs Page</h3>
            <Link to="/blogs" className="text-sm font-semibold text-primary inline-flex items-center gap-2">
              View all blog cards
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-80 rounded-2xl border border-border/60 bg-card/60" />
              ))}
            </div>
          ) : latestPosts.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {latestPosts.map((post, index) => (
                <BlogPostCard key={post.slug} post={post} index={index} getTagStyle={getTagStyle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-8 text-center text-muted-foreground">
              No blog cards found yet. Add files in <code>src/content/blog</code> or publish posts to show them here.
            </div>
          )}
        </div>

        <div className="text-center">
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/blogs">
              Explore Blogs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
