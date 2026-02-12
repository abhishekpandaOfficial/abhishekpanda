import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CVDownloadModal } from "@/components/cv/CVDownloadModal";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { TechStackShowcase } from "@/components/about/TechStackShowcase";

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
import casual from "@/assets/about/casual.jpg";
import lifestyle from "@/assets/about/lifestyle.jpg";
import artistic from "@/assets/about/artistic.jpg";
import family from "@/assets/about/family.jpg";

const heroImages = [
  {
    src: professional,
    alt: "Professional",
    title: "Professional",
    caption: "Leadership & Architecture",
    borderGradient: "linear-gradient(135deg, #22d3ee, #3b82f6, #6366f1)",
    badgeColor: "bg-cyan-500/85 text-white",
    icon: Briefcase,
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
    src: casual,
    alt: "Explorer",
    title: "Explorer",
    caption: "Curious & Grounded",
    borderGradient: "linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)",
    badgeColor: "bg-emerald-500/85 text-white",
    icon: Compass,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const constraintsRef = useRef(null);
  const activeImage = heroImages[currentImageIndex];

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Longer for Ken Burns effect
    return () => clearInterval(interval);
  }, []);

  // Handle swipe gestures
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    } else if (info.offset.x < -threshold) {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 md:pt-24 pb-16 md:pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>

              {/* Apple-style Image Gallery with Swipe & Ken Burns */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div 
                  ref={constraintsRef}
                  className="relative w-72 h-80 sm:w-80 sm:h-96 md:w-[400px] md:h-[480px] mx-auto"
                >
                  {/* Glow effect */}
                  <motion.div
                    key={`glow-${currentImageIndex}`}
                    className="absolute -inset-5 rounded-[2rem] blur-2xl"
                    style={{
                      backgroundImage: activeImage.borderGradient,
                      opacity: 0.35,
                    }}
                    initial={{ opacity: 0.1, scale: 0.95 }}
                    animate={{ opacity: 0.35, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    key={`frame-${currentImageIndex}`}
                    className="absolute -inset-1 rounded-[1.8rem] p-[2px]"
                    style={{ backgroundImage: activeImage.borderGradient }}
                    initial={{ opacity: 0.5, rotate: -2 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    <div className="h-full w-full rounded-[1.65rem] bg-background/65 backdrop-blur-[1px]" />
                  </motion.div>
                  
                  {/* Main image container with swipe */}
                  <motion.div 
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/20 cursor-grab active:cursor-grabbing touch-pan-y"
                    drag="x"
                    dragConstraints={constraintsRef}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 overflow-hidden"
                      >
                        {/* Ken Burns Effect - slow zoom animation */}
                        <motion.img
                          src={heroImages[currentImageIndex].src}
                          alt={heroImages[currentImageIndex].alt}
                          initial={{ scale: 1 }}
                          animate={{ scale: 1.15 }}
                          transition={{ 
                            duration: 5, 
                            ease: "linear"
                          }}
                          className="w-full h-full object-cover object-top"
                          draggable={false}
                        />
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />

                    <motion.div
                      key={`icon-badge-${currentImageIndex}`}
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className={`absolute top-4 left-4 md:top-5 md:left-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm shadow-lg ${activeImage.badgeColor}`}
                    >
                      <activeImage.icon className="w-3.5 h-3.5" />
                      {activeImage.title}
                    </motion.div>

                    <motion.div
                      key={`caption-badge-${currentImageIndex}`}
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="absolute right-4 bottom-4 md:right-5 md:bottom-5 rounded-full bg-black/45 text-white text-[11px] md:text-xs px-3 py-1.5 backdrop-blur-sm"
                    >
                      {activeImage.caption}
                    </motion.div>
                    
                    {/* Swipe hint on mobile */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                      <motion.div
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs text-foreground/70 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full"
                      >
                        ← Swipe →
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Thumbnail dots */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index
                            ? "w-7"
                            : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                        }`}
                        style={
                          currentImageIndex === index
                            ? { backgroundImage: image.borderGradient }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Tech Stack Showcase */}
        <TechStackShowcase />

        {/* Career Timeline */}
        <CareerTimeline />

        {/* Certifications */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
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

            <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card-hover rounded-xl px-4 py-2 md:px-5 md:py-3 flex items-center gap-2"
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
