import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Phone, Send, User } from "lucide-react";
import type { DateRange } from "react-day-picker";
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
  oneToOneEnabled?: boolean;
  oneToOnePriceInr?: number | null;
  oneToOneDurationMinutes?: number | null;
  oneToOneStartHourIst?: number | null;
  oneToOneEndHourIst?: number | null;
  payAfterSchedule?: boolean | null;
};

const formatDate = (d?: Date) => (d ? d.toLocaleDateString("en-IN") : "Not selected");

const buildSlots = (startHour: number, endHour: number, durationMinutes: number) => {
  const slots: { label: string; value: string }[] = [];
  const start = Math.max(0, Math.min(23, startHour));
  const end = Math.max(0, Math.min(24, endHour));
  if (end <= start) return slots;
  for (let h = start; h < end; h += Math.max(1, durationMinutes / 60)) {
    const hour = Math.floor(h);
    const hh = String(hour).padStart(2, "0");
    slots.push({ label: `${hh}:00 IST`, value: `${hh}:00` });
  }
  return slots;
};

export function CourseOneToOneModal({
  open,
  onOpenChange,
  courseTitle,
  coursePriceInr,
  courseSlug,
  oneToOneEnabled = true,
  oneToOnePriceInr,
  oneToOneDurationMinutes,
  oneToOneStartHourIst,
  oneToOneEndHourIst,
  payAfterSchedule = true,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [slot, setSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const feeLabel = useMemo(() => {
    const fee = oneToOnePriceInr ?? coursePriceInr;
    if (fee && fee > 0) return `₹${fee.toLocaleString("en-IN")}`;
    return "₹9,999";
  }, [coursePriceInr, oneToOnePriceInr]);

  const durationMinutes = Math.max(30, oneToOneDurationMinutes ?? 60);
  const slots = useMemo(
    () => buildSlots(oneToOneStartHourIst ?? 20, oneToOneEndHourIst ?? 24, durationMinutes),
    [oneToOneStartHourIst, oneToOneEndHourIst, durationMinutes]
  );

  const reset = () => {
    setName("");
    setEmail("");
    setMobile("");
    setRange(undefined);
    setSlot("");
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
    if (!range?.from || !range?.to) return "Select start and end date.";
    if (!slot) return "Select a night slot (8 to 12 IST).";
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
        `Session: ${durationMinutes} min daily (Night slot)`,
        `Preferred slot: ${slot}`,
        `Start date: ${formatDate(range?.from)}`,
        `End date: ${formatDate(range?.to)}`,
        `Course slug: ${courseSlug || "n/a"}`,
        `Payment: ${payAfterSchedule ? "Pay after schedule confirmation" : "Pay before scheduling"}`,
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
      `Session: ${durationMinutes} min daily (Night slot)`,
      `Preferred slot: ${slot || "-"}`,
      `Start date: ${formatDate(range?.from)}`,
      `End date: ${formatDate(range?.to)}`,
      `Payment: ${payAfterSchedule ? "Pay after schedule confirmation" : "Pay before scheduling"}`,
    ].join("\n");
    const encoded = encodeURIComponent(text);
    return `https://wa.me/918917549065?text=${encoded}`;
  }, [name, email, courseTitle, feeLabel, slot, range, durationMinutes, payAfterSchedule]);

  const canWhatsapp = name.trim() && email.trim();

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            1:1 Session for {courseTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-sm font-semibold">1:1 Plan Details</div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div>Fee: <span className="text-foreground font-semibold">{feeLabel}</span></div>
                <div>Duration: {durationMinutes} minutes daily</div>
                <div>Preferred time: {String(oneToOneStartHourIst ?? 20).padStart(2, "0")}:00 to {String(oneToOneEndHourIst ?? 24).padStart(2, "0")}:00 IST</div>
                <div className="text-emerald-600 dark:text-emerald-400">Payment will be collected after schedule confirmation.</div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="text-sm font-semibold">Pick dates</div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Start: <span className="text-foreground font-medium">{formatDate(range?.from)}</span></span>
                <span>End: <span className="text-foreground font-medium">{formatDate(range?.to)}</span></span>
              </div>
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                className="w-full p-2"
                disabled={(d) => d < new Date(Date.now() - 24 * 60 * 60 * 1000)}
              />
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Night slots (IST)
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {slots.map((s) => (
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
              {!slots.length ? (
                <div className="mt-2 text-xs text-muted-foreground">No slots configured. Update in Admin Panel.</div>
              ) : null}
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
              <div className="text-xs text-muted-foreground">
                Payment will be collected after schedule confirmation.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={submitRequest} disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit 1:1 Request"}
              </Button>
              <Button asChild variant="outline" disabled={!canWhatsapp} className="gap-2">
                <a
                  href={canWhatsapp ? whatsappLink : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!canWhatsapp) {
                      event.preventDefault();
                      toast.error("Add name and email to enable WhatsApp.");
                    }
                  }}
                >
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
