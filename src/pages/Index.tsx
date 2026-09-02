import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { GsapInfinitePhotoSlider } from "@/components/about/GsapInfinitePhotoSlider";
import { TechStackShowcase } from "@/components/about/TechStackShowcase";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { CertificatesSection } from "@/components/about/CertificatesSection";
import { BooksSection } from "@/components/products/BooksSection";
import { BookNewsletterPopup } from "@/components/BookNewsletterPopup";
import { heroImages } from "@/data/heroImages";

const Footer = lazy(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

const Index = () => {
  return (
    <motion.div
      className="landing-open-source-typo dark min-h-screen bg-slate-950 text-slate-100"
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
        <HeroSection />
        <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 px-4 py-10 md:px-6 md:py-14 xl:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_24%)]" />
          <div className="relative mx-auto w-full max-w-[1120px]">
            <GsapInfinitePhotoSlider items={heroImages} />
          </div>
        </section>

        <TechStackShowcase />
        <CareerTimeline />
        <CertificatesSection />
        <section id="mybooks" className="scroll-mt-24">
          <BooksSection />
        </section>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </motion.main>
      <BookNewsletterPopup />
    </motion.div>
  );
};

export default Index;
