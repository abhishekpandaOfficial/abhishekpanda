import type { PublishPreview } from "@/types/openowl";
import { cn } from "@/lib/utils";

const chipTone: Record<PublishPreview["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  queued: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function PublishCard({ item }: { item: PublishPreview }) {
  return (
    <article className="rounded-xl border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{item.platform}</h3>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", chipTone[item.status])}>{item.status.toUpperCase()}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{item.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
    </article>
  );
}
