import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-solid-principles-html-v4";

const SolidPrinciplesGuide = () => {
  return (
    <MasteryEmbedPage
      title="SOLID Principles"
      embedPath="/embedded/solid-principles-guide.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#0a0e1a]"
    />
  );
};

export default SolidPrinciplesGuide;
