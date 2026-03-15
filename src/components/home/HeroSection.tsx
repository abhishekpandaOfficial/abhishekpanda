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
    position: "top-[10%] left-[2%] xl:left-[4%]",
    delay: 0,
  },
  {
    icon: Database,
    title: "Data APIs",
    subtitle: "Realtime Layer",
    position: "top-[29%] left-[4%] xl:left-[7%]",
    delay: 0.16,
  },
  {
    icon: Brain,
    title: "AI/ML",
    subtitle: "Agentic Flows",
    position: "bottom-[31%] left-[3%] xl:left-[6%]",
    delay: 0.32,
  },
  {
    icon: Shield,
    title: "Platform Sec",
    subtitle: "Zero Trust",
    position: "bottom-[10%] left-[2%] xl:left-[4%]",
    delay: 0.48,
  },
  {
    icon: Cloud,
    title: "Azure · AWS",
    subtitle: "Cloud Native",
    position: "top-[12%] right-[2%] xl:right-[4%]",
    delay: 0.64,
  },
  {
    icon: Cpu,
    title: "LLM Systems",
    subtitle: "Inference & Ops",
    position: "top-[31%] right-[4%] xl:right-[7%]",
    delay: 0.8,
  },
  {
    icon: FolderOpen,
    title: "Product Ships",
    subtitle: "Execution First",
    position: "bottom-[29%] right-[3%] xl:right-[6%]",
    delay: 0.96,
  },
  {
    icon: Send,
    title: "Founder Mode",
    subtitle: "Ideas to Launch",
    position: "bottom-[9%] right-[2%] xl:right-[4%]",
    delay: 1.12,
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
  {
    label: "Enter Tech Hub",
    to: "/techhub",
    icon: Cpu,
    eyebrow: "Mastery",
    description: "Jump into deep technical learning tracks",
    className:
      "border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_40%),linear-gradient(160deg,rgba(255,251,235,0.96),rgba(254,243,199,0.9))] text-amber-950 hover:border-amber-400/45 hover:shadow-[0_24px_60px_-35px_rgba(245,158,11,0.42)] dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_38%),linear-gradient(160deg,rgba(69,26,3,0.94),rgba(120,53,15,0.9))] dark:text-white",
  },
  {
    label: "Read Deep Dives",
    to: "/articles",
    icon: BookOpenText,
    eyebrow: "Writing",
    description: "Open long-form architecture and engineering articles",
    className:
      "border-rose-400/20 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_40%),linear-gradient(160deg,rgba(255,241,242,0.96),rgba(255,228,230,0.9))] text-rose-950 hover:border-rose-400/45 hover:shadow-[0_24px_60px_-35px_rgba(244,63,94,0.42)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.2),transparent_38%),linear-gradient(160deg,rgba(76,5,25,0.94),rgba(136,19,55,0.9))] dark:text-white",
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

const clockOrbitMarks = Array.from({ length: 12 }, (_, index) => index);
const clockFaceNumbers = [
  { label: "12", className: "top-[10px] left-1/2 -translate-x-1/2" },
  { label: "3", className: "right-[12px] top-1/2 -translate-y-1/2" },
  { label: "6", className: "bottom-[10px] left-1/2 -translate-x-1/2" },
  { label: "9", className: "left-[12px] top-1/2 -translate-y-1/2" },
];

const MagicalLocalClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const hours = currentHour % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourRotation = hours * 30 + minutes * 0.5;
  const minuteRotation = minutes * 6 + seconds * 0.1;
  const secondRotation = seconds * 6;
  const hourProgress = ((currentHour % 24) / 24) * 100;
  const minuteProgress = (minutes / 60) * 100;
  const secondProgress = (seconds / 60) * 100;
  const digitalTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const readableDate = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.38 }}
      className="mx-auto mb-6 w-full max-w-[320px]"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-sky-400/25 bg-[radial-gradient(circle,rgba(255,255,255,0.98),rgba(219,234,254,0.74))] shadow-[inset_0_0_20px_rgba(255,255,255,0.9),0_18px_45px_-26px_rgba(56,189,248,0.65)] dark:bg-[radial-gradient(circle,rgba(15,23,42,0.98),rgba(30,41,59,0.9))]">
          <div className="absolute inset-[6px] rounded-full border border-sky-400/20" />
          <div className="absolute inset-[12px] rounded-full border border-dashed border-violet-400/25" />
          <div className="absolute inset-[18px] rounded-full border border-cyan-400/20" />
          {clockOrbitMarks.map((mark) => (
            <span
              key={mark}
              className="absolute left-1/2 top-1/2 h-[36px] w-[2px] -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-gradient-to-b from-sky-500/95 to-transparent dark:from-sky-300/95"
              style={{
                transform: `translate(-50%, -100%) rotate(${mark * 30}deg)`,
                opacity: mark % 3 === 0 ? 0.95 : 0.45,
              }}
            />
          ))}
          {clockFaceNumbers.map((number) => (
            <span
              key={number.label}
              className={`absolute text-[10px] font-black tracking-tight text-slate-900/85 dark:text-white ${number.className}`}
            >
              {number.label}
            </span>
          ))}
          <span className="absolute h-[78px] w-[78px] rounded-full border border-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.18)]" />
          <span
            className="absolute left-1/2 top-1/2 h-7 w-1.5 origin-bottom rounded-full bg-slate-900 shadow-[0_0_18px_rgba(14,165,233,0.28)] dark:bg-white"
            style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }}
          />
          <span
            className="absolute left-1/2 top-1/2 h-9 w-1 origin-bottom rounded-full bg-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.45)]"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }}
          />
          <span
            className="absolute left-1/2 top-1/2 h-10 w-0.5 origin-bottom rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,0.48)]"
            style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }}
          />
          <span className="absolute h-3.5 w-3.5 rounded-full border border-white/60 bg-slate-950 shadow-[0_0_18px_rgba(14,165,233,0.3)] dark:bg-white" />
        </div>

          <div className="min-w-0 text-left">
            <div className="text-[1.35rem] font-black tracking-[-0.05em] text-foreground md:text-[1.5rem]">
              {digitalTime}
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {readableDate}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <span>Hours</span>
                <span className="text-sky-500/80 dark:text-sky-300/80">|</span>
                <span>Minutes</span>
                <span className="text-violet-500/80 dark:text-violet-300/80">|</span>
                <span>Seconds</span>
              </div>
              <div className="grid h-2.5 grid-cols-3 gap-1 overflow-hidden rounded-full bg-slate-200/80 p-0.5 shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)] dark:bg-white/10">
                {[
                  {
                    key: "hours",
                    value: hourProgress,
                    tint:
                      "from-sky-500 via-cyan-400 to-blue-500 dark:from-sky-300 dark:via-cyan-300 dark:to-blue-300",
                  },
                  {
                    key: "minutes",
                    value: minuteProgress,
                    tint:
                      "from-violet-500 via-fuchsia-500 to-pink-500 dark:from-violet-300 dark:via-fuchsia-300 dark:to-pink-300",
                  },
                  {
                    key: "seconds",
                    value: secondProgress,
                    tint:
                      "from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300",
                  },
                ].map((metric) => (
                  <div
                    key={metric.key}
                    className="relative overflow-hidden rounded-full bg-white/70 dark:bg-white/5"
                  >
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${metric.tint}`}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] font-semibold tracking-[0.12em] text-muted-foreground">
                <span>{Math.round(hourProgress)}%</span>
                <span>{Math.round(minuteProgress)}%</span>
                <span>{Math.round(secondProgress)}%</span>
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
};

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
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-24 md:pt-28">
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

      <div className="relative w-full px-4 py-4 md:px-6 md:py-6 xl:px-8">
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

        <div className="mx-auto w-full max-w-[1040px] text-center">
          {/* Avatar with Hover Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 md:mb-5"
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
                className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-secondary to-purple p-1 shadow-glow-lg md:h-28 md:w-28"
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
            <h1 className="audiowide-regular mb-2 text-balance text-4xl leading-[1.02] tracking-[0.01em] text-foreground md:text-6xl lg:text-7xl xl:text-[5rem]">
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
            <p className="mb-3 text-base font-medium tracking-[-0.02em] text-muted-foreground md:text-xl xl:text-[1.4rem]">
              Architecting production-ready .NET, Cloud, and AI systems
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mb-4 max-w-3xl text-sm leading-relaxed text-foreground/80 md:text-base xl:text-[1.05rem]"
          >
            Building reliable products with clear architecture, strong execution, and measurable outcomes.
          </motion.p>

          {/* Identity Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-4 flex flex-wrap justify-center gap-2.5 md:gap-3"
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
            <HeroSocialIcons className="justify-center" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.58 }}
            className="mx-auto mb-2 w-full max-w-3xl"
          >
            <div className="flex flex-wrap justify-center gap-2.5">
              {primaryCtas.map((cta) => {
                const content = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/10">
                      <cta.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold md:text-[15px]">{cta.label}</span>
                  </>
                );

                const className = `group inline-flex items-center justify-center gap-2.5 rounded-full border px-4 py-3 text-sm font-semibold backdrop-blur-xl transition hover:-translate-y-0.5 ${cta.className}`;

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
          </motion.div>

          <MagicalLocalClock />

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
