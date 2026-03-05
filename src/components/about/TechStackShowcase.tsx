import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CategoryId = "all" | "backend" | "frontend" | "cloud" | "devops" | "database" | "aiml" | "observability";

type TechLogo = {
  id: string;
  name: string;
  src: string;
  categories: Exclude<CategoryId, "all">[];
  imgClassName?: string;
};

const categories: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "backend", label: "Backend" },
  { id: "frontend", label: "Frontend" },
  { id: "cloud", label: "Cloud" },
  { id: "devops", label: "DevOps" },
  { id: "database", label: "Database" },
  { id: "aiml", label: "AI / ML" },
  { id: "observability", label: "Monitoring" },
];

const techLogos: TechLogo[] = [
  { id: "csharp", name: "C#", src: "/brand-logos/stacks/csharp.svg", categories: ["backend"] },
  { id: "dotnet", name: ".NET", src: "/brand-logos/stacks/dotnet.svg", categories: ["backend"] },
  { id: "python", name: "Python", src: "/brand-logos/stacks/python.svg", categories: ["backend", "aiml"] },
  { id: "javascript", name: "JavaScript", src: "/brand-logos/stacks/javascript.svg", categories: ["backend", "frontend"] },
  { id: "typescript", name: "TypeScript", src: "/brand-logos/stacks/typescript.svg", categories: ["backend", "frontend"] },
  { id: "react", name: "React", src: "/brand-logos/stacks/react.svg", categories: ["frontend"] },
  { id: "angular", name: "Angular", src: "/brand-logos/stacks/angular.svg", categories: ["frontend"] },
  { id: "vue", name: "Vue", src: "/brand-logos/stacks/vue.svg", categories: ["frontend"] },
  { id: "nextjs", name: "Next.js", src: "/brand-logos/stacks/nextjs.svg", categories: ["frontend"] },
  {
    id: "aws",
    name: "AWS",
    src: "/brand-logos/stacks/aws.svg",
    categories: ["cloud"],
    imgClassName: "h-5 w-10 object-contain sm:h-6 sm:w-11",
  },
  { id: "azure", name: "Azure", src: "/brand-logos/stacks/microsoftazure.svg", categories: ["cloud"] },
  { id: "gcp", name: "Google Cloud", src: "/brand-logos/stacks/gcp.svg", categories: ["cloud"] },
  { id: "docker", name: "Docker", src: "/brand-logos/stacks/docker.svg", categories: ["cloud", "devops"] },
  { id: "kubernetes", name: "Kubernetes", src: "/brand-logos/stacks/kubernetes.svg", categories: ["cloud", "devops"] },
  { id: "terraform", name: "Terraform", src: "/brand-logos/stacks/terraform.svg", categories: ["cloud", "devops"] },
  { id: "jenkins", name: "Jenkins", src: "/brand-logos/stacks/jenkins.svg", categories: ["devops"] },
  { id: "git", name: "Git", src: "/brand-logos/stacks/git.svg", categories: ["devops"] },
  { id: "github", name: "GitHub", src: "/brand-logos/stacks/github.svg", categories: ["devops"] },
  { id: "postgresql", name: "PostgreSQL", src: "/brand-logos/stacks/postgresql.svg", categories: ["database"] },
  { id: "mongodb", name: "MongoDB", src: "/brand-logos/stacks/mongodb.svg", categories: ["database"] },
  { id: "redis", name: "Redis", src: "/brand-logos/stacks/redis.svg", categories: ["database"] },
  { id: "tensorflow", name: "TensorFlow", src: "/brand-logos/stacks/tensorflow.svg", categories: ["aiml"] },
  { id: "pytorch", name: "PyTorch", src: "/brand-logos/stacks/pytorch.svg", categories: ["aiml"] },
  {
    id: "openai",
    name: "OpenAI",
    src: "/llm-logos/openai.png",
    categories: ["aiml"],
    imgClassName: "h-7 w-7 object-contain sm:h-8 sm:w-8",
  },
  { id: "huggingface", name: "Hugging Face", src: "/brand-logos/stacks/huggingface.svg", categories: ["aiml"] },
  { id: "langchain", name: "LangChain", src: "/brand-logos/stacks/langchain.svg", categories: ["aiml"] },
  { id: "scikitlearn", name: "Scikit-learn", src: "/brand-logos/stacks/scikitlearn.svg", categories: ["aiml"] },
  { id: "grafana", name: "Grafana", src: "/brand-logos/stacks/grafana.svg", categories: ["observability"] },
  { id: "prometheus", name: "Prometheus", src: "/brand-logos/stacks/prometheus.svg", categories: ["observability"] },
  { id: "datadog", name: "Datadog", src: "/brand-logos/stacks/datadog.svg", categories: ["observability"] },
];

function TechLogoCard({ tech, isDimmed }: { tech: TechLogo; isDimmed: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDimmed ? 0.45 : 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group flex w-[66px] shrink-0 flex-col items-center justify-start px-1 py-1 text-center sm:w-[72px] md:w-[78px]",
        "transition-all duration-300",
      )}
      aria-label={`${tech.name} technology`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/85 sm:h-9 sm:w-9 md:h-10 md:w-10">
        <img
          src={tech.src}
          alt={`${tech.name} logo`}
          loading="lazy"
          className={cn(
            "h-6 w-6 object-contain drop-shadow-[0_2px_6px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7",
            tech.imgClassName,
          )}
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = "none";
          }}
        />
      </div>
      <p className="mt-1 line-clamp-1 text-[9px] font-medium text-foreground/90 sm:text-[10px]">{tech.name}</p>
    </motion.article>
  );
}

function InfiniteScrollRow({
  items,
  direction,
  speed,
  activeCategory,
}: {
  items: TechLogo[];
  direction: "left" | "right";
  speed: number;
  activeCategory: CategoryId;
}) {
  const [paused, setPaused] = useState(false);
  const looped = [...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-1.5 sm:py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-background via-background/90 to-transparent sm:w-12 md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-background via-background/90 to-transparent sm:w-12 md:w-20" />

      <motion.div
        className="flex gap-2 sm:gap-3 md:gap-4"
        animate={{ x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"] }}
        transition={{ x: { duration: speed, ease: "linear", repeat: Infinity } }}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {looped.map((tech, idx) => {
          const isDimmed = activeCategory !== "all" && !tech.categories.includes(activeCategory as Exclude<CategoryId, "all">);
          return <TechLogoCard key={`${tech.id}-${idx}`} tech={tech} isDimmed={isDimmed} />;
        })}
      </motion.div>
    </div>
  );
}

export function TechStackShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const visibleTechs = useMemo(() => {
    if (activeCategory === "all") return techLogos;
    return techLogos.filter((tech) => tech.categories.includes(activeCategory as Exclude<CategoryId, "all">));
  }, [activeCategory]);

  const [rowA, rowB] = useMemo(() => {
    const first = visibleTechs.filter((_, idx) => idx % 2 === 0);
    const second = visibleTechs.filter((_, idx) => idx % 2 === 1);
    return [first.length ? first : visibleTechs, second.length ? second : visibleTechs];
  }, [visibleTechs]);

  return (
    <section className="overflow-hidden bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center"
        >
          <h2 className="mb-2 text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
            Technical <span className="gradient-text">Expertise</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 md:text-sm",
                  activeCategory === category.id
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-1">
          <InfiniteScrollRow items={rowA} direction="left" speed={30} activeCategory={activeCategory} />
          <InfiniteScrollRow items={rowB} direction="right" speed={34} activeCategory={activeCategory} />
        </div>
      </div>
    </section>
  );
}
