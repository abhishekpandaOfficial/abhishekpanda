import { AI_ML_SERIES, getAiMlSeriesHref } from "@/lib/aiMlSeries";
import { BLOG_SERIES, getBlogSeriesHref } from "@/lib/blogSeries";
import { LOCAL_BLOG_POSTS } from "@/content/blogs";

export type SiteSearchSection =
  | "Main Pages"
  | "Projects"
  | "Engineering Series"
  | "AI/ML Series"
  | "Blog Posts"
  | "Articles"
  | "Scriptures";

export type SiteSearchItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  section: SiteSearchSection;
  keywords: string[];
};

const rawArticles = import.meta.glob("../content/Articles/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const rawScriptures = import.meta.glob("../content/Scriptures/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const extractHtmlText = (value: string) =>
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

const extractHtmlTitle = (value: string, fallback: string) =>
  value.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
  value.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
  fallback;

const toExcerpt = (value: string) => (value.length > 180 ? `${value.slice(0, 177).trim()}...` : value);

const toSlug = (filePath: string) => filePath.split("/").pop()?.replace(/\.html$/i, "") || "item";

const mainPages: SiteSearchItem[] = [
  {
    id: "home",
    title: "Home",
    description: "Main landing page for the full website, portfolio, products, and technical destinations.",
    href: "/",
    section: "Main Pages",
    keywords: ["home", "landing", "portfolio", "website"],
  },
  {
    id: "about",
    title: "About",
    description: "Background, experience, certifications, and technical profile.",
    href: "/about",
    section: "Main Pages",
    keywords: ["about", "profile", "experience", "resume"],
  },
  {
    id: "blogs",
    title: "Blogs Hub",
    description: "Engineering mastery series hub for C#, .NET, microservices, Kafka, cloud, and architecture.",
    href: "/blogs",
    section: "Main Pages",
    keywords: ["blogs", "engineering", "series", "mastery", "dotnet", "architecture"],
  },
  {
    id: "aiml-blogs",
    title: "AI / ML Blogs Hub",
    description: "AI, ML, data science, and model-engineering mastery tracks in one place.",
    href: "/ai-ml-blogs",
    section: "Main Pages",
    keywords: ["ai", "ml", "machine learning", "data science", "numpy", "statistics"],
  },
  {
    id: "articles",
    title: "Articles",
    description: "Long-form articles, architecture writing, AI systems, and technical explanations.",
    href: "/articles",
    section: "Main Pages",
    keywords: ["articles", "longform", "writing", "architecture"],
  },
  {
    id: "scriptures",
    title: "Scriptures",
    description: "Structured scripture guides and comparative spiritual knowledge pages.",
    href: "/scriptures",
    section: "Main Pages",
    keywords: ["scriptures", "gita", "bible", "quran", "buddhism", "taoism"],
  },
  {
    id: "projects",
    title: "Projects",
    description: "Project and platform discovery page for OpenOwl, CHRONYX, and other build-focused destinations.",
    href: "/projects",
    section: "Main Pages",
    keywords: ["projects", "platforms", "openowl", "chronyx", "products"],
  },
  {
    id: "products",
    title: "Products",
    description: "Digital products, templates, and technical starter kits.",
    href: "/products",
    section: "Main Pages",
    keywords: ["products", "templates", "starter kits", "marketplace"],
  },
  {
    id: "courses",
    title: "Courses",
    description: "Course catalog and training offerings.",
    href: "/courses",
    section: "Main Pages",
    keywords: ["courses", "training", "academy", "learning"],
  },
  {
    id: "contact",
    title: "Contact",
    description: "Contact page for mentorship, consulting, and collaboration.",
    href: "/contact",
    section: "Main Pages",
    keywords: ["contact", "mentorship", "consulting", "reach out"],
  },
];

const projects: SiteSearchItem[] = [
  {
    id: "openowl",
    title: "OpenOwl",
    description: "Assistant product shell, live walkthrough page, and ecosystem hub.",
    href: "/openowl",
    section: "Projects",
    keywords: ["openowl", "assistant", "ai assistant", "agent", "project"],
  },
  {
    id: "openowl-assistant",
    title: "OpenOwl Assistant",
    description: "Interactive assistant surface connected to the OpenOwl chat panel.",
    href: "/openowl/assistant",
    section: "Projects",
    keywords: ["openowl", "assistant", "chat", "agent"],
  },
  {
    id: "openowl-setup",
    title: "OpenOwl Setup Guide",
    description: "Developer setup guide for running and configuring OpenOwl locally.",
    href: "/openowl/setup",
    section: "Projects",
    keywords: ["openowl", "setup", "guide", "developer", "installation"],
  },
  {
    id: "chronyx",
    title: "CHRONYX",
    description: "Personal intelligence and productivity product surface.",
    href: "/chronyx",
    section: "Projects",
    keywords: ["chronyx", "productivity", "personal intelligence"],
  },
  {
    id: "techhub",
    title: "Tech Hub",
    description: "Aggregated engineering and technology discovery route.",
    href: "/blog/techhub",
    section: "Projects",
    keywords: ["tech hub", "technology", "engineering", "hub"],
  },
];

const engineeringSeries: SiteSearchItem[] = BLOG_SERIES.map((series) => ({
  id: `series:${series.slug}`,
  title: series.detailTitle || series.title,
  description: series.subtitle,
  href: getBlogSeriesHref(series),
  section: "Engineering Series",
  keywords: [series.slug, ...series.tags, ...series.keywords],
}));

const aiMlSeries: SiteSearchItem[] = AI_ML_SERIES.map((series) => ({
  id: `aiml:${series.slug}`,
  title: series.detailTitle || series.title,
  description: series.subtitle,
  href: getAiMlSeriesHref(series),
  section: "AI/ML Series",
  keywords: [series.slug, ...series.tags, ...series.keywords, ...series.focusAreas],
}));

const blogPosts: SiteSearchItem[] = LOCAL_BLOG_POSTS.map((post) => ({
  id: `blog:${post.slug}`,
  title: post.title,
  description: post.excerpt,
  href: `/blog/${post.slug}`,
  section: "Blog Posts",
  keywords: [post.slug, ...(post.tags || []), post.level || "", post.seriesName || ""].filter(Boolean),
}));

const articles: SiteSearchItem[] = Object.entries(rawArticles).map(([filePath, rawHtml]) => {
  const slug = toSlug(filePath);
  const plain = extractHtmlText(rawHtml);
  const title = extractHtmlTitle(rawHtml, slug.replace(/-/g, " "));
  return {
    id: `article:${slug}`,
    title,
    description: toExcerpt(plain),
    href: `/articles/${slug}`,
    section: "Articles" as const,
    keywords: [slug, "article", title],
  };
});

const scriptures: SiteSearchItem[] = Object.entries(rawScriptures).map(([filePath, rawHtml]) => {
  const slug = toSlug(filePath);
  const plain = extractHtmlText(rawHtml);
  const title = extractHtmlTitle(rawHtml, slug.replace(/-/g, " "));
  return {
    id: `scripture:${slug}`,
    title,
    description: toExcerpt(plain),
    href: `/scriptures/${slug}`,
    section: "Scriptures" as const,
    keywords: [slug, "scripture", title],
  };
});

export const SITE_SEARCH_ITEMS: SiteSearchItem[] = [
  ...mainPages,
  ...projects,
  ...engineeringSeries,
  ...aiMlSeries,
  ...blogPosts,
  ...articles,
  ...scriptures,
];
