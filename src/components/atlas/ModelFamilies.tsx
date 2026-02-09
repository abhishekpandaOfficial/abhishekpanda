import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Brain,
  Code,
  MessageSquare,
  Image,
  Trophy,
  Star,
  Shield,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelFamilyModal } from "./ModelFamilyModal";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

const useCaseIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "General reasoning": Brain,
  Reasoning: Brain,
  Coding: Code,
  "Creative writing": MessageSquare,
  "Long context": Zap,
  Analysis: Brain,
  Safety: Sparkles,
  Multimodal: Image,
  Research: Brain,
  Scale: Zap,
  "Open source": Code,
  "Open weight": Code,
  "Fine-tuning": Sparkles,
  Multilingual: MessageSquare,
  Math: Brain,
  Efficiency: Zap,
  MoE: Sparkles,
  "Cost-effective": Zap,
  "Small models": Sparkles,
  Edge: Zap,
};

function readVersions(model: LLMModel): string[] {
  const v = model.versions as unknown;
  type VersionLike = { name?: string };
  type ContainerLike = { items?: unknown[] };

  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object") return (x as VersionLike).name;
        return undefined;
      })
      .filter((s) => typeof s === "string" && s.trim().length > 0);
  }

  if (v && typeof v === "object" && Array.isArray((v as ContainerLike).items)) {
    const items = (v as ContainerLike).items || [];
    return items
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object") return (x as VersionLike).name;
        return undefined;
      })
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  }
  return [];
}

function primaryLink(model: LLMModel): string | null {
  const m = model as LLMModel & { homepage_url?: string | null; huggingface_url?: string | null };
  return m.huggingface_url || m.homepage_url || model.api_docs_url || null;
}

function isLogoUrl(logo: string | null): boolean {
  if (!logo) return false;
  return logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/");
}

function ModelCard({ family, onExplore }: { family: LLMModel; onExplore: (family: LLMModel) => void }) {
  const versions = readVersions(family);
  const bestFor = (family.use_cases || []).slice(0, 3);
  const mmlu = getBenchmarkNumber(family, "mmlu");
  const color = family.color || "from-primary to-secondary";
  const logo = family.logo || "✨";
  const link = primaryLink(family);
  const useImageLogo = isLogoUrl(logo);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="glass-card-hover rounded-2xl p-6 h-full flex flex-col hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {useImageLogo ? (
              <img src={logo} alt={`${family.company} logo`} className="w-9 h-9 object-contain" loading="lazy" />
            ) : (
              logo
            )}
          </div>
          {family.is_trending ? (
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> Trending
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">{family.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{family.company}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {versions.slice(-3).map((version) => (
            <span
              key={version}
              className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground"
            >
              {version}
            </span>
          ))}
        </div>

        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Best for</p>
          <div className="flex flex-wrap gap-2">
            {bestFor.map((useCase) => {
              const Icon = useCaseIcons[useCase] || Brain;
              return (
                <span
                  key={useCase}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/5 text-xs font-medium text-foreground"
                >
                  <Icon className="w-3 h-3 text-primary" />
                  {useCase}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">MMLU</span>
            <span className="text-lg font-bold atlas-gradient-text">
              {typeof mmlu === "number" ? `${mmlu}%` : "—"}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(0, Math.min(100, mmlu ?? 0))}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-between group-hover:bg-primary/10 group-hover:text-primary"
            onClick={() => onExplore(family)}
          >
            Explore Family
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          {link ? (
            <Button variant="outline" size="sm" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${family.name} link`}>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 right-4 -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="rounded-xl bg-card border border-primary/25 p-3 text-xs text-muted-foreground shadow-xl">
          <div className="text-foreground font-semibold mb-1">Hover details</div>
          <div>{family.description || "No description provided."}</div>
        </div>
      </div>
    </motion.div>
  );
}

export const ModelFamilies = (props: { models: LLMModel[] }) => {
  const [selectedFamily, setSelectedFamily] = useState<LLMModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceModal, setSourceModal] = useState<"open" | "closed" | null>(null);

  const families = props.models;
  const openFamilies = useMemo(() => families.filter((f) => f.is_open_source), [families]);
  const closedFamilies = useMemo(() => families.filter((f) => !f.is_open_source), [families]);
  const trendingCount = families.filter((f) => f.is_trending).length;

  const mmluSorted = families
    .map((m) => ({ model: m, v: getBenchmarkNumber(m, "mmlu") }))
    .filter((x) => typeof x.v === "number") as { model: LLMModel; v: number }[];
  mmluSorted.sort((a, b) => b.v - a.v);

  const handleExploreFamily = (family: LLMModel) => {
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const sourceFamilies = sourceModal === "open" ? openFamilies : closedFamilies;

  return (
    <section id="model-families" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Model Families Explorer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Explore <span className="atlas-gradient-text">Model Families</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Open-source and closed-source families with categories, details, and links.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" size="lg" className="gap-2" onClick={() => setSourceModal("open")}>
              <Shield className="w-4 h-4" />
              Open-Source LLMs ({openFamilies.length})
            </Button>
            <Button variant="hero-outline" size="lg" className="gap-2" onClick={() => setSourceModal("closed")}>
              <Lock className="w-4 h-4" />
              Closed-Source LLMs ({closedFamilies.length})
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 text-center border border-emerald-500/20">
            <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">{mmluSorted[0]?.model?.name || "—"}</div>
            <div className="text-xs text-muted-foreground">Highest MMLU</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl p-4 text-center border border-orange-500/20">
            <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">{trendingCount || "—"}</div>
            <div className="text-xs text-muted-foreground">Trending Families</div>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-4 text-center border border-violet-500/20">
            <Star className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">{families.length || "—"}</div>
            <div className="text-xs text-muted-foreground">Families Tracked</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-4 text-center border border-blue-500/20">
            <Brain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">
              {typeof mmluSorted[0]?.v === "number" ? `${mmluSorted[0].v.toFixed(1)}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Top MMLU Score</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {families.map((family, index) => (
            <motion.div
              key={family.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <ModelCard family={family} onExplore={handleExploreFamily} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {sourceModal && (
          <div className="fixed inset-0 z-[60] p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSourceModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 w-full max-w-6xl max-h-[88vh] overflow-y-auto rounded-3xl border border-primary/30 bg-card p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black">
                    {sourceModal === "open" ? "Open-Source LLM Models" : "Closed-Source LLM Models"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click a model for full popup. Hover card to preview details. Use link icon for model website/page.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSourceModal(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sourceFamilies.map((family) => (
                  <ModelCard
                    key={`source-${family.slug}`}
                    family={family}
                    onExplore={(selected) => {
                      setSourceModal(null);
                      handleExploreFamily(selected);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ModelFamilyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} family={selectedFamily} />
    </section>
  );
};
