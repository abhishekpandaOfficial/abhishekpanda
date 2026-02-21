import { useState, useEffect, useRef } from "react";
import { ActiveSessionIndicator } from "./ActiveSessionIndicator";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Package,
  Brain,
  Workflow,
  Share2,
  Clock,
  BarChart3,
  Users,
  CreditCard,
  HardDrive,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Menu,
  X,
  Download,
  Zap,
  Sparkles,
  Command,
  Heart,
  Link2,
  BookOpen,
  Mail,
  Inbox,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNotifications } from "./AdminNotifications";
import { CommandPalette } from "./CommandPalette";
import { SecurityAlertPanel } from "./SecurityAlertPanel";
import { useActiveSession } from "@/hooks/useActiveSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SidebarItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge: string | null;
  color: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const getBadgeClassName = (badge: string) => {
  const key = badge.toLowerCase();
  if (["security", "ip track", "protection"].includes(key)) {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }
  if (["ai", "galaxycore", "automation"].includes(key)) {
    return "bg-violet-500/20 text-violet-300 border border-violet-500/30";
  }
  if (["content", "publishing", "courses", "knowledge"].includes(key)) {
    return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
  }
  if (["operations", "overview", "insights", "config"].includes(key)) {
    return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
  }
  if (["revenue", "leads", "inbox", "calls"].includes(key)) {
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  }
  if (["api", "connectors", "catalog"].includes(key)) {
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }
  if (["encrypted", "family"].includes(key)) {
    return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
  }
  return "bg-muted/40 text-muted-foreground border border-border/60";
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "CORE",
    items: [
      { name: "Command Center", icon: LayoutDashboard, path: "/admin", badge: "Overview", color: "text-blue-500" },
      { name: "Business", icon: Building2, path: "/admin/business", badge: "Operations", color: "text-indigo-500" },
      { name: "IP Access Control", icon: Shield, path: "/admin/ip-management", badge: "Security", color: "text-red-500" },
      { name: "CV Downloads", icon: Download, path: "/admin/cv-downloads", badge: "Leads", color: "text-slate-400" },
      { name: "Contact Requests", icon: Inbox, path: "/admin/contacts", badge: "Inbox", color: "text-sky-500" },
      { name: "Mentorship", icon: Users, path: "/admin/mentorship", badge: "Calls", color: "text-emerald-400" },
    ],
  },
  {
    title: "CREATOR SUITE",
    items: [
      { name: "CMS Studio", icon: FileText, path: "/admin/blog", badge: "Content", color: "text-violet-500" },
      { name: "Nimbus Desk", icon: BookOpen, path: "/admin/nimbus", badge: "Knowledge", color: "text-indigo-500" },
      { name: "LMS Studio", icon: GraduationCap, path: "/admin/courses", badge: "Courses", color: "text-amber-500" },
      { name: "Digital Products", icon: Package, path: "/admin/products", badge: "Catalog", color: "text-cyan-500" },
      { name: "Ebook Studio", icon: BookOpen, path: "/admin/ebooks", badge: "Publishing", color: "text-emerald-400" },
    ],
  },
  {
    title: "AI & AUTOMATION",
    items: [
      { name: "LLM Galaxy", icon: Brain, path: "/admin/llm-galaxy", badge: "GALAXYCORE", color: "text-violet-500" },
      { name: "AETHERGRID", icon: Zap, path: "/admin/workflows", badge: "AI", color: "text-indigo-500" },
      { name: "OmniFlow Social", icon: Share2, path: "/admin/social", badge: null, color: "text-blue-600" },
      { name: "Chronos Scheduler", icon: Clock, path: "/admin/jobs", badge: null, color: "text-amber-500" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Observatory", icon: BarChart3, path: "/admin/analytics", badge: "Insights", color: "text-emerald-500" },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "FINCORE", icon: CreditCard, path: "/admin/payments", badge: "Revenue", color: "text-teal-500" },
    ],
  },
  {
    title: "PERSONAL OS",
    items: [
      { name: "Astra Vault", icon: HardDrive, path: "/admin/drive", badge: "Encrypted", color: "text-purple-500" },
      { name: "LifeMap", icon: Heart, path: "/admin/lifemap", badge: "Family", color: "text-pink-500" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Integrations Hub", icon: Link2, path: "/admin/integrations", badge: "Connectors", color: "text-blue-500" },
      { name: "Ops Docs", icon: Command, path: "/admin/ops", badge: "API", color: "text-slate-300" },
      { name: "Audit Logs", icon: Shield, path: "/admin/audit-logs", badge: "IP Track", color: "text-red-500" },
      { name: "Sentinel", icon: Shield, path: "/admin/security", badge: "Protection", color: "text-orange-500" },
      { name: "System Settings", icon: Settings, path: "/admin/settings", badge: "Config", color: "text-slate-500" },
    ],
  },
];

const isLocalhost = () => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const SIDEBAR_SCROLL_KEY_DESKTOP = "admin_sidebar_scroll_desktop";
  const SIDEBAR_SCROLL_KEY_MOBILE = "admin_sidebar_scroll_mobile";
  const CONTENT_SCROLL_KEY_PREFIX = "admin_content_scroll_";
  
  // Use database-backed settings
  
  // Register session for cross-device tracking
  const { 
    registerSession, 
    activeSessions, 
    hasOtherActiveSessions, 
    otherSessionDevice,
    killAllOtherSessions,
    killSession,
    refreshSessions 
  } = useActiveSession();

  // Session lock disabled for passkey-only flow


  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/admin/login');
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }

        // Enforce server-verified MFA session (admin_mfa_sessions).
        const getMfaOk = async () => {
          const { data: mfaRow, error: mfaErr } = await supabase
            .from('admin_mfa_sessions')
            .select('fully_verified_at, expires_at')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const expiresAt = mfaRow?.expires_at ? new Date(mfaRow.expires_at).getTime() : 0;
          const ok = !!mfaRow?.fully_verified_at && expiresAt > Date.now();
          return { ok, error: mfaErr };
        };

        let { ok, error: mfaErr } = await getMfaOk();
        if (!ok) {
          // Allow brief propagation delay after passkey verification
          const hasClientFlag = sessionStorage.getItem('admin_2fa_verified') === 'true';
          if (hasClientFlag) {
            for (let i = 0; i < 5 && !ok; i += 1) {
              await new Promise((r) => setTimeout(r, 400));
              ({ ok, error: mfaErr } = await getMfaOk());
            }
          }
        }
        if (mfaErr || !ok) {
          // Local development bypass: allow access only on localhost when
          // client-side verification flag is present.
          const hasClientFlag = sessionStorage.getItem('admin_2fa_verified') === 'true';
          const allowLocalhostBypass = isLocalhost() && hasClientFlag;
          if (allowLocalhostBypass) {
            setIsAuthenticated(true);
            registerSession();
            return;
          }
          navigate('/admin/login');
          return;
        }

        setIsAuthenticated(true);
        
        // Register this session for cross-device tracking
        registerSession();
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('admin_2fa_verified');
        sessionStorage.removeItem('admin_2fa_timestamp');
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, registerSession]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('admin_2fa_verified');
    sessionStorage.removeItem('admin_2fa_timestamp');
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/admin/login');
  };

  const isItemActive = (path: string) => {
    if (path === "/admin") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const desktopScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY_DESKTOP) || "0");
    if (desktopNavRef.current) desktopNavRef.current.scrollTop = desktopScroll;

    const mobileScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY_MOBILE) || "0");
    if (mobileNavRef.current) mobileNavRef.current.scrollTop = mobileScroll;
  }, [location.pathname, mobileMenuOpen, collapsed]);

  const handleSidebarScroll = (isMobile: boolean) => {
    const ref = isMobile ? mobileNavRef : desktopNavRef;
    if (!ref.current) return;
    sessionStorage.setItem(
      isMobile ? SIDEBAR_SCROLL_KEY_MOBILE : SIDEBAR_SCROLL_KEY_DESKTOP,
      String(ref.current.scrollTop),
    );
  };

  const persistSidebarScroll = (isMobile: boolean) => {
    const ref = isMobile ? mobileNavRef : desktopNavRef;
    if (!ref.current) return;
    sessionStorage.setItem(
      isMobile ? SIDEBAR_SCROLL_KEY_MOBILE : SIDEBAR_SCROLL_KEY_DESKTOP,
      String(ref.current.scrollTop),
    );
  };

  useEffect(() => {
    const key = `${CONTENT_SCROLL_KEY_PREFIX}${location.pathname}`;
    const saved = Number(sessionStorage.getItem(key) || "0");
    if (contentRef.current) {
      contentRef.current.scrollTop = saved;
    }
  }, [location.pathname]);

  const handleContentScroll = () => {
    if (!contentRef.current) return;
    const key = `${CONTENT_SCROLL_KEY_PREFIX}${location.pathname}`;
    sessionStorage.setItem(key, String(contentRef.current.scrollTop));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying access...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 overflow-hidden group">
            <Command className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm text-foreground flex items-center gap-1">
                Command Center
                <Sparkles className="w-3 h-3 text-violet-400" />
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CEO Dashboard</span>
            </motion.div>
          )}
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground hover:bg-violet-500/10"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        ref={(el) => {
          if (isMobile) {
            mobileNavRef.current = el;
          } else {
            desktopNavRef.current = el;
          }
        }}
        onScroll={() => handleSidebarScroll(isMobile)}
        className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50"
      >
        <div className="space-y-6 px-3">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              {(!collapsed || isMobile) && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isItemActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        // Persist current sidebar position before route transition.
                        persistSidebarScroll(isMobile);
                        if (isMobile) setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-transparent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {/* Active indicator glow */}
                      {isActive && (
                        <div 
                          className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-purple-500 shadow-lg shadow-violet-500/50" 
                        />
                      )}
                      <item.icon className={cn(
                        "w-5 h-5 shrink-0 transition-all duration-200",
                        isActive ? `${item.color} drop-shadow-[0_0_8px_currentColor]` : item.color,
                        "group-hover:scale-110"
                      )} />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className={cn(
                            "text-sm font-medium truncate flex-1",
                            isActive && "text-foreground"
                          )}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={cn(
                              "px-1.5 py-0.5 text-[9px] font-medium rounded",
                              getBadgeClassName(item.badge)
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/30">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && !isMobile && "justify-center"
        )}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/30">
            <span className="text-white font-bold text-sm">AP</span>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">Abhishek Panda</div>
              <div className="text-[10px] text-muted-foreground truncate">CEO & Founder • OriginX Labs</div>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground hover:bg-red-500/10 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <CommandPalette />
      <div
        className={cn(
          "h-screen overflow-hidden bg-background text-foreground flex w-full relative",
          collapsed ? "lg:pl-20" : "lg:pl-[280px]"
        )}
      >
        {/* Desktop Sidebar - ensure it's always clickable */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r border-border/30 bg-card/60 backdrop-blur-xl h-screen fixed left-0 top-0 shrink-0 transition-[width] duration-300 ease-in-out z-40 pointer-events-auto",
            collapsed ? "w-20" : "w-[280px]"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/30 flex items-center justify-between px-4 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Command Center</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/30 z-50 overflow-y-auto flex flex-col"
              >
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <SidebarContent isMobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex h-screen flex-col relative z-10">
          {/* Top Bar */}
          <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border/30 bg-card/30 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="w-80 h-9 justify-start pl-3 bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50 hover:border-violet-500/50 rounded-xl"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                  document.dispatchEvent(event);
                }}
              >
                <Search className="mr-2 w-4 h-4" />
                <span className="flex-1 text-left">Search modules, files, blog...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/30 bg-muted/30 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ActiveSessionIndicator
                activeSessions={activeSessions}
                onKillSession={killSession}
                onKillAllOtherSessions={killAllOtherSessions}
                onRefresh={refreshSessions}
              />
              
              <SecurityAlertPanel />
              <ThemeToggle />
              <AdminNotifications />
            </div>
          </header>

          {/* Page Content */}
          <div
            ref={contentRef}
            onScroll={handleContentScroll}
            className="flex-1 overflow-y-auto p-4 md:p-6 pt-20 lg:pt-6"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};
