import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Eye, Lock } from "lucide-react";
import { titleCaseLevel, type BlogIndexRow } from "@/hooks/usePublishedPersonalBlogs";

type BlogPostCardProps = {
  post: BlogIndexRow;
  index?: number;
  getTagStyle?: (tag: string) => CSSProperties | undefined;
};

const getReadTime = (minutes: number | null | undefined) => {
  const m = typeof minutes === "number" && Number.isFinite(minutes) ? minutes : 5;
  return `${Math.max(1, Math.round(m))} min`;
};

const viewCountFromRow = (row: BlogIndexRow) => {
  const v = row.views;
  return typeof v === "number" ? v : 0;
};

const updatedAtFromRow = (row: BlogIndexRow) => {
  const v = row.updated_at;
  return typeof v === "string" ? v : null;
};

const originalPublishedAtFromRow = (row: BlogIndexRow) => {
  const v = row.original_published_at;
  if (typeof v === "string") return v;
  return typeof row.published_at === "string" ? row.published_at : null;
};

export function BlogPostCard({ post, index = 0, getTagStyle }: BlogPostCardProps) {
  const level = titleCaseLevel(post.level || "general");
  const originalPublishedAt = originalPublishedAtFromRow(post);
  const updatedAt = updatedAtFromRow(post);
  const wasUpdated =
    !!updatedAt &&
    !!originalPublishedAt &&
    new Date(updatedAt).getTime() > new Date(originalPublishedAt).getTime();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/blog/${post.slug}`} className="block group">
        <div className={`glass-card-hover rounded-2xl overflow-hidden h-full border border-border/70 hover:border-primary/35 ${post.is_premium ? "relative" : ""}`}>
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20 relative overflow-hidden">
            {post.hero_image ? (
              <img src={post.hero_image} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black gradient-text opacity-30">
                  {post.tags?.[0]?.charAt(0) || "B"}
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-full text-[11px] font-semibold border border-primary/30 bg-primary/15 text-primary">
                {level}
              </span>
              {post.is_premium ? (
                <span className="badge-premium">
                  <Lock className="w-3 h-3" />
                  Premium
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {post.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full border text-xs font-semibold"
                    style={getTagStyle?.(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <h2 className="font-bold text-lg md:text-xl text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.3rem]">
              {post.title}
            </h2>

            {post.excerpt ? (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 min-h-[3.8rem]">{post.excerpt}</p>
            ) : null}

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 flex-wrap">
                {originalPublishedAt ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs">
                    <Calendar className="w-4 h-4" />
                    {new Date(originalPublishedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs">
                  <Clock className="w-4 h-4" />
                  {getReadTime(post.reading_time_minutes)} read
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs">
                  <Eye className="w-4 h-4" />
                  {viewCountFromRow(post).toLocaleString()}
                </span>
              </div>
              {wasUpdated ? (
                <p className="text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(updatedAt!).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-end">
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
