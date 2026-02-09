-- Final Schema Fix & Backfill
-- It seems the 'topups' table was missing MULTIPLE columns used by the app.
-- This script adds them all safely and then restores the missing data.

-- 1. Add 'units_bought' column
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS units_bought numeric DEFAULT 0;

-- 2. Add 'token_code' column
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS token_code text DEFAULT 'LEGACY-TOKEN';

-- 3. Backfill missing history for meters with balance
INSERT INTO public.topups (meter_id, amount_paid, units_bought, token_code)
SELECT 
    id, 
    -- Estimate amount: 300 RWF per kWh
    (balance_kwh * 300)::numeric, 
    balance_kwh, 
    'SYSTEM-BACKFILL'
FROM public.meters
WHERE balance_kwh > 0 
AND NOT EXISTS (
    SELECT 1 FROM public.topups WHERE topups.meter_id = meters.id
);

-- 4. Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'topups';

-- 5. Verify data backfilled
SELECT count(*) as fixed_records FROM public.topups WHERE token_code = 'SYSTEM-BACKFILL';
