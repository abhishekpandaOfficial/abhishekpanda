export type DsaRuntimeLanguage = "csharp" | "python" | "java";

export type DsaTraceEvent = {
  step: string;
  title?: string;
  state?: string;
  complexityNote?: string;
};

export type DsaRuntimeRequest = {
  language: DsaRuntimeLanguage;
  sourceCode: string;
  stdin?: string;
  questionId?: string;
  approachLabel?: string;
};

export type DsaRuntimeResult = {
  ok: boolean;
  status: {
    id?: number;
    description: string;
  };
  stdout: string;
  stderr: string;
  compileOutput: string;
  executionMs?: number | null;
  memoryKb?: number | null;
  trace: DsaTraceEvent[];
  complexity: {
    time: string;
    space: string;
    reason: string;
  };
  setupRequired?: boolean;
};

const TRACE_PREFIX = "TRACE::";

export const parseTraceEvents = (output: string): DsaTraceEvent[] =>
  output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(TRACE_PREFIX))
    .map((line) => line.slice(TRACE_PREFIX.length))
    .flatMap((payload) => {
      try {
        return [JSON.parse(payload) as DsaTraceEvent];
      } catch {
        return [];
      }
    });

export const stripTraceLines = (output: string): string =>
  output
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(TRACE_PREFIX))
    .join("\n")
    .trim();

export const buildDsaComplexityFallback = (approachLabel?: string) => ({
  time: "Depends on the chosen approach",
  space: "Depends on helper structures and recursion depth",
  reason:
    approachLabel
      ? `The runner can return exact trace events, but time/space reasoning still depends on the ${approachLabel} approach chosen for this question.`
      : "The runner can execute code and capture trace events, but complexity reasoning still depends on the selected algorithmic approach.",
});
