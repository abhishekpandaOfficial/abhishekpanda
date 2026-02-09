import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LLMModel = Database["public"]["Tables"]["llm_models"]["Row"];

export function useLLMModels() {
  return useQuery({
    queryKey: ["llm-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_models")
        .select("*")
        .order("company", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as LLMModel[];
    },
  });
}

export function getBenchmarkNumber(model: LLMModel, key: string): number | null {
  const b = model.benchmarks as any;
  if (!b || typeof b !== "object") return null;
  const v = b[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function getLastUpdated(models: LLMModel[]): Date | null {
  let last: Date | null = null;
  for (const m of models) {
    const d = m.updated_at ? new Date(m.updated_at) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    if (!last || d.getTime() > last.getTime()) last = d;
  }
  return last;
}

