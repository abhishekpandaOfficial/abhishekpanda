import { ArrowDown, ArrowRight, ArrowUp, Flame, ListOrdered, Mail, Newspaper, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { LongformTocItem } from "@/lib/longformNavigation";
import { Button } from "@/components/ui/button";

export type LongformSidebarLink = {
  title: string;
  to: string;
  description?: string;
};

export type LongformSidebarAction = {
  key: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  accentClass?: string;
};

type LongformSidebarProps = {
  readMinutes: number;
  progressPercent: number;
  toc: LongformTocItem[];
  activeHeadingId: string | null;
  popularTitle?: string;
  popularItems: LongformSidebarLink[];
  popularCta?: { label: string; to: string };
  secondaryTitle?: string;
  secondaryItems?: LongformSidebarLink[];
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterTo?: string;
  onTocClick: (id: string) => void;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  actions?: LongformSidebarAction[];
  showMobileActions?: boolean;
};

export function LongformSidebar({
  readMinutes,
  progressPercent,
  toc,
  activeHeadingId,
  popularTitle = "Popular Articles",
  popularItems,
  popularCta = { label: "View all articles", to: "/blogs" },
  secondaryTitle,
  secondaryItems = [],
  newsletterTitle = "Stay ahead in engineering",
  newsletterDescription = "Join the newsletter for architecture, cloud, AI, and software engineering insights from this website.",
  newsletterTo = "/#newsletter",
  onTocClick,
  onScrollTop,
  onScrollBottom,
  actions = [],
  showMobileActions = false,
}: LongformSidebarProps) {
  const activeIndex = toc.findIndex((item) => item.id === activeHeadingId);
  const minutesRead = Math.max(0, Math.round((readMinutes * progressPercent) / 100));
  const minutesRemaining = Math.max(readMinutes - minutesRead, 0);

  return (
    <div className="space-y-4">
      {actions.length ? (
        <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
          <div className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-foreground">Quick Actions</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className="flex h-auto flex-col items-center gap-1 py-3"
                >
                  <Icon className={`h-4 w-4 ${action.accentClass || ""}`.trim()} />
                  <span className="text-[10px]">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
            <Flame className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">{popularTitle}</p>
        </div>

        <div className="mt-4 space-y-2">
          {popularItems.length ? (
            popularItems.map((item, index) => (
              <Link
                key={`${item.to}-${index}`}
                to={item.to}
                className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
              >
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-sm font-medium text-foreground">{item.title}</span>
                  {item.description ? (
                    <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{item.description}</span>
                  ) : null}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">More long-form reads will appear here as you add content.</p>
          )}
        </div>

        <Link
          to={popularCta.to}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
        >
          {popularCta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {toc.length ? (
        <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <ListOrdered className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-foreground">On This Page</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeIndex >= 0 ? activeIndex + 1 : 1} / {toc.length}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(rgb(99 102 241) ${progressPercent}%, rgb(226 232 240) 0%)` }}
              />
              <div className="absolute inset-[6px] rounded-full bg-background" />
              <span className="relative">{progressPercent}%</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>{readMinutes} min total</p>
              <p>{minutesRead} min read</p>
              <p>{minutesRemaining} min pending</p>
            </div>
          </div>

          <nav className="mt-4 max-h-72 space-y-1 overflow-auto pr-1">
            {toc.map((item, index) => {
              const active = item.id === activeHeadingId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTocClick(item.id)}
                  className={`block w-full rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${item.depth === 3 ? "ml-4 w-[calc(100%-1rem)]" : ""}`}
                >
                  <span className="mr-2 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  {item.text}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onScrollTop}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowUp className="h-4 w-4" />
              Top
            </button>
            <button
              type="button"
              onClick={onScrollBottom}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowDown className="h-4 w-4" />
              Bottom
            </button>
          </div>
        </div>
      ) : null}

      {secondaryTitle && secondaryItems.length ? (
        <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
          <div className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
              <Newspaper className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-foreground">{secondaryTitle}</p>
          </div>

          <div className="mt-4 space-y-3">
            {secondaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-xl border border-border bg-background px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-800 p-5 text-white shadow-sm">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-6 h-16 w-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/85">
            <Mail className="h-4 w-4" />
            Newsletter
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight">{newsletterTitle}</h3>
          <p className="mt-2 text-sm leading-7 text-white/80">{newsletterDescription}</p>
          <Link
            to={newsletterTo}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Join the newsletter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {showMobileActions && actions.length ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 border-t border-border bg-background/95 px-3 py-2 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={`mobile-${action.key}`}
                type="button"
                size="sm"
                variant="outline"
                disabled={action.disabled}
                onClick={action.onClick}
                className="flex h-auto max-w-[92px] flex-1 flex-col items-center gap-0.5 py-2"
              >
                <Icon className={`h-3.5 w-3.5 ${action.accentClass || ""}`.trim()} />
                <span className="text-[9.5px]">{action.shortLabel || action.label}</span>
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
