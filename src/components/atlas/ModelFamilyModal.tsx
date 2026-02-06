import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Zap, Brain, Code, Trophy, ExternalLink, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelFamily {
  name: string;
  company: string;
  logo: string;
  color: string;
  versions: string[];
  bestFor: string[];
  mmlu: number;
  trending: boolean;
}

interface ModelFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: ModelFamily | null;
}

const familyDetails: Record<string, {
  description: string;
  founded: string;
  headquarters: string;
  timeline: { version: string; date: string; highlight: string }[];
  keyFeatures: string[];
  useCases: string[];
  strengths: string[];
  limitations: string[];
}> = {
  GPT: {
    description: "GPT (Generative Pre-trained Transformer) is OpenAI's flagship series of large language models, revolutionizing natural language processing and becoming the foundation of modern AI assistants.",
    founded: "2018",
    headquarters: "San Francisco, USA",
    timeline: [
      { version: "GPT-1", date: "June 2018", highlight: "117M parameters, introduced transformer-based language modeling" },
      { version: "GPT-2", date: "Feb 2019", highlight: "1.5B parameters, demonstrated impressive text generation" },
      { version: "GPT-3", date: "June 2020", highlight: "175B parameters, few-shot learning breakthrough" },
      { version: "GPT-3.5", date: "Nov 2022", highlight: "ChatGPT launch, revolutionized AI chat" },
      { version: "GPT-4", date: "March 2023", highlight: "Multimodal capabilities, enhanced reasoning" },
      { version: "GPT-4 Turbo", date: "Nov 2023", highlight: "128K context, improved performance" },
      { version: "GPT-5.1", date: "2024", highlight: "Next-gen reasoning, agentic capabilities" },
    ],
    keyFeatures: ["World-class reasoning", "Multimodal (text + vision)", "Function calling", "JSON mode", "128K context window"],
    useCases: ["Conversational AI", "Code generation", "Content creation", "Data analysis", "Research assistance"],
    strengths: ["Superior instruction following", "Excellent code generation", "Strong reasoning", "Wide knowledge base"],
    limitations: ["Closed-source", "API costs", "Rate limits", "Knowledge cutoff"],
  },
  Claude: {
    description: "Claude is Anthropic's AI assistant, designed with a focus on safety, helpfulness, and honesty. Known for its thoughtful responses and strong analytical capabilities.",
    founded: "2021",
    headquarters: "San Francisco, USA",
    timeline: [
      { version: "Claude 1", date: "March 2023", highlight: "Initial release, Constitutional AI approach" },
      { version: "Claude 2", date: "July 2023", highlight: "100K context, improved capabilities" },
      { version: "Claude 3 Haiku", date: "March 2024", highlight: "Fast, cost-effective option" },
      { version: "Claude 3 Sonnet", date: "March 2024", highlight: "Balanced performance and speed" },
      { version: "Claude 3.5 Sonnet", date: "June 2024", highlight: "Best-in-class coding, 200K context" },
    ],
    keyFeatures: ["200K context window", "Constitutional AI", "Artifacts", "Computer use", "Strong ethics"],
    useCases: ["Long document analysis", "Code review", "Writing assistance", "Research", "Enterprise applications"],
    strengths: ["Longest context window", "Excellent at following nuanced instructions", "Strong coding abilities", "Thoughtful responses"],
    limitations: ["Closed-source", "Sometimes overly cautious", "API-only access"],
  },
  Gemini: {
    description: "Gemini is Google's most capable AI model family, natively multimodal from the ground up, excelling at understanding and reasoning across text, images, audio, video, and code.",
    founded: "2023",
    headquarters: "Mountain View, USA",
    timeline: [
      { version: "Gemini 1.0 Pro", date: "Dec 2023", highlight: "First release, strong multimodal capabilities" },
      { version: "Gemini 1.0 Ultra", date: "Feb 2024", highlight: "Largest model, SOTA benchmarks" },
      { version: "Gemini 1.5 Pro", date: "Feb 2024", highlight: "1M token context window" },
      { version: "Gemini 1.5 Flash", date: "May 2024", highlight: "Fast, efficient model" },
      { version: "Gemini 2.0", date: "Dec 2024", highlight: "Agentic AI, native tool use" },
    ],
    keyFeatures: ["Native multimodality", "1M+ context window", "Agentic capabilities", "Native tool use", "Google integration"],
    useCases: ["Multimodal understanding", "Video analysis", "Research", "Enterprise AI", "Developer tools"],
    strengths: ["Exceptional multimodal performance", "Massive context window", "Strong reasoning", "Google ecosystem"],
    limitations: ["Closed-source", "Regional availability", "Rate limits"],
  },
  LLaMA: {
    description: "LLaMA (Large Language Model Meta AI) is Meta's open-source LLM family, democratizing access to powerful AI models for research and commercial use.",
    founded: "2023",
    headquarters: "Menlo Park, USA",
    timeline: [
      { version: "LLaMA 1", date: "Feb 2023", highlight: "Open weights, research-focused" },
      { version: "LLaMA 2", date: "July 2023", highlight: "Commercial license, 70B parameters" },
      { version: "LLaMA 3", date: "April 2024", highlight: "8B and 70B, improved performance" },
      { version: "LLaMA 3.1", date: "July 2024", highlight: "405B parameters, frontier capabilities" },
    ],
    keyFeatures: ["Open weights", "Commercial use allowed", "Multiple sizes", "Fine-tuning friendly", "Strong community"],
    useCases: ["Fine-tuning", "On-premise deployment", "Research", "Custom applications", "Edge deployment"],
    strengths: ["Open-source", "Highly customizable", "No API costs", "Large community", "Multiple sizes"],
    limitations: ["Requires compute resources", "No official hosted API", "Self-hosting complexity"],
  },
  Qwen: {
    description: "Qwen is Alibaba's multilingual AI model series, excelling at Chinese and English language tasks with strong performance in coding and mathematics.",
    founded: "2023",
    headquarters: "Hangzhou, China",
    timeline: [
      { version: "Qwen 1", date: "Aug 2023", highlight: "Initial release, strong multilingual" },
      { version: "Qwen 1.5", date: "Feb 2024", highlight: "Improved capabilities across sizes" },
      { version: "Qwen 2", date: "June 2024", highlight: "Enhanced performance, new sizes" },
      { version: "Qwen 2.5", date: "Sept 2024", highlight: "72B parameters, coding excellence" },
    ],
    keyFeatures: ["Strong multilingual", "Excellent coding", "Open weights", "Multiple sizes", "Math capabilities"],
    useCases: ["Multilingual applications", "Code generation", "Math problem solving", "Chinese NLP", "Research"],
    strengths: ["Open-source", "Strong in Chinese/English", "Excellent at coding", "Good math reasoning"],
    limitations: ["Smaller community", "Less English-focused documentation"],
  },
  Mistral: {
    description: "Mistral AI builds open-source models focusing on efficiency and performance, pioneering the Mixture of Experts (MoE) architecture for cost-effective inference.",
    founded: "2023",
    headquarters: "Paris, France",
    timeline: [
      { version: "Mistral 7B", date: "Sept 2023", highlight: "Outperformed LLaMA 2 13B" },
      { version: "Mixtral 8x7B", date: "Dec 2023", highlight: "First open MoE, GPT-3.5 competitive" },
      { version: "Mistral Large", date: "Feb 2024", highlight: "Flagship closed model" },
      { version: "Mixtral 8x22B", date: "April 2024", highlight: "Largest open MoE model" },
    ],
    keyFeatures: ["MoE architecture", "Efficient inference", "Open weights", "Sliding window attention", "European AI"],
    useCases: ["Cost-effective deployment", "Enterprise applications", "Research", "European compliance", "Open-source AI"],
    strengths: ["Excellent efficiency", "Strong open-source models", "MoE innovation", "European data sovereignty"],
    limitations: ["Smaller model sizes", "Limited multimodal"],
  },
  DeepSeek: {
    description: "DeepSeek is a Chinese AI company producing highly capable and cost-efficient models, particularly excelling at coding tasks.",
    founded: "2023",
    headquarters: "Hangzhou, China",
    timeline: [
      { version: "DeepSeek LLM", date: "Nov 2023", highlight: "Initial release, strong performance" },
      { version: "DeepSeek Coder", date: "Nov 2023", highlight: "Specialized coding model" },
      { version: "DeepSeek V2", date: "May 2024", highlight: "MoE architecture, 236B total" },
      { version: "DeepSeek Coder V2", date: "June 2024", highlight: "Top coding benchmarks" },
    ],
    keyFeatures: ["Excellent coding", "MoE architecture", "Cost-effective", "Open weights", "Strong math"],
    useCases: ["Code generation", "Code review", "Math problems", "Research", "Chinese applications"],
    strengths: ["Top coding performance", "Very cost-effective", "Open-source options", "Strong reasoning"],
    limitations: ["Less general capability", "Smaller English community"],
  },
  Phi: {
    description: "Microsoft's Phi series proves that smaller, carefully trained models can achieve remarkable capabilities, making AI more accessible on edge devices.",
    founded: "2023",
    headquarters: "Redmond, USA",
    timeline: [
      { version: "Phi-1", date: "June 2023", highlight: "1.3B, textbook-quality training" },
      { version: "Phi-2", date: "Dec 2023", highlight: "2.7B, matches larger models" },
      { version: "Phi-3 Mini", date: "April 2024", highlight: "3.8B, phone-compatible" },
      { version: "Phi-3.5", date: "Aug 2024", highlight: "Enhanced capabilities, multimodal" },
    ],
    keyFeatures: ["Tiny yet powerful", "Edge deployment", "Efficient training", "Open weights", "Low compute"],
    useCases: ["Mobile devices", "Edge computing", "IoT", "Low-resource environments", "On-device AI"],
    strengths: ["Runs on phones", "Very efficient", "Open-source", "Great for edge", "Low cost"],
    limitations: ["Limited capacity", "Not for complex tasks", "Smaller knowledge base"],
  },
};

export const ModelFamilyModal = ({ isOpen, onClose, family }: ModelFamilyModalProps) => {
  if (!family) return null;
  
  const details = familyDetails[family.name] || {
    description: `${family.name} is a leading AI model family from ${family.company}.`,
    founded: "2023",
    headquarters: "Global",
    timeline: family.versions.map(v => ({ version: v, date: "2023-2024", highlight: "Latest capabilities" })),
    keyFeatures: family.bestFor,
    useCases: family.bestFor,
    strengths: ["High performance", "Regular updates"],
    limitations: ["Evolving capabilities"],
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card rounded-3xl border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Header with gradient */}
              <div className={`relative bg-gradient-to-br ${family.color} p-8`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                      {family.logo}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white mb-1">{family.name} Family</h2>
                      <p className="text-white/80 font-medium">{family.company}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Since {details.founded}
                        </span>
                        {family.trending && (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-200 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Trending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* MMLU Score Badge */}
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{family.mmlu}%</div>
                  <div className="text-white/70 text-sm font-medium">MMLU Score</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Description */}
                <div>
                  <p className="text-lg text-muted-foreground leading-relaxed">{details.description}</p>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Evolution Timeline
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/20" />
                    <div className="space-y-4">
                      {details.timeline.map((item, index) => (
                        <motion.div
                          key={item.version}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-10"
                        >
                          <div className={`absolute left-2 w-5 h-5 rounded-full bg-gradient-to-br ${family.color} flex items-center justify-center`}>
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 hover:bg-muted/70 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-foreground">{item.version}</span>
                              <span className="text-sm text-muted-foreground">{item.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.highlight}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Features & Use Cases */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Key Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.keyFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-secondary" />
                      Use Cases
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.useCases.map((useCase) => (
                        <span
                          key={useCase}
                          className="px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-medium"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strengths & Limitations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {details.strengths.map((strength) => (
                        <li key={strength} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-500/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Considerations
                    </h3>
                    <ul className="space-y-2">
                      {details.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                  <Button variant="hero" className="gap-2">
                    <Users className="w-4 h-4" />
                    Compare with Others
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit Official Site
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
