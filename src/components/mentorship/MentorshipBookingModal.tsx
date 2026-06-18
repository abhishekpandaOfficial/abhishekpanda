import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatIst, istPartsToUtcDate } from "@/lib/time/ist";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export type MentorshipPackage = {
  name: string;
  durationMinutes: number;
  amountInr: number;
  description: string;
};

const TOPICS = [
  ".NET Architecture",
  "System Design",
  "AI/ML",
  "Cloud / DevOps",
  "Career Strategy",
  "Resume / LinkedIn",
  "Interview Prep",
  "Code Review",
  "Other",
] as const;

const loadRazorpay = async () => {
  if (window.Razorpay) return true;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
  return !!window.Razorpay;
};

const toSlots = (durationMinutes: number) => {
  // Simple default slots (IST). You can adjust later.
  // 10:00 to 20:00 every 30 minutes.
  const slots: { hour: number; minute: number; label: string }[] = [];
  for (let h = 10; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 0) continue;
      const endMin = h * 60 + m + durationMinutes;
      if (endMin > 21 * 60) continue;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push({ hour: h, minute: m, label: `${hh}:${mm} IST` });
    }
  }
  return slots;
};

export function MentorshipBookingModal(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pkg: MentorshipPackage | null;
}) {
  const { open, onOpenChange, pkg } = props;

  const slots = useMemo(() => (pkg ? toSlots(pkg.durationMinutes) : []), [pkg]);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slotIdx, setSlotIdx] = useState<number | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [topicOther, setTopicOther] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const selectedStartUtc = useMemo(() => {
    if (!date || slotIdx === null || !pkg) return null;
    const s = slots[slotIdx];
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return istPartsToUtcDate({ year: y, month: m, day: d, hour: s.hour, minute: s.minute });
  }, [date, slotIdx, slots, pkg]);

  const selectedEndUtc = useMemo(() => {
    if (!selectedStartUtc || !pkg) return null;
    return new Date(selectedStartUtc.getTime() + pkg.durationMinutes * 60 * 1000);
  }, [selectedStartUtc, pkg]);

  const canProceed = !!pkg && !!date && slotIdx !== null;

  const reset = () => {
    setDate(undefined);
    setSlotIdx(null);
    setTopic("");
    setTopicOther("");
    setName("");
    setEmail("");
    setMobile("");
    setReason("");
    setIsPaying(false);
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) reset();
  };

  const validate = () => {
    if (!pkg) return "No package selected";
    if (!selectedStartUtc || !selectedEndUtc) return "Select a date and time";
    if (!name.trim()) return "Enter your name";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email";
    if (!mobile.trim() || mobile.trim().length < 7) return "Enter a valid mobile number";
    if (!reason.trim()) return "Enter session reason";
    if (!topic) return "Select a topic";
    if (topic === "Other" && !topicOther.trim()) return "Enter topic (Other)";
    return null;
  };

  const onPay = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (!pkg || !selectedStartUtc || !selectedEndUtc) return;

    setIsPaying(true);
    try {
      await loadRazorpay();

      const { data: sessionRes } = await supabase.auth.getSession();
      const userId = sessionRes?.session?.user?.id ?? null;

      const booking = {
        package_name: pkg.name,
        duration_minutes: pkg.durationMinutes,
        amount: pkg.amountInr,
        currency: "INR",
        timezone: "Asia/Kolkata",
        scheduled_start: selectedStartUtc.toISOString(),
        scheduled_end: selectedEndUtc.toISOString(),
        // convenience display for emails
        scheduled_start_ist: formatIst(selectedStartUtc),
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        session_reason: reason.trim(),
        topic,
        topic_other: topic === "Other" ? topicOther.trim() : null,
      };

      const { data: orderRes, error: orderErr } = await supabase.functions.invoke("razorpay", {
        body: {
          action: "create-order",
          amount: pkg.amountInr,
          currency: "INR",
          product_type: "mentorship",
          product_id: pkg.name,
          user_id: userId,
          metadata: { booking },
        },
      });
      if (orderErr) throw orderErr;
      if (!orderRes?.success) throw new Error(orderRes?.error || "Failed to create order");

      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Abhishek Panda",
        description: `Mentorship: ${pkg.name}`,
        order_id: orderRes.order_id,
        prefill: { name: booking.name, email: booking.email, contact: booking.mobile },
        notes: { package: pkg.name, scheduled_start_ist: booking.scheduled_start_ist },
        theme: { color: "#10b981" },
        handler: async (response: any) => {
          try {
            const { error: verifyErr, data: verifyRes } = await supabase.functions.invoke("razorpay", {
              body: { action: "verify-payment", ...response },
            });
            if (verifyErr || !verifyRes?.success) throw new Error(verifyRes?.error || verifyErr?.message);

            const { error: bookErr, data: bookRes } = await supabase.functions.invoke("mentorship-booking", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            });
            if (bookErr || !bookRes?.success) throw new Error(bookRes?.error || bookErr?.message);

            toast.success("Session booked. Confirmation email sent.");
            close(false);
          } catch (e: any) {
            toast.error(e?.message || "Payment verified, but booking failed. Contact support.");
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e: any) {
      toast.error(e?.message || "Payment failed");
      setIsPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Book Mentorship {pkg ? `: ${pkg.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        {!pkg ? (
          <div className="text-sm text-muted-foreground">Select a package first.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Timezone: IST (Asia/Kolkata)</div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(Date.now() - 24 * 60 * 60 * 1000)}
              />

              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-primary" />
                  Pick a time (IST)
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {slots.map((s, idx) => (
                    <Button
                      key={s.label}
                      type="button"
                      variant={slotIdx === idx ? "default" : "outline"}
                      size="sm"
                      className="justify-center"
                      onClick={() => setSlotIdx(idx)}
                      disabled={!date}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedStartUtc ? (
                <div className="text-xs text-muted-foreground">
                  Selected: <span className="text-foreground font-medium">{formatIst(selectedStartUtc)}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{pkg.name}</div>
                  <div className="text-sm font-bold flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {pkg.amountInr.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{pkg.description}</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-1">
                  <Label>Mobile No</Label>
                  <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91..." />
                </div>
                <div className="space-y-1">
                  <Label>Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {topic === "Other" ? (
                  <div className="space-y-1">
                    <Label>Other topic</Label>
                    <Input value={topicOther} onChange={(e) => setTopicOther(e.target.value)} placeholder="Write your topic" />
                  </div>
                ) : null}
                <div className="space-y-1">
                  <Label>Session reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="What do you want to achieve in this session?"
                    className="min-h-[110px]"
                  />
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                size="lg"
                disabled={!canProceed || isPaying}
                onClick={onPay}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay & Book Session"
                )}
              </Button>

              <div className="text-[11px] text-muted-foreground">
                Times are shown in IST (Asia/Kolkata). After payment, you’ll receive a calendar invite (ICS) on email.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

