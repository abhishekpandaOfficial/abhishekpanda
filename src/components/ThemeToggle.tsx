import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={cn(
        "group relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background/80 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Sun className="h-[18px] w-[18px] scale-100 rotate-0 text-amber-500 transition-all duration-300 dark:scale-0 dark:-rotate-90" aria-hidden="true" />
      <Moon className="absolute h-[18px] w-[18px] scale-0 rotate-90 text-sky-300 transition-all duration-300 dark:scale-100 dark:rotate-0" aria-hidden="true" />
      <span className="sr-only">Switch to {nextTheme} mode</span>
    </button>
  );
}
