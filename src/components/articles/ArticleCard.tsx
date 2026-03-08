import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ArticleRecord } from "@/content/articles";

type ArticleCardProps = {
  article: ArticleRecord;
  featured?: boolean;
  variant?: "spotlight" | "grid";
};

const parsePublishedAt = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isRecentArticle = (value: string) => {
  const published = parsePublishedAt(value);
  if (!published) return false;
  const now = new Date();
  return now.getTime() - published.getTime() <= 1000 * 60 * 60 * 24 * 14;
};

export default function ArticleCard({ article, featured = false, variant }: ArticleCardProps) {
  const cardVariant = variant ?? (featured ? "spotlight" : "grid");
  const isSpotlight = cardVariant === "spotlight";
  const visibleTags = article.tags.slice(0, isSpotlight ? 3 : 2);
  const isNew = isRecentArticle(article.publishedAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-border/60 bg-card/95 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] ${
        isSpotlight ? "min-h-[430px]" : "min-h-[420px]"
      }`}
    >
      <div className={`relative aspect-[16/10] w-full overflow-hidden ${isSpotlight ? "min-h-[240px]" : "min-h-[220px]"}`}>
        <img
          src={article.heroImage}
          alt={article.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/12 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
            {article.eyebrow}
          </span>
          {isNew ? (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-500/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              New
            </span>
          ) : null}
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-5 ${isSpotlight ? "md:p-6" : "md:p-5"}`}>
        <div className="flex min-h-[56px] items-start">
          <h2 className={`editorial-card-title line-clamp-2 text-foreground ${isSpotlight ? "text-2xl md:text-[30px]" : "text-xl"}`}>
            {article.title}
          </h2>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-sky-500/15 bg-sky-500/8 px-3 py-1 text-[11px] font-semibold text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:translate-y-[-1px] hover:opacity-90"
          >
            Read article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
