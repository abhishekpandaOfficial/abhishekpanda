import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Code2,
  Crown,
  FileCode,
  Filter,
  Layers3,
  Lock,
  Menu,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Markdown } from "@/components/blog/Markdown";
import { useUserAuth } from "@/hooks/useUserAuth";
import { supabase } from "@/integrations/supabase/client";

type DomainSlug =
  | "dotnet"
  | "microservices"
  | "devops"
  | "cloud"
  | "ai-ml"
  | "recent-unboxing"
  | "others";

type DomainConfig = {
  slug: DomainSlug;
  label: string;
  description: string;
  keywords: string[];
};

type HubPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  hero_image: string | null;
  tags: string[] | null;
  section_id: string | null;
  level: string | null;
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number;
  code_theme: string | null;
  source_code_url: string | null;
};

type SectionRow = {
  id: string;
  name: string;
  slug: string;
};

type TocHeading = {
  depth: 2 | 3;
  text: string;
  id: string;
};

const DOMAIN_CONFIG: DomainConfig[] = [
  {
    slug: "dotnet",
    label: ".NET Blogs",
    description: "C#, API, LINQ, EF Core, architecture and performance playbooks.",
    keywords: [".net", "c#", "api", "linq", "ef core", "asp.net", "dotnet"],
  },
  {
    slug: "microservices",
    label: "Microservices Blogs",
    description: "Boundaries, messaging, reliability, distributed architecture and patterns.",
    keywords: ["microservice", "microservices", "ddd", "saga", "event", "kafka"],
  },
  {
    slug: "devops",
    label: "DevOps Blogs",
    description: "CI/CD, GitHub Actions, Argo CD, delivery automation and operations.",
    keywords: ["devops", "github actions", "argo", "ci/cd", "pipeline", "jenkins"],
  },
  {
    slug: "cloud",
    label: "Cloud Blogs",
    description: "Azure, AWS, infra as code, Kubernetes operations and scaling strategies.",
    keywords: ["azure", "aws", "cloud", "terraform", "kubernetes", "iac"],
  },
  {
    slug: "ai-ml",
    label: "AI/ML Blogs",
    description: "Model integration, MLOps, practical AI engineering and learning systems.",
    keywords: ["ai", "ml", "llm", "openai", "hugging", "pytorch", "tensorflow"],
  },
  {
    slug: "recent-unboxing",
    label: "Recent Tech Blogs (Unboxing)",
    description: "Latest engineering concepts, comparisons, launches and trend breakdowns.",
    keywords: ["latest", "release", "unboxing", "comparison", "new"],
  },
  {
    slug: "others",
    label: "Other Blogs",
    description: "General engineering, architecture, interviews and cross-domain guides.",
    keywords: [],
  },
];
const DOMAIN_FEATURED_DOCS_COUNT: Partial<Record<DomainSlug, number>> = {
  "ai-ml": 1,
};

const FOCUS_TO_DOMAIN: Record<string, DomainSlug> = {
  "dotnet-core-api-net10": "dotnet",
  microservices: "microservices",
  github: "devops",
  "github-actions": "devops",
  "argo-cd": "devops",
  "design-patterns": "dotnet",
  "solid-principles": "dotnet",
  "microservices-architecture": "microservices",
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (v: string | null | undefined) => {
  if (!v) return "General";
  return `${v.charAt(0).toUpperCase()}${v.slice(1)}`;
};

const extractYouTubeEmbed = (content: string) => {
  const direct = content.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/i);
  if (direct?.[1]) return `https://www.youtube.com/embed/${direct[1]}`;
  const short = content.match(/https?:\/\/youtu\.be\/([\w-]{11})/i);
  if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
  return null;
};

const extractMarkdownImages = (content: string) => {
  const urls: string[] = [];
  const regex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(content)) && urls.length < 4) {
    urls.push(match[1]);
  }
  return urls;
};

const parseToc = (content: string): TocHeading[] => {
  const lines = content.split("\n");
  const seen = new Set<string>();
  const out: TocHeading[] = [];

  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line.trim());
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].replace(/\s+#\s*$/, "").trim();
    if (!text) continue;
    let id = slugify(text);
    let i = 2;
    while (seen.has(id)) {
      id = `${slugify(text)}-${i}`;
      i += 1;
    }
    seen.add(id);
    out.push({ depth, text, id });
  }

  return out;
};

const getPublishingChannel = (tags: string[] | null | undefined): "personal" | "techhub" => {
  const hit = (tags || []).find((t) => t.toLowerCase().startsWith("channel:"));
  if (!hit) return (tags || []).some((t) => t.toLowerCase().startsWith("techhub:")) ? "techhub" : "personal";
  const raw = hit.split(":")[1]?.toLowerCase();
  return raw === "techhub" ? "techhub" : "personal";
};

const scorePostForDomain = (post: HubPost, domain: DomainConfig) => {
  const explicitTag = (post.tags || []).find((t) => t.toLowerCase().startsWith("techhub:"));
  const explicitDomain = explicitTag?.split(":")[1] as DomainSlug | undefined;
  if (explicitDomain && DOMAIN_CONFIG.some((d) => d.slug === explicitDomain)) {
    return explicitDomain === domain.slug;
  }

  if (domain.slug === "others") return true;
  const haystack = [
    post.title,
    post.excerpt || "",
    (post.tags || []).join(" "),
    post.content || "",
  ]
    .join(" ")
    .toLowerCase();

  return domain.keywords.some((k) => haystack.includes(k.toLowerCase()));
};

const TechHub = () => {
  const { user } = useUserAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<DomainSlug>("dotnet");
  const [activeSection, setActiveSection] = useState<string>("all");
  const [showPremium, setShowPremium] = useState<"all" | "free" | "premium">("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (!focus) return;
    const mapped = FOCUS_TO_DOMAIN[focus];
    if (mapped) {
      setActiveDomain(mapped);
      setSearchParams((prev) => {
        const np = new URLSearchParams(prev);
        np.delete("focus");
        np.set("domain", mapped);
        return np;
      });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const domain = searchParams.get("domain") as DomainSlug | null;
    if (domain && DOMAIN_CONFIG.some((d) => d.slug === domain)) {
      setActiveDomain(domain);
    }
  }, [searchParams]);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["techhub-posts"],
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select(
          "id,title,slug,excerpt,content,hero_image,tags,section_id,level,is_premium,is_published,published_at,updated_at,reading_time_minutes,code_theme,source_code_url"
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (res.error) throw res.error;
      return (res.data ?? []) as HubPost[];
    },
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["techhub-sections"],
    queryFn: async () => {
      const res = await supabase
        .from("blog_sections")
        .select("id,name,slug")
        .order("sort_order", { ascending: true });
      if (res.error) return [];
      return (res.data ?? []) as SectionRow[];
    },
  });

  const { data: entitlementOk = false } = useQuery({
    queryKey: ["techhub-blog-premium-entitlement", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_entitlements")
        .select("entitlement,expires_at")
        .eq("user_id", user!.id)
        .eq("entitlement", "blog_premium")
        .limit(1);
      if (error) return false;
      const row = data?.[0];
      if (!row) return false;
      if (!row.expires_at) return true;
      return new Date(row.expires_at).getTime() > Date.now();
    },
  });

  const domain = useMemo(
    () => DOMAIN_CONFIG.find((d) => d.slug === activeDomain) ?? DOMAIN_CONFIG[0],
    [activeDomain]
  );
  const isAiMlDomain = domain.slug === "ai-ml";

  const postsByDomain = useMemo(
    () => posts.filter((p) => getPublishingChannel(p.tags || []) === "techhub" && scorePostForDomain(p, domain)),
    [posts, domain]
  );

  const filteredPosts = useMemo(() => {
    let next = postsByDomain;
    if (activeSection !== "all") next = next.filter((p) => p.section_id === activeSection);
    if (showPremium === "free") next = next.filter((p) => !p.is_premium);
    if (showPremium === "premium") next = next.filter((p) => p.is_premium);
    return next;
  }, [postsByDomain, activeSection, showPremium]);

  const availableSections = useMemo(() => {
    const ids = new Set(postsByDomain.map((p) => p.section_id).filter(Boolean) as string[]);
    return sections.filter((s) => ids.has(s.id));
  }, [postsByDomain, sections]);

  useEffect(() => {
    if (!filteredPosts.length) {
      setSelectedSlug(null);
      return;
    }
    if (!selectedSlug || !filteredPosts.some((p) => p.slug === selectedSlug)) {
      setSelectedSlug(filteredPosts[0].slug);
    }
  }, [filteredPosts, selectedSlug]);

  const selectedPost = useMemo(
    () => filteredPosts.find((p) => p.slug === selectedSlug) ?? null,
    [filteredPosts, selectedSlug]
  );

  const isLocked = !!selectedPost?.is_premium && !entitlementOk;
  const toc = useMemo(() => (selectedPost?.content ? parseToc(selectedPost.content) : []), [selectedPost?.content]);
  const videoUrl = useMemo(() => {
    if (!selectedPost?.content) return null;
    return extractYouTubeEmbed(selectedPost.content);
  }, [selectedPost?.content]);
  const inlineImages = useMemo(() => {
    if (!selectedPost?.content) return [];
    return extractMarkdownImages(selectedPost.content);
  }, [selectedPost?.content]);

  const gotoHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pb-16 pt-24">
        <section className="mb-6 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">TechHub</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Techstacks Learning Hub</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Modular engineering knowledge base with modules, chapters, topics, code snippets, media previews and blog learning streams. Managed from Admin CMS Studio via Blog Manager publish controls.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
              Publish mode: Free / Premium (uses existing blog publish flags)
            </span>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {DOMAIN_CONFIG.map((d) => {
            const active = d.slug === activeDomain;
            const publishedTechHubCount = posts.filter(
              (p) => getPublishingChannel(p.tags || []) === "techhub" && scorePostForDomain(p, d)
            ).length;
            const count = publishedTechHubCount + (DOMAIN_FEATURED_DOCS_COUNT[d.slug] || 0);
            return (
              <button
                key={d.slug}
                onClick={() => {
                  setActiveDomain(d.slug);
                  setActiveSection("all");
                  setSearchParams((prev) => {
                    const np = new URLSearchParams(prev);
                    np.set("domain", d.slug);
                    return np;
                  });
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 bg-card/70 hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-black text-foreground">{d.label}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
                <p className="mt-2 text-xs font-semibold text-primary">{count} posts</p>
                {DOMAIN_FEATURED_DOCS_COUNT[d.slug] ? (
                  <p className="mt-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-300">
                    includes {DOMAIN_FEATURED_DOCS_COUNT[d.slug]} featured docs guide
                  </p>
                ) : null}
              </button>
            );
          })}
        </section>

        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-semibold"
          >
            <Menu className="h-4 w-4" />
            TechHub Menu
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
              <div>
                <h2 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  <Filter className="h-3.5 w-3.5" />
                  Modules
                </h2>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveSection("all")}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                      activeSection === "all"
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    All Modules
                  </button>
                  {availableSections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                        activeSection === s.id
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-3">
                <h2 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">Visibility</h2>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "free", label: "Free" },
                    { id: "premium", label: "Premium" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setShowPremium(v.id as "all" | "free" | "premium")}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        showPremium === v.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-3">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  <Layers3 className="h-3.5 w-3.5" />
                  Chapters
                </h2>
                <div className="space-y-1">
                  {filteredPosts.slice(0, 18).map((p) => (
                    <Link
                      key={p.id}
                      to={`/blog/${p.slug}`}
                      className={`block w-full rounded-md px-2 py-2 text-left ${
                        selectedSlug === p.slug
                          ? "bg-primary/15"
                          : "hover:bg-muted/70"
                      }`}
                    >
                      <div className="line-clamp-2 text-xs font-semibold text-foreground">{p.title}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>{titleCase(p.level)}</span>
                        {p.is_premium ? (
                          <>
                            <span>•</span>
                            <Crown className="h-3 w-3 text-amber-500" />
                          </>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {toc.length ? (
                <div className="border-t border-border/50 pt-3">
                  <h2 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">Topics</h2>
                  <div className="space-y-1">
                    {toc.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => gotoHeading(h.id)}
                        className={`block w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground ${
                          h.depth === 3 ? "pl-5" : ""
                        }`}
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="space-y-5">
            {isAiMlDomain ? (
              <article className="overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/10 via-card to-cyan-500/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Featured Documentation</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-foreground">
                  Building Your Own Foundational AI Models From Scratch
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Step-by-step series: architecture, datasets, distributed training, real-time finance LLM example, evaluation, alignment, and production deployment.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/blog/building-your-own-foundational-ai-models-from-scratch"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Open AI/ML Docs Guide
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href="https://originxcloud.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    OriginX Cloud
                  </a>
                </div>
              </article>
            ) : null}

            {postsLoading ? (
              <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">Loading TechHub modules...</div>
            ) : !selectedPost ? (
              <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">No posts available for this module selection.</div>
            ) : (
              <>
                <article className="rounded-2xl border border-border/60 bg-card/80 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {domain.label}
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      {titleCase(selectedPost.level)}
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                      {Math.max(1, selectedPost.reading_time_minutes || 5)} min
                    </span>
                    {selectedPost.is_premium ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[11px] text-amber-600">
                        <Crown className="h-3.5 w-3.5" /> Premium
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-600">Free</span>
                    )}
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">{selectedPost.title}</h2>
                  {selectedPost.excerpt ? <p className="mt-2 text-sm text-muted-foreground">{selectedPost.excerpt}</p> : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedPost.tags || []).map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/blog/${selectedPost.slug}`} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                      Open Full Blog Post <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    {selectedPost.source_code_url ? (
                      <a href={selectedPost.source_code_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                        <Code2 className="h-3.5 w-3.5" /> Source Code
                      </a>
                    ) : null}
                  </div>
                </article>

                {selectedPost.hero_image ? (
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <img src={selectedPost.hero_image} alt={selectedPost.title} className="h-auto w-full object-cover" loading="lazy" />
                  </div>
                ) : null}

                {videoUrl ? (
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                      <Video className="h-4 w-4 text-primary" /> Video Preview
                    </div>
                    <div className="aspect-video overflow-hidden rounded-xl border border-border/60 bg-black">
                      <iframe
                        src={videoUrl}
                        title="TechHub video preview"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}

                {inlineImages.length ? (
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" /> Image Previews
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {inlineImages.map((url, idx) => (
                        <img key={`${url}-${idx}`} src={url} alt={`Inline preview ${idx + 1}`} className="h-48 w-full rounded-lg border border-border/60 object-cover" loading="lazy" />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-primary">
                    <FileCode className="h-4 w-4" /> Content
                  </div>

                  {isLocked ? (
                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="mt-0.5 h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Premium module</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            This chapter is premium. Publish mode is controlled from Admin CMS and entitlement checks.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link to="/login?next=/blog" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                              Unlock Premium
                            </Link>
                            <Link to={`/blog/${selectedPost.slug}`} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                              Open Blog Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Markdown
                      value={selectedPost.content || "## Coming soon\nDetailed module content will appear here."}
                      codeTheme={selectedPost.code_theme || "github-dark-default"}
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-primary">
                    <BookOpen className="h-4 w-4" /> Free Posts
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {postsByDomain
                      .filter((p) => !p.is_premium)
                      .slice(0, 8)
                      .map((p) => (
                        <Link
                          key={p.id}
                          to={`/blog/${p.slug}`}
                          className="block rounded-xl border border-border/60 bg-background/60 p-4 text-left hover:border-primary/35"
                        >
                          <p className="text-sm font-bold text-foreground">{p.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.excerpt || "Read this free engineering post."}</p>
                        </Link>
                      ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <div className="absolute inset-0 bg-black/55" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-r border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">TechHub Menu</p>
                <button onClick={() => setMobileOpen(false)} className="rounded-md border border-border/60 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredPosts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={`w-full rounded-md px-2 py-2 text-left ${
                      selectedSlug === p.slug
                        ? "bg-primary/15"
                        : "hover:bg-muted/70"
                    }`}
                  >
                    <div className="line-clamp-2 text-sm font-semibold text-foreground">{p.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default TechHub;
