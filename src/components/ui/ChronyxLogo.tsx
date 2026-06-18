import { cn } from "@/lib/utils";
import chronyxLogo from "@/assets/chronyx-logo.svg";

type ChronyxLogoProps = {
  className?: string;
  imageClassName?: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
};

export const ChronyxLogo = ({ className, imageClassName, compact = false, size = "md" }: ChronyxLogoProps) => {
  const baseSize = compact
    ? "h-6 w-6"
    : size === "lg"
      ? "h-11 w-11"
      : size === "sm"
        ? "h-7 w-7"
        : "h-9 w-9";

  return (
    <div className={cn("inline-flex items-center justify-center rounded-full bg-slate-950/95 ring-1 ring-slate-300/40 shadow-[0_0_20px_rgba(226,232,240,0.22)] p-0.5", className)}>
      <img
        src={chronyxLogo}
        alt="CHRONYX logo"
        className={cn(baseSize, imageClassName)}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
