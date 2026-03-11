import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, FolderOpen, Newspaper, ScrollText } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogSeriesGrid } from "@/components/blog/BlogSeriesGrid";
import ArticleCard from "@/components/articles/ArticleCard";
import { ARTICLES } from "@/content/articles";
import { AI_ML_SERIES } from "@/lib/aiMlSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";
import { PROJECT_CARDS } from "@/lib/projectsCatalog";

gsap.registerPlugin(ScrollTrigger);

const TAG_PALETTE = [
  "border-sky-300/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
];

type PanelProps = {
  index: number;
  kicker: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  icon: typeof ScrollText;
  children: ReactNode;
};

function ProjectShowcaseCard({
  title,
  description,
  to,
  tags,
  eyebrow,
  ctaLabel,
  statusLabel,
  disabled,
  logoSrc,
  logoAlt,
  icon: Icon,
}: (typeof PROJECT_CARDS)[number]) {
  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              {eyebrow || "Project"}
            </span>
            {statusLabel ? (
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {statusLabel}
              </span>
            ) : null}
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">{title}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-2 text-primary">
          {logoSrc ? (
            <img src={logoSrc} alt={logoAlt || `${title} logo`} className="h-8 w-8 object-contain" loading="lazy" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag, tagIndex) => (
          <span
            key={`${title}-${tag}`}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${TAG_PALETTE[(tagIndex + title.length) % TAG_PALETTE.length]}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${disabled ? "text-muted-foreground" : "text-primary"}`}>
        {ctaLabel || (disabled ? "Coming soon" : "Open")}
        {!disabled ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /> : null}
      </div>
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className="group rounded-[1.75rem] border border-border/60 bg-background/85 p-6 transition hover:border-primary/30 hover:bg-background">
        {cardBody}
      </Link>
    );
  }

  return <div className="rounded-[1.75rem] border border-dashed border-border/60 bg-background/70 p-6">{cardBody}</div>;
}

function ShowcasePanel({ index, kicker, title, description, actionHref, actionLabel, icon: Icon, children }: PanelProps) {
  return (
    <section
      data-home-stack-panel
      className="home-stack-panel relative rounded-[2rem] border border-border/60 bg-card/88 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8 xl:p-10"
      style={{ zIndex: 20 + index }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-90"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(16,185,129,0.14), transparent 32%), linear-gradient(145deg, rgba(255,255,255,0.02), transparent 42%, rgba(59,130,246,0.08))",
        }}
      />
      <div className="relative">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Icon className="h-4 w-4" />
              {kicker}
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
          </div>
          <Link to={actionHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

export function HomeStackedShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { personalPosts, isLoading, getTagStyle } = usePublishedPersonalBlogs();

  const aiMlSeriesCounts = useMemo(
    () =>
      new Map(
        AI_ML_SERIES.map((series) => [
          series.slug,
          personalPosts.filter((post) => {
            const source = `${post.title || ""} ${post.excerpt || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
            return series.keywords.some((keyword) => source.includes(keyword.toLowerCase()));
          }).length,
        ]),
      ),
    [personalPosts],
  );

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-home-stack-panel]", rootRef.current);

      panels.forEach((panel, index) => {
        gsap.set(panel, { transformOrigin: "center top" });

        gsap.fromTo(
          panel,
          { y: 64, opacity: 0.78 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom-=6%",
              end: "top 58%",
              scrub: true,
            },
          },
        );

        const nextPanel = panels[index + 1];
        if (!nextPanel) return;

        gsap.to(panel, {
          scale: 0.965,
          y: -42,
          filter: "saturate(0.92) brightness(0.96)",
          ease: "none",
          scrollTrigger: {
            trigger: nextPanel,
            start: "top 82%",
            end: "top 20%",
            scrub: true,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [personalPosts.length]);

  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div ref={rootRef} className="relative container mx-auto px-4">
        <div className="space-y-10 md:space-y-14">
          <div className="md:sticky md:top-24">
            <ShowcasePanel
              index={0}
              kicker="Published Blogs"
              title="All Published Engineering Blogs"
              description="Every currently published website blog is surfaced here as a full card, so the homepage immediately reflects the live blog inventory instead of only a small featured slice."
              actionHref="/blog"
              actionLabel="Open all blogs"
              icon={ScrollText}
            >
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-[30rem] rounded-[1.5rem] border border-border/60 bg-background/70" />
                  ))}
                </div>
              ) : personalPosts.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {personalPosts.map((post, index) => (
                    <BlogPostCard key={post.slug} post={post} index={index} getTagStyle={getTagStyle} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/70 p-8 text-center text-muted-foreground">
                  No published blog cards are available yet.
                </div>
              )}
            </ShowcasePanel>
          </div>

          <div className="md:sticky md:top-28">
            <ShowcasePanel
              index={1}
              kicker="AI / ML Blogs"
              title="AI / ML Mastery Cards"
              description="The AI / ML library now sits directly on the homepage with the same mastery-card treatment, so mathematics, statistics, NumPy, machine learning, NLP, and other tracks are discoverable without leaving the landing page."
              actionHref="/ai-ml-blogs"
              actionLabel="Open AI / ML hub"
              icon={Brain}
            >
              <BlogSeriesGrid counts={aiMlSeriesCounts} seriesList={AI_ML_SERIES} />
            </ShowcasePanel>
          </div>

          <div className="md:sticky md:top-32">
            <ShowcasePanel
              index={2}
              kicker="Articles"
              title="Long-Form Articles and Deep Dives"
              description="The article layer now follows the AI / ML section and keeps the richer long-form writing visible as full cards, including architecture, privacy, case studies, and AI systems content."
              actionHref="/articles"
              actionLabel="Open articles"
              icon={Newspaper}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {ARTICLES.map((article, index) => (
                  <div key={article.slug} className={index === 0 ? "md:col-span-2 xl:col-span-1" : ""}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </ShowcasePanel>
          </div>

          <div className="md:sticky md:top-36">
            <ShowcasePanel
              index={3}
              kicker="Projects"
              title="Projects, Platforms, and Product Routes"
              description="The homepage now ends this discovery flow with project cards, so OpenOwl, CHRONYX, Newstack, StackCraft, and the broader product roadmap are visible in one portfolio-style panel."
              actionHref="/projects"
              actionLabel="Open projects"
              icon={FolderOpen}
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {PROJECT_CARDS.map((card) => (
                  <ProjectShowcaseCard key={`${card.title}-${card.to || "local"}`} {...card} />
                ))}
              </div>
            </ShowcasePanel>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeStackedShowcase;
