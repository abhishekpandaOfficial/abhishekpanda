import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Zap,
  FileText,
  GraduationCap,
  Package,
  Brain,
  Shield,
  StickyNote,
  Share2,
  Clock,
  CreditCard,
  Heart,
  BarChart3,
  Plug,
  Settings,
  Search,
  Workflow,
  HardDrive,
  ChevronRight,
  Sparkles,
  Activity,
  Bell,
  Calendar,
  TrendingUp,
  Users,
  Download,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Timer,
  Lock,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AdminOnboardingWizard } from "./AdminOnboardingWizard";

// Module status types
type ModuleStatus = "active" | "in-progress" | "pending" | "future" | "locked";

// Module categories
type ModuleCategory = "automation" | "content" | "learning" | "personal" | "research" | "finance" | "system";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: ModuleStatus;
  category: ModuleCategory;
  importance: "high" | "medium" | "low";
  dependencies: string[];
  path?: string;
  gradient: string;
  iconBg: string;
  requiresBiometric?: boolean; // Modules that require WebAuthn re-authentication
}

// All modules configuration
const modules: Module[] = [
  // Automation & AI
  {
    id: "aethergrid",
    name: "AETHERGRID",
    description: "Automation & AI Engine — Workflow builder, approvals, multi-agent tasks, social autopost",
    icon: Zap,
    status: "in-progress",
    category: "automation",
    importance: "high",
    dependencies: [],
    path: "/admin/workflows",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    iconBg: "bg-violet-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Content
  {
    id: "content-studio",
    name: "Content Studio",
    description: "Blog creation, media uploads, publish pipeline, SEO tools",
    icon: FileText,
    status: "active",
    category: "content",
    importance: "high",
    dependencies: [],
    path: "/admin/blog",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    iconBg: "bg-blue-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Learning
  {
    id: "courses-academy",
    name: "Courses & Academy",
    description: "Course list, curriculum builder, pricing, sales stats",
    icon: GraduationCap,
    status: "active",
    category: "learning",
    importance: "high",
    dependencies: [],
    path: "/admin/courses",
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    iconBg: "bg-emerald-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Marketplace
  {
    id: "marketplace",
    name: "Digital Products",
    description: "Templates, code snippets, automation workflows, pricing management",
    icon: Package,
    status: "active",
    category: "content",
    importance: "medium",
    dependencies: [],
    path: "/admin/products",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    iconBg: "bg-orange-500/20",
  },
  // Research
  {
    id: "atlascore",
    name: "LLM Atlas (ATLASCORE)",
    description: "Model index, benchmarks, comparison tool, update ingestors",
    icon: Brain,
    status: "active",
    category: "research",
    importance: "high",
    dependencies: [],
    path: "/admin/llm-atlas",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    iconBg: "bg-pink-500/20",
  },
  // Personal
  {
    id: "astra-vault",
    name: "Astra Vault",
    description: "Encrypted drive — Personal documents, family data, zero-knowledge storage",
    icon: HardDrive,
    status: "active",
    category: "personal",
    importance: "high",
    dependencies: ["sentinel"],
    path: "/admin/drive",
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    iconBg: "bg-slate-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Knowledge
  {
    id: "nimbus-desk",
    name: "Nimbus Desk",
    description: "Notes & Knowledge OS — Documents, idea vault, book drafts",
    icon: StickyNote,
    status: "pending",
    category: "personal",
    importance: "medium",
    dependencies: [],
    gradient: "from-indigo-500 via-blue-500 to-sky-500",
    iconBg: "bg-indigo-500/20",
  },
  // Social
  {
    id: "omniflow",
    name: "OmniFlow Social Hub",
    description: "Social connectors, preview posts, approvals, scheduling",
    icon: Share2,
    status: "in-progress",
    category: "automation",
    importance: "high",
    dependencies: ["aethergrid"],
    path: "/admin/social",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    iconBg: "bg-cyan-500/20",
  },
  // Scheduler
  {
    id: "chronos",
    name: "Chronos Scheduler",
    description: "Cron jobs, publish schedules, reminders, campaign timelines",
    icon: Clock,
    status: "active",
    category: "automation",
    importance: "high",
    dependencies: [],
    path: "/admin/jobs",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    iconBg: "bg-amber-500/20",
  },
  // Finance
  {
    id: "fincore",
    name: "Finance & Payments (FINCORE)",
    description: "Razorpay dashboard, transactions, revenue, invoices",
    icon: CreditCard,
    status: "active",
    category: "finance",
    importance: "high",
    dependencies: [],
    path: "/admin/payments",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    iconBg: "bg-green-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Personal OS
  {
    id: "lifemap",
    name: "LifeMap",
    description: "Personal & Family OS — Profiles, health records, lifestyle tracking",
    icon: Heart,
    status: "active",
    category: "personal",
    importance: "low",
    dependencies: ["astra-vault"],
    path: "/admin/lifemap",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    iconBg: "bg-rose-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Analytics
  {
    id: "observatory",
    name: "Observatory",
    description: "Analytics — Clickstream, traffic heatmaps, funnels, user activity",
    icon: BarChart3,
    status: "active",
    category: "system",
    importance: "high",
    dependencies: [],
    path: "/admin/analytics",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    iconBg: "bg-purple-500/20",
  },
  // Integrations
  {
    id: "integrations",
    name: "Integrations Panel",
    description: "API keys, webhooks, connected apps, token status",
    icon: Plug,
    status: "active",
    category: "system",
    importance: "medium",
    dependencies: [],
    path: "/admin/integrations",
    gradient: "from-teal-500 via-cyan-500 to-sky-500",
    iconBg: "bg-teal-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
  // Security
  {
    id: "sentinel",
    name: "Security Center (Sentinel)",
    description: "2FA/WebAuthn, devices, sessions, access logs, secret vault",
    icon: Shield,
    status: "active",
    category: "system",
    importance: "high",
    dependencies: [],
    path: "/admin/security",
    gradient: "from-red-500 via-rose-500 to-pink-500",
    iconBg: "bg-red-500/20",
  },
  // Settings
  {
    id: "system-settings",
    name: "System Settings",
    description: "Branding, account settings, backup/restore, data export",
    icon: Settings,
    status: "active",
    category: "system",
    importance: "medium",
    dependencies: [],
    path: "/admin/settings",
    gradient: "from-gray-500 via-slate-500 to-zinc-500",
    iconBg: "bg-gray-500/20",
    requiresBiometric: true, // Secured with WebAuthn
  },
];

// Status badge configuration
const statusConfig: Record<ModuleStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  "in-progress": { label: "In Progress", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Timer },
  pending: { label: "Pending", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertCircle },
  future: { label: "Future", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Sparkles },
  locked: { label: "Locked", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: Lock },
};

// Category configuration
const categoryConfig: Record<ModuleCategory, { label: string; color: string }> = {
  automation: { label: "Automation", color: "text-violet-400" },
  content: { label: "Content", color: "text-blue-400" },
  learning: { label: "Learning", color: "text-emerald-400" },
  personal: { label: "Personal", color: "text-rose-400" },
  research: { label: "Research", color: "text-pink-400" },
  finance: { label: "Finance", color: "text-green-400" },
  system: { label: "System", color: "text-slate-400" },
};

// KPI Card Component - Premium clickable design
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  path?: string;
  description?: string;
}

const KPICard = ({ title, value, icon: Icon, trend, color, path, description }: KPICardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-4 cursor-pointer transition-all duration-300 group",
        path && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      {/* Background glow on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl",
        color.replace('bg-gradient-to-b', 'bg-gradient-to-br')
      )} />
      
      <div className="relative flex items-center gap-3">
        {/* Icon pill */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
          color
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mb-0.5">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{description}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-0.5 text-[10px]",
              trend >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              <TrendingUp className={cn("w-2.5 h-2.5 flex-shrink-0", trend < 0 && "rotate-180")} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {path && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );

  if (path) {
    return <Link to={path}>{content}</Link>;
  }
  return content;
};

// Module Card Component
interface ModuleCardProps {
  module: Module;
  index: number;
}

const ModuleCard = ({ module, index }: ModuleCardProps) => {
  const StatusIcon = statusConfig[module.status].icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl hover:border-primary/50 transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl",
        `bg-gradient-to-br ${module.gradient}`
      )} />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              module.iconBg
            )}>
              <module.icon className={cn(
                "w-6 h-6",
                module.status === "active" ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            {/* WebAuthn Security Lock Badge */}
            {module.requiresBiometric && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500/90 border-2 border-background flex items-center justify-center shadow-lg">
                <Lock className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {module.requiresBiometric && (
              <Badge variant="outline" className="text-[9px] gap-0.5 px-1.5 py-0 h-5 bg-amber-500/10 text-amber-400 border-amber-500/30">
                <Shield className="w-2.5 h-2.5" />
                Secured
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-[10px] gap-1", statusConfig[module.status].color)}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig[module.status].label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          {module.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {module.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={cn("text-[10px] uppercase tracking-wider", categoryConfig[module.category].color)}>
            {categoryConfig[module.category].label}
          </span>
          {module.path && module.status !== "future" && module.status !== "locked" ? (
            <Link to={module.path}>
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 hover:bg-primary/10 hover:text-primary">
                {module.requiresBiometric && <Lock className="w-3 h-3" />}
                Open
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="ghost" disabled className="h-8 text-xs opacity-50">
              {module.status === "locked" ? "Locked" : "Coming Soon"}
            </Button>
          )}
        </div>

        {/* Dependencies indicator */}
        {module.dependencies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground">
              Requires: {module.dependencies.map(d => modules.find(m => m.id === d)?.name).join(", ")}
            </p>
          </div>
        )}

        {/* WebAuthn Security Notice */}
        {module.requiresBiometric && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-[10px] text-amber-400/80 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Requires biometric re-authentication
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Command Center Component
export const CommandCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | "all">("all");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({
    activeWorkflows: 0,
    pendingApprovals: 0,
    todayTraffic: 0,
    recentPayments: 0,
    scheduledPosts: 0,
    totalDownloads: 0,
    totalContacts: 0,
  });

  // Check if user needs onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('admin_onboarding_complete');
    const hasPasskey = localStorage.getItem('admin_passkey_registered');
    if (!onboardingComplete && !hasPasskey) {
      // Show onboarding for new users after a short delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { data: workflows },
        { data: pageViews },
        { data: payments },
        { data: jobs },
        { data: downloads },
        { data: contacts },
      ] = await Promise.all([
        supabase.from("scheduled_jobs").select("*").eq("is_active", true),
        supabase.from("page_views").select("*"),
        supabase.from("payments").select("*").eq("status", "captured"),
        supabase.from("scheduled_jobs").select("*"),
        supabase.from("cv_downloads").select("*"),
        supabase.from("contact_requests").select("*"),
      ]);

      const today = new Date().toDateString();
      const todayViews = pageViews?.filter(v => new Date(v.created_at).toDateString() === today).length || 0;

      setStats({
        activeWorkflows: workflows?.length || 0,
        pendingApprovals: 3, // Mock data
        todayTraffic: todayViews,
        recentPayments: payments?.length || 0,
        scheduledPosts: jobs?.filter(j => j.job_type === "social_post").length || 0,
        totalDownloads: downloads?.length || 0,
        totalContacts: contacts?.length || 0,
      });
    };

    fetchStats();
  }, []);

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group modules by status for matrix
  const modulesByStatus = {
    active: modules.filter(m => m.status === "active"),
    "in-progress": modules.filter(m => m.status === "in-progress"),
    pending: modules.filter(m => m.status === "pending"),
    future: modules.filter(m => m.status === "future"),
  };

  return (
    <>
      {/* Onboarding Wizard */}
      <AdminOnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Setup Banner for users without passkey */}
      {!localStorage.getItem('admin_passkey_registered') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-amber-400">Complete Your Setup</p>
                <p className="text-xs text-amber-400/70">Set up biometric authentication for enhanced security</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              Start Setup
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl p-6 md:p-8"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary font-medium uppercase tracking-wider">Command Center</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome back, <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">Abhishek</span>
              </h1>
              <p className="text-muted-foreground">
                Your Command Center is ready. All systems operational.
              </p>
            </div>

            {/* Global Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules, files, blog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl focus:border-primary/50"
              />
            </div>
          </div>

          {/* KPIs Grid - Premium clickable cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <KPICard
              title="Workflows"
              value={stats.activeWorkflows}
              icon={Workflow}
              trend={12}
              color="bg-gradient-to-b from-violet-500 to-purple-600"
              path="/admin/workflows"
              description="Active automations"
            />
            <KPICard
              title="Approvals"
              value={stats.pendingApprovals}
              icon={Bell}
              color="bg-gradient-to-b from-amber-500 to-orange-600"
              path="/admin/notifications"
              description="Pending review"
            />
            <KPICard
              title="Traffic"
              value={stats.todayTraffic}
              icon={Activity}
              trend={24}
              color="bg-gradient-to-b from-blue-500 to-cyan-600"
              path="/admin/analytics"
              description="Today's visitors"
            />
            <KPICard
              title="Revenue"
              value={stats.recentPayments}
              icon={CreditCard}
              trend={-3}
              color="bg-gradient-to-b from-emerald-500 to-green-600"
              path="/admin/payments"
              description="Total payments"
            />
            <KPICard
              title="Scheduled"
              value={stats.scheduledPosts}
              icon={Calendar}
              color="bg-gradient-to-b from-pink-500 to-rose-600"
              path="/admin/jobs"
              description="Upcoming posts"
            />
            <KPICard
              title="CV Downloads"
              value={stats.totalDownloads}
              icon={Download}
              trend={8}
              color="bg-gradient-to-b from-indigo-500 to-blue-600"
              path="/admin/cv-downloads"
              description="Resume requests"
            />
            <KPICard
              title="Contacts"
              value={stats.totalContacts}
              icon={MessageSquare}
              color="bg-gradient-to-b from-teal-500 to-cyan-600"
              path="/admin/contacts"
              description="Inquiries received"
            />
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="rounded-full"
        >
          All Modules
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Button
            key={key}
            size="sm"
            variant={selectedCategory === key ? "default" : "outline"}
            onClick={() => setSelectedCategory(key as ModuleCategory)}
            className="rounded-full"
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredModules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* AETHERGRID Core Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 backdrop-blur-xl p-6"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTAwLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-1">
              AETHERGRID — Core Intelligence Engine
            </h3>
            <p className="text-muted-foreground mb-4">
              The central nervous system powering all automation, AI workflows, and intelligent operations across your command center.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-400">
                Multi-Agent Tasks
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">
                Workflow Builder
              </Badge>
              <Badge variant="outline" className="bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400">
                Social Autopost
              </Badge>
            </div>
          </div>
          <Link to="/admin/workflows">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2">
              Open AETHERGRID
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Modules Overview Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden"
      >
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">Modules Overview Matrix</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete overview of all modules, their status, and dependencies
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Module Name</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Importance</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dependencies</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => {
                const StatusIcon = statusConfig[module.status].icon;
                return (
                  <tr key={module.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", module.iconBg)}>
                          <module.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{module.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-sm", categoryConfig[module.category].color)}>
                        {categoryConfig[module.category].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={cn("text-[10px] gap-1", statusConfig[module.status].color)}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[module.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        module.importance === "high" && "bg-red-500/10 text-red-400 border-red-500/30",
                        module.importance === "medium" && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                        module.importance === "low" && "bg-slate-500/10 text-slate-400 border-slate-500/30"
                      )}>
                        {module.importance.charAt(0).toUpperCase() + module.importance.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {module.dependencies.length > 0
                          ? module.dependencies.map(d => modules.find(m => m.id === d)?.name).join(", ")
                          : "None"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {module.path && module.status !== "future" ? (
                        <Link to={module.path}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                            Open
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Status Summary Footer */}
        <div className="p-4 bg-muted/30 border-t border-border/50">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">
                Active: {modulesByStatus.active.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">
                In Progress: {modulesByStatus["in-progress"].length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">
                Pending: {modulesByStatus.pending.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">
                Future: {modulesByStatus.future.length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </>
  );
};

export default CommandCenter;
