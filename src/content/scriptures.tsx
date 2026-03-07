import { BookOpen, FileText, Sparkles, type LucideIcon } from "lucide-react";

export type ScriptureReligion = "Hinduism" | "Islam" | "Christianity" | "Buddhism" | "General";

export type ScriptureRecord = {
  slug: string;
  title: string;
  religion: ScriptureReligion;
  symbol: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  imageSrc: string;
  rawHtml: string;
  plainText: string;
  assetUrl: string;
};

const rawScriptures = import.meta.glob("./Scriptures/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const scriptureAssetUrls = import.meta.glob("./Scriptures/*.html", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FALLBACK_DATE = new Date("2026-03-07T00:00:00").toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const SCRIPTURE_ICONS: LucideIcon[] = [BookOpen, FileText, Sparkles];

const stripScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

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

const matchFirst = (value: string, regex: RegExp) => value.match(regex)?.[1]?.trim() || "";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const symbolCard = (symbol: string, religion: ScriptureReligion) => {
  const palette: Record<ScriptureReligion, { from: string; to: string }> = {
    Hinduism: { from: "#FF7A18", to: "#AF002D" },
    Islam: { from: "#0F4C35", to: "#0C1F3F" },
    Christianity: { from: "#1D4ED8", to: "#1E3A8A" },
    Buddhism: { from: "#8B5E3C", to: "#C9972E" },
    General: { from: "#1E3A8A", to: "#312E81" },
  };

  const selected = palette[religion] || palette.General;
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 360\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"${selected.from}\"/><stop offset=\"100%\" stop-color=\"${selected.to}\"/></linearGradient></defs><rect width=\"640\" height=\"360\" fill=\"url(#g)\"/><circle cx=\"500\" cy=\"90\" r=\"68\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"120\" cy=\"280\" r=\"84\" fill=\"rgba(255,255,255,0.08)\"/><text x=\"320\" y=\"210\" text-anchor=\"middle\" font-family=\"Georgia,serif\" font-size=\"148\" fill=\"#ffffff\" fill-opacity=\"0.95\">${escapeXml(
    symbol,
  )}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const detectReligion = (title: string, text: string): ScriptureReligion => {
  const source = `${title} ${text}`.toLowerCase();
  if (/\bbhagavad\b|\bgita\b|krishna|arjuna|om\b|hindu/i.test(source)) return "Hinduism";
  if (/\bquran\b|\bquoran\b|allah|surah|islam|islamic|bismillah/i.test(source)) return "Islam";
  if (/\bbible\b|\bchrist\b|\bchristian\b|\bgospel\b|\bold testament\b|\bnew testament\b|\bjesus\b/i.test(source)) {
    return "Christianity";
  }
  if (/\bbuddh\b|\bbuddha\b|\bdharma\b|\bsangha\b|\bnirvana\b|\btripitaka\b|\bsutta\b/i.test(source)) {
    return "Buddhism";
  }
  return "General";
};

const religionConfig = (religion: ScriptureReligion) => {
  if (religion === "Hinduism") {
    return {
      symbol: "ॐ",
      tags: ["Scripture", "Bhagavad Gita", "Hinduism", "Spirituality"],
    };
  }
  if (religion === "Islam") {
    return {
      symbol: "☪",
      tags: ["Scripture", "Holy Quran", "Islam", "Guidance"],
    };
  }
  if (religion === "Christianity") {
    return {
      symbol: "✝",
      tags: ["Scripture", "Holy Bible", "Christianity", "Faith"],
    };
  }
  if (religion === "Buddhism") {
    return {
      symbol: "☸",
      tags: ["Scripture", "Buddhism", "Dharma", "Mindfulness"],
    };
  }
  return {
    symbol: "✦",
    tags: ["Scripture", "Wisdom", "Faith", "Guide"],
  };
};

const buildScriptureRecord = (filePath: string, html: string, assetUrl: string): ScriptureRecord => {
  const safeHtml = stripScripts(html);
  const body = matchFirst(safeHtml, /<body[^>]*>([\s\S]*?)<\/body>/i) || safeHtml;
  const plainText = stripTags(body);
  const fileName = filePath.split("/").pop() || "scripture.html";
  const slug = toSlug(fileName);
  const title = matchFirst(safeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) || slug.replace(/-/g, " ");
  const description =
    matchFirst(safeHtml, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    matchFirst(body, /<p[^>]*class=["'][^"']*hero-desc[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
    stripTags(matchFirst(body, /<p[^>]*>([\s\S]*?)<\/p>/i)) ||
    "Explore this scripture with clear chapters, practical meaning, and study guidance.";

  const religion =
    fileName.toLowerCase().includes("quran") || fileName.toLowerCase().includes("quoran")
      ? "Islam"
      : fileName.toLowerCase().includes("bible")
      ? "Christianity"
      : fileName.toLowerCase().includes("buddh")
      ? "Buddhism"
      : fileName.toLowerCase().includes("gita")
      ? "Hinduism"
      : detectReligion(title, plainText);
  const config = religionConfig(religion);
  const readMinutes = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));

  return {
    slug,
    title,
    religion,
    symbol: config.symbol,
    description,
    publishedAt: FALLBACK_DATE,
    readMinutes,
    tags: config.tags,
    imageSrc: symbolCard(config.symbol, religion),
    rawHtml: safeHtml,
    plainText,
    assetUrl,
  };
};

export const SCRIPTURES: ScriptureRecord[] = Object.entries(rawScriptures)
  .map(([filePath, html]) => buildScriptureRecord(filePath, html, scriptureAssetUrls[filePath] || ""))
  .sort((a, b) => {
    const explicitOrder: Record<string, number> = {
      "bhagavad-gita-guide": 0,
      "holy-quran-complete-guide": 1,
      "holy-bible-complete-guide": 2,
      "buddhism-complete-guide": 3,
    };
    const religionOrder: Record<ScriptureReligion, number> = {
      Hinduism: 0,
      Islam: 1,
      Christianity: 2,
      Buddhism: 3,
      General: 4,
    };

    const rank = (item: ScriptureRecord) => {
      const explicit = explicitOrder[item.slug];
      if (typeof explicit === "number") return explicit;
      if (item.slug.includes("bhagavad-gita")) return 0;
      if (item.slug.includes("quran") || item.slug.includes("quoran")) return 1;
      if (item.slug.includes("bible")) return 2;
      if (item.slug.includes("buddh")) return 3;
      return 10 + (religionOrder[item.religion] ?? 9);
    };

    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    return a.title.localeCompare(b.title);
  });

export const SCRIPTURES_BY_SLUG = new Map(SCRIPTURES.map((item) => [item.slug, item]));

export const SCRIPTURE_HOME_LINKS = [
  {
    title: "Articles",
    to: "/articles",
    description: "Explore engineering and AI long-form guides.",
  },
  {
    title: "Blogs",
    to: "/blogs",
    description: "Browse all website blog series.",
  },
];

export const getScriptureFolderPath = () => "src/content/Scriptures";

export const getScriptureUploadHint = () =>
  "Drop new .html files into src/content/Scriptures and they will appear automatically as cards and routes.";
