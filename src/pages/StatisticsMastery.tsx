import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-11-statistics-html-v1";

const StatisticsMastery = () => {
  return (
    <MasteryEmbedPage
      title="Statistics Mastery"
      embedPath="/embedded/statistics-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#071815]"
      sectionLabel="AI / ML Blogs"
      sectionHref="/ai-ml-hub"
    />
  );
};

export default StatisticsMastery;
