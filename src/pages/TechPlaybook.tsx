import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Menu, X, BookOpen, Layers3, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import {
  TECH_DOMAINS,
  TECH_PLAYBOOK_ITEMS,
  getDomainItems,
  getTechPlaybookBySlug,
} from "@/lib/techPlaybook";

const levelOrder: Array<keyof (typeof TECH_PLAYBOOK_ITEMS)[number]["levels"]> = [
  "basics",
  "intermediate",
  "advanced",
  "architect",
];

const levelTitle: Record<(typeof levelOrder)[number], string> = {
  basics: "Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
  architect: "Architect",
};

const TechPlaybook = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selected = useMemo(
    () => (slug ? getTechPlaybookBySlug(slug) : TECH_PLAYBOOK_ITEMS[0]),
    [slug]
  );

  const activeDomain = useMemo(
    () => TECH_DOMAINS.find((d) => d.slug === selected?.domain) ?? TECH_DOMAINS[0],
    [selected?.domain]
  );

  const domainItems = useMemo(() => getDomainItems(activeDomain.slug), [activeDomain.slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-semibold"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <Link to="/about" className="text-sm text-primary underline-offset-4 hover:underline">
            Back to About
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-primary">Tech Modules</h2>
              {TECH_DOMAINS.map((domain) => {
                const isActive = domain.slug === activeDomain.slug;
                return (
                  <div key={domain.slug} className="space-y-2">
                    <p className={`text-xs font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {domain.label}
                    </p>
                    <div className="space-y-1">
                      {getDomainItems(domain.slug).map((item) => (
                        <Link
                          key={item.slug}
                          to={`/tech/${item.slug}`}
                          className={`block rounded-md px-2 py-1.5 text-xs transition-colors ${
                            selected?.slug === item.slug
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            {!selected ? (
              <div className="rounded-2xl border border-border/60 bg-card p-8">
                <h1 className="text-2xl font-black">Tech module not found</h1>
                <p className="mt-2 text-muted-foreground">Pick another module from the left menu.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{activeDomain.label}</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight">{selected.name}</h1>
                  <p className="mt-3 text-sm text-muted-foreground">{selected.what}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Why: {selected.why}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {levelOrder.map((level) => (
                    <div key={level} className="rounded-2xl border border-border/60 bg-card/80 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">{levelTitle[level]}</h2>
                      </div>
                      <ul className="space-y-1">
                        {selected.levels[level].map((topic) => (
                          <li key={topic} className="text-sm text-muted-foreground">• {topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-black">Free Posts</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selected.freePosts.map((post) => (
                      <Link key={post.title} to={post.href} className="group rounded-xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40 hover:bg-primary/5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{post.tag}</p>
                        <h3 className="mt-1 text-sm font-bold text-foreground group-hover:text-primary">{post.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{post.summary}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-black">Learning Streams</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {TECH_DOMAINS.map((domain) => (
                      <div key={domain.slug} className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <p className="text-sm font-bold text-foreground">{domain.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{domain.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {domain.focusTags.map((tag) => (
                            <span key={`${domain.slug}-${tag}`} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-r border-border bg-background p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-primary">Tech Modules</h2>
                <button onClick={() => setSidebarOpen(false)} className="rounded-md border border-border/60 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {TECH_DOMAINS.map((domain) => (
                  <div key={domain.slug} className="space-y-2">
                    <p className="text-xs font-bold text-foreground">{domain.label}</p>
                    <div className="space-y-1">
                      {getDomainItems(domain.slug).map((item) => (
                        <Link
                          key={item.slug}
                          to={`/tech/${item.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`block rounded-md px-2 py-1.5 text-xs ${
                            selected?.slug === item.slug
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default TechPlaybook;
