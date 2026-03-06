import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { FileText, LayoutDashboard, ScanSearch, Target } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ResourceHubPage, type ResourceHubCard, type ResourceHubMetric } from "@/components/content/ResourceHubPage";
import CaseStudyDetail from "@/components/case-studies/CaseStudyDetail";
import { CASE_STUDIES, CASE_STUDIES_BY_SLUG, LIVE_CASE_STUDIES } from "@/content/caseStudies";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const metrics: ResourceHubMetric[] = [
  {
    label: "Live Cards",
    value: "15",
    description: "Each live card now opens its own dedicated case-study route instead of redirecting through the Articles hub.",
    icon: FileText,
  },
  {
    label: "Queued Next",
    value: "4",
    description: "Notion, Amazon, Flipkart, and FASTag are staged here for the next dedicated case-study expansions.",
    icon: LayoutDashboard,
  },
  {
    label: "Coverage",
    value: "Web + CV",
    description: "Messaging, search, feeds, payments, storage, ecommerce systems, and computer-vision tolling.",
    icon: ScanSearch,
  },
  {
    label: "Format",
    value: "Routed",
    description: "Every live case study now opens as its own case-studies page with its own URL and detail shell.",
    icon: Target,
  },
];

const hubCards: ResourceHubCard[] = CASE_STUDIES.map((item) => ({
  title: item.title,
  description: item.description,
  to: item.planned ? undefined : `/case-studies/${item.slug}`,
  icon: item.icon,
  tags: item.tags,
  eyebrow: item.planned ? "Next Case Study" : `Case Study ${String(LIVE_CASE_STUDIES.findIndex((entry) => entry.slug === item.slug) + 1).padStart(2, "0")}`,
  statusLabel: item.planned ? "Planned" : "Live",
  disabled: item.planned,
  ctaLabel: item.planned ? "Queued next" : "Open case study",
}));

export default function CaseStudies() {
  const { slug } = useParams();
  const caseStudy = slug ? CASE_STUDIES_BY_SLUG.get(slug) : null;
  const isDetail = Boolean(slug);
  const isBoundDetail = Boolean(isDetail && caseStudy && !caseStudy.planned);

  if (isBoundDetail && caseStudy) {
    const canonical = `${SITE_URL}/case-studies/${caseStudy.slug}`;

    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{`${caseStudy.title} | Case Studies | Abhishek Panda`}</title>
          <meta name="description" content={caseStudy.description} />
          <link rel="canonical" href={canonical} />
        </Helmet>

        <Navigation />

        <main className="pt-24 pb-20">
          <div className="w-full px-0 md:px-4 xl:px-6">
            <CaseStudyDetail key={caseStudy.slug} caseStudy={caseStudy} />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (isDetail) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-20">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Case study not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">That case-study route does not exist yet.</h1>
            <p className="mt-4 text-muted-foreground">
              The live case studies are available below, and the planned entries will gain dedicated pages as you add their full details.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ResourceHubPage
      eyebrow="Case Studies"
      title="System Design and Product Case Studies"
      description="This hub starts with the full 15-case-study library from the flagship .NET implementation guide, but each live card now opens as its own dedicated case-studies page. The next wave of case studies is already queued below for future expansion."
      primaryAction={{ label: "Open First Live Case Study", to: `/case-studies/${LIVE_CASE_STUDIES[0].slug}` }}
      secondaryAction={{ label: "Open Articles Hub", to: "/articles" }}
      metrics={metrics}
      cards={hubCards}
      sectionTitle="Live Library and Next Queue"
      sectionDescription="The first 15 cards are live and routed today under the Case Studies section itself. The additional Notion, Amazon, Flipkart, and FASTag entries are staged here so you can expand them into dedicated pages later without changing the top-level discovery flow."
    />
  );
}
