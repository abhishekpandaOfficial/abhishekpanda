import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { ExternalLink, RefreshCw, Search, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type CmsTag = {
  id?: number | string;
  name?: string;
  slug?: string;
};

type CmsAsset = {
  url?: string;
  alternativeText?: string;
};

type CmsBlock = {
  __component?: string;
  heading?: string;
  title?: string;
  body?: string;
  variant?: "note" | "tip" | "warning" | "danger";
  snippet?: {
    code?: string;
    language?: string;
  };
  diagram?: string;
  resource?: {
    provider?: string;
    embedUrl?: string;
    url?: string;
  };
  items?: Array<{
    label?: string;
    title?: string;
    body?: string;
    checked?: boolean;
  }>;
  caption?: string;
  image?: CmsAsset;
};

type CmsBlogPost = {
  id: number | string;
  documentId?: string;
  title: string;
  slug: string;
  description?: string;
  level?: string;
  featured?: boolean;
  updatedAt?: string;
  publishedAt?: string;
  tags: CmsTag[];
  coverImage?: CmsAsset;
  contentBlocks: CmsBlock[];
};

type HeadingItem = {
  id: string;
  label: string;
  index: number;
};

const CMS_API_BASE = import.meta.env.VITE_CMS_API_BASE || "/cms-api";
const CMS_ADMIN_URL = import.meta.env.VITE_CMS_ADMIN_URL || "/cms-admin";
const CMS_API_TOKEN = import.meta.env.VITE_CMS_API_TOKEN as string | undefined;

const toStringOrEmpty = (value: unknown) => (typeof value === "string" ? value : "");

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const extractTitleFromRichText = (body: string) => {
  const htmlHeadingMatch = body.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  if (htmlHeadingMatch?.[1]) {
    return stripHtml(htmlHeadingMatch[1]);
  }

  const markdownHeadingMatch = body.match(/^#{1,6}\s+(.+)$/m);
  if (markdownHeadingMatch?.[1]) {
    return markdownHeadingMatch[1].trim();
  }

  return "";
};

const unwrapEntity = (entry: any) => {
  if (!entry) return null;
  if (entry.attributes && typeof entry.attributes === "object") {
    return { id: entry.id, ...entry.attributes };
  }
  return entry;
};

const unwrapRelationMany = (value: any) => {
  if (Array.isArray(value)) {
    return value.map(unwrapEntity).filter(Boolean);
  }

  if (Array.isArray(value?.data)) {
    return value.data.map(unwrapEntity).filter(Boolean);
  }

  return [];
};

const unwrapMediaSingle = (value: any): CmsAsset | undefined => {
  if (!value) {
    return undefined;
  }

  const media = value.data ? unwrapEntity(value.data) : unwrapEntity(value);
  if (!media) {
    return undefined;
  }

  return {
    url: media.url,
    alternativeText: media.alternativeText,
  };
};

const normalizePost = (entry: any): CmsBlogPost => {
  const item = unwrapEntity(entry) || {};

  const blocks = Array.isArray(item.contentBlocks)
    ? item.contentBlocks
    : Array.isArray(item.contentBlocks?.data)
      ? item.contentBlocks.data
      : [];

  return {
    id: item.id,
    documentId: item.documentId,
    title: toStringOrEmpty(item.title),
    slug: toStringOrEmpty(item.slug),
    description: toStringOrEmpty(item.description),
    level: toStringOrEmpty(item.level),
    featured: Boolean(item.featured),
    updatedAt: toStringOrEmpty(item.updatedAt),
    publishedAt: toStringOrEmpty(item.publishedAt),
    tags: unwrapRelationMany(item.tags),
    coverImage: unwrapMediaSingle(item.coverImage),
    contentBlocks: blocks.map(unwrapEntity).filter(Boolean),
  };
};

const getHeadingLabel = (block: CmsBlock, index: number) => {
  if (block.heading && block.heading.trim()) {
    return block.heading.trim();
  }

  if (block.__component === "content-blocks.rich-text") {
    const richHeading = extractTitleFromRichText(toStringOrEmpty(block.body));
    if (richHeading) {
      return richHeading;
    }
  }

  if (block.title && block.title.trim()) {
    return block.title.trim();
  }

  const componentName = (block.__component || "section").split(".").at(-1) || "section";
  return `${componentName.replace(/-/g, " ")} ${index + 1}`;
};

const getBlockPreviewText = (block: CmsBlock) => {
  if (block.__component === "content-blocks.rich-text") {
    return stripHtml(toStringOrEmpty(block.body)).slice(0, 220);
  }

  if (block.__component === "content-blocks.code-block") {
    return toStringOrEmpty(block.snippet?.code).slice(0, 220);
  }

  if (block.__component === "content-blocks.mermaid-diagram") {
    return toStringOrEmpty(block.diagram).slice(0, 220);
  }

  if (Array.isArray(block.items) && block.items.length > 0) {
    return block.items
      .map((item) => item.label || item.title)
      .filter(Boolean)
      .join(" • ")
      .slice(0, 220);
  }

  return stripHtml(toStringOrEmpty(block.body)).slice(0, 220);
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const AdminCMSStudio = () => {
  const [posts, setPosts] = useState<CmsBlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const query =
        "pagination[pageSize]=200&sort=updatedAt:desc&populate[tags]=*&populate[coverImage]=*&populate[contentBlocks][populate]=*";
      const response = await fetch(`${CMS_API_BASE}/blog-posts?${query}`, {
        headers: {
          ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch BlogPosts (${response.status})`);
      }

      const payload = await response.json();
      const rawData = Array.isArray(payload?.data) ? payload.data : [];
      const normalized = rawData.map(normalizePost).filter((post: CmsBlogPost) => post.title && post.slug);

      setPosts(normalized);

      if (normalized.length > 0) {
        setSelectedId((current) => current || String(normalized[0].id));
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown CMS fetch error";
      setError(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: ["title", "slug", "description", "level", "tags.name", "tags.slug"],
      }),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    return fuse.search(searchQuery).map((result) => result.item);
  }, [fuse, posts, searchQuery]);

  useEffect(() => {
    if (!filteredPosts.some((post) => String(post.id) === selectedId)) {
      setSelectedId(filteredPosts[0] ? String(filteredPosts[0].id) : "");
    }
  }, [filteredPosts, selectedId]);

  const selectedPost = useMemo(
    () => filteredPosts.find((post) => String(post.id) === selectedId) || filteredPosts[0],
    [filteredPosts, selectedId],
  );

  const headings = useMemo<HeadingItem[]>(() => {
    if (!selectedPost) {
      return [];
    }

    return selectedPost.contentBlocks.map((block, index) => ({
      id: `heading-${index + 1}`,
      label: getHeadingLabel(block, index),
      index,
    }));
  }, [selectedPost]);

  useEffect(() => {
    setActiveHeadingId(headings[0]?.id || "");
    setReadingProgress(0);
  }, [selectedPost?.id, headings]);

  useEffect(() => {
    const root = previewRef.current;
    if (!root || headings.length === 0) {
      return;
    }

    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;

        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-heading-id");
          if (!id) {
            return;
          }

          if (entry.isIntersecting) {
            seen.add(id);
            setActiveHeadingId(id);
            changed = true;
          }
        });

        if (changed) {
          setReadingProgress(Math.round((seen.size / headings.length) * 100));
        }
      },
      {
        root,
        threshold: [0.2, 0.5, 0.8],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    headings.forEach((heading) => {
      const section = root.querySelector(`[data-heading-id='${heading.id}']`);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings, selectedPost?.id]);

  const handleHeadingClick = (headingId: string) => {
    const root = previewRef.current;
    if (!root) {
      return;
    }

    const section = root.querySelector(`[data-heading-id='${headingId}']`);
    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">CMS Studio</CardTitle>
              <CardDescription>
                Unified authoring workspace with Strapi editing, instant search, and a preview pane.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => void loadPosts()} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Index
              </Button>
              <Button asChild>
                <a href={CMS_ADMIN_URL} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Strapi
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">BlogPost Search</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
                placeholder="Search title, slug, level, tags"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {filteredPosts.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">No posts indexed yet. Create or publish in Strapi first.</p>
            ) : null}
            <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {filteredPosts.map((post) => {
                const isActive = String(post.id) === String(selectedPost?.id);

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedId(String(post.id))}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-violet-500/70 bg-violet-500/10"
                        : "border-border/70 bg-background/20 hover:border-violet-400/50"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{post.level || "basic"}</Badge>
                      {post.featured ? <Badge>Featured</Badge> : null}
                    </div>
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.description || "No description"}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Author Preview</CardTitle>
              <CardDescription>
                {selectedPost
                  ? `Updated ${formatDate(selectedPost.updatedAt)} • Published ${formatDate(selectedPost.publishedAt)}`
                  : "Select a post to preview"}
              </CardDescription>
              <Progress value={readingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">Reading progress: {readingProgress}%</p>
            </CardHeader>
            <CardContent>
              {!selectedPost ? (
                <p className="text-sm text-muted-foreground">No post selected.</p>
              ) : (
                <div ref={previewRef} className="max-h-[640px] space-y-5 overflow-y-auto pr-2">
                  <article className="space-y-2">
                    <h2 className="text-xl font-semibold">{selectedPost.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedPost.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPost.tags.map((tag) => (
                        <Badge key={`${tag.slug || tag.name}-${tag.id}`} variant="outline">
                          {tag.name || tag.slug}
                        </Badge>
                      ))}
                    </div>
                  </article>
                  <Separator />

                  {selectedPost.contentBlocks.map((block, index) => {
                    const heading = headings[index];
                    const blockType = (block.__component || "content-blocks.section").split(".").at(-1) || "section";

                    return (
                      <section
                        key={`${heading?.id || "section"}-${index}`}
                        data-heading-id={heading?.id}
                        className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold">{heading?.label || `Section ${index + 1}`}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {blockType}
                          </Badge>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{getBlockPreviewText(block) || "-"}</p>
                      </section>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">On This Page</CardTitle>
                <CardDescription>IntersectionObserver-powered heading tracker.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[280px] space-y-1 overflow-y-auto">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    type="button"
                    onClick={() => handleHeadingClick(heading.id)}
                    className={`flex w-full items-center rounded-md px-2 py-1 text-left text-sm transition ${
                      activeHeadingId === heading.id
                        ? "bg-violet-500/15 text-violet-100"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <ScrollText className="mr-2 h-3.5 w-3.5" />
                    <span className="truncate">{heading.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Embedded Strapi</CardTitle>
                <CardDescription>
                  The Strapi admin panel is embedded here and protected by the existing Supabase admin login route.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border border-border/70">
                  <iframe
                    src={CMS_ADMIN_URL}
                    title="Strapi CMS"
                    className="h-[460px] w-full bg-background"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCMSStudio;
