import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Book3D } from "@/components/ebooks/Book3D";
import { TechIconRow } from "@/components/ebooks/TechIconRow";
import { PreviewPane } from "@/components/ebooks/PreviewPane";
import { DownloadGateModal } from "@/components/ebooks/DownloadGateModal";
import { ebookBySlug } from "@/lib/ebooks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserAuth } from "@/hooks/useUserAuth";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.abhishekpanda.com";

export default function EbookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const ebook = ebookBySlug(slug);
  const { user } = useUserAuth();
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const key = `ebook-purchased:${slug}`;
    setPurchased(localStorage.getItem(key) === "1");
  }, [slug]);

  const canonical = `${SITE_URL.replace(/\/$/, "")}/ebooks/${slug || ""}`;

  const isUnlockedPremium = useMemo(() => {
    if (!ebook || ebook.isFree) return false;
    return !!user && purchased;
  }, [ebook, user, purchased]);

  if (!ebook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <h1 className="text-3xl font-black">Ebook not found</h1>
          <Link to="/ebooks" className="text-primary underline mt-3 inline-block">Back to Ebooks</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${ebook.title} | Ebooks | Abhishek Panda`}</title>
        <meta name="description" content={ebook.subtitle} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Navigation />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 mb-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            <div className="mx-auto">
              <Book3D coverImage={ebook.coverImageUrl} title={ebook.title} spineText="Abhishek Panda" thickness={18} className="h-[340px] w-[240px]" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 gap-y-1.5 mb-3">
                <span className={`${ebook.isFree ? "badge-free" : "badge-premium"} whitespace-nowrap leading-none`}>{ebook.isFree ? "Free" : "Premium"}</span>
                {ebook.isComingSoon ? <span className="badge-free whitespace-nowrap leading-none">Coming Soon</span> : null}
                <span className="px-2 py-1 rounded-md bg-muted text-xs font-semibold whitespace-nowrap leading-none">{ebook.level}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{ebook.title}</h1>
              <p className="text-lg text-muted-foreground mb-3">{ebook.subtitle}</p>
              <p className="text-sm text-muted-foreground mb-4">Author: <span className="text-foreground font-semibold">Abhishek Panda</span></p>
              <TechIconRow techStack={ebook.techStack} />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="toc">Table of Contents</TabsTrigger>
              <TabsTrigger value="tech">Tech & Libraries Used</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="download">Download / Unlock</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="glass-card rounded-2xl p-6">
              <p className="text-muted-foreground leading-7">{ebook.description}</p>
              <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-border p-4">
                  <div className="font-semibold mb-2">Includes</div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="inline-flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-primary" />Browser Preview</li>
                    <li className="inline-flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-primary" />EPUB + PDF format</li>
                    <li className="inline-flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-primary" />Read in Chronyx Hub link</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="font-semibold mb-2">Access Policy</div>
                  <p className="text-muted-foreground">
                    Free ebooks allow instant preview and OTP-verified download. Premium ebooks require sign-in and purchase unlock.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="toc" className="glass-card rounded-2xl p-6">
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                {ebook.toc.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="tech" className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tech Stack</h3>
                <TechIconRow techStack={ebook.techStack} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Libraries</h3>
                <div className="flex flex-wrap gap-2">
                  {ebook.libraries.map((lib) => (
                    <span key={lib} className="px-2.5 py-1 rounded-full bg-muted text-sm text-foreground">{lib}</span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-3">
              <PreviewPane previewPdfUrl={ebook.previewPdfUrl} title={ebook.title} />
              <p className="text-xs text-muted-foreground">Preview is available immediately. Download for offline use from the Download tab.</p>
            </TabsContent>

            <TabsContent value="download" className="glass-card rounded-2xl p-6 space-y-4">
              {ebook.isFree ? (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm">
                    <div className="font-semibold mb-1">Free Download (OTP Verified)</div>
                    <p className="text-muted-foreground">Preview is open. Download requires quick email/mobile verification with OTP.</p>
                  </div>
                  <DownloadGateModal ebookSlug={ebook.slug} title={ebook.title} triggerLabel="Download (OTP Verification)" />
                </>
              ) : null}

              {!ebook.isFree && !user ? (
                <>
                  <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Sign in to unlock premium ebook.
                  </div>
                  <Button asChild variant="hero">
                    <Link to={`/login?next=${encodeURIComponent(`/ebooks/${ebook.slug}`)}`}>Sign in to unlock</Link>
                  </Button>
                </>
              ) : null}

              {!ebook.isFree && user && !isUnlockedPremium ? (
                <>
                  <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                    Premium locked. Purchase required. Payment integration is connected as a safe stub for now.
                  </div>
                  <Button
                    variant="premium"
                    onClick={() => {
                      localStorage.setItem(`ebook-purchased:${ebook.slug}`, "1");
                      setPurchased(true);
                    }}
                  >
                    Buy Now (Stub)
                  </Button>
                </>
              ) : null}

              {!ebook.isFree && isUnlockedPremium ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Premium unlocked.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ebook.pdfUrl ? (
                      <a href={ebook.pdfUrl} download>
                        <Button>Download PDF</Button>
                      </a>
                    ) : null}
                    {ebook.epubUrl ? (
                      <a href={ebook.epubUrl} download>
                        <Button variant="outline">Download EPUB</Button>
                      </a>
                    ) : null}
                    <a href={`chronyx://hub/ebooks/${ebook.slug}`}>
                      <Button variant="hero-outline"><BookOpen className="h-4 w-4" />Read in Chronyx Hub</Button>
                    </a>
                    <a href={`https://getchronyx.com/hub/ebooks/${ebook.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost">Chronyx web fallback</Button>
                    </a>
                  </div>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
