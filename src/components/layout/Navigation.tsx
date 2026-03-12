import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  GitCompare, 
  UserCircle,
  Send,
  FileText,
  Newspaper,
  Brain,
  Lock,
  Code2,
  Cpu,
  FolderOpen,
  BookOpenText,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { HeaderGlobe } from "@/components/layout/HeaderGlobe";
import { PublicSearch } from "@/components/layout/PublicSearch";
import { PrefetchLink } from "@/components/PrefetchLink";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Nav links in order: About, Contact
const navLinks = [
  { name: "About", path: "/about", icon: UserCircle },
  { name: "Contact", path: "/contact", icon: Send },
];

const galaxySubLinks = [
  { name: "Closed Source Models", path: "/llm-galaxy/closed-source-models", icon: Lock },
  { name: "Open Source Models", path: "/llm-galaxy/open-source-models", icon: Code2 },
  { name: "Compare LLM Models", path: "/llm-galaxy/model-comparison", icon: GitCompare },
  { name: "LLM Visualizer", path: "/llm-visualizer", icon: Cpu },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isGalaxyActive = location.pathname.startsWith("/llm-galaxy") || location.pathname === "/llm-visualizer";
  const isBlogActive =
    location.pathname.startsWith("/blogs") ||
    location.pathname.startsWith("/cheatsheets") ||
    location.pathname.startsWith("/tech") ||
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
    location.pathname === "/design-patterns-guide" ||
    location.pathname === "/solid-principles-guide" ||
    location.pathname === "/blogs/solid-principles" ||
    location.pathname === "/cheatsheets/solid-principles";
  const isAiMlBlogsActive =
    location.pathname.startsWith("/ai-ml-blogs");
  const isArticlesActive = location.pathname.startsWith("/articles");
  const isScripturesActive = location.pathname.startsWith("/scriptures");
  const isProjectsActive = location.pathname.startsWith("/projects");
  const desktopNavItemClass =
    "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-medium transition-all duration-300 group xl:gap-2.5 xl:px-3 xl:py-2.5 xl:text-[13px] 2xl:rounded-xl 2xl:px-3.5 2xl:text-sm";
  const desktopNavIconClass = "h-4 w-4 shrink-0 transition-transform group-hover:scale-110 xl:h-[17px] xl:w-[17px] 2xl:h-[18px] 2xl:w-[18px]";
  const mobileNavItemClass = "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200";
  const mobileNavIconClass = "h-5 w-5 shrink-0";

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
      >
        <div className="container mx-auto px-4">
          <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:h-[4.5rem] 2xl:h-20">
            {/* Logo */}
            <PrefetchLink to="/" className="flex items-center gap-2 group justify-self-start">
              <div className="group-hover:scale-110 transition-transform duration-300">
                <AbhishekAnimatedLogo size="md" animate />
              </div>
            </PrefetchLink>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center justify-center gap-0 flex-nowrap 2xl:gap-0.5">
              {/* About */}
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
                to="/blogs"
                className={cn(
                  desktopNavItemClass,
                  isBlogActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <ScrollText className={desktopNavIconClass} />
                  Blogs
                </span>
              </PrefetchLink>

              <PrefetchLink
                to="/ai-ml-blogs"
                className={cn(
                  desktopNavItemClass,
                  isAiMlBlogsActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <Brain className={desktopNavIconClass} />
                  AI/ML Blogs
                </span>
              </PrefetchLink>

              <PrefetchLink
                to="/articles"
                className={cn(
                  desktopNavItemClass,
                  isArticlesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <Newspaper className={desktopNavIconClass} />
                  Articles
                </span>
              </PrefetchLink>

              <PrefetchLink
                to="/projects"
                className={cn(
                  desktopNavItemClass,
                  "hidden min-[1380px]:flex",
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

              {/* Contact */}
              {navLinks.slice(1).map((link) => (
                <PrefetchLink
                  key={link.path}
                  to={link.path}
                  className={cn(
                    desktopNavItemClass,
                    "hidden min-[1680px]:flex",
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

              {/* LLM Galaxy Dropdown */}
              <div className="hidden min-[1560px]:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        "relative whitespace-nowrap rounded-xl bg-transparent px-3.5 py-2.5 text-sm font-medium transition-all duration-300 group data-[state=open]:bg-transparent",
                        isGalaxyActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                      <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                      <span className="relative flex items-center gap-2">
                        <Brain className={desktopNavIconClass} />
                        LLM Galaxy
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl">
                        <div className="space-y-1">
                          {galaxySubLinks.map((subLink) => (
                            <PrefetchLink
                              key={subLink.path}
                              to={subLink.path}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <subLink.icon className="w-5 h-5 text-primary" />
                              <div className="font-medium text-foreground text-sm">{subLink.name}</div>
                            </PrefetchLink>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              </div>

              <Link
                to="/scriptures"
                className={cn(
                  desktopNavItemClass,
                  "hidden min-[1620px]:flex",
                  isScripturesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <BookOpenText className={desktopNavIconClass} />
                  Scriptures
                </span>
              </Link>
            </nav>

            <div className="flex items-center justify-self-end gap-2">
              <PublicSearch />
              <HeaderGlobe className="hidden sm:flex" compact />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-[1680px]:hidden"
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
            className="fixed inset-0 z-40 min-[1680px]:hidden pt-20"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <nav className="relative container mx-auto px-4 py-8 flex flex-col gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 }}
              >
                <PublicSearch mobile />
              </motion.div>

              {/* About */}
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
                  to="/blogs"
                  className={cn(
                    mobileNavItemClass,
                    isBlogActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <ScrollText className={mobileNavIconClass} />
                  Blogs
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.127 }}
              >
                <Link
                  to="/ai-ml-blogs"
                  className={cn(
                    mobileNavItemClass,
                    isAiMlBlogsActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Brain className={mobileNavIconClass} />
                  AI/ML Blogs
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.135 }}
              >
                <Link
                  to="/articles"
                  className={cn(
                    mobileNavItemClass,
                    isArticlesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Newspaper className={mobileNavIconClass} />
                  Articles
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.31 }}
              >
                <Link
                  to="/scriptures"
                  className={cn(
                    mobileNavItemClass,
                    isScripturesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <BookOpenText className={mobileNavIconClass} />
                  Scriptures
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16 }}
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

              {/* Contact */}
              {navLinks.slice(1).map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.05 }}
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
              
              {/* LLM Galaxy Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="px-4 py-2"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Brain className="w-3 h-3" />
                  LLM Galaxy
                </div>
                {galaxySubLinks.map((subLink) => (
                  <Link
                    key={subLink.path}
                    to={subLink.path}
                    reloadDocument={subLink.reloadDocument}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200",
                      location.pathname === subLink.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <subLink.icon className="w-4 h-4" />
                    {subLink.name}
                  </Link>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/llm-galaxy">
                    <Brain className="w-5 h-5" />
                    Explore LLM Galaxy
                  </Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
