import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Trophy, Medal, Award, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Legend,
} from "recharts";

const benchmarks = [
  { name: "MMLU", description: "Massive Multitask Language Understanding" },
  { name: "GSM8K", description: "Grade School Math 8K" },
  { name: "HumanEval", description: "Code Generation Accuracy" },
  { name: "TruthfulQA", description: "Factual Accuracy" },
  { name: "MT-Bench", description: "Multi-turn Reasoning" },
  { name: "Arena Elo", description: "Human Preference Rating" },
];

const leaderboardData = [
  { model: "GPT-5.1", company: "OpenAI", mmlu: 92.3, gsm8k: 97.1, humaneval: 91.2, truthfulqa: 73.5, mtbench: 9.4, elo: 1287 },
  { model: "Claude 3.5", company: "Anthropic", mmlu: 90.8, gsm8k: 95.2, humaneval: 89.7, truthfulqa: 78.2, mtbench: 9.2, elo: 1273 },
  { model: "Gemini 2.0", company: "Google", mmlu: 91.5, gsm8k: 96.8, humaneval: 88.4, truthfulqa: 71.8, mtbench: 9.3, elo: 1268 },
  { model: "GPT-4 Turbo", company: "OpenAI", mmlu: 86.4, gsm8k: 92.0, humaneval: 87.1, truthfulqa: 69.4, mtbench: 9.1, elo: 1251 },
  { model: "Qwen 2.5 72B", company: "Alibaba", mmlu: 84.2, gsm8k: 89.5, humaneval: 85.3, truthfulqa: 67.2, mtbench: 8.8, elo: 1238 },
  { model: "LLaMA 3.1 405B", company: "Meta", mmlu: 82.0, gsm8k: 86.3, humaneval: 84.1, truthfulqa: 65.8, mtbench: 8.6, elo: 1225 },
];

const radarData = [
  { subject: "MMLU", GPT5: 92, Claude35: 91, Gemini2: 92, fullMark: 100 },
  { subject: "GSM8K", GPT5: 97, Claude35: 95, Gemini2: 97, fullMark: 100 },
  { subject: "HumanEval", GPT5: 91, Claude35: 90, Gemini2: 88, fullMark: 100 },
  { subject: "TruthfulQA", GPT5: 74, Claude35: 78, Gemini2: 72, fullMark: 100 },
  { subject: "MT-Bench", GPT5: 94, Claude35: 92, Gemini2: 93, fullMark: 100 },
];

const barChartData = leaderboardData.map((item) => ({
  name: item.model,
  MMLU: item.mmlu,
  GSM8K: item.gsm8k,
  HumanEval: item.humaneval,
}));

export const BenchmarkLeaderboard = () => {
  const [selectedBenchmark, setSelectedBenchmark] = useState("MMLU");

  return (
    <section id="benchmarks" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Benchmark Leaderboards</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Performance <span className="atlas-gradient-text">Rankings</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time benchmark scores across industry-standard evaluations
          </p>
        </motion.div>

        {/* Benchmark Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {benchmarks.map((benchmark) => (
            <Button
              key={benchmark.name}
              variant={selectedBenchmark === benchmark.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedBenchmark(benchmark.name)}
              className="gap-2"
            >
              {benchmark.name}
            </Button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Models by Benchmark
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="MMLU" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Top 3 Models Comparison
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Radar name="GPT-5.1" dataKey="GPT5" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.3} />
                  <Radar name="Claude 3.5" dataKey="Claude35" stroke="hsl(262, 83%, 58%)" fill="hsl(262, 83%, 58%)" fillOpacity={0.3} />
                  <Radar name="Gemini 2.0" dataKey="Gemini2" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Full Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">MMLU</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSM8K</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">HumanEval</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arena Elo</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item, index) => (
                  <motion.tr
                    key={item.model}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Award className="w-5 h-5 text-amber-600" />}
                        {index > 2 && <span className="w-5 text-center font-bold text-muted-foreground">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{item.model}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.company}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-sm">{item.mmlu}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-secondary/10 text-secondary font-semibold text-sm">{item.gsm8k}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent font-semibold text-sm">{item.humaneval}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">{item.elo}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center border-t border-border/50">
            <Button variant="ghost" size="sm" className="gap-2">
              View Full Rankings
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};