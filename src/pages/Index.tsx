import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { PortfolioHero } from "@/components/home/PortfolioHero";
import { CvTechnologyStack } from "@/components/home/CvTechnologyStack";

const Footer = lazy(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

const Index = () => {
  return (
    <motion.div
      className="landing-open-source-typo min-h-screen bg-[#f7f8fa] text-slate-950 dark:bg-slate-950 dark:text-slate-100"
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
        <PortfolioHero />
        <CvTechnologyStack />
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </motion.main>
    </motion.div>
  );
};

export default Index;
