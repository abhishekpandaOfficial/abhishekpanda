import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LongformSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  overview: string;
  bulletTitle?: string;
  bullets: string[];
  tags?: string[];
};

export function LongformSummaryDialog({
  open,
  onOpenChange,
  title,
  overview,
  bulletTitle = "Key takeaways",
  bullets,
  tags = [],
}: LongformSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AI Summary
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Concise reading notes generated from the current page structure for {title}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Overview</p>
            <p className="leading-7 text-foreground">{overview}</p>
          </div>

          <div className="rounded-xl border border-border bg-card/70 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{bulletTitle}</p>
            <ul className="space-y-2">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-2 text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Summary generated from the current page structure, headings, and article metadata.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
