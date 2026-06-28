-- Fix: The notification trigger references NEW.email, but the profiles table
-- does not have an email column. This causes signup to fail with:
-- "Database error saving new user"
--
-- Solution: Use NEW.full_name and NEW.id instead.

CREATE OR REPLACE FUNCTION public.handle_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES (
        'new_user',
        'New User Registered',
        'A new user "' || COALESCE(NEW.full_name, 'Unknown') || '" has joined the platform.',
        '/admin/users'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
