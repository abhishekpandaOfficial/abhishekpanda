import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Search, 
  ExternalLink, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Lock, 
  Filter,
  Sparkles,
  ArrowRight,
  Rss
} from "lucide-react";
import { SiHashnode, SiMedium, SiSubstack } from "react-icons/si";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";

// Platform icons
const MediumIcon = ({ className = "w-5 h-5" }: { className?: string }) => <SiMedium className={className} />;
const SubstackIcon = ({ className = "w-5 h-5" }: { className?: string }) => <SiSubstack className={className} />;
const HashnodeIcon = ({ className = "w-5 h-5" }: { className?: string }) => <SiHashnode className={className} />;

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  platform: "stackcraft" | "medium" | "substack" | "hashnode";
  url: string;
  category: string;
  readTime: string;
  date: string;
  isPremium: boolean;
  trending: boolean;
}

const platforms = [
  { id: "all", name: "All Platforms", icon: Rss, color: "from-primary to-secondary" },
  { id: "stackcraft", name: "Stackcraft", icon: StackcraftIcon, color: "from-black to-black", url: "https://stackcraft.io/abhishekpanda" },
  { id: "medium", name: "Medium", icon: MediumIcon, color: "from-[#00AB6C] to-[#00AB6C]", url: "https://medium.com/@official.abhishekpanda" },
  { id: "substack", name: "Substack", icon: SubstackIcon, color: "from-[#FF6719] to-[#FF6719]", url: "https://substack.com/@abhishekpanda08" },
  { id: "hashnode", name: "Hashnode", icon: HashnodeIcon, color: "from-[#2962FF] to-[#2962FF]", url: "https://hashnode.com/@abhishekpanda" },
];

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building Production-Ready Agentic AI Systems with .NET 9 & Semantic Kernel",
    excerpt: "Master the art of creating autonomous AI agents that reason, plan, and execute complex tasks with enterprise-grade reliability.",
    platform: "medium",
    url: "https://medium.com/@official.abhishekpanda",
    category: "Agentic AI",
    readTime: "15 min",
    date: "Dec 10, 2024",
    isPremium: true,
    trending: true,
  },
  {
    id: "2",
    title: "Microservices Architecture 2025: Event Sourcing, CQRS & Domain-Driven Design",
    excerpt: "A comprehensive guide to building scalable, resilient distributed systems using modern architectural patterns.",
    platform: "substack",
    url: "https://substack.com/@abhishekpanda08",
    category: "Microservices",
    readTime: "12 min",
    date: "Dec 8, 2024",
    isPremium: true,
    trending: true,
  },
  {
    id: "3",
    title: "LLM Fine-Tuning Masterclass: LoRA, QLoRA & PEFT for Production Models",
    excerpt: "Deep dive into parameter-efficient fine-tuning techniques for deploying custom language models at scale.",
    platform: "hashnode",
    url: "https://hashnode.com/@abhishekpanda",
    category: "LLM/AI",
    readTime: "18 min",
    date: "Dec 6, 2024",
    isPremium: true,
    trending: false,
  },
  {
    id: "4",
    title: "Vibe Coding: How AI Pair Programming is Revolutionizing Development",
    excerpt: "Explore the future of coding with AI assistants - from GitHub Copilot to Claude, and building your own dev workflow.",
    platform: "stackcraft",
    url: "https://stackcraft.io/abhishekpanda",
    category: "Vibe Coding",
    readTime: "10 min",
    date: "Dec 4, 2024",
    isPremium: false,
    trending: true,
  },
  {
    id: "5",
    title: ".NET 9 Minimal APIs: Building Lightning-Fast REST Services with Native AOT",
    excerpt: "Unlock blazing performance with ahead-of-time compilation and minimal API patterns in the latest .NET release.",
    platform: "medium",
    url: "https://medium.com/@official.abhishekpanda",
    category: ".NET Core",
    readTime: "14 min",
    date: "Dec 2, 2024",
    isPremium: false,
    trending: false,
  },
  {
    id: "6",
    title: "RAG 2.0: Advanced Retrieval Strategies for Enterprise AI Applications",
    excerpt: "Beyond basic RAG - implementing hybrid search, re-ranking, and contextual compression for superior AI responses.",
    platform: "substack",
    url: "https://substack.com/@abhishekpanda08",
    category: "AI/ML",
    readTime: "16 min",
    date: "Nov 30, 2024",
    isPremium: true,
    trending: false,
  },
  {
    id: "7",
    title: "Azure Service Bus vs RabbitMQ: Choosing the Right Message Broker",
    excerpt: "In-depth comparison of messaging solutions for enterprise applications with real-world performance benchmarks.",
    platform: "hashnode",
    url: "https://hashnode.com/@abhishekpanda",
    category: "Cloud",
    readTime: "11 min",
    date: "Nov 28, 2024",
    isPremium: false,
    trending: false,
  },
  {
    id: "8",
    title: "Building Multi-Tenant SaaS Applications with .NET and PostgreSQL",
    excerpt: "Complete guide to architecting multi-tenant systems with data isolation, security, and scalability patterns.",
    platform: "stackcraft",
    url: "https://stackcraft.io/abhishekpanda",
    category: "Architecture",
    readTime: "20 min",
    date: "Nov 25, 2024",
    isPremium: true,
    trending: true,
  },
  {
    id: "9",
    title: "Kubernetes Operators in Go: Automating Complex Application Deployments",
    excerpt: "Learn to build custom Kubernetes operators for managing stateful applications and complex workflows.",
    platform: "medium",
    url: "https://medium.com/@official.abhishekpanda",
    category: "DevOps",
    readTime: "17 min",
    date: "Nov 22, 2024",
    isPremium: false,
    trending: false,
  },
  {
    id: "10",
    title: "Vector Databases Explained: Pinecone, Weaviate, Qdrant & Milvus Compared",
    excerpt: "Comprehensive comparison of vector databases for semantic search and AI applications.",
    platform: "substack",
    url: "https://substack.com/@abhishekpanda08",
    category: "AI/ML",
    readTime: "13 min",
    date: "Nov 20, 2024",
    isPremium: false,
    trending: true,
  },
];

const categoryColors: Record<string, string> = {
  "Agentic AI": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Microservices": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "LLM/AI": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Vibe Coding": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ".NET Core": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "AI/ML": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Cloud": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "Architecture": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "DevOps": "bg-lime-500/20 text-lime-400 border-lime-500/30",
};

const platformIcons = {
  stackcraft: StackcraftIcon,
  medium: MediumIcon,
  substack: SubstackIcon,
  hashnode: HashnodeIcon,
};

const platformColors = {
  stackcraft: "bg-black",
  medium: "bg-[#00AB6C]",
  substack: "bg-[#FF6719]",
  hashnode: "bg-[#2962FF]",
};

const BlogAggregator = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrending, setShowTrending] = useState(false);

  const filteredPosts = blogPosts.filter(post => {
    const matchesPlatform = selectedPlatform === "all" || post.platform === selectedPlatform;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrending = !showTrending || post.trending;
    return matchesPlatform && matchesSearch && matchesTrending;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Rss className="w-4 h-4" />
                Blog Aggregator
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                All <span className="gradient-text">Blogs</span> in One Place
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Discover articles from Stackcraft, Medium, Substack, and Hashnode, 
                covering .NET, Microservices, AI/ML, Cloud Architecture, and more.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          {/* Platform Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                        selectedPlatform === platform.id
                          ? `bg-gradient-to-r ${platform.color} text-white border-transparent shadow-glow`
                          : "bg-card/50 border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {Icon ? <Icon /> : <span className="font-black text-sm">OX</span>}
                      <span className="font-medium">{platform.name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {platform.url ? (
                      <a href={platform.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        Visit {platform.name} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      `Filter by ${platform.name}`
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
            <Button
              variant={showTrending ? "default" : "outline"}
              onClick={() => setShowTrending(!showTrending)}
              className={showTrending ? "bg-gradient-to-r from-emerald-500 to-green-500" : ""}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Only
            </Button>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-6"
          >
            Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            {selectedPlatform !== "all" && ` from ${platforms.find(p => p.id === selectedPlatform)?.name}`}
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => {
                const PlatformIcon = platformIcons[post.platform];
                return (
                  <motion.a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group block"
                  >
                    <div className="h-full rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow">
                      {/* Platform Header */}
                      <div className={`h-2 ${platformColors[post.platform]}`} />
                      
                      <div className="p-6">
                        {/* Badges Row */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColors[post.category] || "bg-muted text-muted-foreground border-border"}`}>
                              {post.category}
                            </span>
                            {post.trending && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <TrendingUp className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.isPremium && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-secondary" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Premium Content</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger>
                                <span className={`w-8 h-8 rounded-lg ${platformColors[post.platform]} flex items-center justify-center`}>
                                  <span className="text-white">
                                    <PlatformIcon />
                                  </span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{platforms.find(p => p.id === post.platform)?.name}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                          <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-purple/10 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground">Want more content?</h3>
              <p className="text-muted-foreground max-w-md">
                Follow me on your favorite platform for the latest articles on .NET, AI/ML, and Cloud Architecture.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {platforms.slice(1).map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant="outline"
                      asChild
                      className="group"
                    >
                      <a href={platform.url} target="_blank" rel="noopener noreferrer">
                        {Icon ? <Icon /> : <span className="font-black text-sm">OX</span>}
                        {platform.name}
                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogAggregator;
