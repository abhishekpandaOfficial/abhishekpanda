import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock3, Newspaper, Brain, Link as LinkIcon, Sparkles } from "lucide-react";
import type { LLMModel } from "@/hooks/useLLMModels";
import { useLLMNews } from "@/hooks/useLLMNews";
import { supabase } from "@/integrations/supabase/client";

function hoursAgo(iso: string): number {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - ts) / 36e5);
}

function asDateLabel(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stripHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTag(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("open source") || t.includes("open-weight")) return "Open Source";
  if (t.includes("reason") || t.includes("math")) return "Reasoning";
  if (t.includes("code") || t.includes("agent")) return "Coding/Agents";
  if (t.includes("video") || t.includes("image") || t.includes("multimodal")) return "Multimodal";
  if (t.includes("voice") || t.includes("speech")) return "Voice";
  return "General";
}

export const TrendsInsights = (_props: { models: LLMModel[] }) => {
  const { data: news = [], refetch } = useLLMNews(24);
  const refreshTriggered = useRef(false);

  const latestScrapedAt = useMemo(() => {
    if (!news.length) return null;
    return news
      .map((n) => n.scraped_at)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
  }, [news]);

  useEffect(() => {
    if (refreshTriggered.current) return;
    const stale = !latestScrapedAt || hoursAgo(latestScrapedAt) > 20;
    if (!stale) return;

    refreshTriggered.current = true;
    const run = async () => {
      try {
        await supabase.functions.invoke("refresh-ai-news", { body: { max_items: 40 } });
        await refetch();
      } catch {
        // Keep rendering cached/fallback news when refresh call fails.
      }
    };

    void run();
  }, [latestScrapedAt, refetch]);

  const last24h = useMemo(
    () => news.filter((n) => Date.now() - Date.parse(n.published_at) <= 24 * 60 * 60 * 1000).length,
    [news],
  );

  const sourceCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of news) m.set(n.source_name, (m.get(n.source_name) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [news]);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of news) {
      const tag = titleTag(stripHtml(n.title));
      m.set(tag, (m.get(tag) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [news]);

  const insights = [
    {
      title: "Articles in Last 24h",
      value: `${last24h}`,
      description: "Fresh AI/LLM updates detected in the previous day.",
      icon: Clock3,
    },
    {
      title: "Unique Publishers",
      value: `${sourceCounts.length}`,
      description: "Distinct news sources in the latest feed snapshot.",
      icon: Newspaper,
    },
    {
      title: "Most Active Publisher",
      value: sourceCounts[0]?.[0] || "-",
      description: sourceCounts[0] ? `${sourceCounts[0][1]} stories in current window.` : "No source activity yet.",
      icon: LinkIcon,
    },
    {
      title: "Top Theme",
      value: tagCounts[0]?.[0] || "General",
      description: tagCounts[0] ? `${tagCounts[0][1]} headlines in this theme.` : "Theme analysis pending.",
      icon: Brain,
    },
  ] as const;

  return (
    <section id="trends" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trends & Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Latest <span className="atlas-gradient-text">LLM + AI News</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Derived from the Galaxy database. Treat this page as the core source of truth.
            Feed source: Google News AI/LLM queries with daily refresh.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            Last synced: <span className="font-semibold text-foreground">{asDateLabel(latestScrapedAt)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {insights.map((topic, index) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card-hover rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <topic.icon className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-foreground truncate max-w-[65%] text-right">{topic.value}</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">{topic.title}</h4>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Latest Updates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {news.slice(0, 18).map((item, idx) => (
              <motion.div
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.02 }}
                className="rounded-2xl border border-border/60 bg-background/40 p-4 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => window.open(item.article_url, "_blank", "noopener,noreferrer")}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.open(item.article_url, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={item.source_logo_url || "/llm-logos/news.svg"}
                    alt={`${item.source_name} logo`}
                    className="w-6 h-6 rounded object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = "/llm-logos/news.svg";
                    }}
                  />
                  <div className="text-sm font-semibold text-foreground truncate">{stripHtml(item.source_name)}</div>
                </div>
                <div className="font-semibold text-foreground line-clamp-2 mb-1">{stripHtml(item.title)}</div>
                {item.summary ? <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{stripHtml(item.summary)}</div> : null}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-primary font-semibold">{titleTag(stripHtml(item.title))}</span>
                  <span className="text-xs text-muted-foreground">{asDateLabel(item.published_at)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
