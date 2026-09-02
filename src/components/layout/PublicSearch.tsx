import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchSubstackArchive } from "@/lib/substack";

type SearchSection = SiteSearchSection | "StackedIN Posts";

const sectionIcons: Record<SiteSearchSection, typeof Sparkles> = {
  "Main Pages": Sparkles,
  Projects: FolderOpen,
  "Engineering Series": BookOpen,
  "AI/ML Series": Brain,
  "Blog Posts": FileText,
  Articles: Newspaper,
  Scriptures: BookOpen,
};

const sectionOrder: SearchSection[] = [
  "Main Pages",
  "StackedIN Posts",
  "Projects",
  "Engineering Series",
  "AI/ML Series",
  "Blog Posts",
  "Articles",
  "Scriptures",
];

type PublicSearchProps = {
  mobile?: boolean;
  iconOnly?: boolean;
};

export function PublicSearch({ mobile = false, iconOnly = false }: PublicSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: substackArchive } = useQuery({
    queryKey: ["stackedin-substack-archive"],
    queryFn: () => fetchSubstackArchive(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

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

  const groupedItems = useMemo(() => {
    const substackItems = (substackArchive?.posts || []).map((post) => ({
      id: `stackedin-${post.id}`,
      title: post.title,
      description: post.subtitle || `${post.readingTimeMinutes} min read on StackedIN`,
      href: `/blog/stackedin/${post.slug}`,
      section: "StackedIN Posts" as const,
      keywords: ["stackedin", "substack", post.title, post.subtitle || ""],
    }));
    const searchableItems = [...SITE_SEARCH_ITEMS, ...substackItems];

    return (
      sectionOrder
        .map((section) => ({
          section,
          items: searchableItems.filter((item) => item.section === section),
        }))
        .filter((group) => group.items.length > 0)
    );
  }, [substackArchive?.posts]);

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
              const SectionIcon = section === "StackedIN Posts" ? null : sectionIcons[section];
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
                        {SectionIcon ? <SectionIcon className="h-4 w-4 text-primary" /> : <img src="/brand/stackedin/icon.webp" alt="" className="h-5 w-5 object-contain" />}
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
      {!iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group hidden min-[1120px]:inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-background/85 px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground"
          aria-label="Open advanced search"
        >
          <Search className="h-4 w-4 text-primary/80" />
          <span>Search</span>
          <span className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
            Ctrl K
          </span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/85 text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground ${iconOnly ? "inline-flex" : "inline-flex min-[1120px]:hidden"}`}
        aria-label="Open advanced search"
        title="Advanced search"
      >
        <Search className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search posts, pages, series, articles, and scriptures..." />
        <CommandList className="max-h-[70vh]">
          <CommandEmpty>No website results found.</CommandEmpty>
          {groupedItems.map(({ section, items }) => {
            const SectionIcon = section === "StackedIN Posts" ? null : sectionIcons[section];
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
                      {SectionIcon ? <SectionIcon className="h-4 w-4 text-primary" /> : <img src="/brand/stackedin/icon.webp" alt="" className="h-5 w-5 object-contain" />}
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
