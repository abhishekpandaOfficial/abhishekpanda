import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Code2, Cloud, Brain, BookOpenCheck, Download, Briefcase } from "lucide-react";
import aboutPortraitPrimary from "@/assets/about/myimage2.png";
import aboutPortraitSecondary from "@/assets/about/IMG_2863.jpg";
import { Button } from "@/components/ui/button";
import { CVDownloadModal } from "@/components/cv/CVDownloadModal";

const badges = [
  { icon: Brain, label: "Lead AI/ML Architect", color: "from-secondary to-purple" },
  { icon: Code2, label: "Technical Architect", color: "from-primary to-secondary" },
  { icon: Cloud, label: "Cloud Solution Architect", color: "from-sky to-primary" },
  { icon: BookOpenCheck, label: "Author & Mentor", color: "from-amber-500 to-orange-500" },
];

const floatingLeftTechStacks = [
  {
    src: "/brand-logos/stacks/dotnet.svg",
    label: "C#/.NET",
    position: "top-[9%] left-[2%] xl:left-[4%]",
    delay: 0,
    accent: "from-indigo-500/30 to-blue-500/20",
  },
  {
    src: "/brand-logos/stacks/microsoftazure.svg",
    label: "Azure",
    position: "top-[21%] left-[6%] xl:left-[8%]",
    delay: 0.12,
    accent: "from-sky-500/30 to-cyan-500/20",
  },
  {
    src: "/brand-logos/stacks/aws.svg",
    label: "AWS",
    position: "top-[33%] left-[2%] xl:left-[4%]",
    delay: 0.24,
    accent: "from-amber-500/30 to-orange-500/20",
  },
  {
    src: "/brand-logos/stacks/angular.svg",
    label: "Angular",
    position: "top-[45%] left-[6%] xl:left-[8%]",
    delay: 0.36,
    accent: "from-rose-500/30 to-red-500/20",
  },
  {
    src: "/brand-logos/stacks/python.svg",
    label: "Python",
    position: "top-[57%] left-[2%] xl:left-[4%]",
    delay: 0.48,
    accent: "from-blue-500/30 to-amber-500/20",
  },
  {
    src: "/brand-logos/stacks/devops-pipeline-custom.png",
    label: "GitHub Actions",
    position: "top-[69%] left-[6%] xl:left-[8%]",
    delay: 0.6,
    accent: "from-orange-500/30 to-amber-500/20",
  },
  {
    src: "/brand-logos/stacks/github.svg",
    label: "DevOps Pipeline",
    position: "top-[15%] left-[10%] xl:left-[12%]",
    delay: 0.72,
    accent: "from-cyan-500/30 to-blue-500/20",
  },
  {
    src: "/brand-logos/stacks/octopus-custom.png",
    label: "Octopus Deploy",
    position: "top-[39%] left-[10%] xl:left-[12%]",
    delay: 0.84,
    accent: "from-orange-500/30 to-rose-500/20",
  },
  {
    src: "/brand-logos/stacks/docker.svg",
    label: "Docker",
    position: "top-[63%] left-[10%] xl:left-[12%]",
    delay: 0.96,
    accent: "from-blue-500/30 to-cyan-500/20",
  },
  {
    src: "/brand-logos/stacks/kubernetes-custom.png",
    label: "Kubernetes",
    position: "top-[81%] left-[2%] xl:left-[4%]",
    delay: 1.08,
    accent: "from-indigo-500/30 to-sky-500/20",
  },
];

const floatingRightTechStacks = [
  {
    src: "/brand-logos/stacks/langchain.svg",
    label: "LangChain",
    position: "top-[12%] right-[11%] xl:right-[13%]",
    delay: 0.08,
    accent: "from-emerald-500/30 to-teal-500/20",
  },
  {
    src: "/llm-logos/mistral.svg",
    label: "LangGraph",
    position: "top-[24%] right-[13%] xl:right-[15%]",
    delay: 0.2,
    accent: "from-cyan-500/30 to-teal-500/20",
  },
  {
    src: "/llm-logos/claude-custom.png",
    label: "Claude",
    position: "top-[36%] right-[11%] xl:right-[13%]",
    delay: 0.32,
    accent: "from-violet-500/30 to-fuchsia-500/20",
  },
  {
    src: "/llm-logos/codex-custom.png",
    label: "Codex",
    position: "top-[48%] right-[13%] xl:right-[15%]",
    delay: 0.44,
    accent: "from-emerald-500/30 to-sky-500/20",
  },
  {
    src: "/llm-logos/kimi-custom.png",
    label: "Kimi",
    position: "top-[60%] right-[11%] xl:right-[13%]",
    delay: 0.56,
    accent: "from-blue-500/30 to-cyan-500/20",
  },
  {
    src: "/llm-logos/qwen-custom.png",
    label: "QWEN",
    position: "top-[72%] right-[13%] xl:right-[15%]",
    delay: 0.68,
    accent: "from-amber-500/30 to-orange-500/20",
  },
  {
    src: "/llm-logos/meta.svg",
    label: "Llama",
    position: "top-[84%] right-[11%] xl:right-[13%]",
    delay: 0.8,
    accent: "from-indigo-500/30 to-blue-500/20",
  },
];

const taglines = [
  "Designing systems that stay reliable as teams and traffic grow.",
  "Turning product goals into maintainable engineering architecture.",
  "Architecture-first thinking for cloud, data, and AI platforms.",
  "Building practical software that ships and scales.",
  "Engineering clarity from idea to production.",
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
  const [currentAvatar, setCurrentAvatar] = useState(aboutPortraitPrimary);
  const [pandaLogoSrc, setPandaLogoSrc] = useState("/panda.svg");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (hasScrolled) {
      setCurrentAvatar(aboutPortraitSecondary);
    } else if (!isHovered) {
      setCurrentAvatar(aboutPortraitPrimary);
    }
  }, [hasScrolled, isHovered]);

  const handleHover = () => {
    setIsHovered(true);
    setTaglineIndex(Math.floor(Math.random() * taglines.length));
    setCurrentAvatar(aboutPortraitSecondary);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    if (!hasScrolled) {
      setCurrentAvatar(aboutPortraitPrimary);
    }
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-24 md:pt-28">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-reference-bg" />
      <div className="absolute inset-0 hero-grid-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/35 to-background/80" />
      
      {/* Animated Orbs */}
      <motion.div
        className="absolute left-[10%] top-[18%] h-64 w-64 rounded-full bg-primary/20 blur-3xl md:left-1/4 md:top-1/4 md:h-96 md:w-96"
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
        className="absolute bottom-[14%] right-[8%] h-64 w-64 rounded-full bg-secondary/20 blur-3xl md:bottom-1/4 md:right-1/4 md:h-96 md:w-96"
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
          {floatingLeftTechStacks.map((stack, index) => (
            <motion.div
              key={`${stack.label}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + stack.delay }}
              className={`float-wave absolute ${stack.position}`}
              style={{
                animationDelay: `${index * 0.12}s`,
                animationDuration: `${4.8 + (index % 4) * 0.6}s`,
              }}
            >
              <div
                className={`group flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br ${stack.accent} shadow-[0_22px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-transform duration-300 group-hover:scale-110`}
                title={stack.label}
                aria-label={stack.label}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-2 ring-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] dark:bg-white dark:ring-slate-200/90">
                  {stack.src ? (
                    <img src={stack.src} alt={stack.label} className="h-6 w-6 object-contain saturate-125 contrast-125 drop-shadow-[0_2px_2px_rgba(15,23,42,0.18)]" loading="lazy" />
                  ) : stack.icon ? (
                    <stack.icon className="h-5 w-5 text-primary" />
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Keep right-side icons inward so they do not collide with the fixed social sidebar. */}
          {floatingRightTechStacks.map((stack, index) => (
            <motion.div
              key={`${stack.label}-right-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 + stack.delay }}
              className={`float-soft absolute ${stack.position}`}
              style={{ animationDelay: `${(index + 6) * 0.2}s` }}
            >
              <div
                className={`group flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br ${stack.accent} shadow-[0_22px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-transform duration-300 group-hover:scale-110`}
                title={stack.label}
                aria-label={stack.label}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-2 ring-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] dark:bg-white dark:ring-slate-200/90">
                  <img src={stack.src} alt={stack.label} className="h-6 w-6 object-contain saturate-125 contrast-125 drop-shadow-[0_2px_2px_rgba(15,23,42,0.18)]" loading="lazy" />
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
                    initial={{ opacity: 0, y: -8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    className="absolute left-1/2 top-[calc(100%+1rem)] z-[70] w-[min(88vw,26rem)] -translate-x-1/2"
                  >
                    <div className="rounded-[1.4rem] border border-white/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.96),rgba(99,102,241,0.94),rgba(168,85,247,0.94))] px-4 py-3 text-center shadow-[0_24px_80px_-24px_rgba(59,130,246,0.65)] backdrop-blur-xl">
                      <p className="text-sm font-semibold leading-6 text-white md:text-[15px]">
                        {taglines[taglineIndex]}
                      </p>
                    </div>
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-sky-500 shadow-[0_10px_24px_rgba(59,130,246,0.35)]" />
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
                      className="w-full h-full object-cover object-[center_14%] absolute inset-0"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    />
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 8, y: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="absolute -bottom-3 left-[calc(100%-1.5rem)] h-14 w-14 overflow-hidden rounded-2xl border-2 border-white/70 bg-background shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] dark:border-slate-800/80 md:h-16 md:w-16"
              >
                <img
                  src={currentAvatar === aboutPortraitPrimary ? aboutPortraitSecondary : aboutPortraitPrimary}
                  alt="Abhishek Panda alternate portrait"
                  className="h-full w-full object-cover object-[center_12%]"
                />
              </motion.div>
              
            </div>
          </motion.div>

          {/* Name & Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.06em] text-primary">
              <Sparkles className="h-4 w-4" />
              @the_abhishekpanda
            </div>
            <div className="mb-2 flex items-center justify-center gap-3 md:gap-5">
              <h1 className="ap-name-display text-4xl text-foreground md:text-6xl lg:text-7xl xl:text-[5rem]">
                <span className="ap-name-gradient inline-block">
                  Abhishek Panda
                </span>
              </h1>
              <motion.div
                className="relative h-20 w-20 shrink-0 md:h-24 md:w-24 lg:h-28 lg:w-28"
                animate={{ y: [0, 5, 0], rotate: [1.4, -1.4, 1.4] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-slate-400/80 to-slate-300/10 dark:from-slate-300/70" />
                <img
                  src={pandaLogoSrc}
                  alt="Panda logo"
                  className="relative h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,0.32)]"
                  loading="lazy"
                  onError={() => setPandaLogoSrc("/abhishek.png")}
                />
              </motion.div>
            </div>
          </motion.div>

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
                <div className="glass-card-hover px-4 py-2 rounded-full flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                    <badge.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">{badge.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <MagicalLocalClock />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => setIsDownloadModalOpen(true)}
              className="group relative overflow-hidden rounded-lg border-0 bg-transparent p-0 text-white shadow-none hover:bg-transparent"
            >
              <span className="relative inline-flex items-center gap-2 rounded-lg border border-sky-300/35 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_16px_36px_-22px_rgba(59,130,246,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-400 hover:via-indigo-400 hover:to-violet-400 hover:shadow-[0_22px_46px_-22px_rgba(79,70,229,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20 ring-1 ring-white/35">
                  <Download className="h-4 w-4" />
                </span>
                <span className="relative">Download CV</span>
              </span>
            </Button>
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden rounded-lg border-0 bg-transparent p-0 text-white shadow-none hover:bg-transparent"
            >
              <Link
                to="/mentorship"
                className="relative inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-[0_16px_36px_-22px_rgba(16,185,129,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 hover:shadow-[0_22px_46px_-22px_rgba(20,184,166,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20 ring-1 ring-white/35">
                  <Briefcase className="h-4 w-4" />
                </span>
                <span className="relative">Mentorship</span>
              </Link>
            </Button>
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

      <CVDownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />
    </section>
  );
};
