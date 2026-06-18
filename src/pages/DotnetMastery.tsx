import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-dotnet-html-v3";

const DotnetMastery = () => {
  return (
    <MasteryEmbedPage
      title=".NET Core Internals Mastery"
      embedPath="/embedded/dotnet-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#071019]"
    />
  );
};

export default DotnetMastery;
