import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LOCAL_BLOG_POSTS } from "@/content/blogs";

export type BlogIndexRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_published: boolean;
  level: string | null;
  original_published_at: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  views: number;
  updated_at: string | null;
  series_name?: string | null;
  series_order?: number | null;
};

type TagStyleRow = {
  tag: string;
  bg_color: string;
  text_color: string;
  border_color: string;
};

const isMissingTableError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "PGRST205";
};

export const getPublishingChannel = (tags: string[] | null | undefined): "personal" | "techhub" => {
  const hit = (tags || []).find((t) => t.toLowerCase().startsWith("channel:"));
  if (!hit) return "personal";
  const raw = hit.split(":")[1]?.toLowerCase();
  return raw === "techhub" ? "techhub" : "personal";
};

export const titleCaseLevel = (level: string | null | undefined) => {
  if (!level) return "General";
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export const usePublishedPersonalBlogs = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!res.error) return res.data || [];

      if (isMissingTableError(res.error)) {
        const fallback = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false });
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }

      throw res.error;
    },
  });

  const { data: tagStyles = [] } = useQuery({
    queryKey: ["blog-tag-styles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tag_styles")
        .select("tag,bg_color,text_color,border_color");
      if (error) return [];
      return (data ?? []) as TagStyleRow[];
    },
  });

  const tagStyleMap = useMemo(
    () => new Map(tagStyles.map((s) => [s.tag.toLowerCase(), s])),
    [tagStyles],
  );

  const localPosts = useMemo(
    () =>
      LOCAL_BLOG_POSTS.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        hero_image: post.heroImage,
        tags: post.tags,
        is_premium: false,
        is_published: true,
        level: post.level,
        original_published_at: post.publishedAt,
        published_at: post.publishedAt,
        meta_title: post.title,
        meta_description: post.excerpt,
        reading_time_minutes: post.readingTimeMinutes,
        views: 0,
        updated_at: post.updatedAt,
        series_name: post.seriesName,
        series_order: post.seriesOrder,
      }) satisfies BlogIndexRow),
    [],
  );

  const mergedPosts = useMemo(() => {
    const map = new Map<string, BlogIndexRow>();
    localPosts.forEach((post) => map.set(post.slug, post));
    (posts as BlogIndexRow[]).forEach((post) => {
      if (!map.has(post.slug)) map.set(post.slug, post);
    });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = new Date((a.original_published_at || a.published_at || a.updated_at || 0) as string).getTime();
      const bDate = new Date((b.original_published_at || b.published_at || b.updated_at || 0) as string).getTime();
      return bDate - aDate;
    });
  }, [localPosts, posts]);

  const personalPosts = useMemo(
    () => mergedPosts.filter((p) => getPublishingChannel(p.tags || []) === "personal"),
    [mergedPosts],
  );

  const getTagStyle = (tag: string) => {
    const style = tagStyleMap.get(tag.toLowerCase());
    if (!style) return undefined;
    return {
      backgroundColor: style.bg_color,
      color: style.text_color,
      borderColor: style.border_color,
    };
  };

  return {
    personalPosts,
    isLoading,
    tagStyleMap,
    getTagStyle,
  };
};
