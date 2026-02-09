import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Phone, Send, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  courseTitle: string;
  coursePriceInr?: number | null;
  courseSlug?: string;
};

const TIME_SLOTS = [
  { label: "20:00 IST", value: "20:00" },
  { label: "21:00 IST", value: "21:00" },
  { label: "22:00 IST", value: "22:00" },
  { label: "23:00 IST", value: "23:00" },
];

const formatDate = (d?: Date) => (d ? d.toLocaleDateString("en-IN") : "Not selected");

export function CourseOneToOneModal({
  open,
  onOpenChange,
  courseTitle,
  coursePriceInr,
  courseSlug,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string>("");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const feeLabel = useMemo(() => {
    if (coursePriceInr && coursePriceInr > 0) return `₹${coursePriceInr.toLocaleString("en-IN")}`;
    return "₹9,999";
  }, [coursePriceInr]);

  const reset = () => {
    setName("");
    setEmail("");
    setMobile("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSlot("");
    setPaid(false);
    setNotes("");
    setSubmitting(false);
  };

  const close = (value: boolean) => {
    onOpenChange(value);
    if (!value) reset();
  };

  const validate = () => {
    if (!name.trim()) return "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email.";
    if (!mobile.trim() || mobile.trim().length < 7) return "Enter a valid mobile.";
    if (!startDate || !endDate) return "Select start and end date.";
    if (!slot) return "Select a night slot (8 to 12 IST).";
    if (!paid) return "Please confirm payment to schedule 1:1.";
    return null;
  };

  const submitRequest = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setSubmitting(true);
    try {
      const reason = "1:1 Course Session Request";
      const intent = [
        `Course: ${courseTitle}`,
        `Fee: ${feeLabel}`,
        `Session: 1 hour daily (Night slot)`,
        `Preferred slot: ${slot}`,
        `Start date: ${formatDate(startDate)}`,
        `End date: ${formatDate(endDate)}`,
        `Course slug: ${courseSlug || "n/a"}`,
        `Notes: ${notes || "n/a"}`,
      ].join("\n");

      await supabase.from("contact_requests").insert({
        name: name.trim(),
        email: email.trim(),
        reason,
        intent,
        user_agent: navigator.userAgent,
      });

      await supabase.functions.invoke("contact-notification", {
        body: {
          name: name.trim(),
          email: email.trim(),
          reason,
          intent,
        },
      });

      toast.success("Request sent. We will confirm your 1:1 schedule by email.");
      close(false);
    } catch (e: any) {
      toast.error(e?.message || "Unable to submit request. Please try again.");
      setSubmitting(false);
    }
  };

  const whatsappLink = useMemo(() => {
    const text = [
      "1:1 Course Session Request",
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Course: ${courseTitle}`,
      `Fee: ${feeLabel}`,
      `Session: 1 hour daily (Night slot)`,
      `Preferred slot: ${slot || "-"}`,
      `Start date: ${formatDate(startDate)}`,
      `End date: ${formatDate(endDate)}`,
    ].join("\n");
    const encoded = encodeURIComponent(text);
    return `https://wa.me/918917549065?text=${encoded}`;
  }, [name, email, courseTitle, feeLabel, slot, startDate, endDate]);

  const canWhatsapp = name.trim() && email.trim();

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            1:1 Session for {courseTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-sm font-semibold">1:1 Plan Details</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div>Fee: <span className="text-foreground font-semibold">{feeLabel}</span></div>
                <div>Duration: 1 hour daily</div>
                <div>Preferred time: 8 PM to 12 AM IST</div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="text-sm font-semibold">Pick dates</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Start date</div>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(d) => d < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">End date</div>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => d < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Night slots (IST)
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((s) => (
                  <Button
                    key={s.value}
                    type="button"
                    variant={slot === s.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlot(s.value)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1">
                <Label>Mobile</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91..." />
              </div>
              <div className="space-y-1">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                I confirm that payment has been completed for this 1:1 plan.
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={submitRequest} disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit 1:1 Request"}
              </Button>
              <Button asChild variant="outline" disabled={!canWhatsapp} className="gap-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4" />
                  WhatsApp Abhishek
                </a>
              </Button>
              {!canWhatsapp ? (
                <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Add name + email to enable WhatsApp.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
