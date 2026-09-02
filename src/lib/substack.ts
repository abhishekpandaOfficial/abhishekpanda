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

export const fetchSubstackArchive = async () => {
  const response = await fetch("/api/substack", { headers: { Accept: "application/json" } });
  const payload = await readJson<ArchiveResponse>(response);
  return { posts: payload.posts || [], syncedAt: payload.syncedAt || null };
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
      const shouldRemovePresentationAttribute =
        name === "style" ||
        name === "width" ||
        name === "height" ||
        (name === "class" && element.tagName !== "CODE" && element.tagName !== "PRE");
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
