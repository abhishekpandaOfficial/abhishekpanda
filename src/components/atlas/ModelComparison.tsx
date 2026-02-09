import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Plus, X, Check, Minus, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";
import { Link } from "react-router-dom";

const filters = [
  { key: "open", label: "Open Weight" },
  { key: "multimodal", label: "Multimodal" },
] as const;

export const ModelComparison = (props: { models: LLMModel[] }) => {
  const sorted = useMemo(() => {
    const copy = [...props.models];
    copy.sort((a, b) => (getBenchmarkNumber(b, "mmlu") ?? 0) - (getBenchmarkNumber(a, "mmlu") ?? 0));
    return copy;
  }, [props.models]);

  const defaultSelected = sorted.slice(0, 3).map((m) => m.slug);
  const [selectedModels, setSelectedModels] = useState<string[]>(defaultSelected);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleModel = (slug: string) => {
    if (selectedModels.includes(slug)) {
      setSelectedModels(selectedModels.filter((id) => id !== slug));
    } else if (selectedModels.length < 4) {
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
        if (f === "multimodal") return !!m.is_multimodal;
        return true;
      })
    );
  }, [sorted, activeFilters]);

  const comparisonModels = useMemo(
    () => sorted.filter((m) => selectedModels.includes(m.slug)),
    [sorted, selectedModels]
  );

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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select up to 4 model families and compare their latest public characteristics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
            <Filter className="w-4 h-4" />
            Filters:
          </div>
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilters.includes(filter.key) ? "default" : "outline"}
              size="sm"
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
          {filteredModels.slice(0, 20).map((model) => (
            <Button
              key={model.slug}
              variant={selectedModels.includes(model.slug) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleModel(model.slug)}
              className="gap-2"
              disabled={!selectedModels.includes(model.slug) && selectedModels.length >= 4}
              title={model.company}
            >
              {selectedModels.includes(model.slug) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {model.name}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-44">
                    Feature
                  </th>
                  {comparisonModels.map((model) => (
                    <th key={model.slug} className="px-6 py-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <Link to={`/llm-galaxy/model/${model.slug}`} className="font-bold text-foreground hover:underline underline-offset-4">
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
                {[
                  {
                    label: "Parameters",
                    render: (m: LLMModel) => <span className="font-semibold">{m.parameters || "—"}</span>,
                  },
                  {
                    label: "Context Window",
                    render: (m: LLMModel) => <Badge variant="outline">{m.context_window || "—"}</Badge>,
                  },
                  {
                    label: "MMLU",
                    render: (m: LLMModel) => (
                      <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                        {getBenchmarkNumber(m, "mmlu") ?? "—"}
                      </span>
                    ),
                  },
                  {
                    label: "HumanEval",
                    render: (m: LLMModel) => (
                      <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-bold">
                        {getBenchmarkNumber(m, "humaneval") ?? "—"}
                      </span>
                    ),
                  },
                  {
                    label: "Pricing",
                    render: (m: LLMModel) => (
                      <span className={`px-3 py-1 rounded-lg font-semibold ${m.pricing === "Free" ? "bg-green-500/10 text-green-600" : "bg-muted"}`}>
                        {m.pricing || "—"}
                      </span>
                    ),
                  },
                  { label: "Speed", render: (m: LLMModel) => <span className="text-muted-foreground">{m.speed || "—"}</span> },
                  {
                    label: "Multimodal",
                    render: (m: LLMModel) =>
                      m.is_multimodal ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Minus className="w-5 h-5 text-muted-foreground mx-auto" />,
                  },
                  {
                    label: "Open Weight",
                    render: (m: LLMModel) =>
                      m.is_open_source ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Open</Badge>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      ),
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="px-6 py-4 font-medium text-foreground">{row.label}</td>
                    {comparisonModels.map((m) => (
                      <td key={`${m.slug}-${row.label}`} className="px-6 py-4 text-center">
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
              ) : null
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

