import type { CourseCatalogItem } from "@/content/courses";

const svgDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const splitTitle = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [value];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")].filter(Boolean);
};

const pickPalette = (source: string) => {
  const lower = source.toLowerCase();

  if (/\bai|llm|agent|openai|langchain|machine learning|deep learning\b/.test(lower)) {
    return { from: "#0b1120", via: "#6d28d9", to: "#0f766e", accent: "#c084fc", soft: "#ddd6fe", line: "rgba(221,214,254,0.24)" };
  }
  if (/\bazure|aws|gcp|cloud|devops|terraform|docker|kubernetes\b/.test(lower)) {
    return { from: "#082f49", via: "#0369a1", to: "#164e63", accent: "#38bdf8", soft: "#bae6fd", line: "rgba(186,230,253,0.24)" };
  }
  if (/\bmicroservices|kafka|redis|postgres|messaging|streaming\b/.test(lower)) {
    return { from: "#031525", via: "#0f766e", to: "#172554", accent: "#22d3ee", soft: "#a5f3fc", line: "rgba(165,243,252,0.24)" };
  }
  if (/\bsolid|design patterns|architecture|\.net|c#|web api|architect\b/.test(lower)) {
    return { from: "#14082e", via: "#7c3aed", to: "#1f2937", accent: "#c084fc", soft: "#e9d5ff", line: "rgba(233,213,255,0.24)" };
  }
  return { from: "#111827", via: "#2563eb", to: "#0891b2", accent: "#38bdf8", soft: "#bfdbfe", line: "rgba(191,219,254,0.24)" };
};

const getPattern = (source: string, accent: string, line: string) => {
  const lower = source.toLowerCase();

  if (/\bai|llm|agent|openai|langchain|machine learning|deep learning\b/.test(lower)) {
    return `<circle cx="874" cy="180" r="94" fill="rgba(255,255,255,.06)" stroke="${line}" /><circle cx="874" cy="180" r="26" fill="${accent}" /><path d="M874 72v-42M874 330v-42M766 180h-42M982 180h-42M800 106l-30-30M948 254l30 30M948 106l30-30M800 254l-30 30" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (/\bazure|aws|gcp|cloud|devops|terraform|docker|kubernetes\b/.test(lower)) {
    return `<rect x="736" y="100" width="118" height="80" rx="20" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="900" y="100" width="118" height="80" rx="20" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="818" y="220" width="118" height="80" rx="20" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="736" y="340" width="118" height="80" rx="20" fill="rgba(255,255,255,.08)" stroke="${line}" /><rect x="900" y="340" width="118" height="80" rx="20" fill="rgba(255,255,255,.08)" stroke="${line}" /><path d="M854 140h46M878 180v42M878 300v40M854 380h46" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (/\bmicroservices|kafka|redis|postgres|messaging|streaming\b/.test(lower)) {
    return `<rect x="748" y="108" width="292" height="250" rx="34" fill="rgba(255,255,255,.06)" stroke="${line}" /><path d="M786 166h214M826 220h174M772 276h228" stroke="${line}" stroke-width="4" stroke-linecap="round"/><path d="M860 148c34 0 60 27 60 60v24H800v-24c0-33 27-60 60-60Z" fill="none" stroke="${accent}" stroke-width="12"/><rect x="792" y="228" width="136" height="92" rx="24" fill="rgba(255,255,255,.08)" stroke="${accent}" stroke-width="8"/>`;
  }
  if (/\bsolid|design patterns|architecture|\.net|c#|web api|architect\b/.test(lower)) {
    return `<path d="M760 430 878 122l118 308" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M812 284h132" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/><circle cx="760" cy="430" r="18" fill="${accent}" /><circle cx="878" cy="122" r="18" fill="${accent}" /><circle cx="996" cy="430" r="18" fill="${accent}" />`;
  }
  return `<path d="M700 392c96-78 206-104 332-80" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/><path d="M680 454c124-58 236-74 350-48" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/><circle cx="758" cy="190" r="18" fill="${accent}" /><circle cx="870" cy="138" r="14" fill="${accent}" /><circle cx="976" cy="214" r="18" fill="${accent}" />`;
};

export const getCourseVisual = (
  course: Pick<CourseCatalogItem, "title" | "category" | "tags" | "thumbnail" | "slug">
) => {
  if (course.thumbnail) return course.thumbnail;

  const source = `${course.title} ${course.category} ${course.tags.join(" ")}`;
  const palette = pickPalette(source);
  const lines = splitTitle(course.title).map(escapeXml);
  const label = escapeXml(course.tags.slice(0, 2).join(" • ") || course.category);
  const pattern = getPattern(source, palette.accent, palette.line);

  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(course.title)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.from}" /><stop offset="50%" stop-color="${palette.via}" /><stop offset="100%" stop-color="${palette.to}" /></linearGradient></defs><rect width="1200" height="720" fill="url(#bg)" /><g opacity=".12" stroke="#fff"><path d="M0 108h1200M0 216h1200M0 324h1200M0 432h1200M0 540h1200M0 648h1200"/><path d="M120 0v720M280 0v720M440 0v720M600 0v720M760 0v720M920 0v720M1080 0v720"/></g><rect x="70" y="72" width="566" height="576" rx="36" fill="rgba(9,12,22,.3)" stroke="rgba(255,255,255,.14)" /><rect x="104" y="106" width="286" height="52" rx="26" fill="rgba(255,255,255,.1)" /><text x="132" y="140" fill="${palette.soft}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${label}</text><text x="104" y="240" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="800">${lines[0] || ""}</text>${lines[1] ? `<text x="104" y="314" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="800">${lines[1]}</text>` : ""}<text x="104" y="${lines[1] ? 388 : 330}" fill="rgba(255,255,255,.82)" font-family="Inter, Arial, sans-serif" font-size="24">${escapeXml(course.category)}</text>${pattern}</svg>`
  );
};
