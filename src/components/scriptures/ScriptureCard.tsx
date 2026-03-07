import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock3 } from "lucide-react";
import type { ScriptureRecord } from "@/content/scriptures";

type ScriptureCardProps = {
  scripture: ScriptureRecord;
};

const religionAccent = (religion: ScriptureRecord["religion"]) => {
  if (religion === "Hinduism") return "from-orange-500/15 to-rose-500/10 border-orange-300/35";
  if (religion === "Islam") return "from-emerald-500/15 to-blue-500/10 border-emerald-300/35";
  if (religion === "Christianity") return "from-blue-500/15 to-indigo-500/10 border-blue-300/35";
  if (religion === "Buddhism") return "from-amber-500/15 to-yellow-600/10 border-amber-300/35";
  return "from-primary/15 to-secondary/10 border-primary/25";
};

export default function ScriptureCard({ scripture }: ScriptureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br ${religionAccent(scripture.religion)} p-6 md:p-7`}
    >
      <div className="grid gap-5 md:grid-cols-[210px_minmax(0,1fr)] md:items-start">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/20">
          <img
            src={scripture.imageSrc}
            alt={`${scripture.religion} symbol for ${scripture.title}`}
            className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              {scripture.religion}
            </span>
            <span className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] font-semibold text-muted-foreground inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {scripture.readMinutes} min read
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{scripture.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{scripture.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {scripture.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/85">
                {tag}
              </span>
            ))}
          </div>

          <Link
            to={`/scriptures/${scripture.slug}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:bg-primary/90"
          >
            Open Scripture
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
