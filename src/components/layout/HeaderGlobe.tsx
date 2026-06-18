import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type HeaderGlobeProps = {
  className?: string;
  compact?: boolean;
  to?: string;
};

export function HeaderGlobe({ className, compact = false, to = "/classified" }: HeaderGlobeProps) {
  const shellSize = compact ? "h-10 w-10" : "h-12 w-12";
  const coreInset = compact ? "inset-[5px]" : "inset-[6px]";
  const lineInset = compact ? "inset-[7px]" : "inset-[8px]";

  return (
    <Link
      to={to}
      aria-label="Open ARGUS VIII global view"
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-sky-400/20 bg-slate-950/75 px-2.5 py-2 backdrop-blur-xl shadow-[0_10px_28px_rgba(2,6,23,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:shadow-[0_14px_34px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 dark:border-sky-400/25 dark:bg-slate-950/70",
        className
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden rounded-full", shellSize)}>
        <motion.div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(125,211,252,0.95),rgba(14,116,144,0.42)_38%,rgba(2,6,23,0.98)_100%)] shadow-[0_0_28px_rgba(56,189,248,0.35)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className={cn("absolute rounded-full border border-white/15", coreInset)} />
        <motion.div
          className={cn(
            "absolute rounded-full border border-sky-200/35",
            lineInset
          )}
          style={{ clipPath: "ellipse(50% 38% at 50% 50%)" }}
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={cn(
            "absolute rounded-full border border-cyan-300/30",
            lineInset
          )}
          style={{ clipPath: "ellipse(30% 50% at 50% 50%)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.26),transparent)]"
          animate={{ x: ["-110%", "110%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.95)]"
          animate={{
            x: [0, 12, 0, -12, 0],
            y: [-14, 0, 14, 0, -14],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {!compact ? (
        <div className="hidden min-[1140px]:block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/85">
            World Live
          </div>
          <div className="text-[10px] text-muted-foreground">
            Open ARGUS VIII preview
          </div>
        </div>
      ) : null}
    </Link>
  );
}
