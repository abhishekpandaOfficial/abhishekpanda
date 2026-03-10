import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Brain, Bot, ChartScatter, Cpu, Gamepad2, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";

const learningPaths = [
  {
    id: "supervised",
    title: "Supervised Learning",
    icon: Target,
    color: "from-sky-500/20 via-cyan-500/15 to-emerald-500/10",
    border: "border-sky-500/25",
    summary: "Learn from labeled data to predict outcomes such as classes, values, risk, or demand.",
    whatItIs:
      "Supervised learning uses input-output examples. The model sees features and the correct answer, then learns a mapping it can generalize to unseen data.",
    whenToUse: [
      "You already have historical labels such as spam/not spam, price, churn, fraud, or conversion.",
      "The business question is predictive: what class, score, probability, or numeric value should we output?",
      "You need measurable evaluation with train/validation/test splits and explicit metrics.",
    ],
    topics: [
      "Regression",
      "Classification",
      "Model evaluation",
      "Train / validation / test split",
      "Cross-validation",
      "Bias and variance",
      "Feature importance",
      "Regularization",
    ],
    examples: [
      "House price prediction",
      "Customer churn prediction",
      "Fraud detection",
      "Lead scoring",
    ],
  },
  {
    id: "unsupervised",
    title: "Unsupervised Learning",
    icon: ChartScatter,
    color: "from-fuchsia-500/20 via-violet-500/15 to-indigo-500/10",
    border: "border-fuchsia-500/25",
    summary: "Discover hidden structure when there is no ground-truth label attached to every record.",
    whatItIs:
      "Unsupervised learning works on unlabeled data. The model tries to group, compress, or organize data so patterns become visible to humans or downstream systems.",
    whenToUse: [
      "You do not have labels, but you still want structure, segments, or representations.",
      "You want to reduce dimensionality before modeling or visualization.",
      "You need anomaly discovery, grouping, or exploratory pattern analysis.",
    ],
    topics: [
      "Clustering",
      "Dimensionality reduction",
      "Embeddings",
      "Anomaly detection",
      "Association rules",
      "Distance metrics",
      "Feature scaling for clustering",
      "Cluster validation",
    ],
    examples: [
      "Customer segmentation",
      "Topic grouping",
      "Anomaly discovery in logs",
      "Feature compression for visualization",
    ],
  },
  {
    id: "reinforcement",
    title: "Reinforcement Learning",
    icon: Gamepad2,
    color: "from-amber-500/20 via-orange-500/15 to-rose-500/10",
    border: "border-amber-500/25",
    summary: "Learn by interacting with an environment, taking actions, and improving through reward signals.",
    whatItIs:
      "Reinforcement learning is about sequential decision making. An agent observes state, takes action, receives reward, and improves a policy over time.",
    whenToUse: [
      "The problem is not a one-shot prediction but a sequence of decisions over time.",
      "The quality of one decision changes the future state of the system.",
      "You can define rewards, actions, and environment feedback clearly enough to train or simulate.",
    ],
    topics: [
      "Agent, state, action, reward",
      "Policies and value functions",
      "Exploration vs exploitation",
      "Markov decision processes",
      "Q-learning basics",
      "Policy gradients overview",
      "Offline vs online RL",
      "Simulation-driven training",
    ],
    examples: [
      "Game playing agents",
      "Robotics control",
      "Ad bidding policies",
      "Resource allocation strategies",
    ],
  },
];

export default function MachineLearningCoreMastery() {
  const [activePath, setActivePath] = useState(learningPaths[0]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Machine Learning Core Mastery | AI / ML Blogs | Abhishek Panda</title>
        <meta
          name="description"
          content="Machine Learning Core Mastery split into supervised, unsupervised, and reinforcement learning paths."
        />
        <link rel="canonical" href={`${SITE_URL}/ai-ml-blogs/machine-learning-core-mastery`} />
      </Helmet>

      <Navigation />

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <Link
            to="/ai-ml-blogs"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI / ML Blogs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Brain className="h-4 w-4" />
                  Machine Learning Core
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
                  Machine Learning Core Mastery
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  This mastery is intentionally split into three branches first: supervised learning, unsupervised learning,
                  and reinforcement learning. Each card opens a focused topic map so the learning path stays clean.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Machine Learning", "Supervised", "Unsupervised", "Reinforcement"].map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground/80">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {learningPaths.map((path) => {
                    const Icon = path.icon;
                    const isActive = activePath.id === path.id;

                    return (
                      <button
                        key={path.id}
                        type="button"
                        onClick={() => setActivePath(path)}
                        className={`group rounded-[1.5rem] border bg-gradient-to-br p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                          isActive ? `${path.border} ring-1 ring-primary/30 ${path.color}` : "border-border/60 from-card to-card/80 hover:border-primary/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-background/85">
                            <Icon className="h-5 w-5 text-primary" />
                          </span>
                          <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "translate-x-1 text-primary" : "text-muted-foreground group-hover:translate-x-1"}`} />
                        </div>
                        <h2 className="mt-4 text-xl font-black tracking-tight text-foreground">{path.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{path.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/30 p-8 md:p-10 xl:border-l xl:border-t-0">
                <div className="rounded-[1.75rem] border border-border/60 bg-background/90 p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                      <Cpu className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Selected Path</p>
                      <h2 className="text-2xl font-black tracking-tight text-foreground">{activePath.title}</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-8 text-muted-foreground">{activePath.whatItIs}</p>

                  <div className="mt-6">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">When To Use It</p>
                    <div className="mt-3 space-y-3">
                      {activePath.whenToUse.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm leading-7 text-muted-foreground">
                          <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Topic Map</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{activePath.title} Topics</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                These topic blocks are the first structure for this learning path. More detailed chapters, code notebooks, and mastery pages can be added next.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activePath.topics.map((topic) => (
                  <article key={topic} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">Topic</div>
                    <h3 className="mt-3 text-lg font-black tracking-tight text-foreground">{topic}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      This topic is queued as part of the {activePath.title.toLowerCase()} branch and can expand later into code, math, diagrams, and practical case studies.
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-[2rem] border border-border/60 bg-card/80 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Example Problems</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">{activePath.title} Scenarios</h2>
              <div className="mt-5 space-y-3">
                {activePath.examples.map((example) => (
                  <div key={example} className="rounded-2xl border border-border/60 bg-background/80 px-4 py-4 text-sm font-semibold text-foreground">
                    {example}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <Bot className="h-4 w-4" />
                  Next Expansion
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  The branching structure is ready now. Next we can expand each path into topic-level mastery cards, code notebooks, diagrams, interview prep, and project-based learning flows.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
