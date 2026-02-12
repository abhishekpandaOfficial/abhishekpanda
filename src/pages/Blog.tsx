import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Clock,
  Calendar,
  Lock,
  ArrowRight,
  Filter,
  Sparkles,
  FileText,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LEVELS = ["beginner", "fundamentals", "intermediate", "general", "architect"] as const;

const isMissingTableError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "PGRST205";
};

const titleCaseLevel = (level: string | null | undefined) => {
  if (!level) return "General";
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
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

  const categories = [
    { name: "All", count: posts.length },
    ...Array.from(new Set(posts.flatMap((p) => p.tags || []).filter(Boolean))).map((cat) => ({
      name: cat as string,
      count: posts.filter((p) => (p.tags || []).includes(cat as string)).length,
    })),
  ];

  const levelCounts = [
    { name: "All", count: posts.length },
    ...LEVELS.map((level) => ({
      name: titleCaseLevel(level),
      count: posts.filter((p) => (p as { level?: string | null }).level === level).length,
    })),
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (post.tags || []).includes(selectedCategory);
    const level = (post as { level?: string | null }).level || "general";
    const matchesLevel = selectedLevel === "All" || level === selectedLevel.toLowerCase();
    const matchesPremium = !showPremiumOnly || post.is_premium;
    return matchesSearch && matchesCategory && matchesLevel && matchesPremium;
  });

  const getReadTime = (minutes: number | null | undefined) => {
    const m = typeof minutes === "number" && Number.isFinite(minutes) ? minutes : 5;
    return `${Math.max(1, Math.round(m))} min`;
  };

  const readMinutesFromRow = (row: unknown) => {
    if (!row || typeof row !== "object") return undefined;
    const v = (row as { reading_time_minutes?: unknown }).reading_time_minutes;
    return typeof v === "number" ? v : undefined;
  };

  const viewCountFromRow = (row: unknown) => {
    if (!row || typeof row !== "object") return 0;
    const v = (row as { views?: unknown }).views;
    return typeof v === "number" ? v : 0;
  };

  const updatedAtFromRow = (row: unknown) => {
    if (!row || typeof row !== "object") return null;
    const v = (row as { updated_at?: unknown }).updated_at;
    return typeof v === "string" ? v : null;
  };

  const originalPublishedAtFromRow = (row: unknown) => {
    if (!row || typeof row !== "object") return null;
    const v = (row as { original_published_at?: unknown; published_at?: unknown }).original_published_at;
    if (typeof v === "string") return v;
    const legacy = (row as { published_at?: unknown }).published_at;
    return typeof legacy === "string" ? legacy : null;
  };

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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                The <span className="gradient-text">Engineering</span> Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Insights, tutorials, and deep dives into .NET, AI/ML, cloud architecture, and modern software engineering
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-card border-border rounded-2xl text-lg"
              />
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:w-72 flex-shrink-0"
            >
              <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Level
                  </h3>
                  <div className="space-y-2">
                    {levelCounts.map((level) => (
                      <button
                        key={level.name}
                        onClick={() => setSelectedLevel(level.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedLevel === level.name
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {level.name}
                        <span className="text-xs opacity-70">{level.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category.name
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {category.name}
                        <span className="text-xs opacity-70">{category.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPremiumOnly}
                      onChange={(e) => setShowPremiumOnly(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">Premium only</span>
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </label>
                </div>
              </div>
            </motion.aside>

            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card rounded-2xl overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Posts Available Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery || selectedCategory !== "All" || selectedLevel !== "All"
                      ? "No posts found matching your criteria."
                      : "New articles are being crafted. Check back soon for insights on .NET, AI/ML, and cloud architecture."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post, index) => {
                    const level = titleCaseLevel((post as { level?: string | null }).level || "general");
                    const originalPublishedAt = originalPublishedAtFromRow(post);
                    const updatedAt = updatedAtFromRow(post);
                    const wasUpdated =
                      !!updatedAt &&
                      !!originalPublishedAt &&
                      new Date(updatedAt).getTime() > new Date(originalPublishedAt).getTime();

                    return (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                      >
                        <Link to={`/blog/${post.slug}`} className="block group">
                          <div className={`glass-card-hover rounded-2xl overflow-hidden h-full ${post.is_premium ? "relative" : ""}`}>
                            <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20 relative overflow-hidden">
                              {post.hero_image ? (
                                <img src={post.hero_image} alt={post.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-5xl font-black gradient-text opacity-30">
                                    {post.tags?.[0]?.charAt(0) || "B"}
                                  </span>
                                </div>
                              )}
                              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                                <span className="px-2 py-1 rounded-full text-[11px] font-semibold border border-primary/30 bg-primary/15 text-primary">
                                  {level}
                                </span>
                                {post.is_premium ? (
                                  <span className="badge-premium">
                                    <Lock className="w-3 h-3" />
                                    Premium
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="p-6">
                              {post.tags?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {post.tags.map((tag: string) => (
                                    <span key={tag} className="text-primary text-xs font-semibold">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              <h2 className="font-bold text-xl text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h2>

                              {post.excerpt ? (
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                              ) : null}

                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-4 flex-wrap">
                                  {originalPublishedAt ? (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(originalPublishedAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  ) : null}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {getReadTime(readMinutesFromRow(post))} read
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {viewCountFromRow(post).toLocaleString()}
                                  </span>
                                </div>
                                {wasUpdated ? (
                                  <p className="text-xs text-muted-foreground">
                                    Updated{" "}
                                    {new Date(updatedAt!).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                ) : null}
                              </div>

                              <div className="mt-3 flex items-center justify-end">
                                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
