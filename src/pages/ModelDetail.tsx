import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Zap,
  Brain,
  Code,
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Layers,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const modelDatabase: Record<string, {
  name: string;
  company: string;
  logo: string;
  color: string;
  description: string;
  releaseDate: string;
  parameters: string;
  contextWindow: string;
  pricing: string;
  speed: string;
  architecture: string;
  benchmarks: { name: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  useCases: string[];
  apiDocs: string;
  versions: { name: string; date: string; description: string }[];
}> = {
  "gpt-5": {
    name: "GPT-5.1",
    company: "OpenAI",
    logo: "🤖",
    color: "from-emerald-500 to-teal-600",
    description: "GPT-5.1 represents OpenAI's most advanced language model, featuring unprecedented reasoning capabilities, multimodal understanding, and agentic task execution. It sets new standards across virtually all benchmarks.",
    releaseDate: "2024",
    parameters: "~2T",
    contextWindow: "128K tokens",
    pricing: "$15/M input, $45/M output",
    speed: "40 tokens/sec",
    architecture: "Transformer with MoE",
    benchmarks: [
      { name: "MMLU", score: 92.3 },
      { name: "GSM8K", score: 97.1 },
      { name: "HumanEval", score: 91.2 },
      { name: "TruthfulQA", score: 73.5 },
      { name: "MT-Bench", score: 94 },
    ],
    strengths: [
      "World-class reasoning and problem solving",
      "Excellent code generation across all languages",
      "Strong multimodal capabilities (text + vision)",
      "Reliable function calling and tool use",
      "Consistent instruction following",
    ],
    weaknesses: [
      "Higher cost than alternatives",
      "Closed-source with no fine-tuning options",
      "Rate limits on API usage",
      "Knowledge cutoff date limitations",
    ],
    useCases: [
      "Complex reasoning tasks",
      "Code generation and review",
      "Content creation",
      "Data analysis",
      "Agentic workflows",
    ],
    apiDocs: "https://platform.openai.com/docs",
    versions: [
      { name: "GPT-5.1", date: "Dec 2024", description: "Latest flagship with enhanced reasoning" },
      { name: "GPT-4 Turbo", date: "Nov 2023", description: "128K context, improved speed" },
      { name: "GPT-4", date: "Mar 2023", description: "Multimodal breakthrough" },
      { name: "GPT-3.5 Turbo", date: "Nov 2022", description: "ChatGPT foundation" },
    ],
  },
  "claude-3-5": {
    name: "Claude 3.5 Sonnet",
    company: "Anthropic",
    logo: "🧠",
    color: "from-orange-500 to-amber-600",
    description: "Claude 3.5 Sonnet is Anthropic's most capable model, excelling at complex analysis, coding, and long-context tasks while maintaining Anthropic's focus on safety and helpfulness.",
    releaseDate: "June 2024",
    parameters: "~175B",
    contextWindow: "200K tokens",
    pricing: "$3/M input, $15/M output",
    speed: "60 tokens/sec",
    architecture: "Transformer",
    benchmarks: [
      { name: "MMLU", score: 90.8 },
      { name: "GSM8K", score: 95.2 },
      { name: "HumanEval", score: 89.7 },
      { name: "TruthfulQA", score: 78.2 },
      { name: "MT-Bench", score: 92 },
    ],
    strengths: [
      "Best-in-class coding abilities",
      "Excellent long-context handling",
      "Strong at nuanced instruction following",
      "High factual accuracy",
      "Thoughtful, well-structured responses",
    ],
    weaknesses: [
      "Sometimes overly cautious",
      "No image generation capabilities",
      "API-only access",
      "Limited customization options",
    ],
    useCases: [
      "Code development and review",
      "Document analysis",
      "Research assistance",
      "Writing and editing",
      "Customer support",
    ],
    apiDocs: "https://docs.anthropic.com",
    versions: [
      { name: "Claude 3.5 Sonnet", date: "Jun 2024", description: "Top coding performance, 200K context" },
      { name: "Claude 3 Opus", date: "Mar 2024", description: "Most intelligent Claude model" },
      { name: "Claude 3 Sonnet", date: "Mar 2024", description: "Balanced performance" },
      { name: "Claude 3 Haiku", date: "Mar 2024", description: "Fast and affordable" },
    ],
  },
  "gemini-2": {
    name: "Gemini 2.0 Pro",
    company: "Google",
    logo: "✨",
    color: "from-blue-500 to-indigo-600",
    description: "Gemini 2.0 Pro is Google's most advanced multimodal AI, featuring native understanding of text, images, audio, and video with industry-leading context windows and agentic capabilities.",
    releaseDate: "December 2024",
    parameters: "~1.5T",
    contextWindow: "2M tokens",
    pricing: "$7/M input, $21/M output",
    speed: "50 tokens/sec",
    architecture: "Multimodal Transformer",
    benchmarks: [
      { name: "MMLU", score: 91.5 },
      { name: "GSM8K", score: 96.8 },
      { name: "HumanEval", score: 88.4 },
      { name: "TruthfulQA", score: 71.8 },
      { name: "MT-Bench", score: 93 },
    ],
    strengths: [
      "Native multimodal from ground up",
      "Massive 2M token context window",
      "Strong agentic capabilities",
      "Excellent at visual reasoning",
      "Deep Google ecosystem integration",
    ],
    weaknesses: [
      "Regional availability limitations",
      "Complex pricing structure",
      "Less consistent than GPT-5 for some tasks",
      "Closed-source",
    ],
    useCases: [
      "Multimodal understanding",
      "Video and image analysis",
      "Research and summarization",
      "Enterprise AI applications",
      "Long document processing",
    ],
    apiDocs: "https://ai.google.dev/docs",
    versions: [
      { name: "Gemini 2.0 Pro", date: "Dec 2024", description: "Agentic AI, native tool use" },
      { name: "Gemini 1.5 Pro", date: "Feb 2024", description: "1M token context breakthrough" },
      { name: "Gemini 1.5 Flash", date: "May 2024", description: "Fast and efficient" },
      { name: "Gemini 1.0 Ultra", date: "Feb 2024", description: "First Ultra model" },
    ],
  },
};

const ModelDetail = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const model = modelDatabase[modelId || ""] || modelDatabase["gpt-5"];

  const radarData = model.benchmarks.map((b) => ({
    subject: b.name,
    score: b.score,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        {/* Back Link */}
        <div className="container mx-auto px-4 mb-8">
          <Link
            to="/llm-atlas"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to LLM Atlas
          </Link>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 mb-16">
          <div className={`relative rounded-3xl bg-gradient-to-br ${model.color} p-8 md:p-12 overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-xl">
                  {model.logo}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{model.name}</h1>
                  <p className="text-xl text-white/80 mb-4">{model.company}</p>
                  <p className="text-white/90 text-lg max-w-3xl">{model.description}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Parameters</span>
                  </div>
                  <div className="text-xl font-bold text-white">{model.parameters}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">Context</span>
                  </div>
                  <div className="text-xl font-bold text-white">{model.contextWindow}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Pricing</span>
                  </div>
                  <div className="text-xl font-bold text-white">{model.pricing}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Speed</span>
                  </div>
                  <div className="text-xl font-bold text-white">{model.speed}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benchmarks */}
        <section className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-black mb-8">Performance Benchmarks</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Benchmark Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={model.benchmarks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6">Capability Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    name={model.name}
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </section>

        {/* Strengths & Weaknesses */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20"
            >
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {model.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20"
            >
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Limitations
              </h3>
              <ul className="space-y-3">
                {model.weaknesses.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                    <span className="text-foreground">{weakness}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Use Cases & Version History */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Best Use Cases
              </h3>
              <div className="flex flex-wrap gap-2">
                {model.useCases.map((useCase, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Version History
              </h3>
              <div className="space-y-4">
                {model.versions.map((version, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-secondary mt-1.5" />
                    <div>
                      <div className="font-semibold text-foreground">{version.name}</div>
                      <div className="text-sm text-muted-foreground">{version.date}</div>
                      <div className="text-sm text-muted-foreground">{version.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to use {model.name}?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Access the API documentation and start building with one of the world's most advanced AI models.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href={model.apiDocs} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View API Docs
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/llm-atlas#model-comparison">
                  <Users className="w-4 h-4" />
                  Compare Models
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ModelDetail;
