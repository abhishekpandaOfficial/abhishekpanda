import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PROJECT_CARD_BY_SLUG } from "@/lib/projectsCatalog";

export default function ProductDetail() {
  const { productSlug } = useParams();
  const product = productSlug ? PROJECT_CARD_BY_SLUG.get(productSlug) || null : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Product not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That product route does not exist.</h1>
            <p className="mt-4 text-muted-foreground">Open the projects or products hub to browse the current internal product pages.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/projects">
                  Back to Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products">
                  Open Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = product.icon;
  const isStackCraft = product.slug === "stackcraft";
  const isChronyx = product.slug === "chronyx";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className={`mt-6 overflow-hidden rounded-[2rem] border p-8 md:p-10 ${isStackCraft ? "border-sky-400/20 bg-[radial-gradient(circle_at_top_right,rgba(59,109,240,0.20),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.10),transparent_26%),linear-gradient(160deg,rgba(8,17,31,0.98),rgba(14,26,46,0.92))]" : isChronyx ? "border-cyan-400/20 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.12),transparent_30%),linear-gradient(160deg,rgba(10,15,29,0.96),rgba(15,23,42,0.92))]" : "border-border/60 bg-gradient-to-br from-card via-card to-primary/10"}`}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:items-start">
              <div className="max-w-4xl">
                {isChronyx && product.logoSrc ? (
                  <div className="mb-6 inline-flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.24)]">
                    <img src={product.logoSrc} alt={product.logoAlt || `${product.title} logo`} className="h-14 w-14 rounded-2xl object-contain" loading="eager" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Official Product</p>
                      <p className="mt-1 text-sm font-semibold text-white/90">getchronyx.com</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${isStackCraft ? "border-sky-400/25 bg-sky-500/10 text-sky-300" : "border-primary/25 bg-primary/10 text-primary"}`}>
                    {product.eyebrow || "Product"}
                  </div>
                  {product.statusLabel ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {product.statusLabel}
                    </div>
                  ) : null}
                </div>

                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl">
                  {product.detailTitle || product.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  {product.detailDescription || product.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={`${product.title}-${tag}`}
                      className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {product.launchTo ? (
                    <Button asChild>
                      <Link to={product.launchTo}>
                        {product.launchLabel || "Open Experience"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button variant="outline" asChild>
                    <Link to="/products">
                      Products Hub
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  {product.externalUrl ? (
                    <Button variant="outline" asChild>
                      <a href={product.externalUrl} target="_blank" rel="noopener noreferrer">
                        Visit Official Site
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className={`rounded-[1.75rem] border p-6 ${isStackCraft ? "border-sky-400/20 bg-[linear-gradient(180deg,rgba(14,27,48,0.94),rgba(8,17,31,0.88))]" : "border-border/60 bg-background/80"}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border p-3 text-primary ${isStackCraft ? "border-sky-400/30 bg-gradient-to-br from-sky-500/18 via-blue-500/12 to-cyan-400/18 shadow-[0_18px_40px_rgba(59,109,240,0.18)]" : "border-border/60 bg-card/90"}`}>
                    {product.logoSrc ? (
                      <img src={product.logoSrc} alt={product.logoAlt || `${product.title} logo`} className="h-8 w-8 object-contain" loading="lazy" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Product URL</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{`/products/${product.slug}`}</p>
                  </div>
                </div>

                {product.externalUrl ? (
                  <div className="mt-4 rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Official Website</p>
                    <a
                      href={product.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary"
                    >
                      {product.externalUrl.replace(/^https?:\/\//, "")}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}

                <div className="mt-6 space-y-3">
                  {(product.highlights || []).map((item) => (
                    <div key={item} className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Overview</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">What This Product Covers</h2>
              <p className="mt-4 text-sm leading-8 text-muted-foreground md:text-base">
                {product.longDescription || product.description}
              </p>

              {product.detailSections?.length ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {product.detailSections.map((section) => (
                    <article key={section.title} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                      <h3 className="text-lg font-black tracking-tight text-foreground">{section.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.description}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>

            <aside className="rounded-[2rem] border border-border/60 bg-card/80 p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Navigation</p>
              <div className="mt-4 flex flex-col gap-3">
                <Button variant="outline" asChild className="justify-between">
                  <Link to="/projects">
                    Projects
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-between">
                  <Link to="/products">
                    Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {product.launchTo ? (
                  <Button asChild className="justify-between">
                    <Link to={product.launchTo}>
                      {product.launchLabel || "Open Experience"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
