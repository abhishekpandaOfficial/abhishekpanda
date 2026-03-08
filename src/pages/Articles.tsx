import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, FileStack, Newspaper, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ArticlesHeader from "@/components/articles/ArticlesHeader";
import ArticlesGrid from "@/components/articles/ArticlesGrid";
import ArticleDetail from "@/components/articles/ArticleDetail";
import { ARTICLES, ARTICLES_BY_SLUG, ARTICLES_HOME_LINKS, getArticleFolderPath, getArticleUploadHint } from "@/content/articles";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
type ArticleSortMode = "latest" | "top" | "featured" | "date";

const parseArticleDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function Articles() {
  const { slug } = useParams();
  const article = slug ? ARTICLES_BY_SLUG.get(slug) : null;
  const isDetail = Boolean(slug);
  const isBoundDetail = Boolean(isDetail && article);

  const title = article ? `${article.title} | Articles | Abhishek Panda` : "Articles | Abhishek Panda";
  const description = article
    ? article.description
    : "Explore route-native articles with strong typography, cards, tags, technical iconography, and detail pages.";
  const canonical = `${SITE_URL}${isDetail ? `/articles/${slug}` : "/articles"}`;

  // Filtering and searching state
  const [filter, setFilter] = useState<ArticleSortMode>("latest");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

    let list = ARTICLES.filter((article) => {
      if (!query) return true;

      return (
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    if (filter === "featured") {
      list = list.filter((article) => article.tags.some((tag) => ["featured", "case studies"].includes(tag.toLowerCase())));
    }

    if (filter === "date" && selectedDateObj) {
      list = list.filter((article) => {
        const articleDate = parseArticleDate(article.publishedAt);
        if (!articleDate) return false;
        return articleDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    return [...list].sort((a, b) => {
      const dateA = parseArticleDate(a.publishedAt)?.getTime() ?? 0;
      const dateB = parseArticleDate(b.publishedAt)?.getTime() ?? 0;

      if (filter === "top") return b.readMinutes - a.readMinutes || dateB - dateA;
      return dateB - dateA;
    });
  }, [filter, search, selectedDate]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        {isBoundDetail ? (
          <div className="w-full px-0 md:px-4 xl:px-6">
            <ArticleDetail article={article} />
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {isDetail ? (
              <section className="py-20 text-center">
                <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10">
                  <p className="editorial-kicker text-primary">Article not found</p>
                  <h1 className="editorial-title mt-3 text-3xl font-black text-foreground">That article route does not exist yet.</h1>
                  <p className="editorial-copy mt-4 text-muted-foreground">
                    Future HTML files can be integrated into this hub and bound to their own article routes.
                  </p>
                  <Link
                    to="/articles"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Return to Articles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <ArticlesHeader subtitle="Click the article hub or any card to open route-based article pages with side rails, reading timer, related links, and theme-aware presentation." />

                {/* Filter/Search Controls */}
                <section className="mb-8 flex flex-wrap gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground w-full max-w-xs"
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as ArticleSortMode)}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                  >
                    <option value="latest">Latest</option>
                    <option value="top">Top</option>
                    <option value="featured">Featured</option>
                    <option value="date">Date</option>
                  </select>
                  {filter === "date" ? (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                    />
                  ) : null}
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0">
                    <ArticlesGrid articles={filteredArticles} />
                  </div>

                  <motion.aside
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="space-y-5 lg:sticky lg:top-24 lg:self-start"
                  >
                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <FileStack className="h-4 w-4" />
                        What this hub does
                      </div>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                        <p className="editorial-copy">Turns supplied HTML concepts into React-native article routes instead of standalone static pages.</p>
                        <p className="editorial-copy">Preserves the site navbar, theme toggle, card language, and navigation flow across list and detail screens.</p>
                        <p className="editorial-copy">{getArticleUploadHint()}</p>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Connected Pages
                      </div>
                      <div className="mt-4 space-y-3">
                        {ARTICLES_HOME_LINKS.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="font-semibold text-foreground">{item.title}</p>
                            {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <Newspaper className="h-4 w-4" />
                        Routing Ready
                      </div>
                      <p className="editorial-copy mt-4 text-sm text-muted-foreground">
                        Upload `.html` files to <span className="font-semibold text-foreground">{getArticleFolderPath()}</span> and they will appear as cards and route pages under the same layout.
                      </p>
                    </div>
                  </motion.aside>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
