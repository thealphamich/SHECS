-- Fix Schema and Backfill Data
-- 1. Add missing 'units_bought' column (which caused the silent failures)
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS units_bought numeric DEFAULT 0;

-- 2. Backfill missing topups for meters that have balance but no history
INSERT INTO public.topups (meter_id, amount_paid, units_bought, token_code)
SELECT 
    id, 
    -- Estimate amount paid: 300 RWF per kWh
    (balance_kwh * 300)::numeric, 
    balance_kwh, 
    'SYSTEM-BACKFILL'
FROM public.meters
WHERE balance_kwh > 0 
AND NOT EXISTS (
    SELECT 1 FROM public.topups WHERE topups.meter_id = meters.id
);

-- 3. Verify
SELECT count(*) as fixed_records FROM public.topups WHERE token_code = 'SYSTEM-BACKFILL';
