import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOG_SERIES } from "@/lib/blogSeries";

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
        const to = `/blogs/${series.slug}`;
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
              "group relative overflow-hidden rounded-[1.75rem] border bg-card/80 p-5 shadow-sm transition-all duration-300",
              "hover:border-primary/35 hover:shadow-[0_24px_80px_rgba(59,130,246,0.12)]",
              isSelected ? "border-primary/45 ring-1 ring-primary/30" : "border-border/60"
            )}
          >
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(var(--series-rgb), 0.16), transparent 36%), radial-gradient(circle at bottom left, rgba(var(--series-rgb), 0.12), transparent 28%)",
              }}
            />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/90 text-sm font-black text-foreground">
                  {index + 1}
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-primary/70 transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                {series.logos.map((logo, logoIndex) => (
                  <span
                    key={`${series.slug}-${logoIndex}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/95 p-1.5 shadow-sm"
                  >
                    <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>

              <h3 className="mt-4 text-xl font-black tracking-tight text-foreground">{series.title}</h3>
              <p className="mt-2 min-h-[4rem] text-sm leading-6 text-muted-foreground">{series.subtitle}</p>

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

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-primary/80" />
                  {count > 0 ? `${count} website post${count === 1 ? "" : "s"}` : "Series route ready"}
                </span>
                <span className="font-semibold text-foreground">Read Series</span>
              </div>
            </div>
          </MotionLink>
        );
      })}
    </div>
  );
}
