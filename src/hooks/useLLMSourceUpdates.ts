import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LLMSourceUpdate = {
  id: string;
  source_name: string;
  source_url: string;
  source_updated_on: string | null;
  notes: string | null;
  synced_at: string;
};

const fallback: LLMSourceUpdate[] = [
  {
    id: "vellum-main",
    source_name: "Vellum LLM Leaderboard",
    source_url: "https://www.vellum.ai/llm-leaderboard",
    source_updated_on: "2025-12-15",
    notes: "Main leaderboard snapshot",
    synced_at: new Date().toISOString(),
  },
  {
    id: "vellum-open",
    source_name: "Vellum Open LLM Leaderboard",
    source_url: "https://www.vellum.ai/open-llm-leaderboard",
    source_updated_on: "2025-11-19",
    notes: "Open-source leaderboard snapshot",
    synced_at: new Date().toISOString(),
  },
  {
    id: "hf-open",
    source_name: "Hugging Face Open LLM Leaderboard",
    source_url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard#/",
    source_updated_on: null,
    notes: "Rolling updates",
    synced_at: new Date().toISOString(),
  },
];

export function useLLMSourceUpdates() {
  return useQuery({
    queryKey: ["llm-source-updates"],
    queryFn: async () => {
      const sb = supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            order: (field: string, options: { ascending: boolean }) => Promise<{ data: LLMSourceUpdate[] | null; error: { code?: string; message: string } | null }>;
          };
        };
      };

      const { data, error } = await sb
        .from("llm_source_updates")
        .select("id,source_name,source_url,source_updated_on,notes,synced_at")
        .order("source_name", { ascending: true });

      if (error) {
        if (error.code === "42P01") return fallback;
        throw new Error(error.message);
      }

      return data && data.length ? data : fallback;
    },
  });
}
