import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-angular-html-v4";

const AngularMasteryGuide = () => {
  return (
    <MasteryEmbedPage
      title="Angular Mastery"
      embedPath="/embedded/angular-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#080B10]"
    />
  );
};

export default AngularMasteryGuide;
