import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOG_SERIES, getBlogSeriesHref } from "@/lib/blogSeries";

const MotionLink = motion.create(Link);

type BlogSeriesGridProps = {
  counts: Map<string, number>;
  selectedSlug?: string | null;
  seriesList?: typeof BLOG_SERIES;
};

export function BlogSeriesGrid({ counts, selectedSlug, seriesList = BLOG_SERIES }: BlogSeriesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {seriesList.map((series, index) => {
        const to = getBlogSeriesHref(series);
        const count = counts.get(series.slug) ?? 0;
        const isSelected = selectedSlug === series.slug;

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
              "group relative overflow-hidden rounded-[1.75rem] border bg-card/80 p-5 shadow-sm transition-all duration-300 brand-glow-card brand-square-glow",
              "hover:border-primary/35 hover:shadow-[0_24px_80px_rgba(59,130,246,0.16)]",
              isSelected ? "border-primary/45 ring-1 ring-primary/30" : "border-border/60"
            )}
          >
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(var(--series-rgb), 0.28), transparent 40%), radial-gradient(circle at bottom left, rgba(var(--series-rgb), 0.18), transparent 32%), linear-gradient(140deg, rgba(var(--series-rgb), 0.08), transparent 35%, rgba(var(--series-rgb), 0.12))",
              }}
            />

            <div className="relative flex h-full flex-col">
              <div
                className="relative mb-4 overflow-hidden rounded-2xl border border-white/20 p-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(var(--series-rgb),0.92) 0%, rgba(var(--series-rgb),0.72) 40%, rgba(var(--series-rgb),0.56) 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-30 dark:opacity-25 bg-[linear-gradient(rgba(15,23,42,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.2)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:16px_16px]"
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-black/35 text-sm font-black text-white dark:border-white/40 dark:bg-white/15">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {series.logos.slice(0, 2).map((logo, logoIndex) => (
                      <span
                        key={`${series.slug}-header-${logoIndex}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-black/30 p-1.5 backdrop-blur-sm dark:border-white/40 dark:bg-white/20"
                      >
                        <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {series.tags.slice(0, 2).map((tag) => (
                      <span
                        key={`${series.slug}-header-tag-${tag}`}
                        className="rounded-md border border-white/60 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white dark:border-white/35 dark:bg-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-white/85 transition-all group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {series.logos.map((logo, logoIndex) => (
                  <span
                    key={`${series.slug}-${logoIndex}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 p-1.5 shadow-sm"
                  >
                    <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>

              <h3 className="editorial-card-title mt-4 text-xl font-black text-foreground">{series.title}</h3>
              <p className="editorial-copy mt-2 min-h-[4rem] text-sm text-muted-foreground">{series.subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {series.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="editorial-meta mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-primary/80" />
                  {count > 0 ? `${count} website chapter${count === 1 ? "" : "s"}` : "TOC ready"}
                </span>
                <span className="font-semibold text-foreground">{series.actionLabel || "Open TOC"}</span>
              </div>
            </div>
          </MotionLink>
        );
      })}
    </div>
  );
}
