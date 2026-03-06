import { BookOpen, Briefcase, Code2, FileText, GraduationCap, Server, Target } from "lucide-react";
import { ResourceHubPage, type ResourceHubCard, type ResourceHubMetric } from "@/components/content/ResourceHubPage";

const metrics: ResourceHubMetric[] = [
  {
    label: "Interview Packs",
    value: "4",
    description: "Focused ebook packs for architect, .NET, microservices, and design-pattern interviews.",
    icon: BookOpen,
  },
  {
    label: "Course Track",
    value: "1",
    description: "A dedicated interview-preparation course route is already available in the course catalog.",
    icon: GraduationCap,
  },
  {
    label: "Focus",
    value: "Senior+",
    description: "Optimized for architect-level tradeoffs, backend depth, and production storytelling.",
    icon: Target,
  },
  {
    label: "Support",
    value: "1:1",
    description: "Pair self-study content with mentorship and mock-prep style guidance when needed.",
    icon: Briefcase,
  },
];

const cards: ResourceHubCard[] = [
  {
    title: "Interview Preparation Series (.NET / Architect)",
    description: "A structured course route for turning your .NET knowledge, architecture decisions, and delivery work into interview-grade answers.",
    to: "/courses/interview-prep-series",
    icon: GraduationCap,
    tags: ["Course", ".NET", "Architect"],
    eyebrow: "Interview Series",
    ctaLabel: "Open course",
  },
  {
    title: "Architect Interview Playbook",
    description: "System design drills, leadership-round frameworks, and the tradeoff language needed for architect interviews.",
    to: "/ebooks/architect-interview-playbook",
    icon: Briefcase,
    tags: ["Architect", "System Design", "Leadership"],
    eyebrow: "Interview Ebook",
    ctaLabel: "Open playbook",
  },
  {
    title: ".NET Interview Questions: Core",
    description: "A high-signal question bank covering foundational and practical .NET interview conversations.",
    to: "/ebooks/dotnet-interview-questions-core",
    icon: Code2,
    tags: [".NET", "Questions", "Core"],
    eyebrow: "Question Pack",
    ctaLabel: "Open ebook",
  },
  {
    title: "Microservices Interview Questions: Core",
    description: "Targeted distributed-systems and resiliency preparation for microservices-oriented interviews.",
    to: "/ebooks/microservices-interview-questions-core",
    icon: Server,
    tags: ["Microservices", "Distributed Systems", "Questions"],
    eyebrow: "Question Pack",
    ctaLabel: "Open ebook",
  },
  {
    title: "Design Patterns Interview Questions: Core",
    description: "Prepare for pattern selection, tradeoffs, and anti-pattern correction under interview pressure.",
    to: "/ebooks/design-patterns-interview-questions-core",
    icon: FileText,
    tags: ["Patterns", "OOP", "Questions"],
    eyebrow: "Question Pack",
    ctaLabel: "Open ebook",
  },
  {
    title: "Mentorship for Career and Interview Strategy",
    description: "Use direct mentorship when you want personalized review of answers, architecture narratives, and senior-level positioning.",
    to: "/mentorship",
    icon: Target,
    tags: ["Mentorship", "Mock Prep", "Career"],
    eyebrow: "1:1 Support",
    ctaLabel: "Book mentorship",
  },
];

export default function Interview() {
  return (
    <ResourceHubPage
      eyebrow="Interview"
      title="Interview Preparation, Packs, and Architect-Level Readiness"
      description="This section brings together the interview-focused material across your website: structured prep tracks, question packs, architect-level system-design preparation, and 1:1 support."
      primaryAction={{ label: "Open Interview Course", to: "/courses/interview-prep-series" }}
      secondaryAction={{ label: "Open Ebooks", to: "/ebooks" }}
      metrics={metrics}
      cards={cards}
      sectionTitle="Interview Resources Now in the Site"
      sectionDescription="These routes already exist in your current content system. The new Interview header menu gives them a direct top-level entry point instead of making users discover them indirectly."
    />
  );
}
