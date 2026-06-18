import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-efcore-html-v4";

const EFCoreMastery = () => {
  return (
    <MasteryEmbedPage
      title="EF Core Mastery"
      embedPath="/embedded/efcore-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#070b14]"
    />
  );
};

export default EFCoreMastery;
