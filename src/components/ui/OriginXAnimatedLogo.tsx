import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type OriginXAnimatedLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const frameSize: Record<NonNullable<OriginXAnimatedLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const xSize: Record<NonNullable<OriginXAnimatedLogoProps["size"]>, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export function OriginXAnimatedLogo({ className, size = "md" }: OriginXAnimatedLogoProps) {
  const [src, setSrc] = useState("/Logo+word-OX-1.png");

  return (
    <span className={cn("relative inline-flex items-center justify-center", frameSize[size], className)} aria-label="Brand logo">
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full border border-primary/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="pointer-events-none absolute inset-[3px] rounded-full border border-secondary/45"
        animate={{ rotate: -360 }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
      />

      <img
        src={src}
        alt="Brand logo"
        onError={() => setSrc("/OriginXLabs-Logo-Final.png")}
        className="relative h-[68%] w-[68%] object-contain"
        loading="lazy"
        decoding="async"
      />

      <motion.span
        className={cn("pointer-events-none absolute font-black tracking-tight text-foreground/45", xSize[size])}
        animate={{ opacity: [0.28, 0.72, 0.28], scale: [1, 0.9, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        X
      </motion.span>
    </span>
  );
}
