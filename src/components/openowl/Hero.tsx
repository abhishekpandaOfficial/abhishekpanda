import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Clock3, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSocialIcons } from "@/components/about/HeroSocialIcons";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";

const trustRows = [
  "Privacy-first responses",
  "Citation-aware reasoning",
  "Safe actions need approval",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-6 shadow-sm md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.16),transparent_42%)]" />
      <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        OpenOwl - AbhishekPanda Assistant
      </div>
      <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-wide text-primary">
        <Clock3 className="h-3.5 w-3.5" />
        Development Preview · Open-source LLM integration coming soon
      </div>

      <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            OpenOwl helps OwlBot reason, draft, and execute tasks safely.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            AbhishekPanda Assistant helps with personal knowledge Q&A, technical summaries, and practical task drafts with
            citation-first answers. The assistant is improving rapidly with future open-source model routing planned.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button
              asChild
              size="lg"
              className="rounded-full border border-white/45 bg-white/65 text-foreground backdrop-blur-xl hover:bg-white/75 dark:border-white/20 dark:bg-black/55 dark:text-foreground"
            >
              <Link to="/openowl/assistant">Ask Abhishek</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/45 bg-white/55 backdrop-blur-xl dark:border-white/20 dark:bg-black/50"
            >
              <Link to="/products">View Projects</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full border border-transparent bg-white/35 backdrop-blur-xl dark:bg-black/35">
              <Link to="/blog">Read Blog</Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              <Bot className="h-3.5 w-3.5" />
              OwlBot task support
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              <Workflow className="h-3.5 w-3.5" />
              Non-repetitive guided replies
            </span>
          </div>

          <div className="mt-6">
            <HeroSocialIcons className="justify-start" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/75 p-5">
          <div className="mb-3 flex items-center gap-3">
            <OpenOwlAnimatedLogo size="lg" animate className="ring-1 ring-border/60 rounded-full" />
            <div>
              <div className="text-sm font-semibold text-foreground">OpenOwl Live</div>
              <div className="text-xs text-muted-foreground">Theme-aware mark with active blink</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {trustRows.map((row, index) => (
              <motion.div
                key={row}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.25, delay: index * 0.06 }}
                className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1"
              >
                <ShieldCheck className="h-4 w-4" />
                {row}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
