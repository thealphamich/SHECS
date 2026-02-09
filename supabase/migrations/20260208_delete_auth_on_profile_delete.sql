-- Migration: Auto-delete Auth user when profile is deleted
-- This ensures that when an admin deletes a user profile, the Supabase Auth account is also removed

-- Create a function to delete the auth user
CREATE OR REPLACE FUNCTION delete_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete the user from auth.users
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

-- Create a trigger that fires AFTER a profile is deleted
DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
    AFTER DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION delete_auth_user();

COMMENT ON FUNCTION delete_auth_user() IS 'Automatically deletes the Supabase Auth user when a profile is deleted';
