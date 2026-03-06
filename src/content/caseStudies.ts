import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Code2,
  FileStack,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  Newspaper,
  ScanSearch,
  Server,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import { ARTICLES_BY_SLUG } from "@/content/articles";

export type CaseStudyRecord = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  anchorId?: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  keyPoints: string[];
  icon: LucideIcon;
  assetUrl?: string;
  planned?: boolean;
};

const flagshipArticle = ARTICLES_BY_SLUG.get("15-case-studies-dotnet");

const sharedAssetUrl = flagshipArticle?.assetUrl || "";
const sharedPublishedAt = flagshipArticle?.publishedAt || "March 6, 2026";

const liveCaseStudies: CaseStudyRecord[] = [
  {
    slug: "whatsapp-messaging-architecture",
    title: "WhatsApp Messaging Architecture",
    description: "Persistent connections, offline queues, E2E encryption, and lean high-scale messaging delivery.",
    intro: "A focused breakdown of how WhatsApp handles realtime delivery, offline state, encryption boundaries, and scale with a minimal operational surface.",
    anchorId: "cs1",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["WhatsApp", "Realtime", "Messaging"],
    keyPoints: ["Persistent gateway connections", "Offline queue design", "End-to-end encryption boundaries"],
    icon: FileText,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "spotify-streaming-architecture",
    title: "Spotify Streaming Architecture",
    description: "Audio delivery, recommendation signals, metadata flow, and global low-latency playback.",
    intro: "This case study looks at Spotify’s streaming path, recommendation signals, pre-buffering, and content delivery choices at global scale.",
    anchorId: "cs2",
    publishedAt: sharedPublishedAt,
    readMinutes: 9,
    tags: ["Spotify", "Streaming", "Recommendations"],
    keyPoints: ["Audio delivery pipeline", "Recommendation loops", "Playback optimization"],
    icon: GraduationCap,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "twitter-timeline-system",
    title: "Twitter Timeline System",
    description: "Fan-out tradeoffs, feed generation, ranking flow, and large-scale social timeline design.",
    intro: "A direct look at social feed generation, ranking, and the delivery tradeoffs behind high-scale timeline products.",
    anchorId: "cs3",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["Timeline", "Social Feed", "Ranking"],
    keyPoints: ["Feed fan-out tradeoffs", "Ranking pipeline", "Read/write balance"],
    icon: Newspaper,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "stock-exchange-matching-engine",
    title: "Stock Exchange Matching Engine",
    description: "Order books, matching guarantees, latency-sensitive processing, and exchange-scale architecture.",
    intro: "This section focuses on market matching flow, order books, low-latency execution, and the constraints of exchange-grade systems.",
    anchorId: "cs4",
    publishedAt: sharedPublishedAt,
    readMinutes: 9,
    tags: ["Exchange", "Matching Engine", "Low Latency"],
    keyPoints: ["Order book mechanics", "Matching guarantees", "Latency-sensitive flow"],
    icon: BarChart3,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "reddit-ranking-and-voting",
    title: "Reddit Ranking and Voting",
    description: "Vote aggregation, ranking heuristics, freshness, and community-scale discussion systems.",
    intro: "A case study on ranking heuristics, freshness, and discussion-driven community systems at scale.",
    anchorId: "cs5",
    publishedAt: sharedPublishedAt,
    readMinutes: 7,
    tags: ["Reddit", "Ranking", "Community"],
    keyPoints: ["Vote scoring", "Freshness balancing", "Community discussion flow"],
    icon: Brain,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "payment-system-design",
    title: "Payment System Design",
    description: "Merchant flow, bank integrations, settlement paths, retries, and idempotent charging.",
    intro: "This case study covers the architecture of charging, settlement, retries, and idempotency in real payment systems.",
    anchorId: "cs6",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["Payments", "Transactions", "Reliability"],
    keyPoints: ["Merchant to bank flow", "Idempotent charging", "Retry and failure design"],
    icon: ShieldCheck,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "uber-eta-and-dispatch",
    title: "Uber ETA and Dispatch",
    description: "Driver discovery, geo indexing, ETA prediction, and dispatch coordination at city scale.",
    intro: "A direct breakdown of geospatial indexing, dispatch logic, and ETA prediction for ride-hailing systems.",
    anchorId: "cs7",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["Uber", "Geo", "Dispatch"],
    keyPoints: ["Geo indexing", "Dispatch coordination", "ETA prediction"],
    icon: Target,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "google-search-pipeline",
    title: "Google Search Pipeline",
    description: "Crawling, indexing, retrieval, and the path from web pages to ranked searchable results.",
    intro: "This case study follows the path from crawling and indexing to ranked search results and retrieval performance.",
    anchorId: "cs8",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["Google", "Search", "Indexing"],
    keyPoints: ["Crawling strategy", "Index construction", "Ranked retrieval flow"],
    icon: ScanSearch,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "slack-collaboration-architecture",
    title: "Slack Collaboration Architecture",
    description: "Channels, tenants, message fan-out, and collaboration-oriented messaging system design.",
    intro: "A study of channel-based collaboration, multi-tenant boundaries, and workspace-scale messaging architecture.",
    anchorId: "cs9",
    publishedAt: sharedPublishedAt,
    readMinutes: 7,
    tags: ["Slack", "Collaboration", "Multi-Tenant"],
    keyPoints: ["Channel architecture", "Tenant isolation", "Message fan-out"],
    icon: FileStack,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "chatgpt-serving-architecture",
    title: "ChatGPT Serving Architecture",
    description: "Inference pipelines, token streaming, latency management, and large-scale AI serving patterns.",
    intro: "A serving-focused AI case study on token generation, inference pipelines, and latency-aware product delivery.",
    anchorId: "cs10",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["ChatGPT", "LLMs", "Inference"],
    keyPoints: ["Token streaming", "Inference path", "Serving latency tradeoffs"],
    icon: Bot,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "youtube-video-platform",
    title: "YouTube Video Platform",
    description: "Upload pipeline, transcoding, distribution, and adaptive streaming for large video systems.",
    intro: "This case study explains upload handling, transcoding, adaptive delivery, and the architecture behind video distribution.",
    anchorId: "cs11",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["YouTube", "Video", "CDN"],
    keyPoints: ["Upload pipeline", "Transcoding path", "Adaptive streaming"],
    icon: LayoutDashboard,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "aws-s3-storage-design",
    title: "AWS S3 Storage Design",
    description: "Object durability, metadata strategy, blob placement, and globally scalable storage architecture.",
    intro: "A storage-system case study on object durability, metadata handling, replication, and large-scale blob storage design.",
    anchorId: "cs12",
    publishedAt: sharedPublishedAt,
    readMinutes: 8,
    tags: ["AWS", "Storage", "Durability"],
    keyPoints: ["Object durability", "Replication approach", "Blob storage design"],
    icon: Server,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "bluesky-social-graph-design",
    title: "Bluesky Social Graph Design",
    description: "Open feeds, decentralized patterns, graph-driven discovery, and modern social architecture.",
    intro: "A decentralized social case study covering graph design, open feed systems, and identity-aware federation patterns.",
    anchorId: "cs13",
    publishedAt: sharedPublishedAt,
    readMinutes: 7,
    tags: ["Bluesky", "Decentralized", "Social"],
    keyPoints: ["Open social graph", "Decentralized feeds", "Federated identity"],
    icon: Lock,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "url-shortener-platform",
    title: "URL Shortener Platform",
    description: "Short-code generation, redirect caching, analytics points, and resilient redirect infrastructure.",
    intro: "A compact but important case study on short-code generation, redirect performance, and cache-heavy read paths.",
    anchorId: "cs14",
    publishedAt: sharedPublishedAt,
    readMinutes: 7,
    tags: ["Bitly", "Redirects", "Caching"],
    keyPoints: ["Short-code generation", "Redirect optimization", "Analytics flow"],
    icon: Code2,
    assetUrl: sharedAssetUrl,
  },
  {
    slug: "apache-kafka-event-streaming",
    title: "Apache Kafka Event Streaming",
    description: "Topics, partitions, offsets, and throughput-oriented distributed log architecture.",
    intro: "A direct streaming-systems case study focused on topics, partitions, offsets, and high-throughput event log design.",
    anchorId: "cs15",
    publishedAt: sharedPublishedAt,
    readMinutes: 9,
    tags: ["Kafka", "Streaming", "Events"],
    keyPoints: ["Topic and partition model", "Offset semantics", "High-throughput streaming"],
    icon: BookOpen,
    assetUrl: sharedAssetUrl,
  },
];

const plannedCaseStudies: CaseStudyRecord[] = [
  {
    slug: "notion-workspace-platform",
    title: "Notion Workspace Platform",
    description: "Block-based document models, real-time collaboration, sync, permissions, and workspace search.",
    intro: "A planned case study covering block-model document systems, collaboration, permissions, and workspace infrastructure.",
    publishedAt: sharedPublishedAt,
    readMinutes: 0,
    tags: ["Notion", "Collaboration", "Workspace"],
    keyPoints: ["Block-based documents", "Realtime collaboration", "Workspace search"],
    icon: LayoutDashboard,
    planned: true,
  },
  {
    slug: "amazon-commerce-platform",
    title: "Amazon Commerce Platform",
    description: "Catalog scale, product detail pages, cart flow, checkout orchestration, and fulfillment-aware architecture.",
    intro: "A planned case study on catalog scale, checkout orchestration, and fulfillment-aware ecommerce architecture.",
    publishedAt: sharedPublishedAt,
    readMinutes: 0,
    tags: ["Amazon", "Ecommerce", "Scale"],
    keyPoints: ["Catalog architecture", "Checkout orchestration", "Fulfillment flow"],
    icon: Server,
    planned: true,
  },
  {
    slug: "flipkart-commerce-platform",
    title: "Flipkart Commerce Platform",
    description: "Indian ecommerce traffic spikes, promotions, inventory, order flow, and marketplace architecture.",
    intro: "A planned case study focused on marketplace traffic, promotions, inventory, and ecommerce order systems.",
    publishedAt: sharedPublishedAt,
    readMinutes: 0,
    tags: ["Flipkart", "Marketplace", "Orders"],
    keyPoints: ["Marketplace order flow", "Inventory coordination", "Traffic spikes"],
    icon: ShieldCheck,
    planned: true,
  },
  {
    slug: "fastag-vision-tolling-system",
    title: "FASTag Vision Tolling System",
    description: "Computer-vision assisted lane capture, plate reading, payment reconciliation, and highway toll automation.",
    intro: "A planned computer-vision case study on highway tolling, OCR, reconciliation, and automated transport systems.",
    publishedAt: sharedPublishedAt,
    readMinutes: 0,
    tags: ["FASTag", "Computer Vision", "Transportation"],
    keyPoints: ["Vision capture", "Plate recognition", "Toll reconciliation"],
    icon: ScanSearch,
    planned: true,
  },
];

export const CASE_STUDIES = [...liveCaseStudies, ...plannedCaseStudies];
export const LIVE_CASE_STUDIES = CASE_STUDIES.filter((item) => !item.planned);
export const PLANNED_CASE_STUDIES = CASE_STUDIES.filter((item) => item.planned);
export const CASE_STUDIES_BY_SLUG = new Map(CASE_STUDIES.map((item) => [item.slug, item]));

export const getRelatedCaseStudies = (caseStudy: CaseStudyRecord, limit = 4) =>
  LIVE_CASE_STUDIES.filter((item) => item.slug !== caseStudy.slug)
    .map((item) => ({
      item,
      score: item.tags.filter((tag) => caseStudy.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((entry) => entry.item);
