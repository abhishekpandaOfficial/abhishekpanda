import { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";

const ALLOWED_PREFIX = [
  "flowchart",
  "sequenceDiagram",
  "classDiagram",
  "erDiagram",
  "gantt",
  "stateDiagram",
  "journey",
] as const;

function sanitizeMermaidInput(input: string) {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/[<>]/g, "");
}

function isAllowedDiagram(input: string) {
  const first = input.trim().split(/\s+/)[0] || "";
  return ALLOWED_PREFIX.includes(first as (typeof ALLOWED_PREFIX)[number]);
}

export function MermaidPreview({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const safeCode = useMemo(() => sanitizeMermaidInput(code), [code]);

  useEffect(() => {
    let active = true;

    async function render() {
      if (!safeCode.trim()) {
        setSvg("");
        setError("Add Mermaid code to preview.");
        return;
      }
      if (!isAllowedDiagram(safeCode)) {
        setSvg("");
        setError("Unsupported diagram type.");
        return;
      }

      try {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "default" });
        const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
        const rendered = await mermaid.render(id, safeCode);
        if (!active) return;
        setSvg(rendered.svg);
        setError(null);
      } catch (err) {
        if (!active) return;
        setSvg("");
        setError("Failed to render Mermaid diagram.");
      }
    }

    render();

    return () => {
      active = false;
    };
  }, [safeCode]);

  if (error) {
    return <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{error}</div>;
  }

  return <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-950" dangerouslySetInnerHTML={{ __html: svg }} />;
}
