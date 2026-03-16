import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Fingerprint,
  Globe2,
  Laptop2,
  Monitor,
  Radar,
  Shield,
  ShieldAlert,
  Smartphone,
  TerminalSquare,
} from "lucide-react";
import { FaApple } from "react-icons/fa";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getAdminDesktopDownloadUrl } from "@/lib/adminRuntime";

type VisitorTrace = {
  ipAddress: string;
  browser: string;
  device: string;
  os: string;
  city?: string;
  country?: string;
  timezone?: string;
};

const eventLog = [
  "[probe] route /downloads opened",
  "[scan] public artifact catalog mounted",
  "[watch] browser fingerprint parser armed",
  "[intel] device profile mirrored to viewport",
  "[gate] operator payload behind warning modal",
  "[ready] dmg dispatch waiting for confirmation",
];

const installFlow = [
  "$ hdiutil attach ~/Downloads/Abhishek-Admin.dmg",
  '$ cp -R "/Volumes/Abhishek Admin/Abhishek Admin.app" /Applications/',
  '$ xattr -dr com.apple.quarantine "/Applications/Abhishek Admin.app"',
  '$ open "/Applications/Abhishek Admin.app"',
];

const PirateDangerFlag = () => (
  <motion.div
    animate={{ y: [0, -2, 0], scale: [1, 1.01, 1] }}
    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    className="overflow-hidden rounded-[22px] border border-red-400/15 bg-black/20 shadow-[0_24px_70px_-40px_rgba(248,113,113,0.65)]"
  >
    <img
      src="/images/blog/foundation-models/Anime Pirate Flag.gif"
      alt="Pirate warning flag"
      className="block h-auto w-full max-w-[320px] object-cover"
      loading="eager"
    />
  </motion.div>
);

const parseVisitorAgent = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac/.test(ua)) os = "macOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";

  if (/Tablet|iPad/.test(ua)) device = "Tablet";
  else if (/Mobile|Android|iPhone/.test(ua)) device = "Mobile";

  return { browser, os, device };
};

export default function DesktopApp() {
  const downloadUrl = getAdminDesktopDownloadUrl();
  const [warningOpen, setWarningOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [visitorTrace, setVisitorTrace] = useState<VisitorTrace | null>(null);
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisibleRows((current) => Math.min(current + 1, eventLog.length));
    }, 260);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTrace = async () => {
      const parsed = parseVisitorAgent();

      try {
        const response = await fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("trace lookup failed");
        const data = await response.json();
        if (cancelled) return;

        setVisitorTrace({
          ipAddress: data.ip || "Unavailable",
          browser: parsed.browser,
          device: parsed.device,
          os: parsed.os,
          city: data.city || "Unknown",
          country: data.country_name || "Unknown",
          timezone: data.timezone || "Unknown",
        });
      } catch {
        if (cancelled) return;
        setVisitorTrace({
          ipAddress: "Unavailable",
          browser: parsed.browser,
          device: parsed.device,
          os: parsed.os,
        });
      }
    };

    void loadTrace();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDownloading) return;
    if (countdown <= 0) {
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "";
      anchor.rel = "noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setIsDownloading(false);
      setWarningOpen(false);
      setCountdown(3);
      return;
    }

    const timeoutId = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [countdown, downloadUrl, isDownloading]);

  const traceCards = useMemo(
    () => [
      {
        label: "IP Address",
        value: visitorTrace?.ipAddress || "Resolving...",
        icon: Globe2,
      },
      {
        label: "Browser",
        value: visitorTrace?.browser || "Detecting...",
        icon: Monitor,
      },
      {
        label: "Device",
        value: visitorTrace?.device || "Detecting...",
        icon: visitorTrace?.device === "Mobile" ? Smartphone : Laptop2,
      },
      {
        label: "Operating System",
        value: visitorTrace?.os || "Detecting...",
        icon: Fingerprint,
      },
    ],
    [visitorTrace],
  );

  return (
    <div className="min-h-screen bg-[#030508] text-[#dafbe7]">
      <Navigation />

      <main className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#030508_0%,#07110d_45%,#030508_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(74,222,128,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
          animate={{ y: [0, 760, 0], opacity: [0.12, 0.95, 0.12] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <section className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-[28px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(4,14,11,0.96),rgba(2,7,9,0.98))] p-4 shadow-[0_30px_120px_-60px_rgba(16,185,129,0.65)]"
              >
                <div className="flex items-center justify-between border-b border-emerald-400/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
                    operator-terminal
                  </div>
                </div>

                <div className="grid gap-6 pt-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                      <TerminalSquare className="h-4 w-4" />
                      Live Download Access
                    </div>
                    <h1 className="mt-4 font-mono text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#f3fff8] md:text-6xl">
                      Desktop
                      <span className="block text-emerald-400">Access</span>
                      <span className="block text-[#d9fff0]">Download Gate</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#9dceb4] md:text-base">
                      Download the macOS build through a guarded console-style page that surfaces visitor context, shows install guidance, and requires explicit confirmation before the DMG is dispatched.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => setWarningOpen(true)}
                        className="h-11 rounded-full bg-[#f5f7fb] px-5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#09111d] hover:bg-white"
                      >
                        <FaApple className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <div className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-red-300">
                        Download At Your Own Risk
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-emerald-400/10 bg-black/25 p-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">
                      Download Notes
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Built for macOS on Apple Silicon.",
                        "Install guidance is listed below for a clean local setup.",
                        "A confirmation step appears before any file transfer starts.",
                      ].map((note) => (
                        <div key={note} className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#effff7]">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.58, delay: 0.08 }}
                  className="rounded-[28px] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(2,11,10,0.94),rgba(2,8,11,0.98))] p-5 shadow-[0_24px_90px_-55px_rgba(34,197,94,0.5)]"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-emerald-300/80">
                    <Radar className="h-4 w-4" />
                    Trace Feed
                  </div>
                  <div className="mt-5 space-y-3 font-mono text-sm text-[#ccf6de]">
                    {eventLog.slice(0, visibleRows).map((entry, index) => (
                      <motion.div
                        key={entry}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                      >
                        <span className="text-emerald-500">0{index + 1}</span>
                        <span>{entry}</span>
                      </motion.div>
                    ))}
                    <motion.div
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="h-4 w-2 rounded-sm bg-emerald-400"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.58, delay: 0.14 }}
                  className="rounded-[28px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(4,11,17,0.95),rgba(3,7,13,0.98))] p-5 shadow-[0_24px_90px_-55px_rgba(34,211,238,0.45)]"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-cyan-300/80">
                    <Shield className="h-4 w-4" />
                    Install Commands
                  </div>
                  <div className="mt-5 space-y-3">
                    {installFlow.map((command) => (
                      <div key={command} className="rounded-2xl border border-white/5 bg-black/25 px-4 py-3 font-mono text-xs leading-6 text-[#e8fbff]">
                        {command}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="space-y-6"
            >
              <div className="rounded-[28px] border border-red-400/15 bg-[linear-gradient(180deg,rgba(22,7,10,0.96),rgba(8,3,6,0.99))] p-5 shadow-[0_30px_90px_-60px_rgba(248,113,113,0.85)]">
                <div className="mb-4 flex justify-center">
                  <PirateDangerFlag />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-red-300">
                  <ShieldAlert className="h-4 w-4" />
                  Warning
                </div>
                <h2 className="mt-4 font-mono text-2xl font-black uppercase leading-tight text-[#fff4f4]">
                  Ready For
                  <span className="block text-red-300">Your Every Move</span>
                </h2>
              </div>

              <div className="rounded-[28px] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(3,15,12,0.96),rgba(2,8,10,0.98))] p-5 shadow-[0_24px_90px_-60px_rgba(16,185,129,0.55)]">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-emerald-300/80">
                  <Radar className="h-4 w-4" />
                  Visitor Trace
                </div>
                <div className="mt-4 grid gap-3">
                  {traceCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#83ddb3]">
                          <Icon className="h-4 w-4" />
                          {card.label}
                        </div>
                        <div className="mt-2 break-all font-mono text-sm text-white">{card.value}</div>
                      </div>
                    );
                  })}
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#83ddb3]">Region</div>
                    <div className="mt-2 font-mono text-sm text-white">
                      {visitorTrace?.city && visitorTrace?.country
                        ? `${visitorTrace.city}, ${visitorTrace.country}`
                        : "Resolving..."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {warningOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-lg rounded-[28px] border border-red-400/20 bg-[linear-gradient(180deg,rgba(20,6,9,0.98),rgba(8,3,5,0.99))] p-6 shadow-[0_40px_120px_-55px_rgba(248,113,113,0.9)]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Final Warning
              </div>
              <h2 className="mt-4 font-mono text-3xl font-black uppercase text-[#fff6f6]">
                Download At
                <span className="block text-red-300">Your Own Risk</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-red-50/82">
                This app may trigger a macOS trust prompt on first launch if you are using the unsigned build. The simulated “watching every move” warning is part of the page design, but the DMG download itself starts only after you confirm below.
              </p>
              <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-4 font-mono text-xs leading-6 text-[#ffd9d9]">
                {isDownloading
                  ? `dispatch_countdown = ${countdown}\npayload_status = armed\nartifact = Abhishek-Admin.dmg`
                  : "dispatch_countdown = idle\npayload_status = awaiting consent\nartifact = Abhishek-Admin.dmg"}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => {
                    setIsDownloading(true);
                    setCountdown(3);
                  }}
                  disabled={isDownloading}
                  className="h-12 flex-1 rounded-full bg-[#f5f7fb] font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#08101b] hover:bg-white"
                >
                  <FaApple className="mr-2 h-4 w-4" />
                  {isDownloading ? `Launching In ${countdown}` : "Confirm Download"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setWarningOpen(false);
                    setIsDownloading(false);
                    setCountdown(3);
                  }}
                  className="h-12 rounded-full border-red-400/20 bg-transparent font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-red-100 hover:bg-red-500/10"
                >
                  Abort
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
