import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Markdown } from "@/components/blog/Markdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Calendar, Clock, ArrowLeft, Link as LinkIcon } from "lucide-react";
import GithubSlugger from "github-slugger";

type CacheRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  updated_at: string;
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number | null;
  updated_at: string;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  "https://www.abhishekpanda.com";

const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useUserAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  const { data: meta, isLoading: metaLoading, error: metaError } = useQuery({
    queryKey: ["blog-post-meta", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();

      if (!res.error) return res.data as CacheRow;

      // Migration not applied yet fallback
      if ((res.error as { code?: unknown }).code === "PGRST205") {
        const fb = await supabase
          .from("blog_posts")
          .select(
            "id,title,slug,excerpt,hero_image,tags,is_premium,is_published,published_at,meta_title,meta_description,updated_at,content"
          )
          .eq("slug", slug!)
          .eq("is_published", true)
          .single();
        if (fb.error) throw fb.error;
        const row = fb.data as unknown as PostRow;
        const content = row.content;
        const wc = content ? content.split(/\s+/).filter(Boolean).length : 0;
        const rt = Math.ceil(wc / 200);
        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          hero_image: row.hero_image,
          tags: row.tags,
          is_premium: !!row.is_premium,
          is_published: !!row.is_published,
          published_at: row.published_at,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          updated_at: row.updated_at,
          reading_time_minutes: rt,
        } as CacheRow;
      }

      throw res.error;
    },
  });

  const { data: entitlementOk = false, isLoading: entLoading } = useQuery({
    queryKey: ["blog-premium-entitlement", user?.id],
    enabled: !!user?.id && !!meta?.is_premium,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_entitlements")
        .select("entitlement, expires_at")
        .eq("user_id", user!.id)
        .eq("entitlement", "blog_premium")
        .limit(1);
      if (error) throw error;
      const row = data?.[0];
      if (!row) return false;
      if (!row.expires_at) return true;
      return new Date(row.expires_at).getTime() > Date.now();
    },
  });

  const canReadPremium = !!user && entitlementOk;
  const shouldFetchFull = !!meta && (!meta.is_premium || canReadPremium);

  const { data: allPosts = [] } = useQuery({
    queryKey: ["blog-posts-cache-nav"],
    enabled: !!meta,
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("title,slug,excerpt,hero_image,tags,is_premium,published_at,updated_at,is_published")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(200);
      if (!res.error) return (res.data ?? []) as Array<Pick<CacheRow, "title" | "slug" | "excerpt" | "hero_image" | "tags" | "is_premium" | "published_at" | "updated_at">>;

      if ((res.error as { code?: unknown }).code === "PGRST205") {
        const fb = await supabase
          .from("blog_posts")
          .select("title,slug,excerpt,hero_image,tags,is_premium,published_at,updated_at,is_published")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(200);
        if (fb.error) throw fb.error;
        return (fb.data ?? []) as Array<any>;
      }
      throw res.error;
    },
  });

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["blog-post-full", slug, canReadPremium],
    enabled: !!slug && shouldFetchFull,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as PostRow;
    },
  });

  // Increment view count only after successfully loading readable content.
  useEffect(() => {
    if (!slug) return;
    if (!shouldFetchFull) return;
    if (!post) return;
    supabase.rpc("increment_blog_post_view", { _slug: slug }).catch(() => {});
  }, [slug, post, shouldFetchFull]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(100, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toc = useMemo(() => {
    const md = post?.content || "";
    if (!md) return [];
    const slugger = new GithubSlugger();
    const lines = md.split("\n");
    const out: { depth: number; text: string; id: string }[] = [];
    for (const line of lines) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!m) continue;
      const depth = m[1].length;
      if (depth < 2 || depth > 3) continue;
      const text = m[2].replace(/\s+#\s*$/, "").trim();
      if (!text) continue;
      const id = slugger.slug(text);
      out.push({ depth, text, id });
    }
    return out;
  }, [post?.content]);

  const nav = useMemo(() => {
    if (!meta) return { prev: null as any, next: null as any, related: [] as any[] };
    const idx = allPosts.findIndex((p) => p.slug === meta.slug);
    const prev = idx > 0 ? allPosts[idx - 1] : null; // newer
    const next = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null; // older
    const tag = meta.tags?.[0];
    const related =
      tag
        ? allPosts
            .filter((p) => p.slug !== meta.slug && (p.tags?.[0] === tag || (p.tags ?? []).includes(tag)))
            .slice(0, 3)
        : [];
    return { prev, next, related };
  }, [allPosts, meta]);

  const title = meta?.meta_title || meta?.title || "Blog";
  const description = meta?.meta_description || meta?.excerpt || "Blog post";
  const canonical = slug ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/blog`;
  const robots = meta?.is_premium ? "noindex,follow" : "index,follow";

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20 container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </main>
        <Footer />
      </div>
    );
  }

  if (metaError || !meta) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-black text-foreground mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-6">This post doesn’t exist (or isn’t published).</p>
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const showPaywall = meta.is_premium && !canReadPremium;

  return (
    <div className="min-h-screen bg-background">
      {!showPaywall ? (
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[60]"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      ) : null}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content={robots} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        {meta.hero_image ? <meta property="og:image" content={meta.hero_image} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {meta.hero_image ? <meta name="twitter:image" content={meta.hero_image} /> : null}
      </Helmet>

      <Navigation />
      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">
            <article className="min-w-0">
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {meta.tags?.[0] ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-primary/20 text-primary border-primary/30">
                      {meta.tags[0]}
                    </span>
                  ) : null}
                  {meta.is_premium ? (
                    <span className="badge-premium">
                      <Lock className="w-3 h-3" />
                      Premium
                    </span>
                  ) : null}
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  {meta.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {meta.published_at ? (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(meta.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {Math.max(1, meta.reading_time_minutes || 0)} min read
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(canonical);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 1200);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {shareCopied ? "Copied" : "Copy Link"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(meta.title)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Share
                    </a>
                  </Button>
                </div>

                {meta.hero_image ? (
                  <div className="mt-8 rounded-3xl overflow-hidden border border-border bg-card">
                    <img
                      src={meta.hero_image}
                      alt={meta.title}
                      className="w-full h-auto max-h-[420px] object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </header>

              {showPaywall ? (
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        Premium post
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {meta.excerpt || "Sign in with premium access to read the full article."}
                      </p>
                      {!user ? (
                        <Button asChild>
                          <Link to={`/login?next=${encodeURIComponent(`/blog/${meta.slug}`)}`}>
                            Sign in to continue
                          </Link>
                        </Button>
                      ) : entLoading ? (
                        <Button disabled>Checking access...</Button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Your account does not currently have `blog_premium`.
                          </p>
                          <Button asChild variant="outline">
                            <Link to="/account">Go to account</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : postLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <Markdown value={post?.content || ""} />

                  {(nav.prev || nav.next || nav.related.length > 0) ? (
                    <div className="mt-12 pt-8 border-t border-border space-y-6">
                      {(nav.prev || nav.next) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nav.prev ? (
                            <Link to={`/blog/${nav.prev.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                              <p className="text-xs text-muted-foreground mb-1">Newer</p>
                              <p className="font-semibold text-foreground line-clamp-2">{nav.prev.title}</p>
                              {nav.prev.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{nav.prev.excerpt}</p> : null}
                            </Link>
                          ) : <div />}
                          {nav.next ? (
                            <Link to={`/blog/${nav.next.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                              <p className="text-xs text-muted-foreground mb-1">Older</p>
                              <p className="font-semibold text-foreground line-clamp-2">{nav.next.title}</p>
                              {nav.next.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{nav.next.excerpt}</p> : null}
                            </Link>
                          ) : <div />}
                        </div>
                      ) : null}

                      {nav.related.length > 0 ? (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-3">Related</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {nav.related.map((p) => (
                              <Link key={p.slug} to={`/blog/${p.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                                <p className="font-semibold text-foreground line-clamp-2">{p.title}</p>
                                {p.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{p.excerpt}</p> : null}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </article>

            <aside className="hidden lg:block sticky top-24">
              {toc.length > 0 && !showPaywall ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">On this page</p>
                  <nav className="space-y-2">
                    {toc.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block text-sm text-muted-foreground hover:text-foreground transition-colors ${
                          h.depth === 3 ? "pl-3" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-1">More</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore more posts from the blog.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/blog">Browse</Link>
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
