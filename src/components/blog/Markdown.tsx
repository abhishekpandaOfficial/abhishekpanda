import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import hljs from "highlight.js/lib/common";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme } = useTheme();
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-headings:scroll-mt-28 prose-h2:mt-12 prose-h2:border-b prose-h2:border-border/70 prose-h2:pb-2 prose-h2:text-2xl prose-h2:font-black prose-h3:mt-8 prose-h3:text-xl prose-h3:font-bold prose-p:leading-7 prose-li:leading-7 prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-border/70 prose-img:bg-card prose-img:p-1 dark:prose-img:bg-slate-900">
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
          p: ({ node, children, ...props }: any) => {
            const childNodes = Array.isArray((node as any)?.children) ? (node as any).children : [];
            const onlyChild = childNodes.length === 1 ? childNodes[0] : null;
            const onlyChildClass = String((onlyChild as any)?.properties?.className || "");
            const looksLikeBlockCode =
              (onlyChild as any)?.tagName === "code" &&
              /language-/.test(onlyChildClass);
            if (looksLikeBlockCode) {
              return <>{children as ReactNode}</>;
            }
            return <p {...props}>{children}</p>;
          },
          pre: ({ children }) => (
            <>{children}</>
          ),
          code: ({ className, inline, children, ...props }: any) => {
            const isInline = !!inline;
            const textToCopy = String(children ?? "").replace(/\n$/, "");
            const normalizedClass = (className || "").trim();
            const hasLanguageClass = /language-/.test(normalizedClass);
            const looksLikeBlockCode = !isInline && (hasLanguageClass || textToCopy.includes("\n"));

            if (!looksLikeBlockCode) {
              return (
                <code
                  className={`px-2 py-0.5 rounded-md border border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium ${className || ""}`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const language = normalizedClass.replace("language-", "").trim();
            return (
              <CodeBlockWrapper
                code={textToCopy}
                language={language}
                codeTheme={codeTheme}
                themeMode={theme}
              />
            );
          },
          a: ({ node, ...props }) => {
            const isCta = typeof (node as any)?.properties?.dataCta !== "undefined";
            const href = typeof props.href === "string" ? props.href : "";
            const isExternal = /^https?:\/\//i.test(href);
            if (isCta) {
              return (
                <a
                  {...props}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold no-underline"
                />
              );
            }
            return (
              <a
                {...props}
                title={href}
                target={isExternal ? "_blank" : props.target}
                rel={isExternal ? "noopener noreferrer" : props.rel}
                className={`underline decoration-dotted underline-offset-4 hover:decoration-solid hover:text-primary transition-colors ${props.className || ""}`}
              />
            );
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
  themeMode,
}: {
  code: string;
  language?: string;
  codeTheme: string;
  themeMode?: "light" | "dark" | "system";
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

  const isDark = themeMode !== "light";

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${
        isDark
          ? "border border-cyan-400/25 bg-gradient-to-br from-slate-950 to-blue-950/80 shadow-[0_8px_30px_rgba(2,132,199,0.18)]"
          : "border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/70 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      <span
        className={`absolute top-2 left-3 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
          isDark
            ? "border border-cyan-300/30 bg-cyan-500/20 text-cyan-100"
            : "border border-sky-300/60 bg-sky-100 text-sky-700"
        }`}
      >
        {normalizedLanguage}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-md ${
          isDark
            ? "border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
            : "border border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-100"
        }`}
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
