import { useEffect, useMemo, useState } from "react";
import type { CourseCatalogItem } from "@/content/courses";
import { cn } from "@/lib/utils";
import { getCourseVisual } from "@/lib/courseVisuals";

type CourseCoverProps = {
  course: Pick<CourseCatalogItem, "slug" | "title" | "category" | "tags" | "thumbnail">;
  className?: string;
  compact?: boolean;
  sessionTitles?: string[];
  lessonCount?: number;
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

const STACK_LOGO_MAP: Record<string, string> = {
  ".net": "/brand-logos/stacks/dotnet.svg",
  "c#": "/brand-logos/stacks/csharp.svg",
  "web api": "/brand-logos/stacks/dotnet.svg",
  "kafka": "/brand-logos/stacks/kafka.svg",
  "azure": "/brand-logos/stacks/microsoftazure.svg",
  "aws": "/brand-logos/stacks/aws.svg",
  "postgresql": "/brand-logos/stacks/postgresql.svg",
  "docker": "/brand-logos/stacks/docker.svg",
  "kubernetes": "/brand-logos/stacks/kubernetes.svg",
  "redis": "/brand-logos/stacks/redis.svg",
  "react": "/brand-logos/stacks/react.svg",
  "typescript": "/brand-logos/stacks/typescript.svg",
  "python": "/brand-logos/stacks/python.svg",
  "openai": "/brand-logos/stacks/openai.svg",
  "langchain": "/brand-logos/stacks/langchain.svg",
};

const resolveStackLogos = (tags: string[]) => {
  const logos: string[] = [];
  for (const rawTag of tags) {
    const tag = rawTag.toLowerCase();
    const entry = Object.entries(STACK_LOGO_MAP).find(([needle]) => tag.includes(needle));
    if (entry && !logos.includes(entry[1])) logos.push(entry[1]);
    if (logos.length >= 3) break;
  }
  return logos;
};

const getPreviewWindow = (sessionTitles: string[], start: number, count = 3) => {
  if (!sessionTitles.length) return [];
  const result: string[] = [];
  for (let i = 0; i < Math.min(count, sessionTitles.length); i += 1) {
    result.push(sessionTitles[(start + i) % sessionTitles.length]);
  }
  return result;
};

export function CourseCover({
  course,
  className,
  compact = false,
  sessionTitles = [],
  lessonCount = 0,
}: CourseCoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const previewSessions = useMemo(
    () => getPreviewWindow(sessionTitles, previewIndex, 3),
    [sessionTitles, previewIndex],
  );
  const stackLogos = useMemo(() => resolveStackLogos(course.tags), [course.tags]);
  const visual = useMemo(() => getCourseVisual(course), [course]);

  useEffect(() => {
    if (!isHovered || sessionTitles.length <= 1) return;
    const interval = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % sessionTitles.length);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [isHovered, sessionTitles.length]);

  if (visual && !imageFailed) {
    return (
      <div
        className={cn("relative overflow-hidden bg-muted", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={visual}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        {compact ? (
          <>
            <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/35 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {sessionTitles.length || 0} sessions
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-10 bg-gradient-to-t from-black/85 via-black/65 to-transparent p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Session Preview · {lessonCount} lessons
              </p>
              <div className="mt-2 space-y-1.5">
                {previewSessions.map((session, index) => (
                  <p key={`${course.slug}-session-${session}`} className="line-clamp-1 text-xs font-medium text-white/95">
                    S{index + 1}. {session}
                  </p>
                ))}
              </div>
            </div>
            {stackLogos.length ? (
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5">
                {stackLogos.map((logo) => (
                  <span key={`${course.slug}-${logo}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-black/35 p-1 backdrop-blur">
                    <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_45%)]" />
      {compact ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/35 bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
          {sessionTitles.length || 0} sessions
        </div>
      ) : null}

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

      {compact ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-10 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Session Preview · {lessonCount} lessons
          </p>
          <div className="mt-2 space-y-1.5">
            {previewSessions.map((session, index) => (
              <p key={`${course.slug}-session-${session}`} className="line-clamp-1 text-xs font-medium text-white/95">
                S{index + 1}. {session}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {compact && stackLogos.length ? (
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5">
          {stackLogos.map((logo) => (
            <span key={`${course.slug}-${logo}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-black/25 p-1 backdrop-blur">
              <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
