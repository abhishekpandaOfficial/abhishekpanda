import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-11-numpy-html-v1";

const NumpyMastery = () => {
  return (
    <MasteryEmbedPage
      title="NumPy Mastery"
      embedPath="/embedded/numpy-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#07162b]"
      sectionLabel="AI / ML Blogs"
      sectionHref="/ai-ml-blogs"
    />
  );
};

export default NumpyMastery;
