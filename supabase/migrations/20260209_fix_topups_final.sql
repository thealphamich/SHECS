-- FINAL FIX: Correct Column Names & Backfill
-- The error revealed the table expects 'kwh_bought', not 'units_bought'.
-- This script handles everything robustly.

-- 1. Ensure 'kwh_bought' exists (it seems to exist and be NOT NULL based on error)
-- We will also add 'units_bought' just in case the code uses it, or rename/alias if needed.
-- But based on error, 'kwh_bought' is the required column.

-- 2. Add 'token_code' if missing (error said it was missing in previous attempt)
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS token_code text DEFAULT 'LEGACY-TOKEN';

-- 3. Backfill with CORRECT column names
INSERT INTO public.topups (meter_id, amount_paid, kwh_bought, token_code)
SELECT 
    id, 
    -- Estimate amount: 300 RWF per kWh
    (balance_kwh * 300)::numeric, 
    balance_kwh, -- Map balance to kwh_bought
    'SYSTEM-BACKFILL'
FROM public.meters
WHERE balance_kwh > 0 
AND NOT EXISTS (
    SELECT 1 FROM public.topups WHERE topups.meter_id = meters.id
);

-- 4. Verify
SELECT count(*) as fixed_records FROM public.topups WHERE token_code = 'SYSTEM-BACKFILL';
