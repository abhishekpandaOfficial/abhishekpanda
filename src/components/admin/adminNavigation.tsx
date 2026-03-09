import type { ComponentType } from "react";
import {
  BarChart3,
  Bot,
  BookOpen,
  Brain,
  Command,
  Globe,
  GraduationCap,
  Home,
  Inbox,
  LayoutDashboard,
  Link2,
  Mail,
  Radar,
  Settings,
  Share2,
  Shield,
  User,
  Users,
} from "lucide-react";

export interface SidebarItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  badge: string | null;
  color: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export type ModuleStatus = "active" | "in-progress" | "pending" | "future" | "locked";
export type ModuleCategory = "automation" | "learning" | "research" | "system";

export interface CommandCenterModule {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  status: ModuleStatus;
  category: ModuleCategory;
  importance: "high" | "medium" | "low";
  path: string;
  gradient: string;
  iconBg: string;
}

export interface CommandPaletteItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  category: string;
  keywords?: string[];
}

export const adminSidebarGroups: SidebarGroup[] = [
  {
    title: "CORE",
    items: [
      { name: "Command Center", icon: LayoutDashboard, path: "/admin", badge: "Overview", color: "text-blue-700 dark:text-blue-400" },
      { name: "OpenOwl", icon: Bot, path: "/openowl/admin", badge: "AI", color: "text-cyan-700 dark:text-cyan-400" },
      { name: "WebVault", icon: Globe, path: "/admin/webvault", badge: "Sites", color: "text-sky-700 dark:text-sky-400" },
      { name: "Contact Requests", icon: Inbox, path: "/admin/contacts", badge: "Inbox", color: "text-sky-700 dark:text-sky-400" },
      { name: "Mentorship", icon: Users, path: "/admin/mentorship", badge: "Calls", color: "text-emerald-700 dark:text-emerald-400" },
    ],
  },
  {
    title: "PUBLISHING",
    items: [
      { name: "LMS Studio", icon: GraduationCap, path: "/admin/courses", badge: "Courses", color: "text-amber-700 dark:text-amber-400" },
      { name: "Ebook Studio", icon: BookOpen, path: "/admin/ebooks", badge: "Publishing", color: "text-emerald-700 dark:text-emerald-400" },
    ],
  },
  {
    title: "AI & AUTOMATION",
    items: [
      { name: "LLM Galaxy", icon: Brain, path: "/admin/llm-galaxy", badge: "GALAXYCORE", color: "text-violet-700 dark:text-violet-400" },
      { name: "OmniFlow Social", icon: Share2, path: "/admin/social", badge: null, color: "text-blue-700 dark:text-blue-400" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Observatory", icon: BarChart3, path: "/admin/analytics", badge: "Insights", color: "text-emerald-700 dark:text-emerald-400" },
      { name: "Argus VIII", icon: Radar, path: "/admin/argus", badge: "Surveillance", color: "text-cyan-700 dark:text-cyan-400" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Integrations Hub", icon: Link2, path: "/admin/integrations", badge: "Connectors", color: "text-blue-700 dark:text-blue-400" },
      { name: "Ops Docs", icon: Command, path: "/admin/ops", badge: "API", color: "text-slate-600 dark:text-slate-300" },
      { name: "Audit Logs", icon: Shield, path: "/admin/audit-logs", badge: "IP Track", color: "text-red-700 dark:text-red-400" },
      { name: "Sentinel", icon: Shield, path: "/admin/security", badge: "Protection", color: "text-orange-700 dark:text-orange-400" },
      { name: "System Settings", icon: Settings, path: "/admin/settings", badge: "Config", color: "text-slate-700 dark:text-slate-400" },
    ],
  },
];

export const commandCenterModules: CommandCenterModule[] = [
  {
    id: "courses-academy",
    name: "Courses & Academy",
    description: "Course list, curriculum builder, pricing, and learning operations.",
    icon: GraduationCap,
    status: "active",
    category: "learning",
    importance: "high",
    path: "/admin/courses",
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    iconBg: "bg-emerald-500/20",
  },
  {
    id: "ebook-studio",
    name: "Ebook Studio",
    description: "Publish longform content, manage assets, and ship reading updates.",
    icon: BookOpen,
    status: "active",
    category: "learning",
    importance: "high",
    path: "/admin/ebooks",
    gradient: "from-indigo-500 via-purple-500 to-fuchsia-500",
    iconBg: "bg-indigo-500/20",
  },
  {
    id: "atlascore",
    name: "LLM Galaxy",
    description: "Model index, benchmark tracking, and research comparisons.",
    icon: Brain,
    status: "active",
    category: "research",
    importance: "high",
    path: "/admin/llm-galaxy",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    iconBg: "bg-pink-500/20",
  },
  {
    id: "argus-viii",
    name: "Argus VIII",
    description: "Operational overlays, viewer logs, and surveillance controls.",
    icon: Radar,
    status: "active",
    category: "research",
    importance: "high",
    path: "/admin/argus",
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    iconBg: "bg-cyan-500/20",
  },
  {
    id: "omniflow",
    name: "OmniFlow Social",
    description: "Social connectors, approvals, previews, and scheduling.",
    icon: Share2,
    status: "in-progress",
    category: "automation",
    importance: "medium",
    path: "/admin/social",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    iconBg: "bg-cyan-500/20",
  },
  {
    id: "webvault",
    name: "WebVault",
    description: "Website management, storage buckets, and deployment-aware workflows.",
    icon: Globe,
    status: "active",
    category: "system",
    importance: "medium",
    path: "/admin/webvault",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    iconBg: "bg-sky-500/20",
  },
  {
    id: "observatory",
    name: "Observatory",
    description: "Traffic, behavior signals, and funnel visibility in one place.",
    icon: BarChart3,
    status: "active",
    category: "system",
    importance: "high",
    path: "/admin/analytics",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    iconBg: "bg-purple-500/20",
  },
  {
    id: "integrations",
    name: "Integrations Hub",
    description: "API keys, webhooks, connected apps, and token health.",
    icon: Link2,
    status: "active",
    category: "system",
    importance: "medium",
    path: "/admin/integrations",
    gradient: "from-teal-500 via-cyan-500 to-sky-500",
    iconBg: "bg-teal-500/20",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    description: "Sessions, passkeys, device trust, and security controls.",
    icon: Shield,
    status: "active",
    category: "system",
    importance: "high",
    path: "/admin/security",
    gradient: "from-red-500 via-rose-500 to-pink-500",
    iconBg: "bg-red-500/20",
  },
  {
    id: "system-settings",
    name: "System Settings",
    description: "Branding, admin preferences, backup posture, and exports.",
    icon: Settings,
    status: "active",
    category: "system",
    importance: "medium",
    path: "/admin/settings",
    gradient: "from-gray-500 via-slate-500 to-zinc-500",
    iconBg: "bg-gray-500/20",
  },
];

export const adminCommandPaletteItems: CommandPaletteItem[] = [
  { name: "Command Center", icon: LayoutDashboard, path: "/admin", category: "Core", keywords: ["dashboard", "home", "main"] },
  { name: "Contact Requests", icon: Inbox, path: "/admin/contacts", category: "Core", keywords: ["messages", "email", "inbox"] },
  { name: "Mentorship", icon: Users, path: "/admin/mentorship", category: "Core", keywords: ["calls", "bookings", "mentorship"] },
  { name: "Argus VIII", icon: Radar, path: "/admin/argus", category: "Core", keywords: ["argus", "classified", "surveillance", "intel"] },
  { name: "Courses & Academy", icon: GraduationCap, path: "/admin/courses", category: "Publishing", keywords: ["courses", "learning", "education"] },
  { name: "Ebook Studio", icon: BookOpen, path: "/admin/ebooks", category: "Publishing", keywords: ["ebook", "book", "pdf", "epub"] },
  { name: "LLM Galaxy", icon: Brain, path: "/admin/llm-galaxy", category: "AI & Automation", keywords: ["llm", "ai", "models", "galaxy"] },
  { name: "OmniFlow Social", icon: Share2, path: "/admin/social", category: "AI & Automation", keywords: ["social", "media", "posts"] },
  { name: "Observatory", icon: BarChart3, path: "/admin/analytics", category: "Intelligence", keywords: ["analytics", "stats", "metrics", "data"] },
  { name: "WebVault", icon: Globe, path: "/admin/webvault", category: "System", keywords: ["webvault", "sites", "buckets", "functions"] },
  { name: "Integrations Hub", icon: Link2, path: "/admin/integrations", category: "System", keywords: ["api", "webhooks", "connect", "integrations"] },
  { name: "Sentinel", icon: Shield, path: "/admin/security", category: "System", keywords: ["security", "2fa", "access", "protection"] },
  { name: "System Settings", icon: Settings, path: "/admin/settings", category: "System", keywords: ["settings", "config", "preferences"] },
  { name: "Home Page", icon: Home, path: "/", category: "Public Pages", keywords: ["home", "landing"] },
  { name: "About Page", icon: User, path: "/about", category: "Public Pages", keywords: ["about", "bio", "profile"] },
  { name: "Blog", icon: BookOpen, path: "/blog", category: "Public Pages", keywords: ["blog", "posts"] },
  { name: "Courses", icon: GraduationCap, path: "/courses", category: "Public Pages", keywords: ["courses"] },
  { name: "Contact", icon: Mail, path: "/contact", category: "Public Pages", keywords: ["contact", "reach"] },
  { name: "LLM Galaxy Public", icon: Globe, path: "/llm-galaxy", category: "Public Pages", keywords: ["galaxy", "llm"] },
];
