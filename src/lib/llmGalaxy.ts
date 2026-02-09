import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

export type CapabilityCategory = {
  id:
    | "coding"
    | "voice"
    | "video"
    | "speech_to_text"
    | "text_to_speech"
    | "speech_to_speech"
    | "image_generation"
    | "video_generation"
    | "reasoning"
    | "chatbots"
    | "agents"
    | "rag"
    | "other";
  name: string;
  shortTag: string;
  description: string;
  keywordHints: string[];
};

export const capabilityCategories: CapabilityCategory[] = [
  {
    id: "coding",
    name: "Coding",
    shortTag: "Code",
    description: "Best models for coding generation, refactoring, tests, and debugging.",
    keywordHints: ["coding", "code", "developer", "software", "humaneval"],
  },
  {
    id: "voice",
    name: "Voice",
    shortTag: "Voice",
    description: "Voice-capable assistant workflows and conversational audio interactions.",
    keywordHints: ["voice", "audio", "spoken", "realtime"],
  },
  {
    id: "video",
    name: "Video Understanding",
    shortTag: "Video",
    description: "Video analysis and multimodal video understanding.",
    keywordHints: ["video", "multimodal", "vision"],
  },
  {
    id: "speech_to_text",
    name: "Speech to Text",
    shortTag: "STT",
    description: "Transcribe spoken audio into text with quality and consistency.",
    keywordHints: ["speech to text", "stt", "transcription", "transcribe"],
  },
  {
    id: "text_to_speech",
    name: "Text to Speech",
    shortTag: "TTS",
    description: "Generate natural speech from text prompts.",
    keywordHints: ["text to speech", "tts", "speech synthesis", "voice synthesis"],
  },
  {
    id: "speech_to_speech",
    name: "Speech to Speech",
    shortTag: "S2S",
    description: "End-to-end speech translation and response pipelines.",
    keywordHints: ["speech to speech", "s2s", "realtime voice", "spoken dialogue"],
  },
  {
    id: "image_generation",
    name: "Image Generation",
    shortTag: "Image Gen",
    description: "Create and edit images from prompts.",
    keywordHints: ["image generation", "text-to-image", "image", "vision"],
  },
  {
    id: "video_generation",
    name: "Video Generation",
    shortTag: "Video Gen",
    description: "Generate or edit videos from prompt-based workflows.",
    keywordHints: ["video generation", "text-to-video", "video"],
  },
  {
    id: "reasoning",
    name: "Reasoning",
    shortTag: "Reason",
    description: "Multi-step analytical reasoning and problem solving.",
    keywordHints: ["reasoning", "analysis", "math", "mmlu", "gsm8k"],
  },
  {
    id: "chatbots",
    name: "Chatbots",
    shortTag: "Chat",
    description: "Conversational assistants and support experiences.",
    keywordHints: ["chatbot", "chat", "assistant", "support"],
  },
  {
    id: "agents",
    name: "Agents",
    shortTag: "Agent",
    description: "Tool-using agents for workflows and orchestration.",
    keywordHints: ["agent", "tool use", "workflow", "automation"],
  },
  {
    id: "rag",
    name: "RAG",
    shortTag: "RAG",
    description: "Retrieval-augmented generation over private data.",
    keywordHints: ["rag", "retrieval", "knowledge base", "context"],
  },
  {
    id: "other",
    name: "Other / General",
    shortTag: "General",
    description: "Broad general-purpose LLM performance.",
    keywordHints: ["general", "multimodal", "enterprise"],
  },
];

const capKeyMap: Record<CapabilityCategory["id"], string> = {
  coding: "coding_score",
  voice: "voice_score",
  video: "video_score",
  speech_to_text: "stt_score",
  text_to_speech: "tts_score",
  speech_to_speech: "s2s_score",
  image_generation: "image_gen_score",
  video_generation: "video_gen_score",
  reasoning: "reasoning_score",
  chatbots: "chatbot_score",
  agents: "agents_score",
  rag: "rag_score",
  other: "general_score",
};

function normalizeArenaElo(v: number | null): number {
  if (typeof v !== "number") return 0;
  return Math.max(0, Math.min(100, (v - 1000) / 7));
}

function modelText(model: LLMModel): string {
  return [
    model.name,
    model.company,
    model.description || "",
    ...(model.use_cases || []),
    ...(model.strengths || []),
    ...(model.weaknesses || []),
  ]
    .join(" ")
    .toLowerCase();
}

function keywordBoost(model: LLMModel, category: CapabilityCategory): number {
  const text = modelText(model);
  const hits = category.keywordHints.filter((k) => text.includes(k.toLowerCase())).length;
  return Math.min(28, hits * 7);
}

export function getCapabilityScore(model: LLMModel, categoryId: CapabilityCategory["id"]): number {
  const capKey = capKeyMap[categoryId];
  const direct = getBenchmarkNumber(model, capKey);
  if (typeof direct === "number") return Math.max(0, Math.min(100, direct));

  const mmlu = getBenchmarkNumber(model, "mmlu") ?? 0;
  const gsm8k = getBenchmarkNumber(model, "gsm8k") ?? 0;
  const humaneval = getBenchmarkNumber(model, "humaneval") ?? 0;
  const mtbench = getBenchmarkNumber(model, "mtbench") ?? 0;
  const truthful = getBenchmarkNumber(model, "truthfulqa") ?? 0;
  const arena = normalizeArenaElo(getBenchmarkNumber(model, "arena_elo"));

  const category = capabilityCategories.find((c) => c.id === categoryId);
  const boost = category ? keywordBoost(model, category) : 0;

  let base = 0;
  switch (categoryId) {
    case "coding":
      base = humaneval * 0.55 + mmlu * 0.25 + gsm8k * 0.2;
      break;
    case "reasoning":
      base = mmlu * 0.45 + gsm8k * 0.35 + mtbench * 0.2;
      break;
    case "chatbots":
      base = mtbench * 0.45 + truthful * 0.25 + arena * 0.3;
      break;
    case "agents":
      base = mmlu * 0.3 + mtbench * 0.35 + humaneval * 0.2 + arena * 0.15;
      break;
    case "rag":
      base = truthful * 0.35 + mmlu * 0.35 + mtbench * 0.3;
      break;
    case "voice":
    case "speech_to_text":
    case "text_to_speech":
    case "speech_to_speech":
      base = mtbench * 0.4 + arena * 0.35 + mmlu * 0.25;
      break;
    case "video":
    case "image_generation":
    case "video_generation":
      base = mtbench * 0.45 + arena * 0.3 + mmlu * 0.25;
      break;
    case "other":
    default:
      base = mmlu * 0.3 + gsm8k * 0.2 + humaneval * 0.2 + truthful * 0.15 + mtbench * 0.15;
      break;
  }

  const multimodalLift = model.is_multimodal ? 6 : 0;
  const openSourceLift = model.is_open_source ? 2 : 0;

  return Math.max(0, Math.min(100, base + boost + multimodalLift + openSourceLift));
}

export function getModelCategoryTags(model: LLMModel): string[] {
  const tags = new Set<string>();

  if (model.is_open_source) tags.add("Open Source");
  else tags.add("Closed Source");

  if (model.is_multimodal) tags.add("Multimodal");
  if (model.is_trending) tags.add("Trending");

  const lowercaseUseCases = (model.use_cases || []).map((u) => u.toLowerCase());
  for (const c of capabilityCategories) {
    const hasCase = lowercaseUseCases.some((u) => c.keywordHints.some((k) => u.includes(k.toLowerCase())));
    const score = getCapabilityScore(model, c.id);
    if (hasCase || score >= 60) tags.add(c.shortTag);
  }

  return Array.from(tags).slice(0, 7);
}
