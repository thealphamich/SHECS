-- RLS FIX FOR GREEN HILLS UTILITY FEATURES

-- 1. Meters table updates
-- Drop existing policies to ensure a clean state for user/admin distinction
DROP POLICY IF EXISTS "Users can view own meter" ON public.meters;
DROP POLICY IF EXISTS "Users can register own meter" ON public.meters;
DROP POLICY IF EXISTS "Users can update own meter" ON public.meters;
DROP POLICY IF EXISTS "Admins can view all meters" ON public.meters;
DROP POLICY IF EXISTS "Admins can manage all meters" ON public.meters;

-- User Policies for Meters
CREATE POLICY "Users can view own meter" ON public.meters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register own meter" ON public.meters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meter" ON public.meters
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin Policy for Meters
CREATE POLICY "Admins can manage all meters" ON public.meters
    FOR ALL USING (public.is_admin());


-- 2. Topups table updates
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own topups" ON public.topups;
DROP POLICY IF EXISTS "Users can record own topups" ON public.topups;
DROP POLICY IF EXISTS "Admins can view all topups" ON public.topups;

-- User Policies for Topups
CREATE POLICY "Users can view own topups" ON public.topups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record own topups" ON public.topups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin Policy for Topups
CREATE POLICY "Admins can manage all topups" ON public.topups
    FOR ALL USING (public.is_admin());


-- 3. Alerts table updates (Ensuring admins can manage)
DROP POLICY IF EXISTS "Admins can manage all alerts" ON public.alerts;
CREATE POLICY "Admins can manage all alerts" ON public.alerts
    FOR ALL USING (public.is_admin());
