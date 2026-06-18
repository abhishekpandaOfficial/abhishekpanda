import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-12-dsa-mastery-csharp-v2";

const DsaMasterySyllabus = () => {
  return (
    <MasteryEmbedPage
      title="DSA Mastery Syllabus"
      embedPath="/embedded/dsa-mastery-csharp.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-background"
      sectionLabel="DSA Mastery"
      sectionHref="/dsa-mastery-csharp/syllabus"
    />
  );
};

export default DsaMasterySyllabus;
