import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  value: string;
};

export const Markdown = ({ value }: MarkdownProps) => {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          // Adds id=... to headings based on content
          rehypeSlug,
          // Adds anchor links to headings
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          // Basic code highlighting (client-side)
          rehypeHighlight,
        ]}
        components={{
          pre: ({ children }) => (
            <CodeBlockWrapper>{children}</CodeBlockWrapper>
          ),
          a: ({ node, ...props }) => {
            const isCta = typeof (node as any)?.properties?.dataCta !== "undefined";
            if (isCta) {
              return (
                <a
                  {...props}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold no-underline"
                />
              );
            }
            return <a {...props} />;
          },
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlockWrapper = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const textToCopy = useMemo(() => {
    // Attempt to grab text from <code> inside <pre>.
    const codeEl = Array.isArray(children) ? children[0] : children;
    const raw = codeEl?.props?.children;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join("") : "";
  }, [children]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md border border-border bg-background/80 hover:bg-background"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="m-0 overflow-x-auto p-4">{children}</pre>
    </div>
  );
};
