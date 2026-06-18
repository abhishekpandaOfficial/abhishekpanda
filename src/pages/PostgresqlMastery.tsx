import { MasteryEmbedPage } from "@/components/blog/MasteryEmbedPage";

const STATIC_HTML_VERSION = "2026-03-14-postgresql-html-v1";

const PostgresqlMastery = () => {
  return (
    <MasteryEmbedPage
      title="PostgreSQL Mastery"
      embedPath="/embedded/pg-mastery.html"
      version={STATIC_HTML_VERSION}
      backgroundClassName="bg-[#07050f]"
      sectionHref="/techhub"
      sectionLabel="Back To TechHub"
    />
  );
};

export default PostgresqlMastery;
