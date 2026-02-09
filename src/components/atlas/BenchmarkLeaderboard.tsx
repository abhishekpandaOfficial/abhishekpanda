import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Medal, Award, ChevronDown } from "lucide-react";
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
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

const benchmarkDefs = [
  { key: "mmlu", name: "MMLU", description: "Massive Multitask Language Understanding" },
  { key: "gsm8k", name: "GSM8K", description: "Grade School Math 8K" },
  { key: "humaneval", name: "HumanEval", description: "Code Generation Accuracy" },
  { key: "truthfulqa", name: "TruthfulQA", description: "Factual Accuracy" },
  { key: "mtbench", name: "MT-Bench", description: "Multi-turn Reasoning" },
  { key: "arena_elo", name: "Arena Elo", description: "Human Preference Rating" },
];

export const BenchmarkLeaderboard = (props: { models: LLMModel[]; lastUpdated: Date | null }) => {
  const [selected, setSelected] = useState(benchmarkDefs[0].key);

  const rows = useMemo(() => {
    const scored = props.models
      .map((m) => ({ model: m, score: getBenchmarkNumber(m, selected) }))
      .filter((x) => typeof x.score === "number") as { model: LLMModel; score: number }[];
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [props.models, selected]);

  const top6 = rows.slice(0, 6);
  const top3 = rows.slice(0, 3);

  const barData = top6.map((x) => ({
    name: x.model.name,
    score: x.score,
  }));

  const radarData = benchmarkDefs
    .filter((b) => b.key !== "arena_elo")
    .map((b) => {
      const out: any = { subject: b.name, fullMark: 100 };
      for (const t of top3) out[t.model.slug] = getBenchmarkNumber(t.model, b.key) ?? 0;
      return out;
    });

  const lastUpdatedLabel = props.lastUpdated
    ? props.lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <section id="benchmarks" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Benchmark Leaderboards{lastUpdatedLabel ? ` • Updated ${lastUpdatedLabel}` : ""}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Performance <span className="atlas-gradient-text">Rankings</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scores come from the LLM Galaxy database. Update models any time from the admin panel.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {benchmarkDefs.map((b) => (
            <Button
              key={b.key}
              variant={selected === b.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelected(b.key)}
              className="gap-2"
              title={b.description}
            >
              {b.name}
            </Button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Models ({benchmarkDefs.find((b) => b.key === selected)?.name})
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, selected === "arena_elo" ? "dataMax" : 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Top 3 (Multi-Benchmark)
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  {top3.map((t, idx) => (
                    <Radar
                      key={t.model.slug}
                      name={t.model.name}
                      dataKey={t.model.slug}
                      stroke={idx === 0 ? "hsl(217, 91%, 60%)" : idx === 1 ? "hsl(262, 83%, 58%)" : "hsl(199, 89%, 48%)"}
                      fill={idx === 0 ? "hsl(217, 91%, 60%)" : idx === 1 ? "hsl(262, 83%, 58%)" : "hsl(199, 89%, 48%)"}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

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
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {benchmarkDefs.find((b) => b.key === selected)?.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 25).map((item, index) => (
                  <motion.tr
                    key={item.model.slug}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.02 }}
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
                    <td className="px-6 py-4 font-semibold text-foreground">{item.model.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.model.company}</td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">{item.score}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center border-t border-border/50">
            <Button variant="ghost" size="sm" className="gap-2">
              View More
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

