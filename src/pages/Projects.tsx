import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Globe, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  website: string;
  status: "Todo" | "InDevelopment" | "Live" | "Rejected";
  summary: string;
  stacks: string[];
  logo_icon: string;
}

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portfolio-projects-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Project[];
    },
  });

  // Extract Chronyx and other live projects
  const chronyxProject = useMemo(() => {
    return projects.find((p) => p.name.toUpperCase() === "CHRONYX");
  }, [projects]);

  const otherProjects = useMemo(() => {
    return projects.filter(
      (p) => p.name.toUpperCase() !== "CHRONYX" && p.status === "Live"
    );
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Projects | Abhishek Panda</title>
        <meta
          name="description"
          content="Curated projects portfolio featuring CHRONYX and other live products with website URLs."
        />
        <link rel="canonical" href={`${SITE_URL}/projects`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 space-y-12">
          {/* Hero Banner */}
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(150deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(150deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Products & Software
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Software Workspace Portfolio
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Explore my main products and active software projects configured directly from the admin panel.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-primary/35 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-12">
              {/* CHRONYX Featured Product Hero Card */}
              {chronyxProject && (
                <div className="relative overflow-hidden rounded-[2.25rem] border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-1 shadow-xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                  <div className="bg-card/90 rounded-[2.1rem] p-6 md:p-10 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-500 shadow-md">
                          <Globe className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                            {chronyxProject.name}
                          </h2>
                          <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold mt-1">Featured Live Product</p>
                        </div>
                      </div>
                      <Badge className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                        Ready for Public Use
                      </Badge>
                    </div>

                    <p className="text-base md:text-lg leading-8 text-muted-foreground max-w-4xl">
                      {chronyxProject.summary}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4">
                      <Button asChild size="lg" className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-bold px-6 shadow-lg shadow-indigo-500/20">
                        <a href={chronyxProject.website} target="_blank" rel="noreferrer">
                          Visit {chronyxProject.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Projects Grid */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" /> Active Software & Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherProjects.map((project) => (
                    <Card key={project.id} className="bg-card/75 border-border/70 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors rounded-[1.6rem] overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="text-xl font-bold text-foreground">
                            {project.name}
                          </CardTitle>
                          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300 rounded-lg text-[10px]">
                            Live
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
                          {project.summary}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="pt-0 border-t border-border/20 p-4">
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 hover:bg-muted py-2 text-xs font-bold text-foreground transition-all"
                        >
                          Visit Website
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
