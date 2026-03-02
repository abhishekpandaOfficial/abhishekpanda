import type {
  AgentRun,
  ChatMessage,
  CostUsage,
  DeliveryRecord,
  PublishPreview,
  RunTrace,
  SystemHealth,
} from "@/types/openowl";

export const OPENOWL_GREETING: ChatMessage = {
  id: "m-0",
  role: "assistant",
  content:
    "I am **AbhishekPanda Assistant**. OpenOwl is in development phase and can already answer from public site knowledge, summarize content, and draft safe task plans.",
  createdAt: new Date().toISOString(),
  sources: [
    { title: "Abhishek Panda", url: "https://www.abhishekpanda.com" },
    { title: "OpenOwl", url: "https://www.abhishekpanda.com/openowl" },
  ],
};

export const SYSTEM_HEALTH: SystemHealth = {
  status: "healthy",
  latencyMs: 242,
  uptimePct: 99.96,
  queueDepth: 3,
};

export const LAST_AGENT_RUNS: AgentRun[] = [
  {
    id: "run_7L3",
    workflow: "Blog digest -> social drafts",
    status: "success",
    startedAt: "2026-03-02T06:20:00.000Z",
    durationMs: 8412,
  },
  {
    id: "run_7L2",
    workflow: "OpenOwl QA session",
    status: "running",
    startedAt: "2026-03-02T06:44:00.000Z",
    durationMs: 3240,
  },
  {
    id: "run_7L1",
    workflow: "Publish pipeline check",
    status: "failed",
    startedAt: "2026-03-02T05:50:00.000Z",
    durationMs: 2150,
  },
];

export const COST_USAGE: CostUsage = {
  period: "Last 7 days",
  totalUsd: 42.73,
  modelCalls: 1627,
};

export const PUBLISH_QUEUE = [
  { id: "pq_1", title: "Azure AI architecture post", platform: "LinkedIn", status: "queued" },
  { id: "pq_2", title: "OpenOwl release teaser", platform: "X", status: "ready" },
  { id: "pq_3", title: "Weekly digest", platform: "Telegram", status: "draft" },
];

export const PUBLISH_PREVIEWS: PublishPreview[] = [
  {
    platform: "LinkedIn",
    status: "ready",
    title: "Designing Agentic Pipelines",
    content: "A practical system design pattern for safe AI automation at scale.",
  },
  {
    platform: "X",
    status: "queued",
    title: "OpenOwl shipping",
    content: "OpenOwl now supports trust signals: privacy, citations, and approval gates.",
  },
  {
    platform: "Telegram",
    status: "draft",
    title: "Community update",
    content: "New long-form article and architecture notes are ready for review.",
  },
  {
    platform: "WhatsApp",
    status: "ready",
    title: "Broadcast summary",
    content: "Latest product notes and links prepared for your announcement list.",
  },
  {
    platform: "Slack",
    status: "published",
    title: "Internal changelog",
    content: "OpenOwl admin center modules are now available for editorial workflows.",
  },
];

export const DELIVERY_RECORDS: DeliveryRecord[] = [
  {
    id: "msg_101",
    platform: "LinkedIn",
    destination: "Company Page",
    state: "QUEUED",
    updatedAt: "2026-03-02 10:05",
  },
  {
    id: "msg_102",
    platform: "X",
    destination: "@Panda_Abhishek8",
    state: "SENT",
    updatedAt: "2026-03-02 10:07",
  },
  {
    id: "msg_103",
    platform: "Telegram",
    destination: "OpenOwl Channel",
    state: "DELIVERED",
    updatedAt: "2026-03-02 10:08",
  },
  {
    id: "msg_104",
    platform: "WhatsApp",
    destination: "Broadcast List",
    state: "READ",
    updatedAt: "2026-03-02 10:12",
  },
  {
    id: "msg_105",
    platform: "Slack",
    destination: "#announcements",
    state: "FAILED",
    updatedAt: "2026-03-02 10:14",
  },
];

export const RUN_TRACES: RunTrace[] = [
  {
    id: "trace_501",
    agent: "openowl-content-agent",
    status: "success",
    startedAt: "2026-03-02 09:24",
    traceUrl: "https://smith.langchain.com/o/example/traces/trace_501",
  },
  {
    id: "trace_502",
    agent: "openowl-delivery-agent",
    status: "running",
    startedAt: "2026-03-02 09:41",
    traceUrl: "https://smith.langchain.com/o/example/traces/trace_502",
  },
  {
    id: "trace_503",
    agent: "openowl-qa-agent",
    status: "failed",
    startedAt: "2026-03-02 09:58",
    traceUrl: "https://smith.langchain.com/o/example/traces/trace_503",
  },
];

export const DEFAULT_MERMAID = `flowchart TD
  A[Ingest Sources] --> B[Reason Over Context]
  B --> C[Verify with Citations]
  C --> D[Human Approval if Action]
  D --> E[Publish]
`;
