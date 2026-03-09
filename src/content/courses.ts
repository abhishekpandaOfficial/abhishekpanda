export type CourseAvailability = "available" | "roadmap";

export type CourseLesson = {
  title: string;
  duration: string;
  isFree: boolean;
  summary?: string;
  href?: string;
  type?: "article" | "video" | "lab" | "quiz";
};

export type CourseModule = {
  title: string;
  duration: string;
  summary?: string;
  lessons: CourseLesson[];
};

export type CourseLearningPathStep = {
  title: string;
  summary: string;
  modules: string[];
};

export type CourseProject = {
  title: string;
  description: string;
};

export type CourseFaq = {
  question: string;
  answer: string;
};

export type CourseResourceLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type CourseCatalogItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  overview: string[];
  duration: string;
  studentsLabel: string;
  rating: number;
  reviews: number;
  priceLabel: string;
  priceAmount: number | null;
  isPremium: boolean;
  availability: CourseAvailability;
  level: string;
  tags: string[];
  thumbnail?: string;
  highlights: string[];
  includes: string[];
  modules: CourseModule[];
  outcomes: string[];
  requirements: string[];
  whoFor: string[];
  buildProjects: CourseProject[];
  learningPath: CourseLearningPathStep[];
  faq: CourseFaq[];
  instructor: {
    name: string;
    role: string;
    bio: string;
  };
  resourceLink?: CourseResourceLink;
  oneToOneEnabled?: boolean;
  oneToOnePriceInr?: number | null;
  oneToOneDurationMinutes?: number | null;
  oneToOneStartHourIst?: number | null;
  oneToOneEndHourIst?: number | null;
  oneToOnePayAfterSchedule?: boolean | null;
};

type UpcomingCourse = {
  title: string;
  category: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isPremium: boolean;
  isFree: boolean;
  price: string | null;
  priceAmount?: number | null;
  slug: string;
  oneToOneEnabled?: boolean;
  oneToOnePriceInr?: number | null;
  oneToOneDurationMinutes?: number | null;
  oneToOneStartHourIst?: number | null;
  oneToOneEndHourIst?: number | null;
  oneToOnePayAfterSchedule?: boolean | null;
  includes: string[];
};

export const COURSE_INSTRUCTOR = {
  name: "Abhishek Panda",
  role: ".NET Architect, AI Engineer, and Systems Mentor",
  bio: "Production-first software engineering guidance built around real architecture decisions, clean delivery, and long-term career growth.",
};

const ROADMAP_PHASES = [
  {
    title: "Foundation",
    summary: "Build the baseline mental model, vocabulary, tooling, and delivery workflow.",
  },
  {
    title: "Implementation",
    summary: "Translate the concepts into working features, modules, and maintainable code.",
  },
  {
    title: "Architecture",
    summary: "Understand the patterns, tradeoffs, and design decisions behind the implementation.",
  },
  {
    title: "Production",
    summary: "Harden the solution with testing, operations, and performance-oriented thinking.",
  },
];

const UPCOMING_COURSES: UpcomingCourse[] = [
  {
    title: "Azure Architect Series Course",
    category: "Architect & Engineering Tracks",
    duration: "14 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "Rs.24,999",
    priceAmount: 24999,
    slug: "azure-architect-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 24999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["1:1 weekend session", "Lifetime access"],
  },
  {
    title: ".NET Architect Series",
    category: "Architect & Engineering Tracks",
    duration: "16 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "Rs.29,999",
    priceAmount: 29999,
    slug: "dotnet-architect-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 29999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["1:1 weekend session", "Lifetime access"],
  },
  {
    title: "Microservices Architecture Mastery",
    category: "Architect & Engineering Tracks",
    duration: "10 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "Rs.9,999",
    priceAmount: 9999,
    slug: "microservices-architecture",
    oneToOneEnabled: true,
    oneToOnePriceInr: 9999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Case studies", "Lifetime access"],
  },
  {
    title: "SOLID Principles Deep Dive",
    category: "Development Foundations",
    duration: "4 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "solid-principles",
    oneToOneEnabled: true,
    oneToOnePriceInr: 3999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Free access", "Starter exercises"],
  },
  {
    title: "Design Patterns Masterclass",
    category: "Development Foundations",
    duration: "8 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "Rs.6,999",
    priceAmount: 6999,
    slug: "design-patterns-masterclass",
    oneToOneEnabled: true,
    oneToOnePriceInr: 6999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Pattern catalog", "Lifetime access"],
  },
  {
    title: "Interview Preparation Series (.NET / Architect)",
    category: "Development Foundations",
    duration: "6 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "interview-prep-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 2999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Mock interviews", "Question bank"],
  },
  {
    title: "Apache Kafka Enterprise Series",
    category: "Messaging & Streaming",
    duration: "7 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "Rs.8,999",
    priceAmount: 8999,
    slug: "apache-kafka-enterprise",
    oneToOneEnabled: true,
    oneToOnePriceInr: 8999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Architecture labs", "Lifetime access"],
  },
  {
    title: "C# Coding (Beginner to Advanced)",
    category: "Development Foundations",
    duration: "12 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "csharp-coding",
    oneToOneEnabled: true,
    oneToOnePriceInr: 2499,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Free core modules", "Community support"],
  },
  {
    title: "Next.js + TypeScript Full Stack",
    category: "Modern Web Stack",
    duration: "9 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "Rs.7,999",
    priceAmount: 7999,
    slug: "nextjs-typescript-fullstack",
    oneToOneEnabled: true,
    oneToOnePriceInr: 7999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Production project", "Lifetime access"],
  },
];

const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const buildLearningPath = (modules: CourseModule[]): CourseLearningPathStep[] => {
  const safeModules = modules.filter((module) => module.lessons.length);
  if (!safeModules.length) return [];

  const grouped = chunk(safeModules, Math.max(1, Math.ceil(safeModules.length / 4)));
  return grouped.map((group, index) => ({
    title: ROADMAP_PHASES[index]?.title || `Phase ${index + 1}`,
    summary: ROADMAP_PHASES[index]?.summary || "A focused progression through the next set of modules.",
    modules: group.map((module) => module.title),
  }));
};

const buildGeneratedModules = (title: string, tags: string[], includes: string[]): CourseModule[] => {
  const coreTag = tags[0] || "Engineering";
  return [
    {
      title: `${coreTag} foundations`,
      duration: "Week 1 to 2",
      summary: `Establish the core vocabulary, tooling, and implementation surface for ${title}.`,
      lessons: [
        {
          title: `Understanding the ${coreTag} problem space`,
          duration: "22 min",
          isFree: true,
          summary: "Frame the topic, its real-world use cases, and the expected delivery outcomes.",
          type: "article",
        },
        {
          title: "Developer workflow and setup",
          duration: "18 min",
          isFree: true,
          summary: "Prepare the project workflow, tooling, and environment configuration.",
          type: "lab",
        },
        {
          title: "First implementation walkthrough",
          duration: "26 min",
          isFree: false,
          summary: "Build the initial flow with conventions that scale beyond a demo project.",
          type: "video",
        },
      ],
    },
    {
      title: "Core delivery patterns",
      duration: "Week 3 to 4",
      summary: "Move from syntax to a repeatable implementation pattern.",
      lessons: [
        {
          title: "Modular design and decomposition",
          duration: "24 min",
          isFree: false,
          summary: "Break the problem into modules that remain easy to test and evolve.",
          type: "video",
        },
        {
          title: "State, errors, and contracts",
          duration: "19 min",
          isFree: false,
          summary: "Handle failure paths and keep interfaces understandable for teams.",
          type: "article",
        },
        {
          title: includes[0] || "Hands-on exercises",
          duration: "28 min",
          isFree: false,
          summary: "Apply the patterns with a guided exercise that reflects production concerns.",
          type: "lab",
        },
      ],
    },
    {
      title: "Architecture and scaling",
      duration: "Week 5 to 6",
      summary: "Focus on patterns, boundaries, and quality decisions that matter in teams.",
      lessons: [
        {
          title: "Architecture tradeoffs and boundaries",
          duration: "25 min",
          isFree: false,
          summary: "Choose the right boundaries and understand where complexity belongs.",
          type: "article",
        },
        {
          title: "Testing and maintainability",
          duration: "20 min",
          isFree: false,
          summary: "Introduce validation, test seams, and maintainability checkpoints.",
          type: "video",
        },
        {
          title: includes[1] || "Architecture review",
          duration: "17 min",
          isFree: false,
          summary: "Review the architecture with a decision-oriented lens.",
          type: "lab",
        },
      ],
    },
    {
      title: "Production readiness",
      duration: "Week 7 onward",
      summary: "Prepare the system for scale, collaboration, and long-term evolution.",
      lessons: [
        {
          title: "Observability and diagnostics",
          duration: "21 min",
          isFree: false,
          summary: "Add the visibility needed to reason about runtime behavior confidently.",
          type: "video",
        },
        {
          title: "Performance and hardening",
          duration: "18 min",
          isFree: false,
          summary: "Address reliability, performance, and operational readiness.",
          type: "article",
        },
        {
          title: includes[includes.length - 1] || "Final roadmap review",
          duration: "16 min",
          isFree: false,
          summary: "Close the loop with next steps, iteration guidance, and career application.",
          type: "lab",
        },
      ],
    },
  ];
};

const buildGeneratedProjects = (title: string, tags: string[]): CourseProject[] => {
  const firstTag = tags[0] || "Engineering";
  const secondTag = tags[1] || "Architecture";
  return [
    {
      title: `${firstTag} starter implementation`,
      description: `Build a clean baseline implementation around ${title} with maintainable structure and clear contracts.`,
    },
    {
      title: `${secondTag} production module`,
      description: "Add architecture decisions, quality gates, and realistic non-functional considerations.",
    },
    {
      title: "Deployment and review checklist",
      description: "Package the final system with a review flow that is ready for teams, interviews, or portfolio work.",
    },
  ];
};

const buildGeneratedFaq = (title: string, isPremium: boolean): CourseFaq[] => [
  {
    question: `Is ${title} practical or theory-heavy?`,
    answer: "The structure is implementation-first. The theory is there only to support real delivery decisions.",
  },
  {
    question: "Do I need advanced experience before starting?",
    answer: "No. The roadmap starts with the base mental model first, then gradually moves into architecture and production concerns.",
  },
  {
    question: isPremium ? "What do I get in the premium version?" : "Is this course really free?",
    answer: isPremium
      ? "The premium track includes the complete roadmap, guided reviews, and deeper architect-level coverage."
      : "Yes. The free track is structured so you can start immediately without a payment gate.",
  },
];

const buildGeneratedWhoFor = (title: string, level: string): string[] => [
  `Developers who want a structured path through ${title}.`,
  `Engineers working toward ${level.toLowerCase()} to architect-level decision making.`,
  "Professionals who prefer chapter-based learning instead of scattered tutorials.",
];

const buildGeneratedRequirements = (tags: string[]): string[] => [
  "Basic programming confidence and comfort reading production-style code.",
  `Familiarity with ${tags[0] || "software engineering"} concepts helps, but is not mandatory.`,
  "A willingness to implement, review, refactor, and revisit the same idea at increasing depth.",
];

const buildOverviewFromText = (text: string) =>
  text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const countCourseLessons = (modules: CourseModule[]) =>
  modules.reduce((total, module) => total + module.lessons.length, 0);

export const countFreeCourseLessons = (modules: CourseModule[]) =>
  modules.reduce((total, module) => total + module.lessons.filter((lesson) => lesson.isFree).length, 0);

const roadmapSeedCourses: CourseCatalogItem[] = [
  {
    id: "csharp-coding",
    slug: "csharp-coding",
    title: "C# & .NET Engineering Zero to Hero",
    category: ".NET Engineering",
    description: "A chapter-based C# and .NET roadmap that starts from language fundamentals and grows into architecture-aware backend engineering.",
    overview: [
      "This course is designed for developers who want a clean, structured path through C#, object-oriented design, ASP.NET Core fundamentals, and the engineering practices expected in real teams.",
      "Instead of random lessons, the roadmap moves in an intentional sequence: syntax, type system, collections, async workflows, APIs, testing, clean architecture, and interview-grade reasoning.",
      "Every chapter is meant to feel like a progression point. You learn the concept, apply it in code, and understand how it connects to larger engineering decisions.",
    ],
    duration: "48+ hours",
    studentsLabel: "6,500+ students",
    rating: 4.9,
    reviews: 426,
    priceLabel: "Free",
    priceAmount: null,
    isPremium: false,
    availability: "available",
    level: "All Levels",
    tags: ["C#", ".NET", "ASP.NET Core", "OOP"],
    highlights: ["Structured chapters", "Source-code-first workflow", "Interview-focused notes", "Production-grade practices"],
    includes: ["48+ hours of guided lessons", "12 roadmap modules", "Hands-on exercises", "Architecture notes"],
    modules: [
      {
        title: "C# language essentials",
        duration: "6 hours",
        summary: "Start with the constructs you will repeatedly use in modern backend engineering.",
        lessons: [
          { title: "Types, variables, and expressions", duration: "24 min", isFree: true, summary: "Build confidence with the basic grammar of C#.", type: "article" },
          { title: "Control flow and pattern matching", duration: "21 min", isFree: true, summary: "Use branching and pattern-based logic clearly and safely.", type: "video" },
          { title: "Collections, LINQ, and iteration", duration: "32 min", isFree: false, summary: "Work with real data sets efficiently.", type: "lab" },
          { title: "Classes, records, and immutability", duration: "28 min", isFree: false, summary: "Choose the right shape for your domain models.", type: "article" },
        ],
      },
      {
        title: "Object-oriented design in practice",
        duration: "7 hours",
        summary: "Move beyond syntax into maintainable class design and domain modeling.",
        lessons: [
          { title: "Interfaces, abstractions, and boundaries", duration: "25 min", isFree: true, summary: "Keep implementations swappable without overengineering.", type: "video" },
          { title: "Encapsulation and invariants", duration: "19 min", isFree: false, summary: "Model domain rules where they belong.", type: "article" },
          { title: "Composition over inheritance", duration: "22 min", isFree: false, summary: "Build systems that are easier to evolve.", type: "lab" },
          { title: "Refactoring object graphs safely", duration: "18 min", isFree: false, summary: "Improve design without destabilizing behavior.", type: "article" },
        ],
      },
      {
        title: "Modern .NET backend foundations",
        duration: "9 hours",
        summary: "Set up the runtime, dependency injection, configuration, and the API mental model.",
        lessons: [
          { title: "Project structure in .NET 10", duration: "20 min", isFree: true, summary: "Establish a clean starting point for maintainable apps.", type: "video" },
          { title: "Dependency injection and service lifetimes", duration: "26 min", isFree: false, summary: "Understand composition roots and service scope choices.", type: "article" },
          { title: "Configuration, options, and environment strategy", duration: "23 min", isFree: false, summary: "Make environment-specific behavior explicit and safe.", type: "lab" },
          { title: "Request pipeline and middleware thinking", duration: "21 min", isFree: false, summary: "Understand how ASP.NET Core processes requests.", type: "video" },
        ],
      },
      {
        title: "API implementation and testing",
        duration: "10 hours",
        summary: "Build clean endpoints, validation flows, persistence, and tests.",
        lessons: [
          { title: "REST endpoint design", duration: "24 min", isFree: true, summary: "Design APIs around clarity, consistency, and HTTP semantics.", type: "article" },
          { title: "Validation, errors, and result shaping", duration: "22 min", isFree: false, summary: "Return predictable and useful responses.", type: "video" },
          { title: "Persistence with EF Core", duration: "29 min", isFree: false, summary: "Model entities and query patterns that stay readable.", type: "lab" },
          { title: "Integration testing strategy", duration: "25 min", isFree: false, summary: "Protect the delivery flow with realistic tests.", type: "article" },
        ],
      },
      {
        title: "Architecture, performance, and interviews",
        duration: "8 hours",
        summary: "Connect implementation-level work to architecture and career readiness.",
        lessons: [
          { title: "Clean architecture boundaries", duration: "24 min", isFree: false, summary: "Separate concerns without creating ceremony.", type: "video" },
          { title: "Caching, async workflows, and resilience", duration: "27 min", isFree: false, summary: "Prepare your systems for real production pressure.", type: "lab" },
          { title: "Observability and diagnostics", duration: "18 min", isFree: false, summary: "Make runtime behavior measurable and debuggable.", type: "article" },
          { title: "Interview review and final roadmap", duration: "20 min", isFree: false, summary: "Turn the course into a portfolio and interview story.", type: "article" },
        ],
      },
    ],
    outcomes: [
      "Write clean C# code with strong object modeling fundamentals.",
      "Build maintainable ASP.NET Core services with predictable architecture.",
      "Apply testing, diagnostics, and refactoring as part of normal delivery.",
      "Explain design decisions clearly in interviews and team discussions.",
    ],
    requirements: [
      "Basic familiarity with programming concepts is enough to start.",
      "Visual Studio, VS Code, or Rider with the .NET SDK installed.",
      "A willingness to code along and revise concepts chapter by chapter.",
    ],
    whoFor: [
      "Beginners moving into professional C# and .NET development.",
      "Developers switching from another language into the Microsoft stack.",
      "Engineers who want a single roadmap that connects language, backend, and architecture fundamentals.",
    ],
    buildProjects: [
      {
        title: "Career-ready C# foundations repo",
        description: "A structured repository of exercises and mini builds that demonstrate language and OOP fluency.",
      },
      {
        title: "Production-style Web API starter",
        description: "A backend project with configuration, validation, persistence, and testing patterns already in place.",
      },
      {
        title: "Architecture review checklist",
        description: "A practical review sheet you can use on your own projects, code reviews, and interview preparation.",
      },
    ],
    learningPath: [],
    faq: [
      {
        question: "Can I start this course without prior .NET experience?",
        answer: "Yes. The opening modules assume you are still building confidence with C# and modern .NET fundamentals.",
      },
      {
        question: "Does it go beyond language syntax?",
        answer: "Yes. The whole point is to connect syntax with architecture, testing, APIs, and delivery thinking.",
      },
      {
        question: "Where do I start after opening the course?",
        answer: "Start with the roadmap modules below or open the C# mastery TOC directly for the broader series structure.",
      },
    ],
    instructor: COURSE_INSTRUCTOR,
    resourceLink: {
      label: "Open C# Mastery",
      href: "/csharp-mastery",
    },
    oneToOneEnabled: true,
    oneToOnePriceInr: 2499,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
  },
  {
    id: "microservices-architecture",
    slug: "microservices-architecture",
    title: "Microservices Architecture Mastery",
    category: "Distributed Systems",
    description: "A .NET-first mastery track built around the attached Microservices Patterns in .NET series, covering decomposition, communication, data, resilience, observability, security, and deployment patterns.",
    overview: [
      "This course is anchored to the full Microservices Patterns in .NET article series and turns that long-form reference into a structured mastery path.",
      "Instead of a generic roadmap, the modules map directly to the real chapters and patterns: business-capability decomposition, API gateway and messaging strategies, sagas and outbox, resilience patterns, security boundaries, observability, and deployment patterns.",
      "The goal is not only to read the pattern names, but to understand when to use them, when to avoid them, and how they fit together in production .NET systems.",
    ],
    duration: "32+ hours",
    studentsLabel: "2,800+ students",
    rating: 4.9,
    reviews: 214,
    priceLabel: "Rs.9,999",
    priceAmount: 9999,
    isPremium: true,
    availability: "available",
    level: "Intermediate",
    tags: ["Microservices", ".NET", "Distributed Systems", "Architecture"],
    highlights: ["38 patterns covered", "9 chapter progression", "Real .NET libraries", "Production decision focus"],
    includes: ["38 microservices patterns", "9 chapter article series", "MassTransit, Kafka, Dapr, YARP coverage", "Lifetime access"],
    modules: [
      {
        title: "Microservices foundations and decomposition",
        duration: "5 hours",
        summary: "Start with what microservices actually are, when to use them, and how to define service boundaries.",
        lessons: [
          {
            title: "What microservices are and when to use them",
            duration: "20 min",
            isFree: true,
            summary: "Use the attached article introduction to understand when distributed systems are justified and when they are not.",
            href: "/articles/microservices-patterns-dotnet#intro",
            type: "article",
          },
          {
            title: "Business capability and subdomain decomposition",
            duration: "26 min",
            isFree: true,
            summary: "Map business capabilities and DDD subdomains into stable service boundaries.",
            href: "/articles/microservices-patterns-dotnet#chapter1",
            type: "article",
          },
          {
            title: "Strangler migration strategy",
            duration: "24 min",
            isFree: false,
            summary: "Use the strangler fig pattern to extract services from a monolith without a big-bang rewrite.",
            href: "/articles/microservices-patterns-dotnet#p-strangler",
            type: "article",
          },
        ],
      },
      {
        title: "Communication and gateway patterns",
        duration: "6 hours",
        summary: "Learn how services and clients should communicate in real .NET systems.",
        lessons: [
          {
            title: "API gateway and BFF strategies",
            duration: "22 min",
            isFree: false,
            summary: "Understand API gateway and BFF patterns with .NET-friendly implementation choices.",
            href: "/articles/microservices-patterns-dotnet#p-api-gateway",
            type: "article",
          },
          {
            title: "Async messaging and event-driven design",
            duration: "28 min",
            isFree: false,
            summary: "Move from request chaining to event-driven and message-based coordination with Kafka, RabbitMQ, and MassTransit.",
            href: "/articles/microservices-patterns-dotnet#p-async-messaging",
            type: "article",
          },
          {
            title: "Choreography versus orchestration",
            duration: "24 min",
            isFree: false,
            summary: "Choose the right workflow coordination style for long-running business flows.",
            href: "/articles/microservices-patterns-dotnet#p-choreography",
            type: "article",
          },
        ],
      },
      {
        title: "Data ownership and distributed workflows",
        duration: "7 hours",
        summary: "Handle data, transactions, consistency, and read/write models across service boundaries.",
        lessons: [
          {
            title: "Database per service and data ownership",
            duration: "21 min",
            isFree: false,
            summary: "Establish service-level ownership and stop sharing schemas across bounded contexts.",
            href: "/articles/microservices-patterns-dotnet#p-db-per-service",
            type: "article",
          },
          {
            title: "Saga, CQRS, and event sourcing tradeoffs",
            duration: "32 min",
            isFree: false,
            summary: "Understand which data workflow patterns belong in your system and which add unnecessary complexity.",
            href: "/articles/microservices-patterns-dotnet#p-saga",
            type: "article",
          },
          {
            title: "Transactional outbox and integration reliability",
            duration: "24 min",
            isFree: false,
            summary: "Guarantee delivery between persistence and messaging infrastructure in .NET services.",
            href: "/articles/microservices-patterns-dotnet#p-outbox",
            type: "article",
          },
        ],
      },
      {
        title: "Resilience and service runtime behavior",
        duration: "5 hours",
        summary: "Build services that fail predictably and recover with controlled degradation.",
        lessons: [
          {
            title: "Circuit breaker and retry strategies",
            duration: "23 min",
            isFree: false,
            summary: "Use resilience patterns without creating retry storms or hidden failure cascades.",
            href: "/articles/microservices-patterns-dotnet#p-circuit-breaker",
            type: "article",
          },
          {
            title: "Bulkheads, rate limiting, and health checks",
            duration: "25 min",
            isFree: false,
            summary: "Protect shared resources and expose the runtime signals operators need.",
            href: "/articles/microservices-patterns-dotnet#p-bulkhead",
            type: "article",
          },
          {
            title: "Operational readiness checklist",
            duration: "18 min",
            isFree: false,
            summary: "Connect resilience patterns to runtime dashboards, alerts, and release discipline.",
            href: "/articles/microservices-patterns-dotnet#chapter4",
            type: "article",
          },
        ],
      },
      {
        title: "Security and observability in distributed systems",
        duration: "5 hours",
        summary: "Secure service-to-service traffic and make the distributed runtime explain itself.",
        lessons: [
          {
            title: "JWT, OAuth, and gateway-level auth",
            duration: "24 min",
            isFree: false,
            summary: "Use the correct authentication boundary for public clients and internal services.",
            href: "/articles/microservices-patterns-dotnet#chapter6",
            type: "article",
          },
          {
            title: "mTLS and zero-trust internal communication",
            duration: "22 min",
            isFree: false,
            summary: "Understand when certificate-based trust is worth the added operational overhead.",
            href: "/articles/microservices-patterns-dotnet#p-mtls",
            type: "article",
          },
          {
            title: "Distributed tracing and correlation IDs",
            duration: "24 min",
            isFree: false,
            summary: "Trace requests across services and correlate logs, metrics, and failure paths.",
            href: "/articles/microservices-patterns-dotnet#p-distributed-tracing",
            type: "article",
          },
        ],
      },
      {
        title: "Deployment and cross-cutting production patterns",
        duration: "4 hours",
        summary: "Finish with release, rollout, sidecar, service mesh, caching, and anti-corruption concerns.",
        lessons: [
          {
            title: "Blue-green, canary, and sidecar release patterns",
            duration: "25 min",
            isFree: false,
            summary: "Deploy with less risk by controlling rollout scope, runtime helpers, and rollback posture.",
            href: "/articles/microservices-patterns-dotnet#chapter8",
            type: "article",
          },
          {
            title: "Service mesh and infrastructure abstractions",
            duration: "20 min",
            isFree: false,
            summary: "Decide when to move cross-cutting concerns into the platform layer.",
            href: "/articles/microservices-patterns-dotnet#p-service-mesh",
            type: "article",
          },
          {
            title: "Idempotency, cache-aside, ACL, and inbox",
            duration: "28 min",
            isFree: false,
            summary: "Close the loop with the cross-cutting patterns that keep distributed systems reliable over time.",
            href: "/articles/microservices-patterns-dotnet#chapter9",
            type: "article",
          },
        ],
      },
    ],
    outcomes: [
      "Choose the right decomposition, communication, and data patterns for a .NET microservices system.",
      "Understand the production tradeoffs of sagas, outbox, CQRS, circuit breakers, and service mesh decisions.",
      "Connect security, observability, and deployment patterns into a coherent architecture strategy.",
      "Use the attached Microservices Patterns in .NET series as a practical reference inside a structured course flow.",
    ],
    requirements: [
      "Comfort with backend development and basic ASP.NET Core concepts.",
      "Some familiarity with APIs, messaging, and distributed system terminology helps.",
      "You do not need prior architect-level experience, but you should be ready for system-design thinking.",
    ],
    whoFor: [
      ".NET developers moving from modular monoliths toward distributed architectures.",
      "Engineers who want a structured pattern guide instead of scattered microservices articles.",
      "Architects and leads who need a clear reference for communication, data, resilience, and platform tradeoffs.",
    ],
    buildProjects: [
      {
        title: "Microservices pattern reference system",
        description: "A chapter-driven architecture reference you can reuse across system design reviews and implementation planning.",
      },
      {
        title: "Message-driven service workflow blueprint",
        description: "A practical blueprint covering gateways, async messaging, sagas, and outbox reliability decisions.",
      },
      {
        title: "Production readiness checklist",
        description: "An operational checklist spanning security, observability, rollout strategy, and cross-cutting runtime patterns.",
      },
    ],
    learningPath: [],
    faq: [
      {
        question: "Is this course tied to the attached Microservices Patterns in .NET article?",
        answer: "Yes. The course lessons intentionally map to that routed article and its chapter/pattern sections.",
      },
      {
        question: "Will the article still open with the full original styling?",
        answer: "Yes. The linked article route renders the authored HTML as-is while keeping the website shell around it.",
      },
      {
        question: "Is this more theory or implementation focused?",
        answer: "The lessons are pattern-heavy, but they are framed around when to use each pattern, what can go wrong, and which .NET libraries fit the decision.",
      },
    ],
    instructor: COURSE_INSTRUCTOR,
    resourceLink: {
      label: "Open Microservices Patterns Article",
      href: "/articles/microservices-patterns-dotnet",
    },
    oneToOneEnabled: true,
    oneToOnePriceInr: 9999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
  },
  {
    id: "solid-principles",
    slug: "solid-principles",
    title: "SOLID Principles for .NET Architects",
    category: "Software Design",
    description: "A principle-by-principle course that turns SOLID from abstract theory into concrete design and refactoring decisions.",
    overview: [
      "This course uses the five SOLID principles as a practical decision system for maintainable .NET applications.",
      "Each section starts with the underlying idea, shows where teams get it wrong, and then moves into code examples, refactors, and architecture guidance.",
      "It is intentionally structured for developers who already write code and now want to write systems that scale with teams, features, and time.",
    ],
    duration: "18+ hours",
    studentsLabel: "3,100+ students",
    rating: 4.9,
    reviews: 188,
    priceLabel: "Free",
    priceAmount: null,
    isPremium: false,
    availability: "available",
    level: "Beginner to Intermediate",
    tags: ["SOLID", ".NET", "Architecture", "Refactoring"],
    highlights: ["Principle-by-principle walkthrough", "Refactoring examples", "Architectural tradeoffs", "Reusable heuristics"],
    includes: ["6 focused modules", "Real .NET examples", "Refactoring checklists", "Design review notes"],
    modules: [
      {
        title: "Overview and design mindset",
        duration: "2 hours",
        summary: "Set the context for why SOLID matters in modern software engineering.",
        lessons: [
          { title: "What SOLID is really for", duration: "16 min", isFree: true, summary: "Separate principle literacy from design dogma.", href: "/articles/solid-principles-guide", type: "article" },
          { title: "Coupling, cohesion, and change pressure", duration: "22 min", isFree: true, summary: "Understand why bad designs become expensive over time.", type: "video" },
          { title: "Evaluating design quality in teams", duration: "18 min", isFree: false, summary: "Create a repeatable lens for code reviews.", type: "lab" },
        ],
      },
      {
        title: "Single responsibility and open-closed",
        duration: "4 hours",
        summary: "Treat responsibilities and extension points with discipline.",
        lessons: [
          { title: "Single responsibility principle", duration: "19 min", isFree: true, summary: "Reduce reasons for change within a class or module.", href: "/articles/solid-principles-guide#srp", type: "article" },
          { title: "Open-closed principle in APIs", duration: "21 min", isFree: false, summary: "Extend behavior without destabilizing existing contracts.", href: "/articles/solid-principles-guide#ocp", type: "article" },
          { title: "Refactoring toward extension points", duration: "25 min", isFree: false, summary: "Move from rigid branching to pluggable behavior.", type: "lab" },
        ],
      },
      {
        title: "Liskov and interface segregation",
        duration: "4 hours",
        summary: "Prevent invalid substitutions and bloated interfaces.",
        lessons: [
          { title: "Liskov substitution in the real world", duration: "20 min", isFree: false, summary: "Model behaviors so child types do not violate expectations.", href: "/articles/solid-principles-guide#lsp", type: "article" },
          { title: "Interface segregation for maintainable teams", duration: "18 min", isFree: false, summary: "Split contracts around consumer needs instead of implementation convenience.", href: "/articles/solid-principles-guide#isp", type: "article" },
          { title: "Finding contract smells early", duration: "16 min", isFree: false, summary: "Use tests and review cues to spot bad abstractions.", type: "lab" },
        ],
      },
      {
        title: "Dependency inversion and composition",
        duration: "4 hours",
        summary: "Understand dependency direction, composition roots, and framework use.",
        lessons: [
          { title: "Dependency inversion in .NET services", duration: "23 min", isFree: false, summary: "Keep policies independent from low-level details.", href: "/articles/solid-principles-guide#dip", type: "article" },
          { title: "Composition root and lifetime decisions", duration: "19 min", isFree: false, summary: "Wire dependencies intentionally at the application edge.", type: "video" },
          { title: "Testing seams and mocks", duration: "17 min", isFree: false, summary: "Design for testability without mock-heavy coupling.", type: "lab" },
        ],
      },
      {
        title: "SOLID in architecture reviews",
        duration: "4 hours",
        summary: "Apply the principles in systems, pull requests, and production codebases.",
        lessons: [
          { title: "Using SOLID during refactors", duration: "18 min", isFree: false, summary: "Decide what to fix first when a codebase is under pressure.", type: "article" },
          { title: "SOLID versus overengineering", duration: "16 min", isFree: false, summary: "Use principles as guidance rather than ritual.", type: "video" },
          { title: "Final design review walkthrough", duration: "24 min", isFree: false, summary: "Review a realistic .NET module using the full framework.", type: "lab" },
        ],
      },
    ],
    outcomes: [
      "Recognize design smells that signal tight coupling and poor boundaries.",
      "Apply each SOLID principle without turning it into ceremony.",
      "Refactor legacy .NET code into clearer, more testable modules.",
      "Use SOLID as a language for code reviews and architecture decisions.",
    ],
    requirements: [
      "Comfort reading C# or similar object-oriented code.",
      "Interest in design, refactoring, and architecture tradeoffs.",
      "No prior deep architecture experience is required.",
    ],
    whoFor: [
      "Developers who know the acronym but want the real engineering meaning behind it.",
      "Mid-level engineers growing into design-heavy backend work.",
      "Architects and leads who want a simpler teaching framework for clean design.",
    ],
    buildProjects: [
      {
        title: "SOLID refactoring workbook",
        description: "A set of before-and-after examples that make each principle tangible in day-to-day code.",
      },
      {
        title: "Design review checklist",
        description: "A reusable review guide for PR discussions, onboarding, and architecture coaching.",
      },
      {
        title: "Clean module case study",
        description: "A small but realistic .NET module refactored with SOLID-driven decisions.",
      },
    ],
    learningPath: [],
    faq: [
      {
        question: "Is this course useful if I have already read about SOLID before?",
        answer: "Yes. The value is in the applied refactoring and architecture decisions, not just the definitions.",
      },
      {
        question: "Does it map well to .NET applications?",
        answer: "Yes. The examples and decision framing are tailored to C#, ASP.NET Core, and service-based design.",
      },
      {
        question: "Can I use the accompanying article while taking the course?",
        answer: "Yes. The course links directly to the SOLID article as a quick reference companion.",
      },
    ],
    instructor: COURSE_INSTRUCTOR,
    resourceLink: {
      label: "Open SOLID Article",
      href: "/articles/solid-principles-guide",
    },
    oneToOneEnabled: true,
    oneToOnePriceInr: 3999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
  },
];

const roadmapCourseSlugs = new Set(roadmapSeedCourses.map((course) => course.slug));

const generatedRoadmapCourses = UPCOMING_COURSES.filter((course) => !roadmapCourseSlugs.has(course.slug)).map(
  (course): CourseCatalogItem => {
    const tags = [course.category.split(" ")[0], course.title.split(" ")[0], course.level].filter(Boolean);
    const modules = buildGeneratedModules(course.title, tags, course.includes);
    return {
      id: course.slug,
      slug: course.slug,
      title: course.title,
      category: course.category,
      description: `${course.title} is a chapter-driven roadmap focused on practical implementation, architecture tradeoffs, and delivery-ready engineering outcomes.`,
      overview: [
        `${course.title} is being shaped as a structured program for developers who want depth instead of scattered topic jumps.`,
        `The roadmap is organized around ${course.includes.join(", ").toLowerCase()} and is intended to move you from fundamentals into reusable engineering patterns.`,
      ],
      duration: course.duration,
      studentsLabel: "Roadmap open",
      rating: 0,
      reviews: 0,
      priceLabel: course.price || "Free",
      priceAmount: course.priceAmount ?? null,
      isPremium: course.isPremium,
      availability: "roadmap",
      level: course.level,
      tags,
      highlights: course.includes,
      includes: [
        `${countCourseLessons(modules)} roadmap lessons`,
        course.duration,
        course.isPremium ? "Mentorship-ready track" : "Free starter path",
        "TOC-style progression",
      ],
      modules,
      outcomes: [
        `Build real confidence around ${course.title}.`,
        "Understand the underlying architecture and operational tradeoffs.",
        "Create a reusable chapter-by-chapter study path for consistent progress.",
      ],
      requirements: buildGeneratedRequirements(tags),
      whoFor: buildGeneratedWhoFor(course.title, course.level),
      buildProjects: buildGeneratedProjects(course.title, tags),
      learningPath: buildLearningPath(modules),
      faq: buildGeneratedFaq(course.title, course.isPremium),
      instructor: COURSE_INSTRUCTOR,
      oneToOneEnabled: course.oneToOneEnabled ?? true,
      oneToOnePriceInr: course.oneToOnePriceInr ?? null,
      oneToOneDurationMinutes: course.oneToOneDurationMinutes ?? 60,
      oneToOneStartHourIst: course.oneToOneStartHourIst ?? 20,
      oneToOneEndHourIst: course.oneToOneEndHourIst ?? 24,
      oneToOnePayAfterSchedule: course.oneToOnePayAfterSchedule ?? true,
    };
  },
);

export const LOCAL_COURSE_CATALOG: CourseCatalogItem[] = [...roadmapSeedCourses, ...generatedRoadmapCourses].map(
  (course) => ({
    ...course,
    learningPath: course.learningPath.length ? course.learningPath : buildLearningPath(course.modules),
  }),
);

export const FUTURE_COURSE_TOPICS = [
  "Docker",
  "Clean Architecture",
  "Terraform",
  "Observability",
  "Performance Tuning",
];

export const findLocalCourseBySlug = (slug: string) =>
  LOCAL_COURSE_CATALOG.find((course) => course.slug === slug);

const normalizeLesson = (lesson: any): CourseLesson => ({
  title: String(lesson?.title || "Untitled lesson"),
  duration: String(lesson?.duration || "10 min"),
  isFree: Boolean(lesson?.isFree),
  summary: lesson?.summary ? String(lesson.summary) : "A focused lesson in the course progression.",
  href: lesson?.href ? String(lesson.href) : undefined,
  type: lesson?.type || "article",
});

export const normalizeCourseModules = (modules: any): CourseModule[] => {
  if (!Array.isArray(modules)) return [];
  return modules
    .map((module, index) => ({
      title: String(module?.title || `Module ${index + 1}`),
      duration: String(module?.duration || "Self-paced"),
      summary: module?.summary ? String(module.summary) : "A structured group of lessons inside this course.",
      lessons: Array.isArray(module?.lessons) ? module.lessons.map(normalizeLesson) : [],
    }))
    .filter((module) => module.lessons.length);
};

export const mapDbCourseToCatalogItem = (row: any): CourseCatalogItem => {
  const modules = normalizeCourseModules(row?.modules);
  const tags = Array.isArray(row?.tags) && row.tags.length ? row.tags.map((tag: any) => String(tag)) : ["Engineering", row?.level || "Beginner"];
  const title = String(row?.title || "Course");
  const overview = buildOverviewFromText(String(row?.long_description || row?.description || ""));
  return {
    id: String(row?.id || row?.slug || title.toLowerCase().replace(/\s+/g, "-")),
    slug: String(row?.slug || row?.id || title.toLowerCase().replace(/\s+/g, "-")),
    title,
    category: tags[0] || "Engineering",
    description: String(row?.description || "A structured engineering course with practical lessons and delivery-focused guidance."),
    overview: overview.length ? overview : [`${title} is a structured course focused on practical implementation and long-term engineering clarity.`],
    duration: String(row?.duration || "Self-paced"),
    studentsLabel: row?.students_count ? `${Number(row.students_count).toLocaleString()}+ students` : "Self-paced",
    rating: Number(row?.rating || 0),
    reviews: Number(row?.reviews_count || 0),
    priceLabel: row?.is_premium ? `Rs.${Number(row?.price_amount || 0).toLocaleString("en-IN")}` : "Free",
    priceAmount: row?.is_premium ? Number(row?.price_amount || 0) : null,
    isPremium: Boolean(row?.is_premium),
    availability: "available",
    level: String(row?.level || "Beginner"),
    tags,
    thumbnail: row?.thumbnail ? String(row.thumbnail) : undefined,
    highlights: tags.slice(0, 4),
    includes: [
      `${countCourseLessons(modules) || row?.lesson_count || 0} lessons`,
      String(row?.duration || "Self-paced"),
      row?.is_premium ? "Premium access" : "Free access",
      "Structured learning path",
    ],
    modules,
    outcomes: Array.isArray(row?.outcomes) && row.outcomes.length ? row.outcomes.map(String) : buildGeneratedProjects(title, tags).map((item) => item.description),
    requirements: Array.isArray(row?.requirements) && row.requirements.length ? row.requirements.map(String) : buildGeneratedRequirements(tags),
    whoFor: buildGeneratedWhoFor(title, String(row?.level || "Beginner")),
    buildProjects: buildGeneratedProjects(title, tags),
    learningPath: buildLearningPath(modules),
    faq: buildGeneratedFaq(title, Boolean(row?.is_premium)),
    instructor: COURSE_INSTRUCTOR,
    oneToOneEnabled: row?.one_to_one_enabled ?? true,
    oneToOnePriceInr: row?.one_to_one_price_inr ?? null,
    oneToOneDurationMinutes: row?.one_to_one_duration_minutes ?? 60,
    oneToOneStartHourIst: row?.one_to_one_start_hour_ist ?? 20,
    oneToOneEndHourIst: row?.one_to_one_end_hour_ist ?? 24,
    oneToOnePayAfterSchedule: row?.one_to_one_pay_after_schedule ?? true,
  };
};
