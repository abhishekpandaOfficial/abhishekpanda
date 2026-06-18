import { Bell, Search } from "lucide-react";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
      <div className="inline-flex items-center gap-2">
        <OpenOwlAnimatedLogo compact animate className="h-8 w-8" />
        <h1 className="text-sm font-semibold tracking-wide">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted" aria-label="Search">
          <Search className="h-4 w-4" />
        </button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
