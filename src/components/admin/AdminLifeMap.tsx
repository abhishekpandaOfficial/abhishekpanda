import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  TreeDeciduous,
  Camera,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Edit3,
  Eye,
  Plus,
  Upload,
  Activity,
  Dumbbell,
  Pill,
  Utensils,
  Moon,
  Image,
  Star,
  Crown,
  Cloud,
  CloudOff,
  RefreshCw,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FamilyTreeDAG } from "./FamilyTreeDAG";
import { useFamilyMembers, FamilyMember } from "@/hooks/useFamilyMembers";

const getGenerationColor = (generation: number) => {
  switch (generation) {
    case 1: return "from-amber-500 to-orange-600";
    case 2: return "from-emerald-500 to-teal-600";
    case 3: return "from-blue-500 to-indigo-600";
    case 4: return "from-pink-500 to-rose-600";
    default: return "from-primary to-purple-600";
  }
};

export const AdminLifeMap = () => {
  const {
    familyMembers,
    loading,
    saveFamilyMember,
    initializeDatabase,
    refreshData,
    isAuthenticated,
  } = useFamilyMembers();

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editForm, setEditForm] = useState<FamilyMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const openEdit = (member: FamilyMember) => {
    setSelectedMember(member);
    setEditForm({ ...member });
    setIsEditMode(true);
  };

  const openPreview = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsPreviewMode(true);
  };

  const saveEdit = async () => {
    if (!editForm) return;
    setIsSaving(true);
    await saveFamilyMember(editForm);
    setIsEditMode(false);
    setEditForm(null);
    setIsSaving(false);
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload with Supabase Storage
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    await initializeDatabase();
    setIsSyncing(false);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await refreshData();
    setIsSyncing(false);
  };

  // Group members by generation for legend
  const generations = [1, 2, 3, 4].map(gen => ({
    generation: gen,
    label: gen === 1 ? "Grandparents" : gen === 2 ? "Parents" : gen === 3 ? "Self & Spouse" : "Children",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading family data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            LifeMap — Family OS
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Personal & Family profiles, health records, and memory albums
            {isAuthenticated ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                <Cloud className="w-3 h-3 mr-1" />
                Synced
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                <CloudOff className="w-3 h-3 mr-1" />
                Local Only
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="border-border/50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleSyncToCloud}
            disabled={isSyncing || !isAuthenticated}
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save to Cloud
          </Button>
        </div>
      </div>

      <Tabs defaultValue="family-tree" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/50 p-1">
          <TabsTrigger value="family-tree" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TreeDeciduous className="w-4 h-4 mr-2" />
            Family Tree
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4 mr-2" />
            Health Records
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Dumbbell className="w-4 h-4 mr-2" />
            Lifestyle
          </TabsTrigger>
          <TabsTrigger value="albums" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Image className="w-4 h-4 mr-2" />
            Memory Albums
          </TabsTrigger>
        </TabsList>

        {/* Family Tree Tab */}
        <TabsContent value="family-tree" className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            {generations.map(gen => (
              <div key={gen.generation} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getGenerationColor(gen.generation)}`} />
                <span className="text-xs text-muted-foreground">{gen.label}</span>
              </div>
            ))}
          </div>

          {/* DAG Family Tree Visualization */}
          <FamilyTreeDAG
            familyMembers={familyMembers}
            onEdit={openEdit}
            onPreview={openPreview}
          />
        </TabsContent>

        {/* Health Records Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Pill, label: "Medications", value: "3 Active", color: "from-red-500 to-rose-600" },
              { icon: Activity, label: "Last Checkup", value: "Nov 15, 2024", color: "from-emerald-500 to-teal-600" },
              { icon: Heart, label: "Blood Pressure", value: "120/80 mmHg", color: "from-pink-500 to-rose-600" },
              { icon: Dumbbell, label: "BMI", value: "23.5 (Normal)", color: "from-blue-500 to-indigo-600" },
              { icon: Moon, label: "Sleep Avg", value: "7.2 hrs", color: "from-violet-500 to-purple-600" },
              { icon: Utensils, label: "Calories/Day", value: "2,100 kcal", color: "from-amber-500 to-orange-600" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-bold text-foreground">{item.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Health Records Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Upload medical documents, prescriptions, and health reports for secure storage and easy access.</p>
              <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload Health Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Tab */}
        <TabsContent value="lifestyle" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Morning workout routine", "10,000 steps daily", "Weekly yoga sessions", "Monthly health checkup"].map((goal, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{goal}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Diet & Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Balanced vegetarian diet", "Intermittent fasting (16:8)", "Protein intake: 80g/day", "Hydration: 3L water/day"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs text-emerald-400">✓</span>
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Memory Albums Tab */}
        <TabsContent value="albums" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Preserve precious family moments</p>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Wedding Memories", count: 156, cover: null, date: "Feb 2021" },
              { name: "Aadhya's First Year", count: 243, cover: null, date: "2022-2023" },
              { name: "Family Vacations", count: 89, cover: null, date: "Various" },
              { name: "Festivals & Celebrations", count: 124, cover: null, date: "Ongoing" },
            ].map((album, i) => (
              <motion.div
                key={album.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{album.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{album.count} photos</span>
                      <Badge variant="outline" className="text-[10px]">{album.date}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
        <DialogContent className="bg-card border-border max-w-lg">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGenerationColor(selectedMember.generation)} flex items-center justify-center`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {selectedMember.name}
                </DialogTitle>
                <DialogDescription>{selectedMember.relationship}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getGenerationColor(selectedMember.generation)} p-1`}>
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                      {selectedMember.photo ? (
                        <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Calendar, label: "Date of Birth", value: selectedMember.dateOfBirth },
                    { icon: Briefcase, label: "Occupation", value: selectedMember.occupation },
                    { icon: Phone, label: "Phone", value: selectedMember.phone || "Not provided" },
                    { icon: Mail, label: "Email", value: selectedMember.email || "Not provided" },
                    { icon: MapPin, label: "Address", value: selectedMember.address || "Not provided" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <item.icon className="w-3 h-3" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <p className="text-sm text-foreground truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
                {selectedMember.notes && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground italic">"{selectedMember.notes}"</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewMode(false)}>Close</Button>
                <Button onClick={() => { setIsPreviewMode(false); openEdit(selectedMember); }} className={`bg-gradient-to-r ${getGenerationColor(selectedMember.generation)}`}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          {editForm && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Edit Family Member</DialogTitle>
                <DialogDescription>Update profile information for {editForm.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGenerationColor(editForm.generation)} p-1`}>
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                        {editForm.photo ? (
                          <img src={editForm.photo} alt={editForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary"
                      onClick={handlePhotoUpload}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Input
                      value={editForm.relationship}
                      onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        className="bg-muted/50 border-border"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="bg-muted/50 border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <Input
                      value={editForm.occupation}
                      onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <Label>Notes / Bio</Label>
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="bg-muted/50 border-border"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                <Button onClick={saveEdit} className={`bg-gradient-to-r ${getGenerationColor(editForm.generation)}`}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLifeMap;
