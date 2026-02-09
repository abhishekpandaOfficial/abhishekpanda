import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

type LiteModel = {
  name?: string;
  company?: string;
  is_open_source?: boolean;
  is_trending?: boolean;
  use_cases?: string[];
};

type LiteUpdate = {
  title?: string;
  published_at?: string;
};

type LiteKnowledge = {
  title?: string;
  summary?: string;
};

type ReqBody = {
  prompt?: string;
  context?: {
    knowledge?: LiteKnowledge[];
    updates?: LiteUpdate[];
    models?: LiteModel[];
  };
};

function fallbackAnswer(prompt: string, context: ReqBody["context"]): string {
  const q = prompt.toLowerCase();
  const models = context?.models || [];
  const updates = context?.updates || [];
  const knowledge = context?.knowledge || [];

  if (q.includes("open source") || q.includes("open-source")) {
    const names = models.filter((m) => m.is_open_source).map((m) => m.name).filter(Boolean) as string[];
    return names.length ? `Top open-source models: ${names.slice(0, 8).join(", ")}.` : "Open-source model details are available in LLM Galaxy category filters.";
  }

  if (q.includes("closed source") || q.includes("closed-source")) {
    const names = models.filter((m) => !m.is_open_source).map((m) => m.name).filter(Boolean) as string[];
    return names.length ? `Top closed-source models: ${names.slice(0, 8).join(", ")}.` : "Closed-source model details are available in LLM Galaxy category filters.";
  }

  if (q.includes("latest") || q.includes("update") || q.includes("originx")) {
    if (!updates.length) return "Latest updates are currently not available.";
    return updates
      .slice(0, 3)
      .map((u, i) => `${i + 1}. ${u.title || "Update"}${u.published_at ? ` (${new Date(u.published_at).toLocaleDateString("en-US")})` : ""}`)
      .join("\n");
  }

  if (q.includes("website") || q.includes("about") || q.includes("site")) {
    const items = knowledge.slice(0, 4);
    if (!items.length) return "This website includes CHRONYX, LLM Galaxy, academy, blogs, mentorship, and contact workflows.";
    return items
      .map((k, i) => `${i + 1}. ${k.title || "Section"}: ${k.summary || "Details available in this section."}`)
      .join("\n");
  }

  if (q.includes("galaxy") || q.includes("llm") || q.includes("model")) {
    const trending = models.filter((m) => m.is_trending).map((m) => m.name).filter(Boolean) as string[];
    return [
      `LLM Galaxy tracks ${models.length || "multiple"} model families with rankings and category tags.`,
      trending.length ? `Trending: ${trending.slice(0, 5).join(", ")}.` : "Use LLM Galaxy filters for trending/open/closed categories.",
      "Open LLM Galaxy to compare benchmarks, capabilities, and official model links.",
    ].join(" ");
  }

  return "ABHIBOT can help with open/closed model selection, rankings, website details, and latest OriginX updates.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as ReqBody;
    const prompt = String(body.prompt || "").trim();

    if (!prompt) return json(400, { error: "Missing prompt" });

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    const model = Deno.env.get("OPENROUTER_MODEL") || "meta-llama/llama-3.3-70b-instruct:free";

    // Always return helpful response without exposing provider/internal errors.
    if (!apiKey || apiKey === "YOUR_KEY") {
      return json(200, { answer: fallbackAnswer(prompt, body.context) });
    }

    const system = [
      "You are ABHIBOT, CHRONYX assistant for OriginX Labs website.",
      "Answer clearly and concisely.",
      "Prefer website facts from provided context.",
      "If asked about open-source vs closed-source models, separate them and include links if available.",
      "Do not expose secrets, keys, or internal configuration.",
    ].join(" ");

    const contextText = JSON.stringify(body.context || {}, null, 2);

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.abhishekpanda.com",
        "X-Title": "ABHIBOT",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Question: ${prompt}\n\nContext JSON:\n${contextText}`,
          },
        ],
      }),
    });

    if (!openRouterRes.ok) {
      return json(200, { answer: fallbackAnswer(prompt, body.context) });
    }

    const data = (await openRouterRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return json(200, { answer: fallbackAnswer(prompt, body.context) });

    return json(200, { answer });
  } catch {
    return json(200, { answer: "ABHIBOT is ready. Please ask about models, rankings, or website sections." });
  }
});
