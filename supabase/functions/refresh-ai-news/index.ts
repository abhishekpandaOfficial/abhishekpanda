import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NewsItem = {
  title: string;
  summary: string;
  article_url: string;
  source_name: string;
  source_url: string | null;
  source_domain: string | null;
  source_logo_url: string;
  published_at: string;
  tags: string[];
};

function unescapeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function readTag(item: string, tagName: string): string {
  const match = item.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? unescapeXml(match[1]) : "";
}

function sourceMeta(item: string): { name: string; url: string | null } {
  const match = item.match(/<source[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/i);
  if (!match) return { name: "Google News", url: "https://news.google.com/" };
  return {
    url: match[1] || null,
    name: stripHtml(unescapeXml(match[2] || "Google News")),
  };
}

function parseDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
}

function deriveTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags: string[] = [];
  if (t.includes("llm") || t.includes("large language model")) tags.push("LLM");
  if (t.includes("open source") || t.includes("open-weight")) tags.push("Open Source");
  if (t.includes("reason") || t.includes("math")) tags.push("Reasoning");
  if (t.includes("agent") || t.includes("coding") || t.includes("code")) tags.push("Coding");
  if (t.includes("voice") || t.includes("speech")) tags.push("Voice");
  if (t.includes("video") || t.includes("image") || t.includes("multimodal")) tags.push("Multimodal");
  if (!tags.length) tags.push("AI");
  return tags.slice(0, 4);
}

function parseRss(xml: string, maxItems: number): NewsItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((m) => m[1])
    .slice(0, maxItems);

  const out: NewsItem[] = [];
  for (const raw of items) {
    const title = stripHtml(readTag(raw, "title"));
    const articleUrl = readTag(raw, "link");
    const pubDateRaw = readTag(raw, "pubDate");
    const description = stripHtml(readTag(raw, "description"));
    const source = sourceMeta(raw);
    const sourceDomain = parseDomain(source.url) || parseDomain(articleUrl);
    const sourceLogo = sourceDomain
      ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(sourceDomain)}`
      : "/llm-logos/news.svg";

    const publishedAt = Number.isNaN(Date.parse(pubDateRaw))
      ? new Date().toISOString()
      : new Date(pubDateRaw).toISOString();

    if (!title || !articleUrl) continue;

    out.push({
      title,
      summary: description || "Latest AI update from Google News.",
      article_url: articleUrl,
      source_name: source.name || "Google News",
      source_url: source.url,
      source_domain: sourceDomain,
      source_logo_url: sourceLogo,
      published_at: publishedAt,
      tags: deriveTags(`${title} ${description}`),
    });
  }

  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const maxItems = Math.max(10, Math.min(80, Number(body?.max_items || 40)));

    const query = encodeURIComponent('(LLM OR "large language model" OR "generative ai" OR "AI model") when:1d');
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent": "OriginX-LLM-Galaxy-NewsBot/1.0",
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      },
    });

    if (!res.ok) {
      throw new Error(`Google News RSS failed with ${res.status}`);
    }

    const xml = await res.text();
    const parsed = parseRss(xml, maxItems);

    if (!parsed.length) {
      return new Response(
        JSON.stringify({ success: true, inserted: 0, message: "No parseable items in feed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = parsed.map((x) => ({ ...x, is_active: true, scraped_at: new Date().toISOString() }));

    const { error } = await supabase
      .from("llm_news_updates")
      .upsert(payload, { onConflict: "article_url" });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, inserted: payload.length, source: "google-news-rss" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("refresh-ai-news error:", err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
