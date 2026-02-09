import { useState } from "react";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  ebookSlug: string;
  title: string;
  triggerLabel?: string;
};

export function DownloadGateModal({ ebookSlug, title, triggerLabel = "Download" }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"lead" | "otp" | "ready">("lead");
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ name: "", email: "", mobile: "", otp: "", consent: false });

  const sendOtp = async () => {
    if (!form.name || !form.email || !form.mobile || !form.consent) {
      toast.error("Please fill name, email, mobile and consent.");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("ebooks-lead", {
        body: { name: form.name, email: form.email, mobile: form.mobile, ebookSlug },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to send OTP");
      toast.success("OTP sent to your email.");
      setStep("otp");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp) {
      toast.error("Please enter OTP.");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("ebooks-verify-otp", {
        body: { email: form.email, code: form.otp, ebookSlug },
      });
      if (error) throw error;
      if (!data?.downloadToken) throw new Error(data?.error || "OTP verification failed");
      setToken(data.downloadToken as string);
      setStep("ready");
      toast.success("OTP verified. Download unlocked.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const getDownloadUrl = (format: "pdf" | "epub") =>
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ebooks-download?token=${encodeURIComponent(token)}&format=${format}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Free Download - OTP Verification</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {step === "lead" ? (
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <Label>Mobile (+Country Code)</Label>
              <Input value={form.mobile} onChange={(e) => setForm((s) => ({ ...s, mobile: e.target.value }))} placeholder="+91XXXXXXXXXX" />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm((s) => ({ ...s, consent: e.target.checked }))} />
              We’ll send updates occasionally. Unsubscribe anytime.
            </label>
            <Button onClick={sendOtp} disabled={sending} className="w-full">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />} Send OTP
            </Button>
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="space-y-3">
            <div>
              <Label>Enter OTP</Label>
              <Input value={form.otp} onChange={(e) => setForm((s) => ({ ...s, otp: e.target.value }))} />
            </div>
            <Button onClick={verifyOtp} disabled={verifying} className="w-full">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify OTP
            </Button>
          </div>
        ) : null}

        {step === "ready" ? (
          <div className="space-y-3">
            <div className="text-sm rounded-lg bg-primary/10 p-3 border border-primary/20 text-foreground">
              Free Download (OTP Verified)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a href={getDownloadUrl("pdf")} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="default">Download PDF</Button>
              </a>
              <a href={getDownloadUrl("epub")} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="outline">Download EPUB</Button>
              </a>
            </div>
            <a href={`chronyx://hub/ebooks/${ebookSlug}`}>
              <Button variant="hero-outline" className="w-full">Read in Chronyx Hub</Button>
            </a>
            <a href={`https://getchronyx.com/hub/ebooks/${ebookSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline block text-center">
              Open web fallback
            </a>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
