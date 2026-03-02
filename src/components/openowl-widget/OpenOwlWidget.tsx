import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, Mic, Paperclip, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";
import { streamAssistantReply } from "@/lib/openowl/mockStream";
import { OPENOWL_GREETING } from "@/data/openowl-mock";
import type { ChatMessage } from "@/types/openowl";
import { cn } from "@/lib/utils";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function OpenOwlWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([OPENOWL_GREETING]);

  const displayed = useMemo(() => messages.slice(-10), [messages]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: makeId("u"),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const assistantId = makeId("a");
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setLoading(true);

    const meta = await streamAssistantReply(text, (token) => {
      setMessages((prev) => prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg)));
    });

    setMessages((prev) => prev.map((msg) => (msg.id === assistantId ? { ...msg, ...meta } : msg)));
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {open ? (
        <div className="h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:h-[640px] md:w-[420px]">
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="inline-flex items-center gap-2">
              <OpenOwlAnimatedLogo compact animate />
              <div>
                <p className="text-sm font-semibold">OpenOwl</p>
                <p className="text-xs text-muted-foreground">AbhishekPanda Assistant · Dev</p>
              </div>
            </div>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex h-[calc(100%-52px)] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {displayed.map((msg) => (
                <div key={msg.id} className={cn("max-w-[90%]", msg.role === "user" ? "ml-auto" : "mr-auto")}>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm",
                      msg.role === "user" ? "bg-foreground text-background" : "border border-border bg-card text-foreground",
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "..."}</ReactMarkdown>
                  </div>

                  {msg.needsApproval ? (
                    <div className="mt-1 inline-block rounded-full border border-amber-400/60 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      Action requires approval
                    </div>
                  ) : null}

                  {msg.sources?.length ? (
                    <details className="mt-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                      <summary className="cursor-pointer list-none">
                        <span className="inline-flex items-center gap-1">
                          Sources
                          <ChevronDown className="h-3 w-3" />
                        </span>
                      </summary>
                      <ul className="mt-1 space-y-1">
                        {msg.sources.map((source) => (
                          <li key={source.url}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>

            <form onSubmit={onSubmit} className="border-t border-border p-2">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-card/50 px-1">
                <button type="button" aria-label="Attach" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask OpenOwl..."
                  className="h-10 flex-1 border-0 bg-transparent text-sm outline-none"
                />
                <button type="button" aria-label="Voice input" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                  <Mic className="h-4 w-4" />
                </button>
                <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {!open ? (
        <button
          aria-label="Open OpenOwl widget"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-lg transition hover:scale-105"
        >
          <OpenOwlAnimatedLogo compact animate={false} />
        </button>
      ) : null}
    </div>
  );
}
