import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AbhishekAnimatedLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
};

const frameSizes: Record<NonNullable<AbhishekAnimatedLogoProps["size"]>, string> = {
  sm: "h-8 w-8 rounded-xl",
  md: "h-10 w-10 rounded-2xl",
  lg: "h-12 w-12 rounded-2xl",
};

const dotSizes: Record<NonNullable<AbhishekAnimatedLogoProps["size"]>, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export function AbhishekAnimatedLogo({ className, size = "md", animate = true }: AbhishekAnimatedLogoProps) {
  const [src, setSrc] = useState("/logo.png");

  return (
    <span className={cn("relative inline-flex items-center justify-center", frameSizes[size], className)} aria-label="Abhishek Panda logo">
      <span className={cn("overflow-hidden border border-border/60 bg-white shadow-sm dark:bg-slate-900", frameSizes[size])}>
        <img
          src={src}
          alt="Abhishek Panda"
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
          onError={() => setSrc("/panda.svg")}
        />
      </span>

      {animate ? (
        <motion.span
          className={cn(
            "pointer-events-none absolute -right-0.5 -top-0.5 rounded-full bg-primary shadow-[0_0_14px_rgba(59,130,246,0.7)]",
            dotSizes[size],
          )}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.86, 1.2, 0.86] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </span>
  );
}
