export type MessageRole = "user" | "assistant";

export interface SourceRef {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: SourceRef[];
  needsApproval?: boolean;
}

export interface ApprovalFlagMessage extends ChatMessage {
  needsApproval: true;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "offline";
  latencyMs: number;
  uptimePct: number;
  queueDepth: number;
}

export interface AgentRun {
  id: string;
  workflow: string;
  status: "success" | "running" | "failed";
  startedAt: string;
  durationMs: number;
}

export interface CostUsage {
  period: string;
  totalUsd: number;
  modelCalls: number;
}

export interface PublishPreview {
  platform: "LinkedIn" | "X" | "Telegram" | "WhatsApp" | "Slack";
  status: "draft" | "ready" | "queued" | "published";
  title: string;
  content: string;
}

export type DeliveryState = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface DeliveryRecord {
  id: string;
  platform: string;
  destination: string;
  state: DeliveryState;
  updatedAt: string;
}

export interface RunTrace {
  id: string;
  agent: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  traceUrl: string;
}
