import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-azure-html-v4";

const AzureMasteryGuide = () => {
  return (
    <MasteryEmbedPage
      title="Azure Mastery"
      embedPath="/embedded/azure-dotnet10-mastery-syllabus-enhanced.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#08111f]"
    />
  );
};

export default AzureMasteryGuide;
