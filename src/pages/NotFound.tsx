import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, FileText, FolderKanban, Home, LibraryBig } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Blogs", to: "/techhub", icon: BookOpen, note: "Mastery series and topic hubs." },
  { label: "Articles", to: "/articles", icon: FileText, note: "Long-form technical articles and explainers." },
  { label: "Projects", to: "/projects", icon: FolderKanban, note: "Hands-on builds, case studies, and implementations." },
  { label: "Tech Hub", to: "/techhub", icon: LibraryBig, note: "Browse broader engineering content by domain." },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(34,197,94,0.16),transparent_32%),linear-gradient(160deg,hsl(var(--background)),hsl(var(--muted)/0.65),hsl(var(--background)))]" />
      <div className="absolute inset-0 opacity-30 [background:linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto w-full max-w-5xl"
      >
        <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Route Not Found
              </div>

              <h1 className="mt-5 text-5xl font-black tracking-tight text-foreground md:text-7xl">404</h1>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">This page is not part of the current site map.</h2>

              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                The requested URL does not match a published route. Use the main content areas below to continue browsing blogs,
                articles, projects, and other public sections of the site.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    Back to Contents
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/techhub">
                    <ArrowLeft className="h-5 w-5" />
                    Open Blogs
                  </Link>
                </Button>
              </div>

              <div className="mt-7 rounded-2xl border border-border/60 bg-background/80 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Attempted Path</p>
                <code className="mt-2 block break-all text-sm text-foreground/90">{location.pathname}</code>
              </div>
            </div>

            <div className="grid gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group rounded-[1.6rem] border border-border/60 bg-background/80 p-5 transition hover:border-primary/30 hover:bg-background"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold tracking-tight text-foreground">{item.label}</div>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">{item.note}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
