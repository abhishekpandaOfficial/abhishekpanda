import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Send,
  FolderOpen,
  ScrollText,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { PublicSearch } from "@/components/layout/PublicSearch";
import { PrefetchLink } from "@/components/PrefetchLink";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BIz1l1qK9lu1oZEIJOBmDS?mode=gi_t";

// Header nav links
const navLinks = [
  { name: "Contact", path: "/contact", icon: Send },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
              <div className="group-hover:scale-110 transition-transform duration-300">
                <AbhishekAnimatedLogo size="md" animate />
              </div>
            </PrefetchLink>

            {/* Desktop Navigation */}
            <nav className="hidden min-[1180px]:flex min-w-0 items-center justify-center gap-0 overflow-hidden flex-nowrap 2xl:gap-0.5">
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
                transition={{ delay: 0.16 }}
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
                transition={{ delay: 0.2 }}
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
