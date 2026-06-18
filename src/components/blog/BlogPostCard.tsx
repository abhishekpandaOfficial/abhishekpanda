import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Eye, Lock } from "lucide-react";
import { titleCaseLevel, type BlogIndexRow } from "@/hooks/usePublishedPersonalBlogs";
import { getBlogPostVisual } from "@/lib/blogVisuals";

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

const CARD_RGB_PALETTE = [
  "59 130 246",
  "16 185 129",
  "249 115 22",
  "168 85 247",
  "236 72 153",
  "14 165 233",
];

const STACK_LOGO_RULES: Array<{ match: RegExp; logo: string; alt: string }> = [
  { match: /\bc#|dotnet|\.net|asp\.net\b/i, logo: "/brand-logos/stacks/dotnet.svg", alt: ".NET" },
  { match: /\bc#\b/i, logo: "/brand-logos/stacks/csharp.svg", alt: "C#" },
  { match: /\btypescript|ts\b/i, logo: "/brand-logos/stacks/typescript.svg", alt: "TypeScript" },
  { match: /\bjavascript|js\b/i, logo: "/brand-logos/stacks/javascript.svg", alt: "JavaScript" },
  { match: /\breact\b/i, logo: "/brand-logos/stacks/react.svg", alt: "React" },
  { match: /\bnext\.?js\b/i, logo: "/brand-logos/stacks/nextjs.svg", alt: "Next.js" },
  { match: /\bangular\b/i, logo: "/brand-logos/stacks/angular.svg", alt: "Angular" },
  { match: /\bvue\b/i, logo: "/brand-logos/stacks/vue.svg", alt: "Vue" },
  { match: /\bpython\b/i, logo: "/brand-logos/stacks/python.svg", alt: "Python" },
  { match: /\baws\b/i, logo: "/brand-logos/stacks/aws.svg", alt: "AWS" },
  { match: /\bazure\b/i, logo: "/brand-logos/stacks/microsoftazure.svg", alt: "Azure" },
  { match: /\bgcp|google cloud\b/i, logo: "/brand-logos/stacks/gcp.svg", alt: "GCP" },
  { match: /\bkubernetes|k8s\b/i, logo: "/brand-logos/stacks/kubernetes.svg", alt: "Kubernetes" },
  { match: /\bdocker\b/i, logo: "/brand-logos/stacks/docker.svg", alt: "Docker" },
  { match: /\bterraform\b/i, logo: "/brand-logos/stacks/terraform.svg", alt: "Terraform" },
  { match: /\bkafka|event streaming|producer|consumer|partition\b/i, logo: "/brand-logos/stacks/kafka.svg", alt: "Kafka" },
  { match: /\bpostgres|postgresql\b/i, logo: "/brand-logos/stacks/postgresql.svg", alt: "PostgreSQL" },
  { match: /\bmongodb|mongo\b/i, logo: "/brand-logos/stacks/mongodb.svg", alt: "MongoDB" },
  { match: /\bredis\b/i, logo: "/brand-logos/stacks/redis.svg", alt: "Redis" },
  { match: /\bopenai|gpt\b/i, logo: "/brand-logos/stacks/openai.svg", alt: "OpenAI" },
  { match: /\bhugging ?face\b/i, logo: "/brand-logos/stacks/huggingface.svg", alt: "Hugging Face" },
  { match: /\btensorflow\b/i, logo: "/brand-logos/stacks/tensorflow.svg", alt: "TensorFlow" },
  { match: /\bpytorch\b/i, logo: "/brand-logos/stacks/pytorch.svg", alt: "PyTorch" },
  { match: /\bscikit|scikit-learn\b/i, logo: "/brand-logos/stacks/scikitlearn.svg", alt: "Scikit-learn" },
];

const TAG_STYLES = [
  "border-sky-400/50 bg-sky-500/15 text-sky-100 dark:text-sky-100",
  "border-emerald-400/50 bg-emerald-500/15 text-emerald-100 dark:text-emerald-100",
  "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-100 dark:text-fuchsia-100",
  "border-amber-400/50 bg-amber-500/15 text-amber-100 dark:text-amber-100",
  "border-cyan-400/50 bg-cyan-500/15 text-cyan-100 dark:text-cyan-100",
  "border-violet-400/50 bg-violet-500/15 text-violet-100 dark:text-violet-100",
];

export function BlogPostCard({ post, index = 0, getTagStyle }: BlogPostCardProps) {
  const level = titleCaseLevel(post.level || "general");
  const brandRgb = CARD_RGB_PALETTE[index % CARD_RGB_PALETTE.length];
  const serial = String((index % 99) + 1).padStart(2, "0");
  const topTags = (post.tags || []).slice(0, 2);
  const rightMeta = (post.tags || []).slice(2, 5);
  const originalPublishedAt = originalPublishedAtFromRow(post);
  const updatedAt = updatedAtFromRow(post);
  const wasUpdated =
    !!updatedAt &&
    !!originalPublishedAt &&
    new Date(updatedAt).getTime() > new Date(originalPublishedAt).getTime();
  const source = `${post.title} ${post.excerpt || ""} ${(post.tags || []).join(" ")}`;
  const techLogos = STACK_LOGO_RULES.filter((rule) => rule.match.test(source)).slice(0, 3);
  const coverImage = getBlogPostVisual(post);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ ["--brand-rgb" as string]: brandRgb }}
    >
      <Link to={`/blog/${post.slug}`} className="block group">
        <div
          className={`glass-card-hover brand-glow-card brand-square-glow rounded-2xl overflow-hidden h-full border border-border/70 hover:border-primary/35 ${post.is_premium ? "relative" : ""}`}
        >
          <div
            className="aspect-video relative overflow-hidden"
          >
            <img
              src={coverImage}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div
              className="absolute inset-0 opacity-18 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45 dark:from-black/10 dark:via-transparent dark:to-black/35" />

            <div className="editorial-title absolute right-4 top-2 text-4xl font-black text-white/40 dark:text-white/28">
              {serial}
            </div>

            <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
              {topTags.length ? (
                topTags.map((tag) => (
                  <span
                    key={tag}
                    className="editorial-kicker rounded-md border border-white/55 bg-black/30 px-2 py-1 text-white backdrop-blur-sm dark:border-white/35 dark:bg-white/20"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="editorial-kicker rounded-md border border-white/55 bg-black/30 px-2 py-1 text-white backdrop-blur-sm dark:border-white/35 dark:bg-white/20">
                  BLOG
                </span>
              )}
            </div>

            <div className="editorial-kicker absolute right-3 bottom-3 hidden md:flex items-center gap-2 text-white">
              {(rightMeta.length ? rightMeta : [level, "Read", "Series"]).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            {techLogos.length ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                {techLogos.map((item) => (
                  <span
                    key={`${post.slug}-${item.logo}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-black/25 p-1.5 dark:border-white/40 dark:bg-white/20"
                    title={item.alt}
                  >
                    <img src={item.logo} alt={item.alt} className="h-full w-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>
            ) : null}

            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
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
                    className={`px-2 py-1 rounded-full border text-xs font-semibold ${TAG_STYLES[Math.abs(tag.length + index) % TAG_STYLES.length]}`}
                    style={
                      getTagStyle?.(tag) || {
                        borderColor: `rgba(${brandRgb},0.35)`,
                        color: "rgb(255 255 255)",
                        backgroundColor: `rgba(${brandRgb},0.12)`,
                      }
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <h2 className="editorial-card-title text-lg md:text-xl text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.3rem]">
              {post.title}
            </h2>

            {post.excerpt ? (
              <p className="editorial-copy text-muted-foreground text-sm mb-4 line-clamp-3 min-h-[3.8rem]">{post.excerpt}</p>
            ) : null}

            <div className="editorial-meta space-y-2 text-sm text-muted-foreground">
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
