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
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Extract unique categories from posts
  const categories = [
    { name: "All", count: posts.length },
    ...Array.from(new Set(posts.map(p => p.tags?.[0]).filter(Boolean)))
      .map(cat => ({
        name: cat as string,
        count: posts.filter(p => p.tags?.[0] === cat).length
      }))
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.tags?.[0] === selectedCategory;
    const matchesPremium = !showPremiumOnly || post.is_premium;
    return matchesSearch && matchesCategory && matchesPremium;
  });

  // Estimate read time from content length
  const getReadTime = (content: string | null) => {
    if (!content) return "5 min";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
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
                Insights, tutorials, and deep dives into .NET, AI/ML, cloud architecture, 
                and modern software engineering
              </p>
            </motion.div>

            {/* Search */}
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

        {/* Filters & Content */}
        <section className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="glass-card rounded-2xl p-6 sticky top-24">
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

                <div className="mt-6 pt-6 border-t border-border">
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

            {/* Posts Grid */}
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
                    {searchQuery || selectedCategory !== "All" 
                      ? "No posts found matching your criteria."
                      : "New articles are being crafted. Check back soon for insights on .NET, AI/ML, and cloud architecture."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="block group">
                        <div className={`glass-card-hover rounded-2xl overflow-hidden h-full ${post.is_premium ? "relative" : ""}`}>
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20 relative overflow-hidden">
                            {post.hero_image ? (
                              <img 
                                src={post.hero_image} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-black gradient-text opacity-30">
                                  {post.tags?.[0]?.charAt(0) || 'B'}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                              {post.is_premium && (
                                <span className="badge-premium">
                                  <Lock className="w-3 h-3" />
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {post.tags?.[0] && (
                              <span className="text-primary text-sm font-semibold">
                                {post.tags[0]}
                              </span>
                            )}
                            <h2 className="font-bold text-xl text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h2>
                            {post.excerpt && (
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                {post.published_at && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.published_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {getReadTime(post.content)} read
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
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
