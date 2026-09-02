import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, ChevronDown, Clock, ExternalLink, Layers3, RefreshCw, Search } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSubstackArchive, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";
import { getStackedInCategory, getStackedInTags, getTagStyle, STACKEDIN_CATEGORIES } from "@/lib/stackedinTaxonomy";

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export function SubstackCollection() {
  const [query, setQuery] = useState("");
  const [syncVersion, setSyncVersion] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => new Set());
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["stackedin-substack-archive", syncVersion],
    queryFn: () => fetchSubstackArchive(syncVersion > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const posts = useMemo(
    () =>
      [...(data?.posts || [])].sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
      ),
    [data?.posts],
  );
  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => {
      const category = getStackedInCategory(post);
      const tags = getStackedInTags(post);
      return `${post.title} ${post.subtitle || ""} ${category.label} ${tags.join(" ")}`.toLowerCase().includes(needle);
    });
  }, [posts, query]);
  const categoryGroups = useMemo(
    () => STACKEDIN_CATEGORIES.map((category) => ({
      category,
      posts: visiblePosts.filter((post) => getStackedInCategory(post).id === category.id),
    })).filter((group) => group.posts.length > 0),
    [visiblePosts],
  );

  const syncedAt = data?.syncedAt
    ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(data.syncedAt))
    : null;
  const syncPosts = () => setSyncVersion(Date.now());
  const shareToInstagram = async (title: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      }
    }
    void navigator.clipboard?.writeText(url);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };
  const allCollapsed = categoryGroups.length > 0 && categoryGroups.every(({ category }) => collapsedCategories.has(category.id));

  return (
    <section className="container mx-auto px-4 pb-12" aria-labelledby="stackedin-archive-title">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card text-foreground shadow-2xl shadow-slate-950/5 dark:border-cyan-500/20 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950 dark:text-white dark:shadow-cyan-950/10">
        <div className="border-b border-border bg-gradient-to-br from-white via-sky-50/50 to-cyan-50/70 p-6 dark:border-white/10 dark:from-transparent dark:via-transparent dark:to-transparent md:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <img src="/brand/stackedin/wordmark.webp" alt="StackedIN" className="mb-5 h-12 w-auto max-w-[240px] object-contain object-left dark:invert" />
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-200">
                  Live from StackedIN
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6719]/25 bg-[#ff6719]/10 px-3 py-1 text-xs font-bold text-[#d84c00] dark:text-[#ff9b69]">
                  <img src="/brand-logos/social/substack.svg" alt="" className="h-3.5 w-3.5 dark:invert" />
                  Substack · {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-400">
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  {data?.mode === "verified" ? "Verified 45-post catalog" : "Live sync + verified catalog"}
                </span>
              </div>
              <h1 id="stackedin-archive-title" className="mt-4 text-3xl font-black tracking-tight md:text-5xl">The complete StackedIN archive</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-slate-300 md:text-base">
                Every public post, its original hero visual, summary, publication date, and reading time—kept in step with the newsletter.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={syncPosts}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Syncing…" : "Sync posts"}
              </button>
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
          </div>

          {syncedAt ? <p className="mt-4 text-xs text-muted-foreground dark:text-slate-400">Last synced {syncedAt}. Newest article is always shown first.</p> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts, categories, or tags..."
                className="h-12 border-border bg-background/80 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400 dark:focus-visible:ring-cyan-300"
              />
            </div>
            <button
              type="button"
              onClick={() => setCollapsedCategories(allCollapsed ? new Set() : new Set(categoryGroups.map(({ category }) => category.id)))}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              <Layers3 className="h-4 w-4" /> {allCollapsed ? "Expand all modules" : "Collapse all modules"}
            </button>
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
              <button onClick={syncPosts} className="mt-4 rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background">Retry sync</button>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-8 text-center text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {query ? "No StackedIN posts match that search." : "No public posts are available yet."}
            </div>
          ) : (
            <div className="space-y-8">
              {categoryGroups.map(({ category, posts: categoryPosts }) => {
                const isCollapsed = collapsedCategories.has(category.id);
                return (
                  <section key={category.id} className="overflow-hidden rounded-3xl border border-border bg-background/50 dark:border-white/10 dark:bg-white/[0.035]">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      aria-expanded={!isCollapsed}
                      aria-controls={`stackedin-module-${category.id}`}
                      className="group flex w-full items-center gap-4 p-5 text-left transition hover:bg-muted/50 dark:hover:bg-white/5 md:p-6"
                    >
                      <span className={`h-12 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${category.accent}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-xl font-black text-foreground dark:text-white">{category.label}</span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${category.badge}`}>{categoryPosts.length} {categoryPosts.length === 1 ? "post" : "posts"}</span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-muted-foreground dark:text-slate-400">{category.description}</span>
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>

                    {!isCollapsed ? (
                      <div id={`stackedin-module-${category.id}`} className="grid gap-6 border-t border-border p-5 dark:border-white/10 md:grid-cols-2 md:p-6 xl:grid-cols-3">
                        {categoryPosts.map((post, index) => (
                <motion.article key={post.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: Math.min(index, 8) * 0.04 }}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-cyan-300/35 dark:hover:bg-white/[0.09]">
                    <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open the original ${post.title} post on StackedIN`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-violet-500/30">
                      {post.heroImage ? (
                        <img
                          src={post.heroImage}
                          alt={`${post.title} cover`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${category.accent} p-6 text-white`}>
                          <div className="flex max-w-[90%] items-center gap-4 rounded-2xl border border-white/20 bg-slate-950/25 p-4 shadow-xl backdrop-blur-sm">
                            <img src="/brand/stackedin/icon.webp" alt="" className="h-14 w-14 shrink-0 object-contain" />
                            <div className="min-w-0">
                              <span className="block text-xs font-black uppercase tracking-[0.18em] text-white/75">StackedIN</span>
                              <span className="mt-1 line-clamp-2 block text-lg font-black leading-tight">{category.label}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent dark:from-slate-950/75" />
                    </div>
                    </a>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground dark:text-slate-400">
                        {formatDate(post.publishedAt) ? <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span> : null}
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readingTimeMinutes} min read</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {getStackedInTags(post).map((tag) => (
                          <span key={tag} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getTagStyle(tag)}`}>{tag}</span>
                        ))}
                      </div>
                      <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer">
                        <h3 className="mt-3 text-xl font-black leading-tight text-foreground transition group-hover:text-primary dark:text-white dark:group-hover:text-cyan-200">{post.title}</h3>
                      </a>
                      {post.subtitle ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground dark:text-slate-300">{post.subtitle}</p> : null}
                      <div className="mt-auto flex items-center gap-2 pt-5">
                        <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-cyan-200">Original post <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.canonicalUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Share ${post.title} to LinkedIn`}
                          title="Share to LinkedIn"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-[#0A66C2] transition hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 dark:border-white/10"
                        >
                          <FaLinkedinIn className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => void shareToInstagram(post.title, post.canonicalUrl)}
                          aria-label={`Share ${post.title} to Instagram`}
                          title="Share to Instagram"
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pink-500/25 bg-card text-[#E1306C] transition hover:border-[#E1306C]/45 hover:bg-[#E1306C]/10 dark:border-white/10"
                        >
                          <FaInstagram className="h-4 w-4" />
                        </button>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.canonicalUrl)}&text=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Share ${post.title} to X`}
                          title="Share to X"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-foreground/30 hover:bg-muted dark:border-white/10"
                        >
                          <FaXTwitter className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
