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

export const BLOG_SERIES: BlogSeriesTrack[] = [
  {
    slug: "csharp-mastery",
    title: "C# Mastery",
    detailTitle: "C# & .NET Engineering Mastery Series",
    subtitle: "A complete engineering path across C#, ASP.NET Core, architecture, APIs, clean code, testing, and production-grade .NET delivery.",
    tags: ["C#", ".NET", "Series"],
    keywords: ["c#", ".net", "dotnet", "asp.net", "entity framework", "blazor"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "99 102 241",
    href: "/dotnet-mastery-toc",
    actionLabel: "Open TOC",
  },
  {
    slug: "solid-patterns",
    title: "SOLID Patterns",
    subtitle: "Design principles, refactoring moves, and maintainable object-oriented architecture.",
    tags: ["SOLID", "Architecture", "OOP"],
    keywords: ["solid", "single responsibility", "open closed", "liskov", "interface segregation", "dependency inversion"],
    logos: ["/brand-logos/stacks/csharp.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "56 189 248",
  },
  {
    slug: "design-patterns",
    title: "Design Patterns",
    subtitle: "Factory, Strategy, Builder, Observer, and the patterns that shape production codebases.",
    tags: ["Patterns", "Architecture", "Systems"],
    keywords: ["design pattern", "factory", "strategy", "observer", "builder", "decorator", "adapter"],
    logos: ["/brand-logos/stacks/typescript.svg", "/brand-logos/stacks/dotnet.svg"],
    rgb: "251 146 60",
  },
  {
    slug: "microservices-mastery",
    title: "Microservices Mastery",
    subtitle: "Zero-to-hero path for service boundaries, resilience, messaging, and cloud-native delivery.",
    tags: ["Microservices", "Distributed", "Cloud"],
    keywords: ["microservices", "service mesh", "api gateway", "distributed systems", "saga", "event driven"],
    logos: ["/brand-logos/stacks/docker.svg", "/brand-logos/stacks/kubernetes.svg"],
    rgb: "14 165 233",
  },
  {
    slug: "kafka-mastery",
    title: "Kafka Mastery",
    subtitle: "Event streaming, producers, consumers, partitions, and high-scale platform design.",
    tags: ["Kafka", "Streaming", "Events"],
    keywords: ["kafka", "event streaming", "producer", "consumer", "partition", "stream processing"],
    logos: ["/brand-logos/stacks/docker.svg", "/brand-logos/stacks/kubernetes.svg"],
    rgb: "168 85 247",
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
    subtitle: "Angular architecture, RxJS, TypeScript patterns, and enterprise frontend delivery.",
    tags: ["Angular", "TypeScript", "Frontend"],
    keywords: ["angular", "rxjs", "typescript", "component", "frontend architecture"],
    logos: ["/brand-logos/stacks/angular.svg", "/brand-logos/stacks/typescript.svg"],
    rgb: "239 68 68",
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
    subtitle: "Azure services, cloud architecture, DevOps flows, and enterprise deployment patterns.",
    tags: ["Azure", "Cloud", "Architect"],
    keywords: ["azure", "microsoft azure", "app service", "aks", "azure devops", "cloud architecture"],
    logos: ["/brand-logos/stacks/microsoftazure.svg", "/brand-logos/stacks/docker.svg"],
    rgb: "59 130 246",
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
