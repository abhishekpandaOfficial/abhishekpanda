import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  Ban,
  Eye,
  Users,
  Globe,
  Fingerprint,
  ScanFace,
  RefreshCw,
  Download,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ThreatMap } from "./ThreatMap";
import { useRealtimeSecurityAlerts } from "@/hooks/useRealtimeSecurityAlerts";

interface LoginAttempt {
  id: string;
  email: string;
  status: string;
  failure_reason: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  browser: string | null;
  device_type: string | null;
  created_at: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-xl bg-card border border-border"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </>
        )}
      </div>
    </div>
  </motion.div>
);

export const SecurityDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const { isConnected, unreadCount } = useRealtimeSecurityAlerts();

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case "24h": return subDays(now, 1);
      case "7d": return subDays(now, 7);
      case "30d": return subDays(now, 30);
      default: return subDays(now, 7);
    }
  };

  // Fetch login audit logs
  const { data: loginLogs, isLoading, refetch } = useQuery({
    queryKey: ["security-logs", timeRange],
    queryFn: async () => {
      const startDate = getDateRange(timeRange);
      const { data, error } = await supabase
        .from("login_audit_logs")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as LoginAttempt[];
    },
  });

  // Calculate statistics
  const totalAttempts = loginLogs?.length || 0;
  const failedAttempts = loginLogs?.filter(l => l.status === "failed").length || 0;
  const successfulLogins = loginLogs?.filter(l => l.status === "success").length || 0;
  const blockedAccounts = loginLogs?.filter(l => l.failure_reason?.includes("locked")).length || 0;
  
  // Unique IPs with failures
  const suspiciousIPs = new Set(
    loginLogs?.filter(l => l.status === "failed").map(l => l.ip_address).filter(Boolean)
  ).size;

  // Geographic distribution
  const geoDistribution = (() => {
    if (!loginLogs) return [];
    const countries: Record<string, { total: number; failed: number }> = {};
    
    loginLogs.forEach(log => {
      const country = log.country || "Unknown";
      if (!countries[country]) {
        countries[country] = { total: 0, failed: 0 };
      }
      countries[country].total++;
      if (log.status === "failed") {
        countries[country].failed++;
      }
    });
    
    return Object.entries(countries)
      .map(([name, data]) => ({
        name,
        total: data.total,
        failed: data.failed,
        failRate: data.total > 0 ? Math.round((data.failed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.failed - a.failed)
      .slice(0, 10);
  })();

  // Failure reasons breakdown
  const failureReasons = (() => {
    if (!loginLogs) return [];
    const reasons: Record<string, number> = {};
    
    loginLogs.filter(l => l.status === "failed").forEach(log => {
      const reason = log.failure_reason?.includes("Fingerprint") 
        ? "Fingerprint Failed"
        : log.failure_reason?.includes("Face") 
        ? "Face ID Failed"
        : log.failure_reason?.includes("OTP")
        ? "OTP Failed"
        : log.failure_reason?.includes("locked")
        ? "Account Locked"
        : "Other";
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    
    const colors = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#6b7280"];
    return Object.entries(reasons).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  })();

  // Attempts by hour
  const attemptsByHour = (() => {
    if (!loginLogs) return [];
    const hours: Record<string, { success: number; failed: number }> = {};
    
    for (let i = 0; i < 24; i += 2) {
      hours[`${i.toString().padStart(2, "0")}:00`] = { success: 0, failed: 0 };
    }
    
    loginLogs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      const bucket = Math.floor(hour / 2) * 2;
      const key = `${bucket.toString().padStart(2, "0")}:00`;
      if (log.status === "success") {
        hours[key].success++;
      } else {
        hours[key].failed++;
      }
    });
    
    return Object.entries(hours).map(([hour, data]) => ({
      hour,
      ...data,
    }));
  })();

  // Recent suspicious activity
  const recentFailures = loginLogs?.filter(l => l.status === "failed").slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-500" />
            Security Dashboard
            {isConnected && (
              <span className="flex items-center gap-1 text-xs font-normal text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor login attempts, suspicious activity, and threat detection
            {unreadCount > 0 && (
              <span className="ml-2 text-orange-500">({unreadCount} new alerts)</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Attempts"
          value={totalAttempts}
          icon={Eye}
          color="from-blue-500 to-cyan-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Failed Attempts"
          value={failedAttempts}
          icon={AlertTriangle}
          color="from-red-500 to-orange-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Successful Logins"
          value={successfulLogins}
          icon={Shield}
          color="from-emerald-500 to-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Suspicious IPs"
          value={suspiciousIPs}
          icon={Globe}
          color="from-purple-500 to-pink-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Blocked"
          value={blockedAccounts}
          icon={Ban}
          color="from-orange-500 to-red-500"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Login Attempts Timeline */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Login Attempts by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={attemptsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="success" stackId="a" fill="#10b981" name="Success" />
                    <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Failure Reasons */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Failure Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : failureReasons.length > 0 ? (
                <div className="flex items-center gap-4 h-full">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={failureReasons}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {failureReasons.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {failureReasons.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No failures recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Threat Map */}
      <ThreatMap />

      {/* Geographic Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Geographic Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : geoDistribution.length > 0 ? (
                geoDistribution.map((country, i) => (
                  <motion.div
                    key={country.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{country.total} total</span>
                      {country.failed > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {country.failed} failed
                        </Badge>
                      )}
                      {country.failRate > 50 && (
                        <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                          {country.failRate}% fail rate
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No geographic data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Suspicious Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Recent Failed Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentFailures.length > 0 ? (
                recentFailures.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {log.failure_reason?.includes("Face") ? (
                            <ScanFace className="w-4 h-4 text-red-400 flex-shrink-0" />
                          ) : (
                            <Fingerprint className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-foreground truncate">
                            {log.email}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {log.failure_reason || "Authentication failed"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{log.city || "Unknown"}, {log.country || "Unknown"}</span>
                          <span>•</span>
                          <span>{log.browser || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No failed attempts recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
