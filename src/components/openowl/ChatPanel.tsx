import { FormEvent, useMemo, useState } from "react";
import { Bot, Clock3, Mic, Paperclip, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { streamAssistantReply } from "@/lib/openowl/mockStream";
import { OPENOWL_GREETING } from "@/data/openowl-mock";
import type { ChatMessage } from "@/types/openowl";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

const quickPrompts = [
  "Summarize my latest blog focus in 5 bullets",
  "Create a Mermaid flow for OpenOwl publish workflow",
  "Draft a task plan for launching OpenOwl beta",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([OPENOWL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = input.trim().length > 0 && !loading;

  const list = useMemo(() => messages.slice(-8), [messages]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: makeId("u"),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantId = makeId("a");
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    const meta = await streamAssistantReply(content, (token) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg)),
      );
    });

    setMessages((prev) => prev.map((msg) => (msg.id === assistantId ? { ...msg, ...meta } : msg)));
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Bot className="h-4 w-4" />
          Live Chat
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] text-primary">
          <Clock3 className="h-3 w-3" />
          Development Phase
        </span>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-border bg-background/70 p-3">
        {list.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === "user" ? "ml-auto w-fit max-w-[90%]" : "mr-auto max-w-[90%]"}
          >
            <div
              className={
                msg.role === "user"
                  ? "rounded-xl bg-foreground px-3 py-2 text-sm text-background"
                  : "rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
              }
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "..."}</ReactMarkdown>
            </div>
            {msg.needsApproval ? (
              <div className="mt-1 inline-block rounded-full border border-amber-400/60 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/25 dark:text-amber-300">
                Action requires approval
              </div>
            ) : null}
            {msg.sources?.length ? (
              <details className="mt-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                <summary className="cursor-pointer">Sources</summary>
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

      <div className="mt-3 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={loading}
            onClick={() => setInput(prompt)}
            className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-3 rounded-xl border border-border bg-background/80 p-2">
        <div className="flex items-end gap-2">
          <button type="button" aria-label="Attach" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AbhishekPanda Assistant..."
            className="h-10 flex-1 border-0 bg-transparent px-2 text-sm outline-none"
          />
          <button type="button" aria-label="Voice" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <Mic className="h-4 w-4" />
          </button>
          <Button size="icon" type="submit" disabled={!canSend} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
