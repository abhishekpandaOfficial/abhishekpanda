import { COST_USAGE, LAST_AGENT_RUNS, PUBLISH_QUEUE, SYSTEM_HEALTH } from "@/data/openowl-mock";
import { StatCard } from "@/components/openowl/admin/StatCard";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="System Health"
          value={SYSTEM_HEALTH.status.toUpperCase()}
          tone={SYSTEM_HEALTH.status === "healthy" ? "good" : "warn"}
          hint={`Latency ${SYSTEM_HEALTH.latencyMs}ms · Uptime ${SYSTEM_HEALTH.uptimePct}%`}
        />
        <StatCard label="Queue Depth" value={String(SYSTEM_HEALTH.queueDepth)} hint="Pending jobs" />
        <StatCard label="Cost Usage" value={`$${COST_USAGE.totalUsd.toFixed(2)}`} hint={COST_USAGE.period} />
        <StatCard label="Model Calls" value={String(COST_USAGE.modelCalls)} hint="Tracked API usage" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Last Agent Runs</h2>
          <div className="space-y-2">
            {LAST_AGENT_RUNS.map((run) => (
              <div key={run.id} className="rounded-lg border border-border bg-background/70 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{run.workflow}</span>
                  <span className="text-xs text-muted-foreground">{run.status.toUpperCase()}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {run.id} · {run.startedAt} · {run.durationMs}ms
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Publish Queue</h2>
          <div className="space-y-2">
            {PUBLISH_QUEUE.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border bg-background/70 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.title}</span>
                  <span className="text-xs text-muted-foreground">{entry.status.toUpperCase()}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{entry.platform}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
