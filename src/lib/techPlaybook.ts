export type TechDomainSlug =
  | "dotnet"
  | "microservices"
  | "devops"
  | "cloud"
  | "ai-ml"
  | "recent-unboxing"
  | "others";

export interface LearningLevel {
  basics: string[];
  intermediate: string[];
  advanced: string[];
  architect: string[];
}

export interface FreePost {
  title: string;
  summary: string;
  href: string;
  tag: string;
}

export interface TechPlaybookItem {
  slug: string;
  name: string;
  what: string;
  why: string;
  domain: TechDomainSlug;
  tags: string[];
  levels: LearningLevel;
  freePosts: FreePost[];
}

export interface TechDomain {
  slug: TechDomainSlug;
  label: string;
  description: string;
  focusTags: string[];
}

export const TECH_DOMAINS: TechDomain[] = [
  {
    slug: "dotnet",
    label: ".NET Blogs",
    description: "C#, API design, LINQ, EF Core, performance and architecture patterns.",
    focusTags: ["C#", "Web API", "LINQ", "EF Core", ".NET 10"],
  },
  {
    slug: "microservices",
    label: "Microservices Blogs",
    description: "Service boundaries, messaging, resiliency, observability and distributed design.",
    focusTags: ["DDD", "Event-Driven", "API Gateway", "Kafka", "SAGA"],
  },
  {
    slug: "devops",
    label: "DevOps Blogs",
    description: "CI/CD, GitHub Actions, Argo CD, release flow and operations engineering.",
    focusTags: ["CI/CD", "GitHub Actions", "Argo CD", "Release Strategy"],
  },
  {
    slug: "cloud",
    label: "Cloud Blogs",
    description: "Azure/AWS architecture, networking, security, cost and scalability playbooks.",
    focusTags: ["Azure", "AWS", "IaC", "Kubernetes"],
  },
  {
    slug: "ai-ml",
    label: "AI/ML Blogs",
    description: "Production AI pipelines, model serving, evaluation and platform engineering.",
    focusTags: ["MLOps", "Serving", "Prompting", "Evaluation"],
  },
  {
    slug: "recent-unboxing",
    label: "Recent Tech Blogs (Unboxing)",
    description: "Latest tools, framework updates and architecture trends with practical takeaways.",
    focusTags: ["Latest", "Unboxing", "Trends", "Comparison"],
  },
  {
    slug: "others",
    label: "Other Blogs",
    description: "Cross-cutting engineering topics, interviews, design and career growth notes.",
    focusTags: ["System Design", "Career", "Leadership", "Best Practices"],
  },
];

export const TECH_PLAYBOOK_ITEMS: TechPlaybookItem[] = [
  {
    slug: "dotnet-core-api-net10",
    name: ".NET Core API (.NET 10)",
    what: "High-performance REST APIs using ASP.NET Core and modern .NET runtime features.",
    why: "Forms the backbone of scalable business services with strong typing, performance and maintainability.",
    domain: "dotnet",
    tags: [".NET 10", "ASP.NET Core", "REST", "Minimal APIs", "Clean Architecture"],
    levels: {
      basics: ["Controllers vs Minimal APIs", "Routing and model binding", "Dependency injection basics"],
      intermediate: ["Versioning and API contracts", "Validation and error handling", "AuthN/AuthZ with JWT"],
      advanced: ["Rate limiting and caching", "Performance profiling", "OpenTelemetry tracing"],
      architect: ["Service decomposition", "API governance", "Backward compatibility strategy"],
    },
    freePosts: [
      {
        title: "ASP.NET Core Web API: Complete Engineering Guide",
        summary: "Build production APIs with validation, auth, testing and deployment standards.",
        href: "/blog",
        tag: ".NET Blogs",
      },
      {
        title: ".NET API Performance Playbook",
        summary: "Practical bottleneck detection and optimization path for high-throughput APIs.",
        href: "/blogs",
        tag: "Recent Tech Blogs (Unboxing)",
      },
    ],
  },
  {
    slug: "microservices",
    name: "Microservices",
    what: "Independent services organized around business capabilities, communicating via APIs/events.",
    why: "Speeds team delivery and scaling while reducing blast radius of changes in large systems.",
    domain: "microservices",
    tags: ["Domain Boundaries", "Service Contracts", "Async Messaging", "Resilience"],
    levels: {
      basics: ["Monolith vs microservices", "Service boundary basics", "Sync vs async communication"],
      intermediate: ["API gateway patterns", "Circuit breakers and retries", "Event-driven integration"],
      advanced: ["SAGA orchestration", "Outbox pattern", "Distributed observability"],
      architect: ["Platform standards", "Org-aligned domain design", "Governed evolutionary architecture"],
    },
    freePosts: [
      {
        title: "Microservices Architecture 2026: Practical Patterns",
        summary: "Real-world design guidance for reliable distributed systems.",
        href: "/blogs",
        tag: "Microservices Blogs",
      },
      {
        title: "Choosing Messaging Patterns in Service Systems",
        summary: "When to use events, queues, streams and workflow orchestration.",
        href: "/blog",
        tag: "Microservices Blogs",
      },
    ],
  },
  {
    slug: "github",
    name: "GitHub",
    what: "Source control and engineering collaboration platform for repositories, reviews and workflows.",
    why: "Enables transparent delivery, quality control and async team collaboration at scale.",
    domain: "devops",
    tags: ["Git", "Code Review", "Branch Strategy", "Security"],
    levels: {
      basics: ["Branching model", "Pull requests", "Review hygiene"],
      intermediate: ["Protected branches", "CODEOWNERS", "Issue-to-PR traceability"],
      advanced: ["Repo standards", "Automation hooks", "Security scan policies"],
      architect: ["Org repository strategy", "Governance and compliance", "Inner-source playbooks"],
    },
    freePosts: [
      {
        title: "Engineering Workflow with GitHub at Scale",
        summary: "A structured approach for branching, reviews and release readiness.",
        href: "/blog",
        tag: "DevOps Blogs",
      },
    ],
  },
  {
    slug: "github-actions",
    name: "GitHub Actions",
    what: "Automation engine for CI/CD pipelines directly inside GitHub repositories.",
    why: "Reduces release friction and enforces build/test/deploy quality gates.",
    domain: "devops",
    tags: ["CI/CD", "Workflow", "Build", "Release"],
    levels: {
      basics: ["Workflow syntax", "Runners and jobs", "Trigger events"],
      intermediate: ["Reusable workflows", "Secrets management", "Matrix builds"],
      advanced: ["Progressive deployments", "Caching optimization", "Policy checks"],
      architect: ["Enterprise workflow templates", "Release control architecture", "Cross-repo automation"],
    },
    freePosts: [
      {
        title: "CI/CD Pipelines with GitHub Actions for .NET",
        summary: "From commit to deployment with robust quality gates.",
        href: "/blog",
        tag: "DevOps Blogs",
      },
    ],
  },
  {
    slug: "argo-cd",
    name: "Argo CD",
    what: "GitOps continuous delivery controller for Kubernetes environments.",
    why: "Improves release safety with declarative, auditable and reproducible deployments.",
    domain: "devops",
    tags: ["GitOps", "Kubernetes", "Continuous Delivery", "Ops"],
    levels: {
      basics: ["GitOps fundamentals", "Application definitions", "Sync and health checks"],
      intermediate: ["Environment overlays", "RBAC and projects", "Rollout controls"],
      advanced: ["Multi-cluster management", "Drift detection strategies", "Progressive delivery"],
      architect: ["Platform GitOps model", "Release governance", "Secure delivery architecture"],
    },
    freePosts: [
      {
        title: "Argo CD GitOps Delivery Blueprint",
        summary: "Practical GitOps patterns for reliable cluster releases.",
        href: "/blogs",
        tag: "DevOps Blogs",
      },
    ],
  },
  {
    slug: "design-patterns",
    name: "Design Patterns",
    what: "Reusable software design templates for solving recurring architectural and code-level problems.",
    why: "Increases consistency, readability and maintainability in large codebases.",
    domain: "dotnet",
    tags: ["GoF", "Enterprise Patterns", "Refactoring", "Maintainability"],
    levels: {
      basics: ["Singleton, Factory, Strategy", "When to use patterns", "Common anti-patterns"],
      intermediate: ["CQRS and mediator usage", "Repository and unit of work", "Composition patterns"],
      advanced: ["Pattern trade-off analysis", "Performance-aware designs", "Pattern-oriented testing"],
      architect: ["Org-level pattern catalog", "Reference architecture patterns", "Governance for pattern usage"],
    },
    freePosts: [
      {
        title: "Design Patterns for .NET Teams",
        summary: "Hands-on usage guide with practical decision points.",
        href: "/blogs",
        tag: ".NET Blogs",
      },
    ],
  },
  {
    slug: "solid-principles",
    name: "SOLID Principles",
    what: "Core object-oriented design principles for extensible and testable code.",
    why: "Prevents rigid systems and enables cleaner evolution of features over time.",
    domain: "dotnet",
    tags: ["SOLID", "OOP", "Refactoring", "Maintainability"],
    levels: {
      basics: ["SRP/OCP/LSP/ISP/DIP definitions", "Simple examples", "Common mistakes"],
      intermediate: ["Applying SOLID in APIs", "Dependency inversion in services", "Testing boundaries"],
      advanced: ["SOLID vs performance trade-offs", "Large-module refactoring", "Policy-driven abstractions"],
      architect: ["SOLID in enterprise blueprints", "Code quality governance", "Architecture review checklist"],
    },
    freePosts: [
      {
        title: "SOLID in Production APIs",
        summary: "Pragmatic SOLID application in real .NET systems.",
        href: "/blog",
        tag: ".NET Blogs",
      },
    ],
  },
  {
    slug: "microservices-architecture",
    name: "Microservices Architecture",
    what: "System-wide design patterns for coordinating distributed microservices.",
    why: "Aligns service interactions, resilience and observability for long-term platform reliability.",
    domain: "microservices",
    tags: ["Architecture", "Event-Driven", "Resilience", "Observability"],
    levels: {
      basics: ["Architecture fundamentals", "Communication styles", "Operational concerns"],
      intermediate: ["Contract governance", "Service mesh basics", "Centralized tracing"],
      advanced: ["Failure mode engineering", "Throughput and latency design", "Workflow orchestration"],
      architect: ["Platform reference models", "SLO-driven architecture", "Evolution roadmap"],
    },
    freePosts: [
      {
        title: "Microservices Architecture Blueprint",
        summary: "A practical architecture map from MVP to enterprise scale.",
        href: "/blogs",
        tag: "Microservices Blogs",
      },
    ],
  },
];

export const TECH_PLAYBOOK_MAP = new Map(TECH_PLAYBOOK_ITEMS.map((item) => [item.name, item]));

export const getTechPlaybookBySlug = (slug: string) =>
  TECH_PLAYBOOK_ITEMS.find((item) => item.slug === slug);

export const getDomainItems = (domain: TechDomainSlug) =>
  TECH_PLAYBOOK_ITEMS.filter((item) => item.domain === domain);
