import knownPosts from "../data/stackedin-posts.ts";

type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

const PUBLICATION_ORIGIN = "https://stackedin.substack.com";
const ARCHIVE_PAGE_SIZE = 100;
const MAX_ARCHIVE_PAGES = 1;
const REQUEST_HEADERS = {
  Accept: "application/json, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
  "User-Agent": "StackedIN-Portfolio-Sync/1.0 (+https://www.abhishekpanda.com/blog)",
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : null;

const asString = (...values: unknown[]) => {
  const match = values.find((value) => typeof value === "string" && value.trim());
  return typeof match === "string" ? match.trim() : null;
};

const asNumber = (...values: unknown[]) => {
  const match = values.find((value) => typeof value === "number" && Number.isFinite(value));
  return typeof match === "number" ? match : null;
};

const asIdentifier = (...values: unknown[]) => {
  const match = values.find((value) =>
    (typeof value === "string" && value.trim()) || (typeof value === "number" && Number.isFinite(value)),
  );
  return typeof match === "number" ? String(match) : typeof match === "string" ? match.trim() : null;
};

const cleanText = (value: string | null) =>
  value
    ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim() || null;

const safeUrl = (value: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value, PUBLICATION_ORIGIN);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const imageUrl = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string") {
      const url = safeUrl(value);
      if (url) return url;
    }
    const record = asRecord(value);
    if (record) {
      const url = safeUrl(asString(record.original, record.og, record.large, record.medium, record.url, record.src));
      if (url) return url;
    }
  }
  return null;
};

const postRecord = (payload: unknown): UnknownRecord => {
  const record = asRecord(payload) || {};
  const directPost = asRecord(record.post);
  if (directPost) return directPost;
  const data = asRecord(record.data);
  if (data) return asRecord(data.post) || data;
  return record;
};

const normalizePost = (input: unknown) => {
  const row = asRecord(input) || {};
  const slug = asString(row.slug, row.post_slug);
  const canonicalUrl = safeUrl(asString(row.canonical_url, row.canonicalUrl, row.url, slug ? `/p/${slug}` : null));
  const title = cleanText(asString(row.title, row.name)) || "Untitled StackedIN post";
  const subtitle = cleanText(asString(row.subtitle, row.description, row.excerpt, row.truncated_body_text));
  const heroImage = imageUrl(row.cover_image, row.social_image, row.image, row.image_url);
  const publishedAt = asString(row.post_date, row.published_at, row.pubDate, row.date);
  const updatedAt = asString(row.updated_at, row.last_updated_at, publishedAt);
  const wordCount = asNumber(row.wordcount, row.word_count);
  const readingTimeMinutes = Math.max(1, Math.round(asNumber(row.reading_time, row.reading_time_minutes) || (wordCount ? wordCount / 220 : 5)));

  return {
    id: asIdentifier(row.id, row.post_id, slug) || canonicalUrl || title,
    title,
    slug,
    subtitle,
    excerpt: subtitle,
    heroImage,
    canonicalUrl,
    publishedAt,
    updatedAt,
    readingTimeMinutes,
    wordCount,
    audience: asString(row.audience, row.subscription_benefits),
    type: asString(row.type, row.post_type) || "newsletter",
    reactions: asNumber(row.reaction_count, row.reactions),
    comments: asNumber(row.comment_count, row.comments),
  };
};

const archiveRows = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of ["posts", "post_previews", "items", "results", "data"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  const data = asRecord(record.data);
  if (data) return archiveRows(data);
  return [];
};

const fetchJson = async (url: string) => {
  const response = await fetch(url, { headers: REQUEST_HEADERS, signal: AbortSignal.timeout(2_500) });
  if (!response.ok) throw new Error(`StackedIN returned ${response.status}`);
  return response.json() as Promise<unknown>;
};

const xmlValue = (source: string, tag: string) => {
  const match = source.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() || null;
};

const fetchRssFallback = async () => {
  const response = await fetch(`${PUBLICATION_ORIGIN}/feed`, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(2_500),
  });
  if (!response.ok) throw new Error(`StackedIN RSS returned ${response.status}`);
  const xml = await response.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.map((item) => {
    const link = xmlValue(item, "link");
    const slug = link?.match(/\/p\/([^/?#]+)/)?.[1] || null;
    const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1] || null;
    const media = item.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1] || null;
    return normalizePost({
      title: xmlValue(item, "title"),
      subtitle: xmlValue(item, "description"),
      slug,
      canonical_url: link,
      post_date: xmlValue(item, "pubDate"),
      cover_image: media || enclosure,
    });
  });
};

const fallbackKnownPost = (entry: { title: string; slug: string }) => ({
  id: `verified-${entry.slug}`,
  title: entry.title,
  slug: entry.slug,
  subtitle: null,
  excerpt: null,
  heroImage: null,
  canonicalUrl: `${PUBLICATION_ORIGIN}/p/${entry.slug}`,
  publishedAt: null,
  updatedAt: null,
  readingTimeMinutes: 5,
  wordCount: null,
  audience: null,
  type: "newsletter",
  reactions: null,
  comments: null,
});

const knownRank = new Map(knownPosts.map((post, index) => [post.slug, index]));

type NormalizedPost = ReturnType<typeof normalizePost>;

const mergePostMetadata = (existing: NormalizedPost, incoming: NormalizedPost): NormalizedPost => ({
  ...existing,
  ...incoming,
  title: incoming.title === "Untitled StackedIN post" ? existing.title : incoming.title,
  subtitle: incoming.subtitle || existing.subtitle,
  excerpt: incoming.excerpt || existing.excerpt,
  heroImage: incoming.heroImage || existing.heroImage,
  canonicalUrl: incoming.canonicalUrl || existing.canonicalUrl,
  publishedAt: incoming.publishedAt || existing.publishedAt,
  updatedAt: incoming.updatedAt || existing.updatedAt,
  wordCount: incoming.wordCount || existing.wordCount,
});

const newestFirst = (a: NormalizedPost, b: NormalizedPost) => {
  const dateDifference = new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
  if (dateDifference) return dateDifference;
  return (knownRank.get(b.slug || "") ?? -1) - (knownRank.get(a.slug || "") ?? -1);
};

const completeArchive = (posts: NormalizedPost[]) => {
  const unique = new Map<string, NormalizedPost>();
  posts.filter((post) => post.slug).forEach((post) => {
    const existing = unique.get(post.slug!);
    unique.set(post.slug!, existing ? mergePostMetadata(existing, post) : post);
  });
  knownPosts.forEach((entry) => {
    if (!unique.has(entry.slug)) unique.set(entry.slug, fallbackKnownPost(entry));
  });
  return Array.from(unique.values()).sort(newestFirst);
};

const fetchArchive = async () => {
  const collected: NormalizedPost[] = [];

  for (let page = 0; page < MAX_ARCHIVE_PAGES; page += 1) {
    const offset = page * ARCHIVE_PAGE_SIZE;
    const urls = [
      `${PUBLICATION_ORIGIN}/api/v1/archive?sort=new&search=&offset=${offset}&limit=${ARCHIVE_PAGE_SIZE}`,
      `${PUBLICATION_ORIGIN}/api/v1/posts?limit=${ARCHIVE_PAGE_SIZE}&offset=${offset}`,
    ];
    const results = await Promise.allSettled(urls.map(fetchJson));
    const sourceRows = results.map((result) =>
      result.status === "fulfilled" ? archiveRows(result.value) : [],
    );
    const rows = sourceRows.flat();
    if (!rows.length && page === 0) throw new Error("StackedIN archive returned no posts");
    collected.push(...rows.map(postRecord).map(normalizePost).filter((post) => post.slug && post.canonicalUrl));
    if (Math.max(...sourceRows.map((items) => items.length), 0) < ARCHIVE_PAGE_SIZE) break;
  }

  return completeArchive(collected);
};

const fetchPost = async (slug: string) => {
  const payload = await fetchJson(`${PUBLICATION_ORIGIN}/api/v1/posts/${encodeURIComponent(slug)}`);
  const row = postRecord(payload);
  const post = normalizePost(row);
  const bodyHtml = asString(row.body_html, row.content_html, row.html);
  return {
    ...post,
    bodyHtml,
    canonicalUrl: post.canonicalUrl || `${PUBLICATION_ORIGIN}/p/${slug}`,
  };
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method && request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  response.setHeader("Content-Type", "application/json; charset=utf-8");

  const rawSlug = request.query?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  try {
    if (slug) {
      if (!/^[a-z0-9-]+$/i.test(slug)) {
        response.status(400).json({ error: "Invalid post slug" });
        return;
      }
      response.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
      response.status(200).json({ post: await fetchPost(slug), source: PUBLICATION_ORIGIN });
      return;
    }

    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    let posts: Awaited<ReturnType<typeof fetchArchive>>;
    let mode = "archive";
    try {
      posts = await fetchArchive();
    } catch {
      try {
        posts = completeArchive(await fetchRssFallback());
        mode = "rss+verified";
      } catch {
        posts = [...knownPosts].reverse().map(fallbackKnownPost);
        mode = "verified";
      }
    }
    response.status(200).json({ posts, count: posts.length, source: PUBLICATION_ORIGIN, mode, syncedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync StackedIN right now";
    response.setHeader("Cache-Control", "no-store");
    response.status(502).json({ error: message, source: PUBLICATION_ORIGIN });
  }
}
