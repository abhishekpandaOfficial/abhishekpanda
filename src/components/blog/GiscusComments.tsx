import { useEffect, useMemo, useRef } from "react";

type GiscusConfig = {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: string;
  theme?: string;
};

const getConfig = (): GiscusConfig => ({
  repo: import.meta.env.VITE_GISCUS_REPO as string | undefined,
  repoId: import.meta.env.VITE_GISCUS_REPO_ID as string | undefined,
  category: import.meta.env.VITE_GISCUS_CATEGORY as string | undefined,
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined,
  mapping: (import.meta.env.VITE_GISCUS_MAPPING as string | undefined) || "pathname",
  theme: (import.meta.env.VITE_GISCUS_THEME as string | undefined) || "dark",
});

export function GiscusComments() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cfg = useMemo(getConfig, []);
  const isConfigured = !!(cfg.repo && cfg.repoId && cfg.category && cfg.categoryId);

  useEffect(() => {
    if (!isConfigured) return;
    if (!hostRef.current) return;

    const root = hostRef.current;
    root.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", cfg.repo!);
    script.setAttribute("data-repo-id", cfg.repoId!);
    script.setAttribute("data-category", cfg.category!);
    script.setAttribute("data-category-id", cfg.categoryId!);
    script.setAttribute("data-mapping", cfg.mapping || "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", cfg.theme || "dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    root.appendChild(script);
  }, [cfg.category, cfg.categoryId, cfg.mapping, cfg.repo, cfg.repoId, cfg.theme, isConfigured]);

  if (!isConfigured) {
    if (!import.meta.env.DEV) return null;
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Giscus is not configured. Set: `VITE_GISCUS_REPO`, `VITE_GISCUS_REPO_ID`,
        `VITE_GISCUS_CATEGORY`, `VITE_GISCUS_CATEGORY_ID`.
      </div>
    );
  }

  return <div ref={hostRef} className="min-h-[240px]" />;
}
