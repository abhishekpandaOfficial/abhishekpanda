import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { stackcraftTracks } from "@/lib/stackcraftTracks";

type Props = {
  limit?: number;
};

export function StackcraftTrackCards({ limit }: Props) {
  const tracks = typeof limit === "number" ? stackcraftTracks.slice(0, limit) : stackcraftTracks;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tracks.map((track, index) => (
        <motion.a
          key={track.title}
          href={track.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.03 }}
          whileHover={{ y: -6, scale: 1.02 }}
          style={{ ["--brand-rgb" as string]: track.rgb }}
          className="group glass-card brand-glow-card brand-square-glow rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-glow dark:bg-slate-900/85 dark:border-slate-700/70"
          aria-label={track.title}
          title={track.title}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                {track.logos.map((logo, logoIndex) => (
                  <span
                    key={`${track.title}-${logoIndex}`}
                    className="w-7 h-7 rounded-md bg-white/95 border border-white/70 p-1 flex items-center justify-center shadow-sm"
                  >
                    <img src={logo} alt="" className="w-full h-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>
              <div className="text-sm font-extrabold tracking-tight text-foreground dark:text-slate-50 leading-snug line-clamp-3">
                {track.title}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {track.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-[11px] font-semibold border border-border/60 bg-background/50 dark:bg-slate-800/80 dark:border-slate-600/70 text-foreground/80 dark:text-slate-200 group-hover:text-foreground dark:group-hover:text-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary/80 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70" />
          <div className="mt-4 text-xs text-muted-foreground dark:text-slate-300">
            Read on <span className="text-foreground font-semibold">Stackcraft</span>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
