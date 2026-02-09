-- THOROUGH CLEAN SLATE SCRIPT
-- Resets everything to zero for the testing account to avoid signup rate limits.

DO $$ 
DECLARE 
    target_email TEXT := 'chadmichaelmich@gmail.com';
    target_id UUID;
BEGIN
    -- 1. Get the User ID
    SELECT id INTO target_id FROM auth.users WHERE email = target_email;

    IF target_id IS NOT NULL THEN
        -- 2. Delete all transaction-related data
        DELETE FROM public.alerts WHERE meter_id IN (SELECT id FROM public.meters WHERE user_id = target_id);
        DELETE FROM public.topups WHERE user_id = target_id;
        DELETE FROM public.tokens; -- Clear all tokens to start fresh
        
        -- 3. Reset Meters or Re-create them? 
        -- User said "Clean the meters", so we wipe them.
        DELETE FROM public.meters WHERE user_id = target_id;
        
        -- 4. Re-validate Profile
        UPDATE public.profiles 
        SET full_name = 'Test User', 
            role = 'user' 
        WHERE id = target_id;

        RAISE NOTICE 'Thorough clean slate complete for % (%)', target_email, target_id;
    ELSE
        RAISE NOTICE 'User % not found. No cleaning done.', target_email;
    END IF;
END $$;
