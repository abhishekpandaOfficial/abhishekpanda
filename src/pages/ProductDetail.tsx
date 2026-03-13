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

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-8 md:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:items-start">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
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
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-background/80 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-3 text-primary">
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
