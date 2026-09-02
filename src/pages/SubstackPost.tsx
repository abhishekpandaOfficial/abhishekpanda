import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSubstackPost, sanitizeSubstackHtml, STACKEDIN_PUBLICATION_URL } from "@/lib/substack";

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

export default function SubstackPost() {
  const { slug } = useParams();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["stackedin-substack-post", slug],
    queryFn: () => fetchSubstackPost(slug!),
    enabled: Boolean(slug),
    staleTime: 15 * 60 * 1000,
  });
  const safeHtml = useMemo(() => (post?.bodyHtml ? sanitizeSubstackHtml(post.bodyHtml) : ""), [post?.bodyHtml]);
  const originalUrl = post?.canonicalUrl || (slug ? `${STACKEDIN_PUBLICATION_URL}/p/${slug}` : STACKEDIN_PUBLICATION_URL);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {post ? (
        <Helmet>
          <title>{post.title} | StackedIN</title>
          <meta name="description" content={post.subtitle || "Read this StackedIN article by Abhishek Panda."} />
          <link rel="canonical" href={post.canonicalUrl} />
          {post.heroImage ? <meta property="og:image" content={post.heroImage} /> : null}
        </Helmet>
      ) : null}

      <main className="pb-20 pt-28">
        <div className="container mx-auto max-w-5xl px-4">
          <Link to="/blog#stackedin-posts" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to StackedIN archive
          </Link>

          {isLoading ? (
            <div className="mt-8 space-y-5"><Skeleton className="aspect-[16/8] w-full rounded-3xl" /><Skeleton className="h-12 w-5/6" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-96 w-full" /></div>
          ) : error || !post ? (
            <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
              <h1 className="text-2xl font-black text-foreground">This post could not be loaded here.</h1>
              <p className="mt-3 text-muted-foreground">The original article is still available on StackedIN.</p>
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Read on StackedIN <ExternalLink className="h-4 w-4" /></a>
            </div>
          ) : (
            <article className="mt-8 overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-black/5">
              {post.heroImage ? <img src={post.heroImage} alt="" className="aspect-[16/8] w-full object-cover" /> : null}
              <header className="border-b border-border px-6 py-8 md:px-12 md:py-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">StackedIN Publication</p>
                <h1 className="mt-4 text-3xl font-black leading-tight text-foreground md:text-5xl">{post.title}</h1>
                {post.subtitle ? <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{post.subtitle}</p> : null}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {formatDate(post.publishedAt) ? <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span> : null}
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{post.readingTimeMinutes} min read</span>
                  <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">Original post <ExternalLink className="h-4 w-4" /></a>
                </div>
              </header>
              <div className="px-6 py-8 md:px-12 md:py-12">
                {safeHtml ? (
                  <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-a:text-primary prose-img:rounded-2xl prose-pre:overflow-x-auto" dangerouslySetInnerHTML={{ __html: safeHtml }} />
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
                    <p className="text-muted-foreground">Substack did not expose the full body through the public feed.</p>
                    <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-primary">Continue on StackedIN <ExternalLink className="h-4 w-4" /></a>
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
