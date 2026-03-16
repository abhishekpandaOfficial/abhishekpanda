import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  Lock,
  ScanLine,
  ShieldAlert,
  TerminalSquare,
} from "lucide-react";
import { FaApple } from "react-icons/fa";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getAdminDesktopDownloadUrl } from "@/lib/adminRuntime";
import { DESKTOP_APP_VERSION } from "@/generated/desktopRelease";

const terminalLines = [
  "$ whoami",
  "operator: abhishek-admin",
  "$ sw_vers",
  "ProductVersion: macOS Apple Silicon",
  "$ security scan --target local-runtime",
  "[ok] isolated admin shell",
  "[warn] unsigned build may trigger Gatekeeper prompt",
  "[trace] all actions remain locally initiated",
  "$ deploy-mode",
  "production_ready = true",
];

const protocolRows = [
  { label: "Artifact", value: "Abhishek-Admin.dmg" },
  { label: "Platform", value: "macOS / Apple Silicon" },
  { label: "Version", value: `v${DESKTOP_APP_VERSION}` },
  { label: "Launch Mode", value: "Admin-only workspace" },
];

const commandRows = [
  "hdiutil attach ~/Downloads/Abhishek-Admin.dmg",
  "cp -R \"/Volumes/Abhishek Admin/Abhishek Admin.app\" /Applications/",
  "xattr -dr com.apple.quarantine \"/Applications/Abhishek Admin.app\"",
  "open \"/Applications/Abhishek Admin.app\"",
];

export default function DesktopApp() {
  const downloadUrl = getAdminDesktopDownloadUrl();
  const [showWarning, setShowWarning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisibleLines((current) => {
        if (current >= terminalLines.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, 220);

    return () => window.clearInterval(intervalId);
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
      setShowWarning(false);
      setCountdown(3);
      return;
    }

    const timeout = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [countdown, downloadUrl, isDownloading]);

  const gridColumns = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);

  return (
    <div className="min-h-screen bg-[#02060a] text-[#cdebd9]">
      <Navigation />

      <main className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#02060a_0%,#03110d_48%,#02060a_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(16,185,129,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {gridColumns.map((column) => (
            <motion.div
              key={column}
              className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent"
              style={{ left: `${column * 6}%` }}
              animate={{ opacity: [0.12, 0.55, 0.12] }}
              transition={{ duration: 2.8 + (column % 4), repeat: Infinity, delay: column * 0.08 }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),transparent)]" />

        <section className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_460px]">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300"
              >
                <ScanLine className="h-4 w-4" />
                Operator Download Node
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="max-w-4xl"
              >
                <h1 className="font-mono text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#ecfff4] md:text-6xl xl:text-7xl">
                  MacOS Admin Build
                  <span className="mt-2 block text-emerald-400">Ready For Controlled Download</span>
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[#98c8b2] md:text-lg">
                  This node deploys the Apple Silicon desktop shell for your admin portal only. It opens into the protected operator workspace, not the full public website, and it carries the same hard-edged warning style as a live command surface.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {protocolRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[28px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(3,18,14,0.92),rgba(2,8,10,0.96))] p-5 shadow-[0_24px_80px_-45px_rgba(16,185,129,0.55)]"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#79d7ac]">{row.label}</div>
                    <div className="mt-3 font-mono text-lg text-[#f2fff9]">{row.value}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="rounded-[34px] border border-red-400/20 bg-[linear-gradient(180deg,rgba(28,7,9,0.92),rgba(11,3,6,0.98))] p-6 shadow-[0_30px_100px_-55px_rgba(248,113,113,0.65)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-red-300">
                      <ShieldAlert className="h-4 w-4" />
                      Threat Banner
                    </div>
                    <h2 className="mt-4 text-2xl font-black uppercase tracking-[0.04em] text-[#fff4f4]">
                      Download At Your Own Risk
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-red-100/75 md:text-base">
                      Gatekeeper may challenge an unsigned local build. This package is for your controlled use, and the warning is intentional: once installed, the admin shell is built to feel like it watches every move, every click, and every operator action inside the portal.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-red-400/20 bg-black/30 px-4 py-3 font-mono text-xs uppercase tracking-[0.24em] text-red-300">
                    Live Risk Flag
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowWarning(true)}
                    size="lg"
                    className="h-14 rounded-2xl bg-[#f4f7fb] px-6 text-sm font-bold uppercase tracking-[0.2em] text-[#101722] hover:bg-white"
                  >
                    <FaApple className="mr-3 h-5 w-5" />
                    Download For macOS
                    <Download className="ml-3 h-5 w-5" />
                  </Button>
                  <div className="inline-flex items-center rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#8eddb6]">
                    DMG Payload • Admin-Only Runtime • Apple Silicon
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="rounded-[32px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(1,10,9,0.96),rgba(2,16,14,0.98))] p-5 shadow-[0_24px_100px_-55px_rgba(34,197,94,0.5)]">
                  <div className="flex items-center justify-between border-b border-emerald-400/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#77d8ab]">
                      live-terminal.feed
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 font-mono text-sm leading-7 text-[#b7f4cd]">
                    {terminalLines.slice(0, visibleLines).map((line, index) => (
                      <motion.div
                        key={`${line}-${index}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                      >
                        <span className="text-emerald-500">0{index + 1}</span>
                        <span>{line}</span>
                      </motion.div>
                    ))}
                    <motion.div
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-flex h-5 w-3 rounded-sm bg-emerald-400/80"
                    />
                  </div>
                </div>

                <div className="rounded-[32px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(3,11,17,0.94),rgba(1,8,14,0.98))] p-6 shadow-[0_24px_100px_-55px_rgba(34,211,238,0.45)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    <TerminalSquare className="h-4 w-4" />
                    Install Sequence
                  </div>
                  <div className="mt-5 space-y-3">
                    {commandRows.map((command) => (
                      <div key={command} className="rounded-2xl border border-white/5 bg-black/30 p-3 font-mono text-xs leading-6 text-[#d7fbf1]">
                        {command}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100/85">
                    If macOS blocks first launch, open the app from <span className="font-mono text-amber-200">Applications</span> with right click and choose <span className="font-mono text-amber-200">Open</span>, or remove quarantine with the command above.
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="sticky top-28 rounded-[34px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(3,18,14,0.92),rgba(1,6,8,0.98))] p-6 shadow-[0_30px_100px_-55px_rgba(16,185,129,0.55)]">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#76dbad]">
                    Runtime Profile
                  </div>
                  <div className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
                    ACTIVE
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/5 bg-black/30 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-[#78d8ae]">Primary Payload</div>
                      <div className="mt-2 text-2xl font-black text-[#f0fff7]">Abhishek Admin</div>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/95 text-[#0f172a]">
                      <FaApple className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#75d8ab]">Warning Posture</div>
                      <div className="mt-1 text-sm leading-6 text-[#d8fff0]">
                        Aggressive operator copy, hard warning states, and admin-only route guard.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">Download Source</div>
                      <div className="mt-1 break-all font-mono text-xs leading-6 text-cyan-50/90">
                        {downloadUrl}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-red-400/10 bg-red-500/5 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-red-300">Risk Notice</div>
                      <div className="mt-1 text-sm leading-6 text-red-50/85">
                        This package is intended for your controlled install path. Unsigned builds can trigger system warnings before first trust is granted.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/5 bg-black/30 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#7ad9af]">Operator Notes</div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[#bdeed5]">
                    <li className="flex gap-3">
                      <Lock className="mt-1 h-4 w-4 text-emerald-400" />
                      Opens straight into `/admin` and avoids exposing the full website inside the desktop runtime.
                    </li>
                    <li className="flex gap-3">
                      <AlertTriangle className="mt-1 h-4 w-4 text-red-400" />
                      Warning modal appears before download so the user explicitly accepts the risk posture.
                    </li>
                    <li className="flex gap-3">
                      <ArrowRight className="mt-1 h-4 w-4 text-cyan-400" />
                      Future releases can replace the DMG in the same URL without changing the landing page.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showWarning ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              className="w-full max-w-xl rounded-[32px] border border-red-400/25 bg-[linear-gradient(180deg,rgba(16,4,6,0.98),rgba(7,2,5,0.99))] p-6 shadow-[0_40px_120px_-55px_rgba(248,113,113,0.85)]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Final Warning
              </div>
              <h2 className="mt-5 text-3xl font-black uppercase tracking-[0.02em] text-[#fff6f6]">
                Download At Your Own Risk
              </h2>
              <p className="mt-4 text-sm leading-7 text-red-50/80 md:text-base">
                This admin package is built to feel invasive by design in tone, with warning-heavy language like “we are ready for your every move.” The DMG download starts only after explicit confirmation.
              </p>
              <div className="mt-5 rounded-[24px] border border-white/5 bg-black/30 p-4 font-mono text-xs leading-6 text-[#ffe0e0]">
                {isDownloading
                  ? `payload_init: confirmed\ncountdown: ${countdown}\nstatus: download dispatch armed`
                  : "payload_init: pending user approval\nstatus: no file transfer has started"}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => {
                    setIsDownloading(true);
                    setCountdown(3);
                  }}
                  disabled={isDownloading}
                  className="h-13 flex-1 rounded-2xl bg-[#f3f6fb] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#0f172a] hover:bg-white"
                >
                  <FaApple className="mr-3 h-5 w-5" />
                  {isDownloading ? `Dispatching In ${countdown}` : "Accept And Download"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowWarning(false);
                    setIsDownloading(false);
                    setCountdown(3);
                  }}
                  className="h-13 rounded-2xl border-red-400/25 bg-red-500/5 px-6 text-sm font-bold uppercase tracking-[0.18em] text-red-100 hover:bg-red-500/10"
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
