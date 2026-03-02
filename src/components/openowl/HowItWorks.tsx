import { Database, SearchCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Ingest",
    icon: Database,
    text: "OpenOwl reads trusted context from your public profile, projects, and docs.",
  },
  {
    title: "Reason",
    icon: SearchCheck,
    text: "It synthesizes context into practical answers and structured next steps.",
  },
  {
    title: "Verify",
    icon: ShieldCheck,
    text: "Responses include source cues and external actions are marked for approval.",
  },
];

export function HowItWorks() {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, delay: index * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
            <div className="mb-3 inline-flex rounded-lg border border-border bg-background p-2">
              <card.icon className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
