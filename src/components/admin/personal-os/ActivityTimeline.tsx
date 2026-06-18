import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Plus, Edit2, Trash2, CheckCircle2, BookOpen,
  Wallet, Shield, Heart, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  module: string;
  action: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface ActivityTimelineProps {
  limit?: number;
}

const moduleIcons: Record<string, any> = {
  todos: CheckCircle2,
  study: BookOpen,
  loans: Wallet,
  insurance: Shield,
  lifespan: Heart
};

const moduleColors: Record<string, string> = {
  todos: "text-emerald-500 bg-emerald-500/10",
  study: "text-blue-500 bg-blue-500/10",
  loans: "text-amber-500 bg-amber-500/10",
  insurance: "text-purple-500 bg-purple-500/10",
  lifespan: "text-rose-500 bg-rose-500/10"
};

const actionLabels: Record<string, { label: string; color: string }> = {
  create: { label: "Created", color: "bg-emerald-500/10 text-emerald-500" },
  update: { label: "Updated", color: "bg-blue-500/10 text-blue-500" },
  delete: { label: "Deleted", color: "bg-red-500/10 text-red-500" }
};

const ActivityTimeline = ({ limit }: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = limit || 20;

  useEffect(() => {
    fetchActivities();
  }, [page, limit]);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.range(page * pageSize, (page + 1) * pageSize - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      if (page === 0 || limit) {
        setActivities(data as ActivityLog[] || []);
      } else {
        setActivities(prev => [...prev, ...(data as ActivityLog[] || [])]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    const { module, action, new_values, old_values } = activity;
    
    switch (action) {
      case 'create':
        if (module === 'todos') return `Added task: "${new_values?.title || 'Unknown'}"`;
        if (module === 'study') return `Logged ${new_values?.duration_minutes || 0}m studying ${new_values?.subject || 'Unknown'}`;
        if (module === 'loans') return `Added loan: ${new_values?.lender_name || 'Unknown'}`;
        if (module === 'insurance') return `Added policy: ${new_values?.policy_name || 'Unknown'}`;
        if (module === 'lifespan') return `Added achievement: "${new_values?.title || 'Unknown'}"`;
        return 'Created new record';
      
      case 'update':
        if (module === 'todos' && old_values?.status !== new_values?.status) {
          return `Marked task as ${new_values?.status}`;
        }
        return 'Updated record';
      
      case 'delete':
        return 'Deleted record';
      
      default:
        return 'Activity recorded';
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = format(parseISO(activity.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a));

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>No activity recorded yet</p>
        <p className="text-xs">Your actions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date}>
          <h4 className="text-xs font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
            {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
          </h4>
          <div className="space-y-2">
            {groupedActivities[date].map((activity, index) => {
              const Icon = moduleIcons[activity.module] || Activity;
              const actionInfo = actionLabels[activity.action] || { label: activity.action, color: "bg-muted" };
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-all"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${moduleColors[activity.module] || 'bg-muted'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.module}
                      </Badge>
                      <Badge className={`text-xs ${actionInfo.color}`}>
                        {actionInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{getActivityDescription(activity)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {!limit && activities.length >= (page + 1) * pageSize && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
