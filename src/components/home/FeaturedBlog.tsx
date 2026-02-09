import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FeaturedBlog = () => {
  const stackcraftProfileUrl = "https://stackcraft.io/abhishekpanda";
  const stackcraftBaseUrl = "https://stackcraft.io";

  const tracks = [
    { title: ".NET Architect (From Fundamentals to Architect)", tags: [".NET", "Architecture", "C#"], rgb: "99 102 241" },
    { title: "MICROSERVICES (From Zero to Hero)", tags: ["Microservices", "Distributed Systems"], rgb: "34 197 94" },
    { title: "Azure Mastery (Fundamentals to Architect)", tags: ["Azure", "Cloud", "DevOps"], rgb: "59 130 246" },
    { title: "SOLID Principles", tags: ["Clean Code", "OOP"], rgb: "245 158 11" },
    { title: "DESIGN PATTERNS", tags: ["GoF", "System Design"], rgb: "168 85 247" },
    { title: "SQL (Zero to Mastery)", tags: ["SQL", "Databases"], rgb: "14 165 233" },
    { title: "NO SQL (Zero to Mastery)", tags: ["NoSQL", "Data Modeling"], rgb: "236 72 153" },
    { title: "AI/ML using .NET (Zero to ML Engineer)", tags: ["AI/ML", ".NET", "ML.NET"], rgb: "239 68 68" },
    { title: "AI/ML Fundamentals Series", tags: ["AI/ML", "Foundations"], rgb: "16 185 129" },
    { title: "Deep Learning Mastery", tags: ["Deep Learning", "Neural Nets"], rgb: "124 58 237" },
    { title: "NLP (Basic to Agentic AI)", tags: ["NLP", "LLMs", "Agents"], rgb: "217 70 239" },
    { title: "Agentization: Agentic, RAG, AGI, Terminologies", tags: ["RAG", "Agentic AI", "LLMs"], rgb: "250 204 21" },
    { title: "WEB3 Series", tags: ["Web3", "Protocols"], rgb: "96 165 250" },
    { title: "Block Chain (Fundamentals to Architect)", tags: ["Blockchain", "Architecture"], rgb: "148 163 184" },
  ].map((t) => ({
    ...t,
    href: `${stackcraftBaseUrl}?utm_source=abhishekpanda.com&utm_medium=landing&utm_campaign=tracks&utm_content=${encodeURIComponent(
      t.title
    )}`,
  }));

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
            Stackcraft Tracks
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium learning tracks and deep dives across architecture, cloud, data, and AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
          {tracks.map((t, index) => (
            <motion.a
              key={t.title}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.03 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{ ["--brand-rgb" as any]: t.rgb }}
              className="group glass-card brand-glow-card brand-square-glow rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-glow"
              aria-label={t.title}
              title={t.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold tracking-tight text-foreground leading-snug line-clamp-3">
                    {t.title}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-[11px] font-semibold border border-border/60 bg-background/40 text-muted-foreground group-hover:text-foreground transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary/80 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70" />
              <div className="mt-4 text-xs text-muted-foreground">
                Read on <span className="text-foreground font-semibold">Stackcraft</span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero-outline" size="lg" asChild>
            <a href={stackcraftProfileUrl} target="_blank" rel="noopener noreferrer">
              Explore on Stackcraft
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
