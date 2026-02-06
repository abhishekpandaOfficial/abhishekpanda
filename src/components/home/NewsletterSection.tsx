import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail("");
    
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive the latest updates in your inbox.",
    });
  };

  return (
    <section id="newsletter" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-purple/10" />
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-lg"
          >
            <Mail className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h2 className="section-title mb-4">
            Stay in the <span className="gradient-text">Loop</span>
          </h2>
          <p className="section-subtitle mx-auto mb-8">
            Get exclusive insights, early access to courses, and curated engineering content 
            delivered straight to your inbox. No spam, ever.
          </p>

          {/* Form */}
          {!isSubscribed ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border focus:border-primary rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isSubmitting}
                className="h-12"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 max-w-md mx-auto flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">You're subscribed!</p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for a welcome email.
                </p>
              </div>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-accent" />
              Free forever
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-accent" />
              Unsubscribe anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-accent" />
              Weekly digest
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
