import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSiteKnowledge } from "@/hooks/useSiteKnowledge";
import { useOriginXUpdates } from "@/hooks/useOriginXUpdates";
import { useLLMModels } from "@/hooks/useLLMModels";
import { ChronyxLogo } from "@/components/ui/ChronyxLogo";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
};

const welcomeText =
  "I am ABHIBOT. Ask me anything about this website, CHRONYX, OriginX updates, or LLM Galaxy models.";

export const ABHIBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: "m-welcome", role: "bot", content: welcomeText }]);

  const { data: knowledge = [] } = useSiteKnowledge(24);
  const { data: updates = [] } = useOriginXUpdates(6);
  const { data: models = [] } = useLLMModels();
  type ExtendedModel = (typeof models)[number] & { homepage_url?: string | null; huggingface_url?: string | null; license?: string | null };

  const quickReplies = useMemo(
    () => [
      "What is this website about?",
      "Give me latest OriginX Labs updates",
      "Show open source models",
      "Show closed source models",
      "Tell me about CHRONYX",
    ],
    []
  );

  const buildFallbackReply = (prompt: string) => {
    const q = prompt.toLowerCase();

    if (q.includes("open source") || q.includes("open-source") || q.includes("open")) {
      const open = models.filter((m) => m.is_open_source).map((m) => m.name);
      return open.length ? `Open-source families: ${open.join(", ")}.` : "No open-source families found right now.";
    }

    if (q.includes("closed source") || q.includes("closed-source") || q.includes("closed")) {
      const closed = models.filter((m) => !m.is_open_source).map((m) => m.name);
      return closed.length ? `Closed-source families: ${closed.join(", ")}.` : "No closed-source families found right now.";
    }

    if (q.includes("update") || q.includes("latest") || q.includes("originx")) {
      if (!updates.length) return "No OriginX updates were found right now.";
      return updates
        .slice(0, 3)
        .map((u, i) => `${i + 1}. ${u.title} (${new Date(u.published_at).toLocaleDateString("en-US")})`)
        .join("\n");
    }

    if (q.includes("galaxy") || q.includes("llm") || q.includes("model")) {
      const trending = models.filter((m) => m.is_trending).slice(0, 5).map((m) => m.name);
      return [
        `LLM Galaxy tracks ${models.length || "multiple"} families from the database.`,
        trending.length ? `Trending: ${trending.join(", ")}.` : "Trending information is available inside LLM Galaxy.",
        "Use /llm-galaxy for model categories, benchmarks, popups, and links.",
      ].join(" ");
    }

    if (q.includes("chronyx")) {
      const chronyxInfo = knowledge.find((k) => k.category === "chronyx")?.summary;
      return chronyxInfo || "CHRONYX is the personal system for notes, planning, and finance workflows.";
    }

    if (q.includes("website") || q.includes("site") || q.includes("about")) {
      return knowledge
        .slice(0, 5)
        .map((k, i) => `${i + 1}. ${k.title}: ${k.summary}`)
        .join("\n");
    }

    return "I can answer website info, CHRONYX, OriginX latest updates, and LLM Galaxy open/closed model details.";
  };

  const sendPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("abhibot-chat", {
        body: {
          prompt: trimmed,
          context: {
            knowledge: knowledge.slice(0, 12),
            updates: updates.slice(0, 6),
            models: models.slice(0, 20).map((m) => {
              const em = m as ExtendedModel;
              return {
                name: m.name,
                company: m.company,
                is_open_source: m.is_open_source,
                is_trending: m.is_trending,
                use_cases: m.use_cases,
                strengths: m.strengths,
                api_docs_url: m.api_docs_url,
                homepage_url: em.homepage_url ?? null,
                huggingface_url: em.huggingface_url ?? null,
                license: em.license ?? null,
                release_date: m.release_date,
              };
            }),
          },
        },
      });

      if (error) throw error;

      const raw = typeof data?.answer === "string" ? data.answer.trim() : "";
      const hasProviderErrorText =
        raw.toLowerCase().includes("llm service responded") ||
        raw.toLowerCase().includes("fallback is active") ||
        raw.toLowerCase().includes("error (401)");
      const content = raw.length > 0 && !hasProviderErrorText ? raw : buildFallbackReply(trimmed);

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: buildFallbackReply(trimmed),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-[80] w-[min(92vw,390px)] right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-end mb-3">
        <button
          aria-label="Toggle ABHIBOT"
          onClick={() => setIsOpen((s) => !s)}
          className="group relative"
        >
          <div className="rounded-full p-1.5 bg-slate-950/80 border border-slate-200/30 shadow-[0_0_28px_rgba(226,232,240,0.28)] group-hover:scale-105 transition-transform">
            <ChronyxLogo size="lg" imageClassName="h-12 w-12" className="ring-slate-200/55 shadow-[0_0_22px_rgba(226,232,240,0.35)]" />
          </div>
          <span className="absolute -bottom-2 -right-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-semibold">
            AI
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="relative rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-[0_0_35px_rgba(59,130,246,0.2)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <ChronyxLogo compact size="md" imageClassName="h-8 w-8" className="ring-slate-200/55" />
                <div className="min-w-0">
                  <div className="text-sm font-bold tracking-wide text-foreground truncate">ABHIBOT</div>
                  <div className="text-xs text-muted-foreground truncate">CHRONYX AI Personal Assistant</div>
                </div>
              </div>
              <button aria-label="Close ABHIBOT" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "text-sm whitespace-pre-line rounded-xl px-3 py-2",
                    m.role === "bot" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
                  )}
                >
                  {m.content}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendPrompt(q)}
                    className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground hover:bg-primary/10"
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="border-t border-border/60 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void sendPrompt(input);
              }}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask ABHIBOT anything..."
                  className="h-10"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" variant="hero" aria-label="Send prompt" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Open-source LLM + Supabase
                </span>
                <Link to="/llm-galaxy" className="hover:text-primary">Open LLM Galaxy</Link>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
