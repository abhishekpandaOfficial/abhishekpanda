import { BarChart3, BadgeCheck, Code2, FileStack, Lock, Newspaper, ScanSearch, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  SiApachekafka,
  SiAmazonwebservices,
  SiBrave,
  SiBitly,
  SiBluesky,
  SiDocker,
  SiDuckduckgo,
  SiFirefoxbrowser,
  SiGooglechrome,
  SiGoogle,
  SiOpenai,
  SiReddit,
  SiProtonvpn,
  SiRabbitmq,
  SiSlack,
  SiSpotify,
  SiStripe,
  SiTorbrowser,
  SiUblockorigin,
  SiUber,
  SiWhatsapp,
  SiX,
  SiYoutube,
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
  icon?: IconType | LucideIcon;
  imageSrc?: string;
  colorClass?: string;
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
  heroImage: string;
  featured: boolean;
  featuredRank: number | null;
};

const MAX_ARTICLE_TAGS = 7;
const MAX_ARTICLE_LOGOS = 3;
const MAX_CASE_STUDY_LOGOS = 8;
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

const CUSTOM_ARTICLE_HERO_IMAGES: Record<string, string> = {
  "12-ai-architectures": "/article-heroes/12-ai-architectures.svg",
  "15-case-studies-dotnet": "/article-heroes/15-case-studies-dotnet.svg",
  "digital-privacy-dashboard": "/article-heroes/digital-privacy-dashboard.svg",
  "dotnet-mastery-2026": "/article-heroes/dotnet-mastery-2026.svg",
  "microservices-patterns-dotnet": "/article-heroes/microservices-patterns-dotnet.svg",
  "solid-principles-guide": "/article-heroes/solid-principles-guide.svg",
};

const ARTICLE_METADATA_OVERRIDES: Record<
  string,
  Partial<
    Pick<ArticleRecord, "title" | "eyebrow" | "description" | "heroLabel" | "heroValue" | "publishedAt" | "featured" | "featuredRank">
  > & {
    tags?: string[];
  }
> = {
  "system-design-10m-users-dotnet": {
    title: "How to Design a System Handling 10M Users in .NET",
    eyebrow: "Scale Blueprint",
    description: "A systems design walkthrough for building .NET platforms that stay resilient, observable, and cost-aware at 10 million users.",
    heroLabel: "Scale Target",
    heroValue: "10M users",
    publishedAt: "March 15, 2026",
    featured: true,
    featuredRank: 2,
    tags: [".NET", "System Design", "Scalability", "Architecture", "Cloud Native"],
  },
  "csharp-multithreading-zero-to-hero": {
    title: "Multithreading: Zero to Hero - C# Complete Guide",
    eyebrow: "Concurrency Mastery",
    description: "A practical C# multithreading guide covering threads, tasks, synchronization, async coordination, and production-safe concurrency patterns.",
    heroLabel: "Coverage",
    heroValue: "Zero to Hero",
    publishedAt: "March 14, 2026",
    featured: true,
    featuredRank: 3,
    tags: [".NET", "C#", "Multithreading", "Concurrency", "Architecture"],
  },
  "csharp-evolution-modern-reference": {
    title: "C# 12, 13, 14 and .NET 8, 9, 10 - Complete Modern Reference",
    eyebrow: "C# Evolution",
    description: "A modern C# and .NET evolution guide covering C# 12 through C# 14, .NET 8 through .NET 10, real-world examples, performance notes, and migration-ready patterns.",
    heroLabel: "Coverage",
    heroValue: "C# 12 to 14",
    publishedAt: "March 15, 2026",
    featured: true,
    featuredRank: 1,
    tags: [".NET", "C#", "Language Evolution", ".NET 10", "Architecture", "Modern C#"],
  },
  "collections-delegates-reflection-deep-dive": {
    title: "Collections, Delegates, Events & Reflection Deep Dive",
    eyebrow: "C# Language Internals",
    description: "A deep C# reference covering legacy and generic collections, delegates, events, reflection, real-world usage patterns, and richly annotated code walkthroughs.",
    heroLabel: "Deep Dive",
    heroValue: "C# internals",
    publishedAt: "March 15, 2026",
    featured: false,
    featuredRank: null,
    tags: [".NET", "C#", "Collections", "Delegates", "Reflection", "Events"],
  },
};

const FALLBACK_DATE = new Date("2026-03-06T00:00:00").toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const brandLogo = (name: string, color = "FFFFFF") => `https://cdn.simpleicons.org/${name}/${color}`;
const svgLogo = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const exchangeLogo = svgLogo(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 10 12l4 4 6-8"/><path d="M18 8h2v2"/><path d="M4 20h16"/></svg>',
);
const slackLogo = svgLogo(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>',
);
const awsLogo = svgLogo(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/></svg>',
);
const openAiLogo = svgLogo(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>',
);

const COMPANY_LOGO_RULES: Array<{
  match: RegExp;
  name: string;
  icon?: IconType | LucideIcon;
  imageSrc?: string;
  colorClass?: string;
  bgClass: string;
}> = [
  {
    match: /\bwhatsapp\b/i,
    name: "WhatsApp",
    icon: SiWhatsapp,
    imageSrc: brandLogo("whatsapp"),
    colorClass: "text-[#25D366]",
    bgClass: "bg-[#25D366]/12 border-[#25D366]/30",
  },
  {
    match: /\bspotify\b/i,
    name: "Spotify",
    icon: SiSpotify,
    imageSrc: brandLogo("spotify"),
    colorClass: "text-[#1DB954]",
    bgClass: "bg-[#1DB954]/12 border-[#1DB954]/30",
  },
  {
    match: /\btwitter timeline\b|\btwitter\b|\bx timeline\b/i,
    name: "X",
    icon: SiX,
    imageSrc: brandLogo("x"),
    colorClass: "text-white",
    bgClass: "bg-white/10 border-white/20",
  },
  {
    match: /\bstock exchange\b|\bnasdaq\b|\bmatching engine\b/i,
    name: "NASDAQ",
    icon: BarChart3,
    imageSrc: exchangeLogo,
    colorClass: "text-[#003087]",
    bgClass: "bg-[#003087]/12 border-[#003087]/30",
  },
  {
    match: /\breddit\b/i,
    name: "Reddit",
    icon: SiReddit,
    imageSrc: brandLogo("reddit"),
    colorClass: "text-[#FF4500]",
    bgClass: "bg-[#FF4500]/12 border-[#FF4500]/30",
  },
  {
    match: /\bpayment system\b|\bstripe\b|\bcard networks?\b/i,
    name: "Stripe",
    icon: SiStripe,
    imageSrc: brandLogo("stripe"),
    colorClass: "text-[#635BFF]",
    bgClass: "bg-[#635BFF]/12 border-[#635BFF]/30",
  },
  {
    match: /\buber\b/i,
    name: "Uber",
    icon: SiUber,
    imageSrc: brandLogo("uber"),
    colorClass: "text-white",
    bgClass: "bg-white/10 border-white/20",
  },
  {
    match: /\bgoogle search\b|\bgoogle\b/i,
    name: "Google",
    icon: SiGoogle,
    imageSrc: brandLogo("google"),
    colorClass: "text-[#4285F4]",
    bgClass: "bg-[#4285F4]/12 border-[#4285F4]/30",
  },
  {
    match: /\bslack\b/i,
    name: "Slack",
    icon: SiSlack,
    imageSrc: slackLogo,
    colorClass: "text-[#E01E5A]",
    bgClass: "bg-[#E01E5A]/12 border-[#E01E5A]/30",
  },
  {
    match: /\bchatgpt\b|\bopenai\b/i,
    name: "OpenAI",
    icon: SiOpenai,
    imageSrc: openAiLogo,
    colorClass: "text-[#10A37F]",
    bgClass: "bg-[#10A37F]/12 border-[#10A37F]/30",
  },
  {
    match: /\byoutube\b/i,
    name: "YouTube",
    icon: SiYoutube,
    imageSrc: brandLogo("youtube"),
    colorClass: "text-[#FF0000]",
    bgClass: "bg-[#FF0000]/12 border-[#FF0000]/30",
  },
  {
    match: /\baws s3\b|\bamazon s3\b|\bs3\b/i,
    name: "AWS",
    icon: SiAmazonwebservices,
    imageSrc: awsLogo,
    colorClass: "text-[#FF9900]",
    bgClass: "bg-[#FF9900]/12 border-[#FF9900]/30",
  },
  {
    match: /\bbluesky\b/i,
    name: "Bluesky",
    icon: SiBluesky,
    imageSrc: brandLogo("bluesky"),
    colorClass: "text-[#0085FF]",
    bgClass: "bg-[#0085FF]/12 border-[#0085FF]/30",
  },
  {
    match: /\burl shortener\b|\bbitly\b|\bbit\.ly\b/i,
    name: "Bitly",
    icon: SiBitly,
    imageSrc: brandLogo("bitly"),
    colorClass: "text-[#2563EB]",
    bgClass: "bg-[#2563EB]/12 border-[#2563EB]/30",
  },
  {
    match: /\bapache kafka\b|\bkafka\b/i,
    name: "Kafka",
    icon: SiApachekafka,
    imageSrc: brandLogo("apachekafka"),
    colorClass: "text-white",
    bgClass: "bg-white/10 border-white/20",
  },
];

const LOGO_RULES: Array<{
  match: RegExp;
  name: string;
  icon?: IconType | LucideIcon;
  imageSrc?: string;
  colorClass?: string;
  bgClass: string;
}> = [
  {
    match: /\bmicroservices?|distributed systems?|api gateway|service mesh|saga pattern|bounded contexts?|strangler fig\b/i,
    name: "Microservices",
    icon: FileStack,
    colorClass: "text-cyan-600 dark:text-cyan-300",
    bgClass: "bg-cyan-500/10 border-cyan-500/25",
  },
  {
    match: /\bkafka\b/i,
    name: "Kafka",
    icon: SiApachekafka,
    colorClass: "text-orange-600 dark:text-orange-300",
    bgClass: "bg-orange-500/10 border-orange-500/25",
  },
  {
    match: /\brabbitmq|masstransit|async messaging|event-driven\b/i,
    name: "Messaging",
    icon: SiRabbitmq,
    colorClass: "text-amber-600 dark:text-amber-300",
    bgClass: "bg-amber-500/10 border-amber-500/25",
  },
  {
    match: /\bdocker|kubernetes|dapr|yarp|cloud-native\b/i,
    name: "Cloud Native",
    icon: SiDocker,
    colorClass: "text-sky-600 dark:text-sky-300",
    bgClass: "bg-sky-500/10 border-sky-500/25",
  },
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
        to: "/cheatsheets",
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

const resolveMediaUrl = (src: string, assetUrl: string) => {
  if (!src) return "";
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;

  try {
    return new URL(src, assetUrl).toString();
  } catch {
    return src;
  }
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const splitTitleForCover = (title: string) => {
  const words = title.trim().split(/\s+/);
  const midpoint = Math.max(2, Math.ceil(words.length / 2));
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")].filter(Boolean);
};

const getHeroPalette = (tags: string[], title: string, description: string) => {
  const source = `${tags.join(" ")} ${title} ${description}`.toLowerCase();

  if (/\bprivacy|security|risk|threat|tracking|surveillance\b/.test(source)) {
    return {
      from: "#020617",
      via: "#0f766e",
      to: "#0f172a",
      accent: "#2dd4bf",
      accentSoft: "#99f6e4",
      panel: "rgba(15, 23, 42, 0.34)",
      line: "rgba(153, 246, 228, 0.22)",
    };
  }

  if (/\bai|llm|agentic|architecture|system design\b/.test(source)) {
    return {
      from: "#111827",
      via: "#4f46e5",
      to: "#0f172a",
      accent: "#a78bfa",
      accentSoft: "#c4b5fd",
      panel: "rgba(30, 27, 75, 0.32)",
      line: "rgba(196, 181, 253, 0.22)",
    };
  }

  if (/\bcase studies|microservices|distributed|messaging|cloud native\b/.test(source)) {
    return {
      from: "#082f49",
      via: "#0369a1",
      to: "#0f172a",
      accent: "#38bdf8",
      accentSoft: "#7dd3fc",
      panel: "rgba(12, 74, 110, 0.32)",
      line: "rgba(125, 211, 252, 0.24)",
    };
  }

  if (/\bsolid|\.net|c#|design|oop\b/.test(source)) {
    return {
      from: "#1e1b4b",
      via: "#7c3aed",
      to: "#1f2937",
      accent: "#c084fc",
      accentSoft: "#ddd6fe",
      panel: "rgba(76, 29, 149, 0.3)",
      line: "rgba(221, 214, 254, 0.24)",
    };
  }

  return {
    from: "#0f172a",
    via: "#1d4ed8",
    to: "#0891b2",
    accent: "#38bdf8",
    accentSoft: "#bae6fd",
    panel: "rgba(15, 23, 42, 0.3)",
    line: "rgba(186, 230, 253, 0.22)",
  };
};

const getHeroPattern = (tags: string[], title: string, description: string, accent: string, line: string) => {
  const source = `${tags.join(" ")} ${title} ${description}`.toLowerCase();

  if (/\bprivacy|security|risk|threat|tracking|surveillance\b/.test(source)) {
    return `
      <g opacity="0.82">
        <path d="M860 164h180" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
        <path d="M900 214h140" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
        <path d="M842 262h198" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
        <rect x="805" y="112" width="280" height="210" rx="32" fill="rgba(255,255,255,0.05)" stroke="${line}" />
        <path d="M945 156c31 0 56 25 56 56v20h-112v-20c0-31 25-56 56-56Z" fill="none" stroke="${accent}" stroke-width="12"/>
        <rect x="884" y="225" width="122" height="86" rx="22" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-width="8"/>
        <circle cx="945" cy="260" r="14" fill="${accent}" />
      </g>
    `;
  }

  if (/\bai|llm|agentic|architecture|system design\b/.test(source)) {
    return `
      <g opacity="0.88">
        <circle cx="930" cy="194" r="84" fill="rgba(255,255,255,0.06)" stroke="${line}" />
        <circle cx="930" cy="194" r="28" fill="${accent}" />
        <path d="M930 110v-46M930 324v-46M846 194h-46M1060 194h-46M873 137l-34-34M1021 285l-34-34M1021 103l-34 34M873 251l-34 34" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <path d="M760 336c84-72 176-104 276-94" stroke="${line}" stroke-width="4" fill="none" />
        <path d="M788 384c108-54 198-73 286-56" stroke="${line}" stroke-width="4" fill="none" />
      </g>
    `;
  }

  if (/\bcase studies|microservices|distributed|messaging|cloud native\b/.test(source)) {
    return `
      <g opacity="0.9">
        <rect x="792" y="122" width="104" height="72" rx="18" fill="rgba(255,255,255,0.08)" stroke="${line}" />
        <rect x="950" y="122" width="104" height="72" rx="18" fill="rgba(255,255,255,0.08)" stroke="${line}" />
        <rect x="872" y="246" width="104" height="72" rx="18" fill="rgba(255,255,255,0.08)" stroke="${line}" />
        <rect x="784" y="370" width="104" height="72" rx="18" fill="rgba(255,255,255,0.08)" stroke="${line}" />
        <rect x="960" y="370" width="104" height="72" rx="18" fill="rgba(255,255,255,0.08)" stroke="${line}" />
        <path d="M896 158h54M922 194v52M924 318v52M888 406h72M976 158h-26" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <path d="M844 194v176M1002 194v176" stroke="${line}" stroke-width="4" />
      </g>
    `;
  }

  if (/\bsolid|\.net|c#|design|oop\b/.test(source)) {
    return `
      <g opacity="0.92">
        <path d="M820 420 948 132l128 288" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M874 292h148" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="820" cy="420" r="18" fill="${accent}" />
        <circle cx="948" cy="132" r="18" fill="${accent}" />
        <circle cx="1076" cy="420" r="18" fill="${accent}" />
        <path d="M780 504c90-46 186-46 336 0" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/>
      </g>
    `;
  }

  return `
    <g opacity="0.88">
      <circle cx="936" cy="202" r="112" fill="rgba(255,255,255,0.06)" />
      <path d="M820 334c60-82 125-126 224-138" stroke="${accent}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M794 408c100-58 196-82 284-72" stroke="${line}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M770 478c122-34 226-35 330 0" stroke="${line}" stroke-width="6" stroke-linecap="round" fill="none"/>
    </g>
  `;
};

const createFallbackHeroImage = (title: string, tags: string[], eyebrow: string, description: string) => {
  const palette = getHeroPalette(tags, title, description);
  const titleLines = splitTitleForCover(title).slice(0, 2).map(escapeXml);
  const safeEyebrow = escapeXml(eyebrow || tags[0] || "Article");
  const safeLabel = escapeXml(tags.slice(0, 2).join(" • ") || "Engineering Article");
  const summary = escapeXml(description).slice(0, 120);
  const pattern = getHeroPattern(tags, title, description, palette.accent, palette.line);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="52%" stop-color="${palette.via}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
        <radialGradient id="glowA" cx="20%" cy="20%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowB" cx="85%" cy="80%" r="45%">
          <stop offset="0%" stop-color="${palette.accentSoft}" stop-opacity="0.54" />
          <stop offset="100%" stop-color="${palette.accentSoft}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="panelGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.14)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#bg)" />
      <rect width="1200" height="720" fill="url(#glowA)" />
      <rect width="1200" height="720" fill="url(#glowB)" />
      <g opacity="0.18">
        <path d="M0 102h1200M0 210h1200M0 318h1200M0 426h1200M0 534h1200M0 642h1200" stroke="white" />
        <path d="M114 0v720M282 0v720M450 0v720M618 0v720M786 0v720M954 0v720" stroke="white" />
      </g>
      <rect x="66" y="70" rx="34" ry="34" width="610" height="580" fill="${palette.panel}" />
      <rect x="66" y="70" rx="34" ry="34" width="610" height="580" fill="url(#panelGlow)" stroke="rgba(255,255,255,0.12)" />
      <rect x="104" y="108" rx="24" ry="24" width="250" height="54" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.18)" />
      <text x="132" y="143" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="white" opacity="0.92">${safeLabel}</text>
      <text x="106" y="222" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="${palette.accentSoft}" opacity="0.95">${safeEyebrow.toUpperCase()}</text>
      <text x="104" y="308" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800" fill="white">${titleLines[0] || ""}</text>
      ${titleLines[1] ? `<text x="104" y="376" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800" fill="white">${titleLines[1]}</text>` : ""}
      <text x="104" y="${titleLines[1] ? 448 : 396}" font-family="Inter, Arial, sans-serif" font-size="24" fill="white" opacity="0.82">${summary}</text>
      <rect x="104" y="536" rx="20" ry="20" width="210" height="58" fill="rgba(255,255,255,0.08)" stroke="${palette.line}" />
      <circle cx="142" cy="565" r="10" fill="${palette.accent}" />
      <text x="168" y="572" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="white">${safeEyebrow}</text>
      ${pattern}
    </svg>
  `;

  return svgLogo(svg);
};

const extractHeroImage = (html: string, assetUrl: string, title: string, tags: string[], eyebrow: string, description: string) => {
  const ogImage =
    matchFirst(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    matchFirst(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  if (ogImage) return resolveMediaUrl(ogImage, assetUrl);

  const firstImg =
    matchFirst(html, /<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*(?:hero|cover|banner|featured|thumbnail)[^"']*["'][^>]*>/i) ||
    matchFirst(html, /<img[^>]+class=["'][^"']*(?:hero|cover|banner|featured|thumbnail)[^"']*["'][^>]+src=["']([^"']+)["']/i) ||
    matchFirst(html, /<img[^>]+src=["']([^"']+)["']/i);

  if (firstImg) return resolveMediaUrl(firstImg, assetUrl);

  return createFallbackHeroImage(title, tags, eyebrow, description);
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
  const caseStudyScore = countMatches(lower, /\bcase stud(?:y|ies)\b/i);
  const systemDesignScore = countMatches(lower, /\bsystem design|scalability|throughput|latency|capacity planning|high availability\b/i);
  const microservicesScore = countMatches(
    lower,
    /\bmicroservices?|distributed systems?|api gateway|service mesh|saga pattern|bounded contexts?|strangler fig|circuit breaker|event-driven|outbox\b/i,
  );
  const messagingScore = countMatches(lower, /\bkafka|rabbitmq|masstransit|async messaging|event-driven|message broker\b/i);

  if (solidScore >= 2 || /\bsolid\b/.test(lower)) detected.push("SOLID");
  if (dotnetScore >= 1) detected.push(".NET");
  if (systemDesignScore >= 1) detected.push("System Design");
  if (caseStudyScore >= 1) detected.push("Case Studies");
  if (solidScore >= 1 || /\barchitecture|architect|domain model|clean architecture\b/.test(lower)) detected.push("Architecture");
  if (microservicesScore >= 1) detected.push("Microservices");
  if (microservicesScore >= 2) detected.push("Distributed Systems");
  if (messagingScore >= 1) detected.push("Messaging");
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
  if (/\bazure|aks|azure devops|app service|cosmos db\b/.test(lower)) detected.push("Azure");
  if (/\baws|amazon web services|lambda|eks|ecs|dynamodb|s3\b/.test(lower)) detected.push("AWS");
  if (/\bangular|rxjs|ngrx\b/.test(lower)) detected.push("Angular");
  if (/\breact|next\.?js\b/.test(lower)) detected.push("React");
  if (/\btypescript|javascript\b/.test(lower)) detected.push("TypeScript");
  if (/\bdocker|containerization\b/.test(lower)) detected.push("Docker");
  if (/\bkubernetes|k8s\b/.test(lower)) detected.push("Kubernetes");
  if (/\bpostgres|postgresql|sql\b/.test(lower)) detected.push("PostgreSQL");
  if (/\bkafka|event streaming|stream processing\b/.test(lower)) detected.push("Kafka");
  if (microservicesScore >= 1 && /\bdocker|kubernetes|dapr|yarp|cloud-native\b/.test(lower)) detected.push("Cloud Native");
  if ((solidScore === 0 && dotnetScore === 0) && /\bai|ml|llm|agentic\b/.test(lower)) detected.push("AI");

  return unique([...keywords, ...detected]).slice(0, MAX_ARTICLE_TAGS);
};

const deriveLogos = (source: string, tags: string[], options?: { preferBrands?: boolean }) => {
  const signals = `${source} ${tags.join(" ")}`;
  const brandHits = COMPANY_LOGO_RULES.filter((rule) => rule.match.test(signals));
  const signalHits = LOGO_RULES.filter((rule) => rule.match.test(signals));
  const limit = options?.preferBrands && brandHits.length ? MAX_CASE_STUDY_LOGOS : MAX_ARTICLE_LOGOS;
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
  const merged = [...(options?.preferBrands ? brandHits : signalHits), ...(options?.preferBrands ? signalHits : brandHits)].filter(
    (item, index, array) => array.findIndex((candidate) => candidate.name === item.name) === index,
  );
  for (const fallback of fallbackLogos) {
    if (merged.length >= limit) break;
    if (merged.some((item) => item.name === fallback.name)) continue;
    merged.push(fallback);
  }
  return merged.slice(0, limit);
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
      to: "/cheatsheets",
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
  const heroDesc = extractClassText(bodyHtml, "hero-desc");
  const sectionDesc = extractClassText(bodyHtml, "section-desc");
  const heroTag = extractClassText(bodyHtml, "hero-tag");
  const statValue = extractClassText(bodyHtml, "stat-num");
  const previewText = [heroSub, heroDesc, sectionDesc, ...headings, ...paragraphs.slice(0, 3)].filter(Boolean).join(" ");
  const tags = deriveTags(safeHtml, previewText || plainText, title);
  const description = heroSub || heroDesc || sectionDesc || deriveDescription(safeHtml, paragraphs, title);
  const intro = paragraphs[0] || description;
  const caseStudyCount = title.match(/\b(\d{1,2})\b/)?.[1];
  const isCaseStudyArticle = /\bcase stud(?:y|ies)\b/i.test(title) || /\bcase stud(?:y|ies)\b/i.test(previewText || plainText);
  const logos = deriveLogos(isCaseStudyArticle ? `${title} ${plainText}` : `${title} ${previewText}`, tags, {
    preferBrands: isCaseStudyArticle,
  });
  const firstPercent = isCaseStudyArticle
    ? `${caseStudyCount || "Multi"} case studies`
    : statValue || plainText.match(/\b\d{1,3}%\b/)?.[0] || `${Math.max(1, Math.ceil(plainText.split(/\s+/).length / 40))} min`;
  const heroLabel = isCaseStudyArticle
    ? "Coverage"
    : /\bexposure|score|risk|threat\b/i.test(plainText)
    ? "Signal"
    : /\bprinciples|examples|use cases|antipatterns\b/i.test(plainText)
      ? "Coverage"
      : "Readiness";
  const readMinutes = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));
  const normalizedKeyPoints = unique([...headings.slice(1), ...paragraphs.slice(0, 3)])
    .filter((point) => point && point.length <= 140)
    .slice(0, MAX_ARTICLE_KEY_POINTS);
  const heroImage =
    CUSTOM_ARTICLE_HERO_IMAGES[slug] ||
    extractHeroImage(safeHtml, assetUrl, title, tags, heroTag || headings[0] || "Articles Hub", description);
  const metadata = ARTICLE_METADATA_OVERRIDES[slug];
  const mergedTags = metadata?.tags ? unique([...metadata.tags, ...tags]).slice(0, MAX_ARTICLE_TAGS) : tags;
  const finalTitle = metadata?.title || title;
  const finalDescription = metadata?.description || description;
  const finalEyebrow = metadata?.eyebrow || heroTag || headings[0] || "Articles Hub";
  const finalHeroLabel = metadata?.heroLabel || heroLabel;
  const finalHeroValue = metadata?.heroValue || firstPercent;
  const finalPublishedAt = metadata?.publishedAt || FALLBACK_DATE;

  return {
    slug,
    title: finalTitle,
    eyebrow: finalEyebrow,
    description: finalDescription,
    intro,
    heroLabel: finalHeroLabel,
    heroValue: finalHeroValue,
    publishedAt: finalPublishedAt,
    readMinutes,
    tags: mergedTags,
    logos,
    keyPoints: normalizedKeyPoints,
    relatedBlogs: deriveRelatedBlogs(tags),
    rawHtml: safeHtml,
    plainText,
    assetUrl,
    heroImage,
    featured: Boolean(metadata?.featured),
    featuredRank: metadata?.featuredRank ?? null,
  };
};

export const compareArticles = (a: ArticleRecord, b: ArticleRecord) => {
  const rankA = a.featuredRank ?? Number.POSITIVE_INFINITY;
  const rankB = b.featuredRank ?? Number.POSITIVE_INFINITY;
  if (rankA !== rankB) return rankA - rankB;

  const dateA = new Date(a.publishedAt);
  const dateB = new Date(b.publishedAt);
  if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
    return dateB.getTime() - dateA.getTime();
  }

  return b.title.localeCompare(a.title);
};

export const ARTICLES: ArticleRecord[] = Object.entries(rawArticles)
  .map(([filePath, html]) => buildArticleRecord(filePath, html, articleAssetUrls[filePath] || ""))
  .sort(compareArticles);

export const ARTICLES_BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export const ARTICLES_HOME_LINKS: ArticleLink[] = [
  {
    title: "Engineering Blog",
    to: "/blog",
    description: "Deep dives, tutorials, and internal website blog content.",
  },
  {
    title: "Blog Aggregator",
    to: "/cheatsheets",
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

export const FEATURED_ARTICLE_ICON = BadgeCheck;
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
