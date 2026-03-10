import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-linq-html-v1";

const LinqMastery = () => {
  return (
    <MasteryEmbedPage
      title="LINQ Mastery"
      embedPath="/embedded/linq-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050c0a]"
    />
  );
};

export default LinqMastery;
