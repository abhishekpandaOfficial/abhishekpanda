import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  GitCompare, 
  UserCircle,
  BookOpen,
  Send,
  FileText,
  Newspaper,
  Brain,
  GraduationCap,
  Lock,
  Code2,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Nav links in order: About, Courses, Ebooks, Contact
const navLinks = [
  { name: "About", path: "/about", icon: UserCircle },
  { name: "Courses", path: "/courses", icon: GraduationCap },
  { name: "Ebooks", path: "/ebooks", icon: BookOpen },
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
    location.pathname.startsWith("/tech") ||
    location.pathname === "/dotnet-mastery-toc";
  const isArticlesActive = location.pathname.startsWith("/articles");
  const isCoursesActive = location.pathname === "/courses" || location.pathname.startsWith("/courses/");
  const isEbooksActive = location.pathname === "/ebooks" || location.pathname.startsWith("/ebooks/");

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
          <div className="flex items-center justify-between h-16 md:h-20">
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
            <nav className="hidden lg:flex items-center gap-1">
              {/* About */}
              {navLinks.slice(0, 1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                  <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                  <span className="relative flex items-center gap-2">
                    <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    {link.name}
                  </span>
                </Link>
              ))}

              {/* Courses */}
              <Link
                to="/courses"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  isCoursesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Courses
                </span>
              </Link>

              {/* Ebooks */}
              <Link
                to="/ebooks"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  isEbooksActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Ebooks
                </span>
              </Link>

              <Link
                to="/articles"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  isArticlesActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <Newspaper className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Articles
                </span>
              </Link>

              <Link
                to="/blogs"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  isBlogActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Blogs
                </span>
              </Link>

              {/* Contact */}
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                    (link.path === "/ebooks" ? isEbooksActive : location.pathname === link.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                  <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                  <span className="relative flex items-center gap-2">
                    <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    {link.name}
                  </span>
                </Link>
              ))}

              {/* LLM Galaxy Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-transparent data-[state=open]:bg-transparent group",
                        isGalaxyActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                      <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                      <span className="relative flex items-center gap-2">
                        <Brain className="w-4 h-4 transition-transform group-hover:scale-110" />
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
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
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
            className="fixed inset-0 z-40 lg:hidden pt-20"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <nav className="relative container mx-auto px-4 py-8 flex flex-col gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
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
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                      location.pathname === link.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    isCoursesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <GraduationCap className="w-5 h-5" />
                  Courses
                </Link>
              </motion.div>

              {/* Ebooks */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
              >
                <Link
                  to="/ebooks"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    isEbooksActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <BookOpen className="w-5 h-5" />
                  Ebooks
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.14 }}
              >
                <Link
                  to="/articles"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    isArticlesActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Newspaper className="w-5 h-5" />
                  Articles
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link
                  to="/blogs"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    isBlogActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <FileText className="w-5 h-5" />
                  Blogs
                </Link>
              </motion.div>

              {/* Contact */}
              {navLinks.slice(3).map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 4) * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                      (link.path === "/ebooks" ? isEbooksActive : location.pathname === link.path)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
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
