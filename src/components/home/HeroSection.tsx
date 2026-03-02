import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Sparkles, Code2, Cloud, Brain, ExternalLink, ShieldCheck } from "lucide-react";
import abhishekAvatar from "@/assets/abhishek-avatar.png";
import abhishekAvatarAlt from "@/assets/abhishek-avatar-alt.png";
import { ChronyxLogo } from "@/components/ui/ChronyxLogo";
import { HeroSocialIcons } from "@/components/about/HeroSocialIcons";
import { OpenOwlLogo } from "@/components/ui/OpenOwlLogo";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";

const badges = [
  { icon: Code2, label: ".NET Architect", color: "from-primary to-secondary" },
  { icon: Brain, label: "AI/ML Engineer", color: "from-secondary to-purple" },
  { icon: Cloud, label: "Cloud Specialist", color: "from-sky to-primary" },
];

const taglines = [
  "Designing systems that stay reliable as teams and traffic grow.",
  "Turning product goals into maintainable engineering architecture.",
  "Architecture-first thinking for cloud, data, and AI platforms.",
  "Building practical software that ships and scales.",
  "Engineering clarity from idea to production.",
];

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(abhishekAvatar);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (hasScrolled) {
      setCurrentAvatar(abhishekAvatarAlt);
    } else if (!isHovered) {
      setCurrentAvatar(abhishekAvatar);
    }
  }, [hasScrolled, isHovered]);

  const handleHover = () => {
    setIsHovered(true);
    setTaglineIndex(Math.floor(Math.random() * taglines.length));
    setCurrentAvatar(abhishekAvatarAlt);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    if (!hasScrolled) {
      setCurrentAvatar(abhishekAvatar);
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Animated Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar with Hover Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 md:mb-6"
          >
            <div 
              className="relative inline-block group cursor-pointer"
              onMouseEnter={handleHover}
              onMouseLeave={handleHoverEnd}
            >
              {/* Hover Tagline Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
                  >
                    <div className="bg-gradient-to-r from-primary via-secondary to-purple px-4 py-2 rounded-full shadow-glow">
                      <p className="text-sm font-medium text-primary-foreground">
                        {taglines[taglineIndex]}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-secondary rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar Container */}
              <motion.div 
                className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary via-secondary to-purple p-1 shadow-glow-lg"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ boxShadow: "0 0 60px hsl(217 91% 60% / 0.5)" }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentAvatar}
                      src={currentAvatar}
                      alt="Abhishek Panda - CEO & Architect" 
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    />
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Sparkle Badge */}
              <motion.div
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Name & Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-3 tracking-tight leading-[1.05]">
              <span className="text-foreground">Hi, I'm </span>
              <span className="gradient-text">Abhishek Panda</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-4 font-medium">
              Architecting production-ready .NET, Cloud, and AI systems
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base md:text-lg text-foreground/80 mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Building reliable products with clear architecture, strong execution, and measurable outcomes.
          </motion.p>

          {/* Identity Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-6"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="glass-card-hover px-4 py-2 rounded-full flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                  <badge.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.52 }}
            className="mb-3"
          >
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-3">Connect Everywhere</div>
            <HeroSocialIcons className="justify-center" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.58 }}
            className="mb-4"
          >
            <Link
              to="/openowl"
              className="group mx-auto max-w-3xl flex items-center gap-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-3 md:p-4 shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.55)] hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-all duration-300"
            >
              <OpenOwlLogo size="lg" animate className="ring-sky-300/45" />
              <div className="text-left min-w-0">
                <div className="text-sm md:text-base font-bold text-foreground">OpenOwl AI Assistant</div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Theme-aware conversational assistant for website intelligence, model discovery, and realtime updates.
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-primary/85">Development phase · Open-source LLM integration soon</p>
              </div>
            </Link>
          </motion.div>

          <motion.a
            href="https://www.proxinex.com/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.62 }}
            className="group mx-auto mb-4 flex max-w-3xl items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/65 p-3 text-left shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.28)] dark:border-slate-700/70 dark:bg-slate-900/65 dark:shadow-[0_10px_30px_rgba(2,6,23,0.55)]"
          >
            <BrandLogo variant="proxinex" size="lg" className="shrink-0 rounded-xl p-2" imageClassName="h-8 w-8" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm md:text-base font-bold text-foreground">Proxinex</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  AI Intelligence Control Plane
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Control Every AI. Trust Every Result. Multi-model routing, governance, and cost transparency across
                text, coding, image, video, and every kind of tasks.
              </p>
            </div>
            <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </motion.a>

          {/* Premium CTA Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.66 }}
            className="mx-auto grid max-w-6xl grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            <Link to="/chronyx" className="premium-border-card group p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <ChronyxLogo compact size="md" imageClassName="h-4 w-4" />
                <span className="text-[13px] font-semibold text-foreground">Explore CHRONYX</span>
              </div>
              <p className="text-xs text-muted-foreground">Personal command hub</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-border bg-background/75 px-2.5 py-1 text-[11px] font-semibold">
                Open
              </span>
            </Link>

            <a href="https://www.proxinex.com/" target="_blank" rel="noopener noreferrer" className="premium-border-card group p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <BrandLogo variant="proxinex" size="sm" className="rounded-md p-0.5" imageClassName="h-4 w-4" />
                <span className="text-[13px] font-semibold text-foreground">Explore Proxinex</span>
              </div>
              <p className="text-xs text-muted-foreground">AI Intelligence Control Plane</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-border bg-background/75 px-2.5 py-1 text-[11px] font-semibold">
                Open
              </span>
            </a>

            <Link to="/blog" className="premium-border-card group p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">Read Blogs</span>
              </div>
              <p className="text-xs text-muted-foreground">Engineering and AI deep-dives</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-border bg-background/75 px-2.5 py-1 text-[11px] font-semibold">
                Open
              </span>
            </Link>

            <Link to="/mentorship" className="premium-border-card group p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">Book 1:1 Session</span>
              </div>
              <p className="text-xs text-muted-foreground">Architecture and career mentoring</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-border bg-background/75 px-2.5 py-1 text-[11px] font-semibold">
                Book
              </span>
            </Link>

            <a href="https://www.stackcraft.io/" target="_blank" rel="noopener noreferrer" className="premium-border-card group p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <StackcraftIcon className="h-4 w-4 text-white" />
                <span className="text-[13px] font-semibold text-foreground">Explore StackCraft</span>
              </div>
              <p className="text-xs text-muted-foreground">Engineering writing platform</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-amber-300/60 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:border-amber-400/45 dark:bg-amber-900/25 dark:text-amber-300">
                Coming Soon
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:flex"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};
