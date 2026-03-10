import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-microservices-html-v1";

const MicroservicesMastery = () => {
  return (
    <MasteryEmbedPage
      title="Microservices Mastery"
      embedPath="/embedded/microservices-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050A12]"
    />
  );
};

export default MicroservicesMastery;
