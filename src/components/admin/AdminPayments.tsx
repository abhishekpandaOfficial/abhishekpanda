import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchQuery]);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, count, error } = await supabase
      .from("payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (!error) {
      setPayments(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case "refunded":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <RefreshCw className="w-3 h-3" /> Refunded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  const stats = {
    total: totalCount,
    completed: payments.filter(p => p.status === "completed").length,
    pending: payments.filter(p => p.status === "created" || p.status === "pending").length,
    totalAmount: payments.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            Payments & Invoices
          </h1>
          <p className="text-muted-foreground text-sm">Manage all transactions and invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Payments", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-500" },
          { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
          { label: "Total Revenue", value: `₹${stats.totalAmount.toLocaleString()}`, color: "from-purple-500 to-pink-500" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card border border-border p-4"
          >
            <div className="text-xl md:text-2xl font-black text-foreground">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Order ID</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Product</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-right px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-mono text-xs md:text-sm text-foreground truncate max-w-[100px] md:max-w-none">{payment.order_id}</div>
                      {payment.payment_id && (
                        <div className="font-mono text-xs text-muted-foreground truncate max-w-[100px] md:max-w-none">{payment.payment_id}</div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      <div className="text-foreground/80 capitalize text-sm">{payment.product_type}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-bold text-foreground text-sm">₹{payment.amount?.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{payment.currency}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-muted-foreground text-sm">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-border">
            <div className="text-xs md:text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
