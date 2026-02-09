import { motion } from "framer-motion";
import { TrendingUp, Calendar, Sparkles, Zap, Brain, DollarSign } from "lucide-react";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

function parseContextWindow(v: string | null): number | null {
  if (!v) return null;
  const s = v.trim().toUpperCase();
  const m = s.match(/^(\d+(\.\d+)?)(K|M)?/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[3];
  if (unit === "M") return Math.round(n * 1_000_000);
  if (unit === "K") return Math.round(n * 1_000);
  return Math.round(n);
}

function parseDateLike(s: string): number {
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return t;
  // Try year-only
  const m = s.match(/(20\d{2})/);
  if (m) return Date.parse(`${m[1]}-01-01`);
  return 0;
}

export const TrendsInsights = (props: { models: LLMModel[] }) => {
  const total = props.models.length;
  const open = props.models.filter((m) => m.is_open_source).length;
  const multimodal = props.models.filter((m) => m.is_multimodal).length;
  const trending = props.models.filter((m) => m.is_trending).length;
  const maxCtx = props.models
    .map((m) => parseContextWindow(m.context_window))
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
    .sort((a, b) => b - a)[0];

  const latest = [...props.models]
    .filter((m) => !!m.release_date)
    .sort((a, b) => parseDateLike(b.release_date || "") - parseDateLike(a.release_date || ""))
    .slice(0, 10);

  const best = [...props.models]
    .map((m) => ({ m, v: getBenchmarkNumber(m, "mmlu") ?? 0 }))
    .sort((a, b) => b.v - a.v)[0];

  const trendingTopics = [
    { title: "Open-weight Ecosystem", change: total ? `${Math.round((open / total) * 100)}%` : "—", description: "Share of families with open weights" },
    { title: "Multimodal Expansion", change: total ? `${Math.round((multimodal / total) * 100)}%` : "—", description: "Families supporting vision/audio modalities" },
    { title: "Context Windows", change: maxCtx ? `${maxCtx >= 1_000_000 ? `${Math.round(maxCtx / 1_000_000)}M` : `${Math.round(maxCtx / 1000)}K`}` : "—", description: "Largest context window tracked" },
    { title: "Trending Families", change: trending ? `${trending}+` : "—", description: "Families flagged as trending in the Galaxy DB" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trends & Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Industry <span className="atlas-gradient-text">Evolution</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Derived from the Galaxy database. Treat this page as the core source of truth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="glass-card-hover rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-foreground">{topic.change}</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">{topic.title}</h4>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Current Frontier
            </h3>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <div className="text-sm text-muted-foreground">Highest MMLU in DB</div>
              <div className="mt-2 text-2xl font-black text-foreground">{best?.m?.name || "—"}</div>
              <div className="text-sm text-muted-foreground">{best?.m?.company || ""}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  MMLU: {best?.v ? best.v : "—"}
                </span>
                {best?.m?.context_window ? (
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
                    Context: {best.m.context_window}
                  </span>
                ) : null}
                {best?.m?.pricing ? (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-semibold inline-flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {best.m.pricing}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Latest Updates
            </h3>
            <div className="space-y-3">
              {latest.length === 0 ? (
                <div className="text-sm text-muted-foreground">No release dates yet. Add `release_date` for each family.</div>
              ) : null}
              {latest.map((m, idx) => (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-2xl border border-border/60 bg-background/40 p-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{m.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{m.company}</div>
                    <div className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {m.release_date}
                    </div>
                  </div>
                  {m.is_trending ? (
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Trending</span>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

