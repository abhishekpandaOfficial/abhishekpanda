import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const pad2 = (n: number) => String(n).padStart(2, "0");

const toIcsUtc = (d: Date) => {
  // YYYYMMDDTHHMMSSZ
  return (
    d.getUTCFullYear() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    "T" +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    pad2(d.getUTCSeconds()) +
    "Z"
  );
};

const escapeIcs = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const buildIcs = (args: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  organizerEmail: string;
  attendeeEmail: string;
}) => {
  const dtstamp = toIcsUtc(new Date());
  const dtstart = toIcsUtc(args.start);
  const dtend = toIcsUtc(args.end);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//abhishekpanda.com//Mentorship//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(args.uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeIcs(args.summary)}`,
    `DESCRIPTION:${escapeIcs(args.description)}`,
    `ORGANIZER:MAILTO:${escapeIcs(args.organizerEmail)}`,
    `ATTENDEE;CN=${escapeIcs(args.attendeeEmail)};RSVP=TRUE:MAILTO:${escapeIcs(args.attendeeEmail)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
};

type Req = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "hello@abhishekpanda.com";

  if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Missing Supabase env." });
  if (!resendApiKey) return json(500, { error: "Missing RESEND_API_KEY." });

  const body = (await req.json().catch(() => null)) as Req | null;
  if (!body?.razorpay_order_id || !body?.razorpay_payment_id) {
    return json(400, { error: "Missing razorpay_order_id / razorpay_payment_id" });
  }

  const sb = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Ensure payment is completed and matches.
  const { data: paymentRow, error: payErr } = await sb
    .from("payments")
    .select("*")
    .eq("order_id", body.razorpay_order_id)
    .maybeSingle();

  if (payErr || !paymentRow) return json(404, { error: "Payment order not found." });
  if (paymentRow.status !== "completed") return json(400, { error: "Payment not completed." });
  if (paymentRow.payment_id !== body.razorpay_payment_id) {
    return json(400, { error: "Payment id mismatch." });
  }

  const meta = (paymentRow.metadata ?? {}) as Record<string, unknown>;
  const booking = (meta.booking ?? {}) as Record<string, unknown>;

  const required = [
    "package_name",
    "duration_minutes",
    "amount",
    "currency",
    "timezone",
    "scheduled_start",
    "scheduled_end",
    "name",
    "email",
    "mobile",
    "session_reason",
    "topic",
  ];
  for (const k of required) {
    if (booking[k] === undefined || booking[k] === null || booking[k] === "") {
      return json(400, { error: `Missing booking.${k} in payment metadata.` });
    }
  }

  const scheduledStart = new Date(String(booking.scheduled_start));
  const scheduledEnd = new Date(String(booking.scheduled_end));
  if (!Number.isFinite(scheduledStart.getTime()) || !Number.isFinite(scheduledEnd.getTime())) {
    return json(400, { error: "Invalid scheduled_start/scheduled_end." });
  }

  // Idempotency: create once per order_id.
  const { data: existing } = await sb
    .from("mentorship_bookings")
    .select("id")
    .eq("razorpay_order_id", body.razorpay_order_id)
    .maybeSingle();
  if (existing?.id) {
    return json(200, { success: true, booking_id: existing.id, idempotent: true });
  }

  const insert = {
    package_name: String(booking.package_name),
    duration_minutes: Number(booking.duration_minutes),
    currency: String(booking.currency),
    amount: Number(booking.amount),
    timezone: String(booking.timezone),
    scheduled_start: scheduledStart.toISOString(),
    scheduled_end: scheduledEnd.toISOString(),
    name: String(booking.name),
    email: String(booking.email),
    mobile: String(booking.mobile),
    session_reason: String(booking.session_reason),
    topic: String(booking.topic),
    topic_other: booking.topic_other ? String(booking.topic_other) : null,
    status: "paid",
    razorpay_order_id: body.razorpay_order_id,
    razorpay_payment_id: body.razorpay_payment_id,
    payment_row_id: paymentRow.id,
    metadata: meta,
  };

  const { data: created, error: insErr } = await sb
    .from("mentorship_bookings")
    .insert(insert)
    .select("id")
    .single();
  if (insErr) return json(500, { error: insErr.message });

  const uid = `mentorship-${created.id}@abhishekpanda.com`;
  const summary = `Mentorship: ${insert.package_name} (${insert.duration_minutes} min)`;
  const description = [
    `Package: ${insert.package_name}`,
    `Duration: ${insert.duration_minutes} minutes`,
    `Timezone: ${insert.timezone}`,
    `Topic: ${insert.topic}${insert.topic_other ? ` (${insert.topic_other})` : ""}`,
    `Reason: ${insert.session_reason}`,
    `Order: ${insert.razorpay_order_id}`,
    `Payment: ${insert.razorpay_payment_id}`,
    "",
    "Video call link will be shared before the session.",
  ].join("\n");

  const ics = buildIcs({
    uid,
    start: scheduledStart,
    end: scheduledEnd,
    summary,
    description,
    organizerEmail: adminEmail,
    attendeeEmail: insert.email,
  });

  const attachments = [
    {
      filename: "invite.ics",
      content: btoa(ics),
    },
  ];

  const sendEmail = async (to: string[], subject: string, html: string) => {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Abhishek Panda <no-reply@abhishekpanda.com>",
        to,
        subject,
        html,
        attachments,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Resend failed: ${t}`);
    }
  };

  const when = `Scheduled (IST): ${String(booking.scheduled_start_ist ?? "")}`; // optional pretty field
  const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    await sendEmail(
      [adminEmail],
      `New Mentorship Booking: ${insert.package_name}`,
      `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
        <h2>New mentorship booking</h2>
        <p><b>${safe(insert.name)}</b> (${safe(insert.email)}) booked <b>${safe(insert.package_name)}</b>.</p>
        <ul>
          <li>Start: ${safe(new Date(insert.scheduled_start).toISOString())}</li>
          <li>End: ${safe(new Date(insert.scheduled_end).toISOString())}</li>
          <li>Timezone: ${safe(insert.timezone)}</li>
          <li>Topic: ${safe(insert.topic)}${insert.topic_other ? ` (${safe(insert.topic_other)})` : ""}</li>
          <li>Reason: ${safe(insert.session_reason)}</li>
          <li>Order: ${safe(insert.razorpay_order_id)}</li>
          <li>Payment: ${safe(insert.razorpay_payment_id)}</li>
        </ul>
        <p>ICS invite attached.</p>
      </div>`
    );

    await sendEmail(
      [insert.email],
      `Mentorship booked: ${insert.package_name}`,
      `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
        <h2>Your session is booked</h2>
        <p>Hi ${safe(insert.name)}, your mentorship session is confirmed.</p>
        <ul>
          <li>Package: ${safe(insert.package_name)}</li>
          <li>Duration: ${insert.duration_minutes} minutes</li>
          <li>Timezone: ${safe(insert.timezone)} (IST)</li>
          <li>Start (UTC): ${safe(new Date(insert.scheduled_start).toISOString())}</li>
          <li>Order: ${safe(insert.razorpay_order_id)}</li>
        </ul>
        <p>Calendar invite (ICS) is attached. Video call link will be shared before the session.</p>
      </div>`
    );
  } catch (e) {
    // Booking is still stored; just report email failure.
    return json(200, { success: true, booking_id: created.id, email_error: e instanceof Error ? e.message : String(e) });
  }

  return json(200, { success: true, booking_id: created.id });
};

serve(handler);

