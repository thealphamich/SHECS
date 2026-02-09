-- Ensure new users get 'user' role by default
-- This trigger runs after a new auth user is created

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',  -- Default role for all new signups
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(profiles.role, 'user');  -- Only set role if it doesn't exist
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
