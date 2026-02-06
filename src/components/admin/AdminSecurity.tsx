import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
  Activity,
  LogIn,
  LogOut,
  UserX,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DeviceManagementPanel } from "./DeviceManagementPanel";

interface SecurityEvent {
  id: string;
  type: "login" | "logout" | "failed_login" | "password_change" | "settings_change" | "suspicious";
  description: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: "1",
    type: "login",
    description: "Successful login",
    ip: "192.168.1.1",
    location: "Bhubaneswar, India",
    device: "Chrome on Windows",
    timestamp: new Date().toISOString(),
    severity: "low",
  },
  {
    id: "2",
    type: "settings_change",
    description: "Notification settings updated",
    ip: "192.168.1.1",
    location: "Bhubaneswar, India",
    device: "Chrome on Windows",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: "low",
  },
  {
    id: "3",
    type: "failed_login",
    description: "Failed login attempt (wrong password)",
    ip: "45.33.32.156",
    location: "Unknown",
    device: "Unknown",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: "medium",
  },
  {
    id: "4",
    type: "suspicious",
    description: "Multiple failed login attempts detected",
    ip: "185.234.72.89",
    location: "Moscow, Russia",
    device: "Unknown",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    severity: "high",
  },
];

const ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "1",
    device: "Windows PC",
    browser: "Chrome 120",
    ip: "192.168.1.1",
    location: "Bhubaneswar, India",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    browser: "Safari",
    ip: "192.168.1.5",
    location: "Bhubaneswar, India",
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    isCurrent: false,
  },
];

export const AdminSecurity = () => {
  const [events, setEvents] = useState<SecurityEvent[]>(SECURITY_EVENTS);
  const [sessions, setSessions] = useState<ActiveSession[]>(ACTIVE_SESSIONS);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 30,
    ipWhitelisting: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Calculate security score
  const securityScore = (() => {
    let score = 50; // Base score
    if (settings.twoFactorEnabled) score += 25;
    if (settings.loginAlerts) score += 10;
    if (settings.suspiciousActivityAlerts) score += 10;
    if (settings.ipWhitelisting) score += 5;
    return Math.min(score, 100);
  })();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-green-500" />;
      case "logout":
        return <LogOut className="w-4 h-4 text-blue-500" />;
      case "failed_login":
        return <UserX className="w-4 h-4 text-yellow-500" />;
      case "password_change":
        return <Key className="w-4 h-4 text-purple-500" />;
      case "settings_change":
        return <Settings className="w-4 h-4 text-blue-500" />;
      case "suspicious":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity: SecurityEvent["severity"]) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline" className="text-green-500 border-green-500/30">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="text-red-500 border-red-500/30">High</Badge>;
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session terminated successfully");
  };

  const handleChangePassword = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully");
    }, 2000);
  };

  const handleToggle2FA = () => {
    if (!settings.twoFactorEnabled) {
      toast.success("Two-factor authentication enabled");
    } else {
      toast.success("Two-factor authentication disabled");
    }
    setSettings((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            Security Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your account security
          </p>
        </div>
      </div>

      {/* Security Score */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={securityScore >= 80 ? "#22c55e" : securityScore >= 60 ? "#eab308" : "#ef4444"}
                  strokeWidth="12"
                  strokeDasharray={`${(securityScore / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-3xl font-bold", getScoreColor(securityScore))}>
                  {securityScore}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">Security Score</h3>
              <p className="text-muted-foreground mt-1">
                {securityScore >= 80
                  ? "Your account is well protected"
                  : securityScore >= 60
                  ? "Some improvements recommended"
                  : "Your account needs attention"}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {!settings.twoFactorEnabled && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                    Enable 2FA
                  </Badge>
                )}
                {!settings.ipWhitelisting && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                    Enable IP Whitelisting
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Two-Factor Auth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.twoFactorEnabled ? (
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="font-medium text-foreground">
                      {settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Password
                </CardTitle>
                <CardDescription>
                  Keep your password strong and secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full">
                  {isChangingPassword ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.ip} • {event.location} • {event.device}
                      </p>
                    </div>
                    <div className="text-right">
                      {getSeverityBadge(event.severity)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Devices currently logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      session.isCurrent ? "border-primary/50 bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      {session.device.includes("iPhone") || session.device.includes("Android") ? (
                        <Smartphone className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{session.device}</p>
                        {session.isCurrent && (
                          <Badge className="bg-primary/10 text-primary">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} • {session.ip}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {session.location} •{" "}
                        <Clock className="w-3 h-3" /> Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Complete history of security-related events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.ip} • {event.location} • {event.device}
                      </p>
                    </div>
                    <div className="text-right">
                      {getSeverityBadge(event.severity)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, loginAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Suspicious Activity Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about unusual account activity
                  </p>
                </div>
                <Switch
                  checked={settings.suspiciousActivityAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, suspiciousActivityAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">
                    Only allow access from approved IP addresses
                  </p>
                </div>
                <Switch
                  checked={settings.ipWhitelisting}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, ipWhitelisting: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurity;
