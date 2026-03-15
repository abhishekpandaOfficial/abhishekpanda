import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Code2, Cloud, Brain, Database, Cpu, ArrowRight, Shield, FolderOpen, Send, Building2, BookOpenText } from "lucide-react";
import abhishekAvatar from "@/assets/abhishek-avatar.png";
import abhishekAvatarAlt from "@/assets/abhishek-avatar-alt.png";
import { HeroSocialIcons } from "@/components/about/HeroSocialIcons";

const badges = [
  { icon: Code2, label: ".NET Architect", color: "from-primary to-secondary", to: "/dotnet-mastery" },
  { icon: Brain, label: "AI/ML Architect", color: "from-secondary to-purple", to: "/ai-ml-hub" },
  { icon: Cloud, label: "Cloud Architect", color: "from-sky to-primary", to: "/techhub" },
  { icon: Building2, label: "Founder", color: "from-amber-500 to-orange-500", to: "/about" },
  { icon: BookOpenText, label: "Author", color: "from-fuchsia-500 to-rose-500", to: "/articles" },
];

const floatingTechStacks = [
  {
    icon: Code2,
    title: ".NET Core",
    subtitle: "Microservices",
    position: "top-[12%] left-[4%]",
    delay: 0,
  },
  {
    icon: Cloud,
    title: "Azure · AWS",
    subtitle: "Cloud Native",
    position: "top-[18%] right-[5%]",
    delay: 0.3,
  },
  {
    icon: Brain,
    title: "AI/ML",
    subtitle: "Agentic Flows",
    position: "bottom-[24%] left-[6%]",
    delay: 0.6,
  },
  {
    icon: Database,
    title: "Data + APIs",
    subtitle: "Realtime Stack",
    position: "bottom-[18%] right-[7%]",
    delay: 0.9,
  },
  {
    icon: Cpu,
    title: "LLM Systems",
    subtitle: "Inference & Ops",
    position: "top-[46%] right-[2%]",
    delay: 1.1,
  },
];

const taglines = [
  "Designing systems that stay reliable as teams and traffic grow.",
  "Turning product goals into maintainable engineering architecture.",
  "Architecture-first thinking for cloud, data, and AI platforms.",
  "Building practical software that ships and scales.",
  "Engineering clarity from idea to production.",
];

const primaryCtas = [
  {
    label: "View Projects",
    to: "/projects",
    icon: FolderOpen,
    eyebrow: "Builds",
    description: "Explore live products and engineering work",
    className:
      "border-sky-400/20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_40%),linear-gradient(160deg,rgba(255,255,255,0.94),rgba(239,246,255,0.92))] text-slate-900 hover:border-sky-400/45 hover:shadow-[0_24px_60px_-35px_rgba(56,189,248,0.5)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_38%),linear-gradient(160deg,rgba(15,23,42,0.94),rgba(8,47,73,0.94))] dark:text-white",
  },
  {
    label: "Phantom VPN",
    href: "https://phantom.origixcloud.com/",
    icon: Shield,
    eyebrow: "Security",
    description: "Open the privacy-first secure tunnel",
    className:
      "border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_42%),linear-gradient(160deg,rgba(236,253,245,0.96),rgba(209,250,229,0.88))] text-emerald-950 hover:border-emerald-400/45 hover:shadow-[0_24px_60px_-35px_rgba(16,185,129,0.45)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_38%),linear-gradient(160deg,rgba(6,78,59,0.95),rgba(6,95,70,0.92))] dark:text-white",
  },
  {
    label: "Connect",
    href: "https://www.linkedin.com/in/abhishekpandaofficial/",
    icon: Send,
    eyebrow: "Network",
    description: "Connect with Abhishek on LinkedIn",
    className:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_42%),linear-gradient(160deg,rgba(245,243,255,0.96),rgba(237,233,254,0.9))] text-violet-950 hover:border-violet-400/45 hover:shadow-[0_24px_60px_-35px_rgba(168,85,247,0.48)] dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_38%),linear-gradient(160deg,rgba(59,7,100,0.94),rgba(76,29,149,0.92))] dark:text-white",
  },
];

const greetingEmojis = [
  "👋",
  "😎",
  "🤩",
  "🥳",
  "🤖",
  "✨",
  "🎉",
  "🚀",
  "🌈",
  "💫",
  "⚡",
  "🔥",
  "🌟",
  "🪄",
  "💎",
  "🎈",
  "🛸",
  "🎯",
  "🤓",
  "😺",
];

const RotatingEmojiBadge = ({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) => (
  <span
    className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background/80 align-middle text-[1.9rem] shadow-[0_18px_40px_-28px_rgba(14,165,233,0.55)] backdrop-blur-xl md:h-11 md:w-11 lg:h-12 lg:w-12 ${className ?? ""}`}
    aria-hidden="true"
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={emoji}
        initial={{ opacity: 0, scale: 0.72, rotate: -10, y: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.72, rotate: 10, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="inline-flex items-center justify-center"
      >
        {emoji}
      </motion.span>
    </AnimatePresence>
  </span>
);

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(abhishekAvatarAlt);
  const [emojiCycleIndex, setEmojiCycleIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (hasScrolled) {
      setCurrentAvatar(abhishekAvatar);
    } else if (!isHovered) {
      setCurrentAvatar(abhishekAvatarAlt);
    }
  }, [hasScrolled, isHovered]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEmojiCycleIndex((prev) => (prev + 1) % greetingEmojis.length);
    }, 200);

    return () => window.clearInterval(interval);
  }, []);

  const handleHover = () => {
    setIsHovered(true);
    setTaglineIndex(Math.floor(Math.random() * taglines.length));
    setCurrentAvatar(abhishekAvatar);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    if (!hasScrolled) {
      setCurrentAvatar(abhishekAvatarAlt);
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid-overlay" />
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

      <div className="relative w-full px-4 py-8 md:px-6 md:py-10 xl:px-8">
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {floatingTechStacks.map((stack, index) => (
            <motion.div
              key={stack.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + stack.delay }}
              className={`float-soft absolute ${stack.position} rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl px-3 py-2 shadow-sm`}
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <stack.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-foreground">{stack.title}</div>
                  <div className="text-[10px] text-muted-foreground">{stack.subtitle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto w-full max-w-[1120px] text-center">
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
            <h1 className="audiowide-regular mb-3 text-balance text-4xl leading-[1.02] tracking-[0.01em] text-foreground md:text-6xl lg:text-7xl xl:text-[5.15rem]">
              <RotatingEmojiBadge
                className="mr-3 md:mr-4"
                emoji={greetingEmojis[emojiCycleIndex]}
              />
              <span className="inline-block bg-gradient-to-r from-slate-950 via-sky-700 to-cyan-600 bg-clip-text tracking-[0.02em] text-transparent dark:from-white dark:via-sky-200 dark:to-cyan-300">
                Abhishek Panda
              </span>
              <RotatingEmojiBadge
                className="ml-3 md:ml-4"
                emoji={greetingEmojis[(emojiCycleIndex + 10) % greetingEmojis.length]}
              />
            </h1>
            <p className="mb-4 text-lg font-medium tracking-[-0.02em] text-muted-foreground md:text-2xl xl:text-[1.65rem]">
              Architecting production-ready .NET, Cloud, and AI systems
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mb-6 max-w-4xl text-base leading-relaxed text-foreground/80 md:text-lg xl:text-[1.2rem]"
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
                className="px-0"
              >
                {badge.to ? (
                  <Link to={badge.to} className="glass-card-hover px-4 py-2 rounded-full flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                      <badge.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground">{badge.label}</span>
                  </Link>
                ) : (
                  <div className="glass-card-hover px-4 py-2 rounded-full flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                      <badge.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground">{badge.label}</span>
                  </div>
                )}
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
            className="mx-auto mb-5 w-full max-w-5xl"
          >
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">Start Here</div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap">
              {primaryCtas.map((cta) => {
                const content = (
                  <>
                    <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/10">
                        <cta.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-[0.18em] opacity-70">
                          {cta.eyebrow}
                        </span>
                        <span className="mt-1 block text-sm font-bold md:text-[15px]">
                          {cta.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 opacity-75">
                          {cta.description}
                        </span>
                      </span>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition-transform duration-300 group-hover:translate-x-1 dark:border-white/10 dark:bg-white/10">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </>
                );

                const className = `group inline-flex items-center justify-between gap-3 rounded-[1.6rem] border px-4 py-4 text-sm font-semibold backdrop-blur-xl transition hover:-translate-y-1 sm:flex-1 sm:basis-[calc(50%-0.375rem)] xl:min-w-[240px] xl:flex-1 ${cta.className}`;

                if (cta.href) {
                  return (
                    <a
                      key={cta.label}
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link key={cta.label} to={cta.to} className={className}>
                    {content}
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Open the main engineering blogs, jump into AI/ML mastery tracks, read articles, or go directly to active product work.
            </p>
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
