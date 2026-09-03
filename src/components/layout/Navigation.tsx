import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicSearch } from "@/components/layout/PublicSearch";
import { PrefetchLink } from "@/components/PrefetchLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import portfolioLogo from "@/assets/branding/abhishek-a-mark.png";

// Header nav links
const navLinks = [
  { name: "Blog", path: "/blog" },
  { name: "Books", path: "/books" },
  { name: "Insights", path: "/insights" },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      setIsScrolled(nextScrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const desktopNavItemClass = "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors";
  const mobileNavItemClass = "rounded-xl px-4 py-3 text-base font-semibold transition-colors";
  const navShellClass = "mx-auto w-full max-w-[1480px] px-4 md:px-8 xl:px-12";
  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn("fixed inset-x-0 top-0 z-50 border-b transition-all duration-300", isScrolled ? "border-border/70 bg-background/88 shadow-sm backdrop-blur-2xl" : "border-transparent bg-background/65 backdrop-blur-xl")}
      >
        <div className={navShellClass}>
          <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            {/* Logo */}
            <PrefetchLink
              to="/"
              className="group flex items-center gap-2.5 justify-self-start"
            >
              <div className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-blue-200/70 bg-white p-1 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.8)] dark:border-blue-400/20 dark:bg-slate-900">
                  <img
                    src={portfolioLogo}
                    alt="Abhishek Panda portfolio logo"
                    className="h-full w-full object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
              <span className="hidden text-sm font-black tracking-[-0.02em] text-foreground sm:block">Abhishek Panda</span>
            </PrefetchLink>

            {/* Desktop Navigation */}
            <nav className="hidden min-[900px]:flex min-w-0 items-center justify-center gap-1">
              {navLinks.map((link) => {
                const active = link.path === "/insights" ? isInsightsActive : location.pathname === link.path || (link.path === "/blog" && location.pathname.startsWith("/blog"));
                return (
                <PrefetchLink
                  key={link.path}
                  to={link.path}
                  className={cn(
                    desktopNavItemClass,
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.name}
                </PrefetchLink>
              );})}
            </nav>

            <div className="flex items-center justify-self-end gap-2">
              <PublicSearch />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 min-[900px]:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMobileMenuOpen}
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
            className="fixed inset-0 z-40 min-[900px]:hidden pt-16"
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

              {navLinks.map((link, index) => (
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
                    {link.name}
                  </Link>
                </motion.div>
              ))}

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
