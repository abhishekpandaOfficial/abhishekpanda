import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Plus,
  Play,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Zap,
  Mail,
  Database,
  FileText,
  BarChart3,
  MoreVertical,
  History,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface JobExecution {
  id: string;
  job_id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  duration_ms: number | null;
  output: string | null;
  error: string | null;
}

interface ScheduledJob {
  id: string;
  name: string;
  description: string | null;
  schedule: string;
  schedule_description: string | null;
  job_type: string;
  edge_function_name: string | null;
  payload: unknown;
  is_active: boolean;
  cron_job_id: number | null;
  last_run: string | null;
  next_run: string | null;
  run_count: number;
  success_count: number;
  fail_count: number;
  created_at: string;
}

const JOB_TYPES = [
  { value: "analytics_report", label: "Analytics Report", icon: BarChart3 },
  { value: "cleanup", label: "Data Cleanup", icon: Trash2 },
  { value: "backup_check", label: "Backup Check", icon: Database },
  { value: "newsletter", label: "Newsletter", icon: Mail },
  { value: "edge_function", label: "Edge Function", icon: Zap },
  { value: "report", label: "Generate Report", icon: FileText },
];

const SCHEDULE_PRESETS = [
  { value: "* * * * *", label: "Every minute" },
  { value: "*/5 * * * *", label: "Every 5 minutes" },
  { value: "0 * * * *", label: "Every hour" },
  { value: "0 0 * * *", label: "Daily at midnight" },
  { value: "0 9 * * *", label: "Daily at 9 AM" },
  { value: "0 9 * * 1", label: "Weekly on Monday at 9 AM" },
  { value: "0 0 1 * *", label: "Monthly on the 1st" },
];

const getJobIcon = (jobType: string) => {
  const type = JOB_TYPES.find(t => t.value === jobType);
  return type?.icon || Zap;
};

export const AdminScheduledJobs = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [newJob, setNewJob] = useState({
    name: "",
    description: "",
    job_type: "",
    schedule: "",
    edge_function_name: "",
  });

  // Fetch jobs and set up realtime subscription
  useEffect(() => {
    fetchJobs();
    
    const channel = supabase
      .channel("scheduled_jobs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scheduled_jobs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setJobs(prev => [payload.new as ScheduledJob, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setJobs(prev => prev.map(j => j.id === payload.new.id ? payload.new as ScheduledJob : j));
          } else if (payload.eventType === "DELETE") {
            setJobs(prev => prev.filter(j => j.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_executions" },
        (payload) => {
          setExecutions(prev => [payload.new as JobExecution, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("scheduled_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      const { data: execData } = await supabase
        .from("job_executions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(100);

      setExecutions(execData || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load scheduled jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleJob = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("scheduled_jobs")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Job activated" : "Job paused");
    } catch (error: any) {
      toast.error("Failed to update job status");
    }
  };

  const handleRunNow = async (job: ScheduledJob) => {
    setRunningJobs(prev => new Set(prev).add(job.id));
    
    try {
      const { data, error } = await supabase.functions.invoke("cron-executor", {
        body: {
          job_id: job.id,
          job_type: job.job_type,
          edge_function_name: job.edge_function_name,
          payload: job.payload,
        },
      });

      if (error) throw error;
      
      toast.success(`Job "${job.name}" executed successfully`);
      
      // Refresh jobs to get updated stats
      await fetchJobs();
    } catch (error: any) {
      console.error("Job execution error:", error);
      toast.error(`Failed to execute job: ${error.message}`);
    } finally {
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_jobs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Job deleted");
    } catch (error: any) {
      toast.error("Failed to delete job");
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.name || !newJob.job_type || !newJob.schedule) {
      toast.error("Please fill in all required fields");
      return;
    }

    const schedulePreset = SCHEDULE_PRESETS.find(s => s.value === newJob.schedule);

    try {
      const { error } = await supabase.from("scheduled_jobs").insert({
        name: newJob.name,
        description: newJob.description || null,
        schedule: newJob.schedule,
        schedule_description: schedulePreset?.label || newJob.schedule,
        job_type: newJob.job_type,
        edge_function_name: newJob.edge_function_name || null,
        is_active: false,
      });

      if (error) throw error;

      setIsCreateOpen(false);
      setNewJob({ name: "", description: "", job_type: "", schedule: "", edge_function_name: "" });
      toast.success("Job created successfully");
    } catch (error: any) {
      toast.error("Failed to create job");
    }
  };

  const getStatusIcon = (job: ScheduledJob) => {
    if (runningJobs.has(job.id)) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    const lastExec = executions.find(e => e.job_id === job.id);
    if (!lastExec) return <Clock className="w-4 h-4 text-muted-foreground" />;
    
    switch (lastExec.status) {
      case "running":
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const activeJobs = jobs.filter(j => j.is_active).length;
  const totalRuns = jobs.reduce((sum, j) => sum + (j.run_count || 0), 0);
  const totalSuccess = jobs.reduce((sum, j) => sum + (j.success_count || 0), 0);
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Clock className="w-7 h-7 text-primary" />
            Scheduled Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage automated tasks with pg_cron
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{jobs.length}</div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{activeJobs}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{totalRuns.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Executions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <Progress value={successRate} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Scheduled Jobs</h3>
            <p className="text-muted-foreground mb-4">Create your first automated task</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {jobs.map((job, index) => {
              const Icon = getJobIcon(job.job_type);
              const isRunning = runningJobs.has(job.id);
              
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "overflow-hidden transition-all",
                    isRunning && "ring-2 ring-blue-500/50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          job.is_active ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "w-6 h-6",
                            job.is_active ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{job.name}</h3>
                            {getStatusIcon(job)}
                            <Badge variant="outline" className="text-xs">
                              {job.job_type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {job.description || "No description"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {job.schedule_description || job.schedule}
                            </span>
                            <span className="flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {job.last_run
                                ? `Last: ${new Date(job.last_run).toLocaleString()}`
                                : "Never run"}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{job.run_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Runs</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-500">{job.success_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Success</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-500">{job.fail_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Failed</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={job.is_active}
                            onCheckedChange={(checked) => handleToggleJob(job.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRunNow(job)}
                            disabled={isRunning}
                          >
                            {isRunning ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                                <History className="w-4 h-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Recent Executions */}
      {executions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Executions
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executions.slice(0, 10).map((exec) => {
                const job = jobs.find(j => j.id === exec.job_id);
                return (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {exec.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : exec.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      <span className="text-sm font-medium">{job?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {exec.duration_ms && <span>{exec.duration_ms}ms</span>}
                      <span>{new Date(exec.started_at).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Job Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Scheduled Job</DialogTitle>
            <DialogDescription>
              Set up a new automated task with pg_cron
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Job Name *</Label>
              <Input
                value={newJob.name}
                onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                placeholder="e.g., Daily Analytics Report"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="What does this job do?"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Type *</Label>
              <Select
                value={newJob.job_type}
                onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newJob.job_type === "edge_function" && (
              <div className="space-y-2">
                <Label>Edge Function Name</Label>
                <Input
                  value={newJob.edge_function_name}
                  onChange={(e) => setNewJob({ ...newJob, edge_function_name: e.target.value })}
                  placeholder="e.g., my-function"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Schedule *</Label>
              <Select
                value={newJob.schedule}
                onValueChange={(value) => setNewJob({ ...newJob, schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label} ({preset.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>Create Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.name}</DialogTitle>
            <DialogDescription>
              Job configuration and execution history
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Schedule</Label>
                  <p className="font-medium">{selectedJob.schedule_description}</p>
                  <code className="text-xs text-muted-foreground">{selectedJob.schedule}</code>
                </div>
                <div>
                  <Label className="text-muted-foreground">Job Type</Label>
                  <p className="font-medium capitalize">{selectedJob.job_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Runs</Label>
                  <p className="font-medium">{selectedJob.run_count}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Success Rate</Label>
                  <p className="font-medium">
                    {selectedJob.run_count > 0
                      ? Math.round((selectedJob.success_count / selectedJob.run_count) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Recent Executions</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {executions
                    .filter(e => e.job_id === selectedJob.id)
                    .slice(0, 10)
                    .map((exec) => (
                      <div
                        key={exec.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {exec.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : exec.status === "failed" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          )}
                          <div>
                            <p className="text-sm font-medium capitalize">{exec.status}</p>
                            {exec.error && (
                              <p className="text-xs text-red-500">{exec.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {exec.duration_ms && <p>{exec.duration_ms}ms</p>}
                          <p>{new Date(exec.started_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScheduledJobs;
