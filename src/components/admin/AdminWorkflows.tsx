import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Mail,
  MessageSquare,
  Download,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Shield,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { BiometricVerificationModal } from "./BiometricVerificationModal";

interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition";
  name: string;
  config: Record<string, any>;
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  lastRun: string | null;
  runCount: number;
  status: "idle" | "running" | "success" | "error";
  steps: WorkflowStep[];
}

const TRIGGER_OPTIONS = [
  { value: "contact_request", label: "New Contact Request", icon: MessageSquare },
  { value: "cv_download", label: "CV Downloaded", icon: Download },
  { value: "payment_received", label: "Payment Received", icon: Zap },
  { value: "schedule", label: "Scheduled Time", icon: Clock },
];

const ACTION_OPTIONS = [
  { value: "send_email", label: "Send Email", icon: Mail },
  { value: "webhook", label: "Call Webhook", icon: Zap },
  { value: "notify", label: "Send Notification", icon: AlertCircle },
  { value: "update_db", label: "Update Database", icon: RefreshCw },
];

const DEFAULT_WORKFLOWS: WorkflowItem[] = [
  {
    id: "1",
    name: "Contact Request Auto-Reply",
    description: "Automatically send a thank you email when someone submits a contact form",
    trigger: "contact_request",
    isActive: true,
    lastRun: new Date().toISOString(),
    runCount: 145,
    status: "success",
    steps: [
      { id: "s1", type: "trigger", name: "Contact Form Submitted", config: {} },
      { id: "s2", type: "action", name: "Send Thank You Email", config: { template: "contact_thankyou" } },
    ],
  },
  {
    id: "2",
    name: "CV Download Tracker",
    description: "Track and log all CV downloads with visitor information",
    trigger: "cv_download",
    isActive: true,
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    runCount: 89,
    status: "success",
    steps: [
      { id: "s1", type: "trigger", name: "CV Downloaded", config: {} },
      { id: "s2", type: "action", name: "Send Alert Email", config: {} },
      { id: "s3", type: "action", name: "Log to Analytics", config: {} },
    ],
  },
  {
    id: "3",
    name: "Payment Confirmation",
    description: "Send invoice and confirmation email after successful payment",
    trigger: "payment_received",
    isActive: false,
    lastRun: null,
    runCount: 0,
    status: "idle",
    steps: [
      { id: "s1", type: "trigger", name: "Payment Received", config: {} },
      { id: "s2", type: "action", name: "Generate Invoice", config: {} },
      { id: "s3", type: "action", name: "Send Confirmation Email", config: {} },
    ],
  },
  {
    id: "4",
    name: "Daily Analytics Report",
    description: "Send daily summary of website analytics at 9 AM",
    trigger: "schedule",
    isActive: true,
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    runCount: 30,
    status: "success",
    steps: [
      { id: "s1", type: "trigger", name: "Daily at 9:00 AM", config: { cron: "0 9 * * *" } },
      { id: "s2", type: "action", name: "Compile Analytics", config: {} },
      { id: "s3", type: "action", name: "Send Report Email", config: {} },
    ],
  },
];

export const AdminWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(DEFAULT_WORKFLOWS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger: "",
  });
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Real-time subscription for workflow executions
  useEffect(() => {
    const channel = supabase
      .channel("workflow-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_requests" },
        () => {
          // Simulate workflow trigger
          setWorkflows((prev) =>
            prev.map((w) =>
              w.trigger === "contact_request" && w.isActive
                ? { ...w, lastRun: new Date().toISOString(), runCount: w.runCount + 1, status: "success" as const }
                : w
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleWorkflow = (id: string, isActive: boolean) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive } : w))
    );
    toast.success(isActive ? "Workflow activated" : "Workflow paused");
  };

  const handleRunWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: "running" as const } : w
      )
    );
    
    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, status: "success" as const, lastRun: new Date().toISOString(), runCount: w.runCount + 1 }
            : w
        )
      );
      toast.success("Workflow executed successfully");
    }, 2000);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    toast.success("Workflow deleted");
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.trigger) {
      toast.error("Please fill in all required fields");
      return;
    }

    const workflow: WorkflowItem = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: newWorkflow.trigger,
      isActive: false,
      lastRun: null,
      runCount: 0,
      status: "idle",
      steps: [
        { id: "s1", type: "trigger", name: TRIGGER_OPTIONS.find((t) => t.value === newWorkflow.trigger)?.label || "", config: {} },
      ],
    };

    setWorkflows((prev) => [...prev, workflow]);
    setIsCreateOpen(false);
    setNewWorkflow({ name: "", description: "", trigger: "" });
    toast.success("Workflow created successfully");
  };

  const getStatusIcon = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "running":
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTriggerIcon = (trigger: string) => {
    const option = TRIGGER_OPTIONS.find((t) => t.value === trigger);
    return option ? option.icon : Zap;
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
          title="Access AETHERGRID"
          subtitle="Verify identity to manage automation workflows"
          moduleName="AETHERGRID"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
            <Workflow className="w-10 h-10 text-cyan-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">AETHERGRID Protected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Biometric verification required to access automation workflows
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Workflow className="w-7 h-7 text-primary" />
            Automation Workflows
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage automated workflows for your website
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{workflows.length}</div>
            <p className="text-sm text-muted-foreground">Total Workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {workflows.filter((w) => w.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">
              {workflows.reduce((sum, w) => sum + w.runCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Executions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">
              {workflows.filter((w) => w.status === "success").length}
            </div>
            <p className="text-sm text-muted-foreground">Successful Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        <AnimatePresence>
          {workflows.map((workflow, index) => {
            const TriggerIcon = getTriggerIcon(workflow.trigger);
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.isActive ? "bg-primary/10" : "bg-muted"}`}>
                        <TriggerIcon className={`w-6 h-6 ${workflow.isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{workflow.name}</h3>
                          {getStatusIcon(workflow.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workflow.lastRun
                              ? `Last: ${new Date(workflow.lastRun).toLocaleString()}`
                              : "Never run"}
                          </span>
                          <span>{workflow.runCount} executions</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          disabled={workflow.status === "running"}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedWorkflow(workflow)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Steps Preview */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {workflow.steps.map((step, i) => (
                          <div key={step.id} className="flex items-center">
                            <Badge variant="outline" className="whitespace-nowrap">
                              {step.name}
                            </Badge>
                            {i < workflow.steps.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Set up an automated workflow to respond to events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="e.g., Auto-reply to contacts"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="What does this workflow do?"
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select
                value={newWorkflow.trigger}
                onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkflows;
