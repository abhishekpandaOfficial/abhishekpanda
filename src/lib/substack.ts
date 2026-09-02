import knownPosts from "../../data/stackedin-posts.json";

export const STACKEDIN_PUBLICATION_URL = "https://stackedin.substack.com";

export type SubstackPostSummary = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  heroImage: string | null;
  canonicalUrl: string;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTimeMinutes: number;
  wordCount: number | null;
  audience: string | null;
  type: string;
  reactions: number | null;
  comments: number | null;
};

export type SubstackPostDetail = SubstackPostSummary & {
  bodyHtml: string | null;
};

type ArchiveResponse = {
  posts?: SubstackPostSummary[];
  syncedAt?: string;
  mode?: string;
  error?: string;
};

type DetailResponse = {
  post?: SubstackPostDetail;
  error?: string;
};

const readJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to load StackedIN posts");
  return payload;
};

const verifiedArchive = (): SubstackPostSummary[] =>
  [...knownPosts].reverse().map((post) => ({
    id: `verified-${post.slug}`,
    title: post.title,
    slug: post.slug,
    subtitle: null,
    excerpt: null,
    heroImage: null,
    canonicalUrl: `${STACKEDIN_PUBLICATION_URL}/p/${post.slug}`,
    publishedAt: null,
    updatedAt: null,
    readingTimeMinutes: 5,
    wordCount: null,
    audience: null,
    type: "newsletter",
    reactions: null,
    comments: null,
  }));

export const fetchSubstackArchive = async (forceRefresh = false) => {
  try {
    const endpoint = forceRefresh ? `/api/substack?refresh=${Date.now()}` : "/api/substack";
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: forceRefresh ? "no-store" : "default",
    });
    const payload = await readJson<ArchiveResponse>(response);
    if (!payload.posts?.length) throw new Error("StackedIN returned an empty archive");
    return { posts: payload.posts, syncedAt: payload.syncedAt || null, mode: payload.mode || "live" };
  } catch {
    return { posts: verifiedArchive(), syncedAt: new Date().toISOString(), mode: "verified" };
  }
};

export const fetchSubstackPost = async (slug: string) => {
  const response = await fetch(`/api/substack?slug=${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  const payload = await readJson<DetailResponse>(response);
  if (!payload.post) throw new Error("This StackedIN post is unavailable");
  return payload.post;
};

export const sanitizeSubstackHtml = (html: string) => {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script, style, iframe, object, embed, form, input, button").forEach((node) => node.remove());

  document.body.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      const shouldRemovePresentationAttribute = name === "style";
      if (
        shouldRemovePresentationAttribute ||
        name.startsWith("on") ||
        name === "srcdoc" ||
        ((name === "href" || name === "src") && value.startsWith("javascript:"))
      ) {
        element.removeAttribute(attribute.name);
      }
    });
    if (element instanceof HTMLAnchorElement) {
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }
    if (element instanceof HTMLImageElement) {
      element.loading = "lazy";
      element.decoding = "async";
    }
  });

  return document.body.innerHTML;
};
