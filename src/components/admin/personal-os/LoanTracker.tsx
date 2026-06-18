import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Wallet, TrendingDown, Calendar, Edit2, Trash2, 
  IndianRupee, Percent, Clock, CheckCircle2, AlertCircle
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
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInMonths, addMonths } from "date-fns";

interface Loan {
  id: string;
  lender_name: string;
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date: string;
  remaining_principal: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface EMIPayment {
  id: string;
  loan_id: string;
  payment_date: string;
  emi_amount: number;
  principal_component: number;
  interest_component: number;
  remaining_principal: number;
  payment_number: number;
}

interface LoanTrackerProps {
  onUpdate?: () => void;
}

const loanTypeLabels: Record<string, string> = {
  home: "Home Loan",
  car: "Car Loan",
  personal: "Personal Loan",
  education: "Education Loan",
  business: "Business Loan",
  other: "Other"
};

const LoanTracker = ({ onUpdate }: LoanTrackerProps) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [emiPayments, setEmiPayments] = useState<Record<string, EMIPayment[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
  
  const [formData, setFormData] = useState({
    lender_name: "",
    loan_type: "personal",
    principal_amount: 0,
    interest_rate: 0,
    tenure_months: 12,
    emi_amount: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });

  const [paymentData, setPaymentData] = useState({
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;
      setLoans(loansData as Loan[] || []);

      // Fetch EMI payments for all loans
      const { data: paymentsData } = await supabase
        .from('emi_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_number', { ascending: true });

      if (paymentsData) {
        const grouped = paymentsData.reduce((acc, p) => {
          if (!acc[p.loan_id]) acc[p.loan_id] = [];
          acc[p.loan_id].push(p as EMIPayment);
          return acc;
        }, {} as Record<string, EMIPayment[]>);
        setEmiPayments(grouped);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: 'create' | 'update' | 'delete', recordId: string, oldValues?: any, newValues?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      module: 'loans',
      action,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  };

  // Calculate EMI using formula
  const calculateEMI = (principal: number, rate: number, months: number) => {
    if (principal <= 0 || rate <= 0 || months <= 0) return 0;
    const monthlyRate = rate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  useEffect(() => {
    const emi = calculateEMI(formData.principal_amount, formData.interest_rate, formData.tenure_months);
    setFormData(prev => ({ ...prev, emi_amount: emi }));
  }, [formData.principal_amount, formData.interest_rate, formData.tenure_months]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const loanData = {
        lender_name: formData.lender_name,
        loan_type: formData.loan_type,
        principal_amount: formData.principal_amount,
        interest_rate: formData.interest_rate,
        tenure_months: formData.tenure_months,
        emi_amount: formData.emi_amount,
        start_date: formData.start_date,
        remaining_principal: formData.principal_amount,
        notes: formData.notes || null
      };

      if (editingLoan) {
        const { error } = await supabase
          .from('loans')
          .update(loanData)
          .eq('id', editingLoan.id);

        if (error) throw error;
        await logActivity('update', editingLoan.id, editingLoan, loanData);
        toast({ title: "Updated", description: "Loan updated successfully" });
      } else {
        const { data, error } = await supabase
          .from('loans')
          .insert({ ...loanData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, loanData);
        toast({ title: "Added", description: "New loan added" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLoans();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving loan:', error);
      toast({ title: "Error", description: "Failed to save loan", variant: "destructive" });
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedLoanForPayment) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const loan = selectedLoanForPayment;
      const payments = emiPayments[loan.id] || [];
      const paymentNumber = payments.length + 1;

      // Calculate interest and principal components
      const remainingPrincipal = loan.remaining_principal || loan.principal_amount;
      const monthlyRate = loan.interest_rate / 12 / 100;
      const interestComponent = Math.round(remainingPrincipal * monthlyRate);
      const principalComponent = loan.emi_amount - interestComponent;
      const newRemainingPrincipal = Math.max(0, remainingPrincipal - principalComponent);

      const { data: paymentRecord, error: paymentError } = await supabase
        .from('emi_payments')
        .insert({
          loan_id: loan.id,
          user_id: user.id,
          payment_date: paymentData.payment_date,
          emi_amount: loan.emi_amount,
          principal_component: principalComponent,
          interest_component: interestComponent,
          remaining_principal: newRemainingPrincipal,
          payment_number: paymentNumber,
          notes: paymentData.notes || null
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update loan's remaining principal
      const { error: updateError } = await supabase
        .from('loans')
        .update({ 
          remaining_principal: newRemainingPrincipal,
          is_active: newRemainingPrincipal > 0
        })
        .eq('id', loan.id);

      if (updateError) throw updateError;

      await logActivity('create', paymentRecord.id, null, { type: 'emi_payment', loan_id: loan.id });
      
      toast({ 
        title: "Payment Recorded", 
        description: `EMI #${paymentNumber} recorded. Remaining: ₹${newRemainingPrincipal.toLocaleString()}`
      });

      setIsPaymentDialogOpen(false);
      setSelectedLoanForPayment(null);
      setPaymentData({ payment_date: format(new Date(), 'yyyy-MM-dd'), notes: "" });
      fetchLoans();
      onUpdate?.();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    }
  };

  const handleDelete = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loan.id);

      if (error) throw error;
      await logActivity('delete', loan.id, loan, null);
      
      toast({ title: "Deleted", description: "Loan removed" });
      fetchLoans();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      lender_name: "",
      loan_type: "personal",
      principal_amount: 0,
      interest_rate: 0,
      tenure_months: 12,
      emi_amount: 0,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      notes: ""
    });
    setEditingLoan(null);
  };

  const openEditDialog = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      lender_name: loan.lender_name,
      loan_type: loan.loan_type,
      principal_amount: Number(loan.principal_amount),
      interest_rate: Number(loan.interest_rate),
      tenure_months: loan.tenure_months,
      emi_amount: Number(loan.emi_amount),
      start_date: loan.start_date,
      notes: loan.notes || ""
    });
    setIsDialogOpen(true);
  };

  // Calculate totals
  const activeLoans = loans.filter(l => l.is_active);
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.remaining_principal || l.principal_amount), 0);
  const totalEMI = activeLoans.reduce((sum, l) => sum + Number(l.emi_amount), 0);
  const totalInterestPaid = Object.values(emiPayments).flat().reduce((sum, p) => sum + p.interest_component, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">₹{totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-500">₹{totalEMI.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{activeLoans.length}</p>
            <p className="text-xs text-muted-foreground">Active Loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-rose-500">₹{totalInterestPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Interest Paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Loan
        </Button>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))
        ) : loans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No loans added yet</p>
              <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Add your first loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {loans.map((loan) => {
              const payments = emiPayments[loan.id] || [];
              const paidEMIs = payments.length;
              const remaining = Number(loan.remaining_principal || loan.principal_amount);
              const principal = Number(loan.principal_amount);
              const progress = principal > 0 ? ((principal - remaining) / principal) * 100 : 0;

              return (
                <AccordionItem key={loan.id} value={loan.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        loan.is_active ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                      }`}>
                        {loan.is_active ? (
                          <Wallet className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{loan.lender_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {loanTypeLabels[loan.loan_type]}
                          </Badge>
                          {!loan.is_active && (
                            <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">
                              Closed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{Number(loan.emi_amount).toLocaleString()}/mo • {loan.interest_rate}% • {loan.tenure_months} months
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold">₹{remaining.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">remaining</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Repayment Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {paidEMIs} of {loan.tenure_months} EMIs paid
                        </p>
                      </div>

                      {/* Loan Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Principal</p>
                          <p className="font-medium">₹{principal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">{loan.interest_rate}% p.a.</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{format(parseISO(loan.start_date), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {format(addMonths(parseISO(loan.start_date), loan.tenure_months), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Recent Payments */}
                      {payments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Recent Payments</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {payments.slice(-3).reverse().map(p => (
                              <div key={p.id} className="flex justify-between text-xs bg-muted/50 p-2 rounded">
                                <span>EMI #{p.payment_number} • {format(parseISO(p.payment_date), 'dd MMM yyyy')}</span>
                                <span>₹{p.emi_amount.toLocaleString()} (P: ₹{p.principal_component.toLocaleString()}, I: ₹{p.interest_component.toLocaleString()})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {loan.is_active && (
                          <Button 
                            size="sm" 
                            onClick={() => { 
                              setSelectedLoanForPayment(loan); 
                              setIsPaymentDialogOpen(true); 
                            }}
                          >
                            <IndianRupee className="h-4 w-4 mr-1" /> Record Payment
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(loan)}>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(loan)}>
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

      {/* Add/Edit Loan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLoan ? "Edit Loan" : "Add New Loan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Lender Name</label>
              <Input
                value={formData.lender_name}
                onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })}
                placeholder="e.g., HDFC Bank, SBI"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Loan Type</label>
              <Select value={formData.loan_type} onValueChange={(v) => setFormData({ ...formData, loan_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(loanTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Principal Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData({ ...formData, principal_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Interest Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tenure (months)</label>
                <Input
                  type="number"
                  value={formData.tenure_months}
                  onChange={(e) => setFormData({ ...formData, tenure_months: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Calculated EMI (₹)</label>
                <Input
                  type="number"
                  value={formData.emi_amount}
                  onChange={(e) => setFormData({ ...formData, emi_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
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
            <Button onClick={handleSave} disabled={!formData.lender_name.trim() || formData.principal_amount <= 0}>
              {editingLoan ? "Update" : "Add Loan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record EMI Payment</DialogTitle>
          </DialogHeader>
          {selectedLoanForPayment && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{selectedLoanForPayment.lender_name}</p>
                <p className="text-sm text-muted-foreground">
                  EMI Amount: ₹{Number(selectedLoanForPayment.emi_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Date</label>
                <Input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanTracker;
