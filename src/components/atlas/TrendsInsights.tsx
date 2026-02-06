import { motion } from "framer-motion";
import { TrendingUp, Calendar, Sparkles, ArrowUpRight, Zap, Brain, Code, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const timelineData = [
  { date: "2023 Q1", event: "GPT-4 Release", type: "breakthrough", description: "OpenAI releases GPT-4 with multimodal capabilities" },
  { date: "2023 Q2", event: "LLaMA Open Source", type: "open-source", description: "Meta releases LLaMA models to researchers" },
  { date: "2023 Q3", event: "Claude 2 Launch", type: "breakthrough", description: "Anthropic releases Claude 2 with 100K context" },
  { date: "2023 Q4", event: "Mixtral MoE", type: "architecture", description: "Mistral introduces efficient MoE architecture" },
  { date: "2024 Q1", event: "Gemini Ultra", type: "breakthrough", description: "Google launches Gemini with native multimodality" },
  { date: "2024 Q2", event: "LLaMA 3 Release", type: "open-source", description: "Meta releases LLaMA 3 with improved performance" },
  { date: "2024 Q3", event: "Claude 3.5", type: "breakthrough", description: "Anthropic releases Claude 3.5 Sonnet" },
  { date: "2024 Q4", event: "GPT-5 Preview", type: "breakthrough", description: "OpenAI announces GPT-5 capabilities" },
];

const performanceData = [
  { month: "Jan", mmlu: 82, humaneval: 78, reasoning: 75 },
  { month: "Feb", mmlu: 83, humaneval: 79, reasoning: 77 },
  { month: "Mar", mmlu: 85, humaneval: 82, reasoning: 80 },
  { month: "Apr", mmlu: 86, humaneval: 84, reasoning: 82 },
  { month: "May", mmlu: 88, humaneval: 86, reasoning: 85 },
  { month: "Jun", mmlu: 89, humaneval: 88, reasoning: 87 },
  { month: "Jul", mmlu: 90, humaneval: 89, reasoning: 88 },
  { month: "Aug", mmlu: 91, humaneval: 90, reasoning: 90 },
  { month: "Sep", mmlu: 92, humaneval: 91, reasoning: 91 },
];

const pricingData = [
  { month: "Jan '23", gpt4: 60, claude: 40, llama: 0 },
  { month: "Apr '23", gpt4: 50, claude: 35, llama: 0 },
  { month: "Jul '23", gpt4: 40, claude: 30, llama: 0 },
  { month: "Oct '23", gpt4: 30, claude: 20, llama: 0 },
  { month: "Jan '24", gpt4: 20, claude: 15, llama: 0 },
  { month: "Apr '24", gpt4: 15, claude: 8, llama: 0 },
  { month: "Jul '24", gpt4: 10, claude: 3, llama: 0 },
];

const trendingTopics = [
  { title: "MoE Architecture Surge", change: "+340%", description: "Mixture of Experts adoption growing rapidly" },
  { title: "Open-Source Catches Up", change: "+89%", description: "LLaMA 3.1 closing gap with proprietary models" },
  { title: "Context Windows Expand", change: "+500%", description: "Average context window increased 5x in 2024" },
  { title: "Pricing Drops 80%", change: "-80%", description: "API costs decreased dramatically YoY" },
];

const getEventColor = (type: string) => {
  switch (type) {
    case "breakthrough": return "from-primary to-secondary";
    case "open-source": return "from-green-500 to-emerald-600";
    case "architecture": return "from-purple-500 to-pink-600";
    default: return "from-gray-500 to-gray-600";
  }
};

export const TrendsInsights = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trends & Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Industry <span className="atlas-gradient-text">Evolution</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track breakthrough moments, architecture innovations, and market shifts
          </p>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card-hover rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className={`text-lg font-bold ${topic.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                  {topic.change}
                </span>
              </div>
              <h4 className="font-bold text-foreground mb-1">{topic.title}</h4>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Performance Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Performance Trends (2024)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[70, 95]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="mmlu" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="humaneval" stroke="hsl(262, 83%, 58%)" fill="hsl(262, 83%, 58%)" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="reasoning" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">MMLU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm text-muted-foreground">HumanEval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Reasoning</span>
              </div>
            </div>
          </motion.div>

          {/* Pricing Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              API Pricing Trends ($/1M tokens)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pricingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="gpt4" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ fill: "hsl(217, 91%, 60%)" }} />
                  <Line type="monotone" dataKey="claude" stroke="hsl(262, 83%, 58%)" strokeWidth={2} dot={{ fill: "hsl(262, 83%, 58%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">GPT-4 Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm text-muted-foreground">Claude Class</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            LLM Evolution Timeline
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent transform md:-translate-x-1/2" />
            
            {/* Timeline Events */}
            <div className="space-y-8">
              {timelineData.map((event, index) => (
                <motion.div
                  key={event.date}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center gap-4 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"}`}>
                    <span className="text-sm text-primary font-semibold">{event.date}</span>
                    <h4 className="font-bold text-foreground text-lg">{event.event}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  
                  {/* Dot */}
                  <div className={`absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${getEventColor(event.type)} flex items-center justify-center transform md:-translate-x-1/2 shadow-lg`}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Spacer for alignment */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};