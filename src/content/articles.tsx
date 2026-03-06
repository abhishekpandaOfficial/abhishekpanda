import { Code2, FileStack, Lock, Newspaper, ScanSearch, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  SiBrave,
  SiDuckduckgo,
  SiFirefoxbrowser,
  SiGooglechrome,
  SiProtonvpn,
  SiTorbrowser,
  SiUblockorigin,
} from "react-icons/si";
import type { IconType } from "react-icons";

export type ArticleTone = "danger" | "warning" | "info" | "success";

export type ArticleLink = {
  title: string;
  to: string;
  description?: string;
};

export type ArticleLogo = {
  name: string;
  icon: IconType | LucideIcon;
  colorClass: string;
  bgClass: string;
};

export type ArticleRecord = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  heroLabel: string;
  heroValue: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  logos: ArticleLogo[];
  keyPoints: string[];
  relatedBlogs: ArticleLink[];
  rawHtml: string;
  plainText: string;
  assetUrl: string;
};

const MAX_ARTICLE_TAGS = 4;
const MAX_ARTICLE_LOGOS = 3;
const MAX_ARTICLE_KEY_POINTS = 3;

const rawArticles = import.meta.glob("./Articles/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const articleAssetUrls = import.meta.glob("./Articles/*.html", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FALLBACK_DATE = new Date("2026-03-06T00:00:00").toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const LOGO_RULES: Array<{
  match: RegExp;
  name: string;
  icon: IconType | LucideIcon;
  colorClass: string;
  bgClass: string;
}> = [
  {
    match: /\bbrave\b/i,
    name: "Brave",
    icon: SiBrave,
    colorClass: "text-orange-500 dark:text-orange-300",
    bgClass: "bg-orange-500/10 border-orange-500/25",
  },
  {
    match: /\bfirefox\b/i,
    name: "Firefox",
    icon: SiFirefoxbrowser,
    colorClass: "text-amber-500 dark:text-amber-300",
    bgClass: "bg-amber-500/10 border-amber-500/25",
  },
  {
    match: /\bchrome\b/i,
    name: "Chrome",
    icon: SiGooglechrome,
    colorClass: "text-sky-500 dark:text-sky-300",
    bgClass: "bg-sky-500/10 border-sky-500/25",
  },
  {
    match: /\bublock|uBlock Origin\b/i,
    name: "uBlock",
    icon: SiUblockorigin,
    colorClass: "text-rose-500 dark:text-rose-300",
    bgClass: "bg-rose-500/10 border-rose-500/25",
  },
  {
    match: /\btor\b/i,
    name: "Tor",
    icon: SiTorbrowser,
    colorClass: "text-violet-500 dark:text-violet-300",
    bgClass: "bg-violet-500/10 border-violet-500/25",
  },
  {
    match: /\bprotonvpn|mullvad|vpn\b/i,
    name: "VPN",
    icon: SiProtonvpn,
    colorClass: "text-cyan-500 dark:text-cyan-300",
    bgClass: "bg-cyan-500/10 border-cyan-500/25",
  },
  {
    match: /\b\.net|dotnet|asp\.net|c#|solid\b/i,
    name: ".NET",
    icon: Code2,
    colorClass: "text-violet-500 dark:text-violet-300",
    bgClass: "bg-violet-500/10 border-violet-500/25",
  },
  {
    match: /\bduckduckgo|search engine|search\b/i,
    name: "Private Search",
    icon: SiDuckduckgo,
    colorClass: "text-orange-500 dark:text-orange-300",
    bgClass: "bg-orange-500/10 border-orange-500/25",
  },
];

const BLOG_LINKS_BY_TAG: Array<{
  match: RegExp;
  links: ArticleLink[];
}> = [
  {
    match: /\bprivacy|security|tracking|surveillance\b/i,
    links: [
      {
        title: "Engineering Blog",
        to: "/blog",
        description: "Long-form engineering writing and internal website content.",
      },
      {
        title: "Blog Aggregator",
        to: "/blogs",
        description: "Official writing feed across website-linked publishing channels.",
      },
    ],
  },
];

const stripScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

const stripStyles = (html: string) => html.replace(/<style[\s\S]*?<\/style>/gi, "");

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const matchFirst = (html: string, regex: RegExp) => html.match(regex)?.[1]?.trim() || "";

const extractClassText = (html: string, className: string) => {
  const regex = new RegExp(`<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i");
  return stripTags(matchFirst(html, regex));
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const extractBody = (html: string) => {
  const body = matchFirst(html, /<body[^>]*>([\s\S]*?)<\/body>/i);
  return body || html;
};

const extractHeadings = (bodyHtml: string) => {
  const matches = Array.from(bodyHtml.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi));
  return matches
    .map((entry) => stripTags(entry[1]))
    .filter(Boolean)
    .slice(0, 4);
};

const extractParagraphs = (bodyHtml: string) => {
  const matches = Array.from(bodyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
  return matches
    .map((entry) => stripTags(entry[1]))
    .filter(Boolean)
    .slice(0, 6);
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const countMatches = (source: string, pattern: RegExp) => {
  const matches = source.match(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`));
  return matches?.length || 0;
};

const deriveTags = (html: string, text: string, title: string) => {
  const keywords = matchFirst(html, /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const detected: string[] = [];
  const lower = `${title} ${text}`.toLowerCase();
  const solidScore = countMatches(lower, /\bsolid|single responsibility|open-closed|liskov|interface segregation|dependency inversion\b/i);
  const dotnetScore = countMatches(lower, /\b\.net|dotnet|asp\.net|c#|dependency injection|di container\b/i);

  if (solidScore >= 2 || /\bsolid\b/.test(lower)) detected.push("SOLID");
  if (dotnetScore >= 1) detected.push(".NET");
  if (solidScore >= 1 || /\barchitecture|architect|domain model|clean architecture\b/.test(lower)) detected.push("Architecture");
  if (solidScore >= 1 || /\binterface|dependency inversion|single responsibility|open-closed|liskov|isp\b/.test(lower)) {
    detected.push("Design");
  }
  if (/\boop|object-oriented|inheritance|polymorphism\b/.test(lower)) detected.push("OOP");
  if ((solidScore === 0 && dotnetScore === 0) && /\bprivacy|surveillance|tracking\b/.test(lower)) detected.push("Privacy");
  if ((solidScore === 0 && dotnetScore === 0) && /\bsecurity|fingerprint|vpn|cookies\b/.test(lower)) detected.push("Security");
  if ((solidScore === 0 && dotnetScore === 0) && /\bbig tech|google|advertiser|ad id\b/.test(lower)) detected.push("Big Tech");
  if ((solidScore === 0 && dotnetScore === 0) && /\bcountermeasure|defense|fight back|protect\b/.test(lower)) {
    detected.push("Countermeasures");
  }
  if ((solidScore === 0 && dotnetScore === 0) && /\bcloud|azure|aws\b/.test(lower)) detected.push("Cloud");
  if ((solidScore === 0 && dotnetScore === 0) && /\bai|ml|llm|agentic\b/.test(lower)) detected.push("AI");

  return unique([...keywords, ...detected]).slice(0, MAX_ARTICLE_TAGS);
};

const deriveLogos = (source: string, tags: string[]) => {
  const signals = `${source} ${tags.join(" ")}`;
  const hits = LOGO_RULES.filter((rule) => rule.match.test(signals)).slice(0, MAX_ARTICLE_LOGOS);
  const fallbackLogos = [
    {
      name: "Articles",
      icon: Newspaper,
      colorClass: "text-primary",
      bgClass: "bg-primary/10 border-primary/25",
    },
    {
      name: "Research",
      icon: ScanSearch,
      colorClass: "text-cyan-600 dark:text-cyan-300",
      bgClass: "bg-cyan-500/10 border-cyan-500/25",
    },
    {
      name: "Security",
      icon: ShieldCheck,
      colorClass: "text-emerald-600 dark:text-emerald-300",
      bgClass: "bg-emerald-500/10 border-emerald-500/25",
    },
  ];
  const merged = [...hits];
  for (const fallback of fallbackLogos) {
    if (merged.length >= MAX_ARTICLE_LOGOS) break;
    if (merged.some((item) => item.name === fallback.name)) continue;
    merged.push(fallback);
  }
  return merged;
};

const deriveDescription = (html: string, paragraphs: string[], title: string) => {
  const metaDescription = matchFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (metaDescription) return metaDescription;
  if (paragraphs[0]) return paragraphs[0];
  return `${title} rendered from uploaded HTML and routed through the Articles experience.`;
};

const deriveRelatedBlogs = (tags: string[]) => {
  const source = tags.join(" ");
  const matched = BLOG_LINKS_BY_TAG.find((entry) => entry.match.test(source));
  if (matched) return matched.links;
  return [
    {
      title: "Engineering Blog",
      to: "/blog",
      description: "Internal long-form blog content from this website.",
    },
    {
      title: "Blog Aggregator",
      to: "/blogs",
      description: "Website-linked writing and article discovery.",
    },
  ];
};

const buildArticleRecord = (filePath: string, html: string, assetUrl: string): ArticleRecord => {
  const safeHtml = stripScripts(html);
  const bodyHtml = extractBody(safeHtml);
  const plainText = stripTags(bodyHtml);
  const fileName = filePath.split("/").pop() || "article.html";
  const slug = toSlug(fileName);
  const title = matchFirst(safeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) || toTitleCase(slug);
  const headings = extractHeadings(bodyHtml);
  const paragraphs = extractParagraphs(bodyHtml);
  const heroSub = extractClassText(bodyHtml, "hero-sub");
  const sectionDesc = extractClassText(bodyHtml, "section-desc");
  const heroTag = extractClassText(bodyHtml, "hero-tag");
  const statValue = extractClassText(bodyHtml, "stat-num");
  const previewText = [heroSub, sectionDesc, ...headings, ...paragraphs.slice(0, 3)].filter(Boolean).join(" ");
  const tags = deriveTags(safeHtml, previewText || plainText, title);
  const logos = deriveLogos(`${title} ${previewText}`, tags);
  const description = heroSub || sectionDesc || deriveDescription(safeHtml, paragraphs, title);
  const intro = paragraphs[0] || description;
  const firstPercent = statValue || plainText.match(/\b\d{1,3}%\b/)?.[0] || `${Math.max(1, Math.ceil(plainText.split(/\s+/).length / 40))} min`;
  const heroLabel = /\bexposure|score|risk|threat\b/i.test(plainText)
    ? "Signal"
    : /\bprinciples|examples|use cases|antipatterns\b/i.test(plainText)
      ? "Coverage"
      : "Readiness";
  const readMinutes = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));
  const normalizedKeyPoints = unique([...headings.slice(1), ...paragraphs.slice(0, 3)])
    .filter((point) => point && point.length <= 140)
    .slice(0, MAX_ARTICLE_KEY_POINTS);

  return {
    slug,
    title,
    eyebrow: heroTag || headings[0] || "Articles Hub",
    description,
    intro,
    heroLabel,
    heroValue: firstPercent,
    publishedAt: FALLBACK_DATE,
    readMinutes,
    tags,
    logos,
    keyPoints: normalizedKeyPoints,
    relatedBlogs: deriveRelatedBlogs(tags),
    rawHtml: safeHtml,
    plainText,
    assetUrl,
  };
};

export const ARTICLES: ArticleRecord[] = Object.entries(rawArticles)
  .map(([filePath, html]) => buildArticleRecord(filePath, html, articleAssetUrls[filePath] || ""))
  .sort((a, b) => a.title.localeCompare(b.title));

export const ARTICLES_BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export const ARTICLES_HOME_LINKS: ArticleLink[] = [
  {
    title: "Engineering Blog",
    to: "/blog",
    description: "Deep dives, tutorials, and internal website blog content.",
  },
  {
    title: "Blog Aggregator",
    to: "/blogs",
    description: "Cross-platform writing surfaced through this website.",
  },
];

export const ARTICLE_ACCENT_CLASSES: Record<ArticleTone, string> = {
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const ARTICLE_TONE_BAR_CLASSES: Record<ArticleTone, string> = {
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-cyan-500",
  success: "bg-emerald-500",
};

export const FEATURED_ARTICLE_ICON = FileStack;
export const ARTICLE_HUB_ICONS = [SiGooglechrome, SiFirefoxbrowser, SiDuckduckgo];

export const getRelatedArticles = (article: ArticleRecord, limit = 3) =>
  ARTICLES.filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      article: candidate,
      score: candidate.tags.filter((tag) => article.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.article);

export const getRenderableArticleHtml = (article: ArticleRecord) => {
  return article.rawHtml;
};

export const getRenderableArticleInlineHtml = (article: ArticleRecord) => {
  const withoutScripts = stripScripts(article.rawHtml);
  const styles = withoutScripts.match(/<style[\s\S]*?<\/style>/gi)?.join("\n") || "";
  const links = withoutScripts.match(/<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)?.join("\n") || "";
  const body = extractBody(withoutScripts);

  return `
    ${links}
    ${styles}
    <style>
      :host, html, body {
        margin: 0;
        padding: 0;
      }
      img, svg, video, canvas {
        max-width: 100%;
      }
    </style>
    ${body}
  `;
};

export const getArticleFolderPath = () => "src/content/Articles";

export const getArticleUploadHint = () =>
  "Drop new .html files into src/content/Articles and Vite will surface them as cards and routed article pages.";

export const getPlainPreview = (article: ArticleRecord) =>
  stripStyles(article.rawHtml)
    .replace(/\s+/g, " ")
    .trim();
