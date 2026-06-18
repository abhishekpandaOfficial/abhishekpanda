import type { BlogIndexRow } from "@/hooks/usePublishedPersonalBlogs";
import type { BlogSeriesTrack } from "@/lib/blogSeries";

type VisualTheme = "dark" | "light";

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

type VisualPalette = {
  from: string;
  via: string;
  to: string;
  accent: string;
  soft: string;
  line: string;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHex = (hexA: string, hexB: string, weight: number) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const ratio = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
};

const getThemedPalette = (base: VisualPalette, theme: VisualTheme): VisualPalette => {
  if (theme === "dark") return base;

  return {
    from: mixHex(base.from, "#ffffff", 0.82),
    via: mixHex(base.via, "#ffffff", 0.72),
    to: mixHex(base.to, "#ffffff", 0.8),
    accent: mixHex(base.accent, "#0f172a", 0.18),
    soft: "#0f172a",
    line: "rgba(15,23,42,0.12)",
  };
};

const SERIES_PALETTES: Record<string, VisualPalette> = {
  "csharp-mastery": { from: "#0f1021", via: "#5b21b6", to: "#1d4ed8", accent: "#a78bfa", soft: "#ede9fe", line: "rgba(237,233,254,0.24)" },
  "linq-mastery": { from: "#071a16", via: "#0f766e", to: "#14532d", accent: "#34d399", soft: "#d1fae5", line: "rgba(209,250,229,0.24)" },
  "dotnet-mastery": { from: "#081120", via: "#0f4c81", to: "#164e63", accent: "#38bdf8", soft: "#dbeafe", line: "rgba(219,234,254,0.24)" },
  "efcore-mastery": { from: "#0b1623", via: "#14532d", to: "#0f766e", accent: "#2dd4bf", soft: "#ccfbf1", line: "rgba(204,251,241,0.24)" },
  "solid-principles": { from: "#111827", via: "#4f46e5", to: "#0f172a", accent: "#93c5fd", soft: "#dbeafe", line: "rgba(219,234,254,0.24)" },
  "design-patterns": { from: "#23110a", via: "#c2410c", to: "#7c2d12", accent: "#fdba74", soft: "#ffedd5", line: "rgba(255,237,213,0.24)" },
  "microservices-mastery": { from: "#081a20", via: "#0369a1", to: "#0f766e", accent: "#67e8f9", soft: "#cffafe", line: "rgba(207,250,254,0.24)" },
  "kafka-mastery": { from: "#181127", via: "#6d28d9", to: "#111827", accent: "#c084fc", soft: "#f3e8ff", line: "rgba(243,232,255,0.24)" },
  "docker-mastery": { from: "#08111e", via: "#0b5cab", to: "#0f766e", accent: "#7dd3fc", soft: "#e0f2fe", line: "rgba(224,242,254,0.24)" },
  "blazor-mastery": { from: "#120d24", via: "#7c3aed", to: "#1d4ed8", accent: "#c4b5fd", soft: "#ede9fe", line: "rgba(237,233,254,0.24)" },
  "golang-mastery": { from: "#04131b", via: "#007d9c", to: "#0f766e", accent: "#7de3ff", soft: "#d6f7ff", line: "rgba(214,247,255,0.24)" },
  "linux-mastery": { from: "#061107", via: "#166534", to: "#0a4f1d", accent: "#86efac", soft: "#dcfce7", line: "rgba(220,252,231,0.24)" },
  "devops-mastery": { from: "#0c1726", via: "#1d4ed8", to: "#155e75", accent: "#7dd3fc", soft: "#e0f2fe", line: "rgba(224,242,254,0.24)" },
  "ai-ml-mastery": { from: "#0b1120", via: "#6d28d9", to: "#0f766e", accent: "#c084fc", soft: "#ddd6fe", line: "rgba(221,214,254,0.24)" },
  "databases-mastery": { from: "#082f49", via: "#0f766e", to: "#164e63", accent: "#22d3ee", soft: "#a5f3fc", line: "rgba(165,243,252,0.24)" },
  "agile-mastery": { from: "#271904", via: "#ca8a04", to: "#854d0e", accent: "#fde047", soft: "#fef9c3", line: "rgba(254,249,195,0.24)" },
  "angular-mastery": { from: "#170b11", via: "#be123c", to: "#1d4ed8", accent: "#fb7185", soft: "#ffe4e6", line: "rgba(255,228,230,0.24)" },
  "next-js-mastery": { from: "#09090b", via: "#334155", to: "#1f2937", accent: "#e2e8f0", soft: "#f8fafc", line: "rgba(248,250,252,0.24)" },
  "blockchain-mastery": { from: "#1f2937", via: "#f59e0b", to: "#7c2d12", accent: "#fbbf24", soft: "#fde68a", line: "rgba(253,230,138,0.24)" },
  "azure-mastery": { from: "#071a2f", via: "#005fb8", to: "#0f766e", accent: "#38bdf8", soft: "#e0f2fe", line: "rgba(224,242,254,0.24)" },
  "aws-mastery": { from: "#24150a", via: "#f97316", to: "#7c2d12", accent: "#fdba74", soft: "#ffedd5", line: "rgba(255,237,213,0.24)" },
  "gcp-mastery": { from: "#0b1727", via: "#15803d", to: "#0f766e", accent: "#86efac", soft: "#dcfce7", line: "rgba(220,252,231,0.24)" },
  "deep-learning-mastery": { from: "#0c1024", via: "#7c3aed", to: "#1e1b4b", accent: "#c4b5fd", soft: "#ede9fe", line: "rgba(237,233,254,0.24)" },
  "machine-learning-mastery": { from: "#062838", via: "#0891b2", to: "#0f766e", accent: "#67e8f9", soft: "#cffafe", line: "rgba(207,250,254,0.24)" },
  "mathematics-mastery": { from: "#061a2d", via: "#0369a1", to: "#0f766e", accent: "#7dd3fc", soft: "#e0f2fe", line: "rgba(224,242,254,0.24)" },
  "statistics-mastery": { from: "#071b19", via: "#0f766e", to: "#14532d", accent: "#6ee7b7", soft: "#d1fae5", line: "rgba(209,250,229,0.24)" },
  "python-mastery": { from: "#23180a", via: "#ca8a04", to: "#1d4ed8", accent: "#fde047", soft: "#fef9c3", line: "rgba(254,249,195,0.24)" },
  "numpy-mastery": { from: "#07152b", via: "#1d4ed8", to: "#0f766e", accent: "#93c5fd", soft: "#dbeafe", line: "rgba(219,234,254,0.24)" },
  "pandas-mastery": { from: "#120d24", via: "#7c3aed", to: "#1e293b", accent: "#c4b5fd", soft: "#ede9fe", line: "rgba(237,233,254,0.24)" },
  "matplotlib-mastery": { from: "#2b1408", via: "#ea580c", to: "#7c2d12", accent: "#fdba74", soft: "#ffedd5", line: "rgba(255,237,213,0.24)" },
  "seaborn-mastery": { from: "#1b1028", via: "#db2777", to: "#4f46e5", accent: "#f9a8d4", soft: "#fce7f3", line: "rgba(252,231,243,0.24)" },
  "feature-engineering-mastery": { from: "#08201a", via: "#16a34a", to: "#0f766e", accent: "#86efac", soft: "#dcfce7", line: "rgba(220,252,231,0.24)" },
  "machine-learning-core-mastery": { from: "#062838", via: "#0891b2", to: "#0f766e", accent: "#67e8f9", soft: "#cffafe", line: "rgba(207,250,254,0.24)" },
  "deep-learning-core-mastery": { from: "#0c1024", via: "#7c3aed", to: "#1e1b4b", accent: "#c4b5fd", soft: "#ede9fe", line: "rgba(237,233,254,0.24)" },
  "nlp-mastery": { from: "#140b25", via: "#9333ea", to: "#0f766e", accent: "#d8b4fe", soft: "#f3e8ff", line: "rgba(243,232,255,0.24)" },
  "blockchain-zero-to-hero": { from: "#2b1408", via: "#d97706", to: "#7c2d12", accent: "#fcd34d", soft: "#fef3c7", line: "rgba(254,243,199,0.24)" },
  "nlp-llm-mastery": { from: "#140b25", via: "#9333ea", to: "#0f766e", accent: "#d8b4fe", soft: "#f3e8ff", line: "rgba(243,232,255,0.24)" },
  "computer-vision-mastery": { from: "#1f1024", via: "#db2777", to: "#4338ca", accent: "#f9a8d4", soft: "#fce7f3", line: "rgba(252,231,243,0.24)" },
  "web3-series": { from: "#0d1728", via: "#2563eb", to: "#7c3aed", accent: "#93c5fd", soft: "#dbeafe", line: "rgba(219,234,254,0.24)" },
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

const getFallbackSeriesPattern = (source: string, accent: string, line: string) => {
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

const getSeriesPattern = (series: BlogSeriesTrack, palette: VisualPalette) => {
  const { accent, line, soft } = palette;

  switch (series.slug) {
    case "csharp-mastery":
      return `<rect x="736" y="92" width="300" height="210" rx="28" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <text x="886" y="174" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="116" font-weight="800">C#</text>
        <path d="M760 356h256M760 396h202M760 436h232" stroke="${line}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="778" cy="132" r="8" fill="${accent}"/><circle cx="808" cy="132" r="8" fill="${accent}"/><circle cx="838" cy="132" r="8" fill="${accent}"/>`;
    case "linq-mastery":
      return `<rect x="728" y="100" width="108" height="72" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="872" y="100" width="108" height="72" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="800" y="236" width="108" height="72" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M836 136h32M916 136h28M854 172l28 52M926 172l-28 52" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <text x="854" y="286" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="34" font-weight="700">where</text>
        <path d="M744 392c96 14 186 18 274 12" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "dotnet-mastery":
      return `<circle cx="886" cy="172" r="118" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <circle cx="886" cy="172" r="74" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="790" y="286" width="192" height="126" rx="24" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <text x="886" y="188" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="800">.NET</text>
        <text x="886" y="350" text-anchor="middle" fill="${accent}" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700">CLR · JIT · GC</text>`;
    case "efcore-mastery":
      return `<ellipse cx="886" cy="122" rx="126" ry="38" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <path d="M760 122v170c0 21 56 38 126 38s126-17 126-38V122" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M760 176c0 21 56 38 126 38s126-17 126-38M760 230c0 21 56 38 126 38s126-17 126-38" fill="none" stroke="${line}" />
        <rect x="764" y="374" width="110" height="60" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="896" y="374" width="110" height="60" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M874 404h22" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "solid-principles":
      return `<rect x="732" y="92" width="62" height="132" rx="20" fill="rgba(56,189,248,.22)" stroke="${line}" />
        <rect x="808" y="92" width="62" height="132" rx="20" fill="rgba(251,146,60,.22)" stroke="${line}" />
        <rect x="884" y="92" width="62" height="132" rx="20" fill="rgba(74,222,128,.22)" stroke="${line}" />
        <rect x="960" y="92" width="62" height="132" rx="20" fill="rgba(244,114,182,.22)" stroke="${line}" />
        <rect x="846" y="246" width="62" height="132" rx="20" fill="rgba(250,204,21,.22)" stroke="${line}" />
        <text x="763" y="170" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">S</text>
        <text x="839" y="170" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">O</text>
        <text x="915" y="170" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">L</text>
        <text x="991" y="170" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">I</text>
        <text x="877" y="324" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">D</text>`;
    case "design-patterns":
      return `<circle cx="886" cy="164" r="46" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <circle cx="774" cy="110" r="26" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <circle cx="998" cy="110" r="26" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <circle cx="774" cy="246" r="26" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <circle cx="998" cy="246" r="26" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <path d="M798 120 850 148M974 120 922 148M798 236 850 180M974 236 922 180" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <text x="886" y="174" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="800">Patterns</text>`;
    case "microservices-mastery":
      return `<rect x="730" y="104" width="92" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="844" y="104" width="92" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="958" y="104" width="92" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="786" y="238" width="92" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="900" y="238" width="92" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="840" y="370" width="98" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M822 135h18M936 135h18M833 166l18 58M947 166l-18 58M886 300v66" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "kafka-mastery":
      return `<rect x="730" y="102" width="300" height="270" rx="30" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M766 146h230M766 206h230M766 266h230M766 326h230" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="804" cy="146" r="12" fill="${accent}" /><circle cx="876" cy="206" r="12" fill="${accent}" /><circle cx="948" cy="266" r="12" fill="${accent}" /><circle cx="1020" cy="326" r="12" fill="${accent}" />
        <text x="886" y="426" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700">partitions · streams · offsets</text>`;
    case "docker-mastery":
      return `<rect x="728" y="104" width="304" height="220" rx="30" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="772" y="160" width="54" height="54" rx="12" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <rect x="842" y="160" width="54" height="54" rx="12" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <rect x="912" y="160" width="54" height="54" rx="12" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <rect x="982" y="160" width="54" height="54" rx="12" fill="${accent}" opacity=".9" />
        <path d="M806 214v48M876 214v48M946 214v48M1010 214v48M770 262h268" stroke="${line}" stroke-width="7" stroke-linecap="round"/>
        <path d="M760 392c48-36 102-56 162-56 62 0 118 20 168 56" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <text x="886" y="446" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="26" font-weight="700">images · compose · registries</text>`;
    case "blazor-mastery":
      return `<rect x="748" y="100" width="276" height="232" rx="30" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <path d="M804 152h164M804 196h164M804 240h104" stroke="${line}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="790" cy="154" r="14" fill="${accent}" />
        <circle cx="790" cy="198" r="14" fill="${accent}" />
        <circle cx="790" cy="242" r="14" fill="${accent}" />
        <path d="M756 392c56-42 118-64 186-64s130 22 186 64" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <text x="886" y="454" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800">Blazor</text>`;
    case "golang-mastery":
      return `<circle cx="790" cy="154" r="18" fill="${accent}" />
        <circle cx="886" cy="118" r="18" fill="${accent}" />
        <circle cx="982" cy="154" r="18" fill="${accent}" />
        <circle cx="838" cy="262" r="18" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <circle cx="934" cy="262" r="18" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <path d="M808 154h60M904 118l60 36M808 154l30 96M964 154l-30 96M856 262h60" fill="none" stroke="${line}" stroke-width="8" stroke-linecap="round"/>
        <text x="886" y="370" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800">go</text>
        <text x="886" y="424" text-anchor="middle" fill="${accent}" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700">goroutines · channels · services</text>`;
    case "linux-mastery":
      return `<rect x="742" y="102" width="288" height="252" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M782 150h208M782 196h158M782 242h190M782 288h126" stroke="${line}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="760" cy="150" r="14" fill="${accent}" />
        <circle cx="760" cy="196" r="14" fill="${accent}" />
        <circle cx="760" cy="242" r="14" fill="${accent}" />
        <circle cx="760" cy="288" r="14" fill="${accent}" />
        <text x="886" y="430" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="34" font-weight="700">$ sudo mastery</text>`;
    case "devops-mastery":
      return `<path d="M754 182c0-44 34-80 78-80 28 0 52 12 68 32 16-20 40-32 68-32 44 0 78 36 78 80s-34 80-78 80c-28 0-52-12-68-32-16 20-40 32-68 32-44 0-78-36-78-80Z" fill="none" stroke="${accent}" stroke-width="14"/>
        <rect x="748" y="352" width="84" height="46" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="844" y="352" width="84" height="46" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="940" y="352" width="84" height="46" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />`;
    case "ai-ml-mastery":
      return `<circle cx="886" cy="174" r="94" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <circle cx="832" cy="146" r="12" fill="${accent}" /><circle cx="886" cy="120" r="12" fill="${accent}" /><circle cx="940" cy="146" r="12" fill="${accent}" />
        <circle cx="832" cy="202" r="12" fill="${accent}" /><circle cx="886" cy="228" r="12" fill="${accent}" /><circle cx="940" cy="202" r="12" fill="${accent}" />
        <path d="M832 146 886 120 940 146 940 202 886 228 832 202 832 146" fill="none" stroke="${line}" stroke-width="5"/>`;
    case "databases-mastery":
      return `<ellipse cx="886" cy="118" rx="124" ry="36" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <path d="M762 118v176c0 20 56 36 124 36s124-16 124-36V118" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M762 174c0 20 56 36 124 36s124-16 124-36M762 230c0 20 56 36 124 36s124-16 124-36" fill="none" stroke="${line}" />
        <path d="M748 388c90-42 184-42 276 0" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "agile-mastery":
      return `<rect x="736" y="102" width="86" height="252" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="844" y="102" width="86" height="252" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="952" y="102" width="86" height="252" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="754" y="142" width="50" height="36" rx="10" fill="${accent}" />
        <rect x="862" y="194" width="50" height="36" rx="10" fill="${accent}" />
        <rect x="970" y="246" width="50" height="36" rx="10" fill="${accent}" />`;
    case "angular-mastery":
      return `<path d="M886 84 1004 130 982 286 886 340 790 286 768 130Z" fill="rgba(255,255,255,.07)" stroke="${line}" stroke-width="6" />
        <path d="M886 130 952 274h-38l-16-38h-24l-16 38h-38L886 130Z" fill="none" stroke="${accent}" stroke-width="12" stroke-linejoin="round"/>
        <path d="M874 206h24" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
    case "next-js-mastery":
      return `<circle cx="886" cy="186" r="116" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <text x="886" y="210" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="118" font-weight="800">N</text>
        <path d="M776 358c62-34 128-46 220-42" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
    case "blockchain-mastery":
      return `<rect x="754" y="126" width="88" height="88" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="844" y="214" width="88" height="88" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="934" y="126" width="88" height="88" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M842 170h92M886 214v-40M932 170h4" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "azure-mastery":
      return `<path d="M784 276c0-52 40-94 92-94 12-42 50-72 96-72 56 0 102 46 102 102 36 6 64 38 64 76 0 42-34 76-76 76H814c-44 0-80-36-80-80 0-36 24-66 58-74Z" fill="rgba(255,255,255,.07)" stroke="${line}" stroke-width="6"/>
        <rect x="780" y="392" width="92" height="54" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="886" y="392" width="92" height="54" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="992" y="392" width="92" height="54" rx="16" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M872 420h14M978 420h14" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "aws-mastery":
      return `<path d="M774 274c0-54 42-98 96-98 10-44 48-76 96-76 58 0 104 46 104 104 34 8 60 38 60 74 0 42-34 76-76 76H808c-46 0-84-38-84-84 0-36 22-66 50-78Z" fill="rgba(255,255,255,.06)" stroke="${line}" stroke-width="6"/>
        <path d="M804 402c56 22 144 20 204-8" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <path d="M988 392l28 10-28 12" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "gcp-mastery":
      return `<circle cx="834" cy="202" r="74" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <circle cx="938" cy="202" r="74" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <circle cx="886" cy="138" r="74" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M834 202c0-30 24-54 52-54M938 202c0 30-24 54-52 54M886 138c28 0 50 22 50 50" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
    case "deep-learning-mastery":
      return `<circle cx="776" cy="126" r="12" fill="${accent}" /><circle cx="776" cy="210" r="12" fill="${accent}" /><circle cx="776" cy="294" r="12" fill="${accent}" />
        <circle cx="886" cy="168" r="12" fill="${accent}" /><circle cx="886" cy="252" r="12" fill="${accent}" />
        <circle cx="996" cy="126" r="12" fill="${accent}" /><circle cx="996" cy="210" r="12" fill="${accent}" /><circle cx="996" cy="294" r="12" fill="${accent}" />
        <path d="M788 126 874 168 788 210 874 252 788 294M898 168 984 126M898 168 984 210M898 252 984 210M898 252 984 294" fill="none" stroke="${line}" stroke-width="5"/>`;
    case "machine-learning-mastery":
      return `<rect x="738" y="100" width="296" height="286" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M774 336V148M774 336h218" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="818" cy="290" r="10" fill="${accent}" /><circle cx="860" cy="248" r="10" fill="${accent}" /><circle cx="918" cy="216" r="10" fill="${accent}" /><circle cx="968" cy="172" r="10" fill="${accent}" />
        <path d="M806 302 980 160" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    case "mathematics-mastery":
      return `<rect x="742" y="104" width="290" height="252" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M774 320 860 176 930 246 998 130" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M772 332h246M792 126c34 24 54 54 62 92" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>
        <text x="884" y="412" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700">vectors · gradients · matrices</text>`;
    case "statistics-mastery":
      return `<rect x="742" y="102" width="292" height="284" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="786" y="248" width="34" height="86" rx="10" fill="${accent}" />
        <rect x="840" y="204" width="34" height="130" rx="10" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <rect x="894" y="172" width="34" height="162" rx="10" fill="${accent}" />
        <rect x="948" y="228" width="34" height="106" rx="10" fill="rgba(255,255,255,.08)" stroke="${line}" />
        <path d="M774 148c46-26 82-40 112-40 34 0 72 18 118 58" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "python-mastery":
      return `<path d="M790 104h78c34 0 52 20 52 50v54h-96c-26 0-42 14-42 40v44c0 30 20 48 50 48h82c28 0 46-18 46-46v-52h-102c-24 0-38-14-38-36" fill="rgba(255,255,255,.06)" stroke="${line}" stroke-width="6"/>
        <path d="M982 428h-78c-34 0-52-20-52-50v-54h96c26 0 42-14 42-40v-44c0-30-20-48-50-48h-82c-28 0-46 18-46 46v52h102c24 0 38 14 38 36" fill="rgba(255,255,255,.06)" stroke="${accent}" stroke-width="6"/>
        <circle cx="844" cy="150" r="8" fill="${accent}" /><circle cx="928" cy="382" r="8" fill="${soft}" />`;
    case "numpy-mastery":
      return `<rect x="754" y="108" width="86" height="86" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="848" y="184" width="86" height="86" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="942" y="260" width="86" height="86" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M840 152h8M934 228h8M1028 304h8M840 194 848 194M934 270 942 270" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <path d="M754 388c96-30 190-36 284-18" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "pandas-mastery":
      return `<rect x="744" y="112" width="286" height="258" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M744 178h286M744 244h286M840 112v258M936 112v258" stroke="${line}" stroke-width="6"/>
        <rect x="840" y="178" width="96" height="66" fill="${accent}" opacity=".28" />
        <rect x="936" y="244" width="94" height="126" fill="${accent}" opacity=".2" />`;
    case "matplotlib-mastery":
      return `<rect x="748" y="104" width="280" height="286" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M786 332V150M786 332h206" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
        <path d="M806 296 854 246 912 260 970 176" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="854" cy="246" r="9" fill="${soft}" /><circle cx="912" cy="260" r="9" fill="${soft}" /><circle cx="970" cy="176" r="9" fill="${soft}" />`;
    case "seaborn-mastery":
      return `<rect x="742" y="104" width="292" height="286" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <path d="M798 316c12-86 38-132 78-132 34 0 54 28 64 82 10 42 30 62 56 62" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <path d="M786 352h212" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="876" cy="184" r="18" fill="rgba(255,255,255,.08)" stroke="${line}" /><circle cx="956" cy="274" r="16" fill="rgba(255,255,255,.08)" stroke="${line}" />`;
    case "feature-engineering-mastery":
      return `<rect x="738" y="108" width="298" height="274" rx="28" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="776" y="150" width="70" height="56" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="776" y="228" width="70" height="56" rx="14" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="922" y="188" width="74" height="96" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M846 178h42M846 256h42M886 178v78M922 236h-18" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <text x="886" y="344" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700">clean → encode → scale</text>`;
    case "machine-learning-core-mastery":
      return `<rect x="730" y="108" width="300" height="278" rx="30" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="760" y="150" width="74" height="74" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="850" y="150" width="74" height="74" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <rect x="940" y="150" width="74" height="74" rx="18" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <text x="797" y="194" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="800">S</text>
        <text x="887" y="194" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="800">U</text>
        <text x="977" y="194" text-anchor="middle" fill="${soft}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="800">R</text>
        <path d="M797 224v62M887 224v62M977 224v62" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <path d="M797 286h180" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
        <text x="886" y="350" text-anchor="middle" fill="${soft}" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700">supervised · unsupervised · reinforcement</text>`;
    case "deep-learning-core-mastery":
      return `<circle cx="776" cy="126" r="12" fill="${accent}" /><circle cx="776" cy="210" r="12" fill="${accent}" /><circle cx="776" cy="294" r="12" fill="${accent}" />
        <circle cx="886" cy="168" r="12" fill="${accent}" /><circle cx="886" cy="252" r="12" fill="${accent}" />
        <circle cx="996" cy="126" r="12" fill="${accent}" /><circle cx="996" cy="210" r="12" fill="${accent}" /><circle cx="996" cy="294" r="12" fill="${accent}" />
        <path d="M788 126 874 168 788 210 874 252 788 294M898 168 984 126M898 168 984 210M898 252 984 210M898 252 984 294" fill="none" stroke="${line}" stroke-width="5"/>`;
    case "nlp-mastery":
      return `<path d="M758 136h216c28 0 50 22 50 50v52c0 28-22 50-50 50H858l-58 52v-52h-42c-28 0-50-22-50-50v-52c0-28 22-50 50-50Z" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <circle cx="810" cy="212" r="10" fill="${accent}" /><circle cx="886" cy="212" r="10" fill="${accent}" /><circle cx="962" cy="212" r="10" fill="${accent}" />
        <path d="M748 392c88-20 180-16 272 12" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "blockchain-zero-to-hero":
      return `<rect x="760" y="98" width="252" height="88" rx="22" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <rect x="788" y="224" width="196" height="68" rx="20" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <rect x="824" y="330" width="124" height="88" rx="22" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <path d="M886 186v38M886 292v38" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
    case "nlp-llm-mastery":
      return `<path d="M758 136h216c28 0 50 22 50 50v52c0 28-22 50-50 50H858l-58 52v-52h-42c-28 0-50-22-50-50v-52c0-28 22-50 50-50Z" fill="rgba(255,255,255,.06)" stroke="${line}" />
        <circle cx="810" cy="212" r="10" fill="${accent}" /><circle cx="886" cy="212" r="10" fill="${accent}" /><circle cx="962" cy="212" r="10" fill="${accent}" />
        <path d="M748 392c88-20 180-16 272 12" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "computer-vision-mastery":
      return `<rect x="746" y="104" width="280" height="220" rx="30" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <rect x="792" y="148" width="188" height="132" rx="20" fill="rgba(255,255,255,.05)" stroke="${line}" />
        <circle cx="886" cy="214" r="44" fill="none" stroke="${accent}" stroke-width="10" />
        <circle cx="886" cy="214" r="10" fill="${accent}" />
        <path d="M782 392c74-34 154-44 228-28" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/>`;
    case "web3-series":
      return `<circle cx="776" cy="180" r="28" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <circle cx="886" cy="118" r="28" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <circle cx="996" cy="180" r="28" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <circle cx="830" cy="302" r="28" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <circle cx="942" cy="302" r="28" fill="rgba(255,255,255,.07)" stroke="${line}" />
        <path d="M798 166 864 132 974 166M798 194 842 284M974 194 930 284M858 302h56" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
    default:
      return getFallbackSeriesPattern(`${series.title} ${series.subtitle} ${series.tags.join(" ")} ${series.keywords.join(" ")}`, accent, line);
  }
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

export const getBlogSeriesVisual = (series: BlogSeriesTrack, theme: VisualTheme = "light") => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")} ${series.keywords.join(" ")}`;
  const palette = getThemedPalette(SERIES_PALETTES[series.slug] || pickPalette(source), theme);
  const lines = splitTitle(series.title, 2).map(escapeXml);
  const label = escapeXml(series.tags.slice(0, 2).join(" • ") || "Series");
  const pattern = getSeriesPattern(series, palette);
  const gridStroke = theme === "dark" ? "#ffffff" : "#0f172a";
  const gridOpacity = theme === "dark" ? ".12" : ".08";
  const panelFill = theme === "dark" ? "rgba(9,12,22,.3)" : "rgba(255,255,255,.72)";
  const panelStroke = theme === "dark" ? "rgba(255,255,255,.14)" : "rgba(15,23,42,.12)";
  const chipFill = theme === "dark" ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.9)";
  const titleColor = theme === "dark" ? "#ffffff" : "#0f172a";
  const subtitleColor = theme === "dark" ? "rgba(255,255,255,.82)" : "rgba(15,23,42,.72)";

  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(series.title)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.from}" /><stop offset="48%" stop-color="${palette.via}" /><stop offset="100%" stop-color="${palette.to}" /></linearGradient></defs><rect width="1200" height="720" fill="url(#bg)" /><g opacity="${gridOpacity}" stroke="${gridStroke}"><path d="M0 108h1200M0 216h1200M0 324h1200M0 432h1200M0 540h1200M0 648h1200"/><path d="M120 0v720M280 0v720M440 0v720M600 0v720M760 0v720M920 0v720M1080 0v720"/></g><rect x="70" y="72" width="562" height="576" rx="36" fill="${panelFill}" stroke="${panelStroke}" /><rect x="104" y="106" width="260" height="52" rx="26" fill="${chipFill}" /><text x="132" y="140" fill="${palette.soft}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${label}</text><text x="104" y="236" fill="${titleColor}" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800">${lines[0] || ""}</text>${lines[1] ? `<text x="104" y="308" fill="${titleColor}" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800">${lines[1]}</text>` : ""}<text x="104" y="${lines[1] ? 384 : 330}" fill="${subtitleColor}" font-family="Inter, Arial, sans-serif" font-size="25">${escapeXml(series.subtitle).slice(0, 78)}</text><text x="104" y="${lines[1] ? 418 : 364}" fill="${subtitleColor}" font-family="Inter, Arial, sans-serif" font-size="25">${escapeXml(series.subtitle).slice(78, 154)}</text>${pattern}</svg>`
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
