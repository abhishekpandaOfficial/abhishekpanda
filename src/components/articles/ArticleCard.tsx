import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { FEATURED_ARTICLE_ICON, type ArticleLogo, type ArticleRecord } from "@/content/articles";

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

const CARD_THEMES = [
  {
    border: "border-cyan-400/50",
    glow: "shadow-[0_28px_70px_-42px_rgba(34,211,238,0.52)]",
    heroTint: "from-cyan-500/30 via-sky-500/18 to-slate-950/80",
    surface: "from-cyan-500/10 via-transparent to-transparent",
    tag: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-100",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-cyan-300/25 dark:bg-cyan-400/12 dark:text-cyan-50",
    button: "bg-cyan-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-cyan-200/30 dark:bg-cyan-300/18 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_34%),linear-gradient(135deg,transparent,rgba(34,211,238,0.08))]",
  },
  {
    border: "border-amber-400/50",
    glow: "shadow-[0_28px_70px_-42px_rgba(251,191,36,0.48)]",
    heroTint: "from-amber-500/28 via-orange-500/16 to-slate-950/80",
    surface: "from-amber-500/10 via-transparent to-transparent",
    tag: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-amber-200/25 dark:bg-amber-300/12 dark:text-amber-50",
    button: "bg-amber-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-amber-200/35 dark:bg-amber-400/20 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,transparent,rgba(249,115,22,0.08))]",
  },
  {
    border: "border-fuchsia-400/45",
    glow: "shadow-[0_28px_70px_-42px_rgba(232,121,249,0.48)]",
    heroTint: "from-fuchsia-500/28 via-violet-500/18 to-slate-950/82",
    surface: "from-fuchsia-500/10 via-transparent to-transparent",
    tag: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-400/10 dark:text-fuchsia-50",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-fuchsia-200/25 dark:bg-fuchsia-300/12 dark:text-fuchsia-50",
    button: "bg-fuchsia-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-fuchsia-200/30 dark:bg-fuchsia-300/18 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_bottom_left,rgba(232,121,249,0.22),transparent_34%),linear-gradient(135deg,transparent,rgba(168,85,247,0.10))]",
  },
  {
    border: "border-emerald-400/45",
    glow: "shadow-[0_28px_70px_-42px_rgba(52,211,153,0.45)]",
    heroTint: "from-emerald-500/26 via-teal-500/16 to-slate-950/82",
    surface: "from-emerald-500/10 via-transparent to-transparent",
    tag: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-50",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-emerald-200/25 dark:bg-emerald-300/12 dark:text-emerald-50",
    button: "bg-emerald-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-emerald-200/30 dark:bg-emerald-300/18 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.20),transparent_36%),linear-gradient(135deg,transparent,rgba(45,212,191,0.08))]",
  },
  {
    border: "border-rose-400/45",
    glow: "shadow-[0_28px_70px_-42px_rgba(251,113,133,0.48)]",
    heroTint: "from-rose-500/28 via-pink-500/18 to-slate-950/82",
    surface: "from-rose-500/10 via-transparent to-transparent",
    tag: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-50",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-rose-200/25 dark:bg-rose-300/12 dark:text-rose-50",
    button: "bg-rose-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-rose-200/30 dark:bg-rose-300/18 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_top_center,rgba(251,113,133,0.22),transparent_34%),linear-gradient(135deg,transparent,rgba(244,114,182,0.08))]",
  },
  {
    border: "border-indigo-400/45",
    glow: "shadow-[0_28px_70px_-42px_rgba(129,140,248,0.5)]",
    heroTint: "from-indigo-500/28 via-blue-500/18 to-slate-950/82",
    surface: "from-indigo-500/10 via-transparent to-transparent",
    tag: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-50",
    meta: "border-white/30 bg-slate-950/40 text-white shadow-sm dark:border-indigo-200/25 dark:bg-indigo-300/12 dark:text-indigo-50",
    button: "bg-indigo-300 text-slate-950",
    badge: "border-white/30 bg-slate-950/50 text-white shadow-sm dark:border-indigo-200/30 dark:bg-indigo-300/18 dark:text-white",
    pattern: "bg-[radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.22),transparent_34%),linear-gradient(135deg,transparent,rgba(59,130,246,0.08))]",
  },
];

const hashSlug = (value: string) =>
  value.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

const formatReadTime = (minutes: number) => `${minutes} min read`;

const formatPublishedDate = (value: string) => {
  const parsed = parsePublishedAt(value);
  return parsed
    ? parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : value;
};

const renderLogo = (logo: ArticleLogo, index: number) => {
  const Icon = logo.icon;

  return (
    <div
      key={`${logo.name}-${index}`}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur-sm ${logo.bgClass}`}
      title={logo.name}
    >
      {logo.imageSrc ? (
        <img src={logo.imageSrc} alt={logo.name} className="h-5 w-5 object-contain" loading="lazy" decoding="async" />
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${logo.colorClass || "text-foreground"}`} />
      ) : (
        <span className={`text-xs font-bold ${logo.colorClass || "text-foreground"}`}>{logo.name.slice(0, 1)}</span>
      )}
    </div>
  );
};

export default function ArticleCard({ article, featured = false, variant }: ArticleCardProps) {
  const cardVariant = variant ?? (featured ? "spotlight" : "grid");
  const isSpotlight = cardVariant === "spotlight";
  const visibleTags = article.tags.slice(0, isSpotlight ? 5 : 4);
  const visibleLogos = article.logos.slice(0, isSpotlight ? 3 : 2);
  const isNew = isRecentArticle(article.publishedAt);
  const FeaturedIcon = FEATURED_ARTICLE_ICON;
  const theme = CARD_THEMES[hashSlug(article.slug) % CARD_THEMES.length];

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="h-full">
      <Link
        to={`/articles/${article.slug}`}
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border bg-white/95 transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:bg-slate-950/90 ${
          theme.border
        } ${theme.glow} ${isSpotlight ? "min-h-[430px]" : "min-h-[420px]"}`}
      >
        <div className={`absolute inset-0 opacity-70 dark:opacity-90 ${theme.pattern}`} />
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.surface}`} />

        <div className={`relative aspect-[16/10] w-full overflow-hidden ${isSpotlight ? "min-h-[240px]" : "min-h-[220px]"}`}>
          <img
          src={article.heroImage}
          alt={article.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
          loading="lazy"
          decoding="async"
        />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.heroTint}`} />
          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md ${theme.meta}`}>
              {article.eyebrow}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {article.featured ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md ${theme.badge}`}>
                  <FeaturedIcon className="h-3.5 w-3.5" />
                  Featured
                </span>
              ) : null}
              {isNew ? (
                <span className="rounded-full border border-white/40 bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm backdrop-blur-md dark:border-cyan-200/30 dark:bg-slate-950/72 dark:text-cyan-50">
                  New
                </span>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {visibleLogos.map(renderLogo)}
            </div>
            <div className={`hidden rounded-full border px-3 py-1 text-[11px] font-semibold md:inline-flex ${theme.meta}`}>
              {article.heroLabel}: {article.heroValue}
            </div>
          </div>
        </div>

        <div className={`relative flex flex-1 flex-col p-5 ${isSpotlight ? "md:p-6" : "md:p-5"}`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className={`editorial-card-title line-clamp-2 text-foreground ${isSpotlight ? "text-2xl md:text-[30px]" : "text-xl"}`}>
              {article.title}
            </h2>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-foreground/55 transition group-hover:translate-x-1 group-hover:text-foreground" />
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span key={tag} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${theme.tag}`}>
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 pt-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatPublishedDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatReadTime(article.readMinutes)}
              </span>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition group-hover:scale-[1.02] ${theme.button}`}>
              Open article
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
