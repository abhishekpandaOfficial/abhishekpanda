import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { SubstackCollection } from "@/components/blog/SubstackCollection";

const SITE_URL = "https://www.abhishekpanda.com";

export default function StackedInArchive() {
  const canonical = `${SITE_URL}/blog`;
  const description = "Browse all 45 StackedIN engineering posts by Abhishek Panda with hero images, topic tags, social sharing, and direct links to the original Substack articles.";

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Helmet>
        <title>StackedIN Engineering Posts | Abhishek Panda</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="StackedIN Engineering Posts | Abhishek Panda" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "StackedIN Engineering Posts",
            url: canonical,
            description,
            author: { "@type": "Person", name: "Abhishek Panda", url: SITE_URL },
            isPartOf: { "@type": "WebSite", name: "Abhishek Panda", url: SITE_URL },
            sameAs: "https://stackedin.substack.com",
          })}
        </script>
      </Helmet>
      <Navigation />
      <main className="pb-16 pt-28 md:pt-32">
        <SubstackCollection />
      </main>
      <Footer />
    </div>
  );
}
