-- Update is_admin function to include thealphamich@gmail.com as a primary admin
-- and update alerts policies to use the is_admin() helper for consistency.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    -- Fast trap for the primary admin emails
    (auth.jwt() ->> 'email' IN ('dripmich@gmail.com', 'thealphamich@gmail.com'))
    OR
    -- Check specific role in profiles table
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update alerts policies to use the helper function
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON public.alerts;

CREATE POLICY "Admins can view all alerts"
ON public.alerts FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert alerts"
ON public.alerts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update alerts"
ON public.alerts FOR UPDATE
TO authenticated
USING (public.is_admin());
