import { NavLink } from "react-router-dom";
import { BarChart3, FileClock, Layers, Rocket, Settings, WandSparkles } from "lucide-react";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";
import { cn } from "@/lib/utils";

const items = [
  { to: "/openowl/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/openowl/admin/studio", label: "Studio", icon: WandSparkles },
  { to: "/openowl/admin/publish", label: "Publish", icon: Rocket },
  { to: "/openowl/admin/delivery", label: "Delivery Status", icon: FileClock },
  { to: "/openowl/admin/runs", label: "Runs & Traces", icon: Layers },
  { to: "/openowl/admin/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  return (
    <aside className="w-full border-b border-border bg-card/60 p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="mb-5 inline-flex items-center gap-2">
        <OpenOwlAnimatedLogo compact animate />
        <div>
          <div className="text-sm font-bold">OpenOwl</div>
          <div className="text-xs text-muted-foreground">Admin Center · Dev Preview</div>
        </div>
      </div>
      <nav className="grid gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
