import { FileText, ListChecks, PenSquare, Workflow } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: FileText, title: "Blog Q&A", text: "Ask questions against public blog and profile context." },
  { icon: ListChecks, title: "Summarize", text: "Compress long posts and notes into concise action points." },
  { icon: Workflow, title: "Generate Diagrams", text: "Produce Mermaid-ready architecture diagrams and flows." },
  { icon: PenSquare, title: "Task Drafts", text: "Create task proposals and execution checklists for approval." },
];

export function Capabilities() {
  return (
    <aside className="rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What I can do</h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.28, delay: index * 0.06 }}
            className="rounded-xl border border-border bg-background/60 p-3"
          >
            <div className="mb-1 flex items-center gap-2 text-foreground">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-semibold">{item.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
