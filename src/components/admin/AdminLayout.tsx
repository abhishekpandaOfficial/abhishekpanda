import { useState, useEffect } from "react";
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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNotifications } from "./AdminNotifications";
import { CommandPalette } from "./CommandPalette";
import { SecurityAlertPanel } from "./SecurityAlertPanel";
import { SessionLockOverlay } from "./SessionLockOverlay";
import { SessionLockSettings, addLockEvent } from "./SessionLockSettings";
import { useSessionLock } from "@/hooks/useSessionLock";
import { useBiometricSounds } from "@/hooks/useBiometricSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useAdminSettings } from "@/hooks/useAdminSettings";
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

const sidebarGroups: SidebarGroup[] = [
  {
    title: "CORE",
    items: [
      { name: "Command Center", icon: LayoutDashboard, path: "/admin", badge: null, color: "text-blue-500" },
      { name: "IP Access Control", icon: Shield, path: "/admin/ip-management", badge: "Security", color: "text-red-500" },
      { name: "CV Downloads", icon: Download, path: "/admin/cv-downloads", badge: null, color: "text-slate-400" },
      { name: "Contact Requests", icon: Inbox, path: "/admin/contacts", badge: null, color: "text-sky-500" },
    ],
  },
  {
    title: "CREATOR SUITE",
    items: [
      { name: "CMS Studio", icon: FileText, path: "/admin/blog", badge: null, color: "text-violet-500" },
      { name: "Nimbus Desk", icon: BookOpen, path: "/admin/nimbus", badge: null, color: "text-indigo-500" },
      { name: "LMS Studio", icon: GraduationCap, path: "/admin/courses", badge: null, color: "text-amber-500" },
      { name: "Digital Products", icon: Package, path: "/admin/products", badge: null, color: "text-cyan-500" },
    ],
  },
  {
    title: "AI & AUTOMATION",
    items: [
      { name: "LLM Atlas", icon: Brain, path: "/admin/llm-atlas", badge: "ATLASCORE", color: "text-violet-500" },
      { name: "AETHERGRID", icon: Zap, path: "/admin/workflows", badge: "AI", color: "text-indigo-500" },
      { name: "OmniFlow Social", icon: Share2, path: "/admin/social", badge: null, color: "text-blue-600" },
      { name: "Chronos Scheduler", icon: Clock, path: "/admin/jobs", badge: null, color: "text-amber-500" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Observatory", icon: BarChart3, path: "/admin/analytics", badge: null, color: "text-emerald-500" },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "FINCORE", icon: CreditCard, path: "/admin/payments", badge: null, color: "text-teal-500" },
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
      { name: "Integrations Hub", icon: Link2, path: "/admin/integrations", badge: null, color: "text-blue-500" },
      { name: "Ops Docs", icon: Command, path: "/admin/ops", badge: "API", color: "text-slate-300" },
      { name: "Audit Logs", icon: Shield, path: "/admin/audit-logs", badge: "IP Track", color: "text-red-500" },
      { name: "Sentinel", icon: Shield, path: "/admin/security", badge: null, color: "text-orange-500" },
      { name: "System Settings", icon: Settings, path: "/admin/settings", badge: null, color: "text-slate-500" },
    ],
  },
];

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requireBiometricOnLoad, setRequireBiometricOnLoad] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const sounds = useBiometricSounds();
  const haptic = useHapticFeedback();
  
  // Use database-backed settings
  const { 
    settings, 
    updateInactivityTimeout, 
    updateSoundEnabled, 
    updateHapticEnabled, 
    updateVolume 
  } = useAdminSettings();
  
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

  // Session lock for inactivity and tab switching
  const { isLocked, lockReason, lock, unlock } = useSessionLock({
    inactivityTimeout: settings.inactivityTimeout,
    enabled: isAuthenticated,
    lockOnLoad: requireBiometricOnLoad, // Lock on page refresh
    onLock: (reason) => {
      sounds.playLock();
      if (settings.hapticEnabled) haptic.triggerWarning();
      addLockEvent('lock', reason);
    },
    onUnlock: () => {
      sounds.playUnlock();
      if (settings.hapticEnabled) haptic.triggerSuccess();
      addLockEvent('unlock', 'biometric');
      setRequireBiometricOnLoad(false); // Don't lock again until next refresh
    },
  });

  // Handle timeout change - save to database
  const handleTimeoutChange = (timeout: number) => {
    updateInactivityTimeout(timeout);
  };

  const handleHapticToggle = (enabled: boolean) => {
    updateHapticEnabled(enabled);
  };

  const handleManualLock = () => {
    lock('manual');
    toast.info('Command Center locked');
  };

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

        // Check 2FA status
        const is2FAVerified = sessionStorage.getItem('admin_2fa_verified');
        const timestamp = sessionStorage.getItem('admin_2fa_timestamp');
        
        if (is2FAVerified !== 'true' || !timestamp) {
          navigate('/admin/login');
          return;
        }

        // Check if 2FA session is still valid (4 hours)
        const fourHours = 4 * 60 * 60 * 1000;
        const elapsed = Date.now() - parseInt(timestamp);
        if (elapsed >= fourHours) {
          sessionStorage.removeItem('admin_2fa_verified');
          sessionStorage.removeItem('admin_2fa_timestamp');
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
  }, [navigate]);

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
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50">
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
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-transparent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {/* Active indicator glow */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
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
                              item.badge === "AI" 
                                ? "bg-gradient-to-r from-violet-500/30 to-blue-500/30 text-violet-300 border border-violet-500/30"
                                : item.badge === "ATLASCORE"
                                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                : item.badge === "Encrypted"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
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

      {/* AETHERGRID Status */}
      {(!collapsed || isMobile) && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-blue-500/10 border border-violet-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">AETHERGRID</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              AI Engine Online • 3 active workflows
            </p>
          </div>
        </div>
      )}

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
              <div className="text-[10px] text-muted-foreground truncate">CEO & Founder • CropXon</div>
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
      {isLocked && (
        <SessionLockOverlay
          isLocked={isLocked}
          lockReason={lockReason}
          onUnlock={unlock}
        />
      )}
      
      <div className="min-h-screen bg-background text-foreground flex w-full relative">
        {/* Desktop Sidebar - ensure it's always clickable */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r border-border/30 bg-card/50 backdrop-blur-xl h-screen sticky top-0 shrink-0 transition-[width] duration-300 ease-in-out z-30 pointer-events-auto",
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
        <main className="flex-1 min-w-0 flex flex-col relative z-10">
          {/* Top Bar */}
          <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border/30 bg-card/30 backdrop-blur-xl sticky top-0 z-20">
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
              <SessionLockSettings
                inactivityTimeout={settings.inactivityTimeout}
                onTimeoutChange={handleTimeoutChange}
                soundEnabled={sounds.soundEnabled}
                onSoundToggle={updateSoundEnabled}
                hapticEnabled={settings.hapticEnabled}
                onHapticToggle={handleHapticToggle}
                volume={sounds.volume}
                onVolumeChange={updateVolume}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualLock}
                className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                title="Lock Command Center"
              >
                <Lock className="w-4 h-4" />
              </Button>
              <SecurityAlertPanel />
              <ThemeToggle />
              <AdminNotifications />
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-6 pt-20 lg:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};
