import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Plus, X, Check, Minus, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const allModels = [
  { id: "gpt5", name: "GPT-5.1", company: "OpenAI", params: "~2T", context: "128K", mmlu: 92.3, humaneval: 91.2, pricing: "$15/M", speed: "Fast", multimodal: true, finetuning: false, openSource: false },
  { id: "claude35", name: "Claude 3.5 Sonnet", company: "Anthropic", params: "~175B", context: "200K", mmlu: 90.8, humaneval: 89.7, pricing: "$3/M", speed: "Fast", multimodal: true, finetuning: false, openSource: false },
  { id: "gemini2", name: "Gemini 2.0 Pro", company: "Google", params: "~1.5T", context: "2M", mmlu: 91.5, humaneval: 88.4, pricing: "$7/M", speed: "Medium", multimodal: true, finetuning: false, openSource: false },
  { id: "gpt4turbo", name: "GPT-4 Turbo", company: "OpenAI", params: "~1.7T", context: "128K", mmlu: 86.4, humaneval: 87.1, pricing: "$10/M", speed: "Fast", multimodal: true, finetuning: true, openSource: false },
  { id: "llama31", name: "LLaMA 3.1 405B", company: "Meta", params: "405B", context: "128K", mmlu: 82.0, humaneval: 84.1, pricing: "Free", speed: "Medium", multimodal: false, finetuning: true, openSource: true },
  { id: "qwen25", name: "Qwen 2.5 72B", company: "Alibaba", params: "72B", context: "128K", mmlu: 84.2, humaneval: 85.3, pricing: "Free", speed: "Fast", multimodal: true, finetuning: true, openSource: true },
  { id: "mixtral", name: "Mixtral 8x22B", company: "Mistral AI", params: "141B", context: "64K", mmlu: 81.5, humaneval: 82.8, pricing: "Free", speed: "Fast", multimodal: false, finetuning: true, openSource: true },
  { id: "deepseek", name: "DeepSeek V2", company: "DeepSeek", params: "236B", context: "128K", mmlu: 79.8, humaneval: 86.2, pricing: "$0.14/M", speed: "Fast", multimodal: false, finetuning: true, openSource: true },
];

const filters = [
  { key: "openSource", label: "Open Source" },
  { key: "multimodal", label: "Multimodal" },
  { key: "finetuning", label: "Fine-tuning" },
];

export const ModelComparison = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt5", "claude35", "gemini2"]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId));
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const toggleFilter = (filterKey: string) => {
    if (activeFilters.includes(filterKey)) {
      setActiveFilters(activeFilters.filter((f) => f !== filterKey));
    } else {
      setActiveFilters([...activeFilters, filterKey]);
    }
  };

  const filteredModels = allModels.filter((model) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((filter) => model[filter as keyof typeof model] === true);
  });

  const comparisonModels = allModels.filter((m) => selectedModels.includes(m.id));

  return (
    <section id="model-comparison" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <GitCompare className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Model Comparison Matrix</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Compare <span className="atlas-gradient-text">Side by Side</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select up to 4 models to compare their capabilities, pricing, and performance
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
            <Filter className="w-4 h-4" />
            Filters:
          </div>
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilters.includes(filter.key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>

        {/* Model Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filteredModels.map((model) => (
            <Button
              key={model.id}
              variant={selectedModels.includes(model.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleModel(model.id)}
              className="gap-2"
              disabled={!selectedModels.includes(model.id) && selectedModels.length >= 4}
            >
              {selectedModels.includes(model.id) ? (
                <Check className="w-3 h-3" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              {model.name}
            </Button>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">
                    Feature
                  </th>
                  {comparisonModels.map((model) => (
                    <th key={model.id} className="px-6 py-4 text-center min-w-[180px]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-foreground">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.company}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleModel(model.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Parameters */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Parameters</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center font-semibold">{model.params}</td>
                  ))}
                </tr>
                
                {/* Context Window */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Context Window</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      <Badge variant="outline">{model.context}</Badge>
                    </td>
                  ))}
                </tr>
                
                {/* MMLU */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">MMLU Score</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold">{model.mmlu}%</span>
                    </td>
                  ))}
                </tr>
                
                {/* HumanEval */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">HumanEval</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-bold">{model.humaneval}%</span>
                    </td>
                  ))}
                </tr>
                
                {/* Pricing */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Pricing</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold ${model.pricing === "Free" ? "bg-green-500/10 text-green-600" : "bg-muted"}`}>
                        {model.pricing}
                      </span>
                    </td>
                  ))}
                </tr>
                
                {/* Speed */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Speed</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center text-muted-foreground">{model.speed}</td>
                  ))}
                </tr>
                
                {/* Multimodal */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Multimodal</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      {model.multimodal ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Fine-tuning */}
                <tr className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Fine-tuning</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      {model.finetuning ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Open Source */}
                <tr className="hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">Open Source</td>
                  {comparisonModels.map((model) => (
                    <td key={model.id} className="px-6 py-4 text-center">
                      {model.openSource ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Open</Badge>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* API Links */}
          <div className="p-6 border-t border-border/50 bg-muted/20">
            <div className="flex flex-wrap justify-center gap-4">
              {comparisonModels.map((model) => (
                <Button key={model.id} variant="outline" size="sm" className="gap-2">
                  {model.name} API
                  <ExternalLink className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};