import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import perfectImperfectionistCover from "@/assets/books/perfect-imperfectionist-cover.jpg";

export const BookNewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("book-newsletter-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 15000); // Show after 15 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("book-newsletter-popup-seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "You're on the list!",
      description: "We'll notify you when 'The Perfect Imperfectionist' is released.",
    });
    
    setIsSubmitting(false);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Popup - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div className="relative bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Book Cover */}
                <div className="relative h-48 md:h-auto">
                  <img
                    src={perfectImperfectionistCover}
                    alt="The Perfect Imperfectionist"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-4 left-4 md:hidden">
                    <Badge className="bg-primary/90 text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Coming 2026
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="hidden md:inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium mb-4">
                    <Sparkles className="w-3 h-3" />
                    Coming 2026
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">
                    The Perfect Imperfectionist
                  </h3>
                  <p className="text-sm text-primary font-medium italic mb-3">
                    "The bravest act in a world of Filters is To live unfiltered"
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Be the first to know when this transformative book releases. Get exclusive early-bird offers and behind-the-scenes content.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted border-border"
                    />
                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Subscribing..."
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Notify Me on Release
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    By subscribing, you agree to receive book updates. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Badge component for the popup
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);
