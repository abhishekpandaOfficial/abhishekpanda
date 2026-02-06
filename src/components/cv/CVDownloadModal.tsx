import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Download, 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const downloadReasons = [
  { id: "hiring", label: "Considering for a role / Hiring" },
  { id: "collaboration", label: "Collaboration opportunity" },
  { id: "consulting", label: "Consulting / Freelance project" },
  { id: "networking", label: "Professional networking" },
  { id: "reference", label: "Reference / Learning from experience" },
  { id: "other", label: "Other (specify below)" },
];

export const CVDownloadModal = ({ isOpen, onClose }: CVDownloadModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    reason: "",
    customObjectives: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to download the CV.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get location info
      let locationData = { country: "", city: "" };
      try {
        const geoResponse = await fetch("https://ipapi.co/json/");
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          locationData = {
            country: geoData.country_name || "",
            city: geoData.city || "",
          };
        }
      } catch (geoError) {
        console.log("Could not fetch location:", geoError);
      }

      // Insert download record
      const { error } = await supabase.from("cv_downloads").insert({
        visitor_name: formData.name.trim(),
        visitor_email: formData.email.trim() || null,
        download_reason: formData.reason,
        custom_objectives: formData.customObjectives.trim() || null,
        company_name: formData.company.trim() || null,
        job_title: formData.jobTitle.trim() || null,
        country: locationData.country || null,
        city: locationData.city || null,
        user_agent: navigator.userAgent,
      });

      if (error) {
        throw error;
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = "/documents/AbhishekPanda_Architect_CV.pdf";
      link.download = "AbhishekPanda_Architect_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started!",
        description: "Thank you for your interest. The CV is downloading.",
      });

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        company: "",
        jobTitle: "",
        reason: "",
        customObjectives: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting download request:", error);
      toast({
        title: "Download failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-primary/30 shadow-2xl shadow-primary/20">
              {/* Decorative gradient orb */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header */}
              <div className="relative flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Download CV</h2>
                    <p className="text-sm text-muted-foreground">Please tell us a bit about yourself</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative space-y-5">
                {/* Name - Required */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10 h-12 bg-background border-border/50 focus:border-primary rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="pl-10 h-12 bg-background border-border/50 focus:border-primary rounded-xl"
                    />
                  </div>
                </div>

                {/* Company & Job Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company name"
                        className="pl-10 h-12 bg-background border-border/50 focus:border-primary rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Your Role
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="e.g., Recruiter, CTO"
                        className="pl-10 h-12 bg-background border-border/50 focus:border-primary rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Reason for Download */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Why are you downloading this CV? <span className="text-destructive">*</span>
                  </label>
                  <div className="space-y-2">
                    {downloadReasons.map((reason) => (
                      <label
                        key={reason.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                          formData.reason === reason.id
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/50 hover:border-primary/50 bg-background"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason.id}
                          checked={formData.reason === reason.id}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.reason === reason.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}>
                          {formData.reason === reason.id && (
                            <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm text-foreground">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Objectives */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Additional Details / Custom Objectives
                  </label>
                  <Textarea
                    value={formData.customObjectives}
                    onChange={(e) => setFormData({ ...formData, customObjectives: e.target.value })}
                    placeholder="Tell us more about why you're interested or any specific objectives..."
                    className="bg-background min-h-[100px] border-border/50 focus:border-primary rounded-xl"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download CV
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your information helps me understand who's interested in my work.
                  I respect your privacy and won't share your details.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
