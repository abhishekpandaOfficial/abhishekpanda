type Props = {
  previewPdfUrl: string | null;
  title: string;
};

export function PreviewPane({ previewPdfUrl, title }: Props) {
  if (!previewPdfUrl) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Preview is not available yet for this ebook.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border/70 bg-black/5">
      <iframe
        src={previewPdfUrl}
        title={`${title} preview`}
        className="w-full h-[520px]"
      />
    </div>
  );
}
