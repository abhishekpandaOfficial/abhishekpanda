import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { ebooks, ebookBundles, type Ebook } from "@/lib/ebooks";
import { EbookCard } from "@/components/ebooks/EbookCard";

const allCategories = ["All", ...Array.from(new Set(ebooks.map((e) => e.category)))];
const allLevels = ["All", ...Array.from(new Set(ebooks.map((e) => e.level)))];
const allTags = ["All", "FREE", "PREMIUM", "COMING SOON"] as const;
const allTech = Array.from(new Set(ebooks.flatMap((e) => e.techStack))).sort();

export default function Ebooks() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [tag, setTag] = useState<(typeof allTags)[number]>("All");
  const [tech, setTech] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return ebooks.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.techStack.join(" ").toLowerCase().includes(q);
      const matchesCategory = category === "All" || e.category === category;
      const matchesLevel = level === "All" || e.level === level;
      const matchesTag =
        tag === "All" ||
        (tag === "FREE" && e.isFree) ||
        (tag === "PREMIUM" && !e.isFree && !e.isComingSoon) ||
        (tag === "COMING SOON" && e.isComingSoon);
      const matchesTech = tech.length === 0 || tech.every((t) => e.techStack.includes(t));

      return matchesQ && matchesCategory && matchesLevel && matchesTag && matchesTech;
    });
  }, [query, category, level, tag, tech]);

  const featured = filtered.filter((e) => e.sections.includes("featured"));
  const interview = filtered.filter((e) => e.sections.includes("interview"));
  const architect = filtered.filter((e) => e.sections.includes("architect"));

  const renderSection = (title: string, items: Ebook[]) => (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-5">{title}</h2>
      {items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((ebook) => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-5 text-sm text-muted-foreground">No ebooks match this section for current filters.</div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Abhishek Panda Ebooks
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Ebooks</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Preview in browser. Free ebooks use OTP-verified download. Premium ebooks unlock after purchase.</p>
          </div>

          <div className="glass-card rounded-2xl p-4 md:p-5 mb-7">
            <div className="relative mb-4">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search ebooks, stacks, categories..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                {allCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
                {allLevels.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={tag} onChange={(e) => setTag(e.target.value as (typeof allTags)[number])}>
                {allTags.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground self-center">Tech stack multi-select:</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {allTech.map((t) => {
                const selected = tech.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTech((prev) => (selected ? prev.filter((x) => x !== t) : [...prev, t]))}
                    className={`px-2.5 py-1 rounded-full text-xs border ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground border-border"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-4">Bundle Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ebookBundles.map((b) => (
                <div key={b.id} className="glass-card rounded-2xl p-5 border border-border/70">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold">{b.title}</h3>
                    <span className="badge-premium">{b.discountLabel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{b.subtitle}</p>
                  <div className="text-primary font-black text-xl">{b.priceLabel}</div>
                </div>
              ))}
            </div>
          </section>

          {renderSection("Featured Ebooks", featured)}
          {renderSection("Interview Packs", interview)}
          {renderSection("Architect Series", architect)}
        </section>
      </main>
      <Footer />
    </div>
  );
}
