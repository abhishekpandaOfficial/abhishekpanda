import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

type OpenOwlAnimatedLogoProps = {
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
  animate?: boolean;
};

export function OpenOwlAnimatedLogo({
  className,
  imageClassName,
  size = "md",
  compact = false,
  animate = true,
}: OpenOwlAnimatedLogoProps) {
  const outerSize = compact
    ? "h-8 w-8"
    : size === "lg"
      ? "h-14 w-14"
      : size === "sm"
        ? "h-9 w-9"
        : "h-11 w-11";

  return (
    <div className={cn("relative inline-flex items-center justify-center", outerSize, className)}>
      {animate ? (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full border border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      <BrandLogo
        variant="openowl"
        size={size}
        className="h-full w-full justify-center rounded-full px-1.5"
        imageClassName={cn("h-[82%] w-[82%] rounded-full object-contain", imageClassName)}
      />

      {animate ? (
        <>
          <motion.span
            className="pointer-events-none absolute left-[31%] top-[43%] h-[12%] w-[12%] rounded-full bg-black/55 dark:bg-white/60"
            animate={{ scaleY: [0, 0, 1, 1, 0, 0] }}
            transition={{ duration: 4.3, repeat: Infinity, times: [0, 0.7, 0.76, 0.8, 0.84, 1] }}
          />
          <motion.span
            className="pointer-events-none absolute right-[31%] top-[43%] h-[12%] w-[12%] rounded-full bg-black/55 dark:bg-white/60"
            animate={{ scaleY: [0, 0, 1, 1, 0, 0] }}
            transition={{ duration: 4.3, repeat: Infinity, times: [0, 0.7, 0.76, 0.8, 0.84, 1], delay: 0.08 }}
          />
        </>
      ) : null}
    </div>
  );
}
