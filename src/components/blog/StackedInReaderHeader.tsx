import { Link } from "react-router-dom";
import { PublicSearch } from "@/components/layout/PublicSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

type StackedInReaderHeaderProps = {
  progressPercent?: number;
};

export function StackedInReaderHeader({ progressPercent = 0 }: StackedInReaderHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/blog/stackedin" className="group inline-flex min-w-0 items-center gap-2.5" aria-label="Open the StackedIN article archive">
          <img
            src="/brand/stackedin/icon.webp"
            alt=""
            className="h-10 w-10 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 dark:invert"
          />
          <img
            src="/brand/stackedin/wordmark.webp"
            alt="StackedIN"
            className="h-8 w-auto max-w-[150px] object-contain object-left dark:invert sm:h-9 sm:max-w-[180px]"
          />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PublicSearch iconOnly />
        </div>
      </div>
      <div className="h-0.5 bg-muted/40" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 transition-[width] duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
