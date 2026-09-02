import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchSubstackArchive } from "@/lib/substack";

export function StackedInSourceCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["stackedin-substack-archive"],
    queryFn: () => fetchSubstackArchive(),
    staleTime: 5 * 60 * 1000,
  });
  const postCount = data?.posts.length ?? 0;

  return (
    <section className="container mx-auto px-4 pb-12" aria-labelledby="stackedin-source-title">
      <Link
        to="/blog/stackedin"
        className="group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-950/5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-center"
      >
        <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
          <img src="/brand/stackedin/icon.webp" alt="StackedIN icon" className="h-32 w-32 object-contain" />
        </div>

        <div className="min-w-0 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6719]/25 bg-[#ff6719]/10 px-3 py-1.5 text-xs font-bold text-[#d84c00] dark:text-[#ff9b69]">
              <img src="/brand-logos/social/substack.svg" alt="" className="h-4 w-4 dark:invert" />
              Published on Substack
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" /> Auto-synced
            </span>
          </div>
          <h2 id="stackedin-source-title" className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">StackedIN Engineering Posts</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Read the complete StackedIN publication inside a focused, searchable, image-rich reader.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 font-bold text-primary">
            <FileText className="h-4 w-4" />
            {isLoading ? "Counting posts…" : `${postCount} ${postCount === 1 ? "post" : "posts"}`}
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 pb-6 font-bold text-foreground md:px-8 md:pb-0">
          Browse archive
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </section>
  );
}
