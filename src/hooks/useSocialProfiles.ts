import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialProfileRow = {
  id: string;
  platform: string;
  display_name: string;
  category: "social" | "blog" | "platform" | "website";
  username: string | null;
  profile_url: string | null;
  icon_key: string;
  brand_color: string | null;
  brand_bg: string | null;
  description: string | null;
  followers: number;
  connected: boolean;
  is_visible: boolean;
  sort_order: number;
  credential_hints: any | null;
  created_at: string;
  updated_at: string;
};

export function usePublicSocialProfiles() {
  return useQuery({
    queryKey: ["social_profiles", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_profiles")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SocialProfileRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminSocialProfiles() {
  return useQuery({
    queryKey: ["social_profiles", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_profiles")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SocialProfileRow[];
    },
    staleTime: 10 * 1000,
  });
}

export function useUpsertSocialProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<SocialProfileRow> & { platform: string; display_name: string; icon_key: string }) => {
      const { data, error } = await supabase
        .from("social_profiles")
        .upsert(row, { onConflict: "platform" })
        .select("*")
        .single();
      if (error) throw error;
      return data as SocialProfileRow;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["social_profiles"] });
    },
  });
}

export function useDeleteSocialProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (platform: string) => {
      const { error } = await supabase.from("social_profiles").delete().eq("platform", platform);
      if (error) throw error;
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["social_profiles"] });
    },
  });
}

