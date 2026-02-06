import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Shield, Calendar, Edit2, Trash2, Upload, FileText,
  AlertCircle, CheckCircle2, Car, Heart, Home, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays, isBefore, addDays } from "date-fns";

interface InsurancePolicy {
  id: string;
  policy_type: string;
  policy_name: string;
  policy_number: string | null;
  provider: string;
  premium_amount: number;
  premium_frequency: string;
  sum_assured: number | null;
  start_date: string;
  renewal_date: string;
  maturity_date: string | null;
  nominee_name: string | null;
  nominee_relation: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface InsuranceDocument {
  id: string;
  policy_id: string;
  document_name: string;
  document_url: string;
  document_year: number;
  document_type: string;
}

interface InsuranceTrackerProps {
  onUpdate?: () => void;
}

const policyTypeIcons: Record<string, any> = {
  life: Heart,
  health: User,
  car: Car,
  bike: Car,
  home: Home,
  other: Shield
};

const policyTypeLabels: Record<string, string> = {
  life: "Life Insurance",
  health: "Health Insurance",
  car: "Car Insurance",
  bike: "Bike Insurance",
  home: "Home Insurance",
  other: "Other"
};

const frequencyLabels: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-yearly": "Half-Yearly",
  yearly: "Yearly"
};

const InsuranceTracker = ({ onUpdate }: InsuranceTrackerProps) => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [documents, setDocuments] = useState<Record<string, InsuranceDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  
  const [formData, setFormData] = useState({
    policy_type: "life",
    policy_name: "",
    policy_number: "",
    provider: "",
    premium_amount: 0,
    premium_frequency: "yearly",
    sum_assured: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    renewal_date: format(new Date(), 'yyyy-MM-dd'),
    maturity_date: "",
    nominee_name: "",
    nominee_relation: "",
    notes: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: policiesData, error: policiesError } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('renewal_date', { ascending: true });

      if (policiesError) throw policiesError;
      setPolicies(policiesData as InsurancePolicy[] || []);

      // Fetch documents
      const { data: docsData } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('document_year', { ascending: false });

      if (docsData) {
        const grouped = docsData.reduce((acc, d) => {
          if (!acc[d.policy_id]) acc[d.policy_id] = [];
          acc[d.policy_id].push(d as InsuranceDocument);
          return acc;
        }, {} as Record<string, InsuranceDocument[]>);
        setDocuments(grouped);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: 'create' | 'update' | 'delete', recordId: string, oldValues?: any, newValues?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      module: 'insurance',
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

      const policyData = {
        policy_type: formData.policy_type,
        policy_name: formData.policy_name,
        policy_number: formData.policy_number || null,
        provider: formData.provider,
        premium_amount: formData.premium_amount,
        premium_frequency: formData.premium_frequency,
        sum_assured: formData.sum_assured || null,
        start_date: formData.start_date,
        renewal_date: formData.renewal_date,
        maturity_date: formData.maturity_date || null,
        nominee_name: formData.nominee_name || null,
        nominee_relation: formData.nominee_relation || null,
        notes: formData.notes || null
      };

      if (editingPolicy) {
        const { error } = await supabase
          .from('insurance_policies')
          .update(policyData)
          .eq('id', editingPolicy.id);

        if (error) throw error;
        await logActivity('update', editingPolicy.id, editingPolicy, policyData);
        toast({ title: "Updated", description: "Policy updated successfully" });
      } else {
        const { data, error } = await supabase
          .from('insurance_policies')
          .insert({ ...policyData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, policyData);
        toast({ title: "Added", description: "New policy added" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPolicies();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast({ title: "Error", description: "Failed to save policy", variant: "destructive" });
    }
  };

  const handleDelete = async (policy: InsurancePolicy) => {
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', policy.id);

      if (error) throw error;
      await logActivity('delete', policy.id, policy, null);
      
      toast({ title: "Deleted", description: "Policy removed" });
      fetchPolicies();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      policy_type: "life",
      policy_name: "",
      policy_number: "",
      provider: "",
      premium_amount: 0,
      premium_frequency: "yearly",
      sum_assured: 0,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      renewal_date: format(new Date(), 'yyyy-MM-dd'),
      maturity_date: "",
      nominee_name: "",
      nominee_relation: "",
      notes: ""
    });
    setEditingPolicy(null);
  };

  const openEditDialog = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      policy_type: policy.policy_type,
      policy_name: policy.policy_name,
      policy_number: policy.policy_number || "",
      provider: policy.provider,
      premium_amount: Number(policy.premium_amount),
      premium_frequency: policy.premium_frequency,
      sum_assured: Number(policy.sum_assured) || 0,
      start_date: policy.start_date,
      renewal_date: policy.renewal_date,
      maturity_date: policy.maturity_date || "",
      nominee_name: policy.nominee_name || "",
      nominee_relation: policy.nominee_relation || "",
      notes: policy.notes || ""
    });
    setIsDialogOpen(true);
  };

  const getRenewalStatus = (renewalDate: string) => {
    const renewal = parseISO(renewalDate);
    const today = new Date();
    const daysUntil = differenceInDays(renewal, today);

    if (daysUntil < 0) return { status: "overdue", label: "Overdue", color: "text-red-500 bg-red-500/10" };
    if (daysUntil <= 30) return { status: "soon", label: `${daysUntil} days`, color: "text-amber-500 bg-amber-500/10" };
    return { status: "ok", label: format(renewal, 'dd MMM yyyy'), color: "text-emerald-500 bg-emerald-500/10" };
  };

  // Calculate stats
  const activePolicies = policies.filter(p => p.is_active);
  const upcomingRenewals = activePolicies.filter(p => {
    const daysUntil = differenceInDays(parseISO(p.renewal_date), new Date());
    return daysUntil >= 0 && daysUntil <= 30;
  });
  const totalAnnualPremium = activePolicies.reduce((sum, p) => {
    const multiplier = { monthly: 12, quarterly: 4, "half-yearly": 2, yearly: 1 }[p.premium_frequency] || 1;
    return sum + Number(p.premium_amount) * multiplier;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-primary">{activePolicies.length}</p>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-amber-500">₹{totalAnnualPremium.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Annual Premium</p>
          </CardContent>
        </Card>
        <Card className={upcomingRenewals.length > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-3xl font-bold ${upcomingRenewals.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {upcomingRenewals.length}
            </p>
            <p className="text-xs text-muted-foreground">Renewals (30 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-blue-500">
              {Object.values(documents).flat().length}
            </p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Alerts */}
      {upcomingRenewals.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Upcoming Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingRenewals.map(policy => {
                const { label, color } = getRenewalStatus(policy.renewal_date);
                return (
                  <div key={policy.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{policyTypeLabels[policy.policy_type]}</Badge>
                      <span className="font-medium">{policy.policy_name}</span>
                    </div>
                    <Badge className={color}>{label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Policy
        </Button>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))
        ) : policies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No insurance policies added</p>
              <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Add your first policy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {policies.map((policy) => {
              const Icon = policyTypeIcons[policy.policy_type] || Shield;
              const { status, label, color } = getRenewalStatus(policy.renewal_date);
              const policyDocs = documents[policy.id] || [];

              return (
                <AccordionItem key={policy.id} value={policy.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        policy.is_active ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${policy.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{policy.policy_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {policyTypeLabels[policy.policy_type]}
                          </Badge>
                          {!policy.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {policy.provider} • ₹{Number(policy.premium_amount).toLocaleString()} {frequencyLabels[policy.premium_frequency]}
                        </p>
                      </div>
                      <Badge className={color}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Policy Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {policy.policy_number && (
                          <div>
                            <p className="text-muted-foreground">Policy Number</p>
                            <p className="font-medium">{policy.policy_number}</p>
                          </div>
                        )}
                        {policy.sum_assured && (
                          <div>
                            <p className="text-muted-foreground">Sum Assured</p>
                            <p className="font-medium">₹{Number(policy.sum_assured).toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{format(parseISO(policy.start_date), 'dd MMM yyyy')}</p>
                        </div>
                        {policy.maturity_date && (
                          <div>
                            <p className="text-muted-foreground">Maturity Date</p>
                            <p className="font-medium">{format(parseISO(policy.maturity_date), 'dd MMM yyyy')}</p>
                          </div>
                        )}
                        {policy.nominee_name && (
                          <div>
                            <p className="text-muted-foreground">Nominee</p>
                            <p className="font-medium">{policy.nominee_name} ({policy.nominee_relation})</p>
                          </div>
                        )}
                      </div>

                      {/* Documents */}
                      {policyDocs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {policyDocs.map(doc => (
                              <a
                                key={doc.id}
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-accent"
                              >
                                <FileText className="h-3 w-3" />
                                {doc.document_name} ({doc.document_year})
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(policy)}>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(policy)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Policy" : "Add Insurance Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Policy Type</label>
                <Select value={formData.policy_type} onValueChange={(v) => setFormData({ ...formData, policy_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(policyTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Provider</label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., LIC, HDFC Life"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Policy Name</label>
              <Input
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                placeholder="e.g., Term Life Plan"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Policy Number (optional)</label>
              <Input
                value={formData.policy_number}
                onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Premium Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.premium_amount}
                  onChange={(e) => setFormData({ ...formData, premium_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select value={formData.premium_frequency} onValueChange={(v) => setFormData({ ...formData, premium_frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Sum Assured (₹)</label>
              <Input
                type="number"
                value={formData.sum_assured}
                onChange={(e) => setFormData({ ...formData, sum_assured: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Renewal Date</label>
                <Input
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Maturity Date (optional)</label>
              <Input
                type="date"
                value={formData.maturity_date}
                onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nominee Name</label>
                <Input
                  value={formData.nominee_name}
                  onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Relation</label>
                <Input
                  value={formData.nominee_relation}
                  onChange={(e) => setFormData({ ...formData, nominee_relation: e.target.value })}
                  placeholder="e.g., Spouse, Child"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.policy_name.trim() || !formData.provider.trim()}>
              {editingPolicy ? "Update" : "Add Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsuranceTracker;
