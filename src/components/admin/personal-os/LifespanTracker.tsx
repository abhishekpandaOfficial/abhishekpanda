import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Heart, Calendar, Trophy, Plus, Edit2, Trash2, Target,
  Clock, Star, Briefcase, GraduationCap, Users, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays, differenceInYears, differenceInMonths } from "date-fns";

interface LifeSettings {
  id: string;
  date_of_birth: string;
  target_lifespan_years: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  achievement_date: string;
  category: string;
  created_at: string;
}

interface LifespanTrackerProps {
  onUpdate?: () => void;
}

const categoryIcons: Record<string, any> = {
  career: Briefcase,
  finance: Target,
  health: Heart,
  personal: Star,
  education: GraduationCap,
  family: Users
};

const categoryColors: Record<string, string> = {
  career: "text-blue-500 bg-blue-500/10",
  finance: "text-amber-500 bg-amber-500/10",
  health: "text-emerald-500 bg-emerald-500/10",
  personal: "text-purple-500 bg-purple-500/10",
  education: "text-cyan-500 bg-cyan-500/10",
  family: "text-rose-500 bg-rose-500/10"
};

const LifespanTracker = ({ onUpdate }: LifespanTrackerProps) => {
  const [settings, setSettings] = useState<LifeSettings | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
  const [settingsForm, setSettingsForm] = useState({
    date_of_birth: "1992-05-08",
    target_lifespan_years: 60
  });

  const [achievementForm, setAchievementForm] = useState({
    title: "",
    description: "",
    achievement_date: format(new Date(), 'yyyy-MM-dd'),
    category: "personal"
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch life settings
      const { data: settingsData } = await supabase
        .from('life_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings(settingsData as LifeSettings);
        setSettingsForm({
          date_of_birth: settingsData.date_of_birth,
          target_lifespan_years: settingsData.target_lifespan_years
        });
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('life_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achievement_date', { ascending: false });

      setAchievements(achievementsData as Achievement[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: 'create' | 'update' | 'delete', recordId: string, oldValues?: any, newValues?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      module: 'lifespan',
      action,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  };

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (settings) {
        const { error } = await supabase
          .from('life_settings')
          .update({
            date_of_birth: settingsForm.date_of_birth,
            target_lifespan_years: settingsForm.target_lifespan_years
          })
          .eq('id', settings.id);

        if (error) throw error;
        await logActivity('update', settings.id, settings, settingsForm);
      } else {
        const { data, error } = await supabase
          .from('life_settings')
          .insert({
            user_id: user.id,
            date_of_birth: settingsForm.date_of_birth,
            target_lifespan_years: settingsForm.target_lifespan_years
          })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, settingsForm);
      }

      toast({ title: "Saved", description: "Life settings updated" });
      setIsSettingsDialogOpen(false);
      fetchData();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  };

  const handleSaveAchievement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingAchievement) {
        const { error } = await supabase
          .from('life_achievements')
          .update({
            title: achievementForm.title,
            description: achievementForm.description || null,
            achievement_date: achievementForm.achievement_date,
            category: achievementForm.category
          })
          .eq('id', editingAchievement.id);

        if (error) throw error;
        await logActivity('update', editingAchievement.id, editingAchievement, achievementForm);
        toast({ title: "Updated", description: "Achievement updated" });
      } else {
        const { data, error } = await supabase
          .from('life_achievements')
          .insert({
            user_id: user.id,
            title: achievementForm.title,
            description: achievementForm.description || null,
            achievement_date: achievementForm.achievement_date,
            category: achievementForm.category
          })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, achievementForm);
        toast({ title: "Added", description: "Achievement recorded!" });
      }

      setIsAchievementDialogOpen(false);
      resetAchievementForm();
      fetchData();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({ title: "Error", description: "Failed to save achievement", variant: "destructive" });
    }
  };

  const handleDeleteAchievement = async (achievement: Achievement) => {
    try {
      const { error } = await supabase
        .from('life_achievements')
        .delete()
        .eq('id', achievement.id);

      if (error) throw error;
      await logActivity('delete', achievement.id, achievement, null);
      
      toast({ title: "Deleted", description: "Achievement removed" });
      fetchData();
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      title: "",
      description: "",
      achievement_date: format(new Date(), 'yyyy-MM-dd'),
      category: "personal"
    });
    setEditingAchievement(null);
  };

  const openEditAchievementDialog = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description || "",
      achievement_date: achievement.achievement_date,
      category: achievement.category
    });
    setIsAchievementDialogOpen(true);
  };

  // Calculate life stats
  const calculateLifeStats = () => {
    if (!settings) return null;

    const dob = parseISO(settings.date_of_birth);
    const targetDate = new Date(dob);
    targetDate.setFullYear(targetDate.getFullYear() + settings.target_lifespan_years);
    
    const now = new Date();
    const totalDays = differenceInDays(targetDate, dob);
    const daysLived = differenceInDays(now, dob);
    const daysRemaining = Math.max(0, totalDays - daysLived);
    
    const yearsLived = differenceInYears(now, dob);
    const monthsLived = differenceInMonths(now, dob) % 12;
    
    const lifeProgress = Math.min(100, (daysLived / totalDays) * 100);

    return {
      dob,
      targetDate,
      totalDays,
      daysLived,
      daysRemaining,
      yearsLived,
      monthsLived,
      lifeProgress,
      yearsRemaining: settings.target_lifespan_years - yearsLived,
      weeksRemaining: Math.floor(daysRemaining / 7)
    };
  };

  const lifeStats = calculateLifeStats();

  // Group achievements by year
  const achievementsByYear = achievements.reduce((acc, a) => {
    const year = parseISO(a.achievement_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(a);
    return acc;
  }, {} as Record<number, Achievement[]>);

  const sortedYears = Object.keys(achievementsByYear).map(Number).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-rose-500/30" />
          <h3 className="text-xl font-semibold mb-2">Set Up Your Lifespan Tracker</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Track your life journey, celebrate achievements, and stay motivated with a visual countdown of your precious days.
          </p>
          <Button onClick={() => setIsSettingsDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" /> Configure Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lifespan Overview */}
      {lifeStats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden"
        >
          <Card className="bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10 border-rose-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Your Life Journey</h2>
                  <p className="text-muted-foreground">
                    Born {format(lifeStats.dob, 'dd MMMM yyyy')} • Target: {format(lifeStats.targetDate, 'dd MMMM yyyy')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSettingsDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>

              {/* Main Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Life Progress</span>
                  <span className="font-bold">{lifeStats.lifeProgress.toFixed(2)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lifeStats.lifeProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-3xl font-bold text-rose-500">{lifeStats.daysRemaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Days Remaining</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-500">{lifeStats.weeksRemaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Weeks Remaining</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-500">{lifeStats.yearsRemaining}</p>
                  <p className="text-xs text-muted-foreground">Years Remaining</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-500">{lifeStats.yearsLived}y {lifeStats.monthsLived}m</p>
                  <p className="text-xs text-muted-foreground">Age Lived</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Achievements Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Life Achievements</h3>
          <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
        </div>
        <Button onClick={() => { resetAchievementForm(); setIsAchievementDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Achievement
        </Button>
      </div>

      {achievements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No achievements recorded yet</p>
            <p className="text-xs">Start documenting your life's milestones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedYears.map(year => (
            <div key={year}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">{year}</h4>
              <div className="space-y-2">
                {achievementsByYear[year].map((achievement, index) => {
                  const Icon = categoryIcons[achievement.category] || Star;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${categoryColors[achievement.category]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{achievement.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.category}
                          </Badge>
                        </div>
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(parseISO(achievement.achievement_date), 'dd MMMM yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditAchievementDialog(achievement)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAchievement(achievement)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Life Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <Input
                type="date"
                value={settingsForm.date_of_birth}
                onChange={(e) => setSettingsForm({ ...settingsForm, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Lifespan (years)</label>
              <Input
                type="number"
                min={1}
                max={150}
                value={settingsForm.target_lifespan_years}
                onChange={(e) => setSettingsForm({ ...settingsForm, target_lifespan_years: parseInt(e.target.value) || 80 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is your personal goal - use it as motivation
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Achievement Dialog */}
      <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAchievement ? "Edit Achievement" : "Add Achievement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                placeholder="e.g., Completed MBA, Bought first home"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                placeholder="Tell the story..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={achievementForm.category} onValueChange={(v) => setAchievementForm({ ...achievementForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={achievementForm.achievement_date}
                  onChange={(e) => setAchievementForm({ ...achievementForm, achievement_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAchievement} disabled={!achievementForm.title.trim()}>
              {editingAchievement ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LifespanTracker;
