import { RUN_TRACES } from "@/data/openowl-mock";

export default function RunsPage() {
  return (
    <section>
      <h2 className="text-lg font-semibold">Runs & Traces</h2>
      <p className="text-sm text-muted-foreground">LangGraph runs with LangSmith trace placeholders.</p>

      <div className="mt-4 space-y-3">
        {RUN_TRACES.map((trace) => (
          <article key={trace.id} className="rounded-xl border border-border bg-card/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{trace.agent}</p>
                <p className="text-xs text-muted-foreground">
                  {trace.id} · {trace.startedAt}
                </p>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs">{trace.status.toUpperCase()}</span>
            </div>
            <a
              href={trace.traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary underline-offset-2 hover:underline"
            >
              Open LangSmith Trace
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
