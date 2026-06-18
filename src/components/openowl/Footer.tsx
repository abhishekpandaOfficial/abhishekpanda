import { ShieldCheck, BookText, Lock } from "lucide-react";
import { HeroSocialIcons } from "@/components/about/HeroSocialIcons";

export function OpenOwlFooter() {
  return (
    <footer className="mt-10 rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Privacy first
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <BookText className="h-3.5 w-3.5" />
          Citation aware
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Safe actions
        </div>
      </div>
      <HeroSocialIcons className="justify-start" />
      <p className="mt-4 text-xs text-muted-foreground">
        OpenOwl platform · AbhishekPanda Assistant persona · Open-source LLM routing coming soon
      </p>
    </footer>
  );
}
