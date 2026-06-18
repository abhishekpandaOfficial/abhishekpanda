import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BrainCircuit, Code2, ExternalLink, FileCode2, GitBranch, PlayCircle, ScanSearch } from "lucide-react";

import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const editorTargets = [
  {
    language: "csharp",
    label: "C#",
    ide: "OneCompiler",
    href: "https://onecompiler.com/csharp",
    note: "Open the C# online editor with autocomplete-oriented editing and direct run support.",
  },
  {
    language: "python",
    label: "Python",
    ide: "OneCompiler",
    href: "https://onecompiler.com/python",
    note: "Open the Python online editor for fast iteration, quick testing, and readable algorithm work.",
  },
  {
    language: "java",
    label: "Java",
    ide: "OneCompiler",
    href: "https://onecompiler.com/java",
    note: "Open the Java online editor for interview-style implementation with class-based structure.",
  },
] as const;

const steps = [
  {
    title: "Pick a problem",
    body: "Choose a DSA question and start from a guided approach rather than an empty editor.",
    icon: ScanSearch,
  },
  {
    title: "Edit the code",
    body: "Switch between C#, Python, and Java or try a different algorithm for the same question.",
    icon: FileCode2,
  },
  {
    title: "Run with trace",
    body: "Use structured trace events so the runtime can build a data-flow view from the actual execution path.",
    icon: PlayCircle,
  },
  {
    title: "Compare approaches",
    body: "Inspect how brute force, optimized, iterative, or recursive solutions change the internal flow and complexity.",
    icon: GitBranch,
  },
  {
    title: "Defend complexity",
    body: "Focus on the time, space, and reason behind the chosen approach instead of only the final answer.",
    icon: BrainCircuit,
  },
];

export default function DsaMasteryPractice() {
  const [searchParams] = useSearchParams();
  const selectedLanguage = searchParams.get("lang") || "csharp";
  const selectedEditor = editorTargets.find((item) => item.language === selectedLanguage) || editorTargets[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>DSA Mastery Practice | Abhishek Panda</title>
        <meta
          name="description"
          content="Dedicated DSA practice workspace with trace-driven runtime flow and cross-language problem solving."
        />
        <link rel="canonical" href={`${SITE_URL}/cheatsheets/dsa-mastery-csharp/practice`} />
      </Helmet>

      <Navigation />

      <main className="pt-24">
        <section className="container mx-auto px-4 pb-10">
          <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">DSA Practice Runtime</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">Dedicated practice workspace</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
              This page is the entry route for practicing DSA. Use the language cards below to launch a proper online editor. Each language
              opens its own IDE target so the editor matches the language you want to solve in.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={selectedEditor.href} target="_blank" rel="noopener noreferrer">
                  Open {selectedEditor.label} Online Editor
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dsa-mastery-csharp/interview">
                  Open Interview Series
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="mb-6 grid gap-5 lg:grid-cols-3">
            {editorTargets.map((editor) => (
              <Card
                key={editor.language}
                className={`rounded-[1.8rem] border-border/60 bg-card/80 ${selectedEditor.language === editor.language ? "ring-2 ring-primary/40" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{editor.ide}</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">{editor.label} Editor</h2>
                    </div>
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{editor.note}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="flex-1">
                      <a href={editor.href} target="_blank" rel="noopener noreferrer">
                        Open {editor.label}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={`/dsa-mastery-csharp/practice?lang=${editor.language}`}>Set Default</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="rounded-[1.8rem] border-border/60 bg-card/80">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-xl font-black tracking-tight text-foreground">{step.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6 rounded-[2rem] border-border/60 bg-card/80">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">Current accuracy model</h2>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">
                    Dynamic flow is accurate when the executed program emits trace events. That keeps the DSA runtime honest: it visualizes
                    what the code actually did instead of faking analysis for arbitrary edited code.
                  </p>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">
                    Selected editor: <span className="font-semibold text-foreground">{selectedEditor.label}</span>. Opening the launch button
                    sends you directly to the matching online IDE page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
