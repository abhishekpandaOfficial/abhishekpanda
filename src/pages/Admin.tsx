import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Eye,
  Calendar,
  MapPin,
  Building2,
  Search,
  Users,
  TrendingUp,
  FileText,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
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

const reasonLabels: Record<string, string> = {
  hiring: "Hiring / Role consideration",
  collaboration: "Collaboration opportunity",
  consulting: "Consulting project",
  networking: "Professional networking",
  reference: "Reference / Learning",
  other: "Other",
};

const Admin = () => {
  const [downloads, setDownloads] = useState<CVDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDownload, setSelectedDownload] = useState<CVDownload | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cv_downloads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDownloads = downloads.filter((d) =>
    d.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.visitor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage);
  const paginatedDownloads = filteredDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalDownloads = downloads.length;
  const todayDownloads = downloads.filter(
    (d) => new Date(d.created_at).toDateString() === new Date().toDateString()
  ).length;
  const uniqueCountries = new Set(downloads.map((d) => d.country).filter(Boolean)).size;
  const hiringInterest = downloads.filter((d) => d.download_reason === "hiring").length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Header */}
        <section className="relative overflow-hidden py-8">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="relative container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Track CV downloads and visitor analytics
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{totalDownloads}</p>
                  <p className="text-xs text-muted-foreground">Total Downloads</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-sky flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{todayDownloads}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-purple flex items-center justify-center">
                  <Globe className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{uniqueCountries}</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{hiringInterest}</p>
                  <p className="text-xs text-muted-foreground">Hiring Interest</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Downloads Table */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Download History
              </h2>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="p-10 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading downloads...</p>
              </div>
            ) : paginatedDownloads.length === 0 ? (
              <div className="p-10 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No downloads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Visitor</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Company</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Reason</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Location</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDownloads.map((download, index) => (
                      <tr 
                        key={download.id} 
                        className={`border-t border-border hover:bg-muted/30 transition-colors ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/10"
                        }`}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{download.visitor_name}</p>
                            {download.visitor_email && (
                              <p className="text-sm text-muted-foreground">{download.visitor_email}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {download.company_name ? (
                            <div>
                              <p className="text-foreground">{download.company_name}</p>
                              {download.job_title && (
                                <p className="text-sm text-muted-foreground">{download.job_title}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                            {reasonLabels[download.download_reason] || download.download_reason}
                          </span>
                        </td>
                        <td className="p-4">
                          {download.city || download.country ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {[download.city, download.country].filter(Boolean).join(", ")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(download.created_at)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDownload(download)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredDownloads.length)} of{" "}
                  {filteredDownloads.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Detail Modal */}
        {selectedDownload && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDownload(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-lg w-full border border-primary/20 shadow-glow"
            >
              <h3 className="font-bold text-xl text-foreground mb-4">Download Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Visitor</p>
                  <p className="font-medium text-foreground">{selectedDownload.visitor_name}</p>
                  {selectedDownload.visitor_email && (
                    <p className="text-sm text-primary">{selectedDownload.visitor_email}</p>
                  )}
                </div>

                {selectedDownload.company_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company / Role</p>
                    <p className="font-medium text-foreground">
                      {selectedDownload.company_name}
                      {selectedDownload.job_title && ` - ${selectedDownload.job_title}`}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Reason for Download</p>
                  <p className="font-medium text-foreground">
                    {reasonLabels[selectedDownload.download_reason] || selectedDownload.download_reason}
                  </p>
                </div>

                {selectedDownload.custom_objectives && (
                  <div>
                    <p className="text-sm text-muted-foreground">Custom Objectives</p>
                    <p className="text-foreground bg-muted/50 p-3 rounded-lg text-sm">
                      {selectedDownload.custom_objectives}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">
                    {[selectedDownload.city, selectedDownload.country].filter(Boolean).join(", ") || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Downloaded At</p>
                  <p className="font-medium text-foreground">{formatDate(selectedDownload.created_at)}</p>
                </div>
              </div>

              <Button
                variant="hero-outline"
                className="w-full mt-6"
                onClick={() => setSelectedDownload(null)}
              >
                Close
              </Button>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Admin;