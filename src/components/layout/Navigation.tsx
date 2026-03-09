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
  GraduationCap,
  Lock,
  Code2,
  Cpu,
  FolderOpen,
  Target,
  BookOpenText,
  Shield,
  ScrollText,
  BriefcaseBusiness
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { HeaderGlobe } from "@/components/layout/HeaderGlobe";
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
    location.pathname.startsWith("/blog") ||
    location.pathname.startsWith("/blogs") ||
    location.pathname.startsWith("/cheatsheets") ||
    location.pathname.startsWith("/tech") ||
    location.pathname === "/csharp-mastery" ||
    location.pathname === "/efcore-mastery" ||
    location.pathname === "/dotnet-mastery" ||
    location.pathname === "/dotnet-mastery-toc" ||
    location.pathname === "/design-patterns-guide" ||
    location.pathname === "/solid-principles-guide" ||
    location.pathname === "/blogs/solid-principles" ||
    location.pathname === "/cheatsheets/solid-principles";
  const isArticlesActive = location.pathname.startsWith("/articles");
  const isScripturesActive = location.pathname.startsWith("/scriptures");
  const isCoursesActive = location.pathname === "/courses" || location.pathname.startsWith("/courses/");
  const isCaseStudiesActive = location.pathname.startsWith("/case-studies");
  const isInterviewActive = location.pathname.startsWith("/interview");
  const isProjectsActive = location.pathname.startsWith("/projects");
  const isClassifiedActive = location.pathname.startsWith("/classified");
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
          <div className="flex items-center justify-between h-16 md:h-[4.5rem] 2xl:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="group-hover:scale-110 transition-transform duration-300">
                <AbhishekAnimatedLogo size="md" animate />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                <span className="text-foreground">abhishek</span>
                <span className="gradient-text">panda</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-0 flex-nowrap 2xl:gap-0.5">
              {/* About */}
              {navLinks.slice(0, 1).map((link) => (
                <Link
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
                </Link>
              ))}

              {/* Courses */}
              <Link
                to="/courses"
                className={cn(
                  desktopNavItemClass,
                  isCoursesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <GraduationCap className={desktopNavIconClass} />
                  Courses
                </span>
              </Link>

              <Link
                to="/cheatsheets"
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
                  Cheatsheets
                </span>
              </Link>

              <Link
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
              </Link>

              <Link
                to="/case-studies"
                className={cn(
                  desktopNavItemClass,
                  isCaseStudiesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <BriefcaseBusiness className={desktopNavIconClass} />
                  Case Studies
                </span>
              </Link>

              <Link
                to="/interview"
                className={cn(
                  desktopNavItemClass,
                  isInterviewActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <Target className={desktopNavIconClass} />
                  Interview
                </span>
              </Link>

              <Link
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
              </Link>

              <Link
                to="/classified"
                className={cn(
                  desktopNavItemClass,
                  "hidden min-[1480px]:flex",
                  isClassifiedActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <Shield className={desktopNavIconClass} />
                  Classified
                </span>
              </Link>

              {/* Contact */}
              {navLinks.slice(1).map((link) => (
                <Link
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
                </Link>
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
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              reloadDocument={subLink.reloadDocument}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <subLink.icon className="w-5 h-5 text-primary" />
                              <div className="font-medium text-foreground text-sm">{subLink.name}</div>
                            </Link>
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

            <div className="flex items-center gap-2">
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
              <Link
                to="/classified"
                className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-xl transition hover:border-primary/35 hover:bg-card"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Global View</div>
                  <div className="text-xs text-muted-foreground">Open ARGUS VIII classified preview</div>
                </div>
                <HeaderGlobe compact />
              </Link>

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

              {/* Courses */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  to="/courses"
                  className={cn(
                    mobileNavItemClass,
                    isCoursesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <GraduationCap className={mobileNavIconClass} />
                  Courses
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
              >
                <Link
                  to="/cheatsheets"
                  className={cn(
                    mobileNavItemClass,
                    isBlogActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <ScrollText className={mobileNavIconClass} />
                  Cheatsheets
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
                transition={{ delay: 0.14 }}
              >
                <Link
                  to="/case-studies"
                  className={cn(
                    mobileNavItemClass,
                    isCaseStudiesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <BriefcaseBusiness className={mobileNavIconClass} />
                  Case Studies
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16 }}
              >
                <Link
                  to="/classified"
                  className={cn(
                    mobileNavItemClass,
                    isClassifiedActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Shield className={mobileNavIconClass} />
                  Classified
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link
                  to="/interview"
                  className={cn(
                    mobileNavItemClass,
                    isInterviewActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Target className={mobileNavIconClass} />
                  Interview
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
