import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_URL = "https://www.abhishekpanda.com";
const PUBLICATION_ORIGIN = "https://stackedin.substack.com";
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data/stackedin-posts.json"), "utf8"));

const escapeXml = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const livePosts = [];
try {
  for (let offset = 0; offset < 1000; offset += 50) {
    const response = await fetch(`${PUBLICATION_ORIGIN}/api/v1/archive?sort=new&search=&offset=${offset}&limit=50`, {
      headers: { Accept: "application/json", "User-Agent": "StackedIN-Sitemap/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) break;
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.posts || payload.post_previews || payload.items || payload.results || [];
    for (const row of rows) {
      const slug = typeof row?.slug === "string" ? row.slug : typeof row?.post_slug === "string" ? row.post_slug : null;
      if (slug) livePosts.push({ slug, updatedAt: row.updated_at || row.last_updated_at || row.post_date || row.published_at || null });
    }
    if (rows.length < 50) break;
  }
} catch {
  console.warn("Live StackedIN sitemap refresh was unavailable; using the verified post manifest.");
}

const posts = new Map(manifest.map((post) => [post.slug, { slug: post.slug, updatedAt: null }]));
for (const post of livePosts) posts.set(post.slug, post);

const urls = [
  `  <url>\n    <loc>${SITE_URL}/blog/stackedin</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>`,
  ...Array.from(posts.values()).map((post) => {
    const lastmod = post.updatedAt && !Number.isNaN(new Date(post.updatedAt).getTime())
      ? `\n    <lastmod>${escapeXml(new Date(post.updatedAt).toISOString())}</lastmod>`
      : "";
    return `  <url>\n    <loc>${escapeXml(`${SITE_URL}/blog/stackedin/${post.slug}`)}</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`;
  }),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "public/stackedin-sitemap.xml"), xml);
console.log(`StackedIN sitemap contains ${posts.size} article routes.`);
