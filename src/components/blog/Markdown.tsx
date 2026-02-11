import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import hljs from "highlight.js/lib/common";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  value: string;
  codeTheme?: string;
};

const DEFAULT_CODE_THEME = "github-light";
const SHIKI_LANGS = [
  "plaintext",
  "text",
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "bash",
  "json",
  "yaml",
  "markdown",
  "html",
  "css",
  "sql",
  "xml",
] as const;

const LANGUAGE_ALIASES: Record<string, string> = {
  txt: "text",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  htm: "html",
  cxx: "cpp",
  cc: "cpp",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
};

const highlighterByTheme = new Map<string, Promise<any>>();

const normalizeCodeLanguage = (language?: string) => {
  if (!language) return "text";
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] || normalized;
};

const detectLanguage = (code: string) => {
  try {
    const detected = hljs.highlightAuto(code).language;
    if (!detected) return "text";
    return normalizeCodeLanguage(detected);
  } catch {
    return "text";
  }
};

const getHighlighterForTheme = async (theme: string) => {
  const nextTheme = theme || DEFAULT_CODE_THEME;
  const cached = highlighterByTheme.get(nextTheme);
  if (cached) return cached;

  const promise = import("shiki").then(({ getHighlighter }) =>
    getHighlighter({
      themes: [nextTheme],
      langs: [...SHIKI_LANGS],
    }),
  );
  highlighterByTheme.set(nextTheme, promise);
  return promise;
};

export const Markdown = ({ value, codeTheme = DEFAULT_CODE_THEME }: MarkdownProps) => {
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
        ]}
        components={{
          pre: ({ children }) => (
            <>{children}</>
          ),
          code: ({ className, inline, children, ...props }: any) => {
            const isInline = !!inline;
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            const language = className?.replace("language-", "").trim();
            const textToCopy = String(children ?? "").replace(/\n$/, "");
            return (
              <CodeBlockWrapper
                code={textToCopy}
                language={language}
                codeTheme={codeTheme}
              />
            );
          },
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

const CodeBlockWrapper = ({
  code,
  language,
  codeTheme,
}: {
  code: string;
  language?: string;
  codeTheme: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const textToCopy = useMemo(() => code, [code]);
  const normalizedLanguage = useMemo(() => {
    const explicit = normalizeCodeLanguage(language);
    if (explicit !== "text") return explicit;
    return detectLanguage(textToCopy);
  }, [language, textToCopy]);

  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      try {
        const highlighter = await getHighlighterForTheme(codeTheme);
        const html = highlighter.codeToHtml(textToCopy, {
          lang: normalizedLanguage,
          theme: codeTheme || DEFAULT_CODE_THEME,
        });
        if (!cancelled) setHighlightedHtml(html);
      } catch {
        if (!cancelled) setHighlightedHtml("");
      }
    };

    void highlight();
    return () => {
      cancelled = true;
    };
  }, [textToCopy, normalizedLanguage, codeTheme]);

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
      {highlightedHtml ? (
        <div
          className="overflow-x-auto p-4 shiki-wrapper"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="m-0 overflow-x-auto p-4">
          <code>{textToCopy}</code>
        </pre>
      )}
    </div>
  );
};
