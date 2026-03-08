import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

type BrandVariant = "abhishek" | "openowl" | "originx" | "proxinex";

type BrandLogoProps = {
  variant: BrandVariant;
  alt?: string;
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg";
};

const sources: Record<BrandVariant, string> = {
  abhishek: "/Abhishek.PNG",
  openowl: "/openOwl-logo.PNG",
  originx: "/OriginXLabs-Logo-Final.png",
  proxinex: "/proxinex-logo.svg",
};

const fallbacks: Partial<Record<BrandVariant, string>> = {
  openowl: "/openOwl-logo2.PNG",
};

const sizeClasses = {
  sm: "h-7 px-2",
  md: "h-9 px-2.5",
  lg: "h-11 px-3",
};

export function BrandLogo({ variant, alt, className, imageClassName, size = "md" }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();

  const src = useMemo(() => {
    if (hasError && fallbacks[variant]) return fallbacks[variant] as string;
    return sources[variant];
  }, [hasError, variant]);

  const containerTone = useMemo(() => {
    if (variant === "abhishek") return "border-transparent bg-transparent shadow-none";
    if (variant === "openowl") {
      return theme === "dark"
        ? "border-white/20 bg-black/90 shadow-[0_0_18px_rgba(148,163,184,0.24)]"
        : "border-black/15 bg-white/95 shadow-[0_10px_20px_rgba(15,23,42,0.1)]";
    }
    return theme === "dark" ? "border-white/15 bg-black/85" : "border-black/15 bg-white/95";
  }, [theme, variant]);

  const imageFilter = useMemo(() => {
    if (variant === "openowl") {
      return theme === "dark"
        ? "grayscale(1) invert(1) contrast(1.25) brightness(1.16)"
        : "grayscale(1) contrast(1.12) brightness(0.55)";
    }
    if (variant === "originx" || variant === "proxinex") {
      return theme === "dark"
        ? "grayscale(1) invert(1) contrast(1.18) brightness(1.1)"
        : "grayscale(1) contrast(1.14) brightness(0.42)";
    }
    return undefined;
  }, [theme, variant]);

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-lg border shadow-sm",
        sizeClasses[size],
        containerTone,
        className,
      )}
    >
      <img
        src={src}
        alt={alt || `${variant} logo`}
        onError={() => setHasError(true)}
        className={cn("h-full w-auto object-contain", imageClassName)}
        style={imageFilter ? { filter: imageFilter } : undefined}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
