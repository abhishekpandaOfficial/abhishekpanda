import { motion } from "framer-motion";
import { BookOpen, Compass, Network, Sparkles } from "lucide-react";

const steps = [
  {
    title: "What",
    text: "LLM Galaxy is your full model intelligence map: rankings, open/closed source split, capability tags, benchmark data, and links.",
    icon: BookOpen,
  },
  {
    title: "Why",
    text: "It helps you pick the right model faster by showing rank, strengths, use-cases, modality support, and source type in one place.",
    icon: Sparkles,
  },
  {
    title: "How",
    text: "Use Search -> Use Open/Closed category buttons -> Open model popup -> Compare benchmarks -> choose model links/docs.",
    icon: Compass,
  },
];

export const GalaxyHowItWorks = () => {
  return (
    <section className="py-14 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="rounded-3xl border border-primary/20 bg-card/70 backdrop-blur p-6 md:p-8">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Network className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">LLM Galaxy Guide</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {steps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="w-4 h-4 text-primary" />
                    <div className="text-sm font-bold text-foreground">{step.title}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <h3 className="text-sm font-bold text-foreground mb-2">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">
                This page does not expose API keys, database credentials, or internal secrets. ABHIBOT responses are restricted to safe public context.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
