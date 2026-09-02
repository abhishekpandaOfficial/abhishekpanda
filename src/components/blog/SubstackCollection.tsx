import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSubstackArchive, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";
import { getStackedInCategory, getStackedInTags, STACKEDIN_CATEGORIES } from "@/lib/stackedinTaxonomy";

const CATEGORY_ORDER = [
  "machine-learning",
  "mlops",
  "deep-learning",
  "python-data",
  "rag-ai",
  "dotnet-azure",
  "cloud-kubernetes",
  "system-architecture",
];

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date).toUpperCase();
};

export function SubstackCollection() {
  const [query, setQuery] = useState("");
  const [syncVersion, setSyncVersion] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["stackedin-substack-archive", syncVersion],
    queryFn: () => fetchSubstackArchive(syncVersion > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const posts = useMemo(
    () => [...(data?.posts || [])].sort(
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
    () => STACKEDIN_CATEGORIES
      .map((category) => ({
        category,
        posts: visiblePosts.filter((post) => getStackedInCategory(post).id === category.id),
      }))
      .filter((group) => group.posts.length)
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category.id) - CATEGORY_ORDER.indexOf(b.category.id)),
    [visiblePosts],
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };
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

  return (
    <section className="mx-auto w-full max-w-[1540px] px-5 pb-20 sm:px-8 lg:px-12" aria-labelledby="stackedin-archive-title">
      <header className="mb-14 border-b border-slate-200 pb-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <img src="/brand/stackedin/wordmark.webp" alt="StackedIN" className="h-11 w-auto max-w-[220px] object-contain object-left" />
            <h1 id="stackedin-archive-title" className="mt-5 font-serif text-4xl font-black tracking-tight text-[#292929] md:text-5xl">The Engineering Blog</h1>
            <p className="mt-3 text-base text-slate-600">{posts.length || 45} articles from StackedIN, organized by engineering domain.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSyncVersion(Date.now())} disabled={isFetching} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292929] px-4 text-sm font-bold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-65">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Syncing…" : "Sync posts"}
            </button>
            <a href={STACKEDIN_PUBLICATION_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-500">
              Visit Substack <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="relative mt-7 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles or topics" className="h-12 rounded-lg border-slate-300 bg-white pl-11 text-slate-950 placeholder:text-slate-400" />
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-16">
          {[1, 2].map((section) => (
            <div key={section}>
              <Skeleton className="mb-8 h-10 w-56" />
              <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item}><Skeleton className="aspect-[16/10] rounded-[1.35rem]" /><Skeleton className="mt-5 h-9 w-5/6" /><Skeleton className="mt-3 h-5 w-full" /></div>)}
              </div>
            </div>
          ))}
        </div>
      ) : categoryGroups.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">No StackedIN posts match that search.</div>
      ) : (
        <div className="space-y-20">
          {categoryGroups.map(({ category, posts: categoryPosts }) => {
            const isExpanded = query.trim().length > 0 || expandedCategories.has(category.id);
            const displayedPosts = isExpanded ? categoryPosts : categoryPosts.slice(0, 3);
            return (
              <section key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="mb-8 flex items-end justify-between gap-5 border-t border-slate-200 pt-10">
                  <h2 id={`category-${category.id}`} className="font-serif text-4xl font-black leading-none tracking-tight text-[#292929] md:text-5xl">{category.label}</h2>
                  {categoryPosts.length > 3 && !query ? (
                    <button type="button" onClick={() => toggleCategory(category.id)} aria-expanded={isExpanded} className="shrink-0 pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#292929] underline-offset-4 transition hover:underline">
                      {isExpanded ? "Show less" : "View all"}
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                  {displayedPosts.map((post, index) => {
                    const publishedDate = formatDate(post.publishedAt);
                    const summary = post.subtitle || post.excerpt || category.description;
                    return (
                      <motion.article key={post.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(index, 3) * 0.04 }} className="group min-w-0">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-[#f4f6fa]">
                          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${category.accent} p-8`}>
                            <img src="/brand/stackedin/wordmark.webp" alt="" className="w-[62%] max-w-[230px] brightness-0 invert" />
                          </div>
                          <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${post.title} on StackedIN`} className="absolute inset-0 z-10">
                            {post.heroImage ? (
                              <img src={post.heroImage} alt={`${post.title} cover`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                            ) : null}
                          </a>
                          <div className="absolute bottom-3 right-3 z-20 flex gap-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.canonicalUrl)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on LinkedIn`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0A66C2] shadow-lg"><FaLinkedinIn className="h-4 w-4" /></a>
                            <button type="button" onClick={() => void shareToInstagram(post.title, post.canonicalUrl)} aria-label={`Share ${post.title} on Instagram`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#E1306C] shadow-lg"><FaInstagram className="h-4 w-4" /></button>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.canonicalUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on X`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"><FaXTwitter className="h-4 w-4" /></a>
                          </div>
                        </div>
                        <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <h3 className="mt-5 font-serif text-[clamp(1.65rem,2.15vw,2.25rem)] font-black leading-[1.08] tracking-[-0.025em] text-[#292929] transition group-hover:text-sky-700">{post.title}</h3>
                          <p className="mt-3 line-clamp-1 text-lg leading-7 text-[#4f4f4f]">{summary}</p>
                          <p className="mt-4 text-sm font-medium uppercase tracking-[0.08em] text-[#8a8a8a]">{publishedDate ? `${publishedDate} · STACKEDIN` : "STACKEDIN"}</p>
                        </a>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
