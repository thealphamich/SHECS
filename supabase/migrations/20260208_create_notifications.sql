-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'system', 'alert', 'info', 'new_user', 'new_meter'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin can view all notifications (assuming admin check is done in app or via role)
-- For now, we'll allow authenticated users to read notifications to support the TopNav fetch
CREATE POLICY "Enable read access for authenticated users" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role or logic can insert (or authenticated for now to keep it simple for our server actions)
CREATE POLICY "Enable insert for authenticated users" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create trigger for new user notification
CREATE OR REPLACE FUNCTION public.handle_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES (
        'new_user',
        'New User Registered',
        'A new user ' || NEW.email || ' has joined the platform.',
        '/admin/users'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users string
-- Note: Triggers on auth.users are tricky in Supabase matching, usually we trigger on profiles
-- But let's trigger on public.profiles since that's where we store user data we care about
CREATE OR REPLACE TRIGGER on_profile_created_notification
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_notification();

-- Create trigger for new meter notification (optional, but we'll do it via Server Action for more control)
