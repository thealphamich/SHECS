-- Helper function to check if the current user is an admin without triggering RLS recursion
-- SECURITY DEFINER allows this function to bypass RLS checks for the internal query
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    -- Fast trap for the primary admin email
    (auth.jwt() ->> 'email' = 'dripmich@gmail.com')
    OR
    -- Check specific role in profiles table (SECURITY DEFINER ensures we don't recurse)
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear out recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- New robust policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Unified admin management policy
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());
