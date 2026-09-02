type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const PUBLICATION_ORIGIN = "https://stackedin.substack.com";
const REQUEST_HEADERS = {
  Accept: "application/json, text/html;q=0.9, */*;q=0.8",
  "User-Agent": "StackedIN-Portfolio-Sync/1.0 (+https://www.abhishekpanda.com/blog)",
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;

const safeImageUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, PUBLICATION_ORIGIN);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const imageFromValue = (value: unknown): string | null => {
  const direct = safeImageUrl(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  for (const key of ["original", "og", "large", "medium", "url", "src"]) {
    const image = safeImageUrl(record[key]);
    if (image) return image;
  }
  return null;
};

const postRecord = (payload: unknown) => {
  const record = asRecord(payload) || {};
  return asRecord(record.post) || asRecord(asRecord(record.data)?.post) || asRecord(record.data) || record;
};

const imageFromPost = (payload: unknown) => {
  const post = postRecord(payload);
  for (const key of ["cover_image", "social_image", "image_url", "image"]) {
    const image = imageFromValue(post[key]);
    if (image) return image;
  }
  return null;
};

const imageFromHtml = (html: string) => {
  const propertyFirst = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const contentFirst = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return safeImageUrl(propertyFirst?.[1] || contentFirst?.[1]);
};

const fetchOriginalImage = async (slug: string) => {
  const apiImage = async () => {
    const response = await fetch(`${PUBLICATION_ORIGIN}/api/v1/posts/${encodeURIComponent(slug)}`, {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(3_500),
    });
    if (response.ok) {
      const image = imageFromPost(await response.json());
      if (image) return image;
    }
    return null;
  };

  const pageImage = async () => {
    const response = await fetch(`${PUBLICATION_ORIGIN}/p/${encodeURIComponent(slug)}`, {
      headers: { ...REQUEST_HEADERS, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(3_500),
    });
    return response.ok ? imageFromHtml(await response.text()) : null;
  };

  const results = await Promise.allSettled([apiImage(), pageImage()]);
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) return result.value;
  }
  return null;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method && request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).end();
    return;
  }

  const rawSlug = request.query?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    response.setHeader("Cache-Control", "no-store");
    response.status(400).end();
    return;
  }

  const image = await fetchOriginalImage(slug);
  if (!image) {
    response.setHeader("Cache-Control", "public, s-maxage=300");
    response.status(404).end();
    return;
  }

  response.setHeader("Location", image);
  response.setHeader("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=2592000");
  response.status(302).end();
}
