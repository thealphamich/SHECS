-- Clean up all data to reset the system history
-- Run this in the Supabase SQL Editor

BEGIN;

-- 1. Clear Notifications
TRUNCATE TABLE public.notifications;

-- 2. Clear Alerts
TRUNCATE TABLE public.alerts CASCADE;

-- 3. Clear Transactions (Topups)
-- If topups has a foreign key to meters, we can just truncate it or let cascade handle it.
-- Explicitly truncating is safer.
TRUNCATE TABLE public.topups CASCADE;

-- 4. Clear Meters (This will cascade delete related readings if any)
DELETE FROM public.meters;

COMMIT;

-- Verify
SELECT count(*) as meters_count FROM public.meters;
SELECT count(*) as topups_count FROM public.topups;
