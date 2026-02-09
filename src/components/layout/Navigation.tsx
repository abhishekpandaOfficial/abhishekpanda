import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Sparkles, 
  BarChart3, 
  GitCompare, 
  Layers, 
  TrendingUp, 
  Rss, 
  Pen,
  Compass,
  UserCircle,
  BookOpen,
  MessageCircle,
  Send,
  BrainCircuit,
  FileText,
  Brain,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BurningLogo } from "@/components/ui/BurningLogo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Nav links in order: Home, About, Academy, Blog, Mentorship, Contact
const navLinks = [
  { name: "Home", path: "/", icon: Compass },
  { name: "About", path: "/about", icon: UserCircle },
  { name: "Academy", path: "/academy", icon: GraduationCap },
  { name: "Mentorship", path: "/mentorship", icon: MessageCircle },
  { name: "Contact", path: "/contact", icon: Send },
];

const galaxySubLinks = [
  { name: "Model Families", path: "/llm-galaxy#families", icon: Layers, description: "Explore GPT, Claude, Gemini, and more" },
  { name: "Benchmarks", path: "/llm-galaxy#benchmarks", icon: BarChart3, description: "MMLU, HumanEval, GSM8K rankings" },
  { name: "Compare Models", path: "/llm-galaxy#compare", icon: GitCompare, description: "Side-by-side model comparison" },
  { name: "Use Cases", path: "/llm-galaxy#usecases", icon: BrainCircuit, description: "Find the perfect model for your task" },
  { name: "Trends", path: "/llm-galaxy#trends", icon: TrendingUp, description: "Industry evolution and insights" },
];

const blogSubLinks = [
  { name: "Personal Blog", path: "/blog", icon: Pen, description: "My articles & tutorials" },
  { name: "Blog Aggregator", path: "/blogs", icon: Rss, description: "Medium, Substack, Hashnode & more" },
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

  const isGalaxyActive = location.pathname.startsWith("/llm-galaxy");
  const isBlogActive = location.pathname.startsWith("/blog") || location.pathname === "/blogs";

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
                <BurningLogo size="md" animate={true} />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                <span className="text-foreground">abhishek</span>
                <span className="gradient-text">panda</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Home & About */}
              {navLinks.slice(0, 2).map((link) => (
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

              {/* Academy */}
              <Link
                to="/academy"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                  location.pathname === "/academy"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm" />
                <span className="absolute inset-[1px] rounded-lg bg-background/80 group-hover:bg-background/90 transition-colors" />
                <span className="relative flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Academy
                </span>
              </Link>

              {/* Blog Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-transparent data-[state=open]:bg-transparent group",
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
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[300px] p-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl">
                        <div className="space-y-1">
                          {blogSubLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                                location.pathname === subLink.path && "bg-muted"
                              )}
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <subLink.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground text-sm">{subLink.name}</div>
                                <div className="text-xs text-muted-foreground">{subLink.description}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Mentorship & Contact */}
              {navLinks.slice(3).map((link) => (
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
                      <div className="w-[400px] p-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl">
                        <div className="mb-4">
                          <Link
                            to="/llm-galaxy"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">OriginX LLM Galaxy</div>
                              <div className="text-sm text-muted-foreground">The Global Intelligence Index</div>
                            </div>
                          </Link>
                        </div>
                        <div className="space-y-1">
                          {galaxySubLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <subLink.icon className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium text-foreground text-sm">{subLink.name}</div>
                                <div className="text-xs text-muted-foreground">{subLink.description}</div>
                              </div>
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
              <Button variant="hero-outline" size="sm" asChild>
                <Link to="/llm-galaxy">
                  <Brain className="w-4 h-4" />
                  Explore Galaxy
                </Link>
              </Button>
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
              {/* Home & About */}
              {navLinks.slice(0, 2).map((link, index) => (
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

              {/* Academy */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  to="/academy"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    location.pathname === "/academy"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <GraduationCap className="w-5 h-5" />
                  Academy
                </Link>
              </motion.div>

              {/* Blog Links Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="px-4 py-2"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3" />
                  Blogs
                </div>
                {blogSubLinks.map((subLink) => (
                  <Link
                    key={subLink.path}
                    to={subLink.path}
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

              {/* Mentorship & Contact */}
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
              
              {/* LLM Galaxy Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  to="/llm-galaxy"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200",
                    isGalaxyActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Brain className="w-5 h-5" />
                  LLM Galaxy
                </Link>
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
