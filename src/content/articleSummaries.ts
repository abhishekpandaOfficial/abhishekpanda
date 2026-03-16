export type ArticleSummary = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  heroImage: string;
  featured?: boolean;
};

export const FEATURED_HOME_ARTICLES: ArticleSummary[] = [
  {
    slug: "notebooklm-architecture",
    title: "NotebookLM Internal Architecture Deep Dive",
    eyebrow: "Featured Analysis",
    description:
      "A technical breakdown of how NotebookLM ingests sources, builds embeddings, retrieves context, constructs grounded prompts, and generates cited outputs.",
    publishedAt: "March 16, 2026",
    readMinutes: 18,
    tags: ["NotebookLM", "AI", "RAG", "Google"],
    heroImage: "/article-heroes/notebooklm-architecture.svg",
    featured: true,
  },
  {
    slug: "csharp-evolution-modern-reference",
    title: "C# 12, 13, 14 and .NET 8, 9, 10 - Complete Modern Reference",
    eyebrow: "C# Evolution",
    description:
      "A modern C# and .NET evolution guide covering C# 12 through C# 14, .NET 8 through .NET 10, real-world examples, performance notes, and migration-ready patterns.",
    publishedAt: "March 15, 2026",
    readMinutes: 28,
    tags: [".NET", "C#", "Language Evolution", ".NET 10"],
    heroImage: "/article-heroes/dotnet-mastery-2026.svg",
    featured: true,
  },
  {
    slug: "system-design-10m-users-dotnet",
    title: "How to Design a System Handling 10M Users in .NET",
    eyebrow: "Scale Blueprint",
    description:
      "A systems design walkthrough for building .NET platforms that stay resilient, observable, and cost-aware at 10 million users.",
    publishedAt: "March 15, 2026",
    readMinutes: 24,
    tags: [".NET", "System Design", "Scalability", "Architecture"],
    heroImage: "/article-heroes/15-case-studies-dotnet.svg",
    featured: true,
  },
  {
    slug: "csharp-multithreading-zero-to-hero",
    title: "Multithreading: Zero to Hero - C# Complete Guide",
    eyebrow: "Concurrency Mastery",
    description:
      "A practical C# multithreading guide covering threads, tasks, synchronization, async coordination, and production-safe concurrency patterns.",
    publishedAt: "March 14, 2026",
    readMinutes: 22,
    tags: [".NET", "C#", "Multithreading", "Concurrency"],
    heroImage: "/article-heroes/solid-principles-guide.svg",
    featured: true,
  },
  {
    slug: "collections-delegates-reflection-deep-dive",
    title: "Collections, Delegates, Events & Reflection Deep Dive",
    eyebrow: "C# Language Internals",
    description:
      "A deep C# reference covering legacy and generic collections, delegates, events, reflection, real-world usage patterns, and richly annotated code walkthroughs.",
    publishedAt: "March 15, 2026",
    readMinutes: 30,
    tags: [".NET", "C#", "Collections", "Reflection"],
    heroImage: "/article-heroes/dotnet-mastery-2026.svg",
  },
  {
    slug: "microservices-patterns-dotnet",
    title: "Microservices Patterns in .NET",
    eyebrow: "Distributed Systems",
    description:
      "A practical microservices guide covering resilience patterns, messaging, observability, and production architecture decisions in .NET.",
    publishedAt: "March 10, 2026",
    readMinutes: 26,
    tags: [".NET", "Microservices", "Messaging", "Architecture"],
    heroImage: "/article-heroes/microservices-patterns-dotnet.svg",
  },
  {
    slug: "15-case-studies-dotnet",
    title: "15 Real-World .NET Case Studies",
    eyebrow: "Case Studies",
    description:
      "Fifteen real-world .NET architecture case studies with systems thinking, trade-offs, scale patterns, and implementation guidance.",
    publishedAt: "March 8, 2026",
    readMinutes: 32,
    tags: [".NET", "Case Studies", "Architecture", "Distributed Systems"],
    heroImage: "/article-heroes/15-case-studies-dotnet.svg",
  },
];
