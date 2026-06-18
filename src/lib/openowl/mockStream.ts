import type { ChatMessage, SourceRef } from "@/types/openowl";

type Intent = "diagram" | "summary" | "task" | "projects" | "greeting" | "general";

const SOURCE_POOL = {
  base: [
    { title: "Abhishek Panda", url: "https://www.abhishekpanda.com" },
    { title: "OpenOwl", url: "https://www.abhishekpanda.com/openowl" },
  ] satisfies SourceRef[],
  blog: [{ title: "Blog", url: "https://www.abhishekpanda.com/blog" }] satisfies SourceRef[],
  products: [{ title: "Projects", url: "https://www.abhishekpanda.com/products" }] satisfies SourceRef[],
};

const intentReplies: Record<Intent, string[]> = {
  diagram: [
    "I can draft a clean Mermaid diagram for **{topic}** with readable node names and edge labels. If you want, I can give both system and sequence views.",
    "For **{topic}**, I will generate Mermaid in English with a short legend and assumptions so it is review-ready.",
    "I can convert **{topic}** into Mermaid quickly. Share the actors and flow, and I will return a validated starter diagram.",
  ],
  summary: [
    "I can summarize **{topic}** into key decisions, risks, and next actions. I will keep it concise and citation-aware.",
    "For **{topic}**, I can produce a short executive summary plus technical bullet points you can publish after review.",
    "I can compress **{topic}** into high-signal notes with actionable tasks and source links for quick verification.",
  ],
  task: [
    "I can draft a task plan for **{topic}** with milestones, dependencies, and owners. External execution will stay behind approval.",
    "For **{topic}**, I can create a practical implementation checklist and a release-ready task breakdown.",
    "I can prepare a task proposal for **{topic}** with effort hints and a safe rollout sequence.",
  ],
  projects: [
    "I can map **{topic}** to relevant projects, architecture notes, and demo links so you can navigate faster.",
    "For **{topic}**, I can point you to the most relevant project pages and summarize what each one solves.",
    "I can help you evaluate **{topic}** against existing products and suggest the best starting path.",
  ],
  greeting: [
    "OpenOwl is ready. Ask about blogs, architecture, OpenOwl plans, or task drafts and I will respond with context-aware guidance.",
    "I am here to help with summaries, diagrams, and execution planning. Ask anything and I will keep responses clear and practical.",
    "You can ask me about personal projects, technical writing, and planning tasks. I will keep answers concise and source-aware.",
  ],
  general: [
    "I can help with Q&A, summaries, Mermaid drafts, and task planning for **{topic}** while keeping risky actions approval-gated.",
    "For **{topic}**, I can provide a practical answer first, then suggest next actions and references.",
    "I can support **{topic}** with clear steps, optional task drafts, and source cues where available.",
  ],
};

const intentIndex: Record<Intent, number> = {
  diagram: 0,
  summary: 0,
  task: 0,
  projects: 0,
  greeting: 0,
  general: 0,
};

const stopWords = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "from",
  "about",
  "your",
  "this",
  "please",
  "need",
  "help",
  "into",
  "make",
  "create",
  "generate",
  "draft",
  "openowl",
  "assistant",
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function detectIntent(input: string): Intent {
  const q = input.toLowerCase();
  if (/\b(diagram|mermaid|flowchart|sequence|architecture flow)\b/.test(q)) return "diagram";
  if (/\b(summary|summarize|blog|article|digest|tldr)\b/.test(q)) return "summary";
  if (/\b(task|roadmap|checklist|todo|jira|ticket|milestone|plan)\b/.test(q)) return "task";
  if (/\b(project|product|portfolio|case study)\b/.test(q)) return "projects";
  if (/\b(hi|hello|hey|good morning|good evening)\b/.test(q)) return "greeting";
  return "general";
}

function extractTopic(input: string): string {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  return words.slice(0, 5).join(" ") || "your request";
}

function pickTemplate(intent: Intent): string {
  const pool = intentReplies[intent];
  const index = intentIndex[intent] % pool.length;
  intentIndex[intent] += 1;
  return pool[index];
}

function buildSources(intent: Intent): SourceRef[] {
  if (intent === "summary") return [...SOURCE_POOL.base, ...SOURCE_POOL.blog];
  if (intent === "projects") return [...SOURCE_POOL.base, ...SOURCE_POOL.products];
  if (intent === "diagram" || intent === "task") return [...SOURCE_POOL.base, ...SOURCE_POOL.products];
  return SOURCE_POOL.base;
}

function buildReply(input: string): { text: string; needsApproval: boolean; sources: SourceRef[] } {
  const intent = detectIntent(input);
  const topic = extractTopic(input);
  const template = pickTemplate(intent);
  const text = template.replaceAll("{topic}", topic);
  const needsApproval = /\b(publish|send|post|schedule|notify|broadcast|create task|create jira|open ticket)\b/i.test(
    input,
  );
  return {
    text,
    needsApproval,
    sources: buildSources(intent),
  };
}

export async function streamAssistantReply(
  userText: string,
  onToken: (token: string) => void,
): Promise<Pick<ChatMessage, "sources" | "needsApproval">> {
  const reply = buildReply(userText);
  const words = reply.text.split(" ");

  for (const word of words) {
    onToken(`${word} `);
    const delay = /[.,:;!?]$/.test(word) ? 46 : 22;
    await sleep(delay + Math.random() * 28);
  }

  return { sources: reply.sources, needsApproval: reply.needsApproval };
}
