-- Mentorship bookings captured after successful Razorpay payment.

create table if not exists public.mentorship_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  package_name text not null,
  duration_minutes integer not null,
  currency text not null default 'INR',
  amount integer not null, -- in INR (not paise)

  timezone text not null default 'Asia/Kolkata',
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,

  name text not null,
  email text not null,
  mobile text not null,
  session_reason text not null,
  topic text not null,
  topic_other text,

  status text not null default 'paid' check (status in ('pending','paid','cancelled','refunded')),

  razorpay_order_id text not null,
  razorpay_payment_id text not null,
  payment_row_id uuid,
  metadata jsonb
);

create unique index if not exists mentorship_bookings_order_unique
  on public.mentorship_bookings(razorpay_order_id);

create index if not exists mentorship_bookings_scheduled_start_idx
  on public.mentorship_bookings(scheduled_start desc);

alter table public.mentorship_bookings enable row level security;

-- Admin read/manage only (bookings are created via service role inside edge function).
drop policy if exists "Admins can read mentorship bookings" on public.mentorship_bookings;
create policy "Admins can read mentorship bookings"
on public.mentorship_bookings
for select
using (has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage mentorship bookings" on public.mentorship_bookings;
create policy "Admins can manage mentorship bookings"
on public.mentorship_bookings
for all
using (has_role(auth.uid(), 'admin'));

