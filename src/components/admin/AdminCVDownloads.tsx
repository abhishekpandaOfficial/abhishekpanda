import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Globe,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface CVDownload {
  id: string;
  visitor_name: string;
  visitor_email: string | null;
  download_reason: string;
  custom_objectives: string | null;
  company_name: string | null;
  job_title: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
}

export const AdminCVDownloads = () => {
  const [downloads, setDownloads] = useState<CVDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDownload, setSelectedDownload] = useState<CVDownload | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDownloads();
  }, [currentPage, searchQuery]);

  const fetchDownloads = async () => {
    setLoading(true);
    let query = supabase
      .from("cv_downloads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (searchQuery) {
      query = query.or(`visitor_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,visitor_email.ilike.%${searchQuery}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setDownloads(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const stats = {
    total: totalCount,
    today: downloads.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length,
    hiring: downloads.filter(d => d.download_reason === "hiring").length,
    countries: new Set(downloads.map(d => d.country).filter(Boolean)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground">CV Downloads</h1>
          <p className="text-muted-foreground text-sm">Track who's downloading your CV</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Downloads", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Today", value: stats.today, color: "from-emerald-500 to-teal-500" },
          { label: "Hiring Interest", value: stats.hiring, color: "from-purple-500 to-pink-500" },
          { label: "Countries", value: stats.countries, color: "from-orange-500 to-amber-500" },
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

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
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
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Company</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground">Reason</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Location</th>
                <th className="text-left px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
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
              ) : downloads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No downloads found
                  </td>
                </tr>
              ) : (
                downloads.map((download) => (
                  <tr
                    key={download.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-xs md:text-sm">
                            {download.visitor_name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{download.visitor_name}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{download.visitor_email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-foreground/80 text-sm">{download.company_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{download.job_title || "-"}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        download.download_reason === "hiring"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : download.download_reason === "collaboration"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {download.download_reason}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        {download.city && download.country
                          ? `${download.city}, ${download.country}`
                          : download.country || "-"}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      <div className="text-muted-foreground text-sm">
                        {new Date(download.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {new Date(download.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDownload(download)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-muted-foreground text-xs md:text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDownload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedDownload(null)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setSelectedDownload(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <h3 className="text-xl font-bold text-foreground mb-4">Download Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {selectedDownload.visitor_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">{selectedDownload.visitor_name}</div>
                  <div className="text-muted-foreground text-sm">{selectedDownload.visitor_email || "No email"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm">{selectedDownload.company_name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-4 h-4 text-secondary" />
                  <span className="text-sm">{selectedDownload.job_title || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{selectedDownload.country || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">{selectedDownload.city || "N/A"}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Reason</div>
                <div className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm">
                  {selectedDownload.download_reason}
                </div>
              </div>

              {selectedDownload.custom_objectives && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Custom Objectives</div>
                  <div className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm">
                    {selectedDownload.custom_objectives}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(selectedDownload.created_at).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedDownload(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminCVDownloads;
