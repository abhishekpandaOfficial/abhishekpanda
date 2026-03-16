import { useState, useEffect, useMemo, useRef } from "react";
import { ActiveSessionIndicator } from "./ActiveSessionIndicator";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Menu,
  X,
  Sparkles,
  Command,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNotifications } from "./AdminNotifications";
import { CommandPalette } from "./CommandPalette";
import { SecurityAlertPanel } from "./SecurityAlertPanel";
import { useActiveSession } from "@/hooks/useActiveSession";
import { useDesktopAppUpdates } from "@/hooks/useDesktopAppUpdates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adminSidebarGroups } from "./adminNavigation";
import { AdminDesktopHandoff } from "./AdminDesktopHandoff";
import {
  clearBrowserAdminWorkspace,
  enableBrowserAdminWorkspace,
  hasBrowserAdminWorkspaceEnabled,
  isBrowserLocalhostDevelopment,
  isDesktopAdminRuntime,
} from "@/lib/adminRuntime";

const getBadgeClassName = (badge: string) => {
  const key = badge.toLowerCase();
  if (["security", "ip track", "protection"].includes(key)) {
    return "bg-red-500/10 text-red-700 border border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30";
  }
  if (["ai", "galaxycore", "automation"].includes(key)) {
    return "bg-violet-500/10 text-violet-700 border border-violet-500/25 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30";
  }
  if (["content", "publishing", "courses", "knowledge"].includes(key)) {
    return "bg-indigo-500/10 text-indigo-700 border border-indigo-500/25 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30";
  }
  if (["operations", "overview", "insights", "config", "surveillance"].includes(key)) {
    return "bg-sky-500/10 text-sky-700 border border-sky-500/25 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30";
  }
  if (["revenue", "leads", "inbox", "calls"].includes(key)) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
  }
  if (["api", "connectors", "catalog"].includes(key)) {
    return "bg-amber-500/10 text-amber-700 border border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
  }
  if (["encrypted", "family"].includes(key)) {
    return "bg-purple-500/10 text-purple-700 border border-purple-500/25 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30";
  }
  return "bg-muted/40 text-muted-foreground border border-border/60";
};

const COMMAND_CENTER_SESSION_KEY = "admin_command_center_session_seen";
const ADMIN_ACCESS_CACHE_KEY = "admin_access_verified_until";
const ADMIN_ACCESS_CACHE_TTL_MS = 5 * 60 * 1000;

export const AdminLayout = () => {
  const desktopRuntime = useMemo(() => isDesktopAdminRuntime(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [browserWorkspaceEnabled, setBrowserWorkspaceEnabled] = useState(() => desktopRuntime || hasBrowserAdminWorkspaceEnabled());
  const desktopUpdates = useDesktopAppUpdates();
  
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
      const failAuth = async (shouldSignOut = false) => {
        sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
        if (shouldSignOut) {
          await supabase.auth.signOut();
        }
        navigate('/admin/login');
      };

      const validateAccess = async (userId: string, allowRetry: boolean) => {
        const rolePromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();

        const readMfaSession = () =>
          supabase
            .from('admin_mfa_sessions')
            .select('fully_verified_at, expires_at')
            .eq('user_id', userId)
            .maybeSingle();

        const [{ data: roleData, error: roleError }, mfaResult] = await Promise.all([
          rolePromise,
          readMfaSession(),
        ]);

        if (roleError || !roleData) {
          return { ok: false, shouldSignOut: true };
        }

        const isMfaValid = (row: { fully_verified_at?: string | null; expires_at?: string | null } | null) => {
          const expiresAt = row?.expires_at ? new Date(row.expires_at).getTime() : 0;
          return !!row?.fully_verified_at && expiresAt > Date.now();
        };

        if (isMfaValid(mfaResult.data ?? null)) {
          return { ok: true, shouldSignOut: false };
        }

        if (!allowRetry) {
          return { ok: false, shouldSignOut: false };
        }

        for (let attempt = 0; attempt < 2; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const retryResult = await readMfaSession();
          if (isMfaValid(retryResult.data ?? null)) {
            return { ok: true, shouldSignOut: false };
          }
        }

        return { ok: false, shouldSignOut: false };
      };

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          await failAuth(false);
          return;
        }

        const hasClientFlag = sessionStorage.getItem('admin_2fa_verified') === 'true';
        const cachedUntil = Number(sessionStorage.getItem(ADMIN_ACCESS_CACHE_KEY) || "0");
        const cacheStillValid = cachedUntil > Date.now();

        if (hasClientFlag && cacheStillValid) {
          setIsAuthenticated(true);
          setIsLoading(false);
          registerSession();

          const validation = await validateAccess(session.user.id, false);
          if (!validation.ok) {
            await failAuth(validation.shouldSignOut);
          }
          return;
        }

        const validation = await validateAccess(session.user.id, hasClientFlag);
        if (!validation.ok) {
          const allowLocalhostBypass = isBrowserLocalhostDevelopment() && hasClientFlag;
          if (allowLocalhostBypass) {
            setIsAuthenticated(true);
            sessionStorage.setItem(ADMIN_ACCESS_CACHE_KEY, String(Date.now() + ADMIN_ACCESS_CACHE_TTL_MS));
            registerSession();
            return;
          }
          await failAuth(validation.shouldSignOut);
          return;
        }

        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_ACCESS_CACHE_KEY, String(Date.now() + ADMIN_ACCESS_CACHE_TTL_MS));
        
        // Register this session for cross-device tracking
        registerSession();
      } catch (error) {
        console.error('Auth check failed:', error);
        await failAuth(false);
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
        sessionStorage.removeItem(COMMAND_CENTER_SESSION_KEY);
        sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, registerSession]);

  const handleSignOut = async () => {
    clearBrowserAdminWorkspace();
    sessionStorage.removeItem('admin_2fa_verified');
    sessionStorage.removeItem('admin_2fa_timestamp');
    sessionStorage.removeItem(COMMAND_CENTER_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/admin/login');
  };

  const isItemActive = (path: string) => {
    if (path === "/admin") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (desktopRuntime) {
      setBrowserWorkspaceEnabled(true);
      return;
    }

    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "web") {
      enableBrowserAdminWorkspace();
      setBrowserWorkspaceEnabled(true);
      return;
    }

    setBrowserWorkspaceEnabled(hasBrowserAdminWorkspaceEnabled());
  }, [desktopRuntime, location.search]);

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

  if (!desktopRuntime && !browserWorkspaceEnabled) {
    return (
      <AdminDesktopHandoff
        onContinueInBrowser={() => {
          enableBrowserAdminWorkspace();
          setBrowserWorkspaceEnabled(true);
        }}
      />
    );
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border/40 px-3.5">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="admin-logo-surface group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Command className="h-4.5 w-4.5 text-white transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                Command Center
                <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Admin Console</span>
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
        className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50"
      >
        <div className="space-y-5 px-2.5">
          {adminSidebarGroups.map((group) => (
            <div key={group.title}>
              {(!collapsed || isMobile) && (
                <div className="mb-2 px-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
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
                        "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/18 via-primary/8 to-transparent text-foreground"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      {/* Active indicator glow */}
                      {isActive && (
                        <div 
                          className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-purple-500 shadow-lg shadow-violet-500/50" 
                        />
                      )}
                      <item.icon className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                        isActive ? `${item.color} drop-shadow-[0_0_6px_currentColor]` : item.color,
                        "group-hover:scale-110"
                      )} />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className={cn(
                            "flex-1 truncate text-[13px] font-medium",
                            isActive && "text-foreground"
                          )}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-medium tracking-[0.08em]",
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
      <div className="border-t border-border/40 p-3">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && !isMobile && "justify-center"
        )}>
          <div className="admin-logo-surface relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-sm">AP</span>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">Abhishek Panda</div>
              <div className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Admin Operator</div>
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
          "admin-shell relative flex h-screen w-full overflow-hidden bg-background text-foreground",
          desktopRuntime &&
            "bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.16),transparent_22%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.98))] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.16),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]"
        )}
      >
        {desktopRuntime ? (
          <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
        ) : null}

        {/* Desktop Sidebar - ensure it's always clickable */}
        <aside
          className={cn(
            "pointer-events-auto fixed left-0 top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-border/40 bg-card/75 backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex",
            desktopRuntime && "bg-card/70 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]",
            collapsed ? "w-[76px]" : "w-[248px]"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-card/85 px-4 backdrop-blur-xl lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="admin-logo-surface flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Command Center</span>
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
                className="fixed bottom-0 left-0 top-0 z-50 flex w-[290px] flex-col overflow-y-auto border-r border-border/40 bg-card lg:hidden"
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
          <header
            className={cn(
              "z-20 hidden h-14 items-center justify-between border-b border-border/40 bg-card/45 px-4 backdrop-blur-xl lg:flex",
              desktopRuntime && "bg-card/55 supports-[backdrop-filter]:bg-card/45"
            )}
          >
            <div className="flex items-center gap-4">
              {desktopRuntime ? (
                <div className="flex items-center gap-2 pr-1">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                </div>
              ) : null}
              <Button
                variant="outline"
                className="h-9 w-[320px] justify-start rounded-xl border-border/40 bg-muted/30 pl-3 text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
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
            <div className="flex items-center gap-1.5">
              {desktopRuntime ? (
                <>
                  <div className="mr-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    Desktop Session
                  </div>
                  <button
                    type="button"
                    onClick={desktopUpdates.openDownload}
                    className={cn(
                      "mr-2 inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition",
                      desktopUpdates.hasUpdate
                        ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15 dark:text-cyan-300"
                        : "border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted/60"
                    )}
                    title={
                      desktopUpdates.hasUpdate && desktopUpdates.latestVersion
                        ? `Update ${desktopUpdates.latestVersion} is available`
                        : `Desktop app ${desktopUpdates.currentVersion}`
                    }
                  >
                    {desktopUpdates.hasUpdate && desktopUpdates.latestVersion
                      ? `Update ${desktopUpdates.latestVersion}`
                      : desktopUpdates.isChecking
                        ? "Checking Updates"
                        : `v${desktopUpdates.currentVersion}`}
                  </button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearBrowserAdminWorkspace();
                    setBrowserWorkspaceEnabled(false);
                  }}
                  className="mr-2 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  Desktop Mode
                </Button>
              )}
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
            className="flex-1 overflow-y-auto p-3 pt-16 md:p-4 md:pt-16 lg:p-5 lg:pt-5"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};
