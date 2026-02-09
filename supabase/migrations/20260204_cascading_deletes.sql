-- ENHANCED CASCADING DELETES

-- 1. Meters table (already linked to profiles, ensure cascade)
ALTER TABLE public.meters 
    DROP CONSTRAINT IF EXISTS meters_user_id_fkey,
    ADD CONSTRAINT meters_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 2. Topups table (link to meters and users)
ALTER TABLE public.topups 
    DROP CONSTRAINT IF EXISTS topups_user_id_fkey,
    DROP CONSTRAINT IF EXISTS topups_meter_id_fkey,
    ADD CONSTRAINT topups_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
    ON DELETE CASCADE,
    ADD CONSTRAINT topups_meter_id_fkey 
    FOREIGN KEY (meter_id) REFERENCES public.meters(id) 
    ON DELETE CASCADE;

-- 3. Alerts table
ALTER TABLE public.alerts 
    DROP CONSTRAINT IF EXISTS alerts_meter_id_fkey,
    ADD CONSTRAINT alerts_meter_id_fkey 
    FOREIGN KEY (meter_id) REFERENCES public.meters(id) 
    ON DELETE CASCADE;

-- 4. Tokens table is generally standalone but linked via topups. 
-- If we want to clean tokens too, we'd need a more complex trigger or manual cleanup, 
-- but cascading covers the main user/meter data.
