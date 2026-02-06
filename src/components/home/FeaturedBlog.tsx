import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, Lock, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const FeaturedBlog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['featured-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getReadTime = (content: string | null) => {
    if (!content) return "5 min";
    const words = content.split(/\s+/).length;
    return `${Math.ceil(words / 200)} min`;
  };

  if (isLoading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  const mainFeatured = posts[0];
  const gridBlogs = posts.slice(1, 4);

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
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Featured Insights
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into .NET, Microservices, LLMs, and modern software engineering
          </p>
        </motion.div>

        {/* Main Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Link to={`/blog/${mainFeatured.slug}`} className="block group">
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="relative p-8 md:p-12">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary via-secondary to-purple flex items-center justify-center flex-shrink-0 shadow-glow">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {mainFeatured.tags?.[0] && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-primary/20 text-primary border-primary/30">
                          {mainFeatured.tags[0]}
                        </span>
                      )}
                      {mainFeatured.is_premium && (
                        <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                      {mainFeatured.title}
                    </h3>
                    {mainFeatured.excerpt && (
                      <p className="text-lg text-muted-foreground mb-6 max-w-3xl">{mainFeatured.excerpt}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {mainFeatured.published_at && (
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(mainFeatured.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {getReadTime(mainFeatured.content)} read
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Blog Grid */}
        {gridBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {gridBlogs.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <Link to={`/blog/${post.slug}`} className="block group h-full">
                  <div className="relative h-full rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500">
                    <div className="relative p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        {post.is_premium && (
                          <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-secondary" />
                          </span>
                        )}
                      </div>
                      {post.tags?.[0] && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold border bg-primary/20 text-primary border-primary/30 mb-3 w-fit">
                          {post.tags[0]}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 flex-grow-0">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getReadTime(post.content)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/blog">
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
