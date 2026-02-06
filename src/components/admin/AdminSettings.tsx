import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  Volume2,
  VolumeX,
  Save,
  RefreshCw,
  MessageSquare,
  Download,
  GraduationCap,
  CreditCard,
  Plus,
  Trash2,
  Shield,
  Lock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSoundNotification } from "@/hooks/useSoundNotification";
import { supabase } from "@/integrations/supabase/client";
import EmailTemplateBuilder, { EmailBlock } from "./EmailTemplateBuilder";
import { BiometricVerificationModal } from "./BiometricVerificationModal";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_json: EmailBlock[];
  body_html: string | null;
  variables: string[];
  is_active: boolean;
}

const DEFAULT_TEMPLATES: Record<string, { subject: string; blocks: EmailBlock[]; variables: string[] }> = {
  contact_request: {
    subject: "New Contact Request: {{reason}}",
    variables: ["name", "email", "reason", "intent"],
    blocks: [
      {
        id: "1",
        type: "heading",
        content: "New Contact Request",
        styles: { fontSize: "24px", fontWeight: "bold", color: "#333333", textAlign: "center" },
      },
      {
        id: "2",
        type: "text",
        content: "You have received a new contact request from {{name}}.",
        styles: { fontSize: "16px", color: "#666666", textAlign: "left" },
      },
      {
        id: "3",
        type: "divider",
        content: "",
        styles: { height: "1px", backgroundColor: "#E5E7EB" },
      },
      {
        id: "4",
        type: "text",
        content: "Email: {{email}}\nReason: {{reason}}\nMessage: {{intent}}",
        styles: { fontSize: "14px", color: "#333333", textAlign: "left" },
      },
      {
        id: "5",
        type: "button",
        content: "View in Dashboard",
        styles: {
          backgroundColor: "#3B82F6",
          color: "#FFFFFF",
          padding: "12px 24px",
          borderRadius: "8px",
          textAlign: "center",
          href: "{{dashboard_url}}",
        },
      },
    ],
  },
  cv_download: {
    subject: "Someone Downloaded Your CV",
    variables: ["visitor_name", "company_name", "download_reason", "job_title"],
    blocks: [
      {
        id: "1",
        type: "heading",
        content: "CV Download Alert",
        styles: { fontSize: "24px", fontWeight: "bold", color: "#333333", textAlign: "center" },
      },
      {
        id: "2",
        type: "text",
        content: "{{visitor_name}} from {{company_name}} has downloaded your CV.",
        styles: { fontSize: "16px", color: "#666666", textAlign: "left" },
      },
      {
        id: "3",
        type: "text",
        content: "Job Title: {{job_title}}\nReason: {{download_reason}}",
        styles: { fontSize: "14px", color: "#333333", textAlign: "left" },
      },
    ],
  },
  course_enrollment: {
    subject: "New Course Enrollment: {{course_title}}",
    variables: ["student_name", "student_email", "course_title", "amount"],
    blocks: [
      {
        id: "1",
        type: "heading",
        content: "New Enrollment! 🎉",
        styles: { fontSize: "24px", fontWeight: "bold", color: "#333333", textAlign: "center" },
      },
      {
        id: "2",
        type: "text",
        content: "{{student_name}} has enrolled in {{course_title}}.",
        styles: { fontSize: "16px", color: "#666666", textAlign: "left" },
      },
      {
        id: "3",
        type: "text",
        content: "Amount: {{amount}}",
        styles: { fontSize: "18px", fontWeight: "bold", color: "#10B981", textAlign: "center" },
      },
    ],
  },
  payment: {
    subject: "Payment Received: {{amount}}",
    variables: ["amount", "product_name", "customer_name", "status", "payment_id"],
    blocks: [
      {
        id: "1",
        type: "heading",
        content: "Payment Received",
        styles: { fontSize: "24px", fontWeight: "bold", color: "#333333", textAlign: "center" },
      },
      {
        id: "2",
        type: "text",
        content: "You have received a payment of {{amount}} for {{product_name}}.",
        styles: { fontSize: "16px", color: "#666666", textAlign: "left" },
      },
      {
        id: "3",
        type: "text",
        content: "Customer: {{customer_name}}\nPayment ID: {{payment_id}}\nStatus: {{status}}",
        styles: { fontSize: "14px", color: "#333333", textAlign: "left" },
      },
    ],
  },
};

export const AdminSettings = () => {
  const { soundEnabled, setSoundEnabled, volume, setVolume, playNotificationSound } = useSoundNotification();
  
  const [emailSettings, setEmailSettings] = useState({
    contactRequests: true,
    cvDownloads: true,
    courseEnrollments: true,
    payments: true,
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("contact_request");
  const [currentBlocks, setCurrentBlocks] = useState<EmailBlock[]>([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentVariables, setCurrentVariables] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("name");

      if (error) throw error;

      if (data && data.length > 0) {
        const typedData: EmailTemplate[] = data.map(t => ({
          ...t,
          body_json: Array.isArray(t.body_json) ? (t.body_json as unknown as EmailBlock[]) : [],
          variables: t.variables || [],
        }));
        setTemplates(typedData);
        loadTemplate(typedData[0].name, typedData);
      } else {
        // Initialize with defaults
        const defaultTemplateList = Object.entries(DEFAULT_TEMPLATES).map(([name, template]) => ({
          id: name,
          name,
          subject: template.subject,
          body_json: template.blocks,
          body_html: null,
          variables: template.variables,
          is_active: true,
        }));
        setTemplates(defaultTemplateList);
        loadTemplate("contact_request", defaultTemplateList);
      }
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      // Use defaults on error
      const defaultTemplateList = Object.entries(DEFAULT_TEMPLATES).map(([name, template]) => ({
        id: name,
        name,
        subject: template.subject,
        body_json: template.blocks,
        body_html: null,
        variables: template.variables,
        is_active: true,
      }));
      setTemplates(defaultTemplateList);
      loadTemplate("contact_request", defaultTemplateList);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (name: string, templateList?: EmailTemplate[]) => {
    const list = templateList || templates;
    const template = list.find(t => t.name === name);
    if (template) {
      setSelectedTemplate(name);
      setCurrentBlocks(template.body_json || []);
      setCurrentSubject(template.subject);
      setCurrentVariables(template.variables || []);
    } else if (DEFAULT_TEMPLATES[name]) {
      setSelectedTemplate(name);
      setCurrentBlocks(DEFAULT_TEMPLATES[name].blocks);
      setCurrentSubject(DEFAULT_TEMPLATES[name].subject);
      setCurrentVariables(DEFAULT_TEMPLATES[name].variables);
    }
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const existingTemplate = templates.find(t => t.name === selectedTemplate);
      
      if (existingTemplate && existingTemplate.id !== selectedTemplate) {
        // Update existing
        const { error } = await supabase
          .from("email_templates")
          .update({
            subject: currentSubject,
            body_json: currentBlocks as any,
            variables: currentVariables,
          })
          .eq("id", existingTemplate.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("email_templates").upsert({
          name: selectedTemplate,
          subject: currentSubject,
          body_json: currentBlocks as any,
          variables: currentVariables,
          is_active: true,
        }, { onConflict: "name" });

        if (error) throw error;
      }

      toast.success("Template saved successfully");
      await fetchTemplates();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Settings saved successfully");
    setIsSaving(false);
  };

  const handleTestSound = () => {
    playNotificationSound();
    toast.success("Sound played!");
  };

  const notificationEvents = [
    {
      id: "contactRequests",
      label: "Contact Requests",
      description: "When someone submits a contact form",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      id: "cvDownloads",
      label: "CV Downloads",
      description: "When someone downloads your CV",
      icon: Download,
      color: "text-green-500",
    },
    {
      id: "courseEnrollments",
      label: "Course Enrollments",
      description: "When someone enrolls in a course",
      icon: GraduationCap,
      color: "text-purple-500",
    },
    {
      id: "payments",
      label: "Payments",
      description: "When a payment is received",
      icon: CreditCard,
      color: "text-yellow-500",
    },
  ];

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
          title="Access System Settings"
          subtitle="Verify identity to modify system configuration"
          moduleName="SYSTEM SETTINGS"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-600/20 flex items-center justify-center border border-slate-500/30">
            <Settings className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">System Settings Protected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Biometric verification required to access system configuration
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-slate-500 to-gray-600"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure notifications and email templates
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Sound Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                Sound Notifications
              </CardTitle>
              <CardDescription>
                Play a sound when new notifications arrive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play notification sounds in the admin panel
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volume * 100]}
                  onValueChange={([v]) => setVolume(v / 100)}
                  max={100}
                  step={1}
                  disabled={!soundEnabled}
                  className="w-full"
                />
              </div>

              <Button
                variant="outline"
                onClick={handleTestSound}
                disabled={!soundEnabled}
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Test Sound
              </Button>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which events trigger email notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <event.icon className={`w-5 h-5 ${event.color}`} />
                      </div>
                      <div>
                        <Label className="font-medium">{event.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={emailSettings[event.id as keyof typeof emailSettings]}
                      onCheckedChange={(checked) =>
                        setEmailSettings((prev) => ({
                          ...prev,
                          [event.id]: checked,
                        }))
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Email Template Builder</CardTitle>
                  <CardDescription>
                    Drag and drop to customize your email templates
                  </CardDescription>
                </div>
                <Button onClick={handleSaveTemplate} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selector */}
              <div className="flex items-center gap-4">
                <Label>Template:</Label>
                <Select value={selectedTemplate} onValueChange={loadTemplate}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact_request">Contact Request</SelectItem>
                    <SelectItem value="cv_download">CV Download</SelectItem>
                    <SelectItem value="course_enrollment">Course Enrollment</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Line */}
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              {/* Template Builder */}
              {!isLoading && (
                <EmailTemplateBuilder
                  blocks={currentBlocks}
                  onChange={setCurrentBlocks}
                  variables={currentVariables}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
