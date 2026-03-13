import { Link, NavLink } from "react-router-dom";
import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", to: "/" },
  { label: "TechHub", to: "/blog/techhub" },
  { label: "Projects", to: "/products" },
  { label: "OpenOwl", to: "/openowl" },
  { label: "Contact", to: "/contact" },
];

export function OpenOwlHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <OpenOwlAnimatedLogo compact animate className="h-9 w-9" />
          <span className="text-sm font-semibold tracking-wide">OpenOwl</span>
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground md:inline-flex">
            Development Phase
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
