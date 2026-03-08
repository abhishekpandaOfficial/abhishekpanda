import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";

const STATIC_GUIDE_VERSION = "2026-03-08-solid-principles-guide-v1";

const SolidPrinciplesGuide = () => {
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
    const params = new URLSearchParams({
      embedded: "1",
      theme: initialThemeRef.current,
      v: STATIC_GUIDE_VERSION,
    });

    return `/embedded/solid-principles-guide.html?${params.toString()}`;
  }, []);

  const postTheme = (nextTheme: "light" | "dark") => {
    syncThemeToEmbeddedFrame(iframeRef.current, nextTheme);
  };

  useEffect(() => {
    postTheme(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="SOLID Principles Guide"
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

export default SolidPrinciplesGuide;
