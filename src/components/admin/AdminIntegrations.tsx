import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Webhook,
  Link2,
  Shield,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Globe,
  Database,
  CreditCard,
  Mail,
  Cloud,
  Settings,
  AlertTriangle,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BiometricVerificationModal } from "./BiometricVerificationModal";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "expired" | "revoked";
  permissions: string[];
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  lastTriggered: string | null;
  successRate: number;
}

interface ConnectedApp {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "disconnected" | "error";
  connectedAt: string | null;
  description: string;
  category: string;
}

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    key: "sk_live_REDACTED",
    createdAt: "2024-01-15",
    lastUsed: "2024-12-11",
    status: "active",
    permissions: ["read", "write", "delete"],
  },
  {
    id: "2",
    name: "Development API Key",
    key: "sk_test_REDACTED",
    createdAt: "2024-02-20",
    lastUsed: "2024-12-10",
    status: "active",
    permissions: ["read", "write"],
  },
  {
    id: "3",
    name: "Analytics Read-Only",
    key: "sk_ro_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: "2024-03-01",
    lastUsed: null,
    status: "expired",
    permissions: ["read"],
  },
];

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "Payment Notifications",
    url: "https://api.cropxon.com/webhooks/payments",
    events: ["payment.success", "payment.failed", "refund.created"],
    status: "active",
    lastTriggered: "2024-12-11 14:30",
    successRate: 99.2,
  },
  {
    id: "2",
    name: "Course Enrollments",
    url: "https://api.cropxon.com/webhooks/enrollments",
    events: ["enrollment.created", "enrollment.completed"],
    status: "active",
    lastTriggered: "2024-12-10 09:15",
    successRate: 100,
  },
  {
    id: "3",
    name: "Contact Form Alerts",
    url: "https://slack.com/api/webhooks/abc123",
    events: ["contact.submitted"],
    status: "failing",
    lastTriggered: "2024-12-09 16:45",
    successRate: 45.5,
  },
];

const connectedApps: ConnectedApp[] = [
  { id: "1", name: "Razorpay", icon: CreditCard, status: "connected", connectedAt: "2024-01-01", description: "Payment processing", category: "Payments" },
  { id: "2", name: "Resend", icon: Mail, status: "connected", connectedAt: "2024-02-15", description: "Email delivery", category: "Communication" },
  { id: "3", name: "Supabase", icon: Database, status: "connected", connectedAt: "2024-01-01", description: "Database & Auth", category: "Infrastructure" },
  { id: "4", name: "Vercel", icon: Globe, status: "connected", connectedAt: "2024-01-01", description: "Hosting & CDN", category: "Infrastructure" },
  { id: "5", name: "Cloudflare", icon: Cloud, status: "disconnected", connectedAt: null, description: "DNS & Security", category: "Infrastructure" },
  { id: "6", name: "n8n", icon: Zap, status: "disconnected", connectedAt: null, description: "Workflow automation", category: "Automation" },
];

export const AdminIntegrations = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });
  const [showBiometricModal, setShowBiometricModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const createApiKey = () => {
    if (!newKeyName) return;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      status: "active",
      permissions: ["read", "write"],
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setIsAddKeyOpen(false);
    toast.success("API key created successfully");
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)));
    toast.success("API key revoked");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "expired":
      case "disconnected":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "revoked":
      case "failing":
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
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
          title="Access Integrations"
          subtitle="Verify identity to view API keys and credentials"
          moduleName="INTEGRATIONS"
        />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center border border-violet-500/30">
            <Key className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Integrations Protected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Biometric verification required to access sensitive API keys and credentials
          </p>
          <Button
            onClick={() => setShowBiometricModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            Integrations Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage API keys, webhooks, and connected applications</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active API Keys", value: apiKeys.filter((k) => k.status === "active").length, icon: Key, color: "from-blue-500 to-cyan-500" },
          { label: "Active Webhooks", value: webhooks.filter((w) => w.status === "active").length, icon: Webhook, color: "from-emerald-500 to-teal-500" },
          { label: "Connected Apps", value: connectedApps.filter((a) => a.status === "connected").length, icon: Link2, color: "from-violet-500 to-purple-500" },
          { label: "Avg. Success Rate", value: `${(webhooks.reduce((a, w) => a + w.successRate, 0) / webhooks.length).toFixed(1)}%`, icon: CheckCircle2, color: "from-amber-500 to-orange-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/50 p-1">
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="apps" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link2 className="w-4 h-4 mr-2" />
            Connected Apps
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Manage your API keys for external integrations</p>
            <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for external integrations</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Key Name</Label>
                    <Input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <Select defaultValue="read-write">
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="read-write">Read & Write</SelectItem>
                        <SelectItem value="full">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddKeyOpen(false)}>Cancel</Button>
                  <Button onClick={createApiKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                          <Key className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                            <Badge className={`text-[10px] ${getStatusColor(apiKey.status)}`}>
                              {apiKey.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-muted-foreground">
                              {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key.replace(/./g, "•").slice(0, 40)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {visibleKeys.has(apiKey.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="block text-muted-foreground/70">Created</span>
                          <span>{apiKey.createdAt}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground/70">Last Used</span>
                          <span>{apiKey.lastUsed || "Never"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => revokeApiKey(apiKey.id)}
                          disabled={apiKey.status === "revoked"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Configure webhooks for real-time event notifications</p>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-3">
            {webhooks.map((webhook, index) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          webhook.status === "active" 
                            ? "bg-emerald-500/20 border-emerald-500/30" 
                            : webhook.status === "failing"
                            ? "bg-red-500/20 border-red-500/30"
                            : "bg-muted/50 border-border"
                        }`}>
                          <Webhook className={`w-5 h-5 ${
                            webhook.status === "active" ? "text-emerald-400" : 
                            webhook.status === "failing" ? "text-red-400" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{webhook.name}</h3>
                            <Badge className={`text-[10px] ${getStatusColor(webhook.status)}`}>
                              {webhook.status}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground block mt-1 truncate max-w-md">
                            {webhook.url}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <span className="block text-muted-foreground/70">Success Rate</span>
                          <span className={webhook.successRate > 90 ? "text-emerald-400" : webhook.successRate > 50 ? "text-amber-400" : "text-red-400"}>
                            {webhook.successRate}%
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-[10px] bg-muted/30">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Connected Apps Tab */}
        <TabsContent value="apps" className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage your connected applications and services</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-card/50 border-border/50 hover:border-primary/30 transition-all ${
                  app.status === "connected" ? "hover:shadow-lg hover:shadow-primary/5" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          app.status === "connected" 
                            ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30"
                            : "bg-muted/50 border border-border"
                        }`}>
                          <app.icon className={`w-6 h-6 ${
                            app.status === "connected" ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{app.name}</h3>
                          <p className="text-xs text-muted-foreground">{app.description}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {app.connectedAt ? `Connected ${app.connectedAt}` : "Not connected"}
                      </span>
                      <Button
                        variant={app.status === "connected" ? "outline" : "default"}
                        size="sm"
                        className={app.status === "connected" ? "" : "bg-gradient-to-r from-primary to-purple-600"}
                      >
                        {app.status === "connected" ? (
                          <>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3 h-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIntegrations;
