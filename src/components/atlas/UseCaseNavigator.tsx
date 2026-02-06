import { useState } from "react";
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
  Star,
  Zap,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    id: "chatbots",
    name: "Chatbots",
    icon: MessageSquare,
    description: "Conversational AI for customer service, support, and engagement",
    models: [
      { name: "Claude 3.5 Sonnet", score: 95, cost: "$$", reason: "Best safety and natural conversation" },
      { name: "GPT-4 Turbo", score: 93, cost: "$$$", reason: "Versatile with strong comprehension" },
      { name: "Gemini 2.0", score: 91, cost: "$$", reason: "Great multimodal integration" },
      { name: "LLaMA 3.1", score: 88, cost: "Free", reason: "Best open-source option" },
      { name: "Qwen 2.5", score: 86, cost: "Free", reason: "Strong multilingual support" },
    ],
  },
  {
    id: "reasoning",
    name: "Reasoning",
    icon: Brain,
    description: "Complex logical reasoning, analysis, and problem-solving tasks",
    models: [
      { name: "GPT-5.1", score: 97, cost: "$$$", reason: "State-of-the-art reasoning" },
      { name: "Claude 3.5", score: 94, cost: "$$", reason: "Excellent analytical capabilities" },
      { name: "Gemini 2.0 Pro", score: 93, cost: "$$", reason: "Strong scientific reasoning" },
      { name: "GPT-4 Turbo", score: 90, cost: "$$$", reason: "Reliable complex task handling" },
      { name: "DeepSeek V2", score: 85, cost: "$", reason: "Cost-effective reasoning" },
    ],
  },
  {
    id: "coding",
    name: "Coding",
    icon: Code,
    description: "Code generation, debugging, and software development assistance",
    models: [
      { name: "GPT-5.1", score: 96, cost: "$$$", reason: "Best code generation accuracy" },
      { name: "Claude 3.5", score: 94, cost: "$$", reason: "Excellent code explanation" },
      { name: "DeepSeek Coder", score: 92, cost: "$", reason: "Specialized for coding" },
      { name: "Qwen 2.5 Coder", score: 90, cost: "Free", reason: "Great open-source coder" },
      { name: "Mixtral 8x22B", score: 87, cost: "Free", reason: "Strong multi-language support" },
    ],
  },
  {
    id: "agents",
    name: "Agents",
    icon: Bot,
    description: "Autonomous AI agents for task automation and workflow orchestration",
    models: [
      { name: "GPT-5.1", score: 95, cost: "$$$", reason: "Best tool use and planning" },
      { name: "Claude 3.5", score: 93, cost: "$$", reason: "Reliable agent behavior" },
      { name: "Gemini 2.0", score: 91, cost: "$$", reason: "Strong multimodal agents" },
      { name: "LLaMA 3.1 405B", score: 86, cost: "Free", reason: "Open-source agent framework" },
      { name: "Mistral Large", score: 84, cost: "$$", reason: "Efficient function calling" },
    ],
  },
  {
    id: "rag",
    name: "RAG",
    icon: Database,
    description: "Retrieval-augmented generation for knowledge-intensive applications",
    models: [
      { name: "Claude 3.5", score: 96, cost: "$$", reason: "200K context window" },
      { name: "Gemini 2.0", score: 94, cost: "$$", reason: "2M context capability" },
      { name: "GPT-4 Turbo", score: 92, cost: "$$$", reason: "Strong retrieval integration" },
      { name: "Qwen 2.5", score: 88, cost: "Free", reason: "Efficient long context" },
      { name: "LLaMA 3.1", score: 85, cost: "Free", reason: "Great for self-hosted RAG" },
    ],
  },
  {
    id: "multimodal",
    name: "Multimodal",
    icon: Image,
    description: "Vision, audio, and cross-modal understanding capabilities",
    models: [
      { name: "GPT-5.1 Vision", score: 97, cost: "$$$", reason: "Best vision capabilities" },
      { name: "Gemini 2.0", score: 95, cost: "$$", reason: "Native multimodal design" },
      { name: "Claude 3.5", score: 93, cost: "$$", reason: "Strong image analysis" },
      { name: "LLaVA 1.6", score: 85, cost: "Free", reason: "Best open multimodal" },
      { name: "Qwen-VL", score: 83, cost: "Free", reason: "Good Chinese multimodal" },
    ],
  },
  {
    id: "edge",
    name: "On-device / Edge",
    icon: Smartphone,
    description: "Lightweight models for mobile, IoT, and edge deployment",
    models: [
      { name: "Phi-3.5 Mini", score: 88, cost: "Free", reason: "Best tiny model" },
      { name: "Gemma 2 2B", score: 85, cost: "Free", reason: "Excellent efficiency" },
      { name: "LLaMA 3.2 3B", score: 84, cost: "Free", reason: "Strong small model" },
      { name: "Qwen 2.5 0.5B", score: 80, cost: "Free", reason: "Ultra lightweight" },
      { name: "Mistral 7B", score: 82, cost: "Free", reason: "Best 7B class" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    description: "Private deployment, compliance, and enterprise-grade solutions",
    models: [
      { name: "Claude Enterprise", score: 95, cost: "$$$$", reason: "Best data privacy" },
      { name: "Azure OpenAI", score: 93, cost: "$$$", reason: "Enterprise integration" },
      { name: "LLaMA 3.1 405B", score: 90, cost: "Free", reason: "Self-hosted control" },
      { name: "Mistral Large", score: 88, cost: "$$", reason: "EU data residency" },
      { name: "Qwen 2.5", score: 85, cost: "Free", reason: "No API dependencies" },
    ],
  },
  {
    id: "scientific",
    name: "Scientific",
    icon: FlaskConical,
    description: "Research, scientific literature analysis, and domain expertise",
    models: [
      { name: "Gemini 2.0 Pro", score: 96, cost: "$$", reason: "Strong scientific training" },
      { name: "GPT-5.1", score: 94, cost: "$$$", reason: "Broad knowledge" },
      { name: "Claude 3.5", score: 92, cost: "$$", reason: "Great for analysis" },
      { name: "Galactica", score: 88, cost: "Free", reason: "Scientific specialist" },
      { name: "LLaMA 3.1", score: 85, cost: "Free", reason: "Research flexibility" },
    ],
  },
];

const getCostColor = (cost: string) => {
  switch (cost) {
    case "Free": return "text-green-500";
    case "$": return "text-green-400";
    case "$$": return "text-yellow-500";
    case "$$$": return "text-orange-500";
    case "$$$$": return "text-red-500";
    default: return "text-muted-foreground";
  }
};

export const UseCaseNavigator = () => {
  const [selectedUseCase, setSelectedUseCase] = useState(useCases[0]);

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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
            Find the <span className="atlas-gradient-text">Perfect Model</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your use case and discover the best-fit models with detailed recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Use Case Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                Select Use Case
              </h3>
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
                    {selectedUseCase.id === useCase.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
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
                {/* Use Case Header */}
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

                {/* Model Recommendations */}
                <div className="space-y-4">
                  {selectedUseCase.models.map((model, index) => (
                    <motion.div
                      key={model.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card-hover rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          index === 0 
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" 
                            : index === 1 
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                            : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>

                        {/* Model Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground">{model.name}</h4>
                            {index === 0 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{model.reason}</p>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-2xl font-black atlas-gradient-text">{model.score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>

                        {/* Cost */}
                        <div className="text-right min-w-[60px]">
                          <div className={`text-lg font-bold ${getCostColor(model.cost)}`}>
                            {model.cost}
                          </div>
                          <div className="text-xs text-muted-foreground">Cost</div>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${model.score}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* View More */}
                <div className="text-center mt-8">
                  <Button variant="hero-outline" className="gap-2">
                    View Full Recommendations
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};