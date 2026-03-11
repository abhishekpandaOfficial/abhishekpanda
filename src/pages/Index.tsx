import { lazy, Suspense, memo } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeStackedShowcase } from "@/components/home/HomeStackedShowcase";

// Lazy load below-the-fold components for faster initial render
const NewsletterSection = lazy(() => import("@/components/home/NewsletterSection").then(m => ({ default: m.NewsletterSection })));
const NewsletterPopup = lazy(() => import("@/components/NewsletterPopup").then(m => ({ default: m.NewsletterPopup })));

// Minimal loading placeholder
const SectionLoader = memo(() => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionLoader.displayName = 'SectionLoader';

const sectionReveal = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

const Index = () => {
  return (
    <motion.div
      className="landing-open-source-typo min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
      >
        {/* Hero loads immediately - critical for LCP */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
        >
          <HeroSection />
        </motion.div>
        
        {/* Below-the-fold content loads lazily */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4% 0px -4% 0px" }}
        >
          <HomeStackedShowcase />
        </motion.div>

        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
        >
          <Suspense fallback={<SectionLoader />}>
            <NewsletterSection />
          </Suspense>
        </motion.section>
      </motion.main>
      <Footer />
      <Suspense fallback={null}>
        <NewsletterPopup delay={8000} />
      </Suspense>
    </motion.div>
  );
};

export default Index;
