import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Tag,
  Image as ImageIcon,
  X,
  Lock,
  Globe,
  Clock,
  TrendingUp,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  Maximize2,
  Minimize2
} from "lucide-react";
import { getDefaultReactSlashMenuItems, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/style.css";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  section_id: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean | null;
  is_premium: boolean | null;
  is_locked: boolean | null;
  code_theme: string | null;
  color: string | null;
  views: number | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
  sort_order?: number | null;
};

type BlogSection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sort_order?: number | null;
};

type BlogPostVersion = {
  id: string;
  created_at: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  hero_image: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  section_id: string | null;
  color: string | null;
  code_theme: string | null;
  is_locked: boolean | null;
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const LEGACY_CODE_THEMES = new Set([
  "github-light",
  "github-light-default",
  "github-light-high-contrast",
  "github-dark",
  "github-dark-default",
  "github-dark-dimmed",
  "github-dark-high-contrast",
]);

const normalizePersistedCodeTheme = (theme: string | null | undefined) => {
  if (!theme) return "github-light";
  return LEGACY_CODE_THEMES.has(theme) ? theme : "github-light";
};

export const AdminBlogManager = () => {
  const qc = useQueryClient();
  const codeLanguages = useMemo(
    () => ({
      text: { name: "Plain Text" },
      javascript: { name: "JavaScript", aliases: ["js"] },
      typescript: { name: "TypeScript", aliases: ["ts"] },
      jsx: { name: "JSX" },
      tsx: { name: "TSX" },
      python: { name: "Python", aliases: ["py"] },
      java: { name: "Java" },
      c: { name: "C" },
      cpp: { name: "C++" },
      csharp: { name: "C#" },
      go: { name: "Go" },
      rust: { name: "Rust" },
      bash: { name: "Bash" },
      json: { name: "JSON" },
      yaml: { name: "YAML" },
      markdown: { name: "Markdown", aliases: ["md"] },
      html: { name: "HTML" },
      css: { name: "CSS" },
      sql: { name: "SQL" },
    }),
    [],
  );
  const codeThemes = useMemo(
    () => [
      { id: "github-light", label: "GitHub Light" },
      { id: "github-light-default", label: "GitHub Light Default" },
      { id: "github-light-high-contrast", label: "GitHub Light High Contrast" },
      { id: "github-dark", label: "GitHub Dark" },
      { id: "github-dark-default", label: "GitHub Dark Default" },
      { id: "github-dark-dimmed", label: "GitHub Dark Dimmed" },
      { id: "github-dark-high-contrast", label: "GitHub Dark High Contrast" },
      { id: "one-dark-pro", label: "One Dark Pro" },
      { id: "dracula", label: "Dracula" },
      { id: "dracula-soft", label: "Dracula Soft" },
      { id: "tokyo-night", label: "Tokyo Night" },
      { id: "nord", label: "Nord" },
      { id: "material-theme", label: "Material Theme" },
      { id: "material-theme-darker", label: "Material Theme Darker" },
      { id: "material-theme-ocean", label: "Material Theme Ocean" },
      { id: "material-theme-palenight", label: "Material Theme Palenight" },
      { id: "vitesse-dark", label: "Vitesse Dark" },
      { id: "vitesse-light", label: "Vitesse Light" },
      { id: "catppuccin-latte", label: "Catppuccin Latte" },
      { id: "catppuccin-frappe", label: "Catppuccin Frappe" },
      { id: "catppuccin-macchiato", label: "Catppuccin Macchiato" },
      { id: "catppuccin-mocha", label: "Catppuccin Mocha" },
    ],
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [heroPreviewOpen, setHeroPreviewOpen] = useState(false);
  const [publishPreviewOpen, setPublishPreviewOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffVersion, setDiffVersion] = useState<BlogPostVersion | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const heroFileRef = useRef<HTMLInputElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragPostId, setDragPostId] = useState<string | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const editorHydrationKeyRef = useRef<string | null>(null);
  const sectionErrorRef = useRef(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const errMsg = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string") {
      return (err as any).message;
    }
    return fallback;
  };

  const handlePublishApprove = async () => {
    if (!selectedPost) return;
    await upsertPost.mutateAsync({
      ...selectedPost,
      is_published: true,
      published_at: selectedPost.published_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setPublishPreviewOpen(false);
  };

  const handleExportPdf = () => {
    if (!selectedPost || !exportRef.current) return;
    const html = exportRef.current.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${selectedPost.title}</title>
          <style>
            body { font-family: Inter, ui-sans-serif, system-ui; padding: 32px; color: #0f172a; }
            h1 { font-size: 32px; margin-bottom: 8px; }
            .excerpt { color: #475569; margin-bottom: 24px; }
            pre { background: #f1f5f9; padding: 12px; border-radius: 10px; overflow-x: auto; }
            code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
            img { max-width: 100%; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; }
            a { color: #2563eb; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleExportEpub = async () => {
    if (!selectedPost || !exportRef.current) return;
    const { default: JSZip } = await import("jszip");
    const htmlBody = exportRef.current.innerHTML;
    const title = selectedPost.title || "Untitled";

    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.folder("META-INF")?.file(
      "container.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`
    );
    const oebps = zip.folder("OEBPS");
    oebps?.file(
      "content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
      <package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:identifier id="book-id">${selectedPost.id}</dc:identifier>
          <dc:title>${title}</dc:title>
          <dc:language>en</dc:language>
        </metadata>
        <manifest>
          <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
          <item id="style" href="styles.css" media-type="text/css"/>
        </manifest>
        <spine>
          <itemref idref="content"/>
        </spine>
      </package>`
    );
    oebps?.file(
      "styles.css",
      `body { font-family: "Georgia", "Times New Roman", serif; color: #111827; line-height: 1.7; padding: 24px; }
      h1 { font-size: 28px; margin-bottom: 12px; }
      .excerpt { color: #6b7280; margin-bottom: 20px; }
      pre { background: #f3f4f6; padding: 12px; border-radius: 10px; overflow-x: auto; }
      code { font-family: "SF Mono", Menlo, Consolas, monospace; }
      img { max-width: 100%; border-radius: 12px; }`
    );
    oebps?.file(
      "content.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>${title}</title>
          <link rel="stylesheet" type="text/css" href="styles.css"/>
        </head>
        <body>
          ${htmlBody}
        </body>
      </html>`
    );
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.epub`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  const { data: sectionsData = [] } = useQuery({
    queryKey: ["admin-blog-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_sections")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) {
        if (!sectionErrorRef.current) {
          sectionErrorRef.current = true;
          setSectionsError(error.message || "Blog sections table missing.");
          toast.error("Blog sections table missing. Run `supabase db push`.");
        }
        return [];
      }
      return (data ?? []) as BlogSection[];
    },
    retry: false,
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["admin-blog-versions", selectedPost?.id],
    enabled: !!selectedPost?.id,
    queryFn: async () => {
      if (!selectedPost?.id) return [];
      const { data, error } = await supabase
        .from("blog_post_versions")
        .select("*")
        .eq("post_id", selectedPost.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as BlogPostVersion[];
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

  const sections = useMemo(() => {
    return [{ id: "all", name: "All", color: "#94a3b8" }, ...sectionsData];
  }, [sectionsData]);

  const postsBySection = useMemo(() => {
    if (selectedSection === "all") return filteredPosts;
    return filteredPosts.filter((p) => p.section_id === selectedSection);
  }, [filteredPosts, selectedSection]);

  const diffPairs = useMemo(() => {
    if (!diffVersion || !selectedPost) return [];
    const before = (diffVersion.content || "").split("\n");
    const after = (selectedPost.content || "").split("\n");
    const max = Math.max(before.length, after.length);
    const rows = [];
    for (let i = 0; i < max; i += 1) {
      rows.push({
        before: before[i] ?? "",
        after: after[i] ?? "",
        changed: (before[i] ?? "") !== (after[i] ?? ""),
      });
    }
    return rows;
  }, [diffVersion, selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;
    if (selectedSection === "all") return;
    if (selectedPost.section_id === selectedSection) return;
    if (postsBySection.length > 0) {
      setSelectedPost(postsBySection[0]);
      setIsEditing(false);
      setActiveTab("content");
    }
  }, [selectedSection, postsBySection, selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;
    const isPersisted = posts.some((p) => p.id === selectedPost.id);
    if (isPersisted) {
      setLastSavedAt(selectedPost.updated_at || null);
      setHasUnsavedChanges(false);
    } else {
      setLastSavedAt(null);
      setHasUnsavedChanges(true);
    }
  }, [selectedPost?.id, posts]);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => !!p.is_published).length,
    drafts: posts.filter((p) => !p.is_published).length,
    totalViews: posts.reduce((sum, p) => sum + (p.views ?? 0), 0),
  };

  const handleCreatePost = () => {
    const now = new Date().toISOString();
    const defaultSectionId =
      selectedSection !== "all"
        ? selectedSection
        : sectionsData[0]?.id || null;
    const defaultSectionColor =
      sectionsData.find((s) => s.id === defaultSectionId)?.color || null;
    const newPost: BlogPost = {
      id: crypto.randomUUID(),
      title: "Untitled Post",
      slug: "untitled-post",
      excerpt: "",
      content: "",
      hero_image: null,
      section_id: defaultSectionId,
      tags: [],
      meta_title: "",
      meta_description: "",
      is_published: false,
      is_premium: false,
      is_locked: false,
      code_theme: "github-light",
      color: defaultSectionColor,
      views: 0,
      created_at: now,
      published_at: null,
      updated_at: now,
      sort_order: posts.length + 1,
    };
    setSelectedPost(newPost);
    setIsEditing(true);
    setHasUnsavedChanges(true);
    setSelectedSection("all");
    setIsFocusMode(false);
    setIsSidebarCollapsed(false);
  };

  const handleRenameSection = async (section: BlogSection) => {
    const name = window.prompt("Rename section", section.name);
    if (!name || name.trim() === section.name) return;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const { error } = await supabase
      .from("blog_sections")
      .update({ name: name.trim(), slug })
      .eq("id", section.id);
    if (error) {
      toast.error(error.message || "Failed to rename section");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-blog-sections"] });
    toast.success("Section renamed");
  };

  const handleDeleteSection = async (section: BlogSection) => {
    const ok = window.confirm(`Delete section "${section.name}"? Posts will be unassigned.`);
    if (!ok) return;
    const { error: clearErr } = await supabase
      .from("blog_posts")
      .update({ section_id: null })
      .eq("section_id", section.id);
    if (clearErr) {
      toast.error(clearErr.message || "Failed to unassign posts");
      return;
    }
    const { error } = await supabase.from("blog_sections").delete().eq("id", section.id);
    if (error) {
      toast.error(error.message || "Failed to delete section");
      return;
    }
    if (selectedSection === section.id) {
      setSelectedSection("all");
    }
    qc.invalidateQueries({ queryKey: ["admin-blog-sections"] });
    qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    toast.success("Section deleted");
  };

  const restoreVersion = async (version: BlogPostVersion) => {
    if (!selectedPost) return;
    const restored: BlogPost = {
      ...selectedPost,
      title: version.title || selectedPost.title,
      excerpt: version.excerpt || "",
      content: version.content || "",
      hero_image: version.hero_image || null,
      tags: version.tags || [],
      meta_title: version.meta_title || "",
      meta_description: version.meta_description || "",
      section_id: version.section_id || null,
      color: version.color || null,
      code_theme: version.code_theme || "github-light",
      is_locked: version.is_locked ?? selectedPost?.is_locked ?? false,
    };
    setSelectedPost(restored);
    setIsEditing(true);
    setActiveTab("content");
    setHasUnsavedChanges(true);
    try {
      const blocks = await editor.tryParseMarkdownToBlocks(restored.content || "");
      editor.replaceBlocks(editor.document, blocks);
    } catch {
      // ignore
    }
  };

  const persistSectionOrder = async (ordered: BlogSection[]) => {
    const updates = ordered.map((s, idx) => ({ id: s.id, sort_order: idx + 1 }));
    await supabase.from("blog_sections").upsert(updates);
    qc.invalidateQueries({ queryKey: ["admin-blog-sections"] });
  };

  const moveSection = async (sectionId: string, direction: "up" | "down") => {
    const current = sectionsData
      .filter((s) => s.id !== "all")
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const index = current.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    const temp = next[index];
    next[index] = next[swapWith];
    next[swapWith] = temp;
    await persistSectionOrder(next);
  };

  const persistPostOrder = async (ordered: BlogPost[]) => {
    const updates = ordered.map((p, idx) => ({ id: p.id, sort_order: idx + 1 }));
    await supabase.from("blog_posts").upsert(updates);
    qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  const movePostToSection = async (postId: string, sectionId: string | null) => {
    const post = posts.find((p) => p.id === postId) || null;
    if (!post) {
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, section_id: sectionId === "all" ? null : sectionId });
      }
      return;
    }
    const nextSectionId = sectionId === "all" ? null : sectionId;
    setSelectedPost((prev) => (prev?.id === postId ? { ...prev, section_id: nextSectionId } : prev));
    const { error } = await supabase
      .from("blog_posts")
      .update({ section_id: nextSectionId })
      .eq("id", postId);
    if (error) {
      toast.error(error.message || "Failed to move page.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  const handleAddTag = () => {
    if (newTag && selectedPost && !(selectedPost.tags ?? []).includes(newTag)) {
      const nextPost = {
        ...selectedPost,
        tags: [...(selectedPost.tags ?? []), newTag],
      };
      setSelectedPost(nextPost);
      setHasUnsavedChanges(true);
      scheduleAutosave(nextPost);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedPost) {
      const nextPost = {
        ...selectedPost,
        tags: (selectedPost.tags ?? []).filter((t) => t !== tagToRemove),
      };
      setSelectedPost(nextPost);
      setHasUnsavedChanges(true);
      scheduleAutosave(nextPost);
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
        section_id: post.section_id,
        tags: post.tags,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        is_published: !!post.is_published,
        is_premium: !!post.is_premium,
        is_locked: !!post.is_locked,
        code_theme: normalizePersistedCodeTheme(post.code_theme),
        published_at: post.is_published ? (post.published_at || new Date().toISOString()) : post.published_at,
        sort_order: post.sort_order ?? 0,
        color: post.color || null,
      };

      let { data, error } = await supabase
        .from("blog_posts")
        .upsert(payload)
        .select("*")
        .single();
      if (error) {
        const isColumnMismatch =
          (error as any)?.code === "42703" ||
          /column .* does not exist/i.test(error.message || "");
        if (isColumnMismatch) {
          const legacyPayload = {
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
          const retry = await supabase
            .from("blog_posts")
            .upsert(legacyPayload)
            .select("*")
            .single();
          data = retry.data;
          error = retry.error;
        }
      }
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (saved) => {
      toast.success("Post saved.");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-versions", saved.id] });
      setSelectedPost(saved);
      setLastSavedAt(new Date().toISOString());
      setHasUnsavedChanges(false);
    },
    onError: (err: unknown) => toast.error(errMsg(err, "Failed to save post.")),
  });

  const autosavePost = useMutation({
    mutationFn: async (post: BlogPost) => {
      const payload = {
        id: post.id,
        title: post.title,
        slug: slugify(post.slug || post.title || "post"),
        excerpt: post.excerpt,
        content: post.content,
        hero_image: post.hero_image,
        section_id: post.section_id,
        tags: post.tags,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        is_published: !!post.is_published,
        is_premium: !!post.is_premium,
        is_locked: !!post.is_locked,
        code_theme: normalizePersistedCodeTheme(post.code_theme),
        published_at: post.is_published ? (post.published_at || new Date().toISOString()) : post.published_at,
        sort_order: post.sort_order ?? 0,
        color: post.color || null,
      };
      let { data, error } = await supabase
        .from("blog_posts")
        .upsert(payload)
        .select("*")
        .single();
      if (error) {
        const isColumnMismatch =
          (error as any)?.code === "42703" ||
          /column .* does not exist/i.test(error.message || "");
        if (isColumnMismatch) {
          const legacyPayload = {
            id: post.id,
            title: post.title,
            slug: slugify(post.slug || post.title || "post"),
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
          const retry = await supabase
            .from("blog_posts")
            .upsert(legacyPayload)
            .select("*")
            .single();
          data = retry.data;
          error = retry.error;
        }
      }
      if (error) throw error;
      await supabase.from("blog_post_versions").insert({
        post_id: payload.id,
        title: payload.title,
        excerpt: payload.excerpt,
        content: payload.content,
        hero_image: payload.hero_image,
        tags: payload.tags,
        meta_title: payload.meta_title,
        meta_description: payload.meta_description,
        section_id: payload.section_id,
        color: payload.color,
        code_theme: payload.code_theme,
        is_locked: payload.is_locked,
      });
      return data as BlogPost;
    },
    onMutate: () => {
      setIsAutosaving(true);
    },
    onSuccess: (saved) => {
      setIsAutosaving(false);
      setLastSavedAt(new Date().toISOString());
      setHasUnsavedChanges(false);
      setSelectedPost(saved);
    },
    onError: () => {
      setIsAutosaving(false);
    },
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
      if (selectedPost) {
        const nextPost = { ...selectedPost, hero_image: data.publicUrl };
        setSelectedPost(nextPost);
        setHasUnsavedChanges(true);
        scheduleAutosave(nextPost);
      }
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
      toast.success("Inline image uploaded.");
      return data.publicUrl;
    } catch (err: unknown) {
      toast.error(errMsg(err, "Failed to upload inline image."));
      return null;
    } finally {
      setUploadingInline(false);
    }
  };

  const codeTheme = selectedPost?.code_theme || "github-light";
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const url = await uploadInlineImage(file);
      if (!url) throw new Error("Upload failed");
      return url;
    },
    tables: {
      headers: true,
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
    },
    codeBlock: {
      defaultLanguage: "text",
      supportedLanguages: codeLanguages,
      createHighlighter: async () => {
        const { getHighlighter } = await import("shiki");
        return getHighlighter({
          themes: [codeTheme],
          langs: Object.keys(codeLanguages),
        });
      },
    },
  }, [codeTheme]);

  useEffect(() => {
    if (!selectedPost) return;
    const hydrationKey = `${selectedPost.id}:${codeTheme}`;
    if (editorHydrationKeyRef.current === hydrationKey) return;
    (async () => {
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(selectedPost.content || "");
        editor.replaceBlocks(editor.document, blocks);
        editorHydrationKeyRef.current = hydrationKey;
      } catch {
        // ignore
      }
    })();
  }, [selectedPost?.id, codeTheme, editor]);

  const scheduleAutosave = (post: BlogPost) => {
    if (!isEditing) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(async () => {
      try {
        await autosavePost.mutateAsync({
          ...post,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // ignore autosave errors
      }
    }, 2000);
  };

  const handleEditorChange = async () => {
    if (!isEditing || !selectedPost) return;
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      if ((selectedPost.content || "") === md) return;
      const nextPost = { ...selectedPost, content: md };
      setSelectedPost(nextPost);
      setHasUnsavedChanges(true);
      scheduleAutosave(nextPost);
    } catch {
      // ignore
    }
  };

  return (
    <>
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

      <div
        className={`grid grid-cols-1 gap-6 ${
          isFocusMode
            ? "lg:grid-cols-1"
            : isSidebarCollapsed
            ? "lg:grid-cols-[320px_1fr]"
            : "lg:grid-cols-[260px_320px_1fr]"
        }`}
      >
        {/* Sections */}
        {!isSidebarCollapsed && !isFocusMode ? (
          <div className="space-y-4 pr-4 border-r border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Sections</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    const name = window.prompt("New section name");
                    if (!name) return;
                    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    const color = "#2563eb";
                    const { data, error } = await supabase
                      .from("blog_sections")
                      .insert({ name, slug, color })
                      .select("*")
                      .single();
                    if (error) {
                      toast.error(error.message || "Failed to create section");
                      return;
                    }
                    qc.invalidateQueries({ queryKey: ["admin-blog-sections"] });
                    if (data?.id) setSelectedSection(data.id);
                  }}
                  title="New section"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => setIsSidebarCollapsed(true)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-2">
              {sectionsError ? (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                  {sectionsError}
                </div>
              ) : null}
              {sections.map((section) => (
                <button
                  key={section.id}
                  draggable={section.id !== "all"}
                  onDragStart={() => setDragSectionId(section.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragPostId) return;
                    if (!dragSectionId || dragSectionId === section.id || section.id === "all") return;
                    const current = sections.filter((s) => s.id !== "all");
                    const from = current.findIndex((s) => s.id === dragSectionId);
                    const to = current.findIndex((s) => s.id === section.id);
                    if (from === -1 || to === -1) return;
                    const next = [...current];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    persistSectionOrder(next);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!dragPostId) return;
                    movePostToSection(dragPostId, section.id);
                    setDragPostId(null);
                  }}
                  onDragEnd={() => setDragSectionId(null)}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition ${
                    selectedSection === section.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: (section as BlogSection).color || "#2563eb" }}
                      />
                      <span>{section.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {section.id === "all"
                          ? posts.length
                          : posts.filter((p) => p.section_id === section.id).length}
                      </span>
                      {section.id !== "all" ? (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "up");
                            }}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "down");
                            }}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameSection(section as BlogSection);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <input
                            type="color"
                            value={(section as BlogSection).color || "#2563eb"}
                            className="h-6 w-6 rounded border border-border bg-transparent p-0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={async (e) => {
                              e.stopPropagation();
                              const { error } = await supabase
                                .from("blog_sections")
                                .update({ color: e.target.value })
                                .eq("id", section.id);
                              if (error) {
                                toast.error(error.message || "Failed to update color");
                                return;
                              }
                              qc.invalidateQueries({ queryKey: ["admin-blog-sections"] });
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(section as BlogSection);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Pages */}
        {!isFocusMode ? (
          <div className={`space-y-4 ${!isSidebarCollapsed ? "pl-4 pr-4 border-r border-border" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Pages</h3>
              </div>
              {isSidebarCollapsed ? (
                <Button type="button" size="icon" variant="ghost" onClick={() => setIsSidebarCollapsed(false)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-2">
              {postsLoading ? (
                <div className="text-sm text-muted-foreground">Loading posts...</div>
              ) : null}
              {selectedPost && !posts.find((p) => p.id === selectedPost.id) ? (
                <div className="p-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-2">{selectedPost.title}</h4>
                    <Badge className="text-xs bg-amber-100 text-amber-700 border-0">Unsaved</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{selectedPost.excerpt}</p>
                </div>
              ) : null}
              {postsBySection.map((post) => (
                <motion.div
                  key={post.id}
                  draggable
                  onDragStart={() => setDragPostId(post.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!dragPostId || dragPostId === post.id) return;
                    const from = postsBySection.findIndex((p) => p.id === dragPostId);
                    const to = postsBySection.findIndex((p) => p.id === post.id);
                    if (from === -1 || to === -1) return;
                    const next = [...postsBySection];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    persistPostOrder(next);
                  }}
                  onDragEnd={() => setDragPostId(null)}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedPost(post);
                    setIsEditing(false);
                    setActiveTab("content");
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPost?.id === post.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor:
                      post.color ||
                      sectionsData.find((s) => s.id === post.section_id)?.color ||
                      "#94a3b8",
                  }}
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
                    {(post.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Post Editor */}
        <div className={isFocusMode ? "col-span-full w-full" : "lg:col-span-1"}>
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-card border border-border rounded-xl p-6 shadow-sm ${isFocusMode ? "w-full" : ""}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
                    <div className="text-xs text-muted-foreground">
                      {isAutosaving
                        ? "Autosaving..."
                        : hasUnsavedChanges
                        ? "Unsaved changes"
                        : lastSavedAt
                        ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                        : "Autosave on"}
                    </div>
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedPost.is_locked) return;
                            setIsEditing(true);
                          }}
                          disabled={!!selectedPost.is_locked}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {selectedPost.is_locked ? (
                          <Badge className="bg-amber-100 text-amber-700 border-0">Locked</Badge>
                        ) : null}
                        {selectedPost.is_locked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nextPost = { ...selectedPost, is_locked: false };
                              setSelectedPost(nextPost);
                              setHasUnsavedChanges(true);
                              scheduleAutosave(nextPost);
                            }}
                          >
                            Unlock
                          </Button>
                        ) : null}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => selectedPost && deletePost.mutate(selectedPost.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPdf}>
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportEpub}>
                          Export EPUB
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
                          onClick={() => setPublishPreviewOpen(true)}
                          disabled={!selectedPost}
                        >
                          Publish
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setIsFocusMode((v) => !v)}
                        >
                          {isFocusMode ? (
                            <>
                              <Minimize2 className="w-4 h-4 mr-2" />
                              Exit Focus
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-4 h-4 mr-2" />
                              Focus
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPdf}>
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportEpub}>
                          Export EPUB
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
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, title: e.target.value };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
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
                        <div className="flex items-center gap-2">
                          <input
                            ref={heroFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingHero}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadHeroImage(f);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingHero}
                            onClick={() => heroFileRef.current?.click()}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            {uploadingHero ? "Uploading..." : "Upload Image"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {selectedPost.hero_image ? (
                      <div className="mt-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setHeroPreviewOpen(true)}>
                          Preview Hero
                        </Button>
                      </div>
                    ) : null}
                  </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Excerpt</label>
                      <Textarea
                        value={selectedPost.excerpt}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, excerpt: e.target.value };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                        className="bg-background min-h-[80px]"
                        placeholder="Brief summary of the post..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
                      {isEditing ? (
                        <div className="rounded-xl border border-border bg-white text-slate-900 p-2 min-h-[75vh] w-full notion-editor">
                          <BlockNoteView
                            editor={editor}
                            editable={isEditing && !selectedPost.is_locked}
                            onChange={handleEditorChange}
                            theme="light"
                            slashMenuItems={getDefaultReactSlashMenuItems(editor)}
                          />
                          {selectedPost.is_locked ? (
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                              This post is locked. Unlock it in Settings to edit.
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border bg-background p-4 min-h-[300px]">
                          <Markdown
                            value={selectedPost.content || ""}
                            codeTheme={selectedPost.code_theme || "github-light"}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(selectedPost.tags ?? []).map(tag => (
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
                          onChange={(e) => {
                            const nextPost = { ...selectedPost, slug: e.target.value };
                            setSelectedPost(nextPost);
                            setHasUnsavedChanges(true);
                            scheduleAutosave(nextPost);
                          }}
                          className="bg-background flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Meta Title</label>
                        <Input
                          value={selectedPost.meta_title || ""}
                          disabled={!isEditing}
                          onChange={(e) => {
                            const nextPost = { ...selectedPost, meta_title: e.target.value };
                            setSelectedPost(nextPost);
                            setHasUnsavedChanges(true);
                            scheduleAutosave(nextPost);
                          }}
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
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, meta_description: e.target.value };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
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
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">Section</p>
                        <p className="text-sm text-muted-foreground">Group this post under a main topic</p>
                      </div>
                      <select
                        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                        value={selectedPost.section_id || ""}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, section_id: e.target.value || null };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                      >
                        <option value="">No section</option>
                        {sectionsData.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Publish Status</p>
                          <p className="text-sm text-muted-foreground">Preview before publishing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={selectedPost.is_published ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}>
                          {selectedPost.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setPublishPreviewOpen(true)}
                          disabled={!isEditing}
                        >
                          Preview & Publish
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Premium Content</p>
                        <p className="text-sm text-muted-foreground">Require payment to access full content</p>
                      </div>
                      <Switch
                        checked={!!selectedPost.is_premium}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => {
                          const nextPost = { ...selectedPost, is_premium: checked };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-amber-500/20">
                      <div>
                        <p className="font-medium text-foreground">Lock Post</p>
                        <p className="text-sm text-muted-foreground">Make this post read-only</p>
                      </div>
                      <Switch
                        checked={!!selectedPost.is_locked}
                        disabled={!isEditing && !selectedPost.is_locked}
                        onCheckedChange={(checked) => {
                          const nextPost = { ...selectedPost, is_locked: checked };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Page Color</p>
                        <p className="text-sm text-muted-foreground">Color for this page card</p>
                      </div>
                      <input
                        type="color"
                        value={selectedPost.color || "#2563eb"}
                        disabled={!isEditing}
                        className="h-10 w-12 rounded border border-border bg-transparent p-0"
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, color: e.target.value };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Code Theme</p>
                        <p className="text-sm text-muted-foreground">Syntax highlighting style for this post</p>
                      </div>
                      <select
                        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                        value={selectedPost.code_theme || "github-light"}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const nextPost = { ...selectedPost, code_theme: e.target.value };
                          setSelectedPost(nextPost);
                          setHasUnsavedChanges(true);
                          scheduleAutosave(nextPost);
                        }}
                      >
                        {codeThemes.map((theme) => (
                          <option key={theme.id} value={theme.id}>
                            {theme.label}
                          </option>
                        ))}
                      </select>
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

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-foreground mb-3">Version History</p>
                      {versions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No versions yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                              <span className="text-muted-foreground">
                                {new Date(v.created_at).toLocaleString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDiffVersion(v);
                                    setDiffOpen(true);
                                  }}
                                >
                                  Diff
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => restoreVersion(v)}>
                                  Restore
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
    <Dialog open={heroPreviewOpen} onOpenChange={setHeroPreviewOpen}>
      <DialogContent className="max-w-3xl bg-background border-border">
        <DialogHeader>
          <DialogTitle>Hero Preview</DialogTitle>
        </DialogHeader>
        {selectedPost?.hero_image ? (
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={selectedPost.hero_image} alt="" className="w-full h-80 object-cover" />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hero image selected.</div>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={publishPreviewOpen} onOpenChange={setPublishPreviewOpen}>
      <DialogContent className="max-w-4xl bg-background border-border">
        <DialogHeader>
          <DialogTitle>Preview Before Publish</DialogTitle>
        </DialogHeader>
        {selectedPost ? (
          <div className="space-y-4">
            {selectedPost.hero_image ? (
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={selectedPost.hero_image} alt="" className="w-full h-56 object-cover" />
              </div>
            ) : null}
            <div>
              <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
              {selectedPost.excerpt ? (
                <p className="text-muted-foreground mt-2">{selectedPost.excerpt}</p>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-background p-4 max-h-[60vh] overflow-auto">
              <Markdown
                value={selectedPost.content || ""}
                codeTheme={selectedPost.code_theme || "github-light"}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPublishPreviewOpen(false)}>
                Edit
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                onClick={handlePublishApprove}
                disabled={upsertPost.isPending}
              >
                {upsertPost.isPending ? "Publishing..." : "Approve & Publish"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>

    <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
      <DialogContent className="max-w-5xl bg-background border-border">
        <DialogHeader>
          <DialogTitle>Version Diff</DialogTitle>
        </DialogHeader>
        {diffVersion && selectedPost ? (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Comparing version from {new Date(diffVersion.created_at).toLocaleString()} to current draft
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-muted/30 p-3 max-h-[60vh] overflow-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Version</div>
                <pre className="text-xs whitespace-pre-wrap">
                  {diffPairs.map((row, idx) => (
                    <div
                      key={`v-${idx}`}
                      className={row.changed ? "bg-red-500/10 text-red-700 dark:text-red-300" : ""}
                    >
                      {row.before || " "}
                    </div>
                  ))}
                </pre>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3 max-h-[60vh] overflow-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Current</div>
                <pre className="text-xs whitespace-pre-wrap">
                  {diffPairs.map((row, idx) => (
                    <div
                      key={`c-${idx}`}
                      className={row.changed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ""}
                    >
                      {row.after || " "}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
    <div className="hidden">
      <div ref={exportRef} className="prose prose-neutral max-w-none">
        {selectedPost?.hero_image ? (
          <img src={selectedPost.hero_image} alt="" />
        ) : null}
        <h1>{selectedPost?.title}</h1>
        {selectedPost?.excerpt ? <p className="excerpt">{selectedPost.excerpt}</p> : null}
        <Markdown
          value={selectedPost?.content || ""}
          codeTheme={selectedPost?.code_theme || "github-light"}
        />
      </div>
    </div>
    </>
  );
};
