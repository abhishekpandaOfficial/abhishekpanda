import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MermaidPreview } from "@/components/openowl/admin/MermaidPreview";
import { DEFAULT_MERMAID } from "@/data/openowl-mock";

const generatedDrafts = [
  "LinkedIn draft: production-safe rollout summary with key architecture decisions.",
  "X thread draft: 5 concise points about OpenOwl reliability and safety gates.",
  "Telegram draft: weekly engineering digest with key links.",
];

export default function StudioPage() {
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [mermaid, setMermaid] = useState(DEFAULT_MERMAID);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<string[]>([]);

  const onGenerate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setDrafts(generatedDrafts);
    setLoading(false);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <section className="rounded-xl border border-border bg-card/60 p-4">
        <h2 className="text-lg font-semibold">Studio</h2>
        <p className="text-sm text-muted-foreground">Create content from blog URL or pasted markdown.</p>

        <form onSubmit={onGenerate} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Blog URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/post" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Markdown Input</label>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# Paste article markdown"
              className="min-h-36"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Drafts
          </Button>
        </form>

        <div className="mt-4 rounded-lg border border-border bg-background/70 p-3">
          <h3 className="text-sm font-semibold">Platform drafts</h3>
          {!drafts.length && !loading ? <p className="mt-2 text-sm text-muted-foreground">No drafts yet. Generate to preview.</p> : null}
          <ul className="mt-2 space-y-2 text-sm">
            {drafts.map((draft) => (
              <li key={draft} className="rounded-md border border-border p-2">
                {draft}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <article className="rounded-xl border border-border bg-card/60 p-4">
          <h3 className="text-sm font-semibold">Mermaid Diagram Builder</h3>
          <Textarea value={mermaid} onChange={(e) => setMermaid(e.target.value)} className="mt-2 min-h-32 font-mono text-xs" />
        </article>

        <article className="rounded-xl border border-border bg-card/60 p-4">
          <h3 className="mb-2 text-sm font-semibold">Preview</h3>
          <MermaidPreview code={mermaid} />
        </article>
      </section>
    </div>
  );
}
