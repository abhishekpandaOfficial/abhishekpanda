import { Brain, Briefcase, Code2, FileText, FolderOpen, Server, Sparkles } from "lucide-react";
import { ResourceHubPage, type ResourceHubCard, type ResourceHubMetric } from "@/components/content/ResourceHubPage";
import openowlLogo from "@/assets/openowl-dark.svg";
import chronyxLogo from "@/assets/chronyx-logo.svg";

const metrics: ResourceHubMetric[] = [
  {
    label: "Live Destinations",
    value: "10",
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

const cards: ResourceHubCard[] = [
  {
    title: "OpenOwl",
    description: "The assistant experience and product shell for contextual guidance, ecosystem discovery, and knowledge interaction.",
    to: "/openowl",
    icon: Brain,
    logoSrc: openowlLogo,
    logoAlt: "OpenOwl",
    tags: ["Assistant", "AI", "Platform"],
    eyebrow: "Live Project",
    ctaLabel: "Open project",
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
    eyebrow: "Live Project",
    statusLabel: "External",
    to: "/blog/techhub",
    ctaLabel: "Open project",
  },
  {
    title: "CHRONYX",
    description: "A personal intelligence and productivity destination positioned as a real product surface inside the site.",
    to: "/chronyx",
    icon: Sparkles,
    logoSrc: chronyxLogo,
    logoAlt: "CHRONYX",
    tags: ["Product", "Personal Intelligence", "Platform"],
    eyebrow: "Live Project",
    ctaLabel: "Open project",
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
    logoSrc: "https://logo.clearbit.com/stackcraft.io",
    logoAlt: "StackCraft",
    tags: ["Developer Platform", "Tooling", "Engineering"],
    eyebrow: "Platform",
    statusLabel: "External",
    to: "/products",
    ctaLabel: "Open platform",
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
    to: "/products",
    icon: Briefcase,
    tags: ["Marketplace", "Templates", "Products"],
    eyebrow: "Products",
    ctaLabel: "Open products",
  },
];

export default function Projects() {
  return (
    <ResourceHubPage
      eyebrow="Projects"
      title="Projects, Platforms, and Build-Focused Destinations"
      description="Use the Projects header as a direct portfolio-style entry point into your live products, engineering platforms, and project-oriented learning tracks."
      primaryAction={{ label: "Open Products", to: "/products" }}
      secondaryAction={{ label: "Contact for Projects", to: "/contact" }}
      metrics={metrics}
      cards={cards}
      sectionTitle="Projects and Product-Facing Routes"
      sectionDescription="This page is positioned as the top-level discovery layer for platforms, products, and project-shaped technical assets already present across the website."
    />
  );
}
