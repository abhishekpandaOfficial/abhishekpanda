import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChronyxLogo } from "@/components/ui/ChronyxLogo";
import { ArrowRight, Shield, Sparkles, NotebookPen, Wallet, GraduationCap, Database } from "lucide-react";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.abhishekpanda.com";

export default function Chronyx() {
  const canonical = `${SITE_URL.replace(/\/$/, "")}/chronyx`;
  const title = "CHRONYX | A Quiet Space for Your Life (Personal System of Record)";
  const description =
    "CHRONYX is a calm, private personal space for notes, planning, finance tracking, and life organization. Built under OriginX Labs with an obsession for clarity and speed.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CHRONYX",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description,
    url: "https://www.getchronyx.com",
    publisher: {
      "@type": "Organization",
      name: "OriginX Labs Pvt. Ltd.",
      url: "https://www.originxlabs.com",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(120,120,255,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_15%_35%,rgba(45,212,191,0.16),transparent_50%),radial-gradient(ellipse_70%_50%_at_85%_40%,rgba(59,130,246,0.14),transparent_55%)]" />
          <div className="relative container mx-auto px-4 py-14 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex justify-center">
                  <ChronyxLogo size="lg" imageClassName="h-12 w-12 md:h-14 md:w-14" className="ring-slate-100/50" />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border/50">
                  <ChronyxLogo compact size="sm" imageClassName="h-5 w-5" />
                  <span className="text-sm font-semibold text-foreground">by OriginX Labs</span>
                </div>

                <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight">
                  A <span className="gradient-text">Quiet Space</span> for Your Life
                </h1>
                <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Personal system of record. Study planner. Finance tracker. AI-powered notes.
                  Designed for focus, privacy, and everyday reliability.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Button variant="hero" size="xl" asChild>
                  <a href="https://www.getchronyx.com" target="_blank" rel="noopener noreferrer">
                    Visit CHRONYX
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/contact">
                    Talk to me
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
              >
                {[
                  { icon: Database, title: "System of Record", desc: "Capture decisions, notes, and context that stays searchable." },
                  { icon: GraduationCap, title: "Study Planner", desc: "Plan sprints, track progress, and keep momentum predictable." },
                  { icon: Wallet, title: "Finance Tracker", desc: "Track spending and habits with clarity, not noise." },
                  { icon: NotebookPen, title: "AI Notes", desc: "Turn scattered inputs into structured summaries and next steps." },
                ].map((f) => (
                  <div key={f.title} className="glass-card-hover rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3">
                      <f.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="font-bold text-foreground">{f.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Calm by design
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                CHRONYX is intentionally minimal. The goal is to keep your life organized without turning your attention into a product.
                You get structure, speed, and a clean mental surface area.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Shield, title: "Privacy-first", desc: "Built with a bias toward data safety and control." },
                  { icon: Sparkles, title: "Low-friction UX", desc: "Everything should feel instant and obvious." },
                ].map((x) => (
                  <div key={x.title} className="rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center gap-2">
                      <x.icon className="w-4 h-4 text-primary" />
                      <div className="font-semibold text-foreground text-sm">{x.title}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{x.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(59,130,246,0.6),rgba(45,212,191,0.45),rgba(168,85,247,0.55),rgba(59,130,246,0.6))]" />
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Built with OriginX Labs</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  CHRONYX is a flagship collaboration between Abhishek Panda and OriginX Labs Pvt. Ltd. The mission is simple:
                  a personal, quiet space where you can plan, write, track, and build your life system.
                </p>
                <div className="mt-6">
                  <Button variant="glass" size="lg" asChild>
                    <a href="https://www.originxlabs.com" target="_blank" rel="noopener noreferrer">
                      Explore OriginX Labs
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
