import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Send,
  FolderOpen,
  ScrollText,
  MessageCircle,
  Map,
  ChevronDown,
  Sparkles,
  Brain,
  Cpu,
  Cloud,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicSearch } from "@/components/layout/PublicSearch";
import { PrefetchLink } from "@/components/PrefetchLink";
import { ThemeToggle } from "@/components/ThemeToggle";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BIz1l1qK9lu1oZEIJOBmDS?mode=gi_t";

// Header nav links
const navLinks = [
  { name: "Contact", path: "/contact", icon: Send },
];

const roadmapItems = [
  {
    name: "Machine Learning Zero to Hero",
    path: "/trackers/machine-learning-zero-to-hero",
    description: "Structured foundations for ML concepts, practice, and deployment",
    icon: Brain,
  },
  {
    name: "Deep Learning Zero to Hero",
    path: "/trackers/deep-learning-zero-to-hero",
    description: "Neural networks, CNNs, transformers, and modern deep learning paths",
    icon: Cpu,
  },
  {
    name: "NLP Zero to Hero",
    path: "/trackers/nlp-llm-rag-agents-mcp",
    description: "A complete roadmap for language AI, retrieval, agents, and MCP",
    icon: Sparkles,
  },
  {
    name: "LLM & Agentic AI",
    path: "/trackers/llm-agentic-ai",
    description: "Essential guidance for prompt design, reasoning, tools, and agents",
    icon: Sparkles,
  },
  {
    name: "Azure Principal Architect",
    path: "/trackers/azure-principal-architect",
    description: "Enterprise Azure architecture and solution design mastery tracker",
    icon: Cloud,
  },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoadmapsHovered, setIsRoadmapsHovered] = useState(false);
  const [isRoadmapsMobileOpen, setIsRoadmapsMobileOpen] = useState(false);
  const logoBasePath = import.meta.env.BASE_URL || "/";
  const primaryHeaderLogo = `${logoBasePath}panda-bamboo-trimmed.png`;
  const secondaryHeaderLogo = `${logoBasePath}pandalogo-transparent.png`;
  const tertiaryHeaderLogo = `${logoBasePath}panda.svg`;
  const quaternaryHeaderLogo = `${logoBasePath}Pandalogo.png`;
  const [headerLogoSrc, setHeaderLogoSrc] = useState(primaryHeaderLogo);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      setIsScrolled(nextScrollY > 20);
      if (isHomePage) {
        setScrollProgress(Math.min(nextScrollY / 180, 1));
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isInsightsActive =
    location.pathname.startsWith("/insights") ||
    location.pathname.startsWith("/articles") ||
    location.pathname.startsWith("/techhub") ||
    location.pathname.startsWith("/blog/techhub") ||
    location.pathname.startsWith("/blogs") ||
    location.pathname.startsWith("/cheatsheets") ||
    location.pathname.startsWith("/tech") ||
    location.pathname.startsWith("/ai-ml-hub") ||
    location.pathname.startsWith("/ai-ml-blogs") ||
    location.pathname === "/azure-mastery" ||
    location.pathname === "/angular-mastery" ||
    location.pathname === "/csharp-mastery" ||
    location.pathname === "/linq-mastery" ||
    location.pathname === "/microservices-mastery" ||
    location.pathname === "/kafka-mastery" ||
    location.pathname === "/blazor-mastery" ||
    location.pathname === "/efcore-mastery" ||
    location.pathname === "/dotnet-mastery" ||
    location.pathname === "/dotnet-mastery-toc" ||
    location.pathname === "/docker-mastery" ||
    location.pathname === "/design-patterns-guide" ||
    location.pathname === "/solid-principles-guide" ||
    location.pathname === "/blogs/solid-principles" ||
    location.pathname === "/cheatsheets/solid-principles";
  const isProjectsActive =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/llm-galaxy") ||
    location.pathname.startsWith("/scriptures") ||
    location.pathname.startsWith("/openowl") ||
    location.pathname.startsWith("/chronyx");
  const isTrackersActive = location.pathname.startsWith("/trackers/");
  const desktopNavItemClass =
    "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-medium transition-all duration-300 group xl:gap-2.5 xl:px-3 xl:py-2.5 xl:text-[13px] 2xl:rounded-xl 2xl:px-3.5 2xl:text-sm";
  const desktopNavIconClass = "h-4 w-4 shrink-0 transition-transform group-hover:scale-110 xl:h-[17px] xl:w-[17px] 2xl:h-[18px] 2xl:w-[18px]";
  const mobileNavItemClass = "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200";
  const mobileNavIconClass = "h-5 w-5 shrink-0";
  const landingHeaderHeight = 88 - scrollProgress * 20;
  const landingHeaderPadding = 24 - scrollProgress * 10;
  const landingHeaderRadius = 28 - scrollProgress * 12;
  const landingLogoScale = 1.06 - scrollProgress * 0.12;
  const landingShadow = `0 ${14 + scrollProgress * 18}px ${34 + scrollProgress * 26}px -${24 - scrollProgress * 8}px rgba(15,23,42,${0.08 + scrollProgress * 0.18})`;
  const landingBorderOpacity = 0.08 + scrollProgress * 0.16;
  const landingBackgroundOpacity = 0.38 + scrollProgress * 0.42;
  const navShellClass = "mx-auto w-full max-w-[1600px] px-4 md:px-6 xl:px-8";
  const handleHeaderLogoError = () => {
    setHeaderLogoSrc((prev) => {
      if (prev === primaryHeaderLogo) return secondaryHeaderLogo;
      if (prev === secondaryHeaderLogo) return tertiaryHeaderLogo;
      if (prev === tertiaryHeaderLogo) return quaternaryHeaderLogo;
      return prev;
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
        style={
          isHomePage
            ? {
                backgroundColor: `hsl(var(--background) / ${landingBackgroundOpacity})`,
                backdropFilter: `blur(${10 + scrollProgress * 14}px) saturate(${1 + scrollProgress * 0.22})`,
                borderBottomColor: `hsl(var(--border) / ${landingBorderOpacity})`,
                boxShadow: landingShadow,
              }
            : undefined
        }
      >
        <div
          className={navShellClass}
          style={
            isHomePage
              ? {
                  paddingTop: `${landingHeaderPadding}px`,
                  paddingBottom: `${Math.max(10, landingHeaderPadding - 6)}px`,
                }
              : undefined
          }
        >
          <div
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:gap-4"
            style={
              isHomePage
                ? {
                    minHeight: `${landingHeaderHeight}px`,
                    borderRadius: `${landingHeaderRadius}px`,
                    paddingInline: `${16 + (1 - scrollProgress) * 12}px`,
                    background: `linear-gradient(180deg, hsl(var(--background) / ${0.66 + scrollProgress * 0.18}), hsl(var(--background) / ${0.54 + scrollProgress * 0.26}))`,
                    border: `1px solid hsl(var(--border) / ${0.2 + scrollProgress * 0.14})`,
                    boxShadow: `inset 0 1px 0 hsl(var(--background) / 0.48), 0 12px 30px -24px rgba(15,23,42,${0.18 + scrollProgress * 0.1})`,
                  }
                : { height: "4rem" }
            }
          >
            {/* Logo */}
            <PrefetchLink
              to="/"
              className="flex items-center gap-2 group justify-self-start"
              style={isHomePage ? { transform: `scale(${landingLogoScale})`, transformOrigin: "left center" } : undefined}
            >
              <div className="relative transition-transform duration-300 group-hover:scale-110">
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0))] blur-md" />
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-sky-300/45 bg-gradient-to-br from-white/95 via-slate-100/95 to-sky-100/90 p-0.5 shadow-[0_16px_34px_-20px_rgba(34,211,238,0.7)] ring-1 ring-white/70 dark:border-sky-200/35 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-cyan-900/75 dark:ring-white/20 md:h-14 md:w-14">
                  <img
                    src={headerLogoSrc}
                    alt="Abhishek Panda panda logo"
                    className="h-full w-full scale-[1.12] object-contain brightness-[1.28] contrast-[1.34] saturate-[1.2] drop-shadow-[0_0_10px_rgba(125,211,252,0.55)]"
                    loading="eager"
                    decoding="async"
                    onError={handleHeaderLogoError}
                  />
                </div>
              </div>
            </PrefetchLink>

            {/* Desktop Navigation */}
            <nav className="hidden min-[1180px]:flex min-w-0 items-center justify-center gap-0 flex-nowrap 2xl:gap-0.5">
              {/* Contact */}
              {navLinks.slice(0, 1).map((link) => (
                <PrefetchLink
                  key={link.path}
                  to={link.path}
                  className={cn(
                    desktopNavItemClass,
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                  <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                  <span className="relative flex items-center gap-2">
                    <link.icon className={desktopNavIconClass} />
                    {link.name}
                  </span>
                </PrefetchLink>
              ))}

              {/* Roadmaps Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsRoadmapsHovered(true)}
                onMouseLeave={() => setIsRoadmapsHovered(false)}
              >
                <button
                  className={cn(
                    desktopNavItemClass,
                    "cursor-pointer border-none bg-transparent focus:outline-none",
                    isTrackersActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                  <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                  <span className="relative flex items-center gap-2">
                    <Map className={desktopNavIconClass} />
                    Trackers
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isRoadmapsHovered && "rotate-180")} />
                  </span>
                </button>
                <AnimatePresence>
                  {isRoadmapsHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-background/95 p-2.5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl z-[60]"
                    >
                      <div className="mb-2 flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Mastery trackers</p>
                          <p className="text-xs text-muted-foreground">Curated learning paths • open in a new tab</p>
                        </div>
                        <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                          5 available
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {roadmapItems.map((item) => (
                          <a
                            key={item.name}
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-3 rounded-xl border border-transparent bg-background/70 px-3 py-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.06] hover:shadow-sm"
                          >
                            <div className="mt-0.5 rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{item.name}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                              </div>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <PrefetchLink
                to="/insights"
                className={cn(
                  desktopNavItemClass,
                  isInsightsActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <ScrollText className={desktopNavIconClass} />
                  Insights
                </span>
              </PrefetchLink>

              <PrefetchLink
                to="/blog"
                className={cn(
                  desktopNavItemClass,
                  location.pathname.startsWith("/blog")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <BookOpen className={desktopNavIconClass} />
                  Blog
                </span>
              </PrefetchLink>

              <PrefetchLink
                to="/projects"
                className={cn(
                  desktopNavItemClass,
                  isProjectsActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <FolderOpen className={desktopNavIconClass} />
                  Projects
                </span>
              </PrefetchLink>

            </nav>

            <div className="flex items-center justify-self-end gap-2">
              <ThemeToggle />
              <PublicSearch />
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden h-10 items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 px-3 text-xs font-semibold text-white shadow-[0_16px_30px_-18px_rgba(16,185,129,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_20px_36px_-16px_rgba(20,184,166,0.95)] md:inline-flex"
              >
                <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Talk with me
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-[1180px]:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 min-[1180px]:hidden pt-20"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <nav className={cn(navShellClass, "relative flex max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-y-auto py-8")}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 }}
              >
                <PublicSearch mobile />
              </motion.div>

              {/* Contact */}
              {navLinks.slice(0, 1).map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      mobileNavItemClass,
                      location.pathname === link.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className={mobileNavIconClass} />
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-col"
              >
                <button
                  onClick={() => setIsRoadmapsMobileOpen(!isRoadmapsMobileOpen)}
                  className={cn(
                    mobileNavItemClass,
                    "w-full flex items-center justify-between",
                    isTrackersActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3.5">
                    <Map className={mobileNavIconClass} />
                    Trackers
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isRoadmapsMobileOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isRoadmapsMobileOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 ml-[26px] flex flex-col gap-2 overflow-hidden border-l border-border/45 pl-4 pr-2"
                    >
                      <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        Open any tracker in a new tab
                      </div>
                      {roadmapItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/70 px-3 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/[0.06] hover:text-foreground"
                        >
                          <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="flex-1">{item.name}</span>
                          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16 }}
              >
                <Link
                  to="/blog"
                  className={cn(
                    mobileNavItemClass,
                    location.pathname.startsWith("/blog")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <BookOpen className={mobileNavIconClass} />
                  Blog
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
              >
                <Link
                  to="/projects"
                  className={cn(
                    mobileNavItemClass,
                    isProjectsActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <FolderOpen className={mobileNavIconClass} />
                  Projects
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(mobileNavItemClass, "text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400")}
                >
                  <MessageCircle className={mobileNavIconClass} />
                  Talk with me
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 }}
              >
                <Link
                  to="/insights"
                  className={cn(
                    mobileNavItemClass,
                    isInsightsActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <ScrollText className={mobileNavIconClass} />
                  Insights
                </Link>
              </motion.div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
