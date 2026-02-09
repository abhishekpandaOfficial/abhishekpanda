import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Sparkles, Code2, Cloud, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import abhishekAvatar from "@/assets/abhishek-avatar.png";
import abhishekAvatarAlt from "@/assets/abhishek-avatar-alt.png";

const badges = [
  { icon: Code2, label: ".NET Architect", color: "from-primary to-secondary" },
  { icon: Brain, label: "AI/ML Engineer", color: "from-secondary to-purple" },
  { icon: Cloud, label: "Cloud Specialist", color: "from-sky to-primary" },
];

const taglines = [
  "Building the future, one commit at a time 🚀",
  "Turning coffee into code & dreams into reality ☕",
  "Where innovation meets architecture ✨",
  "Code. Create. Conquer. 💡",
  "Engineering excellence, delivered. 🎯",
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
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
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

      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar with Hover Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
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
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary via-secondary to-purple p-1 shadow-glow-lg"
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
              <span className="text-foreground">Hi, I'm </span>
              <span className="gradient-text">Abhishek Panda</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 font-medium">
              .NET Architect • AI/ML Engineer • Cloud-Native Specialist
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            "Engineering ideas into reality,{" "}
            <span className="gradient-text font-semibold">one clean build at a time.</span>"
          </motion.p>

          {/* Identity Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
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

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/courses">
                <Sparkles className="w-5 h-5" />
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/blog">
                <BookOpen className="w-5 h-5" />
                Read Blog
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/mentorship">
                <Calendar className="w-5 h-5" />
                Book 1:1 Session
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
