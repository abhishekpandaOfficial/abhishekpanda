import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import { LOCAL_BLOG_POSTS } from "@/content/blogs";
import { BLOG_SERIES, BLOG_SERIES_BY_SLUG, matchesBlogSeries } from "@/lib/blogSeries";
import { SubstackCollection } from "@/components/blog/SubstackCollection";

const isMissingTableError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "PGRST205";
};

const getPublishingChannel = (tags: string[] | null | undefined): "personal" | "techhub" => {
  const hit = (tags || []).find((t) => t.toLowerCase().startsWith("channel:"));
  if (!hit) return "personal";
  const raw = hit.split(":")[1]?.toLowerCase();
  return raw === "techhub" ? "techhub" : "personal";
};

const Blog = () => {
  const [searchParams] = useSearchParams();
  const selectedSeriesSlug = searchParams.get("series");
  const selectedSeries = selectedSeriesSlug ? BLOG_SERIES_BY_SLUG.get(selectedSeriesSlug) || null : null;

  const { data: posts = [] } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!res.error) return res.data || [];

      if (isMissingTableError(res.error)) {
        const fallback = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false });
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }

      throw res.error;
    },
  });

  const localPosts = useMemo(
    () =>
      LOCAL_BLOG_POSTS.map((post) => ({
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
      })),
    []
  );

  const mergedPosts = useMemo(() => {
    const map = new Map<string, any>();
    localPosts.forEach((post) => map.set(post.slug, post));
    posts.forEach((post) => {
      if (!map.has(post.slug)) map.set(post.slug, post);
    });
    return Array.from(map.values()).sort((a, b) => {
      const aDate = new Date((a.original_published_at || a.published_at || a.updated_at || 0) as string).getTime();
      const bDate = new Date((b.original_published_at || b.published_at || b.updated_at || 0) as string).getTime();
      return bDate - aDate;
    });
  }, [localPosts, posts]);

  const personalPosts = useMemo(
    () => mergedPosts.filter((p) => getPublishingChannel(p.tags || []) === "personal"),
    [mergedPosts]
  );

  const seriesPostCounts = useMemo(
    () =>
      new Map(
        BLOG_SERIES.map((series) => [
          series.slug,
          personalPosts.filter((post) => matchesBlogSeries(series, post)).length,
        ]),
      ),
    [personalPosts]
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
              <h1 className="editorial-title text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                The <span className="gradient-text">Engineering</span> Blog
              </h1>
              <p className="editorial-copy text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Insights, tutorials, and deep dives into .NET, AI/ML, cloud architecture, and modern software engineering
              </p>
            </motion.div>

          </div>
        </section>

        <SubstackCollection />

        <section className="container mx-auto px-4">
          <div className="mb-8 rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="editorial-kicker text-primary">Blog Series Hub</p>
                <h2 className="editorial-title mt-2 text-3xl font-black text-foreground md:text-4xl">
                  Structured Series Cards in the Exact Learning Order
                </h2>
                <p className="editorial-copy mt-3 text-sm text-muted-foreground md:text-base">
                  Mastery tracks for C#, architecture, cloud, AI/ML, frontend, data, DevOps, blockchain, and Web3.
                  Click a card to open that series TOC directly with its chapters, topics, and matching website posts.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedSeries ? (
                  <>
                    <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                      Active Series: {selectedSeries.title}
                    </div>
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      Clear Series
                    </Link>
                  </>
                ) : (
                  <div className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
                    21 ordered mastery tracks
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <BlogSeriesGrid counts={seriesPostCounts} selectedSlug={selectedSeriesSlug} />
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
