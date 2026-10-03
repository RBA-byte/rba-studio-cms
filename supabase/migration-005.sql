-- Run ONCE in Supabase > SQL Editor (after 002, 003, 004).
create table if not exists booking_addons (
  id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade,
  description text not null, amount numeric not null, created_at timestamptz default now());
alter table booking_addons enable row level security;
create policy owner_only on booking_addons for all to authenticated using (is_owner()) with check (is_owner());
