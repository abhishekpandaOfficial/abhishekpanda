export type BlogSeriesTrack = {
  slug: string;
  title: string;
  detailTitle?: string;
  subtitle: string;
  tags: string[];
  keywords: string[];
  logos: string[];
  rgb: string;
  href?: string;
  actionLabel?: string;
};

export type BlogSeriesChapter = {
  title: string;
  description: string;
  topics: string[];
};

export type BlogSeriesModule = {
  id: string;
  title: string;
  description: string;
  chapters: BlogSeriesChapter[];
};

export type BlogSeriesToc = {
  overview: string;
  highlights: string[];
  modules: BlogSeriesModule[];
};

export const BLOG_SERIES: BlogSeriesTrack[] = [
  {
    slug: "csharp-mastery",
    title: "C# Mastery",
    detailTitle: "C# Mastery",
    subtitle: "Reserved route for the upcoming C# mastery syllabus and chapter structure.",
    tags: ["C#", ".NET", "Series"],
    keywords: ["c#", ".net", "dotnet", "asp.net", "entity framework", "blazor"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "99 102 241",
    href: "/csharp-mastery",
    actionLabel: "Open C# Mastery",
  },
  {
    slug: "linq-mastery",
    title: "LINQ Mastery",
    detailTitle: "LINQ Mastery",
    subtitle: "Comprehensive LINQ track covering query syntax, operators, execution, performance, expression trees, PLINQ, and interview prep.",
    tags: ["LINQ", ".NET", "Series"],
    keywords: ["linq", "c#", ".net", "query syntax", "expression trees", "plinq"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "16 185 129",
    href: "/linq-mastery",
    actionLabel: "Open LINQ Mastery",
  },
  {
    slug: "dotnet-mastery",
    title: ".NET Core Internals Mastery",
    detailTitle: ".NET Core Internals Mastery",
    subtitle: "Comprehensive .NET internals track covering CLR, JIT, GC, async infrastructure, DI, performance, and runtime architecture.",
    tags: [".NET", "CLR", "Series"],
    keywords: [".net", "dotnet", "clr", "jit", "gc", "async", "dependency injection", "performance"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "14 165 233",
    href: "/dotnet-mastery",
    actionLabel: "Open .NET Core Internals Mastery",
  },
  {
    slug: "efcore-mastery",
    title: "EF Core Mastery",
    detailTitle: "EF Core Mastery",
    subtitle: "Structured EF Core syllabus covering fundamentals, modeling, queries, performance, and production data patterns.",
    tags: ["EF Core", "Data", "Series"],
    keywords: ["ef core", "entity framework core", "orm", "linq", "migrations", "performance"],
    logos: ["/brand-logos/stacks/dotnet.svg", "/brand-logos/stacks/postgresql.svg"],
    rgb: "16 185 129",
    href: "/efcore-mastery",
    actionLabel: "Open EF Core Mastery",
  },
  {
    slug: "solid-principles",
    title: "SOLID Principles",
    subtitle: "Design principles, refactoring moves, and maintainable object-oriented architecture.",
    tags: ["SOLID", "Architecture", "OOP"],
    keywords: ["solid", "single responsibility", "open closed", "liskov", "interface segregation", "dependency inversion"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "56 189 248",
    href: "/cheatsheets/solid-principles",
    actionLabel: "Open Guide",
  },
  {
    slug: "design-patterns",
    title: "Design Patterns",
    subtitle: "Factory, Strategy, Builder, Observer, and the patterns that shape production codebases.",
    tags: ["Patterns", "Architecture", "Systems"],
    keywords: ["design pattern", "factory", "strategy", "observer", "builder", "decorator", "adapter"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "251 146 60",
    href: "/design-patterns-guide",
    actionLabel: "Open Guide",
  },
  {
    slug: "microservices-mastery",
    title: "Microservices Mastery",
    detailTitle: "Microservices Mastery",
    subtitle: "Zero-to-hero path for service boundaries, resilience, messaging, and cloud-native delivery.",
    tags: ["Microservices", "Distributed", "Cloud"],
    keywords: ["microservices", "service mesh", "api gateway", "distributed systems", "saga", "event driven"],
    logos: ["/brand-logos/stacks/docker.svg", "/brand-logos/stacks/kubernetes.svg"],
    rgb: "14 165 233",
    href: "/microservices-mastery",
    actionLabel: "Open Microservices Mastery",
  },
  {
    slug: "kafka-mastery",
    title: "Kafka Mastery",
    detailTitle: "Kafka Mastery",
    subtitle: "Event streaming, producers, consumers, partitions, and high-scale platform design.",
    tags: ["Kafka", "Streaming", "Events"],
    keywords: ["kafka", "event streaming", "producer", "consumer", "partition", "stream processing"],
    logos: ["/brand-logos/stacks/kafka.svg", "/brand-logos/stacks/docker.svg"],
    rgb: "168 85 247",
    href: "/kafka-mastery",
    actionLabel: "Open Kafka Mastery",
  },
  {
    slug: "blazor-mastery",
    title: "Blazor Mastery",
    detailTitle: "Blazor Mastery",
    subtitle: "Complete Blazor track covering components, rendering models, server, WASM, hybrid, auth, SignalR, and enterprise delivery.",
    tags: ["Blazor", ".NET", "Frontend"],
    keywords: ["blazor", ".net", "razor components", "blazor server", "blazor wasm", "blazor hybrid"],
    logos: ["/brand-logos/stacks/dotnet.svg", "/brand-logos/stacks/csharp.svg"],
    rgb: "124 58 237",
    href: "/blazor-mastery",
    actionLabel: "Open Blazor Mastery",
  },
  {
    slug: "devops-mastery",
    title: "DevOps Mastery",
    subtitle: "CI/CD, infrastructure automation, containers, observability, and release engineering.",
    tags: ["DevOps", "CI/CD", "Platform"],
    keywords: ["devops", "ci/cd", "docker", "terraform", "jenkins", "kubernetes", "platform engineering"],
    logos: ["/brand-logos/stacks/docker.svg", "/brand-logos/stacks/terraform.svg"],
    rgb: "59 130 246",
  },
  {
    slug: "ai-ml-mastery",
    title: "AI / ML Mastery",
    subtitle: "Core concepts, model pipelines, experimentation, evaluation, and applied AI engineering.",
    tags: ["AI/ML", "Models", "Applied"],
    keywords: ["ai", "ml", "machine learning", "artificial intelligence", "model training", "feature engineering"],
    logos: ["/brand-logos/stacks/tensorflow.svg", "/brand-logos/stacks/pytorch.svg"],
    rgb: "16 185 129",
  },
  {
    slug: "databases-mastery",
    title: "Databases Mastery",
    subtitle: "Relational, NoSQL, caching, indexing, and data architecture from basics to scale.",
    tags: ["Data", "SQL", "Persistence"],
    keywords: ["database", "sql", "postgresql", "mongodb", "redis", "data modeling", "indexing"],
    logos: ["/brand-logos/stacks/postgresql.svg", "/brand-logos/stacks/mongodb.svg"],
    rgb: "8 145 178",
  },
  {
    slug: "agile-mastery",
    title: "Agile Mastery",
    subtitle: "Delivery flow, sprint systems, engineering rituals, and practical agile execution.",
    tags: ["Agile", "Delivery", "Teamwork"],
    keywords: ["agile", "scrum", "kanban", "delivery", "retrospective", "backlog", "team velocity"],
    logos: ["/brand-logos/stacks/git.svg", "/brand-logos/stacks/github.svg"],
    rgb: "234 179 8",
  },
  {
    slug: "angular-mastery",
    title: "Angular Mastery",
    detailTitle: "Angular Mastery",
    subtitle: "Angular architecture, RxJS, TypeScript patterns, and enterprise frontend delivery.",
    tags: ["Angular", "TypeScript", "Frontend"],
    keywords: ["angular", "rxjs", "typescript", "component", "frontend architecture"],
    logos: ["/brand-logos/stacks/angular.svg", "/brand-logos/stacks/typescript.svg"],
    rgb: "239 68 68",
    href: "/angular-mastery",
    actionLabel: "Open Angular Mastery",
  },
  {
    slug: "next-js-mastery",
    title: "Next.js Mastery",
    subtitle: "Modern React apps with routing, server rendering, data fetching, and performance.",
    tags: ["Next.js", "React", "Full Stack"],
    keywords: ["next.js", "nextjs", "react", "ssr", "server components", "app router"],
    logos: ["/brand-logos/stacks/nextjs.svg", "/brand-logos/stacks/react.svg"],
    rgb: "71 85 105",
  },
  {
    slug: "blockchain-mastery",
    title: "Blockchain Mastery",
    subtitle: "Distributed ledgers, smart contracts, tokens, and real-world blockchain architecture.",
    tags: ["Blockchain", "Web3", "Protocols"],
    keywords: ["blockchain", "smart contract", "ethereum", "bitcoin", "web3", "ledger"],
    logos: ["/brand-logos/stacks/bitcoin.svg", "/brand-logos/stacks/ethereum.svg"],
    rgb: "148 163 184",
  },
  {
    slug: "azure-mastery",
    title: "Azure Mastery",
    detailTitle: "Azure Mastery",
    subtitle: "Azure services, cloud architecture, DevOps flows, and enterprise deployment patterns.",
    tags: ["Azure", "Cloud", "Architect"],
    keywords: ["azure", "microsoft azure", "app service", "aks", "azure devops", "cloud architecture"],
    logos: ["/brand-logos/stacks/microsoftazure.svg", "/brand-logos/stacks/docker.svg"],
    rgb: "59 130 246",
    href: "/azure-mastery",
    actionLabel: "Open Azure Mastery",
  },
  {
    slug: "aws-mastery",
    title: "AWS Mastery",
    subtitle: "Core AWS services, system design, security patterns, and scalable cloud delivery.",
    tags: ["AWS", "Cloud", "Scale"],
    keywords: ["aws", "amazon web services", "lambda", "ecs", "eks", "cloud"],
    logos: ["/brand-logos/stacks/aws.svg", "/brand-logos/stacks/docker.svg"],
    rgb: "249 115 22",
  },
  {
    slug: "gcp-mastery",
    title: "GCP Mastery",
    subtitle: "Google Cloud services, data platforms, platform tooling, and cloud-native systems.",
    tags: ["GCP", "Cloud", "Platform"],
    keywords: ["gcp", "google cloud", "gke", "bigquery", "cloud run", "cloud architecture"],
    logos: ["/brand-logos/stacks/gcp.svg", "/brand-logos/stacks/kubernetes.svg"],
    rgb: "34 197 94",
  },
  {
    slug: "deep-learning-mastery",
    title: "Deep Learning Mastery",
    subtitle: "Neural networks, training loops, optimization, and production-scale deep learning.",
    tags: ["Deep Learning", "Neural Nets", "Training"],
    keywords: ["deep learning", "neural network", "pytorch", "tensorflow", "backpropagation", "cnn"],
    logos: ["/brand-logos/stacks/pytorch.svg", "/brand-logos/stacks/tensorflow.svg"],
    rgb: "124 58 237",
  },
  {
    slug: "machine-learning-mastery",
    title: "Machine Learning Mastery",
    subtitle: "Classical ML, feature engineering, experiments, metrics, and model improvement loops.",
    tags: ["Machine Learning", "Models", "Scikit-learn"],
    keywords: ["machine learning", "scikit", "scikit-learn", "regression", "classification", "feature engineering"],
    logos: ["/brand-logos/stacks/scikitlearn.svg", "/brand-logos/stacks/python.svg"],
    rgb: "6 182 212",
  },
  {
    slug: "blockchain-zero-to-hero",
    title: "Blockchain Mastery - Zero to Hero",
    subtitle: "Foundations-first path for blockchain, token systems, wallets, and practical Web3 builds.",
    tags: ["Blockchain", "Zero to Hero", "Wallets"],
    keywords: ["blockchain", "web3", "wallet", "token", "smart contract", "ethereum", "bitcoin"],
    logos: ["/brand-logos/stacks/bitcoin.svg", "/brand-logos/stacks/ethereum.svg"],
    rgb: "217 119 6",
  },
  {
    slug: "nlp-llm-mastery",
    title: "NLP / LLM Mastery",
    subtitle: "Language systems, prompt engineering, RAG, agents, evaluation, and modern LLM stacks.",
    tags: ["NLP", "LLMs", "Agentic"],
    keywords: ["nlp", "llm", "language model", "prompt engineering", "rag", "agentic", "hugging face"],
    logos: ["/brand-logos/stacks/huggingface.svg", "/brand-logos/stacks/openai.svg"],
    rgb: "217 70 239",
  },
  {
    slug: "computer-vision-mastery",
    title: "Computer Vision Mastery",
    subtitle: "Image models, detection, embeddings, pipelines, and real-world visual AI systems.",
    tags: ["Computer Vision", "Vision AI", "Models"],
    keywords: ["computer vision", "vision", "image model", "object detection", "opencv", "segmentation"],
    logos: ["/brand-logos/stacks/python.svg", "/brand-logos/stacks/tensorflow.svg"],
    rgb: "236 72 153",
  },
  {
    slug: "web3-series",
    title: "Web3 Series",
    subtitle: "Protocols, wallets, dApps, identity, contracts, and ecosystem-level Web3 engineering.",
    tags: ["Web3", "dApps", "Protocols"],
    keywords: ["web3", "dapp", "wallet", "smart contract", "ethereum", "decentralized"],
    logos: ["/brand-logos/stacks/ethereum.svg", "/brand-logos/stacks/bitcoin.svg"],
    rgb: "96 165 250",
  },
];

export const BLOG_SERIES_BY_SLUG = new Map(BLOG_SERIES.map((series) => [series.slug, series]));

type SeriesMatchCandidate = {
  title?: string | null;
  excerpt?: string | null;
  tags?: string[] | null;
};

export const matchesBlogSeries = (series: BlogSeriesTrack, candidate: SeriesMatchCandidate) => {
  const source = `${candidate.title || ""} ${candidate.excerpt || ""} ${(candidate.tags || []).join(" ")}`.toLowerCase();
  return series.keywords.some((keyword) => source.includes(keyword.toLowerCase()));
};

export const getBlogSeriesDisplayTitle = (series: BlogSeriesTrack) => series.detailTitle || series.title;

export const getBlogSeriesHref = (series: BlogSeriesTrack) => series.href || `/cheatsheets/${series.slug}`;

type SeriesKind =
  | "engineering"
  | "platform"
  | "frontend"
  | "data"
  | "ai"
  | "web3"
  | "delivery";

const SPECIAL_TOPIC_LABELS: Record<string, string> = {
  "c#": "C#",
  ".net": ".NET",
  dotnet: ".NET",
  "asp.net": "ASP.NET Core",
  blazor: "Blazor",
  ai: "AI",
  ml: "ML",
  "ai/ml": "AI/ML",
  llm: "LLM",
  llms: "LLMs",
  nlp: "NLP",
  sql: "SQL",
  nosql: "NoSQL",
  rxjs: "RxJS",
  "next.js": "Next.js",
  nextjs: "Next.js",
  web3: "Web3",
  devops: "DevOps",
  "ci/cd": "CI/CD",
  aws: "AWS",
  gcp: "GCP",
  kafka: "Kafka",
  kubernetes: "Kubernetes",
  docker: "Docker",
  terraform: "Terraform",
  azure: "Azure",
  angular: "Angular",
  react: "React",
  oop: "OOP",
  solid: "SOLID",
  rag: "RAG",
  opencv: "OpenCV",
  "scikit-learn": "Scikit-learn",
  scikit: "Scikit-learn",
  "deep learning": "Deep Learning",
  "machine learning": "Machine Learning",
  "computer vision": "Computer Vision",
};

const KIND_FALLBACK_TOPICS: Record<SeriesKind, string[]> = {
  engineering: ["Core Concepts", "Code Design", "Testing", "Architecture", "Refactoring", "Production Delivery"],
  platform: ["Foundations", "Infrastructure", "Automation", "Observability", "Security", "Scale"],
  frontend: ["Components", "State Management", "Routing", "Performance", "Testing", "Deployment"],
  data: ["Modeling", "Query Design", "Performance", "Reliability", "Scaling", "Operations"],
  ai: ["Foundations", "Training", "Evaluation", "Pipelines", "Inference", "Production"],
  web3: ["Protocols", "Wallets", "Smart Contracts", "Security", "Identity", "Scale"],
  delivery: ["Principles", "Execution", "Planning", "Ceremonies", "Metrics", "Improvement"],
};

const KIND_BLUEPRINTS: Record<
  SeriesKind,
  Array<{ id: string; title: string; description: string; chapterLabels: [string, string] }>
> = {
  engineering: [
    {
      id: "foundations",
      title: "Foundation Track",
      description: "Build the core mental model, vocabulary, and baseline implementation flow for this mastery series.",
      chapterLabels: ["Core Concepts", "Hands-on Setup"],
    },
    {
      id: "architecture",
      title: "Architecture Track",
      description: "Move from isolated concepts into maintainable design, patterns, and production-oriented implementation choices.",
      chapterLabels: ["Architecture Decisions", "Implementation Patterns"],
    },
    {
      id: "delivery",
      title: "Delivery Track",
      description: "Finish with testing, performance, refactoring, and operational discipline so the series lands in real projects.",
      chapterLabels: ["Quality and Reliability", "Production Readiness"],
    },
  ],
  platform: [
    {
      id: "services",
      title: "Service Foundations",
      description: "Cover the essential platform services, runtime setup, and baseline workflows for building with confidence.",
      chapterLabels: ["Core Services", "Platform Setup"],
    },
    {
      id: "automation",
      title: "Automation and Architecture",
      description: "Introduce the infrastructure, deployment, messaging, and scaling patterns that shape production systems.",
      chapterLabels: ["Automation Flows", "Architecture Patterns"],
    },
    {
      id: "operations",
      title: "Operations and Scale",
      description: "Focus on resilience, observability, cost, security, and scale once the platform is live.",
      chapterLabels: ["Reliability", "Security and Scale"],
    },
  ],
  frontend: [
    {
      id: "ui-core",
      title: "UI Foundations",
      description: "Establish the mental model, component system, and local workflows that anchor frontend mastery.",
      chapterLabels: ["Core Building Blocks", "UI Patterns"],
    },
    {
      id: "application",
      title: "Application Architecture",
      description: "Design routing, state, data flow, and architecture boundaries for production-grade frontend systems.",
      chapterLabels: ["State and Data Flow", "Application Structure"],
    },
    {
      id: "experience",
      title: "Performance and Delivery",
      description: "Close with testing, optimization, accessibility, and deployment so the experience holds up at scale.",
      chapterLabels: ["Quality", "Optimization and Release"],
    },
  ],
  data: [
    {
      id: "data-core",
      title: "Data Foundations",
      description: "Start with schemas, storage models, and the primitives that determine how data behaves in a system.",
      chapterLabels: ["Storage Models", "Query Basics"],
    },
    {
      id: "design",
      title: "Design and Performance",
      description: "Move into query design, indexing, transactions, and throughput-aware decisions for data-heavy workloads.",
      chapterLabels: ["Design Choices", "Performance Tuning"],
    },
    {
      id: "operations",
      title: "Reliability and Scale",
      description: "Finish with backup, consistency, replication, and the operational concerns of real-world data platforms.",
      chapterLabels: ["Reliability", "Scale and Operations"],
    },
  ],
  ai: [
    {
      id: "ai-foundations",
      title: "Model Foundations",
      description: "Build the baseline understanding of model types, datasets, and the workflow required to ship useful ML systems.",
      chapterLabels: ["Core Concepts", "Data and Training Setup"],
    },
    {
      id: "ai-systems",
      title: "Modeling and Evaluation",
      description: "Deepen the track with experimentation, evaluation, prompt/model behavior, and system-level architecture choices.",
      chapterLabels: ["Modeling Patterns", "Evaluation Workflows"],
    },
    {
      id: "ai-production",
      title: "Inference and Production",
      description: "Wrap with deployment, monitoring, optimization, and governance so the series reaches production-grade maturity.",
      chapterLabels: ["Serving and Inference", "Production Operations"],
    },
  ],
  web3: [
    {
      id: "protocols",
      title: "Protocol Foundations",
      description: "Understand the protocol layer, value flow, and wallet basics behind decentralized systems.",
      chapterLabels: ["Protocol Basics", "Identity and Wallets"],
    },
    {
      id: "contracts",
      title: "Contracts and Applications",
      description: "Design smart contracts, dApp flows, and application architecture that connect on-chain and off-chain systems.",
      chapterLabels: ["Smart Contract Design", "dApp Architecture"],
    },
    {
      id: "web3-production",
      title: "Security and Scale",
      description: "End with governance, audits, ecosystem integration, and the tradeoffs required for production Web3 systems.",
      chapterLabels: ["Security Controls", "Scale and Ecosystem"],
    },
  ],
  delivery: [
    {
      id: "principles",
      title: "Principles and Mindset",
      description: "Begin with the discipline, language, and baseline structures that frame strong team execution.",
      chapterLabels: ["Foundational Principles", "Ways of Working"],
    },
    {
      id: "execution",
      title: "Execution Systems",
      description: "Translate those principles into rituals, backlogs, planning flows, and healthy delivery feedback loops.",
      chapterLabels: ["Planning and Flow", "Execution Patterns"],
    },
    {
      id: "improvement",
      title: "Improvement and Scale",
      description: "Close with metrics, coaching, optimization, and the operational systems that support lasting improvement.",
      chapterLabels: ["Metrics and Insight", "Continuous Improvement"],
    },
  ],
};

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeTopic = (value: string) => {
  const raw = value.trim();
  if (!raw) return "";
  const special = SPECIAL_TOPIC_LABELS[raw.toLowerCase()];
  if (special) return special;
  const cleaned = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const direct = SPECIAL_TOPIC_LABELS[cleaned.toLowerCase()];
  if (direct) return direct;
  return toTitleCase(cleaned);
};

const dedupeTopics = (items: string[]) => {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const normalized = normalizeTopic(item);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
};

const inferSeriesKind = (series: BlogSeriesTrack): SeriesKind => {
  const source = `${series.title} ${series.subtitle} ${series.tags.join(" ")} ${series.keywords.join(" ")}`.toLowerCase();
  if (/\bweb3|blockchain|wallet|smart contract|ethereum|bitcoin\b/.test(source)) return "web3";
  if (/\bai|ml|llm|nlp|deep learning|machine learning|computer vision|model training\b/.test(source)) return "ai";
  if (/\bdatabase|sql|postgresql|mongodb|redis|data\b/.test(source)) return "data";
  if (/\bangular|next\.js|nextjs|react|frontend|rxjs|typescript\b/.test(source)) return "frontend";
  if (/\bagile|scrum|kanban|delivery\b/.test(source)) return "delivery";
  if (/\bazure|aws|gcp|cloud|devops|kafka|kubernetes|docker|terraform|microservices|platform\b/.test(source)) return "platform";
  return "engineering";
};

const buildTopicPool = (series: BlogSeriesTrack, kind: SeriesKind) =>
  dedupeTopics([
    ...series.tags,
    ...series.keywords,
    ...KIND_FALLBACK_TOPICS[kind],
    getBlogSeriesDisplayTitle(series),
  ]).slice(0, 12);

const topicSegment = (topics: string[], index: number) => {
  const start = index * 4;
  const slice = topics.slice(start, start + 4);
  if (slice.length >= 4) return slice;
  const fallback = topics.filter((topic) => !slice.includes(topic));
  return [...slice, ...fallback].slice(0, 4);
};

export const getBlogSeriesToc = (series: BlogSeriesTrack): BlogSeriesToc => {
  const kind = inferSeriesKind(series);
  const blueprints = KIND_BLUEPRINTS[kind];
  const topics = buildTopicPool(series, kind);
  const displayTitle = getBlogSeriesDisplayTitle(series);

  return {
    overview: `${displayTitle} is organized as a practical table of contents so you can move from fundamentals to production-grade implementation without losing the structure of the learning path.`,
    highlights: topics.slice(0, 6),
    modules: blueprints.map((module, index) => {
      const segment = topicSegment(topics, index);
      const chapterOneTopics = segment.slice(0, 2);
      const chapterTwoTopics = segment.slice(2, 4);

      return {
        id: `${series.slug}-${module.id}`,
        title: module.title,
        description: module.description,
        chapters: [
          {
            title: `${module.chapterLabels[0]}: ${chapterOneTopics[0] || "Core Concepts"}`,
            description: `Start this part of the ${series.title} track with the concepts and implementation details that set up the rest of the module.`,
            topics: chapterOneTopics.length ? chapterOneTopics : topics.slice(0, 2),
          },
          {
            title: `${module.chapterLabels[1]}: ${chapterTwoTopics[0] || "Production Workflows"}`,
            description: `Translate the module into practical delivery flow, deeper design decisions, and real project execution.`,
            topics: chapterTwoTopics.length ? chapterTwoTopics : topics.slice(2, 4),
          },
        ],
      };
    }),
  };
};
