import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import images
import professional from "@/assets/about/professional.jpg";
import traditional from "@/assets/about/traditional.jpg";
import casual from "@/assets/about/casual.jpg";
import lifestyle from "@/assets/about/lifestyle.jpg";
import artistic from "@/assets/about/artistic.jpg";
import family from "@/assets/about/family.jpg";

const images = [
  { src: professional, label: "Professional", caption: "Corporate Excellence" },
  { src: traditional, label: "Traditional", caption: "Cultural Roots" },
  { src: casual, label: "Explorer", caption: "Mountain Serenity" },
  { src: lifestyle, label: "Lifestyle", caption: "Bold & Confident" },
  { src: artistic, label: "Artistic", caption: "Creative Vision" },
  { src: family, label: "Family", caption: "Moments That Matter" },
];

export const PhotoGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate images
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 tracking-tight">
            Beyond the <span className="gradient-text">Code</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Different facets of life that shape who I am
          </p>
        </motion.div>

        {/* Apple-style Gallery */}
        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Image Display */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-muted shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={images[activeIndex].src}
                  alt={images[activeIndex].label}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Caption */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`caption-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute bottom-8 left-8 md:bottom-12 md:left-12"
              >
                <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2 block">
                  {images[activeIndex].label}
                </span>
                <h3 className="text-2xl md:text-4xl font-black text-foreground">
                  {images[activeIndex].caption}
                </h3>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {String(images.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Thumbnail Navigation - Apple Style */}
          <div className="mt-8 flex justify-center gap-3 overflow-x-auto pb-4 px-4">
            {images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-shrink-0 group`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden transition-all duration-500 ${
                    activeIndex === index
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Active indicator */}
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="h-0.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                key={activeIndex}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ animationPlayState: isAutoPlaying ? "running" : "paused" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
