-- Enable RLS on topups if not already enabled
alter table public.topups enable row level security;

-- Policy for Admins to view all topups
create policy "Admins can view all topups"
on public.topups for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Policy for Users to view their own topups
create policy "Users can view their own topups"
on public.topups for select
to authenticated
using (
  exists (
    select 1 from meters
    where meters.id = topups.meter_id and meters.user_id = auth.uid()
  )
);
