import type { SubstackPostSummary } from "@/lib/substack";

export type StackedInCategory = {
  id: string;
  label: string;
  description: string;
  accent: string;
  badge: string;
};

export const STACKEDIN_CATEGORIES: StackedInCategory[] = [
  { id: "python-data", label: "Python & Data Science", description: "Python foundations, numerical computing, visualization, and exploratory analysis.", accent: "from-sky-500 to-blue-600", badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { id: "machine-learning", label: "Machine Learning", description: "ML fundamentals, classical algorithms, evaluation, and applied projects.", accent: "from-emerald-500 to-teal-600", badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { id: "deep-learning", label: "Deep Learning & Computer Vision", description: "Neural networks, deep learning systems, and computer vision mastery.", accent: "from-violet-500 to-fuchsia-600", badge: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { id: "mlops", label: "MLOps & Production AI", description: "Experiment tracking, reproducibility, serving, and production AI operations.", accent: "from-orange-500 to-amber-500", badge: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { id: "rag-ai", label: "RAG & AI Architecture", description: "Retrieval systems, vector patterns, AI applications, and architecture strategy.", accent: "from-pink-500 to-rose-600", badge: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  { id: "dotnet-azure", label: ".NET, Azure & Messaging", description: ".NET engineering, concurrency, Azure Service Bus, queues, and topics.", accent: "from-indigo-500 to-blue-600", badge: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  { id: "cloud-kubernetes", label: "Cloud & Kubernetes", description: "Containers, Kubernetes workloads, production operations, and multi-cloud systems.", accent: "from-cyan-500 to-sky-600", badge: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300" },
  { id: "system-architecture", label: "System & Software Architecture", description: "System design, design patterns, data engineering, and engineering leadership.", accent: "from-slate-600 to-slate-900", badge: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300" },
];

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export const getStackedInCategory = (post: Pick<SubstackPostSummary, "title" | "slug">) => {
  const text = `${post.title} ${post.slug}`.toLowerCase();
  if (includesAny(text, ["python", "numpy", "pandas", "matplotlib", "seaborn", "exploratory-data", "statistical-eda"])) return STACKEDIN_CATEGORIES[0];
  if (includesAny(text, ["deep-learning", "neural", "computer-vision"])) return STACKEDIN_CATEGORIES[2];
  if (includesAny(text, ["mlops", "mlflow", "model-serving", "reproducible-ml", "production-ml", "credit-card-fraud"])) return STACKEDIN_CATEGORIES[3];
  if (includesAny(text, ["rag", "vectorless", "vector-rag", "artificial-intelligence", "ai-architect"])) return STACKEDIN_CATEGORIES[4];
  if (includesAny(text, [".net", "dotnet", "multithreading", "service-bus", "queues-vs-topics", "messaging-frameworks", "production-ready-azure"])) return STACKEDIN_CATEGORIES[5];
  if (includesAny(text, ["kubernetes", "multi-cloud"])) return STACKEDIN_CATEGORIES[6];
  if (includesAny(text, ["system-design", "design-patterns", "data-engineering", "forward-deployed", "architecture"])) return STACKEDIN_CATEGORIES[7];
  return STACKEDIN_CATEGORIES[1];
};

export const getStackedInTags = (post: Pick<SubstackPostSummary, "title" | "slug">) => {
  const text = `${post.title} ${post.slug}`.toLowerCase();
  const tags: string[] = [];
  const add = (label: string, terms: string[]) => {
    if (includesAny(text, terms) && !tags.includes(label)) tags.push(label);
  };

  add("Python", ["python"]);
  add("NumPy", ["numpy"]);
  add("Pandas", ["pandas"]);
  add("Visualization", ["matplotlib", "seaborn"]);
  add("EDA", ["exploratory", "statistical-eda"]);
  add("Machine Learning", ["machine-learning", "ml-0", "logistic", "nearest-neighbors", "decision-tree", "random-forest", "xgboost"]);
  add("Deep Learning", ["deep-learning", "neural"]);
  add("Computer Vision", ["computer-vision"]);
  add("MLOps", ["mlops", "mlflow", "reproducible-ml", "model-serving", "production-ml"]);
  add("MLflow", ["mlflow"]);
  add("Model Serving", ["model-serving"]);
  add(".NET", [".net", "dotnet", "multithreading-in-net"]);
  add("Azure", ["azure", "service-bus"]);
  add("Messaging", ["queue", "topic", "messaging"]);
  add("Kubernetes", ["kubernetes"]);
  add("Cloud", ["cloud", "kubernetes"]);
  add("RAG", ["rag"]);
  add("Vector Search", ["vector-rag", "vectorless"]);
  add("System Design", ["system-design", "sd-001"]);
  add("Design Patterns", ["design-patterns"]);
  add("Data Engineering", ["data-engineering"]);
  add("AI Architecture", ["ai-architect", "artificial-intelligence", "multi-cloud-ai"]);
  add("FDE", ["forward-deployed"]);
  add("Classification", ["classification", "logistic", "nearest-neighbors", "decision-tree", "random-forest", "xgboost"]);

  return tags.length ? tags.slice(0, 4) : [getStackedInCategory(post).label];
};

export const STACKEDIN_TAG_STYLES: Record<string, string> = {
  Python: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  NumPy: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  Pandas: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Visualization: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  EDA: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "Machine Learning": "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Deep Learning": "border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "Computer Vision": "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  MLOps: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  MLflow: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ".NET": "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  Azure: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Kubernetes: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  RAG: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const getTagStyle = (tag: string) =>
  STACKEDIN_TAG_STYLES[tag] || "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300";
