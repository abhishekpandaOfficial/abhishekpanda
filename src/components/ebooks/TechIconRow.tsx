import { TechIcon } from "@/components/ebooks/TechIcon";

type Props = {
  techStack: string[];
  compact?: boolean;
};

export function TechIconRow({ techStack, compact = false }: Props) {
  const uniqueStack = Array.from(
    new Set(
      techStack
        .filter(Boolean)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.toUpperCase() === "DDD" ? "DDD" : t)
    )
  );
  return (
    <div className="flex flex-wrap gap-2 gap-y-2 min-w-0">
      {uniqueStack.map((tech) => (
        <span
          key={tech}
          className={`inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 max-w-[180px] min-w-0 ${compact ? "text-[10px]" : "text-xs"}`}
          title={tech}
        >
          <TechIcon tech={tech} className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span className="text-foreground/85 truncate">{tech}</span>
        </span>
      ))}
    </div>
  );
}
