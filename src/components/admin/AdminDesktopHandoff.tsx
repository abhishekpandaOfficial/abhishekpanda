import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Command,
  Download,
  LayoutDashboard,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { getAdminDesktopDeepLink, getAdminDesktopDownloadUrl, isMacDesktopClient } from "@/lib/adminRuntime";

type AdminDesktopHandoffProps = {
  onContinueInBrowser: () => void;
};

const desktopSignals = [
  {
    icon: PanelLeft,
    title: "Mac-native navigation",
    description: "A persistent workspace shell with room for sidebars, dense tools, and faster context switching.",
  },
  {
    icon: Workflow,
    title: "Desktop-grade multitasking",
    description: "Built for analytics, publishing, security review, and long-running admin flows on wide and compact screens.",
  },
  {
    icon: ShieldCheck,
    title: "Safer admin sessions",
    description: "A dedicated desktop surface reduces accidental public-web crossover and keeps the operator flow focused.",
  },
];

export function AdminDesktopHandoff({ onContinueInBrowser }: AdminDesktopHandoffProps) {
  const downloadUrl = useMemo(() => getAdminDesktopDownloadUrl(), []);
  const isMac = useMemo(() => isMacDesktopClient(), []);

  const handleOpenDesktop = () => {
    const deepLink = getAdminDesktopDeepLink();
    window.location.href = deepLink;
    window.setTimeout(() => {
      toast.message("If the app did not open, install the macOS desktop build first.");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.18),transparent_26%),linear-gradient(160deg,#020617,#0f172a_48%,#111827)] text-slate-50">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:items-center">
          <section className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_32px_100px_-52px_rgba(15,23,42,0.95)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
              <Command className="h-4 w-4" />
              macOS admin workspace
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              /admin is now designed as a desktop-first control room.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              The public site stays on the web. The admin experience is being shaped as a dedicated macOS workspace so it can feel
              fast, focused, and dense enough for serious daily operations.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {desktopSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.8)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={handleOpenDesktop}
                className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                Open Desktop App
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>

              {downloadUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <a href={downloadUrl} target="_blank" rel="noreferrer">
                    Download macOS Build
                    <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}

              <Button
                variant="outline"
                onClick={onContinueInBrowser}
                className="h-12 rounded-2xl border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Continue in Browser
                <LayoutDashboard className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 text-sm text-slate-400">
              {isMac
                ? "This Mac is a good fit for the desktop build, especially for wide analytics and publishing workflows."
                : "The desktop build is optimized for macOS, while browser fallback remains available when needed."}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/10 bg-slate-950/40 p-5 shadow-[0_32px_100px_-52px_rgba(15,23,42,0.95)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <Sparkles className="h-4 w-4 text-sky-300" />
              Desktop preview
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
                  apple silicon
                </div>
              </div>

              <div className="grid min-h-[520px] grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[106px_minmax(0,1fr)]">
                <div className="border-r border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))] p-3">
                  <div className="space-y-3">
                    {["CC", "AN", "EB", "SE", "OP"].map((item, index) => (
                      <div
                        key={item}
                        className={`flex h-12 items-center justify-center rounded-2xl text-xs font-semibold ${
                          index === 0
                            ? "bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/20"
                            : "border border-white/10 bg-white/5 text-slate-300"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.98))]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-sky-200">Command Center</div>
                      <div className="mt-1 text-lg font-semibold text-white">Desktop operator view</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200">
                      Secure session
                    </div>
                  </div>

                  <div className="grid flex-1 gap-4 p-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Traffic</div>
                      <div className="mt-3 text-3xl font-black text-white">14.2k</div>
                      <div className="mt-2 text-sm text-slate-300">Live observation across the public network.</div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Publishing</div>
                      <div className="mt-3 text-3xl font-black text-white">8</div>
                      <div className="mt-2 text-sm text-slate-300">Queued releases and editorial operations.</div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:col-span-2">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Wide-screen productivity</div>
                      <div className="mt-3 space-y-3">
                        <div className="h-12 rounded-2xl bg-gradient-to-r from-sky-400/20 via-indigo-500/15 to-transparent" />
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
                          <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
                          <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
