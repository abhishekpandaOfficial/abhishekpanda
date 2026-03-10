import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Layers3, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { BLOG_SERIES, getBlogSeriesHref } from "@/lib/blogSeries";
import { getBlogSeriesVisual } from "@/lib/blogVisuals";

const MotionLink = motion.create(Link);

type BlogSeriesGridProps = {
  counts: Map<string, number>;
  selectedSlug?: string | null;
  seriesList?: typeof BLOG_SERIES;
};

export function BlogSeriesGrid({ counts, selectedSlug, seriesList = BLOG_SERIES }: BlogSeriesGridProps) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] lg:gap-6">
      {seriesList.map((series, index) => {
        const to = getBlogSeriesHref(series);
        const count = counts.get(series.slug) ?? 0;
        const isSelected = selectedSlug === series.slug;
        const visual = getBlogSeriesVisual(series, theme);

        return (
          <MotionLink
            key={series.slug}
            to={to}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, delay: index * 0.025 }}
            whileHover={{ y: -5, scale: 1.01 }}
            style={{ ["--series-rgb" as string]: series.rgb }}
            className={cn(
              "group relative isolate overflow-hidden rounded-[2rem] border bg-card/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 backdrop-blur-sm",
              "hover:border-primary/35 hover:shadow-[0_28px_90px_rgba(59,130,246,0.16)]",
              isSelected ? "border-primary/45 ring-1 ring-primary/30" : "border-border/60"
            )}
          >
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(var(--series-rgb), 0.28), transparent 40%), radial-gradient(circle at bottom left, rgba(var(--series-rgb), 0.18), transparent 32%), linear-gradient(140deg, rgba(var(--series-rgb), 0.08), transparent 35%, rgba(var(--series-rgb), 0.12))",
              }}
            />

            <div className="relative flex h-full flex-col">
              <div className={cn("relative aspect-[16/10] overflow-hidden sm:aspect-[5/3]", theme === "dark" ? "border-b border-white/10" : "border-b border-slate-900/10")}>
                <img src={visual} alt={series.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                <div
                  className={cn(
                    "absolute inset-0",
                    theme === "dark"
                      ? "bg-gradient-to-t from-slate-950/72 via-slate-950/18 to-transparent"
                      : "bg-gradient-to-t from-white/90 via-white/18 to-transparent"
                  )}
                />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div className="flex max-w-[80%] flex-wrap gap-1.5">
                    {series.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${series.slug}-header-tag-${tag}`}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          theme === "dark"
                            ? "border border-white/60 bg-black/30 text-white dark:border-white/35 dark:bg-white/20"
                            : "border border-slate-900/12 bg-white/82 text-slate-900 shadow-sm"
                        )}
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all group-hover:translate-x-1",
                      theme === "dark" ? "text-white/85 group-hover:text-white" : "text-slate-900/70 group-hover:text-slate-950"
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="editorial-card-title text-xl font-black text-foreground sm:text-[1.35rem]">{series.title}</h3>
                <p className="editorial-copy mt-2 text-sm leading-7 text-muted-foreground">{series.subtitle}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/85"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {series.logos.map((logo, logoIndex) => (
                    <span
                      key={`${series.slug}-${logoIndex}`}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/95 p-2 shadow-sm"
                    >
                      <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </span>
                  ))}
                </div>

                <div className="editorial-meta mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-primary/80" />
                    {count > 0 ? `${count} website chapter${count === 1 ? "" : "s"}` : "Mastery Series"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                    {series.actionLabel || "Open Guide"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </MotionLink>
        );
      })}
    </div>
  );
}
