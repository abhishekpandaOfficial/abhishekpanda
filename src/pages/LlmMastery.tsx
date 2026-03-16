import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-16-llm-mastery-v1";

export default function LlmMastery() {
  return (
    <MasteryEmbedPage
      title="LLM Mastery"
      embedPath="/embedded/llm-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#060a12]"
      sectionLabel="AI / ML Hub"
      sectionHref="/ai-ml-hub"
    />
  );
}
