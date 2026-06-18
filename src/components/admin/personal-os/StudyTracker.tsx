import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, BookOpen, Clock, Calendar, Edit2, Trash2, TrendingUp, Target
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, differenceInDays } from "date-fns";

interface StudySession {
  id: string;
  subject: string;
  topic: string | null;
  duration_minutes: number;
  session_date: string;
  notes: string | null;
  created_at: string;
}

interface StudyTrackerProps {
  onUpdate?: () => void;
}

const StudyTracker = ({ onUpdate }: StudyTrackerProps) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    duration_minutes: 30,
    session_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, [viewMode]);

  const getDateRange = () => {
    const now = new Date();
    switch (viewMode) {
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: monthStart, end: monthEnd };
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      default:
        return { start: now, end: now };
    }
  };

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { start, end } = getDateRange();
      
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_date', format(start, 'yyyy-MM-dd'))
        .lte('session_date', format(end, 'yyyy-MM-dd'))
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data as StudySession[] || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: 'create' | 'update' | 'delete', recordId: string, oldValues?: any, newValues?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      module: 'study',
      action,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingSession) {
        const { error } = await supabase
          .from('study_sessions')
          .update({
            subject: formData.subject,
            topic: formData.topic || null,
            duration_minutes: formData.duration_minutes,
            session_date: formData.session_date,
            notes: formData.notes || null
          })
          .eq('id', editingSession.id);

        if (error) throw error;
        await logActivity('update', editingSession.id, editingSession, formData);
        toast({ title: "Updated", description: "Study session updated" });
      } else {
        const { data, error } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            subject: formData.subject,
            topic: formData.topic || null,
            duration_minutes: formData.duration_minutes,
            session_date: formData.session_date,
            notes: formData.notes || null
          })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, formData);
        toast({ title: "Logged", description: "Study session recorded" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSessions();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({ title: "Error", description: "Failed to save session", variant: "destructive" });
    }
  };

  const handleDelete = async (session: StudySession) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;
      await logActivity('delete', session.id, session, null);
      
      toast({ title: "Deleted", description: "Session removed" });
      fetchSessions();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      topic: "",
      duration_minutes: 30,
      session_date: format(new Date(), 'yyyy-MM-dd'),
      notes: ""
    });
    setEditingSession(null);
  };

  const openEditDialog = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      subject: session.subject,
      topic: session.topic || "",
      duration_minutes: session.duration_minutes,
      session_date: session.session_date,
      notes: session.notes || ""
    });
    setIsDialogOpen(true);
  };

  // Calculate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const subjectBreakdown = sessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration_minutes;
    return acc;
  }, {} as Record<string, number>);

  const sortedSubjects = Object.entries(subjectBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    const dates = [...new Set(sessions.map(s => s.session_date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of dates) {
      const date = parseISO(dateStr);
      const diff = differenceInDays(currentDate, date);
      
      if (diff <= 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Weekly heatmap data
  const { start: weekStart, end: weekEnd } = { start: startOfWeek(new Date()), end: endOfWeek(new Date()) };
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dailyMinutes = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return sessions
      .filter(s => s.session_date === dayStr)
      .reduce((sum, s) => sum + s.duration_minutes, 0);
  });

  const maxDailyMinutes = Math.max(...dailyMinutes, 60);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-primary">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
            <p className="text-xs text-muted-foreground">Total Study Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-amber-500">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">
              {sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0}m
            </p>
            <p className="text-xs text-muted-foreground">Avg Session</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{format(day, 'EEE')}</p>
                <div 
                  className="h-16 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: dailyMinutes[i] > 0 
                      ? `hsl(var(--primary) / ${Math.min(dailyMinutes[i] / maxDailyMinutes, 1)})`
                      : 'hsl(var(--muted))'
                  }}
                >
                  <span className={`text-xs font-medium ${dailyMinutes[i] > 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {dailyMinutes[i] > 0 ? `${dailyMinutes[i]}m` : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Breakdown */}
      {sortedSubjects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedSubjects.map(([subject, minutes]) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{subject}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(minutes / 60)}h {minutes % 60}m
                    </span>
                  </div>
                  <Progress value={(minutes / totalMinutes) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Log Session
        </Button>
      </div>

      {/* Sessions List */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No study sessions recorded</p>
              <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Log your first session
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{session.subject}</p>
                    {session.topic && (
                      <p className="text-xs text-muted-foreground truncate">{session.topic}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration_minutes}m
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(parseISO(session.session_date), 'dd MMM')}
                    </Badge>
                  </div>

                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(session)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(session)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Log Study Session"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Mathematics, Physics"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Topic (optional)</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Calculus, Thermodynamics"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What did you learn?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.subject.trim()}>
              {editingSession ? "Update" : "Log Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyTracker;
