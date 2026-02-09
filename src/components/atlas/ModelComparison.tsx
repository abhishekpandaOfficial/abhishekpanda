import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Plus, X, Check, Minus, ExternalLink, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";
import { Link } from "react-router-dom";

const MAX_COMPARE = 6;

const filters = [
  { key: "open", label: "Open Weight" },
  { key: "closed", label: "Closed Source" },
  { key: "multimodal", label: "Multimodal" },
] as const;

type BrandKey = "openai" | "anthropic" | "google" | "meta" | "qwen" | "deepseek";

function isLogoUrl(logo: string | null): boolean {
  return !!logo && (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/"));
}

function brandKey(model: LLMModel): BrandKey | null {
  const s = `${model.company} ${model.name}`.toLowerCase();
  if (s.includes("openai") || s.includes("gpt")) return "openai";
  if (s.includes("anthropic") || s.includes("claude")) return "anthropic";
  if (s.includes("google") || s.includes("gemini")) return "google";
  if (s.includes("meta") || s.includes("llama")) return "meta";
  if (s.includes("qwen") || s.includes("alibaba")) return "qwen";
  if (s.includes("deepseek")) return "deepseek";
  return null;
}

function parseReleaseDate(releaseDate: string | null): number {
  if (!releaseDate) return 0;
  const t = Date.parse(releaseDate);
  if (!Number.isNaN(t)) return t;

  const year = releaseDate.match(/(20\d{2})/);
  if (year) return Date.parse(`${year[1]}-01-01`);
  return 0;
}

function versionWeight(name: string): number {
  const nums = name.match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return 0;
  return nums.reduce((acc, n, idx) => acc + Number(n) / Math.pow(10, idx * 2), 0);
}

function latestForBrand(models: LLMModel[], brand: BrandKey): LLMModel | null {
  const candidates = models.filter((m) => brandKey(m) === brand);
  if (!candidates.length) return null;

  const scored = [...candidates].sort((a, b) => {
    const da = parseReleaseDate(a.release_date);
    const db = parseReleaseDate(b.release_date);
    if (db !== da) return db - da;

    const va = versionWeight(a.name);
    const vb = versionWeight(b.name);
    if (vb !== va) return vb - va;

    return (getBenchmarkNumber(b, "mmlu") ?? 0) - (getBenchmarkNumber(a, "mmlu") ?? 0);
  });

  return scored[0] || null;
}

const getCostColor = (pricing: string | null) => {
  if (!pricing) return "text-muted-foreground";
  if (pricing.toLowerCase().includes("free")) return "text-green-500";
  if (pricing.includes("$$$$")) return "text-red-500";
  if (pricing.includes("$$$")) return "text-orange-500";
  if (pricing.includes("$$")) return "text-yellow-500";
  if (pricing.includes("$")) return "text-green-400";
  return "text-muted-foreground";
};

function chipClass(active: boolean) {
  return [
    "h-8 px-3 rounded-full text-xs md:text-sm relative overflow-hidden",
    "border transition-all duration-200",
    "hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_8px_20px_hsl(var(--primary)/0.15)]",
    active
      ? "bg-primary/12 text-primary border-primary/35 after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
      : "bg-background/70 text-foreground border-border/70 hover:text-primary",
  ].join(" ");
}

export const ModelComparison = (props: { models: LLMModel[] }) => {
  const sorted = useMemo(() => {
    const copy = [...props.models];
    copy.sort((a, b) => (getBenchmarkNumber(b, "mmlu") ?? 0) - (getBenchmarkNumber(a, "mmlu") ?? 0));
    return copy;
  }, [props.models]);

  const defaultSelected = useMemo(() => {
    const brandOrder: BrandKey[] = ["openai", "anthropic", "google", "meta", "qwen", "deepseek"];
    const picks = brandOrder
      .map((b) => latestForBrand(sorted, b))
      .filter((x): x is LLMModel => !!x)
      .map((m) => m.slug);

    if (picks.length >= MAX_COMPARE) return picks.slice(0, MAX_COMPARE);

    const used = new Set(picks);
    for (const m of sorted) {
      if (used.has(m.slug)) continue;
      picks.push(m.slug);
      used.add(m.slug);
      if (picks.length >= MAX_COMPARE) break;
    }
    return picks;
  }, [sorted]);

  const [selectedModels, setSelectedModels] = useState<string[]>(defaultSelected);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    if (selectedModels.length === 0 && defaultSelected.length > 0) {
      setSelectedModels(defaultSelected.slice(0, MAX_COMPARE));
    }
  }, [defaultSelected, selectedModels.length]);

  const toggleModel = (slug: string) => {
    if (selectedModels.includes(slug)) {
      setSelectedModels(selectedModels.filter((id) => id !== slug));
    } else if (selectedModels.length < MAX_COMPARE) {
      setSelectedModels([...selectedModels, slug]);
    }
  };

  const toggleFilter = (filterKey: string) => {
    if (activeFilters.includes(filterKey)) {
      setActiveFilters(activeFilters.filter((f) => f !== filterKey));
    } else {
      setActiveFilters([...activeFilters, filterKey]);
    }
  };

  const filteredModels = useMemo(() => {
    if (activeFilters.length === 0) return sorted;
    return sorted.filter((m) =>
      activeFilters.every((f) => {
        if (f === "open") return !!m.is_open_source;
        if (f === "closed") return !m.is_open_source;
        if (f === "multimodal") return !!m.is_multimodal;
        return true;
      }),
    );
  }, [sorted, activeFilters]);

  const comparisonModels = useMemo(
    () => sorted.filter((m) => selectedModels.includes(m.slug)),
    [sorted, selectedModels],
  );

  const rows = [
    {
      label: "Release",
      render: (m: LLMModel) => <span className="font-semibold">{m.release_date || "—"}</span>,
    },
    {
      label: "Parameters",
      render: (m: LLMModel) => <span className="font-semibold">{m.parameters || "—"}</span>,
    },
    {
      label: "Context",
      render: (m: LLMModel) => <Badge variant="outline">{m.context_window || "—"}</Badge>,
    },
    {
      label: "MMLU",
      render: (m: LLMModel) => (
        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {getBenchmarkNumber(m, "mmlu") ?? "—"}
        </span>
      ),
    },
    {
      label: "GPQA",
      render: (m: LLMModel) => (
        <span className="px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary font-bold text-sm">
          {getBenchmarkNumber(m, "gpqa") ?? "—"}
        </span>
      ),
    },
    {
      label: "SWE-Bench",
      render: (m: LLMModel) => (
        <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent font-bold text-sm">
          {getBenchmarkNumber(m, "swe_bench") ?? "—"}
        </span>
      ),
    },
    {
      label: "Pricing",
      render: (m: LLMModel) => (
        <span className={`text-sm font-semibold ${getCostColor(m.pricing)}`}>{m.pricing || "—"}</span>
      ),
    },
    {
      label: "Multimodal",
      render: (m: LLMModel) =>
        m.is_multimodal ? (
          <Check className="w-5 h-5 text-green-500 mx-auto" />
        ) : (
          <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
        ),
    },
    {
      label: "Source",
      render: (m: LLMModel) =>
        m.is_open_source ? (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Open</Badge>
        ) : (
          <Badge variant="outline">Closed</Badge>
        ),
    },
  ] as const;

  return (
    <section id="model-comparison" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <GitCompare className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Model Comparison Matrix</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Compare <span className="atlas-gradient-text">Side by Side</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Default set includes latest GPT, Claude, Gemini, Llama, Qwen, and DeepSeek. You can compare up to 6 models.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <Filter className="w-4 h-4" />
            Filters:
          </div>
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant="ghost"
              size="sm"
              className={chipClass(activeFilters.includes(filter.key))}
              onClick={() => toggleFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filteredModels.slice(0, 32).map((model) => (
            <Button
              key={model.slug}
              variant="ghost"
              size="sm"
              className={chipClass(selectedModels.includes(model.slug))}
              onClick={() => toggleModel(model.slug)}
              disabled={!selectedModels.includes(model.slug) && selectedModels.length >= MAX_COMPARE}
              title={model.company}
            >
              <span className="inline-flex items-center gap-1.5">
                {isLogoUrl(model.logo) ? (
                  <img src={model.logo || ""} alt={`${model.company} logo`} className="w-3.5 h-3.5 rounded object-contain" loading="lazy" />
                ) : null}
                {selectedModels.includes(model.slug) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {model.name}
              </span>
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Comparison uses latest tracked model rows and benchmark snapshots.
            </div>
            <div className="text-xs text-muted-foreground">Selected: {comparisonModels.length}/{MAX_COMPARE}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-44">
                    Feature
                  </th>
                  {comparisonModels.map((model) => (
                    <th key={model.slug} className="px-4 py-4 text-center min-w-[170px] align-top">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative h-12 w-12 rounded-xl border border-primary/25 bg-background flex items-center justify-center">
                          <motion.div
                            className="absolute inset-0 rounded-xl"
                            animate={{ opacity: [0.15, 0.45, 0.15] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.28)" }}
                          />
                          {isLogoUrl(model.logo) ? (
                            <img src={model.logo || ""} alt={`${model.company} logo`} className="relative w-7 h-7 object-contain" loading="lazy" />
                          ) : (
                            <span className="relative text-sm font-bold">{model.name.charAt(0)}</span>
                          )}
                        </div>
                        <Link to={`/llm-galaxy/model/${model.slug}`} className="font-bold text-foreground hover:text-primary text-sm leading-tight text-center">
                          {model.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{model.company}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleModel(model.slug)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/30 hover:bg-primary/5">
                    <td className="px-5 py-4 font-medium text-foreground text-sm">{row.label}</td>
                    {comparisonModels.map((m) => (
                      <td key={`${m.slug}-${row.label}`} className="px-4 py-4 text-center">
                        {row.render(m)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border/50 flex flex-wrap items-center justify-center gap-3">
            {comparisonModels.map((m) =>
              m.api_docs_url ? (
                <Button key={m.slug} variant="outline" size="sm" asChild className="gap-2">
                  <a href={m.api_docs_url} target="_blank" rel="noopener noreferrer">
                    {m.name} docs <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              ) : null,
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
