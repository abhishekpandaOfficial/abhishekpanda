import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/components/ThemeProvider";
import { EmbeddedAtlasPageShell } from "@/components/atlas/EmbeddedAtlasPageShell";
import { measureEmbeddedFrameHeight, syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";

const ClosedSourceModels = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const [contentHeight, setContentHeight] = useState(0);
  const [minViewportHeight, setMinViewportHeight] = useState(800);

  const postThemeToIframe = (nextTheme: "light" | "dark") => {
    syncThemeToEmbeddedFrame(iframeRef.current, nextTheme);
  };

  const iframeSrc = useMemo(
    () => `/embedded/closed-source-models-2026.html?embedded=1&theme=${initialThemeRef.current}`,
    [],
  );

  const measureFromIframe = () => {
    const measuredHeight = measureEmbeddedFrameHeight(iframeRef.current);
    if (measuredHeight > 0) {
      setContentHeight(measuredHeight);
    }
  };

  useEffect(() => {
    const updateMinHeight = () => {
      const headerHeight = window.matchMedia("(min-width: 768px)").matches ? 80 : 64;
      setMinViewportHeight(Math.max(window.innerHeight - headerHeight, 700));
    };

    updateMinHeight();
    window.addEventListener("resize", updateMinHeight);

    return () => window.removeEventListener("resize", updateMinHeight);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data as { type?: string; height?: number };
      if (data?.type === "closed-source-height" && typeof data.height === "number") {
        setContentHeight(data.height);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    postThemeToIframe(theme);
  }, [theme]);

  const iframeHeight = useMemo(() => {
    return Math.max(contentHeight, minViewportHeight);
  }, [contentHeight, minViewportHeight]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <EmbeddedAtlasPageShell
        title="Closed Source Models"
        description="Review frontier proprietary models in a cleaner full-width experience built for premium comparison, provider-level scanning, and responsive benchmark reading."
        badge="Frontier Providers"
        accentClassName="border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300"
        metricItems={[
          { label: "Source", value: "Closed provider ecosystem" },
          { label: "Focus", value: "Frontier APIs and premium stacks" },
          { label: "Theme", value: "Light and dark aware" },
          { label: "Layout", value: "Full-width responsive reading" },
        ]}
      >
        <iframe
          ref={iframeRef}
          title="Closed Source LLM Models"
          src={iframeSrc}
          className="block w-full border-0"
          style={{ height: `${iframeHeight}px` }}
          onLoad={() => {
            postThemeToIframe(theme);
            measureFromIframe();
            window.setTimeout(measureFromIframe, 120);
            window.setTimeout(measureFromIframe, 500);
          }}
        />
      </EmbeddedAtlasPageShell>
      <Footer />
    </div>
  );
};

export default ClosedSourceModels;
