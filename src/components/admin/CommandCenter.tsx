import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Brain,
  Globe,
  MessageSquare,
  Rocket,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminOnboardingWizard } from "./AdminOnboardingWizard";
import { AdminLoginAuditStream } from "./AdminLoginAuditStream";
import { commandCenterModules } from "./adminNavigation";
import {
  DashboardHero,
  EmptyModulesState,
  ModulesGrid,
  QuickActions,
  StatCard,
} from "./command-center/sections";

const COMMAND_CENTER_SESSION_KEY = "admin_command_center_session_seen";
const COMMAND_CENTER_LAST_SEEN_KEY = "admin_command_center_last_seen_at";
const COMMAND_CENTER_WELCOME_WINDOW_MS = 24 * 60 * 60 * 1000;

const quickActions = [
  {
    title: "Review contacts",
    description: "Handle inbound messages and follow-up tasks from the main inbox.",
    path: "/admin/contacts",
    icon: MessageSquare,
  },
  {
    title: "Check analytics",
    description: "Open live traffic and behavior trends in Observatory.",
    path: "/admin/analytics",
    icon: Activity,
  },
  {
    title: "Publish ebooks",
    description: "Continue editing or shipping reading assets and releases.",
    path: "/admin/ebooks",
    icon: BookOpen,
  },
  {
    title: "Security review",
    description: "Inspect sessions, passkeys, and protection posture.",
    path: "/admin/security",
    icon: Shield,
  },
];

export const CommandCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [stats, setStats] = useState({
    todayTraffic: 0,
    scheduledPosts: 0,
    totalContacts: 0,
  });

  useEffect(() => {
    const sessionSeen = sessionStorage.getItem(COMMAND_CENTER_SESSION_KEY) === "true";
    if (sessionSeen) return;

    sessionStorage.setItem(COMMAND_CENTER_SESSION_KEY, "true");

    const onboardingComplete = localStorage.getItem("admin_onboarding_complete");
    const hasPasskey = localStorage.getItem("admin_passkey_registered");
    const now = Date.now();
    const lastSeenAt = Number(localStorage.getItem(COMMAND_CENTER_LAST_SEEN_KEY) || "0");
    const seenRecently = Number.isFinite(lastSeenAt) && lastSeenAt > 0 && now - lastSeenAt < COMMAND_CENTER_WELCOME_WINDOW_MS;

    localStorage.setItem(COMMAND_CENTER_LAST_SEEN_KEY, String(now));

    if (seenRecently) {
      const timer = window.setTimeout(() => setShowWelcomeBack(true), 250);
      return () => window.clearTimeout(timer);
    }

    if (!onboardingComplete && !hasPasskey) {
      const timer = window.setTimeout(() => setShowOnboarding(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        { count: todayTrafficCount, error: trafficError },
        { count: scheduledPostsCount, error: jobsError },
        { count: totalContactsCount, error: contactsError },
      ] = await Promise.all([
        supabase
          .from("page_views")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfToday.toISOString()),
        supabase
          .from("scheduled_jobs")
          .select("*", { count: "exact", head: true })
          .eq("job_type", "social_post"),
        supabase
          .from("contact_requests")
          .select("*", { count: "exact", head: true }),
      ]);

      if (trafficError || jobsError || contactsError) {
        console.error("Failed to load command center stats", {
          trafficError,
          jobsError,
          contactsError,
        });
        return;
      }

      setStats({
        todayTraffic: todayTrafficCount ?? 0,
        scheduledPosts: scheduledPostsCount ?? 0,
        totalContacts: totalContactsCount ?? 0,
      });
    };

    fetchStats();
  }, []);

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return commandCenterModules;

    return commandCenterModules.filter((module) => {
      return module.name.toLowerCase().includes(query) || module.description.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const featuredModules = filteredModules.filter((module) => module.importance === "high");
  const supportModules = filteredModules.filter((module) => module.importance !== "high");

  return (
    <>
      <AdminOnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />

      <AnimatePresence>
        {showWelcomeBack && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
              onClick={() => setShowWelcomeBack(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="fixed left-1/2 top-24 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setShowWelcomeBack(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-[22px] bg-sky-400/25 blur-xl dark:bg-sky-300/10" />
                  <img
                    src="/abhishek.png"
                    alt="Abhishek Panda"
                    className="relative h-14 w-14 rounded-[18px] border border-white/40 object-cover shadow-xl ring-1 ring-slate-950/5 dark:border-white/10 dark:ring-white/10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Command Center</div>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">Welcome back, Abhishek</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your admin session is ready. The dashboard has been trimmed down to the modules you still use.
                  </p>
                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => setShowWelcomeBack(false)} className="rounded-xl">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!localStorage.getItem("admin_passkey_registered") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">Complete passkey setup</p>
                <p className="text-sm text-amber-700/80 dark:text-amber-300/80">Finish device enrollment for faster, safer admin access.</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowOnboarding(true)} className="rounded-xl bg-amber-500 text-black hover:bg-amber-400">
              Start setup
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        <DashboardHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Traffic"
            value={stats.todayTraffic}
            note="Visits recorded since midnight"
            icon={Activity}
            path="/admin/analytics"
            tone="bg-gradient-to-br from-sky-500 to-cyan-600"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduledPosts}
            note="Social posts waiting to run"
            icon={Sparkles}
            path="/admin/social"
            tone="bg-gradient-to-br from-fuchsia-500 to-rose-600"
          />
          <StatCard
            title="Contacts"
            value={stats.totalContacts}
            note="Inbox requests currently stored"
            icon={MessageSquare}
            path="/admin/contacts"
            tone="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Security"
            value="Live"
            note="Sessions and passkeys are available in Sentinel"
            icon={Shield}
            path="/admin/security"
            tone="bg-gradient-to-br from-orange-500 to-rose-600"
          />
        </section>

        <QuickActions actions={quickActions} />

        {filteredModules.length === 0 ? (
          <EmptyModulesState />
        ) : (
          <>
            <ModulesGrid
              title="Priority modules"
              description="The core areas that drive the current admin workflow."
              modules={featuredModules}
            />
            {supportModules.length > 0 && (
              <ModulesGrid
                title="Support modules"
                description="Secondary tools that still belong in the streamlined command center."
                modules={supportModules}
              />
            )}
          </>
        )}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <div className="rounded-3xl border border-border/50 bg-card/85 p-6 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.35)]">
            <h2 className="text-xl font-semibold text-foreground">System focus</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Publishing, web operations, and security remain first-class. Retired admin modules have been removed from the primary flow.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Brain className="h-4 w-4 text-fuchsia-500" />
                  Research and AI
                </div>
                <p className="mt-2 text-sm text-muted-foreground">LLM Galaxy, Argus VIII, and OmniFlow stay grouped for faster navigation.</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Globe className="h-4 w-4 text-sky-500" />
                  Web operations
                </div>
                <p className="mt-2 text-sm text-muted-foreground">WebVault, analytics, and integrations remain close to the dashboard entry point.</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  Publishing
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Courses and ebooks now sit in a single publishing lane instead of a crowded creator suite.</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Settings className="h-4 w-4 text-amber-500" />
                  System control
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Security and settings stay visible without pulling focus from everyday actions.</p>
              </div>
            </div>
          </div>

          <AdminLoginAuditStream title="Access activity" previewCount={3} collapsible />
        </section>
      </div>
    </>
  );
};

export default CommandCenter;
