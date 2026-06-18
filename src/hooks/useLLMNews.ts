import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LLMNewsItem = {
  id: string;
  title: string;
  summary: string | null;
  article_url: string;
  source_name: string;
  source_url: string | null;
  source_domain: string | null;
  source_logo_url: string | null;
  published_at: string;
  tags: string[] | null;
  scraped_at: string;
};

const fallbackNews: LLMNewsItem[] = [
  {
    id: "fallback-news-1",
    title: "Latest AI and LLM headlines are being synchronized.",
    summary: "Daily Google News ingestion is enabled. Fresh stories will appear after the next sync.",
    article_url: "https://news.google.com/",
    source_name: "Google News",
    source_url: "https://news.google.com/",
    source_domain: "news.google.com",
    source_logo_url: "/llm-logos/news.svg",
    published_at: new Date().toISOString(),
    tags: ["AI", "LLM"],
    scraped_at: new Date().toISOString(),
  },
];

export function useLLMNews(limit = 24) {
  return useQuery({
    queryKey: ["llm-news", limit],
    queryFn: async () => {
      const sb = supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (field: string, value: boolean) => {
              order: (field: string, options: { ascending: boolean }) => {
                limit: (rowLimit: number) => Promise<{
                  data: LLMNewsItem[] | null;
                  error: { code?: string; message: string } | null;
                }>;
              };
            };
          };
        };
      };

      const { data, error } = await sb
        .from("llm_news_updates")
        .select("id,title,summary,article_url,source_name,source_url,source_domain,source_logo_url,published_at,tags,scraped_at")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === "42P01") return fallbackNews.slice(0, limit);
        throw new Error(error.message);
      }

      return (data && data.length ? data : fallbackNews).slice(0, limit);
    },
  });
}
