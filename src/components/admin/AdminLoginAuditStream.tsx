import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const statusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("failed") || s.includes("blocked") || s.includes("error")) return "destructive";
  if (s.includes("verified") || s.includes("success")) return "default";
  return "secondary";
};

export function AdminLoginAuditStream() {
  const [rows, setRows] = useState<AuditRow[]>([]);

  const title = useMemo(() => "Login Audit (Realtime)", []);

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
          const r = payload.new as AuditRow;
          setRows((prev) => [r, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-[11px] text-slate-400">{rows.length} events</div>
      </div>

      <div className="mt-3 space-y-2">
        {rows.slice(0, 12).map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-lg border border-white/10 bg-black/20 p-3",
              "flex items-start justify-between gap-3"
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>
                <div className="truncate text-xs text-slate-200">{r.email}</div>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {new Date(r.created_at).toLocaleString()}{" "}
                {r.ip_address ? `| ${r.ip_address}` : ""}{" "}
                {r.browser ? `| ${r.browser}` : ""}{" "}
                {r.device_type ? `| ${r.device_type}` : ""}
              </div>
              {r.failure_reason ? (
                <div className="mt-1 break-words text-[11px] text-red-200/80">{r.failure_reason}</div>
              ) : null}
            </div>
          </div>
        ))}

        {rows.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
            No events yet.
          </div>
        ) : null}
      </div>
    </Card>
  );
}

