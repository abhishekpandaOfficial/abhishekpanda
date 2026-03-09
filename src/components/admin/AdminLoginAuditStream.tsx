import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MonitorDot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AuditRow = {
  id: string;
  created_at: string;
  email: string;
  status: string;
  failure_reason: string | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
};

type AdminLoginAuditStreamProps = {
  previewCount?: number;
  collapsible?: boolean;
  title?: string;
};

const statusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("failed") || s.includes("blocked") || s.includes("error")) return "destructive";
  if (s.includes("verified") || s.includes("success")) return "default";
  return "secondary";
};

const AuditItem = ({ row }: { row: AuditRow }) => (
  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusColor(row.status) as "default"}>{row.status}</Badge>
          <div className="truncate text-sm font-medium text-foreground">{row.email}</div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(row.created_at).toLocaleString()}
          {row.ip_address ? ` | ${row.ip_address}` : ""}
          {row.browser ? ` | ${row.browser}` : ""}
          {row.device_type ? ` | ${row.device_type}` : ""}
        </div>
        {row.failure_reason ? (
          <div className="mt-2 break-words text-xs text-red-500">{row.failure_reason}</div>
        ) : null}
      </div>
    </div>
  </div>
);

export function AdminLoginAuditStream({
  previewCount = 12,
  collapsible = false,
  title = "Login audit",
}: AdminLoginAuditStreamProps) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [showAll, setShowAll] = useState(false);

  const previewRows = useMemo(() => rows.slice(0, previewCount), [rows, previewCount]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data } = await supabase
        .from("login_audit_logs")
        .select("id,created_at,email,status,failure_reason,ip_address,device_type,browser")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!alive) return;
      setRows((data ?? []) as AuditRow[]);
    };

    load();

    const channel = supabase
      .channel("realtime:public:login_audit_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "login_audit_logs" },
        (payload) => {
          const row = payload.new as AuditRow;
          setRows((prev) => [row, ...prev].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <Card className="rounded-3xl border border-border/50 bg-card/85 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MonitorDot className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{title}</div>
              <div className="text-sm text-muted-foreground">
                {rows.length ? `${rows.length} recent events` : "No events yet"}
              </div>
            </div>
          </div>
          {collapsible && rows.length > previewCount ? (
            <Button variant="ghost" className="rounded-xl" onClick={() => setShowAll(true)}>
              View all
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          {previewRows.length ? (
            previewRows.map((row) => <AuditItem key={row.id} row={row} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              No login audit events recorded yet.
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-3xl border-border bg-background">
          <DialogHeader>
            <DialogTitle>Access activity</DialogTitle>
            <DialogDescription>Full login audit stream for the latest admin access events.</DialogDescription>
          </DialogHeader>
          <div className={cn("mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1")}>
            {rows.map((row) => (
              <AuditItem key={row.id} row={row} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminLoginAuditStream;
