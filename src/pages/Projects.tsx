import { Brain, Briefcase, Code2, FileText, FolderOpen, GraduationCap, Server, Sparkles } from "lucide-react";
import { ResourceHubPage, type ResourceHubCard, type ResourceHubMetric } from "@/components/content/ResourceHubPage";

const metrics: ResourceHubMetric[] = [
  {
    label: "Live Destinations",
    value: "6",
    description: "Core project-facing routes already available across products, platforms, and structured learning assets.",
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
    title: "CHRONYX",
    description: "A personal intelligence and productivity destination positioned as a real product surface inside the site.",
    to: "/chronyx",
    icon: Sparkles,
    tags: ["Product", "Personal Intelligence", "Platform"],
    eyebrow: "Live Project",
    ctaLabel: "Open project",
  },
  {
    title: "OpenOwl",
    description: "The assistant experience and product shell for contextual guidance, ecosystem discovery, and knowledge interaction.",
    to: "/openowl",
    icon: Brain,
    tags: ["Assistant", "AI", "Platform"],
    eyebrow: "Live Project",
    ctaLabel: "Open project",
  },
  {
    title: "LLM Galaxy",
    description: "A model-intelligence hub for open and closed model exploration, ranking, and comparison.",
    to: "/llm-galaxy",
    icon: FileText,
    tags: ["LLMs", "Model Hub", "Research"],
    eyebrow: "Live Project",
    ctaLabel: "Open project",
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
  {
    title: "C# & .NET Engineering Zero to Hero",
    description: "A project-oriented learning route with reusable artifacts, review checklists, and implementation flow.",
    to: "/courses/csharp-coding",
    icon: GraduationCap,
    tags: ["Course", ".NET", "Hands-on"],
    eyebrow: "Build Track",
    ctaLabel: "Open track",
  },
  {
    title: "Microservices Architecture Mastery",
    description: "A project-grade architecture track anchored to a real long-form microservices reference system.",
    to: "/courses/microservices-architecture",
    icon: Server,
    tags: ["Microservices", "Architecture", ".NET"],
    eyebrow: "Build Track",
    ctaLabel: "Open track",
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
