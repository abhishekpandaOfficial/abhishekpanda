import { lazy, Suspense, memo } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";

// Lazy load below-the-fold components for faster initial render
const SocialSection = lazy(() => import("@/components/home/SocialSection").then(m => ({ default: m.SocialSection })));
const FeaturedCourses = lazy(() => import("@/components/home/FeaturedCourses").then(m => ({ default: m.FeaturedCourses })));
const FeaturedBlog = lazy(() => import("@/components/home/FeaturedBlog").then(m => ({ default: m.FeaturedBlog })));
const TrustSection = lazy(() => import("@/components/home/TrustSection").then(m => ({ default: m.TrustSection })));
const NewsletterSection = lazy(() => import("@/components/home/NewsletterSection").then(m => ({ default: m.NewsletterSection })));
const NewsletterPopup = lazy(() => import("@/components/NewsletterPopup").then(m => ({ default: m.NewsletterPopup })));

// Minimal loading placeholder
const SectionLoader = memo(() => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
));
SectionLoader.displayName = 'SectionLoader';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero loads immediately - critical for LCP */}
        <HeroSection />
        
        {/* Below-the-fold content loads lazily */}
        <Suspense fallback={<SectionLoader />}>
          <SocialSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FeaturedCourses />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FeaturedBlog />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TrustSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <NewsletterSection />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <NewsletterPopup delay={8000} />
      </Suspense>
    </div>
  );
};

export default Index;
