import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers3,
  ListTree,
  MonitorPlay,
  Sparkles,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import ArticleCard from "@/components/articles/ArticleCard";
import { ARTICLES } from "@/content/articles";
import {
  BLOG_SERIES_BY_SLUG,
  getBlogSeriesDisplayTitle,
  getBlogSeriesHref,
  getBlogSeriesToc,
  matchesBlogSeries,
} from "@/lib/blogSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const getStableDate = (value: string | null | undefined) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

export default function BlogSeries() {
  const { seriesSlug } = useParams();
  const series = seriesSlug ? BLOG_SERIES_BY_SLUG.get(seriesSlug) || null : null;
  const { personalPosts, isLoading, getTagStyle } = usePublishedPersonalBlogs();

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Series not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That mastery route does not exist.</h1>
            <p className="mt-4 text-muted-foreground">Open the Blogs hub to browse every available mastery series card.</p>
            <Link
              to="/techhub"
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

  const directHref = getBlogSeriesHref(series);
  if (series.href) {
    return <Navigate to={directHref} replace />;
  }

  const seriesDisplayTitle = getBlogSeriesDisplayTitle(series);
  const toc = getBlogSeriesToc(series);
  const seriesNames = [series.title, series.detailTitle]
    .filter(Boolean)
    .map((value) => value!.trim().toLowerCase());

  const posts = personalPosts
    .filter((post) => {
      const explicitSeries = (post.series_name || "").trim().toLowerCase();
      if (explicitSeries && seriesNames.includes(explicitSeries)) return true;
      return matchesBlogSeries(series, post);
    })
    .slice()
    .sort((a, b) => {
      const ao = typeof a.series_order === "number" && a.series_order > 0 ? a.series_order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.series_order === "number" && b.series_order > 0 ? b.series_order : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return getStableDate(a.original_published_at || a.published_at || a.updated_at) - getStableDate(b.original_published_at || b.published_at || b.updated_at);
    });

  const relatedArticles = ARTICLES
    .filter((article) =>
      matchesBlogSeries(series, {
        title: article.title,
        excerpt: article.description,
        tags: article.tags,
      }),
    )
    .slice()
    .sort((a, b) => getStableDate(b.publishedAt) - getStableDate(a.publishedAt));

  const attachedContentCount = posts.length + relatedArticles.length;

  const chapterCount = toc.modules.reduce((sum, module) => sum + module.chapters.length, 0);
  const topicCount = toc.modules.reduce(
    (sum, module) => sum + module.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.topics.length, 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${seriesDisplayTitle} | TOC | Abhishek Panda`}</title>
        <meta name="description" content={series.subtitle} />
        <link rel="canonical" href={`${SITE_URL}/techhub/${series.slug}`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <Link
            to="/techhub"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Blogs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-8 md:p-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  <BookOpen className="h-4 w-4" />
                  Mastery TOC
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl">
                  {seriesDisplayTitle}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{series.subtitle}</p>

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
                    href="#series-toc"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Open TOC
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#series-posts"
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    Website Chapters
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <Layers3 className="h-4 w-4" />
                    Structure
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{toc.modules.length}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Major modules arranged into a direct series table of contents.</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <ListTree className="h-4 w-4" />
                    Chapters
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{chapterCount}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Chapter blocks and topic groupings mapped for this mastery track.</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    Topics
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{topicCount}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Topic signals to guide the learning path from basics to production depth.</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <MonitorPlay className="h-4 w-4" />
                    Website Content
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{attachedContentCount}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {attachedContentCount
                      ? "Attached articles and published website posts currently mapped to this series."
                      : "This TOC is ready now. Matching articles and website chapters will auto-appear here as you add content."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Overview</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">How This Series Starts</h2>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-muted-foreground md:text-base">{toc.overview}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {toc.highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section id="series-toc" className="scroll-mt-28">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Table of Contents</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Modules, Chapters, and Topics</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                    This mastery route opens directly into a structured TOC so every series starts with the same clean reading flow as the C# track.
                  </p>
                </div>

                <div className="space-y-5">
                  {toc.modules.map((module, moduleIndex) => (
                    <article
                      key={module.id}
                      id={module.id}
                      className="scroll-mt-28 rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-3xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
                            Module {moduleIndex + 1}
                          </div>
                          <h3 className="mt-3 text-2xl font-black tracking-tight text-foreground">{module.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{module.description}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground">
                          {module.chapters.length} chapters
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {module.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.title} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                            <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                              Chapter {moduleIndex + 1}.{chapterIndex + 1}
                            </div>
                            <h4 className="mt-2 text-xl font-black tracking-tight text-foreground">{chapter.title}</h4>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{chapter.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {chapter.topics.map((topic) => (
                                <span
                                  key={`${chapter.title}-${topic}`}
                                  className="rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold text-foreground/80"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section id="series-posts" className="scroll-mt-28">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Website Chapters</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Content Attached to This Series</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Matching Articles, `.md`, `.html`, and published website posts show here automatically.
                  </p>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-80 rounded-2xl border border-border/60 bg-card/60" />
                    ))}
                  </div>
                ) : attachedContentCount ? (
                  <div className="space-y-8">
                    {relatedArticles.length ? (
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Attached Articles</p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">Long-form routed articles for this mastery series</h3>
                        </div>
                        <div className="space-y-6">
                          {relatedArticles.map((article) => (
                            <ArticleCard key={article.slug} article={article} featured />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {posts.length ? (
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Blog Chapters</p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">Website posts matched to this series</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {posts.map((post, index) => (
                            <BlogPostCard key={post.slug} post={post} index={index} getTagStyle={getTagStyle} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-border/70 bg-card/70 p-8 text-center">
                    <h3 className="text-xl font-bold text-foreground">No website chapters are attached yet.</h3>
                    <p className="mt-3 text-muted-foreground">
                      The TOC is already live. Add new articles or blog files and matching series content will show here automatically.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Quick Nav</p>
                <div className="mt-4 space-y-2">
                  <a
                    href="#series-toc"
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    Full TOC
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#series-posts"
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    Website Chapters
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {toc.modules.map((module, index) => (
                    <a
                      key={module.id}
                      href={`#${module.id}`}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      <span className="truncate pr-4">
                        {index + 1}. {module.title}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Series Signals</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold"
                      style={getTagStyle(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  This route now opens directly as a TOC page, so each mastery card behaves like a real learning track instead of an intermediate details page.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
