import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Brain, Zap, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import type { LLMModel } from "@/hooks/useLLMModels";
import { getBenchmarkNumber } from "@/hooks/useLLMModels";

interface AtlasSearchProps {
  models: LLMModel[];
  onSearch?: (query: string) => void;
}

export const AtlasSearch = ({ models, onSearch }: AtlasSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LLMModel[]>(models.slice(0, 6));

  useEffect(() => {
    if (!query.trim()) setResults(models.filter((m) => m.is_trending).slice(0, 6));
  }, [models, query]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query.toLowerCase()) ||
          model.company.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 6));
      setIsOpen(true);
    } else {
      setResults(models.filter((m) => m.is_trending).slice(0, 6));
    }
    onSearch?.(query);
  }, [query, onSearch, models]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search model families (OpenAI, Meta, Google, ...)"
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
                {query ? "Search Results" : "Trending Families"}
              </div>
              {results.map((model) => (
                <Link
                  key={model.slug}
                  to={`/llm-galaxy/model/${model.slug}`}
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
                        {model.is_trending && (
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
                      MMLU: {getBenchmarkNumber(model, "mmlu") ?? "—"}
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
