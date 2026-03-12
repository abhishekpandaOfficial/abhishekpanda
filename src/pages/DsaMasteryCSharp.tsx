import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Binary, BookOpen, BrainCircuit, Code2, Database, GraduationCap, Rocket } from "lucide-react";

import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const primaryAreas = [
  {
    title: "Open DSA Syllabus",
    href: "/cheatsheets/dsa-mastery-csharp/syllabus",
    description: "Full visual syllabus page with the detailed DSA content, explanations, diagrams, flows, and runtime modals.",
    icon: BookOpen,
  },
  {
    title: "Practice Runtime",
    href: "/cheatsheets/dsa-mastery-csharp/practice",
    description: "Dedicated practice page for the DSA execution loop, trace-driven flow, and cross-language runtime workflow.",
    icon: Code2,
  },
  {
    title: "Interview Series",
    href: "/cheatsheets/dsa-mastery-csharp/interview",
    description: "Dedicated interview page for the modular DSA question bank, approach thinking, complexity analysis, and preparation tracks.",
    icon: BrainCircuit,
  },
];

const roadmap = [
  {
    title: "Foundations",
    icon: GraduationCap,
    summary: "Complexity, arrays, strings, recursion, hashing, and problem decomposition in simple words.",
  },
  {
    title: "Core Structures",
    icon: Database,
    summary: "Stacks, queues, linked lists, trees, heaps, graphs, and the real scenarios where each one fits.",
  },
  {
    title: "Algorithms",
    icon: Binary,
    summary: "Sorting, searching, sliding window, greedy, graph traversal, recursion, and dynamic programming.",
  },
  {
    title: "Interview to Mastery",
    icon: Rocket,
    summary: "Move from solving questions to explaining tradeoffs, complexity, and production-grade reasoning.",
  },
];

export default function DsaMasteryCSharp() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>DSA Mastery | Abhishek Panda</title>
        <meta
          name="description"
          content="DSA Mastery hub with dedicated syllabus, practice runtime, and interview series pages."
        />
        <link rel="canonical" href={`${SITE_URL}/cheatsheets/dsa-mastery-csharp`} />
      </Helmet>

      <Navigation />

      <main className="pt-24">
        <section className="border-b border-border/50 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_28%)]">
          <div className="container mx-auto px-4 pb-14 pt-6 md:pb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
              <BookOpen className="h-4 w-4" />
              DSA Mastery Hub
            </div>

            <div className="mt-6 max-w-4xl">
              <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
                DSA Mastery is now split into real subpages instead of one embedded screen.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                Use the hub as the entry point, then move into the dedicated syllabus, practice, or interview pages. Each section now has
                its own route instead of being shown inside the same page.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {primaryAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <Card key={area.title} className="rounded-[1.8rem] border-border/60 bg-card/80">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground">{area.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{area.description}</p>
                      <Button asChild className="mt-6 w-full">
                        <Link to={area.href}>
                          Go to Page
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Learning Path</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Beginner to mastery roadmap</h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-4">
            {roadmap.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="rounded-[1.8rem] border-border/60 bg-card/80">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
