import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Brain, Zap, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const allModels = [
  { id: "gpt-5", name: "GPT-5.1", company: "OpenAI", mmlu: 92.3, trending: true },
  { id: "claude-3-5", name: "Claude 3.5 Sonnet", company: "Anthropic", mmlu: 90.8, trending: true },
  { id: "gemini-2", name: "Gemini 2.0 Pro", company: "Google", mmlu: 91.5, trending: true },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", company: "OpenAI", mmlu: 86.4, trending: false },
  { id: "llama-3-1", name: "LLaMA 3.1 405B", company: "Meta", mmlu: 82.0, trending: false },
  { id: "qwen-2-5", name: "Qwen 2.5 72B", company: "Alibaba", mmlu: 84.2, trending: true },
  { id: "mixtral", name: "Mixtral 8x22B", company: "Mistral AI", mmlu: 81.5, trending: false },
  { id: "deepseek-v2", name: "DeepSeek V2", company: "DeepSeek", mmlu: 79.8, trending: true },
  { id: "phi-3-5", name: "Phi-3.5", company: "Microsoft", mmlu: 78.5, trending: false },
  { id: "claude-3-opus", name: "Claude 3 Opus", company: "Anthropic", mmlu: 89.2, trending: false },
  { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", company: "Google", mmlu: 88.1, trending: false },
  { id: "llama-3", name: "LLaMA 3 70B", company: "Meta", mmlu: 79.5, trending: false },
];

interface AtlasSearchProps {
  onSearch?: (query: string) => void;
}

export const AtlasSearch = ({ onSearch }: AtlasSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState(allModels.slice(0, 5));

  useEffect(() => {
    if (query.trim()) {
      const filtered = allModels.filter(
        (model) =>
          model.name.toLowerCase().includes(query.toLowerCase()) ||
          model.company.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 6));
      setIsOpen(true);
    } else {
      setResults(allModels.filter((m) => m.trending).slice(0, 5));
    }
    onSearch?.(query);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search 400+ AI models..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-14 pl-12 pr-12 text-lg rounded-2xl border-2 border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {query ? "Search Results" : "Trending Models"}
              </div>
              {results.map((model) => (
                <Link
                  key={model.id}
                  to={`/llm-atlas/model/${model.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {model.name}
                        {model.trending && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Hot
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{model.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      MMLU: {model.mmlu}%
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
            {query && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No models found matching "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
