import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type EmbeddedAtlasPageShellProps = {
  title: string;
  description: string;
  badge: string;
  accentClassName: string;
  metricItems: Array<{ label: string; value: string }>;
  children: ReactNode;
};

export function EmbeddedAtlasPageShell({
  title,
  description,
  badge,
  accentClassName,
  metricItems,
  children,
}: EmbeddedAtlasPageShellProps) {
  return (
    <main className="pt-16 md:pt-20">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94))]" />
        <div className="relative w-full px-4 py-6 md:px-6 md:py-8 xl:px-8 2xl:px-10">
          <Breadcrumb>
            <BreadcrumbList className="text-xs md:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/llm-galaxy">LLM Galaxy</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-end">
            <div className="max-w-5xl">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${accentClassName}`}>
                {badge}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground md:text-lg md:leading-8">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metricItems.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-black tracking-tight text-foreground md:text-xl">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-0 md:px-0">
        <div className="border-y border-border/60 bg-background/60">
          {children}
        </div>
      </section>
    </main>
  );
}
