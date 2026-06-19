import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calendar,
  Clock,
  Compass,
  FileText,
  Globe,
  Lock,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Unlock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PageView {
  id: string;
  created_at: string;
  ip_address: string;
  page_path: string;
  browser: string;
  device_type: string;
  location: string;
  user_agent: string;
  user_email: string;
}

interface AuditLog {
  id: string;
  email: string;
  status: string;
  device_type: string;
  browser: string;
  user_agent: string;
  created_at: string;
  ip_address: string;
  failure_reason: string | null;
}

export const CommandCenter = () => {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Page Views
      const { data: pvData } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch Audit Logs
      const { data: auditData } = await supabase
        .from("login_audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (pvData) {
        setPageViews(pvData as PageView[]);
        
        // Group by day name for the chart (last 7 days)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return {
            dateStr: d.toISOString().split("T")[0],
            dayName: dayNames[d.getDay()],
            views: 0,
            visitors: new Set<string>()
          };
        }).reverse();

        pvData.forEach((pv: any) => {
          if (!pv.created_at) return;
          const pvDate = pv.created_at.split("T")[0];
          const matchedDay = last7Days.find(d => d.dateStr === pvDate);
          if (matchedDay) {
            matchedDay.views += 1;
            matchedDay.visitors.add(pv.ip_address);
          }
        });

        const formattedChartData = last7Days.map(d => ({
          name: d.dayName,
          "Page Views": d.views,
          "Unique Visitors": d.visitors.size
        }));

        setTrafficData(formattedChartData);
      }

      if (auditData) {
        setAuditLogs(auditData as AuditLog[]);
      }
    } catch (e) {
      console.error("Failed to load command center data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase();
    if (type === 'mobile') return <Smartphone className="w-4 h-4 text-emerald-400" />;
    if (type === 'tablet') return <Tablet className="w-4 h-4 text-cyan-400" />;
    return <Monitor className="w-4 h-4 text-sky-400" />;
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Stats calculation
  const totalViews = pageViews.length;
  const uniqueVisitors = useMemo(() => {
    const set = new Set(pageViews.map(pv => pv.ip_address));
    return set.size;
  }, [pageViews]);

  const topPage = useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(pv => {
      counts[pv.page_path] = (counts[pv.page_path] || 0) + 1;
    });
    let top = "None";
    let max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        top = k;
      }
    });
    return { path: top, count: max };
  }, [pageViews]);

  const failedLoginsCount = useMemo(() => {
    return auditLogs.filter(a => a.status === 'failed').length;
  }, [auditLogs]);

  // Filter page views based on search query
  const filteredPageViews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pageViews;

    return pageViews.filter(pv => 
      pv.ip_address.toLowerCase().includes(query) ||
      pv.page_path.toLowerCase().includes(query) ||
      pv.location.toLowerCase().includes(query) ||
      pv.browser.toLowerCase().includes(query) ||
      pv.device_type.toLowerCase().includes(query)
    );
  }, [searchQuery, pageViews]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
            <Shield className="w-3.5 h-3.5" /> Sentinel Traffic Monitor
          </div>
          <h1 className="text-3xl font-black text-foreground mt-2">Command Center Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics, user sessions, page views, locations, and security logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="rounded-xl gap-2 border-border/50 bg-card hover:bg-muted/50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total Page Views</CardTitle>
            <Activity className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Hits logged across all pages</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Unique Visitors</CardTitle>
            <Globe className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique IP addresses tracked</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Top Destination</CardTitle>
            <Compass className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black truncate max-w-xs">{topPage.path}</div>
            <p className="text-xs text-muted-foreground mt-1">{topPage.count} visits on this route</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Failed Logins</CardTitle>
            <Lock className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-500">{failedLoginsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Blocked intrusion attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Charts */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Traffic Analysis (Last 7 Days)</CardTitle>
          <CardDescription>Graphical report of hits vs unique visitors on your site</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 26, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} />
                <Area type="monotone" dataKey="Page Views" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="Unique Visitors" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Logs and Audit Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visitor Logs Table */}
        <Card className="xl:col-span-2 bg-card/60 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Live Visitor Logs</CardTitle>
                <CardDescription>Real-time list of visitors, browser user agents, and geolocation</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-border/50 bg-background/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                  <TableRow className="border-border/40">
                    <TableHead className="w-[120px]">Time</TableHead>
                    <TableHead>Page Path</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[100px]">Device</TableHead>
                    <TableHead>Browser</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPageViews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No traffic logs match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPageViews.map((pv) => (
                      <TableRow key={pv.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {formatTimeAgo(pv.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-indigo-400">
                          {pv.page_path}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">
                          {pv.ip_address}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500/80" />
                            {pv.location}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1.5 capitalize">
                            {getDeviceIcon(pv.device_type)}
                            {pv.device_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="border-sky-500/20 bg-sky-500/5 text-sky-600 dark:text-sky-300 rounded-lg px-2 py-0">
                            {pv.browser}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Security Audit logs stream */}
        <Card className="bg-card/60 border-border/50 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Access Security Audits</CardTitle>
            <CardDescription>Authentication attempts and administrative posture audits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No security audits logged.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl border border-border/30 bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      log.status === 'failed' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {log.status === 'failed' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">{log.email}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(log.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        IP: <span className="font-mono">{log.ip_address}</span> • {log.browser} ({log.device_type})
                      </p>
                      {log.status === 'failed' && log.failure_reason && (
                        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 rounded-lg text-[9px] mt-1.5 px-2 py-0">
                          Blocked: {log.failure_reason}
                        </Badge>
                      )}
                      {log.status !== 'failed' && (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 rounded-lg text-[9px] mt-1.5 px-2 py-0">
                          Auth Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommandCenter;
