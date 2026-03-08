import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/components/ThemeProvider";
import { measureEmbeddedFrameHeight, syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";

const ModelComparisonPage = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const [contentHeight, setContentHeight] = useState(0);
  const [minViewportHeight, setMinViewportHeight] = useState(800);

  const postThemeToIframe = (nextTheme: "light" | "dark") => {
    syncThemeToEmbeddedFrame(iframeRef.current, nextTheme);
  };

  const iframeSrc = useMemo(
    () => `/embedded/ai-model-comparison.html?embedded=1&theme=${initialThemeRef.current}`,
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
      if (data?.type === "comparison-height" && typeof data.height === "number") {
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
      <main className="pt-16 md:pt-20">
        <iframe
          ref={iframeRef}
          title="AI Model Comparison"
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
      </main>
      <Footer />
    </div>
  );
};

export default ModelComparisonPage;
