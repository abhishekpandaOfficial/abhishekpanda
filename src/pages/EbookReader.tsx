import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Download, ExternalLink, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ebookBySlug, mapEbookRowToEbook, type EbookRow } from "@/lib/ebooks";
import { useUserAuth } from "@/hooks/useUserAuth";

const isMissingTableError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "PGRST205";
};

export default function EbookReader() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUserAuth();
  const [purchased, setPurchased] = useState(false);

  const { data: ebookRow, isLoading } = useQuery({
    queryKey: ["ebook-reader", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;
      const res = await supabase
        .from("ebooks")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!res.error) return res.data || null;
      if (isMissingTableError(res.error)) return null;
      throw res.error;
    },
  });

  const ebook = useMemo(() => {
    if (ebookRow) return mapEbookRowToEbook(ebookRow as EbookRow);
    return ebookBySlug(slug);
  }, [ebookRow, slug]);

  useEffect(() => {
    if (!slug) return;
    const key = `ebook-purchased:${slug}`;
    setPurchased(localStorage.getItem(key) === "1");
  }, [slug]);

  if (!ebook && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <h1 className="text-2xl font-bold">Loading ebook reader...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <h1 className="text-2xl font-bold">Ebook not found</h1>
          <Link to="/ebooks" className="text-primary underline mt-3 inline-block">Back to Ebooks</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const sourceUrl = ebook.pdfUrl || ebook.previewPdfUrl;
  const isUnlocked = ebook.isFree || (!!user && purchased);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>This ebook requires premium access.</span>
            </div>
            <Button asChild variant="hero">
              <Link to={`/ebooks/${ebook.slug}`}>Unlock from Ebook Details</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!sourceUrl) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <h1 className="text-2xl font-bold">Reader not available</h1>
          <p className="text-muted-foreground mt-2">Upload a PDF/preview in Ebook Studio to enable reading mode.</p>
          <Link to={`/ebooks/${ebook.slug}`} className="text-primary underline mt-3 inline-block">Back to Ebook</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12">
        <section className="container mx-auto px-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/ebooks/${ebook.slug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Link>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {ebook.title}
                </h1>
                <p className="text-sm text-muted-foreground">Reading mode optimized for long-form study.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ebook.pdfUrl ? (
                <a href={ebook.pdfUrl} download>
                  <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                </a>
              ) : null}
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4 mr-2" />Open in new tab</Button>
              </a>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="rounded-2xl border border-border/70 bg-black/5 overflow-hidden">
            <iframe
              src={sourceUrl}
              title={`${ebook.title} reader`}
              className="w-full h-[78vh]"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
