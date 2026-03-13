import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ResourceHubMetric = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type ResourceHubCard = {
  title: string;
  description: string;
  to?: string;
  icon: LucideIcon;
  logoSrc?: string;
  logoAlt?: string;
  tags: string[];
  eyebrow?: string;
  ctaLabel?: string;
  statusLabel?: string;
  disabled?: boolean;
};

type ResourceHubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    to: string;
  };
  secondaryAction?: {
    label: string;
    to: string;
  };
  metrics: ResourceHubMetric[];
  cards: ResourceHubCard[];
  sectionTitle: string;
  sectionDescription: string;
};

export function ResourceHubPage({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  metrics,
  cards,
  sectionTitle,
  sectionDescription,
}: ResourceHubPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-8 md:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  {eyebrow}
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{description}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to={primaryAction.to}>
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  {secondaryAction ? (
                    <Button variant="outline" asChild>
                      <Link to={secondaryAction.to}>
                        {secondaryAction.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <Icon className="h-4 w-4" />
                        {metric.label}
                      </div>
                      <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{metric.value}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <section className="mt-10">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Explore</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{sectionTitle}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{sectionDescription}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon;
                const isStackCraft = card.title === "StackCraft";
                const cardKey = `${card.to || card.title}-${card.title}`;
                const tagPalette = [
                  "border-sky-300/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                  "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                  "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                ];
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                            {card.eyebrow || eyebrow}
                          </div>
                          {card.statusLabel ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {card.statusLabel}
                            </div>
                          ) : null}
                        </div>
                        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">{card.title}</h3>
                      </div>
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border p-2 text-primary",
                          isStackCraft
                            ? "border-sky-400/30 bg-gradient-to-br from-sky-500/18 via-blue-500/10 to-cyan-400/16 shadow-[0_18px_34px_rgba(59,109,240,0.18)]"
                            : "border-border/60 bg-background/90",
                        )}
                      >
                        {card.logoSrc ? (
                          <img
                            src={card.logoSrc}
                            alt={card.logoAlt || `${card.title} logo`}
                            className="h-8 w-8 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">{card.description}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.tags.map((tag, tagIndex) => (
                        <span
                          key={`${card.title}-${tag}`}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            tagPalette[(tagIndex + card.title.length) % tagPalette.length]
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${card.disabled ? "text-muted-foreground" : "text-primary"}`}>
                      {card.ctaLabel || (card.disabled ? "Coming soon" : "Open")}
                      {!card.disabled ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /> : null}
                    </div>
                  </>
                );

                if (card.to && !card.disabled) {
                  return (
                    <Link
                      key={cardKey}
                      to={card.to}
                      className={cn(
                        "group rounded-[1.75rem] border p-6 transition",
                        isStackCraft
                          ? "border-sky-400/20 bg-[radial-gradient(circle_at_top_right,rgba(59,109,240,0.16),transparent_32%),linear-gradient(160deg,rgba(10,18,34,0.96),rgba(14,27,48,0.9))] hover:border-sky-300/40 hover:shadow-[0_30px_68px_rgba(59,109,240,0.14)]"
                          : "border-border/60 bg-card/80 hover:border-primary/30 hover:bg-card",
                      )}
                    >
                      {cardContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={cardKey}
                    className="rounded-[1.75rem] border border-dashed border-border/60 bg-card/70 p-6"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
