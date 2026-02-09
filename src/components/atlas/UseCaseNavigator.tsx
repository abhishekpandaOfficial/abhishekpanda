import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Brain,
  Code,
  Bot,
  Database,
  Image,
  Video,
  Mic,
  Volume2,
  AudioWaveform,
  ChevronRight,
  Zap,
  DollarSign,
  Shield,
  Lock,
} from "lucide-react";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";
import { getCapabilityScore } from "@/lib/llmGalaxy";

type UseCaseId =
  | "chatbots"
  | "reasoning"
  | "coding"
  | "agents"
  | "rag"
  | "image_generation"
  | "video_generation"
  | "voice"
  | "speech_to_text"
  | "text_to_speech"
  | "speech_to_speech";

type UseCaseDef = {
  id: UseCaseId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

type RankedModel = {
  model: LLMModel;
  score: number;
  reason: string;
  source: "Open Source" | "Closed Source";
};

const useCases: UseCaseDef[] = [
  { id: "chatbots", name: "Chatbots", icon: MessageSquare, description: "Customer support, assistants, and conversational UX." },
  { id: "reasoning", name: "Reasoning", icon: Brain, description: "Hard analysis, structured thinking, and multi-step planning." },
  { id: "coding", name: "Coding", icon: Code, description: "Code generation, refactors, debugging, and review workflows." },
  { id: "agents", name: "Agents", icon: Bot, description: "Tool-use, workflow automation, and autonomous task execution." },
  { id: "rag", name: "RAG", icon: Database, description: "Retrieval-augmented generation over internal/private knowledge." },
  { id: "image_generation", name: "Image Generation", icon: Image, description: "Prompt-to-image and image editing experiences." },
  { id: "video_generation", name: "Video Generation", icon: Video, description: "Prompt-driven video creation and video pipelines." },
  { id: "voice", name: "Voice", icon: Mic, description: "Voice-first assistant interactions and spoken interfaces." },
  { id: "speech_to_text", name: "Speech to Text", icon: AudioWaveform, description: "Audio transcription and speech recognition tasks." },
  { id: "text_to_speech", name: "Text to Speech", icon: Volume2, description: "Synthetic speech generation from text." },
  { id: "speech_to_speech", name: "Speech to Speech", icon: Zap, description: "Real-time speech-in, speech-out workflows." },
];

const categoryMetricKeys: Partial<Record<UseCaseId, string[]>> = {
  coding: ["coding_score", "swe_bench", "humaneval", "livecode", "aider_polyglot"],
  reasoning: ["reasoning_score", "gpqa", "aime_2025", "mmlu", "gsm8k"],
  chatbots: ["chatbot_score", "arena_elo", "mtbench"],
  agents: ["agents_score", "bfcl", "swe_bench"],
  rag: ["rag_score", "truthfulqa", "mmlu"],
  image_generation: ["image_gen_score"],
  video_generation: ["video_gen_score"],
  voice: ["voice_score"],
  speech_to_text: ["stt_score"],
  text_to_speech: ["tts_score"],
  speech_to_speech: ["s2s_score"],
};

const categoryKeywords: Partial<Record<UseCaseId, string[]>> = {
  coding: ["coding", "code", "developer", "software", "swe"],
  reasoning: ["reasoning", "math", "analysis"],
  agents: ["agent", "tool", "workflow", "automation"],
  rag: ["rag", "retrieval", "knowledge"],
  image_generation: ["image generation", "text-to-image", "image"],
  video_generation: ["video generation", "text-to-video", "video"],
  voice: ["voice", "audio", "realtime"],
  speech_to_text: ["speech to text", "stt", "transcript", "transcription"],
  text_to_speech: ["text to speech", "tts", "speech generation"],
  speech_to_speech: ["speech to speech", "s2s", "voice agent"],
};

function companyId(model: LLMModel): string {
  const text = `${model.company} ${model.name}`.toLowerCase();
  if (text.includes("openai") || text.includes("gpt")) return "openai";
  if (text.includes("anthropic") || text.includes("claude")) return "anthropic";
  if (text.includes("google") || text.includes("gemini")) return "google";
  if (text.includes("meta") || text.includes("llama")) return "meta";
  if (text.includes("deepseek")) return "deepseek";
  if (text.includes("mistral") || text.includes("voxtral") || text.includes("codestral")) return "mistral";
  if (text.includes("xai") || text.includes("x.ai") || text.includes("grok")) return "xai";
  if (text.includes("qwen") || text.includes("alibaba")) return "qwen";
  if (text.includes("moonshot") || text.includes("kimi")) return "moonshot";
  if (text.includes("nvidia") || text.includes("nemotron")) return "nvidia";
  return "generic";
}

function modelText(model: LLMModel): string {
  return [
    model.name,
    model.company,
    model.description || "",
    ...(model.use_cases || []),
    ...(model.strengths || []),
  ]
    .join(" ")
    .toLowerCase();
}

function hasKeywordSignal(model: LLMModel, category: UseCaseId): boolean {
  const text = modelText(model);
  const keys = categoryKeywords[category] || [];
  return keys.some((k) => text.includes(k));
}

function providerSupport(model: LLMModel, category: UseCaseId): { supported: boolean; evidence: string } {
  const provider = companyId(model);

  if (["coding", "reasoning", "chatbots", "agents", "rag"].includes(category)) {
    return { supported: true, evidence: "General frontier capability with benchmark support." };
  }

  if (category === "image_generation") {
    if (provider === "openai") return { supported: true, evidence: "OpenAI Images API supports GPT Image models for text/image-to-image." };
    return { supported: hasKeywordSignal(model, category), evidence: "Image generation support inferred from model metadata." };
  }

  if (category === "video_generation") {
    if (provider === "google") return { supported: true, evidence: "Gemini API supports Veo 3.1 text/image/video generation." };
    return { supported: hasKeywordSignal(model, category), evidence: "Video generation support inferred from model metadata." };
  }

  if (category === "voice") {
    if (provider === "openai") return { supported: true, evidence: "OpenAI Realtime supports audio input/output voice conversations." };
    if (provider === "google") return { supported: true, evidence: "Gemini Live API supports native audio input/output." };
    if (provider === "xai") return { supported: true, evidence: "xAI Voice Agent API supports real-time voice conversations." };
    if (provider === "mistral") return { supported: true, evidence: "Mistral Voxtral supports chat with audio input and transcription." };
    return { supported: hasKeywordSignal(model, category), evidence: "Voice support inferred from model metadata." };
  }

  if (category === "speech_to_text") {
    if (provider === "openai") return { supported: true, evidence: "OpenAI speech-to-text endpoints support transcriptions and translations." };
    if (provider === "google") return { supported: true, evidence: "Gemini audio understanding supports transcript generation." };
    if (provider === "mistral") return { supported: true, evidence: "Mistral transcription endpoints support Voxtral transcribe models." };
    if (provider === "xai") return { supported: true, evidence: "xAI voice API documentation highlights transcription/understanding." };
    return { supported: hasKeywordSignal(model, category), evidence: "STT support inferred from model metadata." };
  }

  if (category === "text_to_speech") {
    if (provider === "openai") return { supported: true, evidence: "OpenAI text-to-speech supports streaming speech generation." };
    if (provider === "google") return { supported: true, evidence: "Gemini API speech-generation supports native TTS." };
    if (provider === "xai") return { supported: true, evidence: "xAI voice agent provides real-time spoken output." };
    return { supported: hasKeywordSignal(model, category), evidence: "TTS support inferred from model metadata." };
  }

  if (category === "speech_to_speech") {
    if (provider === "openai") return { supported: true, evidence: "OpenAI Realtime supports voice-to-voice interactions." };
    if (provider === "google") return { supported: true, evidence: "Gemini Live API supports conversational audio input/output." };
    if (provider === "xai") return { supported: true, evidence: "xAI Voice Agent API supports real-time audio in/out." };
    return { supported: hasKeywordSignal(model, category), evidence: "S2S support inferred from model metadata." };
  }

  return { supported: hasKeywordSignal(model, category), evidence: "Capability inferred from current model metadata." };
}

function categoryStrength(model: LLMModel, category: UseCaseId): number {
  const keys = categoryMetricKeys[category] || [];
  let best = 0;
  for (const key of keys) {
    const v = getBenchmarkNumber(model, key);
    if (typeof v === "number") best = Math.max(best, v);
  }
  return best;
}

function isLogoUrl(logo: string | null): boolean {
  return !!logo && (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/"));
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

export const UseCaseNavigator = (props: { models: LLMModel[] }) => {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseDef>(useCases[0]);

  const recommendations = useMemo(() => {
    const out: Record<string, RankedModel[]> = {};

    for (const u of useCases) {
      const scored = props.models
        .map((m) => {
          const support = providerSupport(m, u.id);
          if (!support.supported) return null;

          const capability = getCapabilityScore(m, u.id);
          const strength = categoryStrength(m, u.id);
          const metadataBoost = hasKeywordSignal(m, u.id) ? 5 : 0;
          const score = Math.min(100, capability * 0.65 + strength * 0.25 + metadataBoost + 10);

          return {
            model: m,
            score,
            reason: support.evidence,
            source: m.is_open_source ? "Open Source" : "Closed Source",
          } as RankedModel;
        })
        .filter((x): x is RankedModel => !!x)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      out[u.id] = scored;
    }

    return out;
  }, [props.models]);

  const selected = recommendations[selectedUseCase.id] || [];
  const openModels = selected.filter((x) => x.source === "Open Source").slice(0, 5);
  const closedModels = selected.filter((x) => x.source === "Closed Source").slice(0, 5);

  const renderCard = (rec: RankedModel, index: number) => (
    <motion.div
      key={`${selectedUseCase.id}-${rec.model.slug}-${rec.source}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card-hover rounded-2xl p-5"
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
            <div className="min-w-0 flex items-center gap-2">
              {isLogoUrl(rec.model.logo) ? (
                <img
                  src={rec.model.logo || ""}
                  alt={`${rec.model.company} logo`}
                  className="w-5 h-5 rounded object-contain"
                  loading="lazy"
                />
              ) : null}
              <div>
                <div className="font-bold text-foreground truncate">{rec.model.name}</div>
                <div className="text-sm text-muted-foreground truncate">{rec.model.company}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">{Math.round(rec.score)}</span>
              <span className={`text-xs font-semibold ${getCostColor(rec.model.pricing)}`}>
                <DollarSign className="w-3 h-3 inline mr-1" />
                {rec.model.pricing || "—"}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">{rec.reason}</div>
        </div>
      </div>
    </motion.div>
  );

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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Navigate by category: coding, voice, STT, TTS, speech-to-speech, image/video generation, and more.
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">Select Category</h3>
              <div className="space-y-1 max-h-[560px] overflow-y-auto">
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
                transition={{ duration: 0.25 }}
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <Shield className="w-3.5 h-3.5" /> Open Source
                    </div>
                    {openModels.length ? openModels.map(renderCard) : (
                      <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
                        No reliable open-source entries for this category in current dataset.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <Lock className="w-3.5 h-3.5" /> Closed Source
                    </div>
                    {closedModels.length ? closedModels.map(renderCard) : (
                      <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
                        No reliable closed-source entries for this category in current dataset.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
