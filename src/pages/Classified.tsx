import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";

const STATIC_CLASSIFIED_VERSION = "2026-03-08-argus-viii-v1";

const Classified = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const [iframeHeight, setIframeHeight] = useState(800);

  useEffect(() => {
    const calc = () => {
      const headerHeight = window.matchMedia("(min-width: 768px)").matches ? 88 : 80;
      setIframeHeight(window.innerHeight - headerHeight);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      theme: initialThemeRef.current,
      v: STATIC_CLASSIFIED_VERSION,
    });

    return `/embedded/argus-vii-v3-pro.html?${params.toString()}`;
  }, []);

  useEffect(() => {
    syncThemeToEmbeddedFrame(iframeRef.current, theme);
  }, [theme]);

  return (
    <div
      className={cn(
        "min-h-screen",
        theme === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur",
          theme === "light"
            ? "border-sky-700/15 bg-white/95"
            : "border-cyan-400/20 bg-slate-950/95"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-[88px] md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_24px_rgba(34,211,238,0.14)]",
                theme === "light"
                  ? "border border-sky-700/20 bg-sky-100 text-sky-700"
                  : "border border-cyan-300/30 bg-cyan-400/10 text-cyan-200"
              )}
            >
              <Smile className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.32em]",
                  theme === "light" ? "text-sky-700/80" : "text-cyan-200/80"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Classified
              </div>
              <p className={cn("truncate text-sm font-semibold md:text-base", theme === "light" ? "text-slate-900" : "text-white")}>
                ARGUS VIII Preview Surface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              className={cn(
                theme === "light"
                  ? "border-sky-700/20 bg-white text-slate-900 hover:bg-slate-100"
                  : "border-cyan-400/30 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
              )}
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Classified ARGUS VIII Interface"
          src={iframeSrc}
          className="block w-full border-0"
          style={{ height: iframeHeight }}
          allow="same-origin fullscreen"
          onLoad={() => syncThemeToEmbeddedFrame(iframeRef.current, theme)}
        />
      </main>
    </div>
  );
};

export default Classified;
