import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Award,
  BarChart3,
  ExternalLink,
  Medal,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";
import {
  capabilityCategories,
  getCapabilityScore,
  getModelCategoryTags,
} from "@/lib/llmGalaxy";

const benchmarkDefs = [
  { key: "gpqa", name: "GPQA Diamond", description: "Reasoning quality in science-heavy tasks." },
  { key: "aime_2025", name: "AIME", description: "High-school math competition benchmark." },
  { key: "swe_bench", name: "SWE-Bench", description: "Agentic coding benchmark on GitHub issues." },
  { key: "bfcl", name: "BFCL", description: "Function/tool-calling reliability benchmark." },
  { key: "grind", name: "GRIND", description: "Adaptive reasoning benchmark." },
  { key: "livecode", name: "LiveCode", description: "Live coding and code repair performance." },
  { key: "aider_polyglot", name: "Aider Polyglot", description: "Multi-language coding assistant benchmark." },
  { key: "mmlu", name: "MMLU", description: "Massive multitask language understanding." },
  { key: "gsm8k", name: "GSM8K", description: "Grade-school math reasoning benchmark." },
  { key: "humaneval", name: "HumanEval", description: "Code generation accuracy benchmark." },
  { key: "truthfulqa", name: "TruthfulQA", description: "Factuality and truthfulness benchmark." },
  { key: "mtbench", name: "MT-Bench", description: "Multi-turn assistant quality benchmark." },
  { key: "arena_elo", name: "Arena Elo", description: "Human preference ranking." },
] as const;

const taskCards = [
  {
    key: "gpqa",
    title: "Best in Reasoning",
    subtitle: "GPQA Diamond",
    higherIsBetter: true,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "aime_2025",
    title: "Best in High School Math",
    subtitle: "AIME",
    higherIsBetter: true,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "swe_bench",
    title: "Best in Agentic Coding",
    subtitle: "SWE-Bench",
    higherIsBetter: true,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
] as const;

const efficiencyCards = [
  {
    key: "speed_tokens_per_sec",
    title: "Fastest Models",
    subtitle: "Tokens per second",
    higherIsBetter: true,
    format: (v: number) => `${Math.round(v)} t/s`,
  },
  {
    key: "latency_ttft_sec",
    title: "Lowest Latency",
    subtitle: "TTFT in seconds",
    higherIsBetter: false,
    format: (v: number) => `${v.toFixed(2)}s`,
  },
  {
    key: "input_cost_per_1m",
    title: "Cheapest Input",
    subtitle: "USD per 1M tokens",
    higherIsBetter: false,
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    key: "output_cost_per_1m",
    title: "Cheapest Output",
    subtitle: "USD per 1M tokens",
    higherIsBetter: false,
    format: (v: number) => `$${v.toFixed(2)}`,
  },
] as const;

type Mode = "benchmark" | "capability";
type SortKey = "rank" | "score" | "company" | "source" | "capability";
type SortDir = "asc" | "desc";

type Row = {
  rank: number;
  score: number;
  model: LLMModel;
  source: "Open Source" | "Closed Source";
  tags: string[];
};

function modelLink(model: LLMModel): string | null {
  const m = model as LLMModel & {
    homepage_url?: string | null;
    huggingface_url?: string | null;
  };
  return m.huggingface_url || m.homepage_url || model.api_docs_url || null;
}

function isLogoUrl(logo: string | null): boolean {
  if (!logo) return false;
  return logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/");
}

function metric(model: LLMModel, key: string): number | null {
  return getBenchmarkNumber(model, key);
}

function headerButtonLabel(label: string) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </span>
  );
}

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

function sortByMetric(
  data: LLMModel[],
  key: string,
  higherIsBetter: boolean,
): { model: LLMModel; value: number }[] {
  const rows = data
    .map((modelItem) => ({ model: modelItem, value: metric(modelItem, key) }))
    .filter((x): x is { model: LLMModel; value: number } => typeof x.value === "number");

  rows.sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
  return rows;
}

export const BenchmarkLeaderboard = (props: {
  models: LLMModel[];
  lastUpdated: Date | null;
}) => {
  const [mode, setMode] = useState<Mode>("benchmark");
  const [selectedBenchmark, setSelectedBenchmark] = useState<
    (typeof benchmarkDefs)[number]["key"]
  >(benchmarkDefs[0].key);
  const [selectedCapability, setSelectedCapability] = useState(capabilityCategories[0].id);
  const [sourceFilter, setSourceFilter] = useState<"all" | "open" | "closed">("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredModels = useMemo(() => {
    if (sourceFilter === "open") return props.models.filter((m) => m.is_open_source);
    if (sourceFilter === "closed") return props.models.filter((m) => !m.is_open_source);
    return props.models;
  }, [props.models, sourceFilter]);

  const topTaskRows = useMemo(() => {
    return taskCards.map((card) => ({
      ...card,
      rows: sortByMetric(filteredModels, card.key, card.higherIsBetter).slice(0, 5),
    }));
  }, [filteredModels]);

  const efficiencyRows = useMemo(() => {
    return efficiencyCards.map((card) => ({
      ...card,
      rows: sortByMetric(filteredModels, card.key, card.higherIsBetter).slice(0, 5),
    }));
  }, [filteredModels]);

  const baseRows = useMemo(() => {
    const scored = filteredModels
      .map((m) => {
        const score =
          mode === "benchmark"
            ? getBenchmarkNumber(m, selectedBenchmark)
            : getCapabilityScore(m, selectedCapability);
        return { model: m, score: typeof score === "number" ? score : null };
      })
      .filter((x) => typeof x.score === "number") as {
      model: LLMModel;
      score: number;
    }[];

    scored.sort((a, b) => b.score - a.score);

    return scored.map((item, index) => ({
      rank: index + 1,
      score: item.score,
      model: item.model,
      source: item.model.is_open_source ? "Open Source" : "Closed Source",
      tags: getModelCategoryTags(item.model),
    })) as Row[];
  }, [filteredModels, mode, selectedBenchmark, selectedCapability]);

  const rows = useMemo(() => {
    const data = [...baseRows];

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "company":
          cmp = a.model.company.localeCompare(b.model.company);
          break;
        case "source":
          cmp = a.source.localeCompare(b.source);
          break;
        case "capability":
          cmp = (a.tags[0] || "").localeCompare(b.tags[0] || "");
          break;
        default:
          cmp = 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [baseRows, sortDir, sortKey]);

  const barData = baseRows.slice(0, 8).map((x) => ({
    name: x.model.name,
    score: Number(x.score.toFixed(2)),
  }));

  const lastUpdatedLabel = props.lastUpdated
    ? props.lastUpdated.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const selectedTitle =
    mode === "benchmark"
      ? benchmarkDefs.find((b) => b.key === selectedBenchmark)?.name
      : capabilityCategories.find((c) => c.id === selectedCapability)?.name;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "score" ? "desc" : "asc");
  };

  return (
    <section id="benchmarks" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
          animate={{ x: [0, 30, -10, 0], y: [0, 15, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"
          animate={{ x: [0, -20, 20, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-7">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-primary">
              Global Model Leaderboard{lastUpdatedLabel ? ` • Updated ${lastUpdatedLabel}` : ""}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[0.98]">
            Full <span className="atlas-gradient-text">Leaderboard</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Latest open-source and closed-source models across reasoning, coding, latency,
            speed, and pricing.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Button
            variant="ghost"
            size="sm"
            className={chipClass(sourceFilter === "all")}
            onClick={() => setSourceFilter("all")}
          >
            All Models
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={chipClass(sourceFilter === "open")}
            onClick={() => setSourceFilter("open")}
          >
            Open Source
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={chipClass(sourceFilter === "closed")}
            onClick={() => setSourceFilter("closed")}
          >
            Closed Source
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
          {topTaskRows.map((card, cardIndex) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: cardIndex * 0.06 }}
              className="rounded-2xl border border-primary/25 bg-card/85 backdrop-blur p-5 chronyx-animated-border"
            >
              <div className="mb-4">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {card.subtitle}
                </div>
                <h3 className="text-lg font-black text-foreground">{card.title}</h3>
              </div>
              <div className="space-y-2.5">
                {card.rows.map((entry, idx) => (
                  <motion.div
                    key={`${card.key}-${entry.model.slug}`}
                    whileHover={{ y: -1, scale: 1.01 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/70 px-3 py-2 transition-all hover:border-primary/35 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-primary w-5">{idx + 1}</span>
                      {isLogoUrl(entry.model.logo) ? (
                        <img
                          src={entry.model.logo || ""}
                          alt={`${entry.model.company} logo`}
                          className="w-5 h-5 rounded object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px]">
                          {entry.model.logo || "•"}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-foreground truncate">
                        {entry.model.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                      {card.format(entry.value)}
                    </span>
                  </motion.div>
                ))}
                {!card.rows.length ? (
                  <div className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-sm text-center text-muted-foreground">
                    No data in current filter.
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/60 bg-card/85 p-5 mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-black">Fastest and Most Affordable Models</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {efficiencyRows.map((card) => (
              <motion.div
                key={card.key}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border/60 bg-background/60 p-3 transition-all hover:border-primary/35 hover:bg-primary/5"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{card.subtitle}</div>
                <div className="text-sm font-bold text-foreground mb-2">{card.title}</div>
                <div className="space-y-1.5">
                  {card.rows.slice(0, 3).map((entry) => (
                    <div
                      key={`${card.key}-${entry.model.slug}`}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-medium text-foreground truncate">{entry.model.name}</span>
                      <span className="font-bold text-primary whitespace-nowrap">{card.format(entry.value)}</span>
                    </div>
                  ))}
                  {!card.rows.length ? <div className="text-xs text-muted-foreground">No data</div> : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Top Models ({selectedTitle})
          </h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={148}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className={chipClass(mode === "benchmark")}
            onClick={() => setMode("benchmark")}
          >
            Benchmark Mode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={chipClass(mode === "capability")}
            onClick={() => setMode("capability")}
          >
            Capability Mode
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {mode === "benchmark"
              ? benchmarkDefs.map((b) => (
                <Button
                  key={b.key}
                  variant="ghost"
                  size="sm"
                  className={chipClass(selectedBenchmark === b.key)}
                  onClick={() => setSelectedBenchmark(b.key)}
                  title={b.description}
                >
                  {b.name}
                </Button>
              ))
              : capabilityCategories.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  size="sm"
                  className={chipClass(selectedCapability === c.id)}
                  onClick={() => setSelectedCapability(c.id)}
                  title={c.description}
                >
                  {c.name}
                </Button>
              ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Full Leaderboard ({selectedTitle})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort("rank")} className="hover:text-foreground">
                      {headerButtonLabel("Rank")}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort("company")} className="hover:text-foreground">
                      {headerButtonLabel("Company")}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort("source")} className="hover:text-foreground">
                      {headerButtonLabel("Source")}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort("capability")} className="hover:text-foreground">
                      {headerButtonLabel("Capability")}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort("score")} className="hover:text-foreground">
                      {headerButtonLabel("Score")}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 80).map((item, index) => {
                  const link = modelLink(item.model);
                  return (
                    <motion.tr
                      key={`${item.model.slug}-${selectedTitle}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.008 }}
                      className="border-b border-border/30 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {item.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          {item.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                          {item.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                          {item.rank > 3 && (
                            <span className="w-5 text-center font-bold text-muted-foreground">
                              {item.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isLogoUrl(item.model.logo) ? (
                            <img
                              src={item.model.logo || ""}
                              alt={`${item.model.company} logo`}
                              className="w-5 h-5 rounded object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px]">
                              {item.model.logo || "•"}
                            </span>
                          )}
                          <Link
                            to={`/llm-galaxy/model/${item.model.slug}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {item.model.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{item.model.company}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            item.source === "Open Source"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-amber-500/15 text-amber-600"
                          }`}
                        >
                          {item.source}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 4).map((tag) => (
                            <span
                              key={`${item.model.slug}-${tag}`}
                              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-foreground">
                        {Number(item.score.toFixed(2))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/llm-galaxy/model/${item.model.slug}`}>Model Page</Link>
                          </Button>
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                              aria-label={`${item.model.name} external link`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
