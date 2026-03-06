import { motion } from "framer-motion";
import { ArrowRight, Clock3, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import type { ArticleRecord } from "@/content/articles";

type ArticleCardProps = {
  article: ArticleRecord;
  featured?: boolean;
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const hasBrandStrip = article.tags.includes("Case Studies") && article.logos.length > 4;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 backdrop-blur-xl ${
        featured ? "lg:grid lg:grid-cols-[1.25fr_0.95fr]" : ""
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_30%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      <div className={`relative flex flex-col ${featured ? "justify-between p-8 md:p-10" : "p-6"}`}>
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              {article.eyebrow}
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
              {article.heroLabel}: {article.heroValue}
            </span>
          </div>

          <h2 className={`${featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"} font-black tracking-tight text-foreground`}>
            {article.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{article.description}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-semibold text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {article.publishedAt}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {article.readMinutes} min read
          </span>
        </div>
      </div>

      <div className={`relative border-t border-border/60 ${featured ? "lg:border-l lg:border-t-0" : ""}`}>
        <div className={`flex h-full flex-col justify-between ${featured ? "p-8" : "p-6"}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              {hasBrandStrip ? "Featured Systems" : "Stack & Signals"}
            </p>
            <div className={`mt-4 flex flex-wrap ${hasBrandStrip ? "gap-2.5" : "gap-3"}`}>
              {article.logos.map((logo) => {
                return (
                  <span
                    key={logo.name}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 font-semibold ${
                      hasBrandStrip ? "text-xs" : "text-sm"
                    } ${logo.bgClass}`}
                  >
                    {logo.imageSrc ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 ring-1 ring-white/10">
                        <img src={logo.imageSrc} alt={`${logo.name} logo`} className="h-3.5 w-3.5 object-contain" loading="lazy" />
                      </span>
                    ) : logo.icon ? (
                      <logo.icon className={`h-4 w-4 ${logo.colorClass || "text-foreground"}`} />
                    ) : null}
                    <span className="text-foreground">{logo.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {article.keyPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground/85"
              >
                {point}
              </div>
            ))}
          </div>

          <Link
            to={`/articles/${article.slug}`}
            className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:bg-primary/90"
          >
            Read article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
