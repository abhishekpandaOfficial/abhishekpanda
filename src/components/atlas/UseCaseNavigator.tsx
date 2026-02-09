import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Brain,
  Code,
  Bot,
  Database,
  Image,
  Smartphone,
  Building2,
  FlaskConical,
  ChevronRight,
  Zap,
  DollarSign,
} from "lucide-react";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

type UseCaseDef = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tag: string;
};

const useCases: UseCaseDef[] = [
  { id: "chatbots", name: "Chatbots", icon: MessageSquare, description: "Customer support, assistants, and conversational UX", tag: "Chatbots" },
  { id: "reasoning", name: "Reasoning", icon: Brain, description: "Hard analysis, structured thinking, multi-step planning", tag: "Reasoning" },
  { id: "coding", name: "Coding", icon: Code, description: "Code generation, refactors, debugging, and reviews", tag: "Coding" },
  { id: "agents", name: "Agents", icon: Bot, description: "Tool-use, workflows, autonomous task execution", tag: "Agents" },
  { id: "rag", name: "RAG", icon: Database, description: "Retrieval augmented generation over private knowledge", tag: "RAG" },
  { id: "multimodal", name: "Multimodal", icon: Image, description: "Vision and multimodal understanding", tag: "Multimodal" },
  { id: "edge", name: "On-device / Edge", icon: Smartphone, description: "Small models and constrained deployment", tag: "Edge" },
  { id: "enterprise", name: "Enterprise", icon: Building2, description: "Compliance, privacy, and governance considerations", tag: "Enterprise" },
  { id: "scientific", name: "Scientific", icon: FlaskConical, description: "Research, literature, and domain-heavy work", tag: "Research" },
];

const getCostColor = (pricing: string | null) => {
  if (!pricing) return "text-muted-foreground";
  if (pricing.toLowerCase().includes("free")) return "text-green-500";
  if (pricing.includes("$$$$")) return "text-red-500";
  if (pricing.includes("$$$")) return "text-orange-500";
  if (pricing.includes("$$")) return "text-yellow-500";
  if (pricing.includes("$")) return "text-green-400";
  return "text-muted-foreground";
};

function scoreForUseCase(model: LLMModel): number {
  // Simple composite: reasoning + coding; adjust by model-specific data in DB when available.
  const mmlu = getBenchmarkNumber(model, "mmlu") ?? 0;
  const humaneval = getBenchmarkNumber(model, "humaneval") ?? 0;
  const gsm8k = getBenchmarkNumber(model, "gsm8k") ?? 0;
  return mmlu * 0.45 + humaneval * 0.4 + gsm8k * 0.15;
}

export const UseCaseNavigator = (props: { models: LLMModel[] }) => {
  const [selectedUseCase, setSelectedUseCase] = useState(useCases[0]);

  const recommendations = useMemo(() => {
    const out: Record<string, { model: LLMModel; score: number; reason: string }[]> = {};
    for (const u of useCases) {
      const matches = props.models.filter((m) => (m.use_cases || []).map((x) => x.toLowerCase()).includes(u.tag.toLowerCase()));
      const scored = matches
        .map((m) => ({ model: m, score: scoreForUseCase(m) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x, i) => ({
          ...x,
          reason:
            (x.model.strengths && x.model.strengths[0]) ||
            (x.model.is_open_source ? "Best open-weight option" : "Strong general performance"),
        }));
      out[u.id] = scored;
    }
    return out;
  }, [props.models]);

  const selected = recommendations[selectedUseCase.id] || [];

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Use Case Navigator</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find the <span className="atlas-gradient-text">Best Fit</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recommendations are derived from the Galaxy database: use-cases, strengths, and benchmark signals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">Select Use Case</h3>
              <div className="space-y-1">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => setSelectedUseCase(useCase)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      selectedUseCase.id === useCase.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <useCase.icon className="w-5 h-5" />
                    <span className="font-medium">{useCase.name}</span>
                    {selectedUseCase.id === useCase.id ? <ChevronRight className="w-4 h-4 ml-auto" /> : null}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedUseCase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <selectedUseCase.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{selectedUseCase.name}</h3>
                      <p className="text-muted-foreground">{selectedUseCase.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selected.length === 0 ? (
                    <div className="glass-card rounded-2xl p-6 text-muted-foreground">
                      No recommendations yet. Add this use-case tag to models in the admin panel.
                    </div>
                  ) : null}
                  {selected.map((rec, index) => (
                    <motion.div
                      key={rec.model.slug}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="glass-card-hover rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              : index === 2
                              ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-foreground truncate">{rec.model.name}</div>
                              <div className="text-sm text-muted-foreground truncate">{rec.model.company}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-foreground">{Math.round(rec.score)}</span>
                              <span className={`text-xs font-semibold ${getCostColor(rec.model.pricing)}`}>
                                <DollarSign className="w-3 h-3 inline mr-1" />
                                {rec.model.pricing || "—"}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">{rec.reason}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

