import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ARTICLE_HUB_ICONS } from "@/content/articles";

type ArticlesHeaderProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export default function ArticlesHeader({
  title = "Articles",
  subtitle = "Route-based editorial notes, dashboards, and long-form explainers.",
  compact = false,
}: ArticlesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 ${
        compact ? "p-6" : "p-8 md:p-10"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="editorial-kicker mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-primary">
            <Newspaper className="h-4 w-4" />
            Articles Hub
          </div>
          <h1 className={`editorial-title ${compact ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl"} font-black text-foreground`}>
            {title}
          </h1>
          <p className="editorial-copy mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="flex items-center gap-2">
            {ARTICLE_HUB_ICONS.map((Icon, index) => (
              <span
                key={index}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur"
              >
                <Icon className="h-5 w-5 text-foreground/80" />
              </span>
            ))}
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_40px_rgba(59,130,246,0.18)] transition hover:translate-y-[-1px] hover:bg-primary/90"
          >
            Open Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
