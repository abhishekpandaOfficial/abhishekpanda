import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GithubSlugger from "github-slugger";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Network,
  Database,
  Cpu,
  Rocket,
  Sparkles,
  ArrowUp,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Markdown } from "@/components/blog/Markdown";
import { useTheme } from "@/components/ThemeProvider";
import articleMarkdown from "@/content/blog/building-foundational-models.md?raw";

type TocItem = {
  id: string;
  text: string;
  depth: number;
};

const buildToc = (markdown: string): TocItem[] => {
  const slugger = new GithubSlugger();
  const out: TocItem[] = [];
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length;
    const text = match[2].trim();
    if (!text) continue;
    out.push({ id: slugger.slug(text), text, depth });
  }
  return out;
};

const FoundationalModelsGuide = () => {
  const { theme } = useTheme();
  const toc = useMemo(() => buildToc(articleMarkdown), []);
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id || null);
  const activeIndex = Math.max(
    0,
    toc.findIndex((item) => item.id === activeId)
  );
  const progressPct = toc.length > 0 ? Math.round(((activeIndex + 1) / toc.length) * 100) : 0;

  useEffect(() => {
    const headings = toc
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = (visible[0]?.target as HTMLElement | undefined)?.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  const quickNav = [
    { label: "Architecture", icon: Cpu, target: "3-model-families-and-architectures" },
    { label: "Dataset Strategy", icon: Database, target: "5-dataset-strategy-most-important-section" },
    { label: "Production", icon: Rocket, target: "16-final-production-architecture" },
  ];

  return (
    <div className="nextgen-docs min-h-screen bg-background">
      <Navigation />
      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-border/50">
        <div
          className="h-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <main className="container mx-auto max-w-[1360px] px-4 pb-16 pt-24">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-background to-muted/40 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40 dark:shadow-[0_24px_60px_rgba(2,6,23,0.55)]">
          <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">AI/ML Series</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl text-balance">
            Building Your Own Foundational AI Models From Scratch
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-muted-foreground md:text-base">
            Architectures, datasets, training, infrastructure, and production deployment with practical engineering steps and reusable references.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://originxcloud.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              OriginX Cloud: datasets, models, configs
            </a>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
              Step-by-step documentation guide
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
              <p className="font-semibold text-foreground">16 core modules</p>
              <p className="text-muted-foreground">From architecture to production</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
              <p className="font-semibold text-foreground">Finance LLM case study</p>
              <p className="text-muted-foreground">Real-world domain training mix</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
              <p className="font-semibold text-foreground">Ready diagrams</p>
              <p className="text-muted-foreground">Data, training, alignment, serving</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickNav.map((item) => (
              <button
                key={item.label}
                onClick={() => jumpTo(item.target)}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 rounded-2xl border border-border/70 bg-card/80 p-5 md:p-7 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_42px_rgba(2,6,23,0.45)]">
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                Structured documentation flow with modules, references, and production-first implementation guidance.
              </p>
            </div>
            <Markdown
              value={articleMarkdown}
              codeTheme={theme === "dark" ? "github-dark-default" : "github-light-default"}
            />

            <div className="mt-10 grid grid-cols-1 gap-3 border-t border-border/70 pt-6 sm:grid-cols-2">
              <Link
                to="/blog/techhub?domain=ai-ml"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to TechHub AI/ML
              </Link>
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Explore More Blog Series
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                Table of Contents
              </h2>
              <div className="mb-3 rounded-lg border border-border/70 bg-background/80 p-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Reading Progress</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    {activeIndex + 1} / {Math.max(1, toc.length)} sections
                  </p>
                  <p className="text-xs font-bold text-primary">{progressPct}%</p>
                </div>
              </div>
              <div className="space-y-1">
                {toc.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => jumpTo(item.id)}
                    className={`block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      item.depth === 3 ? "pl-5" : ""
                    } ${
                      activeId === item.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1 text-[10px] font-semibold">{idx + 1}.</span>
                    {item.text}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Network className="h-3.5 w-3.5 text-primary" />
                  Dataset and model registry
                </p>
                <a
                  href="https://originxcloud.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  https://originxcloud.com
                </a>
              </div>
              <div className="mt-3 rounded-lg border border-border/70 bg-background/70 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">Reading Flow</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Intro {"->"} Architecture {"->"} Data {"->"} Training {"->"} Eval {"->"} Alignment {"->"} Deployment {"->"} Continuous learning
                </p>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                Back to Top
              </button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoundationalModelsGuide;
