import { PUBLISH_PREVIEWS } from "@/data/openowl-mock";
import { PublishCard } from "@/components/openowl/admin/PublishCard";

export default function PublishPage() {
  return (
    <section>
      <h2 className="text-lg font-semibold">Publish</h2>
      <p className="text-sm text-muted-foreground">Per-platform preview cards with status chips.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PUBLISH_PREVIEWS.map((item) => (
          <PublishCard key={item.platform} item={item} />
        ))}
      </div>
    </section>
  );
}
