import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-10-kafka-html-v3";

const KafkaMastery = () => {
  return (
    <MasteryEmbedPage
      title="Kafka Mastery"
      embedPath="/embedded/kafka-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#0a0d13]"
    />
  );
};

export default KafkaMastery;
