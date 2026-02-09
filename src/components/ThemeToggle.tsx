import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Switch color mode"
      className={cn(
        "group relative inline-flex h-9 w-[70px] items-center rounded-full border px-1",
        "border-primary/20 bg-card/80 backdrop-blur transition-all duration-300",
        "hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.22),0_10px_24px_hsl(var(--primary)/0.16)]",
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-70" />

      <span className="relative z-10 flex w-full items-center justify-between px-2">
        <Sun className={cn("h-3.5 w-3.5 transition-colors", isDark ? "text-muted-foreground/80" : "text-amber-500")} />
        <Moon className={cn("h-3.5 w-3.5 transition-colors", isDark ? "text-sky-300" : "text-muted-foreground/80")} />
      </span>

      <span
        className={cn(
          "absolute top-1 h-7 w-7 rounded-full border border-primary/30 bg-background shadow-md",
          "transition-all duration-300 ease-out",
          isDark ? "left-[34px]" : "left-1",
        )}
      >
        <span className="flex h-full w-full items-center justify-center">
          {isDark ? <Moon className="h-3.5 w-3.5 text-sky-300" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
        </span>
      </span>
    </button>
  );
}
