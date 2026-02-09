import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Layers, Brain, DollarSign, Zap, Shield, Code, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function normalizeBenchmarks(model: LLMModel): { name: string; score: number }[] {
  const b = model.benchmarks as Record<string, unknown> | null;
  if (!b || typeof b !== "object") return [];
  const keys = [
    ["mmlu", "MMLU"],
    ["gsm8k", "GSM8K"],
    ["humaneval", "HumanEval"],
    ["truthfulqa", "TruthfulQA"],
    ["mtbench", "MT-Bench"],
  ] as const;
  return keys
    .map(([k, label]) => {
      const v = b[k];
      return typeof v === "number" && Number.isFinite(v) ? { name: label, score: v } : null;
    })
    .filter(Boolean) as { name: string; score: number }[];
}

export default function ModelDetail() {
  const { modelId } = useParams<{ modelId: string }>();
  const slug = modelId || "";

  const { data: model, isLoading } = useQuery({
    queryKey: ["llm-model", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("llm_models").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as LLMModel | null;
    },
  });

  const m = model;
  const mExt = m as (LLMModel & { huggingface_url?: string | null }) | null;
  const color = m?.color || "from-primary to-secondary";
  const logo = m?.logo || "✨";
  const useImageLogo = typeof logo === "string" && (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/"));
  const openLabel = m?.is_open_source ? "Open weight" : "Closed source";

  const benchmarks = m ? normalizeBenchmarks(m) : [];
  const radarData = benchmarks.map((b) => ({ subject: b.name, score: b.score, fullMark: 100 }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 mb-8">
          <Link to="/llm-galaxy" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to LLM Galaxy
          </Link>
        </div>

        {isLoading ? (
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-3xl p-10 text-muted-foreground">Loading…</div>
          </div>
        ) : !m ? (
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-3xl p-10">
              <div className="text-xl font-black text-foreground">Model not found</div>
              <div className="text-muted-foreground mt-2">No model family exists for slug: {slug}</div>
            </div>
          </div>
        ) : (
          <>
            <section className="container mx-auto px-4 mb-16">
              <div className={`relative rounded-3xl bg-gradient-to-br ${color} p-8 md:p-12 overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-xl">
                      {useImageLogo ? (
                        <img src={logo} alt={`${m.company} logo`} className="w-14 h-14 object-contain" loading="lazy" />
                      ) : (
                        logo
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{m.name}</h1>
                      <p className="text-xl text-white/80 mb-4">{m.company}</p>
                      {m.description ? <p className="text-white/90 text-lg max-w-3xl">{m.description}</p> : null}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold inline-flex items-center gap-2">
                          <Shield className="w-4 h-4" /> {openLabel}
                        </span>
                        {m.release_date ? (
                          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold inline-flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {m.release_date}
                          </span>
                        ) : null}
                        {m.is_trending ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-100 text-sm font-semibold">
                            Trending
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <Layers className="w-4 h-4" />
                        <span className="text-sm">Parameters</span>
                      </div>
                      <div className="text-xl font-bold text-white">{m.parameters || "—"}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm">Context</span>
                      </div>
                      <div className="text-xl font-bold text-white">{m.context_window || "—"}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Pricing</span>
                      </div>
                      <div className="text-xl font-bold text-white">{m.pricing || "—"}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Speed</span>
                      </div>
                      <div className="text-xl font-bold text-white">{m.speed || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="container mx-auto px-4 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-black text-foreground mb-4">Strengths, Weaknesses, Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="font-semibold text-foreground mb-3">Strengths</div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {(m.strengths || []).slice(0, 10).map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <Zap className="w-4 h-4 mt-0.5 text-primary/80" />
                            <span>{s}</span>
                          </li>
                        ))}
                        {!m.strengths?.length ? <li>—</li> : null}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="font-semibold text-foreground mb-3">Weaknesses</div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {(m.weaknesses || []).slice(0, 10).map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <Shield className="w-4 h-4 mt-0.5 text-primary/70" />
                            <span>{s}</span>
                          </li>
                        ))}
                        {!m.weaknesses?.length ? <li>—</li> : null}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="font-semibold text-foreground mb-3">Best Uses</div>
                      <div className="flex flex-wrap gap-2">
                        {(m.use_cases || []).slice(0, 18).map((u) => (
                          <span key={u} className="px-2 py-1 rounded-full text-xs font-semibold bg-muted/40 border border-border/60">
                            {u}
                          </span>
                        ))}
                        {!m.use_cases?.length ? <span className="text-sm text-muted-foreground">—</span> : null}
                      </div>
                    </div>
                  </div>

                  {m.architecture ? (
                    <div className="mt-6 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Architecture:</span> {m.architecture}
                    </div>
                  ) : null}
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-black text-foreground mb-4">Benchmarks</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>MMLU</span>
                      <span className="font-bold text-foreground">{getBenchmarkNumber(m, "mmlu") ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>GSM8K</span>
                      <span className="font-bold text-foreground">{getBenchmarkNumber(m, "gsm8k") ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>HumanEval</span>
                      <span className="font-bold text-foreground">{getBenchmarkNumber(m, "humaneval") ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Arena Elo</span>
                      <span className="font-bold text-foreground">{getBenchmarkNumber(m, "arena_elo") ?? "—"}</span>
                    </div>
                  </div>

                  <div className="h-[280px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Radar name={m.name} dataKey="score" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {m.api_docs_url ? (
                      <Button variant="hero-outline" size="sm" asChild>
                        <a href={m.api_docs_url} target="_blank" rel="noopener noreferrer">
                          API Docs <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : null}
                    {mExt?.huggingface_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mExt.huggingface_url} target="_blank" rel="noopener noreferrer">
                          Hugging Face <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
