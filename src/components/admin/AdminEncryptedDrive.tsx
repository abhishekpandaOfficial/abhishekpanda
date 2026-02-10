import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder,
  File,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Shield,
  Lock,
  Search,
  Grid,
  List,
  Upload,
  Plus,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Copy,
  Move,
  Tag,
  Eye,
  EyeOff,
  X,
  ChevronRight,
  Home,
  SortAsc,
  Filter,
  CheckSquare,
  Square,
  Star,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BiometricVerificationModal } from "./BiometricVerificationModal";

interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "image" | "document" | "video" | "audio" | "archive" | "other";
  size?: string;
  modified: string;
  color?: string;
  tags?: string[];
  isStarred?: boolean;
  isEncrypted: boolean;
  thumbnail?: string;
  parentId: string | null;
}

const folderColors: Record<string, string> = {
  Personal: "from-blue-500 to-cyan-500",
  "Work History": "from-purple to-pink-500",
  "Baby Photos": "from-pink-400 to-rose-400",
  "Family Photos": "from-amber-500 to-orange-500",
  Certificates: "from-green-500 to-emerald-500",
  "Research Notes": "from-indigo-500 to-violet-500",
  Documents: "from-slate-500 to-zinc-500",
  Legal: "from-red-500 to-rose-600",
  "Health Records": "from-teal-500 to-cyan-500",
  Ideas: "from-yellow-500 to-amber-500",
  Confidential: "from-gray-700 to-gray-900",
};

const mockItems: DriveItem[] = [
  { id: "f1", name: "Personal", type: "folder", modified: "2024-02-01", color: folderColors.Personal, isEncrypted: true, parentId: null },
  { id: "f2", name: "Work History", type: "folder", modified: "2024-01-28", color: folderColors["Work History"], isEncrypted: true, parentId: null },
  { id: "f3", name: "Baby Photos", type: "folder", modified: "2024-02-05", color: folderColors["Baby Photos"], isEncrypted: true, parentId: null },
  { id: "f4", name: "Family Photos", type: "folder", modified: "2024-01-15", color: folderColors["Family Photos"], isEncrypted: true, parentId: null },
  { id: "f5", name: "Certificates", type: "folder", modified: "2024-01-10", color: folderColors.Certificates, isEncrypted: true, parentId: null },
  { id: "f6", name: "Research Notes", type: "folder", modified: "2024-02-03", color: folderColors["Research Notes"], isEncrypted: true, parentId: null },
  { id: "f7", name: "Documents", type: "folder", modified: "2024-01-20", color: folderColors.Documents, isEncrypted: true, parentId: null },
  { id: "f8", name: "Legal", type: "folder", modified: "2024-01-05", color: folderColors.Legal, isEncrypted: true, parentId: null },
  { id: "f9", name: "Health Records", type: "folder", modified: "2024-01-25", color: folderColors["Health Records"], isEncrypted: true, parentId: null },
  { id: "f10", name: "Ideas", type: "folder", modified: "2024-02-04", color: folderColors.Ideas, isEncrypted: true, parentId: null },
  { id: "f11", name: "Confidential", type: "folder", modified: "2024-01-01", color: folderColors.Confidential, isEncrypted: true, parentId: null },
  { id: "d1", name: "Resume_2024.pdf", type: "document", size: "2.4 MB", modified: "2024-02-01", isEncrypted: true, parentId: null, tags: ["important"] },
  { id: "i1", name: "Profile_Photo.jpg", type: "image", size: "1.2 MB", modified: "2024-01-15", isEncrypted: true, parentId: null, isStarred: true },
  { id: "v1", name: "Conference_Talk.mp4", type: "video", size: "450 MB", modified: "2024-01-20", isEncrypted: true, parentId: null },
];

const getFileIcon = (type: DriveItem["type"]) => {
  switch (type) {
    case "folder": return Folder;
    case "image": return ImageIcon;
    case "document": return FileText;
    case "video": return Video;
    case "audio": return Music;
    case "archive": return Archive;
    default: return File;
  }
};

export const AdminEncryptedDrive = () => {
  const [items, setItems] = useState<DriveItem[]>(mockItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
  const [secureArchiveMode, setSecureArchiveMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "modified" | "size">("name");
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const currentParentId = currentPath.length === 1 ? null : currentPath[currentPath.length - 1];
  
  const filteredItems = items
    .filter(item => {
      if (secureArchiveMode && item.name === "Confidential") return false;
      if (item.parentId !== currentParentId) return false;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "modified") return new Date(b.modified).getTime() - new Date(a.modified).getTime();
      return 0;
    });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload
    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
  }, []);

  const handleFolderClick = (folder: DriveItem) => {
    if (folder.type === "folder") {
      setCurrentPath([...currentPath, folder.id]);
    } else {
      setPreviewItem(folder);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const stats = {
    totalFiles: items.filter(i => i.type !== "folder").length,
    totalFolders: items.filter(i => i.type === "folder").length,
    totalSize: "2.4 GB",
    encrypted: items.filter(i => i.isEncrypted).length
  };

  const handleBiometricSuccess = () => {
    setIsUnlocked(true);
    setShowBiometricModal(false);
  };

  if (!isUnlocked) {
    return (
      <>
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onSuccess={handleBiometricSuccess}
          title="Unlock Astra Vault"
          subtitle="Verify identity to access encrypted files"
          moduleName="ASTRA VAULT"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Astra Vault Locked</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Secure access enabled for encrypted personal files
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Shield className="w-4 h-4 mr-2" />
            Verify Identity
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-secondary/10 to-purple/10 border border-primary/20 rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                Encrypted Personal Drive
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">AES-256</Badge>
              </p>
              <p className="text-sm text-muted-foreground">Bank-grade encryption for all your files</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Secure Archive Mode</span>
              <Button
                variant={secureArchiveMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSecureArchiveMode(!secureArchiveMode)}
                className={secureArchiveMode ? "bg-primary" : ""}
              >
                {secureArchiveMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Files", value: stats.totalFiles, icon: File },
          { label: "Folders", value: stats.totalFolders, icon: Folder },
          { label: "Storage Used", value: stats.totalSize, icon: Archive },
          { label: "Encrypted", value: stats.encrypted, icon: Lock }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("modified")}>Modified</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>Size</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-primary text-primary-foreground" : ""}>
            <List className="w-4 h-4" />
          </Button>
          <Button className="bg-gradient-to-r from-primary to-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {currentPath.map((path, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`flex items-center gap-1 hover:text-primary transition-colors ${
                index === currentPath.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {index === 0 ? "Home" : items.find(i => i.id === path)?.name || path}
            </button>
          </div>
        ))}
      </div>

      {/* Selection Actions */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/30 rounded-xl"
          >
            <span className="text-sm font-medium text-foreground">{selectedItems.length} selected</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download</Button>
              <Button variant="outline" size="sm"><Move className="w-4 h-4 mr-2" />Move</Button>
              <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-2" />Copy</Button>
              <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Grid/List */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[400px] rounded-xl transition-all ${
          isDragging 
            ? "bg-primary/10 border-2 border-dashed border-primary" 
            : "bg-card/30 border border-border/30"
        }`}
      >
        {isDragging ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Upload className="w-16 h-16 text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Drop files here to upload</p>
            <p className="text-sm text-muted-foreground">Files will be encrypted automatically</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => {
              const Icon = getFileIcon(item.type);
              const isSelected = selectedItems.includes(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-card/50 border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => handleFolderClick(item)}
                >
                  <div 
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); toggleItemSelection(item.id); }}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {item.isStarred && (
                    <Star className="absolute top-2 right-2 w-4 h-4 text-amber-500 fill-amber-500" />
                  )}

                  <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                    item.type === "folder" && item.color
                      ? `bg-gradient-to-br ${item.color}`
                      : "bg-muted/50"
                  }`}>
                    <Icon className={`w-8 h-8 ${item.type === "folder" ? "text-white" : "text-muted-foreground"}`} />
                  </div>

                  <p className="text-sm font-medium text-foreground text-center truncate">{item.name}</p>
                  
                  {item.size && (
                    <p className="text-xs text-muted-foreground text-center mt-1">{item.size}</p>
                  )}

                  {item.isEncrypted && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Lock className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">Encrypted</span>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                      <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Download</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Rename</DropdownMenuItem>
                      <DropdownMenuItem><Move className="w-4 h-4 mr-2" />Move</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                      <DropdownMenuItem><Tag className="w-4 h-4 mr-2" />Add Tags</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredItems.map((item) => {
              const Icon = getFileIcon(item.type);
              const isSelected = selectedItems.includes(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                  className={`flex items-center gap-4 p-4 cursor-pointer ${
                    isSelected ? "bg-primary/10" : ""
                  }`}
                  onClick={() => handleFolderClick(item)}
                >
                  <div onClick={(e) => { e.stopPropagation(); toggleItemSelection(item.id); }}>
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === "folder" && item.color
                      ? `bg-gradient-to-br ${item.color}`
                      : "bg-muted/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${item.type === "folder" ? "text-white" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="w-20">{item.size || "—"}</span>
                    <span className="w-24 flex items-center gap-1"><Clock className="w-3 h-3" />{item.modified}</span>
                    {item.isEncrypted && <Lock className="w-4 h-4 text-green-500" />}
                    {item.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Download</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Rename</DropdownMenuItem>
                      <DropdownMenuItem><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">{previewItem.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center mb-4">
                {previewItem.type === "image" ? (
                  <ImageIcon className="w-24 h-24 text-muted-foreground/50" />
                ) : previewItem.type === "video" ? (
                  <Video className="w-24 h-24 text-muted-foreground/50" />
                ) : (
                  <FileText className="w-24 h-24 text-muted-foreground/50" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground capitalize">{previewItem.type}</span>
                </div>
                {previewItem.size && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{previewItem.size}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Modified</span>
                  <span className="text-foreground">{previewItem.modified}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Encryption</span>
                  <Badge variant="outline" className="text-green-500 border-green-500/50">
                    <Lock className="w-3 h-3 mr-1" />AES-256
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </Button>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
