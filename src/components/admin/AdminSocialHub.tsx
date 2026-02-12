import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Plus,
  Calendar,
  CheckCircle2,
  BarChart3,
  Sparkles,
  RefreshCw,
  Send,
  XCircle,
  Eye,
  Link2,
  Hash,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAdminSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";
import AdminSocialProfilesManager from "./AdminSocialProfilesManager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type StudioPost = {
  id: string;
  title: string;
  base_content: string;
  source_type: "manual" | "blog" | "course" | "product";
  source_url: string | null;
  selected_platforms: string[];
  status: "draft" | "in_review" | "approved" | "published" | "rejected";
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type PostVariant = {
  id: string;
  post_id: string;
  platform: string;
  generated_content: string;
  hashtags: string[];
  compressed_url: string | null;
  seo_score: number;
  ai_score: number;
  quality_notes: string[];
  approval_status: "pending" | "approved" | "rejected" | "regenerate_requested";
  publish_status: "draft" | "ready" | "published" | "failed";
  published_at: string | null;
  updated_at: string;
};

type PublishLog = {
  id: string;
  post_id: string;
  variant_id: string | null;
  platform: string;
  status: "queued" | "published" | "failed";
  error: string | null;
  created_at: string;
};

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  linkedin: 3000,
  instagram: 2200,
  youtube: 5000,
  medium: 4000,
  substack: 4000,
  hashnode: 4000,
  github: 4000,
  website: 6000,
};

const stripTrackingParams = (url: string) => {
  try {
    const u = new URL(url);
    const blocked = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
    blocked.forEach((k) => u.searchParams.delete(k));
    return u.toString();
  } catch {
    return url;
  }
};

const ensureHash = (value: string) => (value.startsWith("#") ? value : `#${value}`);

const extractHashtags = (input: string) => {
  const words = input
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 5);
  return Array.from(new Set(words.map((w) => ensureHash(w.toLowerCase()))));
};

const qualityChecks = (content: string, hashtags: string[], hasLink: boolean) => {
  const notes: string[] = [];
  let seo = 45;
  let ai = 45;
  if (content.length > 120) {
    seo += 15;
    ai += 10;
  } else {
    notes.push("Content is short. Add more context for SEO/AI indexing.");
  }
  if (hashtags.length >= 3) {
    seo += 10;
    ai += 8;
  } else {
    notes.push("Use at least 3 strong hashtags.");
  }
  if (hasLink) {
    seo += 20;
    ai += 10;
  } else {
    notes.push("No source link attached.");
  }
  if (/\b(learn|read|watch|explore|build|ship)\b/i.test(content)) {
    seo += 10;
    ai += 15;
  } else {
    notes.push("Add a clear CTA (learn/read/build/explore).");
  }
  return { seo: Math.min(100, seo), ai: Math.min(100, ai), notes };
};

const generatePlatformVariant = (base: { title: string; content: string; url?: string | null }, platform: string) => {
  const maxLen = PLATFORM_LIMITS[platform] ?? 2800;
  const compressedUrl = base.url ? stripTrackingParams(base.url) : null;
  const hashtags = extractHashtags(`${base.title} ${base.content}`);

  const hooks: Record<string, string> = {
    x: "Quick insight:",
    linkedin: "Professional update:",
    instagram: "Behind the build:",
    youtube: "New release:",
    medium: "New article:",
    substack: "Newsletter update:",
    hashnode: "Dev write-up:",
    github: "Engineering note:",
    website: "From OriginX Labs:",
  };

  const prefix = hooks[platform] || "Update:";
  const suffix = [
    hashtags.slice(0, platform === "x" ? 2 : 4).join(" "),
    compressedUrl || "",
  ]
    .filter(Boolean)
    .join(" ");

  let generated = `${prefix} ${base.title}\n\n${base.content}\n\n${suffix}`.trim();
  if (generated.length > maxLen) {
    generated = `${generated.slice(0, maxLen - 3)}...`;
  }

  const { seo, ai, notes } = qualityChecks(generated, hashtags, !!compressedUrl);
  return {
    generated_content: generated,
    hashtags,
    compressed_url: compressedUrl,
    seo_score: seo,
    ai_score: ai,
    quality_notes: notes,
  };
};

export const AdminSocialHub = () => {
  const qc = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  const [composer, setComposer] = useState({
    source_type: "manual" as StudioPost["source_type"],
    blog_post_id: "",
    title: "",
    content: "",
    source_url: "",
    platforms: [] as string[],
  });

  const { data: socialRows = [] } = useAdminSocialProfiles();

  const accounts = useMemo(() => {
    return socialRows
      .filter((r) => !!r.profile_url)
      .map((r) => ({
        key: r.platform,
        platform: r.display_name,
        connected: r.connected,
        username: r.username || "",
        profileUrl: r.profile_url || "",
        followers: r.followers ?? 0,
        icon: iconForKey(r.icon_key),
        bgColor: r.brand_bg || "bg-muted",
      }));
  }, [socialRows]);

  const { data: blogSourceRows = [] } = useQuery({
    queryKey: ["omni-blog-source-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,excerpt,slug,published_at,is_published")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["omni-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("omniflow_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudioPost[];
    },
  });

  const { data: variants = [] } = useQuery({
    queryKey: ["omni-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("omniflow_post_variants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostVariant[];
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["omni-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("omniflow_publish_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as PublishLog[];
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!composer.title.trim() || !composer.content.trim() || composer.platforms.length === 0) {
        throw new Error("Title, content, and platforms are required.");
      }

      const basePayload = {
        title: composer.title.trim(),
        base_content: composer.content.trim(),
        source_type: composer.source_type,
        source_url: composer.source_url.trim() || null,
        selected_platforms: composer.platforms,
        status: "in_review" as const,
      };

      const { data: post, error } = await supabase.from("omniflow_posts").insert(basePayload).select("*").single();
      if (error) throw error;

      const variantRows = composer.platforms.map((platform) => {
        const generated = generatePlatformVariant(
          { title: basePayload.title, content: basePayload.base_content, url: basePayload.source_url },
          platform,
        );
        return {
          post_id: post.id,
          platform,
          generated_content: generated.generated_content,
          hashtags: generated.hashtags,
          compressed_url: generated.compressed_url,
          seo_score: generated.seo_score,
          ai_score: generated.ai_score,
          quality_notes: generated.quality_notes,
          approval_status: "pending" as const,
          publish_status: "draft" as const,
          preview_payload: {
            platform,
            title: basePayload.title,
            link: generated.compressed_url,
            generated_at: new Date().toISOString(),
          },
        };
      });

      const { error: variantError } = await supabase.from("omniflow_post_variants").insert(variantRows);
      if (variantError) throw variantError;

      return post as StudioPost;
    },
    onSuccess: async (post) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["omni-posts"] }),
        qc.invalidateQueries({ queryKey: ["omni-variants"] }),
      ]);
      toast.success("Draft created. Open preview and approve per platform.");
      setPreviewPostId(post.id);
      setIsCreateOpen(false);
      setComposer({
        source_type: "manual",
        blog_post_id: "",
        title: "",
        content: "",
        source_url: "",
        platforms: [],
      });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create post."),
  });

  const updateVariant = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PostVariant> }) => {
      const { error } = await supabase.from("omniflow_post_variants").update(patch).eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["omni-variants"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update variant."),
  });

  const publishVariants = useMutation({
    mutationFn: async ({ postId, variantIds }: { postId: string; variantIds: string[] }) => {
      const picked = variants.filter((v) => variantIds.includes(v.id));
      const invalid = picked.filter((v) => v.approval_status !== "approved");
      if (invalid.length > 0) {
        throw new Error("Only approved variants can be published.");
      }

      const now = new Date().toISOString();
      for (const v of picked) {
        const { error: uerr } = await supabase
          .from("omniflow_post_variants")
          .update({ publish_status: "published", published_at: now })
          .eq("id", v.id);
        if (uerr) throw uerr;

        const { error: lerr } = await supabase.from("omniflow_publish_logs").insert({
          post_id: postId,
          variant_id: v.id,
          platform: v.platform,
          status: "published",
          request_payload: {
            mode: "simulated",
            endpoint: "future-webhook-or-platform-api",
            content: v.generated_content,
            hashtags: v.hashtags,
          },
          response_payload: {
            ok: true,
            message: "Published in simulated mode. Connect API/webhook for live posting.",
          },
        });
        if (lerr) throw lerr;
      }

      const allForPost = variants.filter((v) => v.post_id === postId);
      const afterPublish = allForPost.map((v) =>
        variantIds.includes(v.id) ? { ...v, publish_status: "published" as const } : v,
      );
      const hasAllPublished = afterPublish.every((v) => v.publish_status === "published");

      const { error: perr } = await supabase
        .from("omniflow_posts")
        .update({ status: hasAllPublished ? "published" : "approved", published_at: hasAllPublished ? now : null })
        .eq("id", postId);
      if (perr) throw perr;
      return true;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["omni-posts"] }),
        qc.invalidateQueries({ queryKey: ["omni-variants"] }),
        qc.invalidateQueries({ queryKey: ["omni-logs"] }),
      ]);
      toast.success("Published successfully.");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to publish."),
  });

  const connectedAccounts = accounts.filter((a) => a.connected);
  const totalFollowers = connectedAccounts.reduce((sum, a) => sum + a.followers, 0);
  const publishedVariants = variants.filter((v) => v.publish_status === "published");
  const avgSeo = publishedVariants.length
    ? Math.round(publishedVariants.reduce((s, v) => s + v.seo_score, 0) / publishedVariants.length)
    : 0;
  const avgAi = publishedVariants.length
    ? Math.round(publishedVariants.reduce((s, v) => s + v.ai_score, 0) / publishedVariants.length)
    : 0;

  const postCards = posts.map((post) => {
    const postVariants = variants.filter((v) => v.post_id === post.id);
    const approved = postVariants.filter((v) => v.approval_status === "approved").length;
    const rejected = postVariants.filter((v) => v.approval_status === "rejected").length;
    const published = postVariants.filter((v) => v.publish_status === "published").length;
    return { post, postVariants, approved, rejected, published };
  });

  const previewVariants = variants.filter((v) => v.post_id === previewPostId);
  const previewPost = posts.find((p) => p.id === previewPostId) || null;
  const allApprovedForPreview = previewVariants.length > 0 && previewVariants.every((v) => v.approval_status === "approved");

  const togglePlatform = (platform: string) => {
    setComposer((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const importFromBlog = (blogId: string) => {
    const picked = blogSourceRows.find((b: any) => b.id === blogId);
    if (!picked) return;
    setComposer((prev) => ({
      ...prev,
      blog_post_id: blogId,
      source_type: "blog",
      title: picked.title || prev.title,
      content: picked.excerpt || prev.content,
      source_url: picked.slug ? `${window.location.origin}/blog/${picked.slug}` : prev.source_url,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Share2 className="w-7 h-7 text-primary" />
            OmniFlow Social
          </h1>
          <p className="text-muted-foreground mt-1">
            Approval-first social publishing with per-platform preview, regeneration, and publish logs.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign Post
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{connectedAccounts.length}</div><p className="text-sm text-muted-foreground">Connected</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div><p className="text-sm text-muted-foreground">Followers</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{posts.length}</div><p className="text-sm text-muted-foreground">Campaigns</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{publishedVariants.length}</div><p className="text-sm text-muted-foreground">Published Variants</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{avgSeo}</div><p className="text-sm text-muted-foreground">Avg SEO Score</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{avgAi}</div><p className="text-sm text-muted-foreground">Avg AI Score</p></CardContent></Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="accounts">Managed Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Publish Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <AnimatePresence>
            {postCards.map(({ post, postVariants, approved, rejected, published }, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.base_content}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">{post.status.replace("_", " ")}</Badge>
                          <Badge variant="secondary">Approved {approved}/{postVariants.length}</Badge>
                          <Badge variant="secondary">Rejected {rejected}</Badge>
                          <Badge variant="secondary">Published {published}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setPreviewPostId(post.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            publishVariants.mutate({
                              postId: post.id,
                              variantIds: postVariants.filter((v) => v.approval_status === "approved").map((v) => v.id),
                            })
                          }
                          disabled={postVariants.filter((v) => v.approval_status === "approved").length === 0 || publishVariants.isPending}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Publish All Approved
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.selected_platforms.map((platform) => {
                        const account = accounts.find((a) => a.key === platform);
                        if (!account) return null;
                        return (
                          <span key={`${post.id}-${platform}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                            <account.icon className="w-3.5 h-3.5" />
                            {account.platform}
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AdminSocialProfilesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader><CardTitle>OmniFlow Performance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval Velocity</p>
                <p className="text-2xl font-bold">{variants.filter((v) => v.approval_status === "approved").length}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Publish Success</p>
                <p className="text-2xl font-bold">{logs.filter((l) => l.status === "published").length}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold">{logs.filter((l) => l.status === "failed").length}</p>
              </div>
              <div className="md:col-span-3 rounded-xl border border-border p-4 text-muted-foreground flex items-center gap-3">
                <BarChart3 className="w-6 h-6" />
                Detailed platform analytics and live metrics are ready to connect to webhooks/API responses in the next phase.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Publishing Logs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No logs yet.</p>
              ) : (
                logs.slice(0, 80).map((log) => (
                  <div key={log.id} className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{log.platform}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <Badge className={log.status === "published" ? "bg-emerald-100 text-emerald-700 border-0" : log.status === "failed" ? "bg-red-100 text-red-700 border-0" : "bg-blue-100 text-blue-700 border-0"}>
                      {log.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create OmniFlow Campaign Post</DialogTitle>
            <DialogDescription>
              Write once, preview per platform, run approval checks, then publish all or selected channels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Source Type</Label>
                <select
                  className="mt-1 h-10 rounded-md border border-border bg-background px-3 text-sm w-full"
                  value={composer.source_type}
                  onChange={(e) => setComposer((p) => ({ ...p, source_type: e.target.value as any }))}
                >
                  <option value="manual">Manual</option>
                  <option value="blog">Blog (CMS)</option>
                  <option value="course">Course</option>
                  <option value="product">Product</option>
                </select>
              </div>
              {composer.source_type === "blog" ? (
                <div>
                  <Label>Import Blog Post</Label>
                  <select
                    className="mt-1 h-10 rounded-md border border-border bg-background px-3 text-sm w-full"
                    value={composer.blog_post_id}
                    onChange={(e) => importFromBlog(e.target.value)}
                  >
                    <option value="">Select blog post</option>
                    {blogSourceRows.map((row: any) => (
                      <option key={row.id} value={row.id}>
                        {row.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <Label>Title</Label>
              <Input value={composer.title} onChange={(e) => setComposer((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={composer.content}
                onChange={(e) => setComposer((p) => ({ ...p, content: e.target.value }))}
                className="min-h-[140px]"
              />
            </div>
            <div>
              <Label>Source Link</Label>
              <Input
                placeholder="https://..."
                value={composer.source_url}
                onChange={(e) => setComposer((p) => ({ ...p, source_url: e.target.value }))}
              />
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {accounts
                  .filter((a) => a.connected)
                  .map((account) => (
                    <Button
                      key={account.key}
                      type="button"
                      variant={composer.platforms.includes(account.key) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(account.key)}
                      className="gap-2"
                    >
                      <account.icon className="w-4 h-4" />
                      {account.platform}
                    </Button>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => createPost.mutate()} disabled={createPost.isPending}>
                {createPost.isPending ? "Generating..." : "Generate Previews"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewPostId} onOpenChange={(open) => !open && setPreviewPostId(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Per-Platform Preview & Approval</DialogTitle>
            <DialogDescription>
              Approve, reject, or regenerate each platform post before publishing.
            </DialogDescription>
          </DialogHeader>

          {previewPost ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">{previewPost.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{previewPost.base_content}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewPost.source_url ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Link2 className="w-3.5 h-3.5" />
                      {previewPost.source_url}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[62vh] overflow-auto pr-1">
                {previewVariants.map((variant) => {
                  const account = accounts.find((a) => a.key === variant.platform);
                  const Icon: any = account?.icon || FileText;
                  const isSelected = selectedVariantIds.includes(variant.id);
                  return (
                    <div key={variant.id} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{account?.platform || variant.platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{variant.approval_status}</Badge>
                          <Badge variant="outline">{variant.publish_status}</Badge>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap">{variant.generated_content}</div>

                      <div className="flex flex-wrap gap-2">
                        {variant.hashtags.map((tag) => (
                          <span key={`${variant.id}-${tag}`} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border border-border p-2">
                          <div className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SEO Score</div>
                          <p className="text-lg font-bold">{variant.seo_score}</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <div className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Score</div>
                          <p className="text-lg font-bold">{variant.ai_score}</p>
                        </div>
                      </div>

                      {variant.quality_notes.length > 0 ? (
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                          <div className="inline-flex items-center gap-1 font-medium mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Approval Checks</div>
                          {variant.quality_notes.map((note, idx) => (
                            <p key={`${variant.id}-note-${idx}`}>• {note}</p>
                          ))}
                        </div>
                      ) : null}

                      <div>
                        <Label className="text-xs">Edit Variant Content</Label>
                        <Textarea
                          className="mt-1 min-h-[96px]"
                          value={variant.generated_content}
                          onChange={(e) => updateVariant.mutate({ id: variant.id, patch: { generated_content: e.target.value } })}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateVariant.mutate({
                              id: variant.id,
                              patch: {
                                approval_status: "approved",
                                publish_status: "ready",
                                approved_at: new Date().toISOString() as any,
                              } as any,
                            })
                          }
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const refreshed = generatePlatformVariant(
                              {
                                title: previewPost.title,
                                content: previewPost.base_content,
                                url: previewPost.source_url,
                              },
                              variant.platform,
                            );
                            updateVariant.mutate({
                              id: variant.id,
                              patch: {
                                generated_content: refreshed.generated_content,
                                hashtags: refreshed.hashtags as any,
                                compressed_url: refreshed.compressed_url,
                                seo_score: refreshed.seo_score as any,
                                ai_score: refreshed.ai_score as any,
                                quality_notes: refreshed.quality_notes as any,
                                approval_status: "pending",
                                publish_status: "draft",
                              } as any,
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => updateVariant.mutate({ id: variant.id, patch: { approval_status: "rejected", publish_status: "draft" } as any })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() =>
                            setSelectedVariantIds((prev) =>
                              prev.includes(variant.id) ? prev.filter((x) => x !== variant.id) : [...prev, variant.id],
                            )
                          }
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Approved variants are publish-ready. You can publish all approved or only selected.
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      publishVariants.mutate({
                        postId: previewPost.id,
                        variantIds: selectedVariantIds.length
                          ? selectedVariantIds
                          : previewVariants.filter((v) => v.approval_status === "approved").map((v) => v.id),
                      })
                    }
                    disabled={publishVariants.isPending}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Publish Selected / Approved
                  </Button>
                  <Button
                    onClick={() =>
                      publishVariants.mutate({
                        postId: previewPost.id,
                        variantIds: previewVariants.filter((v) => v.approval_status === "approved").map((v) => v.id),
                      })
                    }
                    disabled={!allApprovedForPreview || publishVariants.isPending}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    One Click Publish All
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSocialHub;
