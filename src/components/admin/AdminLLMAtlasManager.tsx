import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  Filter,
  MoreVertical,
  Globe,
  Code,
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LLMModel {
  id: string;
  name: string;
  slug: string;
  company: string;
  description: string | null;
  logo: string | null;
  color: string | null;
  parameters: string | null;
  context_window: string | null;
  is_open_source: boolean | null;
  is_multimodal: boolean | null;
  is_trending: boolean | null;
  pricing: string | null;
  speed: string | null;
  architecture: string | null;
  release_date: string | null;
  api_docs_url: string | null;
  homepage_url: string | null;
  huggingface_url: string | null;
  license: string | null;
  considerations: string[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  use_cases: string[] | null;
  benchmarks: any;
  versions: any;
  created_at: string;
  updated_at: string;
}

const companies = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Meta",
  "Mistral AI",
  "xAI",
  "Cohere",
  "AI21 Labs",
  "Amazon",
  "Microsoft",
  "Stability AI",
  "Other",
];

const ITEMS_PER_PAGE = 10;

export const AdminLLMAtlasManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [formData, setFormData] = useState<Partial<LLMModel>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [importData, setImportData] = useState("");
  const [importType, setImportType] = useState<"json" | "csv">("json");
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch models
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["admin-llm-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_models")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LLMModel[];
    },
  });

  // Create model mutation
  const createMutation = useMutation({
    mutationFn: async (model: Partial<LLMModel>) => {
      const insertData = {
        name: model.name!,
        slug: model.slug!,
        company: model.company!,
        description: model.description,
        logo: model.logo,
        color: model.color,
        parameters: model.parameters,
        context_window: model.context_window,
        is_open_source: model.is_open_source,
        is_multimodal: model.is_multimodal,
        is_trending: model.is_trending,
        pricing: model.pricing,
        speed: model.speed,
        architecture: model.architecture,
        release_date: model.release_date,
        api_docs_url: model.api_docs_url,
        homepage_url: (model as any).homepage_url,
        huggingface_url: (model as any).huggingface_url,
        license: (model as any).license,
        considerations: (model as any).considerations,
        strengths: model.strengths,
        weaknesses: model.weaknesses,
        use_cases: model.use_cases,
        benchmarks: model.benchmarks,
        versions: model.versions,
      };
      const { data, error } = await supabase
        .from("llm_models")
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-llm-models"] });
      setIsCreateOpen(false);
      setFormData({});
      toast({ title: "Model created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating model", description: error.message, variant: "destructive" });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (modelsToImport: Partial<LLMModel>[]) => {
      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (const model of modelsToImport) {
        try {
          if (!model.name || !model.slug || !model.company) {
            results.failed++;
            results.errors.push(`Missing required fields for model: ${model.name || 'Unknown'}`);
            continue;
          }
          
          const insertData = {
            name: model.name,
            slug: model.slug,
            company: model.company,
            description: model.description || null,
            logo: model.logo || null,
            color: model.color || null,
            parameters: model.parameters || null,
            context_window: model.context_window || null,
            is_open_source: model.is_open_source || false,
            is_multimodal: model.is_multimodal || false,
            is_trending: model.is_trending || false,
            pricing: model.pricing || null,
            speed: model.speed || null,
            architecture: model.architecture || null,
            release_date: model.release_date || null,
            api_docs_url: model.api_docs_url || null,
            homepage_url: (model as any).homepage_url || null,
            huggingface_url: (model as any).huggingface_url || null,
            license: (model as any).license || null,
            considerations: (model as any).considerations || null,
            strengths: model.strengths || null,
            weaknesses: model.weaknesses || null,
            use_cases: model.use_cases || null,
            benchmarks: model.benchmarks || null,
            versions: model.versions || null,
          };
          
          const { error } = await supabase.from("llm_models").insert([insertData]);
          if (error) {
            results.failed++;
            results.errors.push(`${model.name}: ${error.message}`);
          } else {
            results.success++;
          }
        } catch (e: any) {
          results.failed++;
          results.errors.push(`${model.name || 'Unknown'}: ${e.message}`);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["admin-llm-models"] });
      setImportResults(results);
      if (results.success > 0) {
        toast({ title: `Imported ${results.success} models successfully` });
      }
    },
    onError: (error) => {
      toast({ title: "Bulk import failed", description: error.message, variant: "destructive" });
    },
  });

  // Update model mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...model }: Partial<LLMModel> & { id: string }) => {
      const { data, error } = await supabase
        .from("llm_models")
        .update(model)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-llm-models"] });
      setEditingModel(null);
      setFormData({});
      toast({ title: "Model updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating model", description: error.message, variant: "destructive" });
    },
  });

  // Delete model mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("llm_models").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-llm-models"] });
      toast({ title: "Model deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting model", description: error.message, variant: "destructive" });
    },
  });

  // Filter models
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = companyFilter === "all" || model.company === companyFilter;
    return matchesSearch && matchesCompany;
  });

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stats
  const stats = {
    total: models.length,
    openSource: models.filter((m) => m.is_open_source).length,
    multimodal: models.filter((m) => m.is_multimodal).length,
    trending: models.filter((m) => m.is_trending).length,
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.company || !formData.slug) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (editingModel) {
      updateMutation.mutate({ id: editingModel.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (model: LLMModel) => {
    setEditingModel(model);
    setFormData(model);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setImportType(file.name.endsWith('.csv') ? 'csv' : 'json');
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string): Partial<LLMModel>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const models: Partial<LLMModel>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const model: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'is_open_source' || header === 'is_multimodal' || header === 'is_trending') {
          model[header] = value?.toLowerCase() === 'true';
        } else if (header === 'strengths' || header === 'weaknesses' || header === 'use_cases') {
          model[header] = value ? value.split(';').map(s => s.trim()) : null;
        } else {
          model[header] = value || null;
        }
      });
      
      if (model.name && model.slug && model.company) {
        models.push(model);
      }
    }
    
    return models;
  };

  const handleBulkImport = () => {
    try {
      let modelsToImport: Partial<LLMModel>[];
      
      if (importType === 'json') {
        modelsToImport = JSON.parse(importData);
        if (!Array.isArray(modelsToImport)) {
          modelsToImport = [modelsToImport];
        }
      } else {
        modelsToImport = parseCSV(importData);
      }
      
      if (modelsToImport.length === 0) {
        toast({ title: "No valid models found in import data", variant: "destructive" });
        return;
      }
      
      bulkImportMutation.mutate(modelsToImport);
    } catch (e: any) {
      toast({ title: "Invalid import data", description: e.message, variant: "destructive" });
    }
  };

  const exportTemplate = (format: 'json' | 'csv') => {
    const template = {
      name: "Model Name",
      slug: "model-slug",
      company: "Company Name",
      description: "Model description",
      parameters: "7B",
      context_window: "128K",
      is_open_source: false,
      is_multimodal: false,
      is_trending: false,
      pricing: "$0.01/1K tokens",
      speed: "Fast",
      architecture: "Transformer",
      release_date: "2024-01-01",
      api_docs_url: "https://docs.example.com",
      strengths: ["Reasoning", "Coding"],
      weaknesses: ["Speed"],
      use_cases: ["Chatbots", "Code Generation"],
    };
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'json') {
      content = JSON.stringify([template], null, 2);
      filename = 'llm-models-template.json';
      mimeType = 'application/json';
    } else {
      const headers = Object.keys(template).join(',');
      const values = Object.values(template).map(v => {
        if (Array.isArray(v)) return `"${v.join(';')}"`;
        if (typeof v === 'string') return `"${v}"`;
        return v;
      }).join(',');
      content = `${headers}\n${values}`;
      filename = 'llm-models-template.csv';
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ModelForm = () => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic</TabsTrigger>
          <TabsTrigger value="specs" className="text-xs sm:text-sm">Specs</TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm">Features</TabsTrigger>
          <TabsTrigger value="benchmarks" className="text-xs sm:text-sm">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Model Name *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GPT-4 Turbo"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Slug *</Label>
              <Input
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., gpt-4-turbo"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Company *</Label>
              <Select
                value={formData.company || ""}
                onValueChange={(value) => setFormData({ ...formData, company: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Release Date</Label>
              <Input
                type="date"
                value={formData.release_date || ""}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the model..."
              rows={3}
              className="bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Logo URL</Label>
              <Input
                value={formData.logo || ""}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://..."
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Brand Color</Label>
              <Input
                value={formData.color || ""}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#10a37f"
                className="bg-background border-border"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Parameters</Label>
              <Input
                value={formData.parameters || ""}
                onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                placeholder="e.g., 1.76T"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Context Window</Label>
              <Input
                value={formData.context_window || ""}
                onChange={(e) => setFormData({ ...formData, context_window: e.target.value })}
                placeholder="e.g., 128K tokens"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Architecture</Label>
              <Input
                value={formData.architecture || ""}
                onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
                placeholder="e.g., Transformer, MoE"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Speed</Label>
              <Input
                value={formData.speed || ""}
                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                placeholder="e.g., Fast, Medium"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Pricing</Label>
              <Input
                value={formData.pricing || ""}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                placeholder="e.g., $0.01/1K tokens"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">API Docs URL</Label>
              <Input
                value={formData.api_docs_url || ""}
                onChange={(e) => setFormData({ ...formData, api_docs_url: e.target.value })}
                placeholder="https://docs..."
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Website URL</Label>
              <Input
                value={formData.homepage_url || ""}
                onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                placeholder="https://..."
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Hugging Face URL</Label>
              <Input
                value={formData.huggingface_url || ""}
                onChange={(e) => setFormData({ ...formData, huggingface_url: e.target.value })}
                placeholder="https://huggingface.co/org-or-model"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">License</Label>
              <Input
                value={formData.license || ""}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                placeholder="e.g., Proprietary, Apache-2.0"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Considerations (comma-separated)</Label>
              <Input
                value={formData.considerations?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    considerations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Licensing, data residency, vendor risk..."
                className="bg-background border-border"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_open_source || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_open_source: checked })}
                />
                <Label className="text-foreground">Open Weight</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_multimodal || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_multimodal: checked })}
                />
                <Label className="text-foreground">Multimodal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_trending || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_trending: checked })}
                />
                <Label className="text-foreground">Trending</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Strengths (comma-separated)</Label>
              <Textarea
                value={formData.strengths?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    strengths: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Reasoning, Coding, Math..."
                rows={2}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Weaknesses (comma-separated)</Label>
              <Textarea
                value={formData.weaknesses?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weaknesses: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Speed, Cost..."
                rows={2}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Use Cases (comma-separated)</Label>
              <Textarea
                value={formData.use_cases?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    use_cases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Chatbots, Code Generation, RAG..."
                rows={2}
                className="bg-background border-border"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground mb-4">
            Enter benchmark scores as JSON format
          </div>
          <Textarea
            value={formData.benchmarks ? JSON.stringify(formData.benchmarks, null, 2) : ""}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, benchmarks: parsed });
              } catch {
                // Allow invalid JSON during editing
              }
            }}
            placeholder={`{
  "mmlu": 86.4,
  "humaneval": 87.1,
  "gsm8k": 92.0,
  "arena_elo": 1287
}`}
            rows={8}
            className="font-mono text-sm bg-background border-border"
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateOpen(false);
            setEditingModel(null);
            setFormData({});
          }}
          className="border-border"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {editingModel ? "Update Model" : "Create Model"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            LLM Galaxy Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage AI models in the OriginX LLM Galaxy database
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-border">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">Bulk Import Models</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Download Templates */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportTemplate('json')}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Download JSON Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportTemplate('csv')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </Button>
                </div>

                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-dashed border-2"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload JSON or CSV file</span>
                    </div>
                  </Button>
                </div>

                {/* Import Type */}
                <div className="flex items-center gap-4">
                  <Label className="text-foreground">Format:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={importType === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportType('json')}
                    >
                      JSON
                    </Button>
                    <Button
                      variant={importType === 'csv' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportType('csv')}
                    >
                      CSV
                    </Button>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="space-y-2">
                  <Label className="text-foreground">Import Data</Label>
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={importType === 'json' 
                      ? '[\n  { "name": "Model", "slug": "model", "company": "Company" }\n]'
                      : 'name,slug,company\nModel Name,model-slug,Company'
                    }
                    rows={8}
                    className="font-mono text-xs bg-background border-border"
                  />
                </div>

                {/* Import Results */}
                {importResults && (
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">{importResults.success} successful</span>
                      </div>
                      {importResults.failed > 0 && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">{importResults.failed} failed</span>
                        </div>
                      )}
                    </div>
                    {importResults.errors.length > 0 && (
                      <div className="text-xs text-muted-foreground max-h-24 overflow-y-auto">
                        {importResults.errors.map((err, i) => (
                          <div key={i} className="text-destructive">{err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setIsBulkImportOpen(false);
                    setImportData("");
                    setImportResults(null);
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={!importData || bulkImportMutation.isPending}
                  >
                    {bulkImportMutation.isPending ? "Importing..." : "Import Models"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">Add New Model</DialogTitle>
              </DialogHeader>
              <ModelForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Models", value: stats.total, icon: Brain, color: "from-blue-500 to-cyan-500" },
          { label: "Open Source", value: stats.openSource, icon: Code, color: "from-emerald-500 to-green-500" },
          { label: "Multimodal", value: stats.multimodal, icon: Globe, color: "from-purple-500 to-pink-500" },
          { label: "Trending", value: stats.trending, icon: TrendingUp, color: "from-orange-500 to-red-500" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="p-4 sm:p-5 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={companyFilter} onValueChange={(value) => {
          setCompanyFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold">Model</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden sm:table-cell">Company</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Parameters</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden lg:table-cell">Features</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Loading models...
                  </TableCell>
                </TableRow>
              ) : paginatedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No models found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedModels.map((model) => (
                  <TableRow key={model.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: model.color || "#6366f1" }}
                        >
                          {model.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{model.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{model.company}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground">{model.company}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{model.parameters || "N/A"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {model.is_open_source && (
                          <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Open Source
                          </Badge>
                        )}
                        {model.is_multimodal && (
                          <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Multimodal
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {model.is_trending ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => window.open(`/llm-galaxy/model/${model.slug}`, "_blank")}
                            className="hover:bg-muted"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(model)} className="hover:bg-muted">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(model.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredModels.length)} of {filteredModels.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Edit Model</DialogTitle>
          </DialogHeader>
          <ModelForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLLMAtlasManager;
