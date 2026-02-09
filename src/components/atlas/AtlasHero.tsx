import { motion } from "framer-motion";
import { BarChart3, GitCompare, Globe, Sparkles, Brain, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasSearch } from "./AtlasSearch";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getLastUpdated } from "@/hooks/useLLMModels";
import type { OriginXUpdate } from "@/hooks/useOriginXUpdates";

export const AtlasHero = (props: { models: LLMModel[]; lastUpdated: Date | null; updates?: OriginXUpdate[] }) => {
  const last = props.lastUpdated || getLastUpdated(props.models);
  const total = props.models.length;
  const open = props.models.filter((m) => m.is_open_source).length;
  const closed = total - open;
  const updates = props.updates || [];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 atlas-mesh-bg" />
      
      {/* Neural Network Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(10)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${10 + i * 10}%`}
              y1={`${20 + Math.random() * 60}%`}
              x2={`${20 + i * 8}%`}
              y2={`${40 + Math.random() * 40}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">OriginX LLM Galaxy</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6"
          >
            Explore the World's Most{" "}
            <span className="atlas-gradient-text">Advanced LLMs</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto"
          >
            A unified intelligence hub for every major AI model — open-source and closed-source.
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground/70 mb-10"
          >
            Explore. Compare. Benchmark. Understand the Future.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <AtlasSearch models={props.models} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2"
              onClick={() => document.getElementById('model-comparison')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <GitCompare className="w-5 h-5" />
              Compare Models
            </Button>
            <Button 
              variant="hero-outline" 
              size="lg" 
              className="gap-2"
              onClick={() => document.getElementById('benchmarks')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BarChart3 className="w-5 h-5" />
              Explore Benchmarks
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2"
              onClick={() => document.getElementById('model-families')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Layers className="w-5 h-5" />
              Browse Galaxy
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: "Model Families", value: total ? `${total}+` : "—", icon: Globe },
              { label: "Open Weight", value: total ? `${open}+` : "—", icon: Zap },
              { label: "Closed Source", value: total ? `${closed}+` : "—", icon: Brain },
              {
                label: "Last Updated",
                value: last ? last.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
                icon: Sparkles,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center group hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-black atlas-gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {updates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6 max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-card/70 backdrop-blur p-4 text-left"
            >
              <div className="text-xs uppercase tracking-[0.16em] text-primary font-semibold mb-2">Latest OriginX Updates</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {updates.map((update) => (
                  <div key={update.id} className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <div className="text-sm font-semibold text-foreground line-clamp-2">{update.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{update.summary}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
