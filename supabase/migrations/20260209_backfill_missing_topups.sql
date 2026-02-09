-- Backfill missing topups for meters that have balance but no history
-- This fixes the "0 RWF" issue for meters registered before the permissions fix

INSERT INTO public.topups (meter_id, amount_paid, units_bought, token_code)
SELECT 
    id, 
    -- Estimate amount paid based on current balance (approx 300 RWF/kWh avg)
    (balance_kwh * 300)::numeric, 
    balance_kwh, 
    'SYSTEM-BACKFILL'
FROM public.meters
WHERE balance_kwh > 0 
AND NOT EXISTS (
    SELECT 1 FROM public.topups WHERE topups.meter_id = meters.id
);

-- Result
SELECT count(*) as fixed_records FROM public.topups WHERE token_code = 'SYSTEM-BACKFILL';
