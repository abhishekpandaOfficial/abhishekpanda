import ArticleCard from "./ArticleCard";
import type { ArticleRecord } from "@/content/articles";

type ArticlesGridProps = {
  articles: ArticleRecord[];
};

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (!articles.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/50 p-10 text-center">
        <h2 className="text-2xl font-black tracking-tight text-foreground">No articles published yet</h2>
        <p className="mt-3 text-muted-foreground">Drop the next HTML file in and I can wire it into this hub as a routed article.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} featured />
      ))}
    </div>
  );
}
