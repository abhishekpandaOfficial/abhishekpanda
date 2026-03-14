import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-14-docker-html-v1";

const DockerMastery = () => {
  return (
    <MasteryEmbedPage
      title="Docker Mastery"
      embedPath="/embedded/docker-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050a10]"
      sectionHref="/techhub"
      sectionLabel="Back To TechHub"
    />
  );
};

export default DockerMastery;
