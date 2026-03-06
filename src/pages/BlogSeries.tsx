import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Layers3 } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BLOG_SERIES, BLOG_SERIES_BY_SLUG, matchesBlogSeries } from "@/lib/blogSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

export default function BlogSeries() {
  const { seriesSlug } = useParams();
  const series = seriesSlug ? BLOG_SERIES_BY_SLUG.get(seriesSlug) || null : null;
  const { personalPosts, isLoading, getTagStyle } = usePublishedPersonalBlogs();
  const seriesDisplayTitle = series?.detailTitle || series?.title || "";

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Series not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That blog series route does not exist.</h1>
            <p className="mt-4 text-muted-foreground">Open the blogs hub to browse all mastery tracks and available posts.</p>
            <Link
              to="/blogs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Back to Blogs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const posts = personalPosts.filter((post) => matchesBlogSeries(series, post));
  const relatedSeries = BLOG_SERIES.filter((item) => item.slug !== series.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${seriesDisplayTitle} | Blogs | Abhishek Panda`}</title>
        <meta name="description" content={series.subtitle} />
        <link rel="canonical" href={`${SITE_URL}/blogs/${series.slug}`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Blogs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-8 md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  <BookOpen className="h-4 w-4" />
                  Mastery Series
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">{seriesDisplayTitle}</h1>
                <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">{series.subtitle}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#series-posts"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Read Series Posts
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {series.href ? (
                    <Link
                      to={series.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      Open Learning TOC
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="grid w-full max-w-sm grid-cols-2 gap-4">
                {series.logos.map((logo, index) => (
                  <div
                    key={`${series.slug}-${index}`}
                    className="flex aspect-square items-center justify-center rounded-[1.5rem] border border-border/60 bg-white/95 p-5 shadow-sm"
                  >
                    <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </div>
                ))}
                <div className="col-span-2 rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <Layers3 className="h-4 w-4" />
                    Website Coverage
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{posts.length}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {posts.length > 0
                      ? `Published website post${posts.length === 1 ? "" : "s"} currently mapped to this mastery track.`
                      : "Series landing page is ready. Add matching posts into the blog pipeline and they will appear here automatically."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section id="series-posts" className="mt-10">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Series Posts</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Read Everything Under {seriesDisplayTitle}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Folder-backed and published website posts matched against this mastery track.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-80 rounded-2xl border border-border/60 bg-card/60" />
                ))}
              </div>
            ) : posts.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post, index) => (
                  <BlogPostCard key={post.slug} post={post} index={index} getTagStyle={getTagStyle} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-border/70 bg-card/70 p-8 text-center">
                <h3 className="text-xl font-bold text-foreground">No website posts are attached to this series yet.</h3>
                <p className="mt-3 text-muted-foreground">
                  This dedicated series landing page is live. Add matching `.md` or `.html` files under `src/content/blog` and they will appear here.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Open Main Blog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {series.href ? (
                    <Link
                      to={series.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground"
                    >
                      Open Series TOC
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">More Tracks</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Explore Other Blog Series</h2>
              </div>
              <Link to="/blogs" className="text-sm font-semibold text-primary">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedSeries.map((item) => (
                <Link
                  key={item.slug}
                  to={`/blogs/${item.slug}`}
                  className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    {item.logos.slice(0, 2).map((logo, index) => (
                      <span
                        key={`${item.slug}-${index}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/95 p-1.5 shadow-sm"
                      >
                        <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" />
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-lg font-black tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
