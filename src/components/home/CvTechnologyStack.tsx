import { motion } from "framer-motion";

const groups = [
  {
    title: "AI & Machine Learning",
    description: "Modeling, retrieval, and intelligent orchestration",
    technologies: [
      ["Python", "/brand-logos/stacks/python.svg"],
      ["PyTorch", "/brand-logos/stacks/pytorch.svg"],
      ["Scikit-learn", "/brand-logos/stacks/scikitlearn.svg"],
      ["LangGraph", "/brand-logos/stacks/langchain.svg"],
      ["Azure OpenAI", "/brand-logos/stacks/microsoftazure.svg"],
    ],
  },
  {
    title: "Cloud & Platform",
    description: "Multi-cloud foundations for production AI",
    technologies: [
      ["Microsoft Azure", "/brand-logos/stacks/microsoftazure.svg"],
      ["Google Cloud", "/brand-logos/stacks/gcp.svg"],
      ["Kubernetes", "/brand-logos/stacks/kubernetes.svg"],
      ["Docker", "/brand-logos/stacks/docker.svg"],
    ],
  },
  {
    title: "Enterprise Engineering",
    description: "Secure services, applications, and data systems",
    technologies: [
      ["C#", "/brand-logos/stacks/csharp.svg"],
      [".NET", "/brand-logos/stacks/dotnet.svg"],
      ["Angular", "/brand-logos/stacks/angular.svg"],
      ["Microsoft SQL Server", "/brand-logos/stacks/microsoftsqlserver.svg"],
      ["PostgreSQL", "/brand-logos/stacks/postgresql.svg"],
    ],
  },
  {
    title: "Delivery & Operations",
    description: "Repeatable engineering from commit to production",
    technologies: [
      ["GitHub", "/brand-logos/stacks/github.svg"],
      ["GitHub Actions", "/brand-logos/stacks/github-actions.svg"],
      ["Docker", "/brand-logos/stacks/docker.svg"],
      ["Kubernetes", "/brand-logos/stacks/kubernetes.svg"],
    ],
  },
] as const;

export function CvTechnologyStack() {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-20 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white md:px-8 md:py-28 xl:px-12">
      <div className="mx-auto max-w-[1380px]">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">Technical stack</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl">The systems behind the outcomes.</h2>
          <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">A focused view of the technologies used throughout the career timeline, organized exactly by the work they enable.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {groups.map((group, index) => (
            <motion.article
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/70"
            >
              <h3 className="text-xl font-black tracking-tight">{group.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{group.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {group.technologies.map(([name, icon]) => (
                  <div key={name} className="group/logo flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-950" title={name}>
                    <img src={icon} alt={name} className="h-full w-full object-contain transition-transform duration-300 group-hover/logo:scale-110" loading="lazy" />
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
