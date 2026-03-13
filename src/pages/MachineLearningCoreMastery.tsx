import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-12-core-ml-mastery-v6";

export default function MachineLearningCoreMastery() {
  return (
    <MasteryEmbedPage
      title="Machine Learning Core Mastery"
      embedPath="/embedded/core-ml-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-background"
      sectionLabel="AI / ML Blogs"
      sectionHref="/ai-ml-blogs"
    />
  );
}
