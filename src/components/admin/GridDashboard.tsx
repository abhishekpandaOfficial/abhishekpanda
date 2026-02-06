import { useState, useEffect, useCallback } from "react";
// @ts-ignore - react-grid-layout types are incomplete
import GridLayout from "react-grid-layout";
// @ts-ignore
import { WidthProvider } from "react-grid-layout";
import { motion, AnimatePresence } from "framer-motion";

const ResponsiveGridLayout = WidthProvider(GridLayout);
import {
  Download,
  DollarSign,
  Eye,
  FileText,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Check,
  MessageSquare,
  Activity,
  Plus,
  X,
  Settings,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
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
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AddWidgetModal } from "./AddWidgetModal";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

const DEFAULT_LAYOUTS: LayoutItem[] = [
  { i: "stats-downloads", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "stats-contacts", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "stats-views", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "stats-revenue", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "traffic-chart", x: 0, y: 2, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "revenue-chart", x: 6, y: 2, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "recent-downloads", x: 0, y: 7, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "recent-contacts", x: 6, y: 7, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "pie-chart", x: 0, y: 12, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "quick-actions", x: 4, y: 12, w: 4, h: 5, minW: 3, minH: 4 },
  { i: "live-activity", x: 8, y: 12, w: 4, h: 5, minW: 3, minH: 4 },
];

const trafficData = [
  { name: "Mon", views: 2400, visitors: 1800 },
  { name: "Tue", views: 1398, visitors: 1200 },
  { name: "Wed", views: 9800, visitors: 7200 },
  { name: "Thu", views: 3908, visitors: 2800 },
  { name: "Fri", views: 4800, visitors: 3600 },
  { name: "Sat", views: 3800, visitors: 2400 },
  { name: "Sun", views: 4300, visitors: 3200 },
];

const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
];

const pieData = [
  { name: "Courses", value: 45, color: "hsl(var(--primary))" },
  { name: "Products", value: 30, color: "hsl(var(--secondary))" },
  { name: "Mentorship", value: 15, color: "#10B981" },
  { name: "Other", value: 10, color: "#F59E0B" },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, change, icon: Icon, color, bgColor }: StatCardProps) => (
  <div className="h-full flex flex-col justify-center">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-sm",
            change >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
    </div>
  </div>
);

export const GridDashboard = () => {
  const [layouts, setLayouts] = useState<LayoutItem[]>(() => {
    const stored = localStorage.getItem("dashboard-grid-layouts");
    return stored ? JSON.parse(stored) : DEFAULT_LAYOUTS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    todayDownloads: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalContacts: 0,
    pageViews: 0,
  });
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [downloads, courses, payments, contacts, pageViews] = await Promise.all([
          supabase.from("cv_downloads").select("*").order("created_at", { ascending: false }),
          supabase.from("courses").select("*"),
          supabase.from("payments").select("*").eq("status", "captured"),
          supabase.from("contact_requests").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

        const today = new Date().toDateString();
        const todayDownloads = downloads.data?.filter(
          (d) => new Date(d.created_at).toDateString() === today
        ).length || 0;

        const totalRevenue = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        setStats({
          totalDownloads: downloads.data?.length || 0,
          todayDownloads,
          totalCourses: courses.data?.length || 0,
          totalRevenue,
          totalContacts: contacts.data?.length || 0,
          pageViews: pageViews.data?.length || 0,
        });

        setRecentDownloads(downloads.data?.slice(0, 5) || []);
        setRecentContacts(contacts.data || []);
        setLiveActivity(pageViews.data || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const contactChannel = supabase
      .channel("dashboard-contacts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_requests" },
        (payload) => {
          setRecentContacts((prev) => [payload.new, ...prev.slice(0, 4)]);
          setStats((prev) => ({ ...prev, totalContacts: prev.totalContacts + 1 }));
        }
      )
      .subscribe();

    const downloadsChannel = supabase
      .channel("dashboard-downloads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cv_downloads" },
        (payload) => {
          setRecentDownloads((prev) => [payload.new, ...prev.slice(0, 4)]);
          setStats((prev) => ({ ...prev, totalDownloads: prev.totalDownloads + 1 }));
        }
      )
      .subscribe();

    const pageViewsChannel = supabase
      .channel("dashboard-pageviews")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        (payload) => {
          setLiveActivity((prev) => [payload.new, ...prev.slice(0, 19)]);
          setStats((prev) => ({ ...prev, pageViews: prev.pageViews + 1 }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(downloadsChannel);
      supabase.removeChannel(pageViewsChannel);
    };
  }, []);

  const onLayoutChange = useCallback((newLayouts: LayoutItem[]) => {
    setLayouts(newLayouts);
    localStorage.setItem("dashboard-grid-layouts", JSON.stringify(newLayouts));
  }, []);

  const renderWidget = (id: string) => {
    switch (id) {
      case "stats-downloads":
        return (
          <StatCard
            title="Total CV Downloads"
            value={stats.totalDownloads}
            change={12}
            icon={Download}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
        );
      case "stats-contacts":
        return (
          <StatCard
            title="Contact Requests"
            value={stats.totalContacts}
            change={8}
            icon={MessageSquare}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
        );
      case "stats-views":
        return (
          <StatCard
            title="Page Views"
            value={stats.pageViews.toLocaleString()}
            change={24}
            icon={Eye}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        );
      case "stats-revenue":
        return (
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 100).toLocaleString()}`}
            change={-3}
            icon={DollarSign}
            color="text-yellow-500"
            bgColor="bg-yellow-500/10"
          />
        );
      case "traffic-chart":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Traffic Overview</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "revenue-chart":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Revenue Breakdown</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "recent-downloads":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Recent CV Downloads</h3>
            <div className="flex-1 overflow-auto space-y-2">
              {recentDownloads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No downloads yet</p>
              ) : (
                recentDownloads.map((download) => (
                  <div key={download.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {download.visitor_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{download.visitor_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{download.company_name || "Individual"}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">{new Date(download.created_at).toLocaleDateString()}</Badge>
                  </div>
                ))
              )}
            </div>
            <Link to="/admin/cv-downloads">
              <Button variant="ghost" size="sm" className="w-full mt-2">View All →</Button>
            </Link>
          </div>
        );
      case "recent-contacts":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Recent Contacts</h3>
            <div className="flex-1 overflow-auto space-y-2">
              {recentContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No contacts yet</p>
              ) : (
                recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                      {contact.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{contact.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/admin/contacts">
              <Button variant="ghost" size="sm" className="w-full mt-2">View All →</Button>
            </Link>
          </div>
        );
      case "pie-chart":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Revenue Distribution</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "quick-actions":
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Link to="/admin/blog">
                <Button variant="outline" className="w-full h-full flex-col gap-2 py-4">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">New Post</span>
                </Button>
              </Link>
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full h-full flex-col gap-2 py-4">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs">Add Course</span>
                </Button>
              </Link>
              <Link to="/admin/contacts">
                <Button variant="outline" className="w-full h-full flex-col gap-2 py-4">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs">Contacts</span>
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full h-full flex-col gap-2 py-4">
                  <Activity className="w-5 h-5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </Link>
            </div>
          </div>
        );
      case "live-activity":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-foreground">Live Activity</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="flex-1 overflow-auto space-y-1">
              {liveActivity.slice(0, 8).map((activity, i) => (
                <div key={activity.id || i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">{activity.page_path}</span>
                  <span className="ml-auto text-muted-foreground/50 shrink-0">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="text-muted-foreground">Unknown widget</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Abhishek</h1>
          <p className="text-muted-foreground">Here's what's happening with your website today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-2"
          >
            {isEditMode ? (
              <>
                <Check className="w-4 h-4" />
                Done Editing
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Layout
              </>
            )}
          </Button>
          <AddWidgetModal />
        </div>
      </div>

      {/* Edit Mode Banner */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4"
          >
            <p className="text-sm text-foreground">
              <strong>Edit Mode:</strong> Drag widgets to rearrange and resize them. Click Done when finished.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layout={layouts}
        cols={12}
        rowHeight={60}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {layouts.map((item) => (
          <div
            key={item.i}
            className={cn(
              "rounded-xl border border-border bg-card p-4 overflow-hidden",
              isEditMode && "ring-2 ring-primary/20 cursor-move"
            )}
          >
            {isEditMode && (
              <div className="drag-handle absolute top-2 left-2 right-2 h-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Settings className="w-3 h-3" />
                  <span className="text-xs">Drag to move</span>
                </div>
              </div>
            )}
            <div className={cn("h-full", isEditMode && "mt-6")}>
              {renderWidget(item.i)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default GridDashboard;
