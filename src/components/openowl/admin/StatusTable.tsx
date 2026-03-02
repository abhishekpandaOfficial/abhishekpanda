import { Button } from "@/components/ui/button";
import type { DeliveryRecord } from "@/types/openowl";
import { cn } from "@/lib/utils";

const stateTone: Record<DeliveryRecord["state"], string> = {
  QUEUED: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  READ: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  FAILED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export function StatusTable({ rows }: { rows: DeliveryRecord[] }) {
  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No delivery records yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Message</th>
            <th className="px-3 py-2">Platform</th>
            <th className="px-3 py-2">Destination</th>
            <th className="px-3 py-2">State</th>
            <th className="px-3 py-2">Updated</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.id}</td>
              <td className="px-3 py-2">{row.platform}</td>
              <td className="px-3 py-2">{row.destination}</td>
              <td className="px-3 py-2">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", stateTone[row.state])}>{row.state}</span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.updatedAt}</td>
              <td className="px-3 py-2">
                <Button size="sm" variant="outline" disabled={row.state !== "FAILED"}>Retry</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
