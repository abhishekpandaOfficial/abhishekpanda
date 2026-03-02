import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "@/components/openowl/ChatPanel";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";

export default function OpenOwlAssistant() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/openowl" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to OpenOwl
          </Link>
          <div className="inline-flex items-center gap-2">
            <OpenOwlAnimatedLogo compact animate />
            <span className="text-sm font-semibold">AbhishekPanda Assistant</span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground md:inline-flex">
              Development
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ChatPanel />
      </main>
    </div>
  );
}
