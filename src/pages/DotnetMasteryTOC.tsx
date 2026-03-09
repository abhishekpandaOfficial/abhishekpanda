import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";
import { ARTICLES } from "@/content/articles";

const STATIC_TOC_VERSION = "2026-03-09-csharp-mastery-iframe-v2";

const newestArticles = (() => {
  const timestamps = ARTICLES.map((article) => new Date(article.publishedAt).getTime()).filter((value) => Number.isFinite(value));
  const uniqueTimestamps = Array.from(new Set(timestamps));
  const maxTimestamp = uniqueTimestamps.length ? Math.max(...uniqueTimestamps) : 0;

  return ARTICLES.map((article, index) => {
    const articleTimestamp = new Date(article.publishedAt).getTime();
    const isNew = uniqueTimestamps.length > 1 ? articleTimestamp === maxTimestamp : index < 2;

    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      href: `/articles/${article.slug}`,
      publishedAt: article.publishedAt,
      readMinutes: article.readMinutes,
      eyebrow: article.eyebrow,
      tags: article.tags.slice(0, 3),
      isNew,
    };
  });
})();

const DotnetMasteryTOC = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const [iframeHeight, setIframeHeight] = useState(800);

  useEffect(() => {
    const calc = () => {
      const navH = window.matchMedia("(min-width: 768px)").matches ? 80 : 64;
      setIframeHeight(window.innerHeight - navH);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const iframeSrc = useMemo(() => {
    const topParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams({
      embedded: "1",
      toc_only: "1",
      theme: initialThemeRef.current,
      v: STATIC_TOC_VERSION,
    });

    const moduleId = topParams.get("module");
    const chapterId = topParams.get("ch");
    const topic = topParams.get("topic");
    if (moduleId) params.set("module", moduleId);
    if (chapterId) params.set("ch", chapterId);
    if (topic) params.set("topic", topic);

    return `/embedded/dotnet-mastery-toc.html?${params.toString()}`;
  }, []);

  const postTheme = (nextTheme: "light" | "dark") => {
    syncThemeToEmbeddedFrame(iframeRef.current, nextTheme);
  };

  const postArticles = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "site-articles",
        articles: newestArticles,
      },
      window.location.origin,
    );
  };

  useEffect(() => {
    postTheme(theme);
    postArticles();
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="overflow-hidden pt-16 md:pt-20">
        <iframe
          ref={iframeRef}
          title="Dotnet (.NET Mastery)"
          src={iframeSrc}
          className="block w-full border-0"
          style={{ height: iframeHeight }}
          allow="same-origin"
          onLoad={() => {
            postTheme(theme);
            postArticles();
            window.setTimeout(postArticles, 120);
          }}
        />
      </main>
    </div>
  );
};

export default DotnetMasteryTOC;
