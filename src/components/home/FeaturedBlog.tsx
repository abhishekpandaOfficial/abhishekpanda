import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StackcraftTrackCards } from "@/components/blog/StackcraftTrackCards";
import { stackcraftProfileUrl } from "@/lib/stackcraftTracks";

export const FeaturedBlog = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Stackcraft Tracks
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium learning tracks and deep dives across architecture, cloud, data, and AI.
          </p>
        </motion.div>

        <div className="mb-12">
          <StackcraftTrackCards />
        </div>

        <div className="text-center">
          <Button variant="hero-outline" size="lg" asChild>
            <a href={stackcraftProfileUrl} target="_blank" rel="noopener noreferrer">
              Explore on Stackcraft
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
