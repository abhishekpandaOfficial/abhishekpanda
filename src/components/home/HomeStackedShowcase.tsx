import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, FolderOpen, Newspaper, ScrollText } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GsapInfiniteCardSlider from "@/components/home/GsapInfiniteCardSlider";
import { FEATURED_HOME_ARTICLES, type ArticleSummary } from "@/content/articleSummaries";
import { AI_ML_SERIES } from "@/lib/aiMlSeries";
import { BLOG_SERIES, getBlogSeriesHref, matchesBlogSeries } from "@/lib/blogSeries";
import { usePublishedPersonalBlogs } from "@/hooks/usePublishedPersonalBlogs";
import { PROJECT_CARDS } from "@/lib/projectsCatalog";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { getBlogSeriesVisual } from "@/lib/blogVisuals";

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
  hideHeader?: boolean;
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
  const isStackCraft = title === "StackCraft";
  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]",
                isStackCraft
                  ? "border-sky-400/30 bg-sky-500/12 text-sky-300"
                  : "border-primary/20 bg-primary/10 text-primary",
              )}
            >
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
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border p-2 text-primary",
            isStackCraft
              ? "border-sky-400/30 bg-gradient-to-br from-sky-500/20 via-blue-500/12 to-cyan-400/18 shadow-[0_18px_34px_rgba(59,109,240,0.20)]"
              : "border-border/60 bg-background/95",
          )}
        >
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
      <Link
        to={to}
        className={cn(
          "group rounded-[1.75rem] border p-6 transition",
          isStackCraft
            ? "border-sky-400/20 bg-[radial-gradient(circle_at_top_right,rgba(59,109,240,0.18),transparent_32%),linear-gradient(160deg,rgba(8,17,31,0.98),rgba(12,26,46,0.94))] hover:border-sky-300/40 hover:bg-[radial-gradient(circle_at_top_right,rgba(59,109,240,0.22),transparent_34%),linear-gradient(160deg,rgba(8,17,31,1),rgba(12,26,46,0.98))] hover:shadow-[0_28px_70px_rgba(59,109,240,0.16)]"
            : "border-border/60 bg-background/85 hover:border-primary/30 hover:bg-background",
        )}
      >
        {cardBody}
      </Link>
    );
  }

  return <div className="rounded-[1.75rem] border border-dashed border-border/60 bg-background/70 p-6">{cardBody}</div>;
}

function ShowcasePanel({ index, kicker, title, description, actionHref, actionLabel, icon: Icon, children, hideHeader = false }: PanelProps) {
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
        {!hideHeader ? (
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
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
        ) : null}
        {children}
      </div>
    </section>
  );
}

function HomeArticleMiniCard({ article, featured = false }: { article: ArticleSummary; featured?: boolean }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[1.5rem] border border-border/60 bg-card/88 shadow-[0_18px_55px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_80px_rgba(59,130,246,0.16)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border/60">
        <img
          src={article.heroImage}
          alt={article.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/18 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {article.eyebrow}
          </span>
          {featured ? (
            <span className="rounded-full border border-sky-300/25 bg-sky-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-black tracking-tight text-foreground">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span
              key={`${article.slug}-mini-tag-${tag}`}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${TAG_PALETTE[(index + article.slug.length) % TAG_PALETTE.length]}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
          <span>{article.readMinutes} min read</span>
          <span className="inline-flex items-center gap-2 font-semibold text-primary">
            Open article
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function HomeSeriesMiniCard({
  to,
  visual,
  title,
  subtitle,
  tags,
  logos,
  countLabel,
  actionLabel,
  theme,
  rgb,
}: {
  to: string;
  visual: string;
  title: string;
  subtitle: string;
  tags: string[];
  logos: string[];
  countLabel: string;
  actionLabel: string;
  theme: string;
  rgb: string;
}) {
  return (
    <Link
      to={to}
      style={{ ["--series-rgb" as string]: rgb }}
      className="group relative isolate flex h-full min-h-[260px] overflow-hidden rounded-[1.5rem] border border-border/60 bg-card/88 shadow-[0_18px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_80px_rgba(59,130,246,0.16)]"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(var(--series-rgb), 0.24), transparent 40%), radial-gradient(circle at bottom left, rgba(var(--series-rgb), 0.14), transparent 34%), linear-gradient(140deg, rgba(var(--series-rgb), 0.06), transparent 35%, rgba(var(--series-rgb), 0.10))",
        }}
      />
      <div className="relative flex h-full flex-col">
        <div className={cn("relative aspect-[16/9] overflow-hidden border-b border-border/60", theme === "dark" ? "border-white/10" : "border-slate-900/10")}>
          <img src={visual} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" decoding="async" />
          <div
            className={cn(
              "absolute inset-0",
              theme === "dark"
                ? "bg-gradient-to-t from-slate-950/78 via-slate-950/16 to-transparent"
                : "bg-gradient-to-t from-white/88 via-white/12 to-transparent"
            )}
          />
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
            <div className="flex max-w-[82%] flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={`${title}-mini-header-${tag}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    theme === "dark"
                      ? "border-white/50 bg-black/28 text-white"
                      : "border-slate-900/12 bg-white/82 text-slate-900 shadow-sm"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
            <ArrowRight className={cn("h-4 w-4 shrink-0 transition-all group-hover:translate-x-1", theme === "dark" ? "text-white/85" : "text-slate-900/70")} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-lg font-black tracking-tight text-foreground">{title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={`${title}-mini-tag-${tag}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-foreground/85"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {logos.slice(0, 3).map((logo, logoIndex) => (
              <span
                key={`${title}-mini-logo-${logoIndex}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-background/95 p-1.5 shadow-sm"
              >
                <img src={logo} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
            <span>{countLabel}</span>
            <span className="inline-flex items-center gap-2 font-semibold text-primary">
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticleSlider({
  articles,
}: {
  articles: ArticleSummary[];
}) {
  return (
    <GsapInfiniteCardSlider
      items={articles}
      speed={40}
      reverse={false}
      autoPlay={false}
      itemClassName="w-[240px] shrink-0 sm:w-[260px] lg:w-[280px]"
      renderItem={(article, index) => <HomeArticleMiniCard article={article} featured={index === 0} />}
    />
  );
}

export function HomeStackedShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { personalPosts } = usePublishedPersonalBlogs();
  const { theme } = useTheme();
  const featuredArticles = useMemo(() => FEATURED_HOME_ARTICLES, []);

  const blogSeriesCounts = useMemo(
    () =>
      new Map(
        BLOG_SERIES.map((series) => [
          series.slug,
          personalPosts.filter((post) => matchesBlogSeries(series, post)).length,
        ]),
      ),
    [personalPosts],
  );

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
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-home-stack-panel]", rootRef.current);

        panels.forEach((panel, index) => {
          gsap.set(panel, { transformOrigin: "center top", willChange: "transform, opacity" });

          gsap.fromTo(
            panel,
            { y: 32, opacity: 0.92 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom-=8%",
                end: "top 70%",
                scrub: 0.4,
              },
            },
          );

          const nextPanel = panels[index + 1];
          if (!nextPanel) return;

          gsap.to(panel, {
            scale: 0.985,
            y: -20,
            ease: "none",
            scrollTrigger: {
              trigger: nextPanel,
              start: "top 88%",
              end: "top 38%",
              scrub: 0.45,
            },
          });
        });
      });

      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-home-stack-panel]", { clearProps: "all" });
      });

      return () => mm.revert();
    }, rootRef);

    return () => ctx.revert();
  }, [personalPosts.length]);

  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div ref={rootRef} className="relative w-full px-4 md:px-6 xl:px-8">
        <div className="space-y-10 md:space-y-14">
          <div className="md:sticky md:top-24">
            <ShowcasePanel
              index={0}
              kicker="Published Blogs"
              title="All Published Engineering Blogs"
              description="This landing section now starts with the major `/techhub` series cards, so the core engineering learning tracks stay visible as a continuously scrolling discovery rail."
              actionHref="/blog"
              actionLabel="Open all blogs"
              icon={ScrollText}
              hideHeader
            >
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black tracking-tight text-foreground md:text-2xl">Major Blog Series Cards</h3>
                  <Link to="/techhub" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open all blog series
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <GsapInfiniteCardSlider
                  items={BLOG_SERIES}
                  speed={42}
                  reverse={false}
                  autoPlay={false}
                  itemClassName="w-[240px] shrink-0 sm:w-[260px] lg:w-[280px]"
                  renderItem={(series) => {
                    const to = getBlogSeriesHref(series);
                    const count = blogSeriesCounts.get(series.slug) ?? 0;
                    const visual = getBlogSeriesVisual(series, theme);

                    return (
                      <HomeSeriesMiniCard
                        to={to}
                        visual={visual}
                        title={series.title}
                        subtitle={series.subtitle}
                        tags={series.tags}
                        logos={series.logos}
                        countLabel={count > 0 ? `${count} website chapter${count === 1 ? "" : "s"}` : "Mastery Series"}
                        actionLabel={series.actionLabel || "Open Guide"}
                        theme={theme}
                        rgb={series.rgb}
                      />
                    );
                  }}
                />
              </div>

            </ShowcasePanel>
          </div>

          <div className="md:sticky md:top-28">
            <ShowcasePanel
              index={1}
              kicker="AI / ML Blogs"
              title="AI / ML Mastery Cards"
              description="The AI / ML library now sits directly on the homepage with the same mastery-card treatment, so mathematics, statistics, NumPy, machine learning, NLP, and other tracks are discoverable without leaving the landing page."
              actionHref="/ai-ml-hub"
              actionLabel="Open AI / ML hub"
              icon={Brain}
            >
              <GsapInfiniteCardSlider
                items={AI_ML_SERIES}
                speed={42}
                reverse={true}
                autoPlay={false}
                itemClassName="w-[240px] shrink-0 sm:w-[260px] lg:w-[280px]"
                renderItem={(series) => {
                  const to = getBlogSeriesHref(series);
                  const count = aiMlSeriesCounts.get(series.slug) ?? 0;
                  const visual = getBlogSeriesVisual(series, theme);

                  return (
                    <HomeSeriesMiniCard
                      to={to}
                      visual={visual}
                      title={series.title}
                      subtitle={series.subtitle}
                      tags={series.tags}
                      logos={series.logos}
                      countLabel={count > 0 ? `${count} website chapter${count === 1 ? "" : "s"}` : "Mastery Series"}
                      actionLabel={series.actionLabel || "Open Guide"}
                      theme={theme}
                      rgb={series.rgb}
                    />
                  );
                }}
              />
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
              <ArticleSlider articles={featuredArticles} />
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
