import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, TrendingUp, ExternalLink, Sparkles, Shield, Code, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

type VersionItem = {
  name: string;
  date?: string;
  highlight?: string;
  url?: string;
  hf_url?: string;
};

function readVersionItems(model: LLMModel): VersionItem[] {
  const v = model.versions as any;
  const arr = Array.isArray(v) ? v : v?.items;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x: any) => {
      if (typeof x === "string") return { name: x } as VersionItem;
      if (x && typeof x === "object" && typeof x.name === "string") return x as VersionItem;
      return null;
    })
    .filter(Boolean) as VersionItem[];
}

export const ModelFamilyModal = (props: { isOpen: boolean; onClose: () => void; family: LLMModel | null }) => {
  const family = props.family;
  if (!family) return null;

  const color = family.color || "from-primary to-secondary";
  const logo = family.logo || "✨";
  const versions = readVersionItems(family);
  const mmlu = getBenchmarkNumber(family, "mmlu");
  const gsm8k = getBenchmarkNumber(family, "gsm8k");
  const humaneval = getBenchmarkNumber(family, "humaneval");
  const arena = getBenchmarkNumber(family, "arena_elo");

  const openLabel = family.is_open_source ? "Open weight" : "Closed source";

  return (
    <AnimatePresence>
      {props.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={props.onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card rounded-3xl border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
              <div className={`relative bg-gradient-to-br ${color} p-8`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                      {logo}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white mb-1">{family.name} Family</h2>
                      <p className="text-white/80 font-medium">{family.company}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3" /> {openLabel}
                        </span>
                        {family.release_date ? (
                          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {family.release_date}
                          </span>
                        ) : null}
                        {family.is_trending ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-200 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Trending
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={props.onClose}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{typeof mmlu === "number" ? `${mmlu}%` : "—"}</div>
                  <div className="text-white/70 text-sm font-medium">MMLU</div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {family.description ? (
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{family.description}</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "GSM8K", value: gsm8k },
                    { label: "HumanEval", value: humaneval },
                    { label: "Arena Elo", value: arena },
                  ].map((x) => (
                    <div key={x.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="text-xs text-muted-foreground">{x.label}</div>
                      <div className="text-xl font-black text-foreground mt-1">
                        {typeof x.value === "number" ? x.value : "—"}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="text-xs text-muted-foreground">Context Window</div>
                    <div className="text-xl font-black text-foreground mt-1">{family.context_window || "—"}</div>
                  </div>
                </div>

                {versions.length ? (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Latest Releases
                    </h3>
                    <div className="space-y-3">
                      {versions.slice(0, 10).map((v) => (
                        <div key={v.name} className="rounded-2xl bg-muted/30 border border-border/50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground">{v.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {v.date ? v.date : family.release_date ? family.release_date : "Latest"}
                                {v.highlight ? ` • ${v.highlight}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {v.hf_url ? (
                                <a
                                  href={v.hf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                                >
                                  Hugging Face
                                </a>
                              ) : null}
                              {v.url ? (
                                <a
                                  href={v.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                                >
                                  Docs
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-primary" />
                      <div className="font-semibold text-foreground">Strengths</div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {(family.strengths || []).slice(0, 8).map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 text-primary/80" />
                          <span>{s}</span>
                        </li>
                      ))}
                      {!family.strengths?.length ? <li>—</li> : null}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="w-4 h-4 text-primary" />
                      <div className="font-semibold text-foreground">Use Cases</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(family.use_cases || []).slice(0, 12).map((u) => (
                        <span key={u} className="px-2 py-1 rounded-full text-xs font-semibold bg-muted/40 border border-border/60">
                          {u}
                        </span>
                      ))}
                      {!family.use_cases?.length ? <span className="text-sm text-muted-foreground">—</span> : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <div className="font-semibold text-foreground">Considerations</div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {(family as any).considerations?.slice?.(0, 8)?.map((c: string) => (
                        <li key={c} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 text-primary/60" />
                          <span>{c}</span>
                        </li>
                      ))}
                      {!(family as any).considerations?.length ? <li>—</li> : null}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {family.api_docs_url ? (
                    <Button variant="hero-outline" size="sm" asChild>
                      <a href={family.api_docs_url} target="_blank" rel="noopener noreferrer">
                        API Docs <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : null}
                  {(family as any).homepage_url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={(family as any).homepage_url} target="_blank" rel="noopener noreferrer">
                        Website <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : null}
                  {(family as any).huggingface_url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={(family as any).huggingface_url} target="_blank" rel="noopener noreferrer">
                        Hugging Face <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

