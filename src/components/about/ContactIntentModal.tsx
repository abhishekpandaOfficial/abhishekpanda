import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Copy, Check, Shield, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactReasons = [
  "Collaboration",
  "Course Inquiry",
  "Business Partnership",
  "Consulting",
  "Speaking Request",
  "Other",
];

const REAL_PHONE = "+91-8917549065";

export const ContactIntentModal = ({ isOpen, onClose }: ContactIntentModalProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [intent, setIntent] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !reason || !intent) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!confirmRequest || !agreeTerms) {
      toast.error("Please confirm your request and agree to contact professionally");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          name: name.trim(),
          email: email.trim(),
          reason,
          intent: intent.trim(),
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error("Error submitting contact request:", error);
        toast.error("Failed to submit request. Please try again.");
        return;
      }

      // Send email notification via edge function (fire and forget)
      supabase.functions.invoke('contact-notification', {
        body: {
          name: name.trim(),
          email: email.trim(),
          reason,
          intent: intent.trim(),
        },
      }).catch((err) => {
        console.error("Email notification error:", err);
      });

      toast.success("Request submitted successfully!");
      setStep("success");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(REAL_PHONE);
    setCopied(true);
    toast.success("Number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.location.href = `tel:${REAL_PHONE.replace(/-/g, "")}`;
  };

  const resetAndClose = () => {
    setStep("form");
    setName("");
    setEmail("");
    setReason("");
    setIntent("");
    setConfirmRequest(false);
    setAgreeTerms(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={resetAndClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Neon border effect */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-secondary to-purple opacity-70 blur-sm" />
            
            <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={resetAndClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {step === "form" ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Request Contact Number
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Please provide your details to unlock Abhishek's contact number
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <Input
                        type="email"
                        placeholder="Your Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Reason for Contacting" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Textarea
                        placeholder="Describe Your Intent..."
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        className="bg-background/50 min-h-[80px]"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="confirm"
                          checked={confirmRequest}
                          onCheckedChange={(checked) => setConfirmRequest(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="confirm" className="text-sm text-muted-foreground cursor-pointer">
                          Yes, I want to request the phone number
                        </label>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agree"
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                          I agree to contact in a professional manner
                        </label>
                      </div>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Unlock Contact Number
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Contact Number Unlocked
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Here is Abhishek's contact number for your intended purpose:
                    </p>

                    {/* Phone Number Display */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 border border-primary/20">
                      <p className="text-2xl font-bold text-foreground tracking-wider">
                        {REAL_PHONE}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button variant="hero" className="flex-1" onClick={handleCall}>
                        <Phone className="w-4 h-4" />
                        Call Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleCopy}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Number"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
