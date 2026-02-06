import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, BookOpen, Wallet, Shield, Heart,
  TrendingUp, Calendar, Clock, Target, Activity,
  Plus, ArrowRight, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, differenceInYears, startOfDay } from "date-fns";

import TodoTracker from "./TodoTracker";
import StudyTracker from "./StudyTracker";
import LoanTracker from "./LoanTracker";
import InsuranceTracker from "./InsuranceTracker";
import LifespanTracker from "./LifespanTracker";
import ActivityTimeline from "./ActivityTimeline";

interface DashboardStats {
  todayTodos: { total: number; completed: number };
  studyMinutesToday: number;
  emiDueThisMonth: number;
  upcomingRenewals: number;
  daysRemaining: number;
  lifeProgress: number;
}

const PersonalOSDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    todayTodos: { total: 0, completed: 0 },
    studyMinutesToday: 0,
    emiDueThisMonth: 0,
    upcomingRenewals: 0,
    daysRemaining: 0,
    lifeProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      const currentMonth = format(new Date(), 'yyyy-MM');

      // Fetch today's todos
      const { data: todos } = await supabase
        .from('personal_todos')
        .select('status')
        .eq('user_id', user.id)
        .eq('due_date', today);

      // Fetch today's study time
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .eq('session_date', today);

      // Fetch active loans for EMI calculation
      const { data: loans } = await supabase
        .from('loans')
        .select('emi_amount')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Fetch upcoming renewals (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { data: renewals } = await supabase
        .from('insurance_policies')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('renewal_date', format(thirtyDaysFromNow, 'yyyy-MM-dd'))
        .gte('renewal_date', today);

      // Fetch life settings
      const { data: lifeSettings } = await supabase
        .from('life_settings')
        .select('date_of_birth, target_lifespan_years')
        .eq('user_id', user.id)
        .single();

      let daysRemaining = 0;
      let lifeProgress = 0;

      if (lifeSettings) {
        const dob = new Date(lifeSettings.date_of_birth);
        const targetDate = new Date(dob);
        targetDate.setFullYear(targetDate.getFullYear() + lifeSettings.target_lifespan_years);
        
        const totalDays = differenceInDays(targetDate, dob);
        const daysLived = differenceInDays(new Date(), dob);
        daysRemaining = Math.max(0, totalDays - daysLived);
        lifeProgress = Math.min(100, (daysLived / totalDays) * 100);
      }

      setStats({
        todayTodos: {
          total: todos?.length || 0,
          completed: todos?.filter(t => t.status === 'completed').length || 0
        },
        studyMinutesToday: studySessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
        emiDueThisMonth: loans?.reduce((sum, l) => sum + Number(l.emi_amount), 0) || 0,
        upcomingRenewals: renewals?.length || 0,
        daysRemaining,
        lifeProgress
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const todoCompletionRate = stats.todayTodos.total > 0 
    ? Math.round((stats.todayTodos.completed / stats.todayTodos.total) * 100)
    : 0;

  const modules = [
    { id: "todos", label: "Todos", icon: CheckCircle2, color: "text-emerald-500" },
    { id: "study", label: "Study", icon: BookOpen, color: "text-blue-500" },
    { id: "loans", label: "Loans", icon: Wallet, color: "text-amber-500" },
    { id: "insurance", label: "Insurance", icon: Shield, color: "text-purple-500" },
    { id: "lifespan", label: "Lifespan", icon: Heart, color: "text-rose-500" },
    { id: "activity", label: "Activity", icon: Activity, color: "text-slate-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Personal OS
          </h1>
          <p className="text-muted-foreground mt-1">Your life command center</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {format(new Date(), 'EEEE, dd MMM yyyy')}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs">
            <Target className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          {modules.map(module => (
            <TabsTrigger key={module.id} value={module.id} className="text-xs">
              <module.icon className={`h-4 w-4 mr-1 ${module.color}`} />
              {module.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Today's Tasks</p>
                      <p className="text-2xl font-bold">{todoCompletionRate}%</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                  </div>
                  <Progress value={todoCompletionRate} className="mt-2 h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.todayTodos.completed}/{stats.todayTodos.total} completed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Study Today</p>
                      <p className="text-2xl font-bold">{stats.studyMinutesToday}m</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500/20" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {Math.floor(stats.studyMinutesToday / 60)}h {stats.studyMinutesToday % 60}m total
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">EMI Due</p>
                      <p className="text-2xl font-bold">₹{stats.emiDueThisMonth.toLocaleString()}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-amber-500/20" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">This month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className={`border-l-4 ${stats.upcomingRenewals > 0 ? 'border-l-red-500' : 'border-l-purple-500'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Renewals</p>
                      <p className="text-2xl font-bold">{stats.upcomingRenewals}</p>
                    </div>
                    {stats.upcomingRenewals > 0 ? (
                      <AlertCircle className="h-8 w-8 text-red-500/40" />
                    ) : (
                      <Shield className="h-8 w-8 text-purple-500/20" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Next 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-l-4 border-l-rose-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Days Left</p>
                      <p className="text-2xl font-bold">{stats.daysRemaining.toLocaleString()}</p>
                    </div>
                    <Heart className="h-8 w-8 text-rose-500/20" />
                  </div>
                  <Progress value={stats.lifeProgress} className="mt-2 h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.lifeProgress.toFixed(1)}% lived
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {modules.map(module => (
              <Button
                key={module.id}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveTab(module.id)}
              >
                <module.icon className={`h-6 w-6 ${module.color}`} />
                <span className="text-xs">{module.label}</span>
              </Button>
            ))}
          </div>

          {/* Recent Activity Preview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ActivityTimeline limit={5} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Tabs */}
        <TabsContent value="todos">
          <TodoTracker onUpdate={fetchDashboardStats} />
        </TabsContent>
        <TabsContent value="study">
          <StudyTracker onUpdate={fetchDashboardStats} />
        </TabsContent>
        <TabsContent value="loans">
          <LoanTracker onUpdate={fetchDashboardStats} />
        </TabsContent>
        <TabsContent value="insurance">
          <InsuranceTracker onUpdate={fetchDashboardStats} />
        </TabsContent>
        <TabsContent value="lifespan">
          <LifespanTracker onUpdate={fetchDashboardStats} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalOSDashboard;
