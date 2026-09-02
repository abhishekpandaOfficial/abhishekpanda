import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSubstackArchive, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";
import { getStackedInCategory, getStackedInTags, getTagStyle } from "@/lib/stackedinTaxonomy";

export function SubstackCollection() {
  const [query, setQuery] = useState("");
  const [syncVersion, setSyncVersion] = useState(0);
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
    <section className="container mx-auto max-w-[1480px] px-4 pb-16" aria-labelledby="stackedin-archive-title">
      <header className="mb-10 border-b border-slate-200 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <img src="/brand/stackedin/wordmark.webp" alt="StackedIN" className="h-11 w-auto max-w-[220px] object-contain object-left" />
            <h1 id="stackedin-archive-title" className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Latest from StackedIN</h1>
            <p className="mt-3 text-base text-slate-600">{posts.length || 45} engineering articles from Substack. Select a card to read the original post.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSyncVersion(Date.now())} disabled={isFetching} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-65">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Syncing…" : "Sync posts"}
            </button>
            <a href={STACKEDIN_PUBLICATION_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-500">
              Substack <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles or topics" className="h-12 rounded-lg border-slate-300 bg-white pl-11 text-slate-950 placeholder:text-slate-400" />
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <div key={item}><Skeleton className="aspect-[16/9] rounded-xl" /><Skeleton className="mt-4 h-6 w-5/6" /></div>)}
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">No StackedIN posts match that search.</div>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, index) => {
            const category = getStackedInCategory(post);
            const tags = getStackedInTags(post).slice(0, 2);
            return (
              <motion.article key={post.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(index, 6) * 0.035 }} className="group min-w-0">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                  <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${post.title} on StackedIN`} className="block aspect-[16/9]">
                    {post.heroImage ? (
                      <img src={post.heroImage} alt={`${post.title} cover`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${category.accent} p-7 text-white`}>
                        <img src="/brand/stackedin/wordmark.webp" alt="StackedIN" className="w-[65%] max-w-[220px] brightness-0 invert" />
                      </div>
                    )}
                  </a>
                  <div className="absolute left-3 top-3 flex max-w-[65%] flex-wrap gap-1.5">
                    {tags.map((tag) => <span key={tag} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur ${getTagStyle(tag)}`}>{tag}</span>)}
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.canonicalUrl)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on LinkedIn`} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A66C2] shadow-md"><FaLinkedinIn className="h-3.5 w-3.5" /></a>
                    <button type="button" onClick={() => void shareToInstagram(post.title, post.canonicalUrl)} aria-label={`Share ${post.title} on Instagram`} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E1306C] shadow-md"><FaInstagram className="h-3.5 w-3.5" /></button>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.canonicalUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on X`} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-950 shadow-md"><FaXTwitter className="h-3.5 w-3.5" /></a>
                  </div>
                </div>
                <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <h2 className="mt-4 text-[1.1rem] font-bold leading-snug text-slate-950 transition group-hover:text-sky-700 md:text-xl">{post.title}</h2>
                </a>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
