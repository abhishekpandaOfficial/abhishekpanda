import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Brain, Cloud, Cpu, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";

const trackerConfig = [
  {
    slug: "machine-learning-zero-to-hero",
    title: "Machine Learning Zero to Hero Tracker",
    fileName: "machine-learning-zero-to-hero-tracker.html",
    summary: "A structured curriculum tracker for machine learning foundations, data understanding, modeling, and deployment.",
    icon: Brain,
    category: "AI Foundations",
    badge: "ML",
    accent: "from-cyan-500 via-sky-500 to-indigo-600",
    badgeClass: "border-cyan-300/60 bg-cyan-500/10 text-cyan-600",
  },
  {
    slug: "deep-learning-zero-to-hero",
    title: "Deep Learning Zero to Hero Tracker",
    fileName: "deep-learning-zero-to-hero-tracker.html",
    summary: "A presentation-ready deep learning mastery tracker covering neural networks, CNNs, transformers, and MLOps.",
    icon: Cpu,
    category: "Deep Learning",
    badge: "DL",
    accent: "from-violet-500 via-fuchsia-500 to-purple-600",
    badgeClass: "border-fuchsia-300/60 bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    slug: "nlp-llm-rag-agents-mcp",
    title: "NLP Zero to Hero Tracker",
    fileName: "nlp-llm-rag-agents-mcp-tracker.html",
    summary: "An enterprise-focused tracker for NLP, LLM engineering, RAG, agents, MCP, and production AI systems.",
    icon: Sparkles,
    category: "Language AI",
    badge: "NLP",
    accent: "from-amber-500 via-orange-500 to-rose-600",
    badgeClass: "border-amber-300/60 bg-amber-500/10 text-amber-600",
  },
  {
    slug: "llm-agentic-ai",
    title: "LLM & Agentic AI Tracker",
    fileName: "llm-agentic-ai-tracker.html",
    summary: "A comprehensive curriculum tracker for LLM engineering, RAG, agentic workflows, and modern AI architecture.",
    icon: Sparkles,
    category: "Agentic AI",
    badge: "AGI",
    accent: "from-emerald-500 via-teal-500 to-cyan-600",
    badgeClass: "border-emerald-300/60 bg-emerald-500/10 text-emerald-600",
  },
  {
    slug: "azure-principal-architect",
    title: "Azure Principal Architect Tracker",
    fileName: "azure-principal-architect-tracker.html",
    summary: "A zero-to-principal architecture tracker covering Azure foundations, networking, security, and enterprise design.",
    icon: Cloud,
    category: "Cloud Architecture",
    badge: "AZ",
    accent: "from-blue-600 via-sky-500 to-cyan-500",
    badgeClass: "border-blue-300/60 bg-blue-500/10 text-blue-600",
  },
];

const TrackerViewerPage = () => {
  const { trackerSlug } = useParams();
  const tracker = trackerConfig.find((item) => item.slug === trackerSlug);
  const basePath = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    if (!tracker) return;
    document.title = `${tracker.title} | Abhishek Panda`;
  }, [tracker]);

  if (!tracker) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background px-4 pb-8 pt-24 text-foreground">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Tracker unavailable</p>
            <h1 className="text-3xl font-semibold">The requested tracker could not be found.</h1>
            <p className="text-muted-foreground">Please return to the main navigation and choose one of the available mastery trackers.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted/40">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const trackerAssetPath = `${basePath}trackers/${tracker.fileName}`;

  return (
    <div className="dark h-[100dvh] overflow-hidden bg-slate-950 pt-16 text-slate-100">
      <Navigation />
      <main className="h-full">
        <iframe
          src={trackerAssetPath}
          title={tracker.title}
          className="block h-full w-full border-0 bg-slate-950"
          allowFullScreen
        />
      </main>
    </div>
  );
};

export default TrackerViewerPage;
