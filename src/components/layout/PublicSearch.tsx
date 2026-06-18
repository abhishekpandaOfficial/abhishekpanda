import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, FileText, FolderOpen, Newspaper, Search, Sparkles } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { SITE_SEARCH_ITEMS, type SiteSearchSection } from "@/lib/siteSearch";

const sectionIcons: Record<SiteSearchSection, typeof Sparkles> = {
  "Main Pages": Sparkles,
  Projects: FolderOpen,
  "Engineering Series": BookOpen,
  "AI/ML Series": Brain,
  "Blog Posts": FileText,
  Articles: Newspaper,
  Scriptures: BookOpen,
};

const sectionOrder: SiteSearchSection[] = [
  "Main Pages",
  "Projects",
  "Engineering Series",
  "AI/ML Series",
  "Blog Posts",
  "Articles",
  "Scriptures",
];

type PublicSearchProps = {
  mobile?: boolean;
};

export function PublicSearch({ mobile = false }: PublicSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable;

      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (!isTypingTarget && event.key === "/")) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const groupedItems = useMemo(
    () =>
      sectionOrder
        .map((section) => ({
          section,
          items: SITE_SEARCH_ITEMS.filter((item) => item.section === section),
        }))
        .filter((group) => group.items.length > 0),
    [],
  );

  const openItem = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  if (mobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <Search className="h-5 w-5 shrink-0" />
          Search Website
        </button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search pages, series, articles, scriptures..." />
          <CommandList className="max-h-[65vh]">
            <CommandEmpty>No website results found.</CommandEmpty>
            {groupedItems.map(({ section, items }) => {
              const SectionIcon = sectionIcons[section];
              return (
                <CommandGroup key={section} heading={section}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.description} ${item.keywords.join(" ")} ${item.section}`}
                      onSelect={() => openItem(item.href)}
                      className="items-start gap-3 rounded-xl px-3 py-3"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                        <SectionIcon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</div>
                        <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </CommandDialog>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group hidden min-[1120px]:inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-background/85 px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground"
        aria-label="Search the website"
      >
        <Search className="h-4 w-4 text-primary/80" />
        <span>Search</span>
        <span className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
          Ctrl K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/85 text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground min-[1120px]:hidden"
        aria-label="Search the website"
      >
        <Search className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, mastery series, articles, scriptures..." />
        <CommandList className="max-h-[70vh]">
          <CommandEmpty>No website results found.</CommandEmpty>
          {groupedItems.map(({ section, items }) => {
            const SectionIcon = sectionIcons[section];
            return (
              <CommandGroup key={section} heading={section}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.description} ${item.keywords.join(" ")} ${item.section}`}
                    onSelect={() => openItem(item.href)}
                    className="items-start gap-3 rounded-xl px-3 py-3"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                      <SectionIcon className="h-4 w-4 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</div>
                    </div>
                    <CommandShortcut>{section}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default PublicSearch;
