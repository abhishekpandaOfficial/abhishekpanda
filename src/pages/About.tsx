import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CVDownloadModal } from "@/components/cv/CVDownloadModal";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { TechStackShowcase } from "@/components/about/TechStackShowcase";
import { GsapInfinitePhotoSlider } from "@/components/about/GsapInfinitePhotoSlider";

import { HeroSocialIcons } from "@/components/about/HeroSocialIcons";
import { ContactIntentModal } from "@/components/about/ContactIntentModal";
import { BooksSection } from "@/components/products/BooksSection";
import { BookNewsletterPopup } from "@/components/BookNewsletterPopup";
import {
  Download, 
  Award,
  Phone,
  Briefcase,
  Landmark,
  Compass,
  Sun,
  Palette,
  Heart,
} from "lucide-react";

// Import hero images
import professional from "@/assets/about/professional.jpg";
import traditional from "@/assets/about/traditional.jpg";
import lifestyle from "@/assets/about/lifestyle.jpg";
import artistic from "@/assets/about/artistic.jpg";
import family from "@/assets/about/family.jpg";
import aboutPortraitPrimary from "@/assets/about/myimage2.png";
import aboutPortraitSecondary from "@/assets/about/IMG_2863.jpg";

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
  {
    src: aboutPortraitPrimary,
    alt: "Abhishek Panda portrait",
    title: "Signature",
    caption: "Leadership & Architecture",
    borderGradient: "linear-gradient(135deg, #22d3ee, #3b82f6, #6366f1)",
    badgeColor: "bg-cyan-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-[center_14%]",
  },
  {
    src: aboutPortraitSecondary,
    alt: "Abhishek Panda formal portrait",
    title: "Formal",
    caption: "Presence & Professionalism",
    borderGradient: "linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5)",
    badgeColor: "bg-blue-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-[center_12%]",
  },
  {
    src: professional,
    alt: "Professional",
    title: "Professional",
    caption: "Studio Portrait",
    borderGradient: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
    badgeColor: "bg-amber-500/85 text-white",
    icon: Landmark,
  },
  {
    src: traditional,
    alt: "Traditional",
    title: "Traditional",
    caption: "Culture & Roots",
    borderGradient: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
    badgeColor: "bg-amber-500/85 text-white",
    icon: Landmark,
  },
  {
    src: lifestyle,
    alt: "Lifestyle",
    title: "Lifestyle",
    caption: "Balanced Momentum",
    borderGradient: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)",
    badgeColor: "bg-pink-500/85 text-white",
    icon: Sun,
  },
  {
    src: artistic,
    alt: "Artistic",
    title: "Artistic",
    caption: "Creativity in Motion",
    borderGradient: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
    badgeColor: "bg-violet-500/85 text-white",
    icon: Palette,
  },
  {
    src: family,
    alt: "Family",
    title: "Family",
    caption: "Values First",
    borderGradient: "linear-gradient(135deg, #ef4444, #f97316, #f59e0b)",
    badgeColor: "bg-rose-500/85 text-white",
    icon: Heart,
  },
];


const certifications = [
  "Azure Solutions Architect (AZ-305) – Pursuing",
  "AWS Solutions Architect – Associate – Pursuing",
  "Azure Developer Associate",
  "Kubernetes (CKA) – Certified",
  "AI/ML Specialization – Coursera/DeepLearning.AI",
  "Wells Fargo Employee of the Year 2021",
  "Solera Employee of the Month (May 2024)",
  "Rising Star Author Award – Notion Press 2025",
];

const About = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const awardsRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current && heroCopyRef.current && heroVisualRef.current) {
        gsap.fromTo(
          heroCopyRef.current,
          { y: 42, opacity: 0, filter: "blur(10px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power3.out" },
        );

        gsap.fromTo(
          heroVisualRef.current,
          { x: 48, opacity: 0, rotate: 1.5, scale: 0.96 },
          { x: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.12 },
        );

        gsap.to(heroVisualRef.current, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (awardsRef.current) {
        const cards = gsap.utils.toArray<HTMLElement>("[data-award-card='true']", awardsRef.current);
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 36, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 82%",
              },
              delay: index * 0.03,
            },
          );
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-open-source-typo min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 md:pt-24 pb-16 md:pb-20">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden border-y border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.16),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.18),transparent_26%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]" />
          <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
          <div className="relative w-full px-4 py-12 md:px-6 md:py-20 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div ref={heroCopyRef} className="relative rounded-[2rem] border border-border/60 bg-background/70 p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.55)] backdrop-blur md:p-8 xl:p-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <Compass className="h-4 w-4" />
                  Architect • Builder • Author
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 tracking-tight">
                  About <span className="gradient-text">Abhishek</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  I'm a passionate .NET Architect, AI/ML Engineer, and Cloud-Native Specialist 
                  with over 12 years of experience building scalable, production-ready systems 
                  that power businesses worldwide.
                </p>
                <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                  From designing microservices architectures for Fortune 500 companies to 
                  deploying ML models at scale, I bridge the gap between cutting-edge 
                  technology and real-world business value.
                </p>

                {/* Social Icons Row */}
                <div className="mb-6">
                  <HeroSocialIcons />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="hero" size="lg" onClick={() => setIsDownloadModalOpen(true)} className="relative group">
                    <span className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-primary via-secondary to-primary opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-lg">
                      <Download className="w-5 h-5" />
                      Download CV
                    </span>
                  </Button>
                  <Button asChild variant="hero" size="lg" className="relative group">
                    <Link to="/mentorship">
                      <span className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 opacity-70 blur-sm group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 rounded-lg text-white">
                        <Briefcase className="w-5 h-5" />
                        Mentorship
                      </span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setIsContactModalOpen(true)}
                    className="group relative overflow-hidden border-primary/30 hover:border-primary/50"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Me
                    </span>
                  </Button>
                </div>

                {/* Masked Phone Number */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setIsContactModalOpen(true)}
                  className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  📞 +91-8917-XXXXXX <span className="text-xs">(Tap to Request Full Number)</span>
                </motion.button>
              </div>

              {/* GSAP Infinite Card Slider */}
              <div ref={heroVisualRef} className="relative">
                <div className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary/12 via-transparent to-secondary/12 blur-2xl" />
                <GsapInfinitePhotoSlider items={heroImages} />
              </div>
            </div>
          </div>
        </section>


        {/* Tech Stack Showcase */}
        <TechStackShowcase />

        {/* Career Timeline */}
        <CareerTimeline />

        {/* Certifications */}
        <section ref={awardsRef} className="relative overflow-hidden py-12 md:py-20 bg-muted/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_24%)]" />
          <div className="relative w-full px-4 md:px-6 xl:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 md:mb-4 tracking-tight">
                <span className="gradient-text">Certifications</span> & Awards
              </h2>
            </motion.div>

            <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 md:gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  data-award-card="true"
                  className="glass-card-hover flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-2 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] md:px-5 md:py-3"
                >
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm md:text-base">{cert}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MyBooks Section */}
        <section id="mybooks" className="scroll-mt-24">
          <BooksSection />
        </section>

      </main>

      <Footer />
      <BookNewsletterPopup />
      
      <CVDownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />
      <ContactIntentModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default About;
