-- Force delete the specific user and their data
-- Run this in the Supabase SQL Editor

-- 1. First, get the user ID for reference (optional, just for verification)
SELECT id, email FROM auth.users WHERE email = 'dripmich@gmail.com';

-- 2. Delete related data first (to avoid foreign key constraints if cascading isn't set up perfectly)
DELETE FROM public.meters 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'dripmich@gmail.com');

-- 3. Delete the profile (The trigger 'on_profile_deleted' should kick in and delete the auth user)
DELETE FROM public.profiles 
WHERE email = 'dripmich@gmail.com';

-- 4. HARD DELETE from auth.users (Just in case the trigger didn't fire or doesn't exist)
-- Note: This requires the script to be run with sufficient privileges (Service Role)
DELETE FROM auth.users 
WHERE email = 'dripmich@gmail.com';

-- 5. Verify deletion
SELECT * FROM auth.users WHERE email = 'dripmich@gmail.com';
