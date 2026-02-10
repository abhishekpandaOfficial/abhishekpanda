import { Link } from "react-router-dom";
import { ArrowRight, Clock, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Book3D } from "@/components/ebooks/Book3D";
import { TechIconRow } from "@/components/ebooks/TechIconRow";
import type { Ebook } from "@/lib/ebooks";

type Props = {
  ebook: Ebook;
};

export function EbookCard({ ebook }: Props) {
  const tag = ebook.isComingSoon ? "Coming Soon" : ebook.isFree ? "Free" : "Premium";
  const hasPreview = !!ebook.previewPdfUrl || !!ebook.pdfUrl;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-4"
    >
      <Link to={`/ebooks/${ebook.slug}`} className="mx-auto">
        <Book3D
          coverImage={ebook.coverImageUrl}
          title={ebook.title}
          spineText="Abhishek Panda"
          thickness={14}
          accentColor={ebook.isFree ? "#059669" : "#2563eb"}
          className="h-[250px] w-[180px] md:h-[270px] md:w-[200px]"
        />
      </Link>

      <div className="space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2 gap-y-1.5 min-w-0">
          <span className={`${ebook.isFree ? "badge-free" : ebook.isComingSoon ? "badge-free" : "badge-premium"} whitespace-nowrap leading-none`}>{tag}</span>
          <span className="px-2 py-1 rounded-md bg-muted text-xs font-semibold text-foreground whitespace-nowrap leading-none">{ebook.level}</span>
          {!ebook.isComingSoon && hasPreview ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="h-3.5 w-3.5" />Preview ready</span>
          ) : null}
        </div>
        <h3 className="text-lg font-extrabold tracking-tight leading-tight text-foreground break-words">{ebook.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 break-words">{ebook.subtitle}</p>
      </div>

      <TechIconRow techStack={ebook.techStack.slice(0, 6)} compact />

      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">
          {ebook.isComingSoon ? "Waitlist" : ebook.isFree ? "Free" : `₹${ebook.priceInINR?.toLocaleString("en-IN")}`}
        </span>
        <div className="inline-flex items-center gap-2 text-sm text-primary font-semibold">
          {ebook.isComingSoon ? <Sparkles className="h-4 w-4" /> : ebook.isFree ? "Preview / Download" : <><Lock className="h-4 w-4" />Unlock</>}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </motion.article>
  );
}
