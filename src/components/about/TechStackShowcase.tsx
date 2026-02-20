import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  SiAmazonwebservices,
  SiAngular,
  SiApachekafka,
  SiDatadog,
  SiDocker,
  SiDotnet,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGooglecloud,
  SiGrafana,
  SiHuggingface,
  SiJenkins,
  SiKubernetes,
  SiLangchain,
  SiMongodb,
  SiNextdotjs,
  SiOpenai,
  SiPostgresql,
  SiPrometheus,
  SiPython,
  SiPytorch,
  SiReact,
  SiRedis,
  SiSharp,
  SiTensorflow,
  SiTerraform,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";

type Category =
  | "backend"
  | "frontend"
  | "cloud"
  | "devops"
  | "database"
  | "aiml"
  | "observability";

type Tier = "primary" | "secondary";

interface TechItem {
  name: string;
  icon?: IconType;
  logoPath?: string;
  color: string;
  tier: Tier;
  categories: Category[];
}

const categories: Array<{ id: "all" | Category; label: string }> = [
  { id: "all", label: "All" },
  { id: "backend", label: "Backend" },
  { id: "frontend", label: "Frontend" },
  { id: "cloud", label: "Cloud" },
  { id: "devops", label: "DevOps" },
  { id: "database", label: "Database" },
  { id: "aiml", label: "AI/ML" },
  { id: "observability", label: "Monitoring" },
];

const techStack: TechItem[] = [
  { name: ".NET", icon: SiDotnet, color: "#512BD4", tier: "primary", categories: ["backend"] },
  { name: "C#", icon: SiSharp, color: "#239120", tier: "primary", categories: ["backend"] },
  { name: "Azure", logoPath: "/brand-logos/stacks/microsoftazure.svg", color: "#0078D4", tier: "primary", categories: ["cloud"] },
  { name: "AWS", icon: SiAmazonwebservices, color: "#FF9900", tier: "primary", categories: ["cloud"] },
  { name: "Kubernetes", icon: SiKubernetes, color: "#326CE5", tier: "primary", categories: ["cloud", "devops"] },
  { name: "Docker", icon: SiDocker, color: "#2496ED", tier: "primary", categories: ["cloud", "devops"] },
  { name: "Terraform", icon: SiTerraform, color: "#7B42BC", tier: "primary", categories: ["cloud", "devops"] },
  { name: "Angular", icon: SiAngular, color: "#DD0031", tier: "primary", categories: ["frontend"] },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", tier: "primary", categories: ["frontend", "backend"] },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", tier: "primary", categories: ["database"] },
  { name: "SQL Server", logoPath: "/brand-logos/stacks/microsoftsqlserver.svg", color: "#CC2927", tier: "primary", categories: ["database"] },
  { name: "Redis", icon: SiRedis, color: "#DC382D", tier: "primary", categories: ["database"] },
  { name: "Apache Kafka", icon: SiApachekafka, color: "#231F20", tier: "primary", categories: ["backend", "devops"] },
  { name: "Python", icon: SiPython, color: "#3776AB", tier: "primary", categories: ["backend", "aiml"] },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00", tier: "primary", categories: ["aiml"] },
  { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C", tier: "primary", categories: ["aiml"] },
  { name: "GitHub Actions", icon: SiGithubactions, color: "#2088FF", tier: "primary", categories: ["devops"] },
  { name: "Jenkins", icon: SiJenkins, color: "#D24939", tier: "primary", categories: ["devops"] },

  { name: "React", icon: SiReact, color: "#61DAFB", tier: "secondary", categories: ["frontend"] },
  { name: "Next.js", icon: SiNextdotjs, color: "#000000", tier: "secondary", categories: ["frontend"] },
  { name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D", tier: "secondary", categories: ["frontend"] },
  { name: "GCP", icon: SiGooglecloud, color: "#4285F4", tier: "secondary", categories: ["cloud"] },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248", tier: "secondary", categories: ["database"] },
  { name: "Grafana", icon: SiGrafana, color: "#F46800", tier: "secondary", categories: ["observability"] },
  { name: "Prometheus", icon: SiPrometheus, color: "#E6522C", tier: "secondary", categories: ["observability"] },
  { name: "Datadog", icon: SiDatadog, color: "#632CA6", tier: "secondary", categories: ["observability"] },
  { name: "OpenAI", icon: SiOpenai, color: "#412991", tier: "secondary", categories: ["aiml"] },
  { name: "Hugging Face", icon: SiHuggingface, color: "#FF9D00", tier: "secondary", categories: ["aiml"] },
  { name: "LangChain", icon: SiLangchain, color: "#1C3C3C", tier: "secondary", categories: ["aiml"] },
  { name: "Git", icon: SiGit, color: "#F05032", tier: "secondary", categories: ["devops"] },
  { name: "GitHub", icon: SiGithub, color: "#181717", tier: "secondary", categories: ["devops"] },
];

const Tile = ({ item }: { item: TechItem }) => {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm"
      style={{ boxShadow: `0 10px 30px ${item.color}1A` }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(135deg, ${item.color}1F, transparent 55%)` }} />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}1A` }}>
          {Icon ? (
            <Icon size={22} color={item.color} aria-hidden="true" />
          ) : (
            <img src={item.logoPath} alt={`${item.name} logo`} className="h-6 w-6 object-contain" loading="lazy" />
          )}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {item.name}
        </span>
      </div>
    </motion.div>
  );
};

export const TechStackShowcase = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return techStack;
    return techStack.filter((item) => item.categories.includes(activeCategory));
  }, [activeCategory]);

  const primary = filtered.filter((item) => item.tier === "primary");
  const secondary = filtered.filter((item) => item.tier === "secondary");

  return (
    <section className="overflow-hidden bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="mb-2 text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
            Technical <span className="gradient-text">Expertise</span>
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm text-muted-foreground">
            Official brand icons. Primary stack reflects technologies used across CV projects and architecture roles; secondary stack covers the wider ecosystem.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border border-border/50 bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">Primary (From CV)</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {primary.map((item) => (
                <Tile key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Secondary (Extended Stack)</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {secondary.map((item) => (
                <Tile key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
