import type { ComponentType } from "react";
import { Circle, Cloud, Network } from "lucide-react";
import {
  SiApachekafka,
  SiDocker,
  SiDotnet,
  SiElasticsearch,
  SiGithubactions,
  SiGrafana,
  SiGraphql,
  SiKubernetes,
  SiPostgresql,
  SiPrometheus,
  SiRedis,
  SiSharp,
} from "react-icons/si";

type TechIconProps = {
  tech: string;
  className?: string;
};

type IconMapEntry = { icon: ComponentType<{ className?: string }>; color: string };

const map: Record<string, IconMapEntry> = {
  ".NET": { icon: SiDotnet, color: "text-violet-500" },
  "C#": { icon: SiSharp, color: "text-emerald-500" },
  Azure: { icon: Cloud, color: "text-sky-500" },
  Kubernetes: { icon: SiKubernetes, color: "text-sky-600" },
  Docker: { icon: SiDocker, color: "text-blue-500" },
  Kafka: { icon: SiApachekafka, color: "text-foreground" },
  PostgreSQL: { icon: SiPostgresql, color: "text-indigo-500" },
  Redis: { icon: SiRedis, color: "text-red-500" },
  gRPC: { icon: Network, color: "text-cyan-500" },
  GraphQL: { icon: SiGraphql, color: "text-pink-500" },
  Prometheus: { icon: SiPrometheus, color: "text-orange-500" },
  Grafana: { icon: SiGrafana, color: "text-amber-500" },
  Elasticsearch: { icon: SiElasticsearch, color: "text-yellow-500" },
  "GitHub Actions": { icon: SiGithubactions, color: "text-blue-600" },
};

export function TechIcon({ tech, className }: TechIconProps) {
  const entry = map[tech];
  if (!entry) {
    return <Circle className={`text-muted-foreground/60 ${className || "h-3.5 w-3.5"}`} />;
  }

  const Icon = entry.icon;
  return <Icon className={`${entry.color} ${className || "h-4 w-4"}`} />;
}
