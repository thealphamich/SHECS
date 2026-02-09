-- Create alerts table for utility tracking
create table if not exists public.alerts (
  id uuid not null default gen_random_uuid (),
  meter_id uuid not null references public.meters (id) on delete cascade,
  type text not null, -- 'LOW_BALANCE', 'TAMPER', 'POWER_OUTAGE'
  message text not null,
  is_resolved boolean default false,
  created_at timestamp with time zone not null default now(),
  constraint alerts_pkey primary key (id)
);

-- RLS policies
alter table public.alerts enable row level security;

create policy "Admins can view all alerts"
on public.alerts for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Admins can insert alerts"
on public.alerts for insert
to authenticated
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Admins can update alerts"
on public.alerts for update
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
