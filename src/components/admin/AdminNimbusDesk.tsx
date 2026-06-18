import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Lightbulb,
  FolderOpen,
  Plus,
  Search,
  Star,
  Clock,
  Tag,
  MoreHorizontal,
  Edit3,
  Trash2,
  Pin,
  Archive,
  Grid3X3,
  List,
  SortAsc,
  Filter,
  BookMarked,
  PenLine,
  Sparkles,
  Brain,
  Folder,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "note" | "idea" | "draft" | "research" | "strategy";
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryConfig = {
  note: { icon: FileText, color: "from-slate-500 to-slate-600", label: "Notes" },
  idea: { icon: Lightbulb, color: "from-amber-500 to-orange-600", label: "Ideas" },
  draft: { icon: PenLine, color: "from-violet-500 to-purple-600", label: "Drafts" },
  research: { icon: Brain, color: "from-cyan-500 to-blue-600", label: "Research" },
  strategy: { icon: Sparkles, color: "from-indigo-500 to-violet-600", label: "Strategy" },
};

const isMissingTableError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "PGRST205";
};

export const AdminNimbusDesk = () => {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState("All Notes");
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "note" as Note["category"], tags: "" });

  const { data: noteRows = [], isLoading } = useQuery({
    queryKey: ["nimbus_notes"],
    queryFn: async () => {
      const res = await supabase
        .from("nimbus_notes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!res.error) return res.data || [];
      if (isMissingTableError(res.error)) return [];
      throw res.error;
    },
  });

  useEffect(() => {
    const mapped = noteRows.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content || "",
      category: row.category || "note",
      tags: row.tags || [],
      isPinned: !!row.is_pinned,
      isArchived: !!row.is_archived,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    setNotes(mapped);
  }, [noteRows]);

  const upsertNote = useMutation({
    mutationFn: async (note: Note) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("nimbus_notes")
        .upsert({
          id: note.id,
          user_id: user.id,
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          is_pinned: note.isPinned,
          is_archived: note.isArchived,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nimbus_notes"] }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nimbus_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nimbus_notes"] }),
  });

  const folderCategories: Record<string, Note["category"] | "all"> = {
    "All Notes": "all",
    "Ideas Vault": "idea",
    "Book Drafts": "draft",
    "R&D Documents": "research",
    "Strategy Logs": "strategy",
    "Meeting Notes": "note",
  };

  const folders = [
    { name: "All Notes", icon: FolderOpen, count: notes.filter((n) => !n.isArchived).length },
    { name: "Ideas Vault", icon: Lightbulb, count: notes.filter((n) => !n.isArchived && n.category === "idea").length },
    { name: "Book Drafts", icon: BookMarked, count: notes.filter((n) => !n.isArchived && n.category === "draft").length },
    { name: "R&D Documents", icon: Brain, count: notes.filter((n) => !n.isArchived && n.category === "research").length },
    { name: "Strategy Logs", icon: Sparkles, count: notes.filter((n) => !n.isArchived && n.category === "strategy").length },
    { name: "Meeting Notes", icon: FileText, count: notes.filter((n) => !n.isArchived && n.category === "note").length },
  ];

  const filteredNotes = notes.filter(
    (note) =>
      !note.isArchived &&
      (folderCategories[activeFolder] === "all" || note.category === folderCategories[activeFolder]) &&
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const openNewNote = () => {
    setSelectedNote(null);
    setEditForm({ title: "", content: "", category: "note", tags: "" });
    setIsEditorOpen(true);
  };

  const openEditNote = (note: Note) => {
    setSelectedNote(note);
    setEditForm({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(", "),
    });
    setIsEditorOpen(true);
  };

  const saveNote = () => {
    if (!editForm.title) {
      toast.error("Please enter a title");
      return;
    }

    const tags = editForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const now = new Date().toISOString();

    if (selectedNote) {
      const next = { ...selectedNote, ...editForm, tags, updatedAt: now };
      setNotes(notes.map((n) => (n.id === selectedNote.id ? next : n)));
      upsertNote.mutate(next);
      toast.success("Note updated successfully");
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: editForm.title,
        content: editForm.content,
        category: editForm.category,
        tags,
        isPinned: false,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      setNotes([newNote, ...notes]);
      upsertNote.mutate(newNote);
      toast.success("Note created successfully");
    }
    setIsEditorOpen(false);
  };

  const togglePin = (id: string) => {
    const next = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    setNotes(next);
    const updated = next.find((n) => n.id === id);
    if (updated) upsertNote.mutate(updated);
    toast.success("Pin status updated");
  };

  const archiveNote = (id: string) => {
    const next = notes.map((n) => (n.id === id ? { ...n, isArchived: true } : n));
    setNotes(next);
    const updated = next.find((n) => n.id === id);
    if (updated) upsertNote.mutate(updated);
    toast.success("Note archived");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    deleteNoteMutation.mutate(id);
    toast.success("Note deleted");
  };

  const NoteCard = ({ note }: { note: Note }) => {
    const config = categoryConfig[note.category];
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="group"
      >
        <Card className="bg-card/50 border-border/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden h-full">
          <div className={`h-1 bg-gradient-to-r ${config.color}`} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={() => openEditNote(note)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => togglePin(note.id)}>
                    <Pin className="w-4 h-4 mr-2" /> {note.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => archiveNote(note.id)}>
                    <Archive className="w-4 h-4 mr-2" /> Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteNote(note.id)} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{note.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
                  #{tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px]">+{note.tags.length - 3}</Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {note.updatedAt}
              </span>
              <Badge className={`text-[9px] bg-gradient-to-r ${config.color} border-0`}>
                {config.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Nimbus Desk
              </h1>
              <p className="text-muted-foreground mt-1">Your personal knowledge OS — notes, ideas, drafts & research</p>
            </div>
        <Button onClick={openNewNote} className="bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading notes...</div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryConfig).map(([key, config], i) => {
          const count = notes.filter((n) => n.category === key && !n.isArchived).length;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 hover:border-indigo-500/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <config.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Folders Sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card className="bg-card/50 border-border/50 sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-500" />
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeFolder === folder.name
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <folder.icon className="w-4 h-4" />
                    {folder.name}
                  </span>
                  <span className="text-xs opacity-60">{folder.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, tags, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border/50 focus:border-indigo-500/50"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="shrink-0">
                <SortAsc className="w-4 h-4" />
              </Button>
              <div className="flex border border-border/50 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500" />
                Pinned ({pinnedNotes.length})
              </h3>
              <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* All Notes */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Notes ({unpinnedNotes.length})
            </h3>
            <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {unpinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {selectedNote ? "Edit Note" : "New Note"}
            </DialogTitle>
            <DialogDescription>
              {selectedNote ? "Update your note content" : "Create a new note in Nimbus Desk"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Note title..."
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-muted/50 border-border text-lg font-semibold"
              />
            </div>
            <div>
              <Textarea
                placeholder="Start writing your note..."
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="bg-muted/50 border-border min-h-[200px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Note["category"] })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tags (comma separated)</label>
                <Input
                  placeholder="e.g., product, AI, research"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={saveNote} className="bg-gradient-to-r from-indigo-500 to-violet-600">
              {selectedNote ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNimbusDesk;
