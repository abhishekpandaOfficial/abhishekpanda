import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-15-nlp-mastery-zero-to-hero-v1";

export default function NlpMastery() {
  return (
    <MasteryEmbedPage
      title="NLP Mastery Zero to Hero"
      embedPath="/embedded/nlp-mastery-zero-to-hero.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#0a1020]"
      sectionLabel="AI / ML Hub"
      sectionHref="/ai-ml-hub"
    />
  );
}
