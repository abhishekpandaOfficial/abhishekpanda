import { Brain, Briefcase, Code2, FileText, Flame, FolderOpen, Server, Sparkles } from "lucide-react";
import type { ResourceHubCard, ResourceHubMetric } from "@/components/content/ResourceHubPage";

import openowlLogo from "@/assets/openowl-dark.svg";
import chronyxLogo from "@/assets/chronyx-logo.svg";

export type ProjectCard = ResourceHubCard & {
  slug?: string;
  launchTo?: string;
  launchLabel?: string;
  externalUrl?: string;
  detailTitle?: string;
  detailDescription?: string;
  longDescription?: string;
  highlights?: string[];
  detailSections?: Array<{
    title: string;
    description: string;
  }>;
};

const productRoute = (slug: string) => `/products/${slug}`;

export const PROJECT_METRICS: ResourceHubMetric[] = [
  {
    label: "Live Destinations",
    value: "11",
    description: "Project-facing products, platforms, and upcoming apps across your public ecosystem.",
    icon: FolderOpen,
  },
  {
    label: "Scope",
    value: "Platform",
    description: "Covers live product surfaces, engineering platforms, and implementation-focused learning outputs.",
    icon: Brain,
  },
  {
    label: "Depth",
    value: "Build",
    description: "Mixes product-facing routes with architecture and implementation-oriented project tracks.",
    icon: Code2,
  },
  {
    label: "Mode",
    value: "Portfolio",
    description: "Acts as a direct entry point into your public projects and engineering systems.",
    icon: Briefcase,
  },
];

export const PROJECT_CARDS: ProjectCard[] = [
  {
    title: "OpenOwl",
    description: "The assistant experience and product shell for contextual guidance, ecosystem discovery, and knowledge interaction.",
    to: productRoute("openowl"),
    icon: Brain,
    logoSrc: openowlLogo,
    logoAlt: "OpenOwl",
    tags: ["Assistant", "AI", "Platform"],
    eyebrow: "Live Project",
    statusLabel: "Live",
    ctaLabel: "View details",
    slug: "openowl",
    launchTo: "/openowl",
    launchLabel: "Open OpenOwl",
    detailTitle: "OpenOwl Product Overview",
    detailDescription: "OpenOwl is the on-site assistant layer that turns the broader ecosystem into a guided product experience instead of a static collection of pages.",
    longDescription:
      "OpenOwl is designed as the conversational operating layer for the public ecosystem. It combines assistant UX, product navigation, and knowledge discovery so visitors can move from questions to relevant products, technical tracks, and internal tools without leaving the site.",
    highlights: ["Context-aware assistant shell", "Internal product discovery", "Guided ecosystem navigation"],
    detailSections: [
      {
        title: "Experience Layer",
        description: "Acts as the main product shell for conversational discovery, guided prompts, and structured navigation across the website.",
      },
      {
        title: "Knowledge Surface",
        description: "Brings together site context, product surfaces, and public technical content into one assistant-led experience.",
      },
      {
        title: "Internal Route",
        description: "Lives fully inside the site and can be opened directly as a standalone product surface from its internal route.",
      },
    ],
  },
  {
    title: "Scribe",
    description: "A personal writing and documentation product surface focused on clean drafting, publishing, and knowledge capture.",
    icon: FileText,
    tags: ["Writing", "Knowledge", "Product"],
    eyebrow: "Product",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "Newstack",
    description: "A global news and updates destination that consolidates cross-domain feeds into one searchable surface.",
    icon: FileText,
    logoSrc: "https://www.google.com/s2/favicons?sz=128&domain=newstack.live",
    logoAlt: "Newstack",
    tags: ["News", "Aggregator", "Platform"],
    eyebrow: "Platform",
    statusLabel: "Internal Detail",
    to: productRoute("newstack"),
    ctaLabel: "View details",
    slug: "newstack",
    launchTo: "/techhub",
    launchLabel: "Open TechHub Surface",
    detailTitle: "Newstack Product Overview",
    detailDescription: "Newstack is positioned as a unified updates platform that brings broader technical discovery, trend scanning, and category-level browsing into one place.",
    longDescription:
      "Newstack is the product-facing idea for a consolidated discovery surface across technical domains. Inside this site, its closest active internal surface is TechHub, which serves as the structured browsing layer for engineering topics, domains, and published modules.",
    highlights: ["Cross-domain update discovery", "Searchable news-style surface", "Internal TechHub alignment"],
    detailSections: [
      {
        title: "Discovery Goal",
        description: "Organizes engineering information into a single searchable surface rather than scattering discovery across unrelated pages.",
      },
      {
        title: "Content Model",
        description: "Blends topic browsing, category-level exploration, and continuously expanding technical streams.",
      },
      {
        title: "Current Internal Mapping",
        description: "Routes through the internal TechHub surface today so product discovery stays inside the site ecosystem.",
      },
    ],
  },
  {
    title: "CHRONYX",
    description: "A quiet personal system of record for notes, study planning, finance tracking, and everyday life organization.",
    to: productRoute("chronyx"),
    icon: Sparkles,
    logoSrc: chronyxLogo,
    logoAlt: "CHRONYX",
    tags: ["Product", "Productivity", "Personal System"],
    eyebrow: "Live Project",
    statusLabel: "Live",
    ctaLabel: "View details",
    slug: "chronyx",
    launchTo: "/chronyx",
    launchLabel: "Open CHRONYX",
    externalUrl: "https://www.getchronyx.com",
    detailTitle: "CHRONYX | A Quiet Space for Your Life",
    detailDescription: "CHRONYX is a calm, private personal space for notes, planning, finance tracking, and life organization.",
    longDescription:
      "CHRONYX is designed as a quiet personal system of record rather than a noisy productivity dashboard. It brings together study planning, finance tracking, AI-powered notes, and everyday organization into one focused surface built for clarity, privacy, and reliable daily use.",
    highlights: ["Personal system of record", "Study planner and progress workflows", "Finance tracking with calm visibility", "AI-powered notes and summaries", "Official product site: getchronyx.com"],
    detailSections: [
      {
        title: "Core Promise",
        description: "Creates a quiet, private place to capture notes, decisions, plans, and life context without turning the product into a distraction machine.",
      },
      {
        title: "Everyday Workflows",
        description: "Combines study planning, finance tracking, and AI-assisted note organization so routine life management feels structured and easy to revisit.",
      },
      {
        title: "Product Positioning",
        description: "Presented as a real standalone product destination with both an internal detail route and the official public product site at getchronyx.com.",
      },
    ],
  },
  {
    title: "Finioraa",
    description: "A fintech-oriented project concept for personal and business financial clarity, tracking, and insights.",
    icon: Briefcase,
    tags: ["Fintech", "Finance", "Product"],
    eyebrow: "Product",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "Grrovify (Personal Music App)",
    description: "A personal music experience app concept for playlists, mood-based discovery, and private listening journeys.",
    icon: Sparkles,
    tags: ["Music", "App", "Personal"],
    eyebrow: "App",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "Drivana App",
    description: "A tracking app for real-time flights, trains, and buses in one unified mobility interface.",
    icon: Server,
    tags: ["Mobility", "Tracking", "App"],
    eyebrow: "App",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "Drivana Website",
    description: "Web companion for Drivana with live routes, status tracking, and travel intelligence dashboards.",
    icon: FileText,
    tags: ["Mobility", "Web", "Tracking"],
    eyebrow: "Website",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "StackCraft",
    description: "Engineering platform for stack-centric workflows, tooling, and build acceleration.",
    icon: Code2,
    logoSrc: "/brand-logos/products/stackcraft.svg",
    logoAlt: "StackCraft logo",
    tags: ["Developer Platform", "Tooling", "Engineering"],
    eyebrow: "Platform",
    statusLabel: "Internal Detail",
    to: productRoute("stackcraft"),
    ctaLabel: "View details",
    slug: "stackcraft",
    detailTitle: "StackCraft Product Overview",
    detailDescription: "StackCraft is presented as a developer platform concept centered on stack-first workflows, engineering acceleration, and build-ready tooling.",
    longDescription:
      "StackCraft represents the platform layer for stack-centric engineering workflows. Its role in the site ecosystem is to describe the product direction, the intended value for developers, and the type of tooling and acceleration it aims to provide without forcing visitors out to another site just to understand the product.",
    highlights: ["Stack-first developer workflows", "Tooling-oriented platform vision", "Internal product detail route"],
    detailSections: [
      {
        title: "Platform Vision",
        description: "Built around helping developers navigate stacks, tools, and engineering decisions with more structure and less setup friction.",
      },
      {
        title: "Use Case",
        description: "Targets teams and builders who want clearer implementation paths across modern engineering stacks and workflows.",
      },
      {
        title: "Current State",
        description: "Presented as a dedicated internal product detail page so the product story is visible without sending users away.",
      },
    ],
  },
  {
    title: "BackFire",
    description: "A distributed background job system for .NET with retries, cron scheduling, worker orchestration, storage plugins, and dashboard tooling.",
    to: productRoute("backfire"),
    icon: Flame,
    tags: [".NET", "Distributed Systems", "Jobs", "Open Source"],
    eyebrow: "Project",
    statusLabel: "Internal Detail",
    ctaLabel: "View details",
    slug: "backfire",
    externalUrl: "/backfire-docs.html",
    detailTitle: "BackFire - Distributed Background Job System",
    detailDescription: "BackFire is a build-focused project for reliable background job processing across distributed .NET workers with pluggable storage and production-oriented operational tooling.",
    longDescription:
      "BackFire is positioned as a distributed background job platform for fire-and-forget tasks, delayed jobs, cron scheduling, retries, and horizontally scalable workers. The uploaded document lays out the architectural vision, core domain models, storage abstractions, dashboard plan, and production deployment direction for the system.",
    highlights: [
      "Distributed worker architecture",
      "Retries, delays, and cron scheduling",
      "Redis and SQL storage strategy",
      "Dashboard and observability planning",
      "Open-source project direction",
    ],
    detailSections: [
      {
        title: "Core Runtime",
        description: "Covers queueing, execution, retry handling, distributed locking, and worker coordination for background job processing at scale.",
      },
      {
        title: "Platform Architecture",
        description: "Defines a pluggable storage layer with SQL and Redis paths, real-time dashboard concepts, and horizontal scaling patterns for production usage.",
      },
      {
        title: "Documentation Route",
        description: "The full BackFire technical document is now available directly from the project entry so visitors can open the full design write-up from the Projects area.",
      },
    ],
  },
  {
    title: "Agrixon / AGRIXON Global",
    description: "An agritech-focused platform initiative for smart farming operations, intelligence, and global agri workflows.",
    icon: Brain,
    tags: ["Agritech", "Global", "Platform"],
    eyebrow: "Platform",
    statusLabel: "Coming Soon",
    disabled: true,
  },
  {
    title: "Digital Products Marketplace",
    description: "Templates, starter kits, and engineering products that present the commercial project layer of the website.",
    to: productRoute("digital-products-marketplace"),
    icon: Briefcase,
    tags: ["Marketplace", "Templates", "Products"],
    eyebrow: "Products",
    statusLabel: "Internal",
    ctaLabel: "View details",
    slug: "digital-products-marketplace",
    launchTo: "/products",
    launchLabel: "Open Marketplace",
    detailTitle: "Digital Products Marketplace",
    detailDescription: "The marketplace is the product layer for templates, kits, and commercial engineering assets available inside the site.",
    longDescription:
      "This marketplace route is where structured digital offerings live inside the ecosystem. It is intended to act as the commercial product layer for templates, technical assets, and reusable engineering packs while staying fully inside the site experience.",
    highlights: ["Internal marketplace route", "Templates and starter kits", "Commercial product layer"],
    detailSections: [
      {
        title: "Catalog Focus",
        description: "Curates reusable digital products such as templates, workflows, technical kits, and engineering assets.",
      },
      {
        title: "Site Role",
        description: "Represents the commercial side of the public ecosystem while still connecting naturally to projects and learning tracks.",
      },
      {
        title: "Access Route",
        description: "Has its own internal detail page and also links into the main products listing for deeper browsing.",
      },
    ],
  },
];

export const PROJECT_CARD_BY_SLUG = new Map(
  PROJECT_CARDS.filter((card): card is ProjectCard & { slug: string } => Boolean(card.slug)).map((card) => [card.slug, card]),
);
