import { corsHeaders, json } from "../_shared/ebooks-auth.ts";

type RuntimeLanguage = "csharp" | "python" | "java";

type TraceEvent = {
  step: string;
  title?: string;
  state?: string;
  complexityNote?: string;
};

const TRACE_PREFIX = "TRACE::";

const LANGUAGE_IDS: Record<RuntimeLanguage, number> = {
  csharp: Number(Deno.env.get("JUDGE0_LANG_CSHARP") || "51"),
  python: Number(Deno.env.get("JUDGE0_LANG_PYTHON") || "71"),
  java: Number(Deno.env.get("JUDGE0_LANG_JAVA") || "62"),
};

const parseTraceEvents = (output: string): TraceEvent[] =>
  output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(TRACE_PREFIX))
    .flatMap((line) => {
      try {
        return [JSON.parse(line.slice(TRACE_PREFIX.length)) as TraceEvent];
      } catch {
        return [];
      }
    });

const stripTraceLines = (output: string) =>
  output
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(TRACE_PREFIX))
    .join("\n")
    .trim();

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const apiUrl = Deno.env.get("JUDGE0_API_URL")?.replace(/\/$/, "") || "";
  const apiKey = Deno.env.get("JUDGE0_API_KEY") || "";

  if (!apiUrl) {
    return json(501, {
      ok: false,
      setupRequired: true,
      error: "JUDGE0_API_URL is not configured",
      details:
        "Configure JUDGE0_API_URL and optionally JUDGE0_API_KEY, JUDGE0_LANG_CSHARP, JUDGE0_LANG_PYTHON, JUDGE0_LANG_JAVA for DSA runtime execution.",
    });
  }

  try {
    const body = await req.json();
    const language = body?.language as RuntimeLanguage;
    const sourceCode = String(body?.sourceCode || "");
    const stdin = String(body?.stdin || "");
    const approachLabel = typeof body?.approachLabel === "string" ? body.approachLabel : undefined;

    if (!language || !(language in LANGUAGE_IDS)) {
      return json(400, { error: "Unsupported language", supported: Object.keys(LANGUAGE_IDS) });
    }
    if (!sourceCode.trim()) {
      return json(400, { error: "sourceCode is required" });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const response = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: LANGUAGE_IDS[language],
        source_code: sourceCode,
        stdin,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      return json(502, {
        ok: false,
        error: "Execution provider error",
        providerStatus: response.status,
        providerBody: payload,
      });
    }

    const stdout = String(payload.stdout || "");
    const stderr = String(payload.stderr || "");
    const compileOutput = String(payload.compile_output || "");
    const trace = parseTraceEvents(stdout);

    return json(200, {
      ok: true,
      status: {
        id: payload.status?.id,
        description: payload.status?.description || "Completed",
      },
      stdout: stripTraceLines(stdout),
      stderr,
      compileOutput,
      executionMs: payload.time ? Number(payload.time) * 1000 : null,
      memoryKb: payload.memory ? Number(payload.memory) : null,
      trace,
      complexity: {
        time: "Derived from the chosen algorithmic approach",
        space: "Derived from helper data structures and recursion depth",
        reason:
          approachLabel
            ? `Runtime execution can show trace events, but complexity still depends on the ${approachLabel} algorithm you selected.`
            : "Runtime execution shows behavior, but complexity still depends on the algorithmic approach implemented by the user.",
      },
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown runtime error",
    });
  }
});
