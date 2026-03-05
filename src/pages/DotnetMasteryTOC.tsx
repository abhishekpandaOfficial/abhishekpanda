import { useEffect, useRef, useMemo, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";

const STATIC_TOC_VERSION = "2026-03-05-static-html-v2";

const DotnetMasteryTOC = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);

  // Compute the available height below the nav bar
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

  const iframeSrc = useMemo(
    () => {
      const topParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams({
        embedded: "1",
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
    },
    [],
  );

  const postTheme = (t: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "parent-theme", theme: t },
      window.location.origin,
    );
  };

  useEffect(() => { postTheme(theme); }, [theme]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = (event.data || {}) as {
        type?: string;
        moduleId?: string;
        chId?: string;
        topic?: string;
      };
      if (data.type !== "toc-selection") return;

      const next = new URL(window.location.href);
      if (data.moduleId) next.searchParams.set("module", data.moduleId);
      if (data.chId) next.searchParams.set("ch", data.chId);
      if (data.topic) next.searchParams.set("topic", data.topic);
      else next.searchParams.delete("topic");
      next.searchParams.set("v", STATIC_TOC_VERSION);

      const finalUrl = `${next.pathname}?${next.searchParams.toString()}`;
      window.history.replaceState({}, "", finalUrl);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="C# & .NET Mastery — Complete Series"
          src={iframeSrc}
          className="block w-full border-0"
          style={{ height: iframeHeight }}
          allow="same-origin"
          onLoad={() => postTheme(theme)}
        />
      </main>
    </div>
  );
};

export default DotnetMasteryTOC;
