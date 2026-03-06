import { Link, useParams } from "react-router-dom";
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className={isBoundDetail ? "pt-20 pb-20 md:pt-24 xl:pb-0" : "pt-24 pb-20"}>
        {isBoundDetail ? (
          <>
            <div className="mx-auto w-full max-w-[1680px] px-4 xl:fixed xl:inset-x-0 xl:top-24 xl:bottom-14 xl:max-w-none xl:px-0">
              <div className="mx-auto w-full max-w-[1680px] px-4 xl:h-full xl:py-4">
                <ArticleDetail article={article} />
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-full max-w-[1680px] items-center justify-between gap-4 px-4">
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Articles
                </Link>
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-semibold text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.publishedAt} • {article.readMinutes} min read
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4">
            {isDetail ? (
            <section className="py-20 text-center">
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Article not found</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That article route does not exist yet.</h1>
                <p className="mt-4 text-muted-foreground">
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

              <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <ArticlesGrid articles={ARTICLES} />
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
                      <p>Turns supplied HTML concepts into React-native article routes instead of standalone static pages.</p>
                      <p>Preserves the site navbar, theme toggle, card language, and navigation flow across list and detail screens.</p>
                      <p>{getArticleUploadHint()}</p>
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
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
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

      {isBoundDetail ? null : <Footer />}
    </div>
  );
}
