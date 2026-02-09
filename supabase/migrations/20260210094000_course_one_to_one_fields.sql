ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS one_to_one_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS one_to_one_price_inr INTEGER,
  ADD COLUMN IF NOT EXISTS one_to_one_duration_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS one_to_one_start_hour_ist INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS one_to_one_end_hour_ist INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS one_to_one_pay_after_schedule BOOLEAN DEFAULT true;
