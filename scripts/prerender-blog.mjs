import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Prefer .env.local (Vite convention) for local builds, fall back to .env.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://www.abhishekpanda.com";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    "Missing Supabase env. Need VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const readDistIndex = () => {
  const p = path.join(DIST, "index.html");
  return fs.readFileSync(p, "utf8");
};

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const escapeXml = escapeHtml;

const injectOrReplace = (html, { title, description, canonical, ogImage, robots, jsonld }) => {
  let out = html;

  // title
  if (/<title>.*<\/title>/i.test(out)) {
    out = out.replace(/<title>.*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  } else {
    out = out.replace(/<\/head>/i, `<title>${escapeHtml(title)}</title>\n</head>`);
  }

  // description
  if (/<meta[^>]+name=["']description["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<meta[^>]+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `<meta name="description" content="${escapeHtml(description)}" />\n</head>`
    );
  }

  // canonical
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<link[^>]+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />\n</head>`
    );
  }

  // robots
  if (/<meta[^>]+name=["']robots["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<meta[^>]+name=["']robots["'][^>]*>/i,
      `<meta name="robots" content="${escapeHtml(robots)}" />`
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `<meta name="robots" content="${escapeHtml(robots)}" />\n</head>`
    );
  }

  // OG/Twitter basics
  const setMetaProp = (prop, content) => {
    const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]*>`, "i");
    const tag = `<meta property="${prop}" content="${escapeHtml(content)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace(/<\/head>/i, `${tag}\n</head>`);
  };
  const setMetaName = (name, content) => {
    const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i");
    const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace(/<\/head>/i, `${tag}\n</head>`);
  };

  setMetaProp("og:title", title);
  setMetaProp("og:description", description);
  setMetaProp("og:url", canonical);
  setMetaProp("og:type", "article");
  if (ogImage) setMetaProp("og:image", ogImage);

  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
  if (ogImage) setMetaName("twitter:image", ogImage);

  // JSON-LD
  if (jsonld) {
    // Remove existing Article JSON-LD if any (keep Person etc).
    out = out.replace(
      /<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi,
      (m) => {
        // Keep non-Article JSON-LD by heuristic: preserve if contains "@type\":\"Person\""
        return /"@type"\s*:\s*"Person"/i.test(m) ? m : "";
      }
    );
    out = out.replace(
      /<\/head>/i,
      `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n</head>`
    );
  }

  return out;
};

const fetchPublishedPosts = async () => {
  const selectV2 =
    "title,slug,excerpt,hero_image,tags,is_premium,level,original_published_at,published_at,views,meta_title,meta_description,updated_at,is_published";
  const selectLegacy =
    "title,slug,excerpt,hero_image,tags,is_premium,published_at,meta_title,meta_description,updated_at,is_published";

  // Prefer the public cache table (supports premium metadata without exposing content).
  const cacheRes = await supabase
    .from("blog_posts_public_cache")
    .select(selectV2)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (!cacheRes.error) return cacheRes.data ?? [];

  const isSchemaDrift = cacheRes.error.code === "42703";
  if (isSchemaDrift) {
    const cacheLegacy = await supabase
      .from("blog_posts_public_cache")
      .select(selectLegacy)
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (!cacheLegacy.error) return cacheLegacy.data ?? [];
  }

  // If migrations haven't been applied yet, fall back to blog_posts.
  if (cacheRes.error.code === "PGRST205") {
    console.warn(
      "Warning: blog_posts_public_cache not found. Falling back to blog_posts for prerender."
    );
    const postsRes = await supabase
      .from("blog_posts")
      .select(selectV2)
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (postsRes.error?.code === "42703") {
      const legacy = await supabase
        .from("blog_posts")
        .select(selectLegacy)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (legacy.error) {
        console.warn("Warning: blog_posts fallback query failed:", legacy.error);
        return [];
      }
      return legacy.data ?? [];
    }

    if (postsRes.error) {
      console.warn("Warning: blog_posts fallback query failed:", postsRes.error);
      return [];
    }
    return postsRes.data ?? [];
  }

  console.warn("Warning: failed to fetch posts for prerender:", cacheRes.error);
  return [];
};

const writeFile = (p, content) => {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
};

const buildSitemap = (posts) => {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly" },
    { loc: `${SITE_URL}/blog`, changefreq: "daily" },
  ];
  for (const p of posts) {
    urls.push({ loc: `${SITE_URL}/blog/${p.slug}`, changefreq: "monthly" });
  }

  const body = urls
    .map((u) => {
      return (
        "  <url>\n" +
        `    <loc>${escapeXml(u.loc)}</loc>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        "  </url>"
      );
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
};

const buildRss = (posts) => {
  const items = posts.slice(0, 20).map((p) => {
    const pubDate = p.published_at || p.updated_at;
    return (
      "    <item>\n" +
      `      <title>${escapeXml(p.meta_title || p.title)}</title>\n` +
      `      <link>${escapeXml(`${SITE_URL}/blog/${p.slug}`)}</link>\n` +
      `      <guid>${escapeXml(`${SITE_URL}/blog/${p.slug}`)}</guid>\n` +
      `      <pubDate>${escapeXml(new Date(pubDate).toUTCString())}</pubDate>\n` +
      `      <description>${escapeXml(p.meta_description || p.excerpt || "")}</description>\n` +
      "    </item>"
    );
  });

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml("Abhishek Panda Blog")}</title>\n` +
    `    <link>${escapeXml(`${SITE_URL}/blog`)}</link>\n` +
    `    <description>${escapeXml("Engineering insights, tutorials, and deep dives.")}</description>\n` +
    `    <language>en-us</language>\n` +
    `    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>\n` +
    `${items.join("\n")}\n` +
    `  </channel>\n` +
    `</rss>\n`
  );
};

const main = async () => {
  if (!fs.existsSync(DIST)) {
    console.error("dist/ not found. Run vite build first.");
    process.exit(1);
  }

  const indexHtml = readDistIndex();
  const posts = await fetchPublishedPosts();

  // Blog listing shell
  const blogIndex = injectOrReplace(indexHtml, {
    title: "Blog | Abhishek Panda",
    description: "Insights, tutorials, and deep dives into .NET, AI/ML, cloud architecture, and modern engineering.",
    canonical: `${SITE_URL}/blog`,
    ogImage: `${SITE_URL}/og-image.png`,
    robots: "index,follow",
    jsonld: null,
  });
  writeFile(path.join(DIST, "blog", "index.html"), blogIndex);

  for (const p of posts) {
    const canonical = `${SITE_URL}/blog/${p.slug}`;
    const title = p.meta_title || p.title;
    const description = p.meta_description || p.excerpt || "";
    const robots = p.is_premium ? "noindex,follow" : "index,follow";

    const jsonld =
      p.is_premium
        ? null
        : {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            author: { "@type": "Person", name: "Abhishek Panda" },
            datePublished: p.published_at || p.updated_at,
            dateModified: p.updated_at,
            mainEntityOfPage: canonical,
            url: canonical,
            image: p.hero_image ? [p.hero_image] : undefined,
          };

    const html = injectOrReplace(indexHtml, {
      title,
      description,
      canonical,
      ogImage: p.hero_image || `${SITE_URL}/og-image.png`,
      robots,
      jsonld,
    });

    writeFile(path.join(DIST, "blog", p.slug, "index.html"), html);
  }

  writeFile(path.join(DIST, "sitemap.xml"), buildSitemap(posts));
  writeFile(path.join(DIST, "rss.xml"), buildRss(posts));

  console.log(`Prerendered ${posts.length} blog posts.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
