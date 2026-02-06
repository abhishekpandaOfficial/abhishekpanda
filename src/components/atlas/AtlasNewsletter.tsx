import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, CheckCircle, Bell, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const benefits = [
  { icon: TrendingUp, text: "Weekly benchmark updates" },
  { icon: Sparkles, text: "New model launches" },
  { icon: Bell, text: "Research insights" },
  { icon: Zap, text: "Performance alerts" },
];

export const AtlasNewsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    // Simulate subscription
    setIsSubscribed(true);
    toast.success("Welcome to the Global LLM Digest!");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Global LLM Digest</span>
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
                Stay Ahead of the{" "}
                <span className="atlas-gradient-text">AI Revolution</span>
              </h2>
              
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                Get weekly updates on benchmark shifts, model launches, and research insights delivered straight to your inbox.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <benefit.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 text-base rounded-xl"
                  />
                  <Button type="submit" variant="hero" size="lg" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Subscribe
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 max-w-lg mx-auto"
                >
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-semibold text-green-600">You're subscribed! Check your inbox.</span>
                </motion.div>
              )}

              {/* Trust Text */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Join 50,000+ AI researchers, engineers, and enthusiasts. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};