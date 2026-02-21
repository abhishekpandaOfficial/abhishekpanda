import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Package,
  Brain,
  Zap,
  Share2,
  Clock,
  BarChart3,
  CreditCard,
  HardDrive,
  Settings,
  Shield,
  Download,
  Inbox,
  Heart,
  Link2,
  BookOpen,
  Search,
  User,
  Home,
  Briefcase,
  Mail,
  Globe,
  Building2,
} from "lucide-react";

interface CommandItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  keywords?: string[];
}

const commandItems: CommandItem[] = [
  // Core
  { name: "Command Center", icon: LayoutDashboard, path: "/admin", category: "Core", keywords: ["dashboard", "home", "main"] },
  { name: "Business", icon: Building2, path: "/admin/business", category: "Core", keywords: ["originx", "company", "products", "documents", "credentials"] },
  { name: "CV Downloads", icon: Download, path: "/admin/cv-downloads", category: "Core", keywords: ["resume", "download"] },
  { name: "Contact Requests", icon: Inbox, path: "/admin/contacts", category: "Core", keywords: ["messages", "email", "inbox"] },
  
  // Creator Suite
  { name: "Content Studio", icon: FileText, path: "/admin/blog", category: "Creator Suite", keywords: ["blog", "posts", "articles", "write"] },
  { name: "Nimbus Desk", icon: BookOpen, path: "/admin/nimbus", category: "Creator Suite", keywords: ["notes", "knowledge", "documents"] },
  { name: "Courses & Academy", icon: GraduationCap, path: "/admin/courses", category: "Creator Suite", keywords: ["courses", "learning", "education"] },
  { name: "Digital Products", icon: Package, path: "/admin/products", category: "Creator Suite", keywords: ["products", "digital", "marketplace"] },
  { name: "Ebook Studio", icon: BookOpen, path: "/admin/ebooks", category: "Creator Suite", keywords: ["ebook", "book", "pdf", "epub"] },
  
  // AI & Automation
  { name: "LLM Galaxy", icon: Brain, path: "/admin/llm-galaxy", category: "AI & Automation", keywords: ["llm", "ai", "models", "galaxy"] },
  { name: "AETHERGRID", icon: Zap, path: "/admin/workflows", category: "AI & Automation", keywords: ["workflows", "automation", "ai"] },
  { name: "OmniFlow Social", icon: Share2, path: "/admin/social", category: "AI & Automation", keywords: ["social", "media", "posts"] },
  { name: "Chronos Scheduler", icon: Clock, path: "/admin/jobs", category: "AI & Automation", keywords: ["schedule", "cron", "jobs", "timer"] },
  
  // Intelligence
  { name: "Observatory", icon: BarChart3, path: "/admin/analytics", category: "Intelligence", keywords: ["analytics", "stats", "metrics", "data"] },
  
  // Finance
  { name: "FINCORE", icon: CreditCard, path: "/admin/payments", category: "Finance", keywords: ["payments", "money", "transactions", "revenue"] },
  
  // Personal OS
  { name: "Astra Vault", icon: HardDrive, path: "/admin/drive", category: "Personal OS", keywords: ["drive", "storage", "files", "vault"] },
  { name: "LifeMap", icon: Heart, path: "/admin/lifemap", category: "Personal OS", keywords: ["family", "life", "personal", "health"] },
  
  // System
  { name: "Integrations Hub", icon: Link2, path: "/admin/integrations", category: "System", keywords: ["api", "webhooks", "connect", "integrations"] },
  { name: "Sentinel", icon: Shield, path: "/admin/security", category: "System", keywords: ["security", "2fa", "access", "protection"] },
  { name: "System Settings", icon: Settings, path: "/admin/settings", category: "System", keywords: ["settings", "config", "preferences"] },
  
  // Public Pages
  { name: "Home Page", icon: Home, path: "/", category: "Public Pages", keywords: ["home", "landing"] },
  { name: "About Page", icon: User, path: "/about", category: "Public Pages", keywords: ["about", "bio", "profile"] },
  { name: "Blog", icon: FileText, path: "/blog", category: "Public Pages", keywords: ["blog", "posts"] },
  { name: "Courses", icon: GraduationCap, path: "/courses", category: "Public Pages", keywords: ["courses"] },
  { name: "Products", icon: Package, path: "/products", category: "Public Pages", keywords: ["products", "store"] },
  { name: "Contact", icon: Mail, path: "/contact", category: "Public Pages", keywords: ["contact", "reach"] },
  { name: "LLM Galaxy Public", icon: Globe, path: "/llm-galaxy", category: "Public Pages", keywords: ["galaxy", "llm"] },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const groupedItems = commandItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules, pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedItems).map(([category, items], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`${item.name} ${item.keywords?.join(" ") || ""}`}
                  onSelect={() => runCommand(() => navigate(item.path))}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
