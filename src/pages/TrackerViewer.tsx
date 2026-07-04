import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Brain, Cloud, Cpu, ExternalLink, Monitor, Smartphone, Sparkles, Tablet } from "lucide-react";

type PreviewMode = "desktop" | "tablet" | "mobile";

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

const previewModes: Array<{ id: PreviewMode; label: string; icon: typeof Monitor; width: string; height: string }> = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%", height: "min(88vh, 1120px)" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "860px", height: "min(84vh, 980px)" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "430px", height: "min(84vh, 860px)" },
];

const TrackerViewerPage = () => {
  const { trackerSlug } = useParams();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const tracker = trackerConfig.find((item) => item.slug === trackerSlug);
  const basePath = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    if (!tracker) return;
    document.title = `${tracker.title} | Abhishek Panda`;
  }, [tracker]);

  if (!tracker) {
    return (
      <div className="min-h-screen bg-background px-4 py-24 text-foreground">
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
    );
  }

  const trackerAssetPath = `${basePath}trackers/${tracker.fileName}`;
  const Icon = tracker.icon;
  const activePreview = previewModes.find((mode) => mode.id === previewMode) ?? previewModes[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,1))] px-4 pb-12 pt-24 text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="rounded-[32px] border border-white/70 bg-background/90 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur xl:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={`rounded-[24px] bg-gradient-to-br ${tracker.accent} p-4 text-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.5)]`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Premium tracker</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${tracker.badgeClass}`}>
                    {tracker.badge}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{tracker.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{tracker.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {tracker.category}
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Responsive full-screen preview
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted/40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
              <a
                href={trackerAssetPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                Open full page
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-border/70 bg-slate-950 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-xl bg-gradient-to-br ${tracker.accent} p-2 text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Responsive preview</p>
                <p className="text-sm font-semibold text-slate-100">{tracker.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              {previewModes.map((mode) => {
                const ModeIcon = mode.icon;
                const isActive = mode.id === previewMode;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPreviewMode(mode.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold capitalize transition ${
                      isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <ModeIcon className="h-3.5 w-3.5" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_50%)] p-3 sm:p-4 lg:p-5">
            <div
              className="mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-slate-100/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
              style={{ maxWidth: activePreview.width, minHeight: activePreview.height }}
            >
              <div className="h-full min-h-[720px] overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                <iframe
                  src={trackerAssetPath}
                  title={tracker.title}
                  className="h-full min-h-[720px] w-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerViewerPage;
