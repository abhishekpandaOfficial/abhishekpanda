import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock3,
  MessageSquare,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  type CommandCenterModule,
  type ModuleCategory,
  type ModuleStatus,
} from "../adminNavigation";

export const statusConfig: Record<ModuleStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300" },
  "in-progress": { label: "In Progress", className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300" },
  pending: { label: "Pending", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300" },
  future: { label: "Future", className: "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300" },
  locked: { label: "Locked", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300" },
};

export const categoryConfig: Record<ModuleCategory, { label: string; accent: string }> = {
  automation: { label: "Automation", accent: "text-cyan-700 dark:text-cyan-300" },
  learning: { label: "Learning", accent: "text-emerald-700 dark:text-emerald-300" },
  research: { label: "Research", accent: "text-fuchsia-700 dark:text-fuchsia-300" },
  system: { label: "System", accent: "text-slate-700 dark:text-slate-300" },
};

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const DashboardHero = ({ searchQuery, onSearchChange }: HeroProps) => (
  <motion.section
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-[28px] border border-border/50 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%)] bg-card/95 p-6 shadow-sm md:p-8"
  >
    <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.04),transparent)]" />
    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
      <label className="relative block w-full max-w-xl lg:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search active modules"
          className="h-12 rounded-2xl border-border/50 bg-background/80 pl-11 shadow-sm"
        />
      </label>
    </div>
  </motion.section>
);

interface StatCardProps {
  title: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  path: string;
  tone: string;
}

export const StatCard = ({ title, value, note, icon: Icon, path, tone }: StatCardProps) => (
  <Link to={path} className="group">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="flex h-full items-start gap-4 rounded-3xl border border-border/50 bg-card/90 p-5 shadow-sm transition-colors group-hover:border-primary/35"
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </motion.div>
  </Link>
);

interface QuickAction {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export const QuickActions = ({ actions }: { actions: QuickAction[] }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Quick actions</h2>
        <p className="text-sm text-muted-foreground">Frequent entry points for day-to-day admin work.</p>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action, index) => (
        <Link key={action.path} to={action.path} className="group">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex h-full flex-col rounded-3xl border border-border/50 bg-card/85 p-5 shadow-sm transition-colors group-hover:border-primary/35"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <action.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{action.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
              Open
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  </section>
);

export const ModulesGrid = ({ title, description, modules }: { title: string; description: string; modules: CommandCenterModule[] }) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module, index) => (
        <motion.div
          key={module.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/90 p-5 shadow-sm"
        >
          <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", module.gradient)} />
          <div className="flex items-start justify-between gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", module.iconBg)}>
              <module.icon className="h-5 w-5 text-foreground" />
            </div>
            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[10px]", statusConfig[module.status].className)}>
              {statusConfig[module.status].label}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{module.name}</h3>
              <span className={cn("text-[11px] font-medium uppercase tracking-[0.14em]", categoryConfig[module.category].accent)}>
                {categoryConfig[module.category].label}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {module.importance === "high" ? "Priority module" : "Standard module"}
            </div>
            <Button asChild variant="ghost" className="rounded-xl px-3 text-sm">
              <Link to={module.path}>
                Open
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export const EmptyModulesState = () => (
  <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
      <Search className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-foreground">No modules match that search.</h3>
    <p className="mt-2 text-sm text-muted-foreground">Try a broader term like analytics, courses, or security.</p>
  </div>
);

export const activityStatCards = [
  {
    title: "Today",
    icon: Activity,
    tone: "bg-gradient-to-br from-sky-500 to-cyan-600",
  },
  {
    title: "Scheduled",
    icon: Calendar,
    tone: "bg-gradient-to-br from-fuchsia-500 to-rose-600",
  },
  {
    title: "Contacts",
    icon: MessageSquare,
    tone: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
];
