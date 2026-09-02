import { fetchArchive } from "./substack";

type ApiRequest = { method?: string };
type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

const SITE_URL = "https://www.abhishekpanda.com";
const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method && request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).send("Method not allowed");
    return;
  }

  try {
    const posts = await fetchArchive();
    const urls = [
      `<url><loc>${SITE_URL}/blog</loc><changefreq>daily</changefreq><priority>0.95</priority></url>`,
      ...posts.map((post) => {
        const lastmod = post.updatedAt || post.publishedAt;
        return `<url><loc>${escapeXml(`${SITE_URL}/blog/stackedin/${post.slug}`)}</loc>${lastmod ? `<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.85</priority></url>`;
      }),
    ];
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
  } catch {
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.status(503).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/blog</loc></url></urlset>`);
  }
}
