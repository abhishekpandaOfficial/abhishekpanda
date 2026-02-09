import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteKnowledgeItem = {
  id: string;
  category: string;
  title: string;
  summary: string;
  route: string | null;
  priority: number;
};

const fallbackKnowledge: SiteKnowledgeItem[] = [
  {
    id: "k-home",
    category: "website",
    title: "About this website",
    summary: "Official OriginX Labs ecosystem portal for products, academy, mentorship, blogs, and enterprise contact.",
    route: "/",
    priority: 100,
  },
  {
    id: "k-chronyx",
    category: "chronyx",
    title: "CHRONYX",
    summary: "A calm personal system for planning, notes, finance tracking, and life workflows.",
    route: "/chronyx",
    priority: 95,
  },
  {
    id: "k-galaxy",
    category: "llm-galaxy",
    title: "LLM Galaxy",
    summary: "Database-backed map of frontier model families, benchmarks, use-cases, and trend signals.",
    route: "/llm-galaxy",
    priority: 95,
  },
];

export function useSiteKnowledge(limit = 24) {
  return useQuery({
    queryKey: ["site-knowledge", limit],
    queryFn: async () => {
      const sb = supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            order: (field: string, options: { ascending: boolean }) => {
              limit: (rowLimit: number) => Promise<{ data: SiteKnowledgeItem[] | null; error: { code?: string; message: string } | null }>;
            };
          };
        };
      };

      const { data, error } = await sb
        .from("site_knowledge_base")
        .select("id,category,title,summary,route,priority")
        .order("priority", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === "42P01") return fallbackKnowledge.slice(0, limit);
        throw new Error(error.message);
      }

      return (data || fallbackKnowledge).slice(0, limit);
    },
  });
}
