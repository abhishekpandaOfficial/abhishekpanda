import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-13-k8s-html-v1";

const KubernetesMastery = () => {
  return (
    <MasteryEmbedPage
      title="Kubernetes Mastery"
      embedPath="/embedded/k8s-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#020d1a]"
      sectionHref="/techhub"
      sectionLabel="Back To TechHub"
    />
  );
};

export default KubernetesMastery;
