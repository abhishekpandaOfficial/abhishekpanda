import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIst } from "@/lib/time/ist";
import { Loader2, RefreshCw } from "lucide-react";

type BookingRow = {
  id: string;
  created_at: string;
  package_name: string;
  duration_minutes: number;
  amount: number;
  currency: string;
  scheduled_start: string;
  scheduled_end: string;
  timezone: string;
  name: string;
  email: string;
  mobile: string;
  topic: string;
  topic_other: string | null;
  session_reason: string;
  status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

export default function AdminMentorshipBookings() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mentorship_bookings")
      .select(
        "id,created_at,package_name,duration_minutes,amount,currency,scheduled_start,scheduled_end,timezone,name,email,mobile,topic,topic_other,session_reason,status,razorpay_order_id,razorpay_payment_id"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) setRows((data ?? []) as BookingRow[]);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [
        r.name,
        r.email,
        r.mobile,
        r.package_name,
        r.topic,
        r.razorpay_order_id,
        r.razorpay_payment_id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Mentorship Bookings</div>
          <div className="text-xs text-slate-300">All times rendered in IST (Asia/Kolkata).</div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name/email/order id..."
            className="w-full md:w-72"
          />
          <Button variant="secondary" size="sm" onClick={load} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.04] p-4 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-slate-300">No bookings found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-300">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3">When (IST)</th>
                <th className="py-2 pr-3">Package</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Topic</th>
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filtered.map((r) => {
                const start = new Date(r.scheduled_start);
                const end = new Date(r.scheduled_end);
                return (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <div className="font-medium">{formatIst(start)}</div>
                      <div className="text-[11px] text-slate-400">{formatIst(end)}</div>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <div className="font-medium">{r.package_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.duration_minutes} min · {r.currency} {r.amount.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="py-3 pr-3 min-w-[220px]">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.email}</div>
                      <div className="text-[11px] text-slate-400">{r.mobile}</div>
                    </td>
                    <td className="py-3 pr-3 min-w-[200px]">
                      <div className="font-medium">
                        {r.topic}
                        {r.topic_other ? ` (${r.topic_other})` : ""}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{r.session_reason}</div>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <div className="text-[11px] text-slate-400">{r.razorpay_order_id}</div>
                      <div className="text-[11px] text-slate-400">{r.razorpay_payment_id}</div>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <Badge variant="secondary">{r.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

