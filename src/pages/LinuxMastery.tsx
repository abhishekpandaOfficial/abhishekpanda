import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-13-linux-html-v1";

const LinuxMastery = () => {
  return (
    <MasteryEmbedPage
      title="Linux Mastery"
      embedPath="/embedded/linux-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050a05]"
    />
  );
};

export default LinuxMastery;
