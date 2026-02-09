-- Comprehensive Fix for Topups Permissions (RLS)
-- Run this in Supabase SQL Editor to ensure transactions are visible

-- Enable RLS on the table
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

-- Remove valid policies if they exist to avoid conflicts (clean slate)
DROP POLICY IF EXISTS "Admins can view all topups" ON public.topups;
DROP POLICY IF EXISTS "Users can insert topups" ON public.topups;
DROP POLICY IF EXISTS "Users can view own topups" ON public.topups;
DROP POLICY IF EXISTS "Authenticated users can insert topups" ON public.topups;

-- 1. Insert Policy: Allow ANY authenticated user to insert a record (Essential for Registration)
CREATE POLICY "Authenticated users can insert topups"
ON public.topups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Select Policy (Admin): Admins can see EVERYTHING
CREATE POLICY "Admins can view all topups"
ON public.topups
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- 3. Select Policy (User): Users can see topups for THEIR meters
CREATE POLICY "Users can view own topups"
ON public.topups
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from meters
    where meters.id = topups.meter_id
    and meters.user_id = auth.uid()
  )
);

-- Verification: check policies
SELECT * FROM pg_policies WHERE tablename = 'topups';
