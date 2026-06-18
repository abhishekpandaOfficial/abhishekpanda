export type StackcraftTrack = {
  title: string;
  tags: string[];
  rgb: string;
  logos: string[];
  href: string;
};

const stackcraftBaseUrl = "https://stackcraft.io";

const rawTracks: Omit<StackcraftTrack, "href">[] = [
  {
    title: ".NET Architect (From Fundamentals to Architect)",
    tags: [".NET", "Architecture", "C#"],
    rgb: "99 102 241",
    logos: ["/brand-logos/stacks/dotnet.svg", "/brand-logos/stacks/csharp.svg"],
  },
  {
    title: "Azure Mastery (Fundamentals to Architect)",
    tags: ["Azure", "Cloud", "DevOps"],
    rgb: "59 130 246",
    logos: ["/brand-logos/stacks/microsoftazure.svg", "/brand-logos/stacks/docker.svg"],
  },
  {
    title: "SQL (Zero to Mastery)",
    tags: ["SQL", "Databases"],
    rgb: "14 165 233",
    logos: ["/brand-logos/stacks/microsoftsqlserver.svg"],
  },
  {
    title: "AI/ML Fundamentals Series",
    tags: ["AI/ML", "Foundations"],
    rgb: "16 185 129",
    logos: ["/brand-logos/stacks/tensorflow.svg", "/brand-logos/stacks/pytorch.svg"],
  },
  {
    title: "Deep Learning Mastery",
    tags: ["Deep Learning", "Neural Nets"],
    rgb: "124 58 237",
    logos: ["/brand-logos/stacks/pytorch.svg", "/brand-logos/stacks/tensorflow.svg"],
  },
  {
    title: "NLP (Basic to Agentic AI)",
    tags: ["NLP", "LLMs"],
    rgb: "217 70 239",
    logos: ["/brand-logos/stacks/huggingface.svg"],
  },
  {
    title: "Agentization: Agentic, RAG, AGI, Terminologies",
    tags: ["Agentic AI", "RAG", "LLMs"],
    rgb: "250 204 21",
    logos: ["/brand-logos/stacks/langchain.svg", "/brand-logos/stacks/huggingface.svg"],
  },
  {
    title: "WEB3 Series",
    tags: ["Web3", "Protocols"],
    rgb: "96 165 250",
    logos: ["/brand-logos/stacks/ethereum.svg"],
  },
  {
    title: "Block Chain (Fundamentals to Architect)",
    tags: ["Blockchain", "Architecture"],
    rgb: "148 163 184",
    logos: ["/brand-logos/stacks/bitcoin.svg", "/brand-logos/stacks/ethereum.svg"],
  },
];

export const stackcraftTracks: StackcraftTrack[] = rawTracks.map((track) => ({
  ...track,
  href: `${stackcraftBaseUrl}?utm_source=abhishekpanda.com&utm_medium=landing&utm_campaign=tracks&utm_content=${encodeURIComponent(
    track.title
  )}`,
}));

export const stackcraftProfileUrl = "https://stackcraft.io/abhishekpanda";
