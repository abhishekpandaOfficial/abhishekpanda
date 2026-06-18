import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-13-git-github-html-v1";

const GitGithubMastery = () => {
  return (
    <MasteryEmbedPage
      title="GIT/GITHUB Mastery"
      embedPath="/embedded/git-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#07070c]"
    />
  );
};

export default GitGithubMastery;
