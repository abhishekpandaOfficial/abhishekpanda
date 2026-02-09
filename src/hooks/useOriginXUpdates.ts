import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OriginXUpdate = {
  id: string;
  title: string;
  summary: string;
  url: string | null;
  tag: string | null;
  published_at: string;
};

const fallbackUpdates: OriginXUpdate[] = [
  {
    id: "fallback-1",
    title: "OriginX Labs: CHRONYX lifecycle dashboard released",
    summary: "CHRONYX now includes planning, finance insights, and knowledge memory in one personal workspace.",
    url: "https://www.getchronyx.com",
    tag: "Product",
    published_at: "2026-02-09T00:00:00Z",
  },
  {
    id: "fallback-2",
    title: "OriginX LLM Galaxy received Feb 2026 model family refresh",
    summary: "The Galaxy dataset is now aligned with current frontier and open-weight families.",
    url: "/llm-galaxy",
    tag: "AI",
    published_at: "2026-02-08T00:00:00Z",
  },
];

export function useOriginXUpdates(limit = 6) {
  return useQuery({
    queryKey: ["originx-updates", limit],
    queryFn: async () => {
      const sb = supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (field: string, value: boolean) => {
              order: (field: string, options: { ascending: boolean }) => {
                limit: (rowLimit: number) => Promise<{ data: OriginXUpdate[] | null; error: { code?: string; message: string } | null }>;
              };
            };
          };
        };
      };

      const { data, error } = await sb
        .from("originx_updates")
        .select("id,title,summary,url,tag,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        // Missing table in local env should not break the UI.
        if (error.code === "42P01") return fallbackUpdates.slice(0, limit);
        throw new Error(error.message);
      }

      return (data || fallbackUpdates).slice(0, limit);
    },
  });
}
