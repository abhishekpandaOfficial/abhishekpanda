import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, ExternalLink, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSubstackArchive, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export function SubstackCollection() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["stackedin-substack-archive"],
    queryFn: fetchSubstackArchive,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const posts = data?.posts || [];
  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => `${post.title} ${post.subtitle || ""}`.toLowerCase().includes(needle));
  }, [posts, query]);

  return (
    <section id="stackedin-posts" className="container mx-auto px-4 pb-12">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card text-foreground shadow-2xl shadow-slate-950/5 dark:border-cyan-500/20 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950 dark:text-white dark:shadow-cyan-950/10">
        <div className="border-b border-border bg-gradient-to-br from-white via-sky-50/50 to-cyan-50/70 p-6 dark:border-white/10 dark:from-transparent dark:via-transparent dark:to-transparent md:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-200">
                  Live from StackedIN
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-400">
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  Auto-synced every 5 minutes
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">The complete StackedIN archive</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-slate-300 md:text-base">
                Every public post, its original hero visual, summary, publication date, and reading time—kept in step with the newsletter.
              </p>
            </div>
            <a
              href={STACKEDIN_PUBLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Visit StackedIN
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the StackedIN archive..."
              className="h-12 border-border bg-background/80 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400 dark:focus-visible:ring-cyan-300"
            />
          </div>
        </div>

        <div className="p-6 md:p-9">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-border bg-background/70 dark:border-white/10 dark:bg-white/5">
                  <Skeleton className="aspect-[16/9]" />
                  <div className="space-y-3 p-5"><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6 text-center">
              <p className="font-bold text-amber-800 dark:text-amber-100">The live archive could not refresh.</p>
              <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">You can retry here or open the publication directly.</p>
              <button onClick={() => void refetch()} className="mt-4 rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background">Retry sync</button>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-8 text-center text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {query ? "No StackedIN posts match that search." : "No public posts are available yet."}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post, index) => (
                <motion.article key={post.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: Math.min(index, 8) * 0.04 }}>
                  <Link to={`/blog/substack/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-cyan-300/35 dark:hover:bg-white/[0.09]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-violet-500/30">
                      {post.heroImage ? (
                        <img src={post.heroImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center"><span className="text-6xl font-black text-white/15">S</span></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent dark:from-slate-950/75" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground dark:text-slate-400">
                        {formatDate(post.publishedAt) ? <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span> : null}
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readingTimeMinutes} min read</span>
                      </div>
                      <h3 className="mt-3 text-xl font-black leading-tight text-foreground transition group-hover:text-primary dark:text-white dark:group-hover:text-cyan-200">{post.title}</h3>
                      {post.subtitle ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground dark:text-slate-300">{post.subtitle}</p> : null}
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary dark:text-cyan-200">Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
