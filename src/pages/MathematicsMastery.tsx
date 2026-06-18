import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-11-mathematics-html-v1";

const MathematicsMastery = () => {
  return (
    <MasteryEmbedPage
      title="Mathematics Mastery"
      embedPath="/embedded/mathematics-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#08111f]"
      sectionLabel="AI / ML Blogs"
      sectionHref="/ai-ml-hub"
    />
  );
};

export default MathematicsMastery;
