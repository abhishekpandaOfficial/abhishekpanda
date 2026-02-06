import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink, Sparkles, Zap, Brain, Code, MessageSquare, Image, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelFamilyModal } from "./ModelFamilyModal";

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

const modelFamilies: ModelFamily[] = [
  {
    name: "GPT",
    company: "OpenAI",
    logo: "🤖",
    color: "from-emerald-500 to-teal-600",
    versions: ["GPT-3.5", "GPT-4", "GPT-4 Turbo", "GPT-5.1"],
    bestFor: ["General reasoning", "Coding", "Creative writing"],
    mmlu: 89.4,
    trending: true,
  },
  {
    name: "Claude",
    company: "Anthropic",
    logo: "🧠",
    color: "from-orange-500 to-amber-600",
    versions: ["Claude 2", "Claude 3 Haiku", "Claude 3 Sonnet", "Claude 3.5"],
    bestFor: ["Long context", "Analysis", "Safety"],
    mmlu: 88.7,
    trending: true,
  },
  {
    name: "Gemini",
    company: "Google",
    logo: "✨",
    color: "from-blue-500 to-indigo-600",
    versions: ["Gemini 1.0", "Gemini 1.5", "Gemini 2.0"],
    bestFor: ["Multimodal", "Research", "Scale"],
    mmlu: 90.1,
    trending: true,
  },
  {
    name: "LLaMA",
    company: "Meta",
    logo: "🦙",
    color: "from-violet-500 to-purple-600",
    versions: ["LLaMA 2", "LLaMA 3", "LLaMA 3.1"],
    bestFor: ["Open-source", "Fine-tuning", "Research"],
    mmlu: 82.0,
    trending: false,
  },
  {
    name: "Qwen",
    company: "Alibaba",
    logo: "🌐",
    color: "from-red-500 to-pink-600",
    versions: ["Qwen 1.5", "Qwen 2", "Qwen 2.5"],
    bestFor: ["Multilingual", "Coding", "Math"],
    mmlu: 84.2,
    trending: true,
  },
  {
    name: "Mistral",
    company: "Mistral AI",
    logo: "💨",
    color: "from-cyan-500 to-sky-600",
    versions: ["Mistral 7B", "Mixtral 8x7B", "Mixtral 8x22B"],
    bestFor: ["Efficiency", "MoE", "Open weights"],
    mmlu: 81.5,
    trending: false,
  },
  {
    name: "DeepSeek",
    company: "DeepSeek",
    logo: "🔍",
    color: "from-fuchsia-500 to-pink-600",
    versions: ["DeepSeek V2", "DeepSeek Coder", "DeepSeek MoE"],
    bestFor: ["Coding", "Cost-effective", "Chinese"],
    mmlu: 79.8,
    trending: true,
  },
  {
    name: "Phi",
    company: "Microsoft",
    logo: "Φ",
    color: "from-green-500 to-emerald-600",
    versions: ["Phi-2", "Phi-3", "Phi-3.5"],
    bestFor: ["Small models", "Edge", "Efficiency"],
    mmlu: 78.5,
    trending: false,
  },
];

const useCaseIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "General reasoning": Brain,
  "Coding": Code,
  "Creative writing": MessageSquare,
  "Long context": Zap,
  "Analysis": Brain,
  "Safety": Sparkles,
  "Multimodal": Image,
  "Research": Brain,
  "Scale": Zap,
  "Open-source": Code,
  "Fine-tuning": Sparkles,
  "Multilingual": MessageSquare,
  "Math": Brain,
  "Efficiency": Zap,
  "MoE": Sparkles,
  "Open weights": Code,
  "Cost-effective": Zap,
  "Chinese": MessageSquare,
  "Small models": Sparkles,
  "Edge": Zap,
};

export const ModelFamilies = () => {
  const [selectedFamily, setSelectedFamily] = useState<ModelFamily | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExploreFamily = (family: ModelFamily) => {
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  return (
    <section id="model-families" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Model Families Explorer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Explore <span className="atlas-gradient-text">Model Families</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate through the evolution of AI's most powerful language models
          </p>
        </motion.div>

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 text-center border border-emerald-500/20">
            <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">Gemini</div>
            <div className="text-xs text-muted-foreground">Highest MMLU</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl p-4 text-center border border-orange-500/20">
            <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">4</div>
            <div className="text-xs text-muted-foreground">Trending Families</div>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-4 text-center border border-violet-500/20">
            <Star className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">8</div>
            <div className="text-xs text-muted-foreground">Major Families</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-4 text-center border border-blue-500/20">
            <Brain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-foreground">90.1%</div>
            <div className="text-xs text-muted-foreground">Top MMLU Score</div>
          </div>
        </motion.div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modelFamilies.map((family, index) => (
            <motion.div
              key={family.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass-card-hover rounded-2xl p-6 h-full flex flex-col hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${family.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {family.logo}
                  </div>
                  {family.trending && (
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1 animate-pulse">
                      <Zap className="w-3 h-3" /> Trending
                    </span>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-foreground mb-1">{family.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{family.company}</p>

                {/* Versions */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {family.versions.slice(-3).map((version) => (
                    <span
                      key={version}
                      className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground"
                    >
                      {version}
                    </span>
                  ))}
                </div>

                {/* Best For */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Best for</p>
                  <div className="flex flex-wrap gap-2">
                    {family.bestFor.map((useCase) => {
                      const Icon = useCaseIcons[useCase] || Brain;
                      return (
                        <span
                          key={useCase}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/5 text-xs font-medium text-foreground"
                        >
                          <Icon className="w-3 h-3 text-primary" />
                          {useCase}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* MMLU Score */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">MMLU Score</span>
                    <span className="text-lg font-bold atlas-gradient-text">{family.mmlu}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${family.mmlu}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${family.color} rounded-full`}
                    />
                  </div>
                </div>

                {/* Explore Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between group-hover:bg-primary/10 group-hover:text-primary"
                  onClick={() => handleExploreFamily(family)}
                >
                  Explore Family
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg" className="gap-2">
            View All 50+ Model Families
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Model Family Detail Modal */}
      <ModelFamilyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        family={selectedFamily}
      />
    </section>
  );
};