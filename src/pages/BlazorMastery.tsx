import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-blazor-html-v2";

const BlazorMastery = () => {
  return (
    <MasteryEmbedPage
      title="Blazor Mastery"
      embedPath="/embedded/blazor-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#0a0f1f]"
    />
  );
};

export default BlazorMastery;
