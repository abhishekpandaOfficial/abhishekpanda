import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-13-golang-html-v1";

const GolangMastery = () => {
  return (
    <MasteryEmbedPage
      title="Go Mastery"
      embedPath="/embedded/golang-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#030b10]"
    />
  );
};

export default GolangMastery;
