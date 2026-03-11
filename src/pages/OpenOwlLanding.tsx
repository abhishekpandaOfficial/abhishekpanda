import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-11-openowl-html-v1";

export default function OpenOwlLanding() {
  return (
    <MasteryEmbedPage
      title="OpenOwl"
      embedPath="/openowl.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050b12]"
      sectionLabel="Projects"
      sectionHref="/projects"
    />
  );
}
