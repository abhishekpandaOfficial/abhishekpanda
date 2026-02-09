import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Calendar,
  Tag,
  Image as ImageIcon,
  Save,
  X,
  Bold,
  Italic,
  List,
  Link2,
  Code,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  Globe,
  Clock,
  TrendingUp,
  Crown,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BiometricVerificationModal } from "./BiometricVerificationModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Markdown } from "@/components/blog/Markdown";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  hero_image: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean | null;
  is_premium: boolean | null;
  views: number | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const AdminBlogManager = () => {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [newTag, setNewTag] = useState("");
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPublishBiometric, setShowPublishBiometric] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const errMsg = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const handleBiometricSuccess = () => {
    setIsUnlocked(true);
    setShowBiometricModal(false);
  };

  const handlePublishBiometricSuccess = () => {
    setShowPublishBiometric(false);
    if (selectedPost && pendingPublish) {
      setSelectedPost({
        ...selectedPost,
        is_published: true,
        published_at: selectedPost.published_at || new Date().toISOString(),
      });
      setPendingPublish(false);
    }
  };

  const handlePublishToggle = (checked: boolean) => {
    if (checked && !selectedPost?.is_published) {
      // Require biometric verification to publish
      setPendingPublish(true);
      setShowPublishBiometric(true);
    } else {
      setSelectedPost({ ...selectedPost!, is_published: checked });
    }
  };

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter((post) => {
      const inTitle = post.title.toLowerCase().includes(q);
      const inTags = (post.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return inTitle || inTags;
    });
  }, [posts, searchQuery]);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => !!p.is_published).length,
    drafts: posts.filter((p) => !p.is_published).length,
    totalViews: posts.reduce((sum, p) => sum + (p.views ?? 0), 0),
  };

  const handleCreatePost = () => {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: crypto.randomUUID(),
      title: "Untitled Post",
      slug: "untitled-post",
      excerpt: "",
      content: "",
      hero_image: null,
      tags: [],
      meta_title: "",
      meta_description: "",
      is_published: false,
      is_premium: false,
      views: 0,
      created_at: now,
      published_at: null,
      updated_at: now,
    };
    setSelectedPost(newPost);
    setIsEditing(true);
    setPreviewMode(false);
  };

  const handleAddTag = () => {
    if (newTag && selectedPost && !(selectedPost.tags ?? []).includes(newTag)) {
      setSelectedPost({
        ...selectedPost,
        tags: [...(selectedPost.tags ?? []), newTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        tags: (selectedPost.tags ?? []).filter((t) => t !== tagToRemove),
      });
    }
  };

  const upsertPost = useMutation({
    mutationFn: async (post: BlogPost) => {
      // Basic slug normalization.
      const nextSlug = slugify(post.slug || post.title || "post");

      // If slug changed, ensure uniqueness.
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", nextSlug)
        .maybeSingle();

      if (existing && existing.id !== post.id) {
        throw new Error("Slug already exists. Pick another one.");
      }

      const payload = {
        id: post.id,
        title: post.title,
        slug: nextSlug,
        excerpt: post.excerpt,
        content: post.content,
        hero_image: post.hero_image,
        tags: post.tags,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        is_published: !!post.is_published,
        is_premium: !!post.is_premium,
        published_at: post.is_published ? (post.published_at || new Date().toISOString()) : post.published_at,
      };

      const { data, error } = await supabase
        .from("blog_posts")
        .upsert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (saved) => {
      toast.success("Post saved.");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setSelectedPost(saved);
      setIsEditing(false);
    },
    onError: (err: unknown) => toast.error(errMsg(err, "Failed to save post.")),
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setSelectedPost(null);
      setIsEditing(false);
      setPreviewMode(false);
    },
    onError: (err: unknown) => toast.error(errMsg(err, "Failed to delete post.")),
  });

  const uploadHeroImage = async (file: File) => {
    if (!selectedPost) return;
    setUploadingHero(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `hero/${selectedPost.slug || selectedPost.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("blog-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("blog-assets").getPublicUrl(path);
      setSelectedPost((p) => (p ? { ...p, hero_image: data.publicUrl } : p));
      toast.success("Hero image uploaded.");
    } catch (err: unknown) {
      toast.error(errMsg(err, "Failed to upload image."));
    } finally {
      setUploadingHero(false);
    }
  };

  const uploadInlineImage = async (file: File) => {
    if (!selectedPost) return;
    setUploadingInline(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `inline/${selectedPost.slug || selectedPost.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("blog-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("blog-assets").getPublicUrl(path);

      const md = `\n\n![](${data.publicUrl})\n`;
      setSelectedPost((p) => {
        if (!p) return p;
        const current = p.content || "";
        const el = contentRef.current;
        if (el && typeof el.selectionStart === "number") {
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const next =
            current.slice(0, start) + md + current.slice(end);
          // Move cursor after inserted markdown.
          requestAnimationFrame(() => {
            try {
              el.focus();
              el.selectionStart = el.selectionEnd = start + md.length;
            } catch {
              // ignore
            }
          });
          return { ...p, content: next };
        }
        return { ...p, content: current + md };
      });

      toast.success("Inline image uploaded.");
    } catch (err: unknown) {
      toast.error(errMsg(err, "Failed to upload inline image."));
    } finally {
      setUploadingInline(false);
    }
  };

  const EditorToolbar = () => (
    <div className="flex items-center gap-1 p-2 bg-muted rounded-lg mb-2">
      {[
        { icon: Bold, label: "Bold" },
        { icon: Italic, label: "Italic" },
        { icon: Heading1, label: "H1" },
        { icon: Heading2, label: "H2" },
        { icon: List, label: "List" },
        { icon: Quote, label: "Quote" },
        { icon: Code, label: "Code" },
        { icon: Link2, label: "Link" },
        { icon: ImageIcon, label: "Image" },
        { icon: AlignLeft, label: "Align" },
      ].map((tool, index) => (
        <Button 
          key={index} 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-background" 
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </Button>
      ))}
      <label className="inline-flex ml-auto">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={!isEditing || uploadingInline}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadInlineImage(f);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-background"
          disabled={!isEditing || uploadingInline}
          title="Upload inline image"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {uploadingInline ? "Uploading..." : "Inline"}
        </Button>
      </label>
    </div>
  );

  if (!isUnlocked) {
    return (
      <>
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onSuccess={handleBiometricSuccess}
          title="Access CMS Studio"
          subtitle="Verify identity to manage blog content"
          moduleName="CMS STUDIO"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center border border-purple-500/30">
            <FileText className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">CMS Studio Protected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Biometric verification required to manage blog content
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Shield className="w-4 h-4 mr-2" />
            Verify Identity
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Publish Biometric Modal */}
      <BiometricVerificationModal
        isOpen={showPublishBiometric}
        onClose={() => {
          setShowPublishBiometric(false);
          setPendingPublish(false);
        }}
        onSuccess={handlePublishBiometricSuccess}
        title="Publish Content"
        subtitle="Verify identity to publish this post"
        moduleName="PUBLISH"
      />
      
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: stats.total, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, icon: Globe, color: "from-green-500 to-green-600" },
          { label: "Drafts", value: stats.drafts, icon: Clock, color: "from-amber-500 to-amber-600" },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: "from-purple-500 to-purple-600" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">All Posts</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {postsLoading ? (
              <div className="text-sm text-muted-foreground">Loading posts...</div>
            ) : null}
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setSelectedPost(post); setIsEditing(false); setActiveTab("content"); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPost?.id === post.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2">{post.title}</h4>
                  {post.is_premium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.is_published ? (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Published</Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Draft</Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" />{post.views ?? 0}
                  </span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {(post.tags ?? []).slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  {(post.tags ?? []).length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{(post.tags ?? []).length - 2}</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Post Editor */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {(["content", "seo", "settings"] as const).map(tab => (
                      <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? "bg-primary text-primary-foreground" : ""}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => selectedPost && deletePost.mutate(selectedPost.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          onClick={() => selectedPost && upsertPost.mutate(selectedPost)}
                          disabled={upsertPost.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {upsertPost.isPending ? "Saving..." : "Save"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                      <Input
                        value={selectedPost.title}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                        className="bg-background text-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Hero Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {selectedPost.hero_image ? (
                            <img src={selectedPost.hero_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        {isEditing && (
                          <label className="inline-flex">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingHero}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadHeroImage(f);
                              }}
                            />
                            <Button variant="outline" size="sm" disabled={uploadingHero}>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            {uploadingHero ? "Uploading..." : "Upload Image"}
                          </Button>
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Excerpt</label>
                      <Textarea
                        value={selectedPost.excerpt}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, excerpt: e.target.value })}
                        className="bg-background min-h-[80px]"
                        placeholder="Brief summary of the post..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
                      {isEditing ? (
                        <>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <EditorToolbar />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewMode((v) => !v)}
                            >
                              {previewMode ? "Edit" : "Preview"}
                            </Button>
                          </div>
                          {previewMode ? (
                            <div className="rounded-xl border border-border bg-background p-4 min-h-[300px]">
                              <Markdown value={selectedPost.content || ""} />
                            </div>
                          ) : (
                            <Textarea
                              value={selectedPost.content || ""}
                              onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
                              ref={(el) => {
                                // shadcn Textarea forwards ref to the DOM element.
                                contentRef.current = el;
                              }}
                              className="bg-background min-h-[300px] font-mono text-sm"
                              placeholder="Write your post content in Markdown..."
                            />
                          )}
                        </>
                      ) : (
                        <div className="rounded-xl border border-border bg-background p-4 min-h-[300px]">
                          <Markdown value={selectedPost.content || ""} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedPost.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            {isEditing && (
                              <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add tag..."
                            className="bg-background flex-1"
                            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                          />
                          <Button variant="outline" size="sm" onClick={handleAddTag}>
                            <Tag className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === "seo" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Slug</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">abhishekpanda.com/blog/</span>
                        <Input
                          value={selectedPost.slug}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedPost({ ...selectedPost, slug: e.target.value })}
                          className="bg-background flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Meta Title</label>
                        <Input
                          value={selectedPost.meta_title || ""}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedPost({ ...selectedPost, meta_title: e.target.value })}
                          className="bg-background"
                          placeholder="SEO-optimized title (60 chars max)"
                        />
                      <p className="text-xs text-muted-foreground mt-1">{(selectedPost.meta_title || "").length}/60 characters</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Meta Description</label>
                      <Textarea
                        value={selectedPost.meta_description || ""}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPost({ ...selectedPost, meta_description: e.target.value })}
                        className="bg-background min-h-[100px]"
                        placeholder="SEO description (160 chars max)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{(selectedPost.meta_description || "").length}/160 characters</p>
                    </div>

                    {/* SEO Preview */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Google Preview</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm truncate">
                        {selectedPost.meta_title || selectedPost.title}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-xs truncate">
                        abhishekpanda.com/blog/{selectedPost.slug}
                      </p>
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                        {selectedPost.meta_description || selectedPost.excerpt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Publish Status</p>
                          <p className="text-sm text-muted-foreground">Requires biometric verification to publish</p>
                        </div>
                      </div>
                      <Switch
                        checked={!!selectedPost.is_published}
                        disabled={!isEditing}
                        onCheckedChange={handlePublishToggle}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Premium Content</p>
                        <p className="text-sm text-muted-foreground">Require payment to access full content</p>
                      </div>
                      <Switch
                        checked={!!selectedPost.is_premium}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => setSelectedPost({ ...selectedPost, is_premium: checked })}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-foreground mb-3">Post Information</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="text-foreground font-medium">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Published</p>
                          <p className="text-foreground font-medium">{selectedPost.published_at ? new Date(selectedPost.published_at).toLocaleDateString() : "Not published"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="text-foreground font-medium">{(selectedPost.views ?? 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Post ID</p>
                          <p className="text-foreground font-medium font-mono text-xs">{selectedPost.id}</p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => selectedPost && deletePost.mutate(selectedPost.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] flex items-center justify-center bg-card border border-border rounded-xl"
              >
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Post Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a post from the list or create a new one</p>
                  <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
};
