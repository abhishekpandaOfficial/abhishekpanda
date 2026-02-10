import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Save,
  BookOpen,
  Upload,
  Globe,
  Lock,
  Eye,
  Star,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type EbookRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  level: string;
  is_free: boolean;
  is_coming_soon: boolean;
  is_featured: boolean;
  is_published: boolean;
  price_in_inr: number | null;
  cover_image_url: string | null;
  preview_pdf_url: string | null;
  epub_url: string | null;
  pdf_url: string | null;
  toc_json: any;
  tech_stack: string[];
  libraries: string[];
  sections?: ("featured" | "interview" | "architect")[];
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  "DOTNET_ARCHITECT",
  "SOLID_DESIGN_PATTERNS",
  "INTERVIEW",
  "KAFKA",
  "AI_LLM",
  "ROADMAP",
];

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ARCHITECT"];

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const AdminEbooksManager = () => {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<EbookRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const errMsg = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const { data: ebooks = [], isLoading } = useQuery({
    queryKey: ["admin-ebooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EbookRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ebooks;
    return ebooks.filter((e) =>
      [e.title, e.subtitle, e.slug, (e.tech_stack || []).join(" "), (e.libraries || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [ebooks, searchQuery]);

  const createNew = () => {
    const now = new Date().toISOString();
    const draft: EbookRow = {
      id: crypto.randomUUID(),
      slug: "untitled-ebook",
      title: "Untitled Ebook",
      subtitle: "",
      description: "",
      category: CATEGORIES[0],
      level: LEVELS[0],
      is_free: true,
      is_coming_soon: false,
      is_featured: false,
      is_published: false,
      price_in_inr: null,
      cover_image_url: null,
      preview_pdf_url: null,
      epub_url: null,
      pdf_url: null,
      toc_json: [],
      tech_stack: [],
      libraries: [],
      created_at: now,
      updated_at: now,
    };
    setSelected(draft);
    setIsEditing(true);
  };

  const upsert = useMutation({
    mutationFn: async (row: EbookRow) => {
      const nextSlug = slugify(row.slug || row.title || "ebook");
      const derivedSections = [
        ...(row.is_featured ? (["featured"] as const) : []),
        ...(row.category === "INTERVIEW" ? (["interview"] as const) : []),
        ...(row.category === "DOTNET_ARCHITECT" || row.category === "SOLID_DESIGN_PATTERNS"
          ? (["architect"] as const)
          : []),
      ];
      const payload = {
        id: row.id,
        slug: nextSlug,
        title: row.title,
        subtitle: row.subtitle,
        description: row.description,
        category: row.category,
        level: row.level,
        is_free: row.is_free,
        is_coming_soon: row.is_coming_soon,
        is_featured: row.is_featured ?? (Array.isArray(row.sections) ? row.sections.includes("featured") : false),
        is_published: row.is_published,
        price_in_inr: row.price_in_inr,
        cover_image_url: row.cover_image_url,
        preview_pdf_url: row.preview_pdf_url,
        epub_url: row.epub_url,
        pdf_url: row.pdf_url,
        toc_json: row.toc_json,
        tech_stack: row.tech_stack,
        libraries: row.libraries,
        sections: derivedSections,
      };
      const { data, error } = await supabase.from("ebooks").upsert(payload).select("*").single();
      if (error) throw error;
      return data as EbookRow;
    },
    onSuccess: (saved) => {
      toast.success("Ebook saved.");
      qc.invalidateQueries({ queryKey: ["admin-ebooks"] });
      setSelected(saved);
      setIsEditing(false);
    },
    onError: (err) => toast.error(errMsg(err, "Failed to save ebook.")),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ebooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ebook deleted.");
      qc.invalidateQueries({ queryKey: ["admin-ebooks"] });
      setSelected(null);
      setIsEditing(false);
    },
    onError: (err) => toast.error(errMsg(err, "Failed to delete ebook.")),
  });

  const uploadAsset = async (file: File, field: "cover_image_url" | "preview_pdf_url" | "pdf_url" | "epub_url") => {
    if (!selected) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${selected.slug || selected.id}/${field}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("ebooks")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("ebooks").getPublicUrl(path);
      setSelected((prev) => (prev ? { ...prev, [field]: data.publicUrl } : prev));
      toast.success("Uploaded.");
    } catch (err) {
      toast.error(errMsg(err, "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const parseToc = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return parseList(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Ebook Studio
          </h1>
          <p className="text-muted-foreground">Create, publish, and distribute ebooks.</p>
        </div>
        <Button onClick={createNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Ebook
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input"
            />
          </div>
          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
            {isLoading ? <div className="text-sm text-muted-foreground">Loading ebooks...</div> : null}
            {filtered.map((ebook) => (
              <motion.div
                key={ebook.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setSelected(ebook); setIsEditing(false); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selected?.id === ebook.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2">{ebook.title}</h4>
                  {ebook.is_published ? (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{ebook.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selected.category}</Badge>
                  <Badge variant="secondary">{selected.level}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
                    {isEditing ? "Preview" : "Edit"}
                  </Button>
                  <Button onClick={() => upsert.mutate(selected)} disabled={upsert.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="destructive" onClick={() => del.mutate(selected.id)} disabled={del.isPending}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={selected.title}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                  placeholder="Title"
                  disabled={!isEditing}
                />
                <Input
                  value={selected.slug}
                  onChange={(e) => setSelected({ ...selected, slug: e.target.value })}
                  placeholder="Slug"
                  disabled={!isEditing}
                />
                <Input
                  value={selected.subtitle || ""}
                  onChange={(e) => setSelected({ ...selected, subtitle: e.target.value })}
                  placeholder="Subtitle"
                  disabled={!isEditing}
                />
                <Input
                  value={selected.price_in_inr ?? ""}
                  onChange={(e) => setSelected({ ...selected, price_in_inr: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Price (INR)"
                  disabled={!isEditing}
                />
              </div>

              <Textarea
                className="mt-4"
                value={selected.description || ""}
                onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                placeholder="Description"
                disabled={!isEditing}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  value={(selected.tech_stack || []).join(", ")}
                  onChange={(e) => setSelected({ ...selected, tech_stack: parseList(e.target.value) })}
                  placeholder="Tech stack (comma separated)"
                  disabled={!isEditing}
                />
                <Input
                  value={(selected.libraries || []).join(", ")}
                  onChange={(e) => setSelected({ ...selected, libraries: parseList(e.target.value) })}
                  placeholder="Libraries (comma separated)"
                  disabled={!isEditing}
                />
              </div>

              <Textarea
                className="mt-4"
                value={JSON.stringify(selected.toc_json || [], null, 2)}
                onChange={(e) => setSelected({ ...selected, toc_json: parseToc(e.target.value) })}
                placeholder='TOC JSON (e.g. ["Chapter 1","Chapter 2"])'
                disabled={!isEditing}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={selected.is_published}
                    onCheckedChange={(v) => setSelected({ ...selected, is_published: v })}
                    disabled={!isEditing}
                  />
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Published</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={selected.is_free}
                    onCheckedChange={(v) => setSelected({ ...selected, is_free: v })}
                    disabled={!isEditing}
                  />
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> Free</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={selected.is_coming_soon}
                    onCheckedChange={(v) => setSelected({ ...selected, is_coming_soon: v })}
                    disabled={!isEditing}
                  />
                  <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Coming soon</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={selected.is_featured}
                    onCheckedChange={(v) => setSelected({ ...selected, is_featured: v })}
                    disabled={!isEditing}
                  />
                  <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Featured</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cover Image</div>
                  <div className="flex items-center gap-2">
                    <Input value={selected.cover_image_url || ""} onChange={(e) => setSelected({ ...selected, cover_image_url: e.target.value })} disabled={!isEditing} />
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAsset(f, "cover_image_url");
                      }}
                    />
                    <Button type="button" variant="outline" disabled={!isEditing || uploading} onClick={() => fileRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Preview PDF</div>
                  <div className="flex items-center gap-2">
                    <Input value={selected.preview_pdf_url || ""} onChange={(e) => setSelected({ ...selected, preview_pdf_url: e.target.value })} disabled={!isEditing} />
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAsset(f, "preview_pdf_url");
                      }}
                    />
                    <Button type="button" variant="outline" disabled={!isEditing || uploading} onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">PDF URL</div>
                  <div className="flex items-center gap-2">
                    <Input value={selected.pdf_url || ""} onChange={(e) => setSelected({ ...selected, pdf_url: e.target.value })} disabled={!isEditing} />
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAsset(f, "pdf_url");
                      }}
                    />
                    <Button type="button" variant="outline" disabled={!isEditing || uploading} onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">EPUB URL</div>
                  <div className="flex items-center gap-2">
                    <Input value={selected.epub_url || ""} onChange={(e) => setSelected({ ...selected, epub_url: e.target.value })} disabled={!isEditing} />
                    <input
                      type="file"
                      className="hidden"
                      accept=".epub"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAsset(f, "epub_url");
                      }}
                    />
                    <Button type="button" variant="outline" disabled={!isEditing || uploading} onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Select an ebook to edit or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEbooksManager;
