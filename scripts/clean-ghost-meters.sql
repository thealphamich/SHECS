-- GHOST METER CLEANUP (Simplified Version)
-- Removes meters that have no owner (orphaned during previous deletions)

-- 1. Meters where user_id is NULL
DELETE FROM public.meters WHERE user_id IS NULL;

-- 2. Meters where the user_id refers to a non-existent profile
DELETE FROM public.meters WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 3. Cleanup associated orphaned history
DELETE FROM public.topups WHERE meter_id NOT IN (SELECT id FROM public.meters);
DELETE FROM public.readings WHERE meter_id NOT IN (SELECT id FROM public.meters);
DELETE FROM public.alerts WHERE meter_id NOT IN (SELECT id FROM public.meters);
