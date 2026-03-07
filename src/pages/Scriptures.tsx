import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpenText, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ScriptureCard from "@/components/scriptures/ScriptureCard";
import ScripturesHeader from "@/components/scriptures/ScripturesHeader";
import ScriptureDetail from "@/components/scriptures/ScriptureDetail";
import { SCRIPTURES, SCRIPTURES_BY_SLUG } from "@/content/scriptures";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

export default function Scriptures() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const scripture = slug ? SCRIPTURES_BY_SLUG.get(slug) : null;
  const isDetail = Boolean(slug);
  const isBoundDetail = Boolean(isDetail && scripture);

  const [query, setQuery] = useState("");
  const [religion, setReligion] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCRIPTURES.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesReligion = religion === "All" || item.religion === religion;
      return matchesQuery && matchesReligion;
    });
  }, [query, religion]);

  const title = scripture ? `${scripture.title} | Scriptures | Abhishek Panda` : "Scriptures | Abhishek Panda";
  const description = scripture
    ? scripture.description
    : "Read scripture guides with rich cards, religion tags, symbolic imagery, and progress-aware reading.";
  const canonical = `${SITE_URL}${isDetail ? `/scriptures/${slug}` : "/scriptures"}`;
  const relatedPages = [
    { title: "Articles", to: "/articles", description: "Knowledge guides and deep dives" },
    { title: "Blogs", to: "/blogs", description: "Updates and insights" },
    { title: "About", to: "/about", description: "Author and mission" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        {isBoundDetail && scripture ? (
          <div className="w-full px-0 md:px-4 xl:px-6">
            <ScriptureDetail scripture={scripture} />
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {isDetail ? (
              <section className="py-20 text-center">
                <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Scripture not found</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That scripture route does not exist yet.</h1>
                  <Link
                    to="/scriptures"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Return to Scriptures
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <ScripturesHeader />

                <section className="mt-8 mb-8 flex flex-wrap items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search scriptures..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                  />
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2 text-base text-foreground"
                  >
                    <option value="All">All Religions</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="General">General</option>
                  </select>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6 min-w-0">
                    {filtered.length ? (
                      filtered.map((item) => <ScriptureCard key={item.slug} scripture={item} />)
                    ) : (
                      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/50 p-10 text-center">
                        <h2 className="text-2xl font-black tracking-tight text-foreground">No scriptures match your filter</h2>
                        <p className="mt-3 text-muted-foreground">Try another search term or religion filter.</p>
                      </div>
                    )}
                  </div>

                  <motion.aside
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="space-y-5 lg:sticky lg:top-24 lg:self-start"
                  >
                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        <BookOpenText className="h-4 w-4" />
                        Scripture Hub
                      </div>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                        <p>Discover scripture guides in visually rich card format with tags and symbolic identity.</p>
                        <p>Open each guide in a full reading experience with progress and timer insights.</p>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Connected Pages</p>
                      <div className="mt-4 space-y-3">
                        {SCRIPTURES.map((item) => (
                          <Link
                            key={item.slug}
                            to={`/scriptures/${item.slug}`}
                            className="block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.religion}</p>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                        {relatedPages.map((item) => (
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
                      <button
                        type="button"
                        onClick={() => navigate("/admin/cms")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Scripture
                      </button>
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
