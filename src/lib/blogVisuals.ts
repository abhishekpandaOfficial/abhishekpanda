import type { BlogIndexRow } from "@/hooks/usePublishedPersonalBlogs";
import type { BlogSeriesTrack } from "@/lib/blogSeries";

const svgDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const splitTitle = (value: string, parts = 2) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [value];
  const chunk = Math.ceil(words.length / parts);
  const lines: string[] = [];
  for (let index = 0; index < words.length; index += chunk) {
    lines.push(words.slice(index, index + chunk).join(" "));
  }
  return lines.slice(0, parts);
};

const pickPalette = (source: string) => {
  const lower = source.toLowerCase();

  if (/\bai|llm|nlp|deep learning|machine learning|computer vision|model\b/.test(lower)) {
    return { from: "#0b1120", via: "#6d28d9", to: "#0f766e", accent: "#c084fc", soft: "#ddd6fe", line: "rgba(221,214,254,0.24)" };
  }
  if (/\bcloud|aws|azure|gcp|devops|platform|kubernetes|docker|terraform\b/.test(lower)) {
    return { from: "#0a2540", via: "#0369a1", to: "#0f766e", accent: "#38bdf8", soft: "#bae6fd", line: "rgba(186,230,253,0.24)" };
  }
  if (/\bweb3|blockchain|ethereum|bitcoin|wallet|smart contract\b/.test(lower)) {
    return { from: "#1f2937", via: "#f59e0b", to: "#7c2d12", accent: "#fbbf24", soft: "#fde68a", line: "rgba(253,230,138,0.24)" };
  }
  if (/\bangular|next|react|frontend|typescript|rxjs\b/.test(lower)) {
    return { from: "#111827", via: "#ec4899", to: "#2563eb", accent: "#f472b6", soft: "#fbcfe8", line: "rgba(251,207,232,0.24)" };
  }
  if (/\bdata|sql|postgres|mongodb|redis|database\b/.test(lower)) {
    return { from: "#082f49", via: "#0891b2", to: "#164e63", accent: "#22d3ee", soft: "#a5f3fc", line: "rgba(165,243,252,0.24)" };
  }
  return { from: "#14082e", via: "#7c3aed", to: "#1f2937", accent: "#c084fc", soft: "#e9d5ff", line: "rgba(233,213,255,0.24)" };
};

const getSeriesPattern = (source: string, accent: string, line: string) => {
  const lower = source.toLowerCase();
  if (/\bai|llm|nlp|deep learning|machine learning|computer vision|model\b/.test(lower)) {
    return `<circle cx="884" cy="170" r="96" fill="rgba(255,255,255,.06)" stroke="${line}" /><circle cx="884" cy="170" r="28" fill="${accent}" /><path d="M884 56v-42M884 326v-42M770 170h-42M998 170h-42M806 92l-32-32M962 248l32 32M962 92l32-32M806 248l-32 32" stroke="${accent}" stroke-width="8" stroke-linecap="round"/><path d="M730 418c98-66 198-87 310-66" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (/\bcloud|aws|azure|gcp|devops|platform|kubernetes|docker|terraform\b/.test(lower)) {
    return `<rect x="742" y="92" width="120" height="82" rx="22" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="910" y="92" width="120" height="82" rx="22" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="826" y="220" width="120" height="82" rx="22" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="742" y="348" width="120" height="82" rx="22" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="910" y="348" width="120" height="82" rx="22" fill="rgba(255,255,255,.08)" stroke="${line}" /><path d="M862 133h48M886 174v46M886 302v46M862 388h48" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (/\bweb3|blockchain|ethereum|bitcoin|wallet|smart contract\b/.test(lower)) {
    return `<circle cx="886" cy="180" r="112" fill="rgba(255,255,255,.05)" stroke="${line}" /><path d="M886 92 956 180 886 268 816 180Z" fill="none" stroke="${accent}" stroke-width="14" stroke-linejoin="round"/><circle cx="808" cy="356" r="18" fill="${accent}" /><circle cx="886" cy="412" r="18" fill="${accent}" /><circle cx="976" cy="352" r="18" fill="${accent}" /><path d="M808 356 886 412 976 352" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (/\bangular|next|react|frontend|typescript|rxjs\b/.test(lower)) {
    return `<circle cx="810" cy="168" r="58" fill="${accent}" opacity=".9" /><circle cx="944" cy="132" r="72" fill="rgba(255,255,255,.08)" /><rect x="760" y="252" width="250" height="150" rx="26" fill="rgba(255,255,255,.08)" stroke="${line}" /><path d="M790 316h188M790 350h132" stroke="${line}" stroke-width="6" stroke-linecap="round"/><path d="M742 480c88-56 192-74 306-52" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (/\bdata|sql|postgres|mongodb|redis|database\b/.test(lower)) {
    return `<ellipse cx="882" cy="130" rx="128" ry="42" fill="rgba(255,255,255,.08)" stroke="${line}" /><path d="M754 130v198c0 23 57 42 128 42s128-19 128-42V130" fill="rgba(255,255,255,.05)" stroke="${line}" /><path d="M754 196c0 23 57 42 128 42s128-19 128-42M754 262c0 23 57 42 128 42s128-19 128-42" fill="none" stroke="${line}" /><path d="M742 480c98-52 194-60 288-24" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  }
  return `<path d="M772 420 884 122l112 298" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M820 280h126" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/><circle cx="772" cy="420" r="18" fill="${accent}" /><circle cx="884" cy="122" r="18" fill="${accent}" /><circle cx="996" cy="420" r="18" fill="${accent}" />`;
};

const getPostPattern = (source: string, accent: string, line: string) => {
  const lower = source.toLowerCase();
  if (/\bsecurity|privacy|tracking|surveillance\b/.test(lower)) {
    return `<rect x="690" y="110" width="280" height="190" rx="30" fill="rgba(255,255,255,.06)" stroke="${line}" /><path d="M830 148c34 0 60 27 60 60v22H770v-22c0-33 27-60 60-60Z" fill="none" stroke="${accent}" stroke-width="12"/><rect x="762" y="224" width="136" height="88" rx="24" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-width="8"/><circle cx="830" cy="266" r="14" fill="${accent}" />`;
  }
  if (/\breact|next|angular|frontend|typescript\b/.test(lower)) {
    return `<circle cx="824" cy="178" r="82" fill="rgba(255,255,255,.06)" stroke="${line}" /><circle cx="824" cy="178" r="24" fill="${accent}" /><path d="M824 78c44 0 90 24 112 58-22 36-68 60-112 60-44 0-90-24-112-60 22-34 68-58 112-58Zm0 204c44 0 90-24 112-58-22-36-68-60-112-60-44 0-90 24-112 60 22 34 68 58 112 58Z" fill="none" stroke="${accent}" stroke-width="6"/>`;
  }
  return `<path d="M700 386c98-80 204-108 324-84" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/><path d="M674 450c122-54 238-70 356-46" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/><circle cx="760" cy="182" r="18" fill="${accent}" /><circle cx="864" cy="130" r="14" fill="${accent}" /><circle cx="964" cy="206" r="18" fill="${accent}" /><path d="M760 182 864 130 964 206" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`;
};

export const getBlogSeriesVisual = (series: BlogSeriesTrack) => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")} ${series.keywords.join(" ")}`;
  const palette = pickPalette(source);
  const lines = splitTitle(series.title, 2).map(escapeXml);
  const label = escapeXml(series.tags.slice(0, 2).join(" • ") || "Series");
  const pattern = getSeriesPattern(source, palette.accent, palette.line);

  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(series.title)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.from}" /><stop offset="48%" stop-color="${palette.via}" /><stop offset="100%" stop-color="${palette.to}" /></linearGradient></defs><rect width="1200" height="720" fill="url(#bg)" /><g opacity=".12" stroke="#fff"><path d="M0 108h1200M0 216h1200M0 324h1200M0 432h1200M0 540h1200M0 648h1200"/><path d="M120 0v720M280 0v720M440 0v720M600 0v720M760 0v720M920 0v720M1080 0v720"/></g><rect x="70" y="72" width="562" height="576" rx="36" fill="rgba(9,12,22,.3)" stroke="rgba(255,255,255,.14)" /><rect x="104" y="106" width="260" height="52" rx="26" fill="rgba(255,255,255,.1)" /><text x="132" y="140" fill="${palette.soft}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${label}</text><text x="104" y="236" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800">${lines[0] || ""}</text>${lines[1] ? `<text x="104" y="308" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800">${lines[1]}</text>` : ""}<text x="104" y="${lines[1] ? 384 : 330}" fill="rgba(255,255,255,.82)" font-family="Inter, Arial, sans-serif" font-size="25">${escapeXml(series.subtitle).slice(0, 78)}</text><text x="104" y="${lines[1] ? 418 : 364}" fill="rgba(255,255,255,.82)" font-family="Inter, Arial, sans-serif" font-size="25">${escapeXml(series.subtitle).slice(78, 154)}</text>${pattern}</svg>`
  );
};

export const getBlogPostVisual = (post: Pick<BlogIndexRow, "title" | "excerpt" | "tags" | "hero_image" | "level" | "slug" | "series_name">) => {
  if (post.hero_image) return post.hero_image;

  const source = `${post.title} ${post.excerpt || ""} ${(post.tags || []).join(" ")} ${post.level || ""} ${post.series_name || ""}`;
  const palette = pickPalette(source);
  const lines = splitTitle(post.title, 2).map(escapeXml);
  const label = escapeXml((post.tags || []).slice(0, 2).join(" • ") || post.level || "Blog");
  const pattern = getPostPattern(source, palette.accent, palette.line);

  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(post.title)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.from}" /><stop offset="50%" stop-color="${palette.via}" /><stop offset="100%" stop-color="${palette.to}" /></linearGradient></defs><rect width="1200" height="720" fill="url(#bg)" /><g opacity=".12" stroke="#fff"><path d="M0 120h1200M0 240h1200M0 360h1200M0 480h1200M0 600h1200"/><path d="M120 0v720M260 0v720M400 0v720M540 0v720M680 0v720M820 0v720M960 0v720M1100 0v720"/></g><rect x="72" y="72" width="526" height="576" rx="34" fill="rgba(7,12,22,.28)" stroke="rgba(255,255,255,.14)" /><rect x="106" y="106" width="264" height="50" rx="25" fill="rgba(255,255,255,.1)" /><text x="136" y="139" fill="${palette.soft}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${label}</text><text x="106" y="244" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${lines[0] || ""}</text>${lines[1] ? `<text x="106" y="320" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${lines[1]}</text>` : ""}<text x="106" y="${lines[1] ? 398 : 334}" fill="rgba(255,255,255,.82)" font-family="Inter, Arial, sans-serif" font-size="24">${escapeXml(post.excerpt || post.title).slice(0, 84)}</text>${pattern}</svg>`
  );
};
