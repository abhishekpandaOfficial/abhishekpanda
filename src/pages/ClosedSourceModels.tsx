import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/components/ThemeProvider";

const ClosedSourceModels = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const [contentHeight, setContentHeight] = useState(0);
  const [minViewportHeight, setMinViewportHeight] = useState(800);

  const postThemeToIframe = (nextTheme: "light" | "dark") => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;

    frameWindow.postMessage({ type: "parent-theme", theme: nextTheme }, window.location.origin);
  };

  const iframeSrc = useMemo(
    () => `/ai-closed_models-2026-.html?embedded=1&theme=${initialThemeRef.current}`,
    [],
  );

  const measureFromIframe = () => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;

    const body = doc.body;
    const root = doc.documentElement;
    const measuredHeight = Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      root ? root.scrollHeight : 0,
      root ? root.offsetHeight : 0,
    );

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
      <main className="pt-16 md:pt-20">
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
      </main>
      <Footer />
    </div>
  );
};

export default ClosedSourceModels;
