import { BookOpen, FileText, Network, Newspaper, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type LocalBlogFormat = "markdown" | "html";

export type LocalBlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  format: LocalBlogFormat;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  tags: string[];
  level: string | null;
  heroImage: string | null;
};

export type LocalBlogLogo = {
  name: string;
  icon: IconType | LucideIcon;
};

const rawBlogs = import.meta.glob("./blog/*.{md,html}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FALLBACK_DATE = "March 6, 2026";

const stripTags = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.(md|html)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugifyTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseFrontmatter = (content: string) => {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(content);
  if (!match) return { data: {} as Record<string, string>, body: content };
  const lines = match[1].split("\n");
  const data: Record<string, string> = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }
  return { data, body: content.slice(match[0].length) };
};

const firstMarkdownHeading = (content: string) =>
  content.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";

const firstMarkdownImage = (content: string) =>
  content.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] || null;

const firstHtmlImage = (content: string) =>
  content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;

const firstHtmlTitle = (content: string) =>
  content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
  content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
  "";

const deriveTags = (text: string) => {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (/\bai|ml|llm|foundation model|deep learning|nlp\b/.test(lower)) tags.push("AI");
  if (/\bcloud|azure|aws|kubernetes|devops\b/.test(lower)) tags.push("Cloud");
  if (/\bprivacy|security|tracking|surveillance\b/.test(lower)) tags.push("Security");
  if (/\barchitecture|microservices|system design\b/.test(lower)) tags.push("Architecture");
  if (/\bdotnet|\.net|c#\b/.test(lower)) tags.push(".NET");
  if (/\bdata|sql|database\b/.test(lower)) tags.push("Data");
  return Array.from(new Set(tags)).slice(0, 6);
};

const deriveLevel = (text: string) => {
  const lower = text.toLowerCase();
  if (/\barchitect\b/.test(lower)) return "architect";
  if (/\bintermediate\b/.test(lower)) return "intermediate";
  if (/\bbeginner\b/.test(lower)) return "beginner";
  if (/\bfundamentals?\b/.test(lower)) return "fundamentals";
  return "general";
};

const estimateReadingTime = (plainText: string) => Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));

const excerptFromText = (plainText: string) => {
  if (plainText.length <= 220) return plainText;
  return `${plainText.slice(0, 217).trim()}...`;
};

const buildRecord = (filePath: string, rawContent: string): LocalBlogPostRecord => {
  const format = filePath.endsWith(".html") ? "html" : "markdown";
  const { data, body } = format === "markdown" ? parseFrontmatter(rawContent) : { data: {} as Record<string, string>, body: rawContent };
  const plainText = format === "html" ? stripTags(body) : body.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`-]/g, " ").replace(/\s+/g, " ").trim();
  const inferredTitle = format === "html" ? firstHtmlTitle(body) : firstMarkdownHeading(body);
  const title = data.title || inferredTitle || filePath.split("/").pop()?.replace(/\.(md|html)$/i, "") || "Blog Post";
  const slug = data.slug || slugifyTitle(title) || toSlug(filePath);
  const tags = (data.tags ? data.tags.split(",").map((item) => item.trim()).filter(Boolean) : deriveTags(`${title} ${plainText}`)).slice(0, 8);
  const level = data.level || deriveLevel(`${title} ${plainText}`);
  const heroImage = data.hero_image || (format === "html" ? firstHtmlImage(body) : firstMarkdownImage(body));

  return {
    id: `local-blog:${slug}`,
    slug,
    title,
    excerpt: data.excerpt || excerptFromText(plainText),
    content: body,
    format,
    publishedAt: data.date || FALLBACK_DATE,
    updatedAt: data.updated_at || data.date || FALLBACK_DATE,
    readingTimeMinutes: estimateReadingTime(plainText),
    tags,
    level,
    heroImage,
  };
};

export const LOCAL_BLOG_POSTS: LocalBlogPostRecord[] = Object.entries(rawBlogs)
  .map(([filePath, rawContent]) => buildRecord(filePath, rawContent))
  .sort((a, b) => a.title.localeCompare(b.title));

export const LOCAL_BLOG_POSTS_BY_SLUG = new Map(LOCAL_BLOG_POSTS.map((post) => [post.slug, post]));

export const getLocalBlogFolderPath = () => "src/content/blog";

export const getLocalBlogUploadHint = () =>
  "Drop new .md or .html files into src/content/blog and they will appear on the blog page and under /blog/<slug> automatically.";

export const getRenderableLocalBlogHtml = (post: LocalBlogPostRecord) => {
  if (post.format === "html") return post.content;
  return null;
};

export const getLocalBlogRelatedPosts = (post: LocalBlogPostRecord, limit = 3) =>
  LOCAL_BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      score: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || a.post.title.localeCompare(b.post.title))
    .slice(0, limit)
    .map((entry) => entry.post);

export const LOCAL_BLOG_LOGOS: LocalBlogLogo[] = [
  { name: "Website Blog", icon: Newspaper },
  { name: "Documentation", icon: FileText },
  { name: "Series", icon: BookOpen },
  { name: "Engineering", icon: Network },
];
