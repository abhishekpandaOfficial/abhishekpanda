import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Layers3, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AI_ML_SERIES_BY_SLUG, getAiMlSeriesHref } from "@/lib/aiMlSeries";
import { useTheme } from "@/components/ThemeProvider";
import { getBlogSeriesVisual } from "@/lib/blogVisuals";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

export default function AiMlSeries() {
  const { seriesSlug } = useParams();
  const series = seriesSlug ? AI_ML_SERIES_BY_SLUG.get(seriesSlug) || null : null;
  const { theme } = useTheme();

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Series not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That AI / ML mastery route does not exist.</h1>
            <p className="mt-4 text-muted-foreground">Open the AI / ML Blogs hub to browse the available learning tracks.</p>
            <Link
              to="/ai-ml-hub"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Back to AI / ML Blogs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (series.href && series.href !== `/ai-ml-hub/${series.slug}`) {
    return <Navigate to={getAiMlSeriesHref(series)} replace />;
  }

  const heroVisual = getBlogSeriesVisual(series, theme);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${series.detailTitle || series.title} | AI / ML Blogs | Abhishek Panda`}</title>
        <meta name="description" content={series.subtitle} />
        <link rel="canonical" href={`${SITE_URL}/ai-ml-hub/${series.slug}`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <Breadcrumb className="mb-4">
            <BreadcrumbList className="text-xs md:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/ai-ml-hub">AI / ML Hub</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{series.detailTitle || series.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            to="/ai-ml-hub"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI / ML Blogs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Brain className="h-4 w-4" />
                  AI / ML Mastery
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">{series.detailTitle || series.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{series.subtitle}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {series.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/80">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                      <Sparkles className="h-4 w-4" />
                      Highlights
                    </div>
                    <div className="mt-4 space-y-2">
                      {series.highlights.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                      <Layers3 className="h-4 w-4" />
                      Focus Areas
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {series.focusAreas.map((item) => (
                        <span key={item} className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/30 xl:border-l xl:border-t-0">
                <img src={heroVisual} alt={series.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>

          <section className="mt-8 rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Overview</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">What This Mastery Will Cover</h2>
            <p className="mt-4 max-w-4xl text-sm leading-8 text-muted-foreground md:text-base">{series.overview}</p>
          </section>

          <section className="mt-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Starter Topics</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">First Learning Blocks</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                These are the first topics prepared for this track. More topic-level cards, chapters, and embedded mastery experiences can be added next.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {series.starterTopics.map((topic) => (
                <article key={topic} className="rounded-[1.5rem] border border-border/60 bg-card/80 p-5">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">Topic</div>
                  <h3 className="mt-3 text-lg font-black tracking-tight text-foreground">{topic}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    This topic is part of the planned mastery path and is ready to expand into deeper notes, code, diagrams, and practical exercises.
                  </p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
