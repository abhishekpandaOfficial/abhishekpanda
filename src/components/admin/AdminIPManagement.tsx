import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Trash2,
  Check,
  X,
  Globe,
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  Ban,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface IPRule {
  id: string;
  ip_address: string;
  rule_type: 'whitelist' | 'blacklist';
  reason: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface LocationConfirmation {
  id: string;
  email: string;
  ip_address: string;
  city: string | null;
  country: string | null;
  status: 'pending' | 'confirmed' | 'denied' | 'expired';
  created_at: string;
  expires_at: string;
}

export const AdminIPManagement = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    ip_address: "",
    rule_type: "blacklist" as 'whitelist' | 'blacklist',
    reason: "",
    expires_in_days: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch IP rules
  const { data: ipRules, isLoading: rulesLoading, refetch: refetchRules } = useQuery({
    queryKey: ["ip-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_access_rules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IPRule[];
    },
  });

  // Fetch location confirmations
  const { data: confirmations, isLoading: confirmationsLoading, refetch: refetchConfirmations } = useQuery({
    queryKey: ["location-confirmations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_location_confirmations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as LocationConfirmation[];
    },
  });

  // Add IP rule mutation
  const addRuleMutation = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      const { data: { user } } = await supabase.auth.getUser();
      const expiresAt = rule.expires_in_days 
        ? new Date(Date.now() + parseInt(rule.expires_in_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase.from("ip_access_rules").insert({
        ip_address: rule.ip_address,
        rule_type: rule.rule_type,
        reason: rule.reason || null,
        expires_at: expiresAt,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-rules"] });
      toast.success("IP rule added successfully");
      setIsAddModalOpen(false);
      setNewRule({ ip_address: "", rule_type: "blacklist", reason: "", expires_in_days: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add rule");
    },
  });

  // Delete IP rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_access_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-rules"] });
      toast.success("IP rule removed");
    },
  });

  // Toggle rule active state
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ip_access_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-rules"] });
      toast.success("Rule updated");
    },
  });

  const filteredRules = ipRules?.filter(rule => 
    rule.ip_address.includes(searchQuery) || 
    rule.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const whitelistRules = filteredRules?.filter(r => r.rule_type === 'whitelist') || [];
  const blacklistRules = filteredRules?.filter(r => r.rule_type === 'blacklist') || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Confirmed</Badge>;
      case 'denied':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Denied</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Expired</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-500" />
            IP Access Control
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage IP whitelist/blacklist and new location confirmations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            IP Rules
          </TabsTrigger>
          <TabsTrigger value="confirmations" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Requests
          </TabsTrigger>
        </TabsList>

        {/* IP Rules Tab */}
        <TabsContent value="rules" className="mt-6 space-y-6">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search IP or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchRules()}>
              <RefreshCw className={`w-4 h-4 ${rulesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Whitelist */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Whitelist ({whitelistRules.length})
                </CardTitle>
                <CardDescription>Trusted IPs that bypass security checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {rulesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : whitelistRules.length > 0 ? (
                    whitelistRules.map((rule) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${
                          rule.is_active 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-muted/50 border-border opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-emerald-400" />
                              <span className="font-mono text-sm text-foreground">{rule.ip_address}</span>
                            </div>
                            {rule.reason && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">{rule.reason}</p>
                            )}
                            {rule.expires_at && (
                              <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires: {format(new Date(rule.expires_at), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleRuleMutation.mutate({ id: rule.id, is_active: !rule.is_active })}
                            >
                              {rule.is_active ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No whitelisted IPs
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Blacklist */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  Blacklist ({blacklistRules.length})
                </CardTitle>
                <CardDescription>Blocked IPs denied from login</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {rulesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : blacklistRules.length > 0 ? (
                    blacklistRules.map((rule) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${
                          rule.is_active 
                            ? 'bg-red-500/5 border-red-500/20' 
                            : 'bg-muted/50 border-border opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span className="font-mono text-sm text-foreground">{rule.ip_address}</span>
                            </div>
                            {rule.reason && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">{rule.reason}</p>
                            )}
                            {rule.expires_at && (
                              <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires: {format(new Date(rule.expires_at), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleRuleMutation.mutate({ id: rule.id, is_active: !rule.is_active })}
                            >
                              {rule.is_active ? (
                                <Check className="w-4 h-4 text-red-400" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No blacklisted IPs
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Confirmations Tab */}
        <TabsContent value="confirmations" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    New Location Login Requests
                  </CardTitle>
                  <CardDescription>Review login attempts from new locations</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => refetchConfirmations()}>
                  <RefreshCw className={`w-4 h-4 ${confirmationsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {confirmationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : confirmations && confirmations.length > 0 ? (
                  confirmations.map((conf, i) => (
                    <motion.div
                      key={conf.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-foreground truncate">{conf.email}</span>
                            {getStatusBadge(conf.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span className="font-mono">{conf.ip_address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{conf.city || "Unknown"}, {conf.country || "Unknown"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{format(new Date(conf.created_at), "MMM d, HH:mm")}</div>
                          {conf.status === 'pending' && (
                            <div className="text-yellow-500 mt-1">
                              Expires: {format(new Date(conf.expires_at), "HH:mm")}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No location confirmation requests
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Rule Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Add IP Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>IP Address</Label>
              <Input
                placeholder="e.g., 192.168.1.1 or 192.168.1.0/24"
                value={newRule.ip_address}
                onChange={(e) => setNewRule({ ...newRule, ip_address: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Select
                value={newRule.rule_type}
                onValueChange={(value: 'whitelist' | 'blacklist') => 
                  setNewRule({ ...newRule, rule_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whitelist">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Whitelist (Allow)
                    </div>
                  </SelectItem>
                  <SelectItem value="blacklist">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-500" />
                      Blacklist (Block)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="Why is this IP being added?"
                value={newRule.reason}
                onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires In (Days, Optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty for permanent"
                value={newRule.expires_in_days}
                onChange={(e) => setNewRule({ ...newRule, expires_in_days: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addRuleMutation.mutate(newRule)}
              disabled={!newRule.ip_address || addRuleMutation.isPending}
              className={newRule.rule_type === 'whitelist' 
                ? "bg-emerald-600 hover:bg-emerald-500" 
                : "bg-red-600 hover:bg-red-500"
              }
            >
              {addRuleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : newRule.rule_type === 'whitelist' ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}
              Add to {newRule.rule_type === 'whitelist' ? 'Whitelist' : 'Blacklist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIPManagement;
