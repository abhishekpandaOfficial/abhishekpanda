import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { OpenOwlLogo } from "@/components/ui/OpenOwlLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Sparkles, Shield, Globe, ArrowRight } from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "Context-Aware Intelligence",
    detail: "Understands your website knowledge, LLM Galaxy context, and OriginX update streams.",
  },
  {
    icon: Globe,
    title: "Multi-Channel Discovery",
    detail: "Maps key social, blog, and platform touchpoints in one conversational interface.",
  },
  {
    icon: Shield,
    title: "Secure By Design",
    detail: "Built for safe prompts, bounded responses, and production-grade integration patterns.",
  },
  {
    icon: Sparkles,
    title: "Human + AI Flow",
    detail: "Fast answers with practical depth, tuned for founders, architects, and engineering teams.",
  },
];

export default function OpenOwl() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="absolute inset-0 mesh-gradient opacity-45" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-500 mb-6">
                  <Sparkles className="w-4 h-4" />
                  OpenOwl AI
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                  Meet <span className="gradient-text">OpenOwl</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                  OpenOwl is the intelligent assistant layer for the Abhishek Panda ecosystem, designed for quick,
                  accurate answers across architecture content, model intelligence, and brand updates.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/">
                      Launch OpenOwl
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="hero-outline" size="xl" asChild>
                    <Link to="/llm-galaxy">
                      Explore LLM Galaxy
                      <Brain className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-[0_20px_45px_rgba(15,23,42,0.16)] dark:shadow-[0_20px_45px_rgba(2,6,23,0.55)]"
              >
                <div className="mx-auto w-fit">
                  <OpenOwlLogo size="lg" animate imageClassName="h-28 w-28 md:h-32 md:w-32" className="ring-sky-300/45" />
                </div>
                <div className="text-center mt-5">
                  <div className="font-bold text-lg text-foreground">OpenOwl Signature Mark</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Theme-aware mark with animated blink for active-assistant identity.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mt-2">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-slate-200/75 dark:border-slate-700/70 bg-white/65 dark:bg-slate-900/65 backdrop-blur-lg p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
