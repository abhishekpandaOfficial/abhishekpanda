import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/openowl/Hero";
import { ChatPanel } from "@/components/openowl/ChatPanel";
import { Capabilities } from "@/components/openowl/Capabilities";
import { HowItWorks } from "@/components/openowl/HowItWorks";
import { OpenOwlFooter } from "@/components/openowl/Footer";
import { OpenOwlHeader } from "@/components/openowl/OpenOwlHeader";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";

export default function OpenOwlLanding() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="openowl-splash"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.24 } }}
          >
            <div className="text-center">
              <OpenOwlAnimatedLogo size="lg" animate className="mx-auto h-20 w-20" imageClassName="h-20 w-20" />
              <p className="mt-3 text-sm font-semibold tracking-wide text-foreground">Loading OpenOwl</p>
              <p className="mt-1 text-xs text-muted-foreground">AbhishekPanda Assistant</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!showSplash ? (
        <>
          <OpenOwlHeader />
          <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-10">
            <Hero />

            <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
              <ChatPanel />
              <Capabilities />
            </section>

            <HowItWorks />
            <OpenOwlFooter />
          </main>
        </>
      ) : null}
    </div>
  );
}
