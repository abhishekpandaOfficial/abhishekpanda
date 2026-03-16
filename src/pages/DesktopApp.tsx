import { Download, HardDriveDownload, MonitorSmartphone, ShieldCheck, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getAdminDesktopDownloadUrl } from "@/lib/adminRuntime";

const signals = [
  {
    icon: MonitorSmartphone,
    title: "Desktop-first admin",
    description: "Built for large-screen analytics, editorial operations, publishing, and security review workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Admin-only runtime",
    description: "The desktop app opens directly into the protected admin workspace instead of exposing the full public website.",
  },
  {
    icon: Sparkles,
    title: "macOS feel",
    description: "A dedicated shell tailored for Apple Silicon Macs with denser navigation and a focused operator experience.",
  },
];

export default function DesktopApp() {
  const downloadUrl = getAdminDesktopDownloadUrl();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24">
        <section className="relative overflow-hidden border-b border-border/50 px-4 py-16 md:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <HardDriveDownload className="h-4 w-4" />
                Desktop Download
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Download the Abhishek Admin desktop app for macOS.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                Install the Apple Silicon desktop build to open directly into the admin workspace with the dedicated macOS operator shell.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl px-6">
                  <a href={downloadUrl}>
                    <Download className="mr-2 h-5 w-5" />
                    Download for macOS
                  </a>
                </Button>
                <div className="inline-flex items-center rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                  Apple Silicon · Admin-only app · DMG install
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {signals.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
