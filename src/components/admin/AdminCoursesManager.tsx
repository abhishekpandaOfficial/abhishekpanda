import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  GraduationCap,
  Users,
  IndianRupee,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Image,
  Video,
  FileText,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  id: string;
  title: string;
  lessons: { id: string; title: string; duration: string; isFree: boolean; type: "video" | "text" | "quiz" }[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  level: string;
  duration: string;
  price: number;
  priceCurrency?: string;
  isPremium: boolean;
  isPublished: boolean;
  studentsCount: number;
  rating: number;
  reviewsCount?: number;
  tags?: string[];
  outcomes?: string[];
  requirements?: string[];
  modules: Module[];
  oneToOneEnabled?: boolean;
  oneToOnePriceInr?: number | null;
  oneToOneDurationMinutes?: number | null;
  oneToOneStartHourIst?: number | null;
  oneToOneEndHourIst?: number | null;
  oneToOnePayAfterSchedule?: boolean | null;
}

const mapFromDb = (row: any): Course => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  description: row.description || "",
  longDescription: row.long_description || "",
  thumbnail: row.thumbnail || "",
  level: row.level || "Beginner",
  duration: row.duration || "0 hours",
  price: row.price_amount || 0,
  priceCurrency: row.price_currency || "INR",
  isPremium: !!row.is_premium,
  isPublished: !!row.is_published,
  studentsCount: row.students_count || 0,
  rating: Number(row.rating || 0),
  reviewsCount: row.reviews_count || 0,
  tags: row.tags || [],
  outcomes: row.outcomes || [],
  requirements: row.requirements || [],
  modules: Array.isArray(row.modules) ? row.modules : row.modules || [],
  oneToOneEnabled: row.one_to_one_enabled ?? true,
  oneToOnePriceInr: row.one_to_one_price_inr ?? null,
  oneToOneDurationMinutes: row.one_to_one_duration_minutes ?? 60,
  oneToOneStartHourIst: row.one_to_one_start_hour_ist ?? 20,
  oneToOneEndHourIst: row.one_to_one_end_hour_ist ?? 24,
  oneToOnePayAfterSchedule: row.one_to_one_pay_after_schedule ?? true,
});

const mapToDb = (course: Course) => ({
  id: course.id || undefined,
  title: course.title,
  slug: course.slug,
  description: course.description,
  long_description: course.longDescription || course.description,
  thumbnail: course.thumbnail || null,
  duration: course.duration,
  level: course.level,
  price_amount: course.price || 0,
  price_currency: course.priceCurrency || "INR",
  is_premium: !!course.isPremium,
  is_published: !!course.isPublished,
  tags: course.tags || [],
  modules: course.modules || [],
  outcomes: course.outcomes || [],
  requirements: course.requirements || [],
  students_count: course.studentsCount || 0,
  rating: course.rating || 0,
  reviews_count: course.reviewsCount || 0,
  one_to_one_enabled: course.oneToOneEnabled ?? true,
  one_to_one_price_inr: course.oneToOnePriceInr ?? null,
  one_to_one_duration_minutes: course.oneToOneDurationMinutes ?? 60,
  one_to_one_start_hour_ist: course.oneToOneStartHourIst ?? 20,
  one_to_one_end_hour_ist: course.oneToOneEndHourIst ?? 24,
  one_to_one_pay_after_schedule: course.oneToOnePayAfterSchedule ?? true,
});

export const AdminCoursesManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data || []).map(mapFromDb);
      setCourses(rows);
      if (!selectedCourse && rows.length) setSelectedCourse(rows[0]);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return courses.filter(course => course.title.toLowerCase().includes(q));
  }, [courses, searchQuery]);

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.isPublished).length,
    totalStudents: courses.reduce((sum, c) => sum + c.studentsCount, 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * c.studentsCount * 0.1), 0),
  };

  const handleCreateCourse = () => {
    const newCourse: Course = {
      id: "",
      title: "New Course",
      slug: "new-course",
      description: "",
      longDescription: "",
      thumbnail: "",
      level: "Beginner",
      duration: "0 hours",
      price: 0,
      priceCurrency: "INR",
      isPremium: false,
      isPublished: false,
      studentsCount: 0,
      rating: 0,
      reviewsCount: 0,
      tags: [],
      outcomes: [],
      requirements: [],
      modules: []
    };
    setSelectedCourse(newCourse);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const payload = mapToDb(selectedCourse);
      if (selectedCourse.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", selectedCourse.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("courses").insert(payload).select("*").single();
        if (error) throw error;
        if (data) setSelectedCourse(mapFromDb(data));
      }
      toast.success("Course saved.");
      setIsEditing(false);
      await loadCourses();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save course.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse?.id) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", selectedCourse.id);
      if (error) throw error;
      toast.success("Course deleted.");
      setSelectedCourse(null);
      await loadCourses();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete course.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModule = () => {
    if (!selectedCourse) return;
    const newModule: Module = {
      id: `mod-${Date.now()}`,
      title: "New Module",
      lessons: []
    };
    setSelectedCourse({
      ...selectedCourse,
      modules: [...selectedCourse.modules, newModule]
    });
  };

  const handleAddLesson = (moduleId: string) => {
    if (!selectedCourse) return;
    const updatedModules = selectedCourse.modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: [...mod.lessons, {
            id: `les-${Date.now()}`,
            title: "New Lesson",
            duration: "00:00",
            isFree: false,
            type: "video" as const
          }]
        };
      }
      return mod;
    });
    setSelectedCourse({ ...selectedCourse, modules: updatedModules });
  };

  const handlePublishToggle = (checked: boolean) => {
    if (checked && !selectedCourse?.isPublished) {
      setSelectedCourse({ ...selectedCourse, isPublished: true });
      supabase
        .from("courses")
        .update({ is_published: true })
        .eq("id", selectedCourse.id)
        .then(({ error }) => {
          if (error) toast.error("Failed to publish course.");
          else loadCourses();
        });
      return;
    }
    if (!selectedCourse) return;
    setSelectedCourse({ ...selectedCourse, isPublished: checked });
    supabase
      .from("courses")
      .update({ is_published: checked })
      .eq("id", selectedCourse.id)
      .then(({ error }) => {
        if (error) toast.error("Failed to update publish status.");
        else loadCourses();
      });
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.publishedCourses, icon: Eye, color: "from-green-500 to-green-600" },
          { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: Users, color: "from-purple-500 to-purple-600" },
          { label: "Est. Revenue", value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: IndianRupee, color: "from-amber-500 to-amber-600" }
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
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">All Courses</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setSelectedCourse(course); setIsEditing(false); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCourse?.id === course.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                    <GraduationCap className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${course.isPremium ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"} border-0`}>
                        {course.isPremium ? "Premium" : "Free"}
                      </Badge>
                      {course.isPublished ? (
                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Published</Badge>
                      ) : (
                        <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.studentsCount}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{course.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Course Editor */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {isEditing ? "Edit Course" : "Course Details"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
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
                          onClick={handleSave}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                      <Input
                        value={selectedCourse.title}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Slug</label>
                      <Input
                        value={selectedCourse.slug}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, slug: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                    <Textarea
                      value={selectedCourse.description}
                      disabled={!isEditing}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                      className="bg-background min-h-[100px]"
                    />
                  </div>

                  {/* Pricing & Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Price (₹)</label>
                      <Input
                        type="number"
                        value={selectedCourse.price}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, price: parseInt(e.target.value) })}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Level</label>
                      <Select
                        value={selectedCourse.level}
                        disabled={!isEditing}
                        onValueChange={(value) => setSelectedCourse({ ...selectedCourse, level: value })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                      <Input
                        value={selectedCourse.duration}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, duration: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Premium</label>
                        <Switch
                          checked={selectedCourse.isPremium}
                          disabled={!isEditing}
                          onCheckedChange={(checked) => setSelectedCourse({ ...selectedCourse, isPremium: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <label className="text-sm font-medium text-foreground">Published</label>
                        </div>
                        <Switch
                          checked={selectedCourse.isPublished}
                          disabled={!isEditing}
                          onCheckedChange={handlePublishToggle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1:1 Settings */}
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">1:1 Session Settings</h4>
                      </div>
                      <Switch
                        checked={selectedCourse.oneToOneEnabled ?? true}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => setSelectedCourse({ ...selectedCourse, oneToOneEnabled: checked })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">1:1 Fee (₹)</label>
                        <Input
                          type="number"
                          value={selectedCourse.oneToOnePriceInr ?? 0}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedCourse({ ...selectedCourse, oneToOnePriceInr: parseInt(e.target.value) })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Duration (min)</label>
                        <Input
                          type="number"
                          value={selectedCourse.oneToOneDurationMinutes ?? 60}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedCourse({ ...selectedCourse, oneToOneDurationMinutes: parseInt(e.target.value) })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Start Hour (IST)</label>
                        <Input
                          type="number"
                          value={selectedCourse.oneToOneStartHourIst ?? 20}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedCourse({ ...selectedCourse, oneToOneStartHourIst: parseInt(e.target.value) })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">End Hour (IST)</label>
                        <Input
                          type="number"
                          value={selectedCourse.oneToOneEndHourIst ?? 24}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedCourse({ ...selectedCourse, oneToOneEndHourIst: parseInt(e.target.value) })}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-2 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground">Pay after schedule confirmation</div>
                      <Switch
                        checked={selectedCourse.oneToOnePayAfterSchedule ?? true}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => setSelectedCourse({ ...selectedCourse, oneToOnePayAfterSchedule: checked })}
                      />
                    </div>
                  </div>

                  {/* Curriculum Builder */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground">Curriculum</h4>
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={handleAddModule}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Module
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedCourse.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border border-border rounded-lg overflow-hidden bg-background">
                          <div
                            className="flex items-center justify-between p-4 bg-muted cursor-pointer"
                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                {moduleIndex + 1}
                              </span>
                              {isEditing ? (
                                <Input
                                  value={module.title}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const updatedModules = selectedCourse.modules.map(m =>
                                      m.id === module.id ? { ...m, title: e.target.value } : m
                                    );
                                    setSelectedCourse({ ...selectedCourse, modules: updatedModules });
                                  }}
                                  className="bg-background h-8 w-64"
                                />
                              ) : (
                                <span className="font-medium text-foreground">{module.title}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                              {expandedModule === module.id ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedModule === module.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border"
                              >
                                <div className="p-4 space-y-2">
                                  {module.lessons.map((lesson, lessonIndex) => (
                                    <div key={lesson.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                      <span className="text-xs text-muted-foreground w-6">{moduleIndex + 1}.{lessonIndex + 1}</span>
                                      {lesson.type === "video" && <Video className="w-4 h-4 text-blue-500" />}
                                      {lesson.type === "text" && <FileText className="w-4 h-4 text-green-500" />}
                                      {lesson.type === "quiz" && <BookOpen className="w-4 h-4 text-purple-500" />}
                                      {isEditing ? (
                                        <Input
                                          value={lesson.title}
                                          onChange={(e) => {
                                            const updatedModules = selectedCourse.modules.map(m => {
                                              if (m.id === module.id) {
                                                return {
                                                  ...m,
                                                  lessons: m.lessons.map(l =>
                                                    l.id === lesson.id ? { ...l, title: e.target.value } : l
                                                  )
                                                };
                                              }
                                              return m;
                                            });
                                            setSelectedCourse({ ...selectedCourse, modules: updatedModules });
                                          }}
                                          className="bg-background h-8 flex-1"
                                        />
                                      ) : (
                                        <span className="text-sm text-foreground flex-1">{lesson.title}</span>
                                      )}
                                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                      {lesson.isFree && <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Free</Badge>}
                                    </div>
                                  ))}
                                  {isEditing && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddLesson(module.id)}
                                      className="w-full mt-2 border border-dashed border-border hover:border-primary"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Lesson
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {selectedCourse.modules.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No modules yet. {isEditing && "Click 'Add Module' to get started."}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Stats */}
                  {!isEditing && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-foreground mb-3">Course Statistics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Students</p>
                          <p className="text-foreground font-medium text-lg">{selectedCourse.studentsCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p className="text-foreground font-medium text-lg flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500" />{selectedCourse.rating}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="text-foreground font-medium text-lg">
                            ₹{((selectedCourse.price * selectedCourse.studentsCount * 0.1) / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] flex items-center justify-center bg-card border border-border rounded-xl"
              >
                <div className="text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Course Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a course from the list or create a new one</p>
                  <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
