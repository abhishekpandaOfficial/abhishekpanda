import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText } from "lucide-react";
import { SCRIPTURE_ICONS } from "@/content/scriptures";

type ScripturesHeaderProps = {
  title?: string;
  subtitle?: string;
};

export default function ScripturesHeader({
  title = "Scriptures",
  subtitle = "Explore guided scripture cards with tags, symbols, and focused long-form reading experience.",
}: ScripturesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-8 md:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <BookOpenText className="h-4 w-4" />
            Spiritual Library
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="flex items-center gap-2">
            {SCRIPTURE_ICONS.map((Icon, index) => (
              <span key={index} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
                <Icon className="h-5 w-5 text-foreground/80" />
              </span>
            ))}
          </div>
          <Link
            to="/scriptures"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_40px_rgba(59,130,246,0.18)] transition hover:translate-y-[-1px] hover:bg-primary/90"
          >
            Open Scriptures
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
