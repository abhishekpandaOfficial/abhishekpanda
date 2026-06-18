import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Code2,
  Filter,
  PlayCircle,
  Search,
} from "lucide-react";

import { Navigation } from "@/components/layout/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DSA_QUESTION_BANK, DSA_QUESTION_BANK_STATS, DSA_QUESTION_TAGS, type DsaQuestion } from "@/lib/dsaQuestionBank";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
const defaultQuestion = DSA_QUESTION_BANK[0];

export default function DsaMasteryInterview() {
  const detailRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [activeSource, setActiveSource] = useState<string>("all");
  const [activeModule, setActiveModule] = useState<string>("all");
  const [selectedQuestionId, setSelectedQuestionId] = useState(defaultQuestion.id);
  const [activeLanguage, setActiveLanguage] = useState<"csharp" | "python">("csharp");

  const sources = useMemo(() => ["all", ...new Set(DSA_QUESTION_BANK.map((question) => question.source))], []);
  const visibleTags = useMemo(() => {
    const priority = ["beginner", "advanced", "scenario", "logical", "architect", "problem-solving", "csharp", "python"];
    const picked = priority.filter((tag) => DSA_QUESTION_TAGS.includes(tag));
    const extra = DSA_QUESTION_TAGS.filter((tag) => !picked.includes(tag)).slice(0, 10);
    return ["all", ...picked, ...extra];
  }, []);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return DSA_QUESTION_BANK.filter((question) => {
      const matchesTag = activeTag === "all" || question.tags.includes(activeTag);
      const matchesSource = activeSource === "all" || question.source === activeSource;
      const matchesModule = activeModule === "all" || question.module === activeModule;
      const haystack = [
        question.id,
        question.title,
        question.module,
        question.pattern,
        question.source,
        question.difficulty,
        question.prompt,
        question.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesTag && matchesSource && matchesModule && matchesSearch;
    });
  }, [activeModule, activeSource, activeTag, search]);

  const groupedQuestions = useMemo(() => {
    const grouped = new Map<string, DsaQuestion[]>();
    filteredQuestions.forEach((question) => {
      const list = grouped.get(question.module) || [];
      list.push(question);
      grouped.set(question.module, list);
    });
    return [...grouped.entries()];
  }, [filteredQuestions]);

  const moduleOptions = useMemo(
    () => [
      { name: "all", count: DSA_QUESTION_BANK.length },
      ...[...new Set(DSA_QUESTION_BANK.map((question) => question.module))].map((module) => ({
        name: module,
        count: DSA_QUESTION_BANK.filter((question) => question.module === module).length,
      })),
    ],
    [],
  );

  const selectedQuestion =
    filteredQuestions.find((question) => question.id === selectedQuestionId) ||
    filteredQuestions[0] ||
    defaultQuestion;

  const openQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>DSA Interview Series | Abhishek Panda</title>
        <meta
          name="description"
          content="Three-column DSA interview workspace with modular question navigation, explanations, and C#/Python code panels."
        />
        <link rel="canonical" href={`${SITE_URL}/cheatsheets/dsa-mastery-csharp/interview`} />
      </Helmet>

      <Navigation />

      <main className="flex h-screen w-full flex-col overflow-hidden pt-16 md:pt-20">
        <div className="border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                    <Link to="/cheatsheets/dsa-mastery-csharp/syllabus">DSA Mastery</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Interview Series</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="rounded-full border border-border/60 bg-card/80 px-3 py-1.5 font-semibold text-foreground">
                {DSA_QUESTION_BANK_STATS.total}+ questions
              </div>
              <div className="rounded-full border border-border/60 bg-card/80 px-3 py-1.5 font-semibold text-foreground">
                {DSA_QUESTION_BANK_STATS.moduleCount} modules
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/cheatsheets/dsa-mastery-csharp/syllabus">
                  Open Syllabus
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-background">
          <div className="grid h-full xl:grid-cols-[340px_minmax(0,1fr)_420px]">
            <aside className="min-h-0 overflow-auto border-b border-border/60 bg-card/60 xl:border-b-0 xl:border-r">
              <div className="space-y-5 p-4 md:p-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Interview Navigator</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">Questions</h1>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search questions, modules, tags"
                    className="pl-9"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                    <Filter className="h-3.5 w-3.5" />
                    Source
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => setActiveSource(source)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          activeSource === source
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/60 bg-background/80 text-foreground/80"
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          activeTag === tag
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/60 bg-background/80 text-foreground/80"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">Modules</div>
                  <div className="space-y-2">
                    {moduleOptions.map((module) => (
                      <button
                        key={module.name}
                        type="button"
                        onClick={() => setActiveModule(module.name)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          activeModule === module.name
                            ? "border-primary/35 bg-primary/10"
                            : "border-border/60 bg-background/80 hover:border-primary/20"
                        }`}
                      >
                        <span className="text-sm font-semibold text-foreground">{module.name === "all" ? "All Modules" : module.name}</span>
                        <span className="text-xs text-muted-foreground">{module.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredQuestions.length}</span> matching questions.
                </div>
              </div>
            </aside>

            <section ref={detailRef} className="min-h-0 overflow-auto border-b border-border/60 bg-background xl:border-b-0 xl:border-r">
              <div className="space-y-6 p-4 md:p-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Explanation Workspace</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{selectedQuestion.title}</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-border/60 bg-card/80">
                      {selectedQuestion.id}
                    </Badge>
                    <Badge variant="outline" className="border-border/60 bg-card/80">
                      {selectedQuestion.module}
                    </Badge>
                    <Badge variant="outline" className="border-border/60 bg-card/80">
                      {selectedQuestion.pattern}
                    </Badge>
                    <Badge variant="outline" className="border-border/60 bg-card/80">
                      {selectedQuestion.source}
                    </Badge>
                    <Badge variant="outline" className="border-border/60 bg-card/80">
                      {selectedQuestion.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-card/80 p-5">
                  <h3 className="text-lg font-black tracking-tight text-foreground">Question</h3>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">{selectedQuestion.prompt}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Scenario" body={selectedQuestion.scenario} />
                  <InfoCard title="Answer Summary" body={selectedQuestion.answerSummary} />
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-card/80 p-5">
                  <h3 className="text-lg font-black tracking-tight text-foreground">Explanation</h3>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">{selectedQuestion.explanation}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard title="Time Complexity" body={selectedQuestion.timeComplexity} />
                  <InfoCard title="Space Complexity" body={selectedQuestion.spaceComplexity} />
                  <InfoCard title="Complexity Reason" body={selectedQuestion.complexityReason} />
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-card/80 p-5">
                  <h3 className="text-lg font-black tracking-tight text-foreground">Step-by-Step Explanation</h3>
                  <div className="mt-5 space-y-3">
                    {selectedQuestion.steps.map((step, index) => (
                      <div key={step} className="rounded-[1.2rem] border border-border/60 bg-background/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">Step {index + 1}</div>
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-foreground/90">{step}</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                            style={{ width: `${(index + 1) * 20}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-card/80 p-5">
                  <h3 className="text-lg font-black tracking-tight text-foreground">Question Modules</h3>
                  <div className="mt-4 space-y-4">
                    {groupedQuestions.map(([module, questions]) => (
                      <div key={module} className="rounded-[1.2rem] border border-border/60 bg-background/80 p-4">
                        <div className="text-sm font-black tracking-tight text-foreground">{module}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{questions.length} questions</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {questions.slice(0, 8).map((question) => (
                            <button
                              key={question.id}
                              type="button"
                              onClick={() => openQuestion(question.id)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                selectedQuestion.id === question.id
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-border/60 bg-card/80 text-foreground/80"
                              }`}
                            >
                              {question.id}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside ref={codeRef} className="min-h-0 overflow-auto bg-card/60">
              <div className="space-y-6 p-4 md:p-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Code and Preview</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Implementation Panel</h2>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("csharp")}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      activeLanguage === "csharp"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/80 text-foreground/80"
                    }`}
                  >
                    C#
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("python")}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      activeLanguage === "python"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/80 text-foreground/80"
                    }`}
                  >
                    Python
                  </button>
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-background/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Code2 className="h-4 w-4 text-primary" />
                    {activeLanguage === "csharp" ? "C# Code" : "Python Code"}
                  </div>
                  <pre className="overflow-x-auto rounded-[1.2rem] bg-card/80 p-4 text-xs leading-6 text-foreground">
                    <code>{buildCodeSnippet(selectedQuestion, activeLanguage)}</code>
                  </pre>
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-background/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    Live Preview
                  </div>
                  <div className="space-y-3">
                    {buildPreviewSteps(selectedQuestion).map((item, index) => (
                      <div key={item.title} className="rounded-[1.2rem] border border-border/60 bg-card/80 p-4">
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">{item.title}</div>
                        <p className="mt-2 text-sm leading-7 text-foreground/90">{item.copy}</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                            style={{ width: `${(index + 1) * 25}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-border/60 bg-background/80 p-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary">Focus Notes</h3>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">
                    {activeLanguage === "csharp" ? selectedQuestion.csharpFocus : selectedQuestion.pythonFocus}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="flex-1">
                    <Link to={`/cheatsheets/dsa-mastery-csharp/practice?lang=${activeLanguage}`}>
                      Open Practice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/cheatsheets/dsa-mastery-csharp/syllabus">
                      Open Syllabus
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.6rem] border border-border/60 bg-card/80 p-5">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary">{title}</h3>
      <p className="mt-3 text-sm leading-8 text-muted-foreground">{body}</p>
    </div>
  );
}

function buildCodeSnippet(question: DsaQuestion, language: "csharp" | "python") {
  if (language === "csharp") {
    return `using System;\nusing System.Collections.Generic;\n\nvar input = new[] { 4, 2, 7, 2, 9 };\nConsole.WriteLine("${question.id}");\nConsole.WriteLine("${question.pattern}");\n\nvar trace = new List<string>();\nfor (int i = 0; i < input.Length; i++)\n{\n    trace.Add($"step {i + 1}: value={input[i]}");\n}\n\nConsole.WriteLine(string.Join(" | ", trace));\nConsole.WriteLine("Reason about ${question.timeComplexity} time and ${question.spaceComplexity} space.");`;
  }

  return `input_data = [4, 2, 7, 2, 9]\nprint("${question.id}")\nprint("${question.pattern}")\n\ntrace = []\nfor index, value in enumerate(input_data, start=1):\n    trace.append(f"step {index}: value={value}")\n\nprint(" | ".join(trace))\nprint("Reason about ${question.timeComplexity} time and ${question.spaceComplexity} space.")`;
}

function buildPreviewSteps(question: DsaQuestion) {
  return [
    { title: "Input", copy: `Start from the ${question.source} style prompt and identify the expected output clearly.` },
    { title: "Trace", copy: `Walk step by step through ${question.pattern.toLowerCase()} so the internal state changes stay visible.` },
    { title: "Optimize", copy: `Move from brute force to the selected approach and justify why the new structure reduces wasted work.` },
    { title: "Complexity", copy: `State ${question.timeComplexity} time and ${question.spaceComplexity} space, then defend that tradeoff in simple words.` },
  ];
}
