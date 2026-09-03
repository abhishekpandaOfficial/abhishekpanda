import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadingModeToggleProps = {
  active: boolean;
  onToggle: () => void;
};

export function ReadingModeToggle({ active, onToggle }: ReadingModeToggleProps) {
  const Icon = active ? X : BookOpen;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Exit reading mode" : "Enter reading mode"}
      className={cn(
        "fixed right-4 z-[70] inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur transition",
        active ? "top-4 border-slate-300 bg-white text-slate-900 hover:bg-slate-100" : "top-20 border-slate-200 bg-white/95 text-slate-800 hover:border-blue-300 hover:text-blue-700",
      )}
    >
      <Icon className="h-4 w-4" />
      {active ? "Exit reading mode" : "Reading mode"}
    </button>
  );
}
