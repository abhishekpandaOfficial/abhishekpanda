import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  HelpCircle,
  X,
  // Logo icons
  Bot,
  Brain,
  Layers,
  Globe,
  Activity,
  Rocket,
  Music,
  FileText,
  Shield,
  Sparkles,
  Cpu,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  website: string;
  status: "Todo" | "InDevelopment" | "Live" | "Rejected";
  summary: string;
  stacks: string[];
  logo_icon: string;
}

// Map string icon names to Lucide icons
const logoIcons: Record<string, any> = {
  Bot,
  Brain,
  Layers,
  Globe,
  Activity,
  Rocket,
  Music,
  FileText,
  Shield,
  Sparkles,
  Cpu,
  GraduationCap,
  BookOpen,
};

const ProjectIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = logoIcons[name] || FolderGit;
  return <IconComponent className={className} />;
};

const statusConfig = {
  Todo: {
    label: "To Do",
    icon: Clock3,
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-300 dark:bg-slate-500/15",
    iconClass: "text-slate-500",
  },
  InDevelopment: {
    label: "In Dev",
    icon: Activity,
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300 dark:bg-sky-500/15",
    iconClass: "text-sky-500 animate-pulse",
  },
  Live: {
    label: "Live",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/15",
    iconClass: "text-emerald-500",
  },
  Rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300 dark:bg-rose-500/15",
    iconClass: "text-rose-500",
  },
};

const commonTechStacks = [
  "React",
  "TypeScript",
  "Next.js",
  "OpenAI",
  "Python",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "PostgreSQL",
  "MongoDB",
  "Node.js",
  "Tailwind CSS",
  "GSAP",
  "Three.js",
];

export const AdminProjectsWorkbook = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"Todo" | "InDevelopment" | "Live" | "Rejected">("Live");
  const [summary, setSummary] = useState("");
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [logoIcon, setLogoIcon] = useState("FolderGit");

  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Project[];
    },
  });

  // Open dialog for editing
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setWebsite(project.website);
    setStatus(project.status);
    setSummary(project.summary);
    setSelectedStacks(project.stacks || []);
    setLogoIcon(project.logo_icon || "FolderGit");
    setIsDialogOpen(true);
  };

  // Open dialog for adding
  const handleAddNew = () => {
    setEditingProject(null);
    setName("");
    setWebsite("");
    setStatus("Live");
    setSummary("");
    setSelectedStacks([]);
    setLogoIcon("FolderGit");
    setIsDialogOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Project deleted successfully");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete project");
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !website || !summary) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      name,
      website,
      status,
      summary,
      stacks: selectedStacks,
      logo_icon: logoIcon,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from("portfolio_projects")
          .update(payload)
          .eq("id", editingProject.id);

        if (error) throw error;
        toast.success("Project updated successfully");
      } else {
        const { error } = await supabase
          .from("portfolio_projects")
          .insert(payload);

        if (error) throw error;
        toast.success("Project created successfully");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to save project");
    }
  };

  const toggleStack = (stack: string) => {
    setSelectedStacks(prev =>
      prev.includes(stack)
        ? prev.filter(s => s !== stack)
        : [...prev, stack]
    );
  };

  const filteredProjects = projects.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
            <FolderGit className="w-3.5 h-3.5" /> Project Workbook
          </div>
          <h1 className="text-3xl font-black text-foreground mt-2">Projects Portfolio Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure, build, and publish portfolio card listings visible to the public.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-2 border-border/50 bg-card hover:bg-muted/50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleAddNew}
            className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-card/75 border-border/50 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border/50 bg-background/50"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Total Configured: <strong>{filteredProjects.length}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-md shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FolderGit className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-lg text-foreground">No projects found</h3>
              <p className="text-sm mt-1">Try creating a new project with the Add Project button.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="w-[80px]">Logo</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Website Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tech Stacks</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((p) => {
                    const statusObj = statusConfig[p.status] || {
                      label: p.status,
                      icon: HelpCircle,
                      badgeClass: "bg-slate-500/10 text-slate-700",
                      iconClass: "text-slate-500",
                    };
                    const StatusIcon = statusObj.icon;

                    return (
                      <TableRow key={p.id} className="border-border/30 hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                            <ProjectIcon name={p.logo_icon} className="w-5 h-5" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-bold text-foreground block">{p.name}</span>
                            <span className="text-xs text-muted-foreground block line-clamp-1 max-w-sm mt-0.5">
                              {p.summary}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"
                          >
                            {p.website.replace(/^https?:\/\/(www\.)?/, "")}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-xs gap-1.5 font-medium border", statusObj.badgeClass)}>
                            <StatusIcon className={cn("w-3.5 h-3.5", statusObj.iconClass)} />
                            {statusObj.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(p.stacks || []).map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(p)}
                              className="w-8 h-8 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(p.id)}
                              className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-border/70 bg-background/98 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingProject ? `Edit Project: ${name}` : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              Configure details, state, links, and tags for your product listing cards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project Name *</label>
                <Input
                  placeholder="e.g. CHRONYX"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-border/50 bg-background/50"
                  required
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Website Link *</label>
                <Input
                  placeholder="e.g. https://www.getchronyx.com/"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="rounded-xl border-border/50 bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project Status</label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="rounded-xl border-border/50 bg-background/50">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">To Do (Pending)</SelectItem>
                    <SelectItem value="InDevelopment">In Development</SelectItem>
                    <SelectItem value="Live">Live / Active</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Icon */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Logo Representation</label>
                <Select value={logoIcon} onValueChange={setLogoIcon}>
                  <SelectTrigger className="rounded-xl border-border/50 bg-background/50 flex items-center gap-2">
                    <SelectValue placeholder="Select Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(logoIcons).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <span className="flex items-center gap-2 capitalize">
                          <ProjectIcon name={iconName} className="w-4 h-4 text-indigo-500" />
                          {iconName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Description / Details *</label>
              <Textarea
                placeholder="Brief summary of what the project does..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="rounded-xl border-border/50 bg-background/50 min-h-[80px]"
                required
              />
            </div>

            {/* Tech Stacks Checklist */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground block">Technology Stacks</label>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-2 border border-border/40 rounded-xl bg-background/50 scrollbar-thin">
                {commonTechStacks.map((stack) => {
                  const isSelected = selectedStacks.includes(stack);
                  return (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => toggleStack(stack)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border font-medium transition",
                        isSelected
                          ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/40 dark:text-indigo-400"
                          : "bg-background text-muted-foreground border-border/70 hover:border-border hover:text-foreground"
                      )}
                    >
                      {stack}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border border-border/50 bg-transparent hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5"
              >
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectsWorkbook;
