import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-14-mssql-html-v1";

const MsSqlServerMastery = () => {
  return (
    <MasteryEmbedPage
      title="MS SQL Server Mastery"
      embedPath="/embedded/sql-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#050a08]"
      sectionHref="/techhub"
      sectionLabel="Back To TechHub"
    />
  );
};

export default MsSqlServerMastery;
