import ArticleCard from "./ArticleCard";
import type { ArticleRecord } from "@/content/articles";

type ArticlesGridProps = {
  articles: ArticleRecord[];
};

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (!articles.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/50 p-10 text-center">
        <h2 className="editorial-title text-2xl font-black text-foreground">No articles found</h2>
        <p className="editorial-copy mt-3 text-muted-foreground">No matches for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} variant="grid" />
      ))}
    </div>
  );
}
