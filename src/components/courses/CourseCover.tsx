import type { CourseCatalogItem } from "@/content/courses";
import { cn } from "@/lib/utils";

type CourseCoverProps = {
  course: Pick<CourseCatalogItem, "slug" | "title" | "category" | "tags" | "thumbnail">;
  className?: string;
  compact?: boolean;
};

const COVER_GRADIENTS = [
  "from-sky-500/25 via-cyan-500/15 to-emerald-500/25",
  "from-amber-500/25 via-orange-500/15 to-rose-500/25",
  "from-violet-500/25 via-fuchsia-500/15 to-blue-500/25",
  "from-emerald-500/25 via-lime-500/15 to-sky-500/25",
  "from-slate-500/25 via-indigo-500/15 to-cyan-500/25",
];

const hashSlug = (slug: string) =>
  slug.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

const extractInitials = (title: string) => {
  const initials = title
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "AP";
};

export function CourseCover({ course, className, compact = false }: CourseCoverProps) {
  if (course.thumbnail) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>
    );
  }

  const gradient = COVER_GRADIENTS[hashSlug(course.slug) % COVER_GRADIENTS.length];
  const initials = extractInitials(course.title);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_45%)]" />

      <div className="relative flex h-full flex-col justify-between p-5 text-foreground">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/30 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm backdrop-blur">
            {course.category}
          </span>
          <div className="rounded-2xl border border-white/20 bg-background/75 px-4 py-2 text-2xl font-black tracking-tight shadow-sm backdrop-blur">
            {initials || "AP"}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {course.tags.slice(0, compact ? 2 : 3).map((tag) => (
              <span
                key={`${course.slug}-${tag}`}
                className="rounded-full border border-white/25 bg-background/75 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
          {!compact ? (
            <h3 className={cn("mt-4 font-black tracking-tight text-foreground", "text-3xl")}>
              {course.title}
            </h3>
          ) : null}
        </div>
      </div>
    </div>
  );
}
