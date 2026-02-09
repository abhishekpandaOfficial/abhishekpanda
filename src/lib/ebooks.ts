export type EbookCategory =
  | "DOTNET_ARCHITECT"
  | "SOLID_DESIGN_PATTERNS"
  | "INTERVIEW"
  | "KAFKA"
  | "AI_LLM"
  | "ROADMAP";

export type EbookLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ARCHITECT";

export type Ebook = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: EbookCategory;
  level: EbookLevel;
  isFree: boolean;
  isComingSoon: boolean;
  priceInINR: number | null;
  coverImageUrl: string;
  previewPdfUrl: string | null;
  epubUrl: string | null;
  pdfUrl: string | null;
  toc: string[];
  techStack: string[];
  libraries: string[];
  sections: ("featured" | "interview" | "architect")[];
  bundle?: "architect-pro" | "interview-mastery";
};

export const ebookBundles = [
  {
    id: "architect-pro",
    title: "Architect Pro Bundle",
    subtitle: ".NET + SOLID + Architect Interview",
    discountLabel: "Save 22%",
    priceLabel: "₹44,999",
  },
  {
    id: "interview-mastery",
    title: "Interview Mastery Bundle",
    subtitle: "All Interview Packs (.NET + Microservices + Patterns)",
    discountLabel: "Save 35%",
    priceLabel: "₹1,999",
  },
] as const;

export const ebooks: Ebook[] = [
  {
    id: "ebk_1",
    slug: "dotnet-architect-blueprint",
    title: ".NET Architect Blueprint",
    subtitle: "Production Architecture Patterns for Scale",
    description:
      "A practical playbook for designing and operating resilient .NET systems in production with architecture checklists, ADR templates, and scaling patterns.",
    category: "DOTNET_ARCHITECT",
    level: "ARCHITECT",
    isFree: false,
    isComingSoon: false,
    priceInINR: 24999,
    coverImageUrl: "/ebooks/covers/dotnet-architect-blueprint.svg",
    previewPdfUrl: "/ebooks/files/dotnet-architect-blueprint.pdf",
    epubUrl: "/ebooks/files/dotnet-architect-blueprint.epub",
    pdfUrl: "/ebooks/files/dotnet-architect-blueprint.pdf",
    toc: ["Architecture Principles", "Bounded Context Design", "Microservices Contracts", "Observability", "Release & Rollback"],
    techStack: [".NET", "C#", "Azure", "Microservices", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "gRPC"],
    libraries: ["ASP.NET Core", "EF Core", "MediatR", "Polly", "FluentValidation", "Serilog", "OpenTelemetry"],
    sections: ["featured", "architect"],
    bundle: "architect-pro",
  },
  {
    id: "ebk_2",
    slug: "solid-design-patterns-field-guide",
    title: "SOLID & Design Patterns Field Guide",
    subtitle: "Maintainable Code in Enterprise Teams",
    description:
      "A deep implementation guide for SOLID, GoF patterns, anti-pattern refactors, and decision matrices for enterprise .NET teams.",
    category: "SOLID_DESIGN_PATTERNS",
    level: "ADVANCED",
    isFree: false,
    isComingSoon: false,
    priceInINR: 14999,
    coverImageUrl: "/ebooks/covers/solid-design-patterns-field-guide.svg",
    previewPdfUrl: "/ebooks/files/solid-design-patterns-field-guide.pdf",
    epubUrl: "/ebooks/files/solid-design-patterns-field-guide.epub",
    pdfUrl: "/ebooks/files/solid-design-patterns-field-guide.pdf",
    toc: ["SOLID in Practice", "Pattern Selection", "Refactoring Legacy", "Testing Strategies", "Architecture Kata"],
    techStack: [".NET", "C#", "DDD", "SOLID", "Clean Architecture"],
    libraries: ["xUnit", "NSubstitute", "AutoMapper", "FluentValidation"],
    sections: ["featured", "architect"],
    bundle: "architect-pro",
  },
  {
    id: "ebk_3",
    slug: "architect-interview-playbook",
    title: "Architect Interview Playbook",
    subtitle: "System Design + Leadership Rounds",
    description:
      "End-to-end preparation guide for architect interviews: system design drills, tradeoff articulation, and leadership round frameworks.",
    category: "INTERVIEW",
    level: "ARCHITECT",
    isFree: false,
    isComingSoon: false,
    priceInINR: 9999,
    coverImageUrl: "/ebooks/covers/architect-interview-playbook.svg",
    previewPdfUrl: "/ebooks/files/architect-interview-playbook.pdf",
    epubUrl: "/ebooks/files/architect-interview-playbook.epub",
    pdfUrl: "/ebooks/files/architect-interview-playbook.pdf",
    toc: ["Interview Framework", "System Design Case Studies", "Behavioral Leadership", "Whiteboard Tactics", "Offer Strategy"],
    techStack: ["System Design", "Cloud", "Microservices", "Observability"],
    libraries: ["Architecture Review Templates", "Threat Modeling Checklist"],
    sections: ["featured", "interview", "architect"],
    bundle: "architect-pro",
  },
  {
    id: "ebk_4",
    slug: "dotnet-interview-questions-core",
    title: ".NET Interview Questions: Core",
    subtitle: "High-Signal Questions + Answers",
    description: "Free interview prep ebook with structured .NET core question bank and concise answer guides.",
    category: "INTERVIEW",
    level: "BEGINNER",
    isFree: true,
    isComingSoon: false,
    priceInINR: null,
    coverImageUrl: "/ebooks/covers/dotnet-interview-questions-core.svg",
    previewPdfUrl: "/ebooks/files/dotnet-interview-questions-core.pdf",
    epubUrl: "/ebooks/files/dotnet-interview-questions-core.epub",
    pdfUrl: "/ebooks/files/dotnet-interview-questions-core.pdf",
    toc: ["Runtime & CLR", "ASP.NET Core", "Dependency Injection", "Performance Basics"],
    techStack: [".NET", "C#", "ASP.NET Core"],
    libraries: ["EF Core", "LINQ"],
    sections: ["interview"],
    bundle: "interview-mastery",
  },
  {
    id: "ebk_5",
    slug: "microservices-interview-questions-core",
    title: "Microservices Interview Questions: Core",
    subtitle: "Distributed System Interview Essentials",
    description: "Free interview prep ebook for microservices, messaging, resiliency, and distributed architecture interviews.",
    category: "INTERVIEW",
    level: "INTERMEDIATE",
    isFree: true,
    isComingSoon: false,
    priceInINR: null,
    coverImageUrl: "/ebooks/covers/microservices-interview-questions-core.svg",
    previewPdfUrl: "/ebooks/files/microservices-interview-questions-core.pdf",
    epubUrl: "/ebooks/files/microservices-interview-questions-core.epub",
    pdfUrl: "/ebooks/files/microservices-interview-questions-core.pdf",
    toc: ["Service Boundaries", "Event-Driven Systems", "Failure Modes", "Scaling Decisions"],
    techStack: ["Microservices", "Kafka", "Docker", "Kubernetes", "Redis"],
    libraries: ["Polly", "MassTransit", "OpenTelemetry"],
    sections: ["interview"],
    bundle: "interview-mastery",
  },
  {
    id: "ebk_6",
    slug: "design-patterns-interview-questions-core",
    title: "Design Patterns Interview Questions: Core",
    subtitle: "Pattern Selection Under Pressure",
    description: "Free design patterns interview pack focused on practical usage, tradeoffs, and anti-pattern corrections.",
    category: "INTERVIEW",
    level: "INTERMEDIATE",
    isFree: true,
    isComingSoon: false,
    priceInINR: null,
    coverImageUrl: "/ebooks/covers/design-patterns-interview-questions-core.svg",
    previewPdfUrl: "/ebooks/files/design-patterns-interview-questions-core.pdf",
    epubUrl: "/ebooks/files/design-patterns-interview-questions-core.epub",
    pdfUrl: "/ebooks/files/design-patterns-interview-questions-core.pdf",
    toc: ["Creational", "Structural", "Behavioral", "Pattern Tradeoffs"],
    techStack: ["SOLID", "DDD", "C#", "Refactoring"],
    libraries: ["Refactoring Checklist", "Architecture Pattern Matrix"],
    sections: ["interview"],
    bundle: "interview-mastery",
  },
];

export const ebookBySlug = (slug?: string) => ebooks.find((e) => e.slug === slug);
