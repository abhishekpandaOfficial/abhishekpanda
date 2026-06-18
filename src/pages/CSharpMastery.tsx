import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-csharp-html-v6";

const CSharpMastery = () => {
  return (
    <MasteryEmbedPage
      title="C# Mastery"
      embedPath="/embedded/csharp-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#080c14]"
    />
  );
};

export default CSharpMastery;
