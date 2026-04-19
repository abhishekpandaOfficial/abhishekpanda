import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  Github,
  Globe,
  Info,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StackIcon = {
  name: string;
  logo: string;
};

type ProjectArchitecture = {
  client: string;
  edge: string;
  services: string;
  data: string;
};

type PortfolioProject = {
  name: string;
  website: string;
  github: string;
  summary: string;
  stacks: StackIcon[];
  architecture: ProjectArchitecture;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const STACK = {
  react: { name: "React", logo: "/brand-logos/stacks/react.svg" },
  typescript: { name: "TypeScript", logo: "/brand-logos/stacks/typescript.svg" },
  nextjs: { name: "Next.js", logo: "/brand-logos/stacks/nextjs.svg" },
  python: { name: "Python", logo: "/brand-logos/stacks/python.svg" },
  docker: { name: "Docker", logo: "/brand-logos/stacks/docker.svg" },
  kubernetes: { name: "Kubernetes", logo: "/brand-logos/stacks/kubernetes.svg" },
  aws: { name: "AWS", logo: "/brand-logos/stacks/aws.svg" },
  azure: { name: "Azure", logo: "/brand-logos/stacks/microsoftazure.svg" },
  postgresql: { name: "PostgreSQL", logo: "/brand-logos/stacks/postgresql.svg" },
  mongodb: { name: "MongoDB", logo: "/brand-logos/stacks/mongodb.svg" },
  openai: { name: "OpenAI", logo: "/brand-logos/stacks/openai.svg" },
} as const;

const ORDERED_PROJECTS: PortfolioProject[] = [
  {
    name: "CHRONYX",
    website: "https://www.getchronyx.com/",
    github: "https://github.com/PandaCastle/Chronyx",
    summary:
      "A focused personal operating system for planning, notes, routines, and life-level execution in one calm workspace.",
    stacks: [STACK.react, STACK.typescript, STACK.postgresql, STACK.azure, STACK.openai],
    architecture: {
      client: "Web App",
      edge: "Auth + Gateway",
      services: "Planner / Notes / AI Services",
      data: "PostgreSQL + Vectors",
    },
  },
  {
    name: "StackCraft",
    website: "https://www.stackcraft.io/",
    github: "https://github.com/originxlabs/stackcraft",
    summary:
      "A stack-first engineering platform to help teams move from architecture decisions to real implementation faster.",
    stacks: [STACK.nextjs, STACK.typescript, STACK.docker, STACK.kubernetes, STACK.aws],
    architecture: {
      client: "Platform UI",
      edge: "API Gateway",
      services: "Stack Intelligence Engine",
      data: "PostgreSQL + Caching",
    },
  },
  {
    name: "LLM Galaxy",
    website: "https://www.abhishekpanda.com/llm-galaxy",
    github: "",
    summary:
      "A model-intelligence hub for comparing open and closed-source AI models, capability layers, and practical routing decisions.",
    stacks: [STACK.react, STACK.typescript, STACK.openai, STACK.python, STACK.aws],
    architecture: {
      client: "Galaxy UI",
      edge: "Routing + API Layer",
      services: "Model Intelligence Services",
      data: "Model Registry + Benchmarks",
    },
  },
  {
    name: "NEWSTACK",
    website: "https://www.newstack.live/",
    github: "https://github.com/originxlabs/NEWSTACK",
    summary:
      "A modern product and updates surface designed for fast discovery, curated launches, and ecosystem visibility.",
    stacks: [STACK.react, STACK.typescript, STACK.mongodb, STACK.docker, STACK.aws],
    architecture: {
      client: "Landing + Dashboard",
      edge: "CDN + Routing",
      services: "Content + Feed APIs",
      data: "MongoDB + Media",
    },
  },
  {
    name: "FINIORAA",
    website: "https://www.finioraa.com/",
    github: "https://github.com/OriginXLabs-Org/FINIORAA",
    summary:
      "A fintech product concept for cleaner money operations, financial awareness, and smart workflow automation.",
    stacks: [STACK.nextjs, STACK.typescript, STACK.postgresql, STACK.azure, STACK.docker],
    architecture: {
      client: "Finance Workspace",
      edge: "Secure API Edge",
      services: "Ledger + Insights Services",
      data: "PostgreSQL + Audit Store",
    },
  },
  {
    name: "BackFire",
    website: "https://www.abhishekpanda.com/backfire-docs.html",
    github: "",
    summary:
      "A distributed background job runtime concept for reliable retries, scheduling, worker orchestration, and operational visibility.",
    stacks: [STACK.typescript, STACK.docker, STACK.kubernetes, STACK.postgresql, STACK.azure],
    architecture: {
      client: "Operations UI",
      edge: "Queue API",
      services: "Scheduler + Workers",
      data: "Job Store + Metrics",
    },
  },
  {
    name: "Groovify",
    website: "https://groovify-omega.vercel.app/",
    github: "https://github.com/abhishekpandaOfficial/Groovify",
    summary:
      "A music-first product concept for curated discovery, private listening flows, and expressive audio experiences.",
    stacks: [STACK.react, STACK.typescript, STACK.mongodb, STACK.aws, STACK.docker],
    architecture: {
      client: "Music App",
      edge: "Media Gateway",
      services: "Catalog + Recommendation",
      data: "User Library + Sessions",
    },
  },
  {
    name: "Scribe",
    website: "https://scribe-rosy-eight.vercel.app/",
    github: "https://github.com/abhishekpandaOfficial/scribe",
    summary:
      "A writing and documentation workspace built for clean drafting, editing flow, and fast publishing.",
    stacks: [STACK.nextjs, STACK.typescript, STACK.mongodb, STACK.openai, STACK.docker],
    architecture: {
      client: "Writer UI",
      edge: "Auth + API",
      services: "Drafting + Publish Services",
      data: "Documents + Metadata",
    },
  },
  {
    name: "Proxinex",
    website: "https://www.proxinex.com/",
    github: "https://github.com/originxlabs/PROXINEX",
    summary:
      "A proxy and networking-focused engineering platform built for reliability, control, and distributed routing workflows.",
    stacks: [STACK.react, STACK.typescript, STACK.docker, STACK.kubernetes, STACK.aws],
    architecture: {
      client: "Control Console",
      edge: "Traffic Ingress",
      services: "Routing + Policy Engine",
      data: "Metrics + Config Store",
    },
  },
  {
    name: "QUALYX",
    website: "http://getqualyx.com/",
    github: "https://github.com/OriginXLabs-Org/QUALYX",
    summary:
      "A quality and delivery governance platform for teams that want measurable engineering confidence and release clarity.",
    stacks: [STACK.react, STACK.typescript, STACK.postgresql, STACK.azure, STACK.openai],
    architecture: {
      client: "Quality Dashboard",
      edge: "Workflow API",
      services: "Quality Rules + Reporting",
      data: "PostgreSQL + Event Logs",
    },
  },
  {
    name: "Cognix",
    website: "https://cognix-drab.vercel.app/",
    github: "https://github.com/PandaCastle/cognix",
    summary:
      "An intelligence-first experience for contextual thinking, decision support, and practical AI-native workflows.",
    stacks: [STACK.nextjs, STACK.typescript, STACK.openai, STACK.postgresql, STACK.docker],
    architecture: {
      client: "Insight UI",
      edge: "Prompt + API Layer",
      services: "Reasoning + Workflow Services",
      data: "PostgreSQL + Memory",
    },
  },
  {
    name: "OriginXOne",
    website: "https://www.originxcloud.com/",
    github: "",
    summary:
      "A cloud operating layer concept for orchestrating platforms, products, and operational workflows from one unified surface.",
    stacks: [STACK.react, STACK.typescript, STACK.azure, STACK.kubernetes, STACK.postgresql],
    architecture: {
      client: "Control Surface",
      edge: "Cloud Gateway",
      services: "Platform Orchestration",
      data: "State + Telemetry",
    },
  },
  {
    name: "OpenOwl",
    website: "https://openowl.in/",
    github: "https://github.com/abhishekpandaOfficial/openowl",
    summary:
      "An AI-first assistant platform focused on intelligent workflows, context-aware guidance, and productized conversational experiences.",
    stacks: [STACK.nextjs, STACK.typescript, STACK.openai, STACK.postgresql, STACK.docker],
    architecture: {
      client: "Assistant UI",
      edge: "Inference + API Gateway",
      services: "Agent + Workflow Services",
      data: "Sessions + Knowledge Store",
    },
  },
];

const hasRequiredLinks = (project: PortfolioProject) =>
  Boolean(project.website?.trim()) && Boolean(project.github?.trim());

function ArchitectureMiniDiagram({ architecture }: { architecture: ProjectArchitecture }) {
  const nodes = [
    architecture.client,
    architecture.edge,
    architecture.services,
    architecture.data,
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3 md:p-4">
      <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
        <Layers3 className="h-3.5 w-3.5" />
        Architecture Diagram
      </div>
      <div className="grid gap-2 md:grid-cols-[repeat(4,minmax(0,1fr))] md:items-center">
        {nodes.map((node, index) => (
          <div key={node} className="flex items-center gap-2">
            <div className="w-full rounded-xl border border-border/70 bg-card/90 px-3 py-2 text-center text-xs font-semibold text-foreground">
              {node}
            </div>
            {index < nodes.length - 1 ? <ArrowUpRight className="hidden h-4 w-4 text-primary md:block" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const projects = useMemo(() => ORDERED_PROJECTS.filter(hasRequiredLinks), []);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Projects | Abhishek Panda</title>
        <meta
          name="description"
          content="Curated project portfolio with ordered cards, GitHub and website links, fork actions, stack iconography, and architecture popups."
        />
        <link rel="canonical" href={`${SITE_URL}/projects`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(150deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(150deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Projects
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Product Portfolio Cards with Live GitHub + Web Links
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Click any card to open a full project popup with project overview, tech stack iconography, architecture view, website, GitHub, and direct fork action.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <button
                key={project.name}
                type="button"
                onClick={() => setSelectedProject(project)}
                className="group h-full rounded-[1.65rem] border border-border/70 bg-card/85 p-5 text-left font-sans shadow-[0_20px_45px_-36px_rgba(15,23,42,0.58)] transition hover:-translate-y-1 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Live
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">{project.name}</h2>
                <div className="mt-3 grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Project Name
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    About
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{project.summary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    UI Ready
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/45 bg-amber-500/12 px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    <Clock3 className="h-3.5 w-3.5" />
                    Backend In Progress
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stacks.slice(0, 4).map((stack) => (
                    <span
                      key={`${project.name}-${stack.name}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/90"
                    >
                      <img src={stack.logo} alt={stack.name} className="h-4 w-4 object-contain" loading="lazy" />
                      {stack.name}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-primary">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => (!open ? setSelectedProject(null) : null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-border/70 bg-background/98 p-0">
          {selectedProject ? (
            <div className="p-5 md:p-7">
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <DialogTitle className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                    {selectedProject.name}
                  </DialogTitle>
                  <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                    Project Overview
                  </span>
                </div>
                <DialogDescription className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {selectedProject.summary}
                </DialogDescription>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
                  <Eye className="h-3.5 w-3.5" />
                  Preview Details
                </div>
              </DialogHeader>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <a
                  href={selectedProject.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Website
                </a>
                <a
                  href={selectedProject.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  Open GitHub
                </a>
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm font-semibold text-muted-foreground">
                  <Info className="h-4 w-4" />
                  About Project
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  UI Ready
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/45 bg-amber-500/12 px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  Backend In Progress
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-border/70 bg-card/75 p-4 md:p-5">
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tech Stack Iconography
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {selectedProject.stacks.map((stack) => (
                    <span
                      key={`${selectedProject.name}-${stack.name}-popup`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      <img src={stack.logo} alt={stack.name} className="h-4 w-4 object-contain" loading="lazy" />
                      {stack.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <ArchitectureMiniDiagram architecture={selectedProject.architecture} />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
