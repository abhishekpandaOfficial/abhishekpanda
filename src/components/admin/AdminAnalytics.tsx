import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { SecurityDashboard } from "./SecurityDashboard";

interface PageViewData {
  date: string;
  views: number;
  uniqueVisitors: number;
}

interface TopPageData {
  page: string;
  views: number;
  change: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }: StatCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 sm:p-6 rounded-xl bg-card border border-border"
  >
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {!isLoading && (
        <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="mt-4">
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="text-2xl sm:text-3xl font-black text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{title}</div>
        </>
      )}
    </div>
  </motion.div>
);

const getDateRange = (range: string) => {
  const now = new Date();
  switch (range) {
    case "24h":
      return { start: subDays(now, 1), end: now };
    case "7d":
      return { start: subDays(now, 7), end: now };
    case "30d":
      return { start: subDays(now, 30), end: now };
    case "90d":
      return { start: subDays(now, 90), end: now };
    case "1y":
      return { start: subMonths(now, 12), end: now };
    default:
      return { start: subDays(now, 7), end: now };
  }
};

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const dateRange = getDateRange(timeRange);

  // Fetch page views data
  const { data: pageViewsData, isLoading: pageViewsLoading, refetch } = useQuery({
    queryKey: ["analytics-page-views", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch interactions data
  const { data: interactionsData, isLoading: interactionsLoading } = useQuery({
    queryKey: ["analytics-interactions", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_interactions")
        .select("*")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments data for revenue
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["analytics-payments", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
      
      if (error) throw error;
      return data;
    },
  });

  // Process page views by date
  const processedPageViews: PageViewData[] = (() => {
    if (!pageViewsData) return [];
    
    const grouped: Record<string, { views: number; sessions: Set<string> }> = {};
    
    pageViewsData.forEach((pv) => {
      const date = format(new Date(pv.created_at), "MMM d");
      if (!grouped[date]) {
        grouped[date] = { views: 0, sessions: new Set() };
      }
      grouped[date].views++;
      if (pv.session_id) {
        grouped[date].sessions.add(pv.session_id);
      }
    });
    
    return Object.entries(grouped).map(([date, data]) => ({
      date,
      views: data.views,
      uniqueVisitors: data.sessions.size,
    }));
  })();

  // Calculate top pages
  const topPages: TopPageData[] = (() => {
    if (!pageViewsData) return [];
    
    const pageCounts: Record<string, number> = {};
    pageViewsData.forEach((pv) => {
      pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1;
    });
    
    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, views]) => ({
        page,
        views,
        change: Math.random() * 20 - 5, // Mock change for now
      }));
  })();

  // Calculate engagement by section
  const engagementData = (() => {
    if (!pageViewsData) return [];
    
    const sections: Record<string, number> = {
      Blog: 0,
      Courses: 0,
      "LLM Atlas": 0,
      Products: 0,
      Other: 0,
    };
    
    pageViewsData.forEach((pv) => {
      if (pv.page_path.includes("/blog")) sections.Blog++;
      else if (pv.page_path.includes("/courses")) sections.Courses++;
      else if (pv.page_path.includes("/llm-atlas")) sections["LLM Atlas"]++;
      else if (pv.page_path.includes("/products")) sections.Products++;
      else sections.Other++;
    });
    
    const total = Object.values(sections).reduce((a, b) => a + b, 0);
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];
    
    return Object.entries(sections)
      .filter(([, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colors[index % colors.length],
      }));
  })();

  // Calculate user activity by hour
  const userActivityData = (() => {
    if (!pageViewsData) return [];
    
    const hourCounts: Record<string, number> = {};
    for (let i = 0; i < 24; i += 3) {
      hourCounts[`${i.toString().padStart(2, "0")}:00`] = 0;
    }
    
    pageViewsData.forEach((pv) => {
      const hour = new Date(pv.created_at).getHours();
      const bucket = Math.floor(hour / 3) * 3;
      const key = `${bucket.toString().padStart(2, "0")}:00`;
      hourCounts[key]++;
    });
    
    return Object.entries(hourCounts).map(([hour, active]) => ({
      hour,
      active,
    }));
  })();

  // Calculate stats
  const totalViews = pageViewsData?.length || 0;
  const uniqueSessions = new Set(pageViewsData?.map((pv) => pv.session_id).filter(Boolean)).size;
  const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalInteractions = interactionsData?.length || 0;
  const engagementRate = totalViews > 0 ? Math.round((totalInteractions / totalViews) * 100) : 0;

  const isLoading = pageViewsLoading || interactionsLoading || paymentsLoading;

  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            Observatory
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Real-time analytics, security monitoring, and threat detection
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="mt-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          {/* Time Range & Actions */}
          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-card border-border">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="icon" className="border-border" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Page Views"
          value={totalViews.toLocaleString()}
          change={12.5}
          icon={Eye}
          color="from-blue-500 to-cyan-500"
          isLoading={pageViewsLoading}
        />
        <StatCard
          title="Unique Visitors"
          value={uniqueSessions.toLocaleString()}
          change={8.3}
          icon={Users}
          color="from-purple-500 to-pink-500"
          isLoading={pageViewsLoading}
        />
        <StatCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          change={5.2}
          icon={TrendingUp}
          color="from-emerald-500 to-green-500"
          isLoading={interactionsLoading}
        />
        <StatCard
          title="Revenue"
          value={`₹${(totalRevenue / 100).toLocaleString()}`}
          change={18.7}
          icon={DollarSign}
          color="from-orange-500 to-amber-500"
          isLoading={paymentsLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Page Views Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Page Views & Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pageViewsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : processedPageViews.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedPageViews}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" name="Page Views" />
                    <Area type="monotone" dataKey="uniqueVisitors" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisitors)" name="Unique Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pageViewsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : userActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="active" fill="#10b981" name="Active Users" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Engagement Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Traffic by Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {pageViewsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : engagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {engagementData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium text-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {pageViewsLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : topPages.length > 0 ? (
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground truncate max-w-[180px]">{page.page}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{page.views.toLocaleString()}</span>
                      <span className={`text-xs flex items-center gap-0.5 ${page.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {page.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(page.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Interactions", value: totalInteractions.toLocaleString(), change: 8.2 },
          { label: "CV Downloads", value: "—", change: 0 },
          { label: "Pages per Session", value: totalViews > 0 && uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : "—", change: 12.3 },
          { label: "Completed Payments", value: paymentsData?.length.toString() || "0", change: 3.5 },
        ].map((metric) => (
          <Card key={metric.label} className="bg-card border-border p-4">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl sm:text-2xl font-bold text-foreground">{metric.value}</span>
              {metric.change !== 0 && (
                <span className={`text-xs flex items-center gap-0.5 ${metric.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
