-- Run ONCE in Supabase > SQL Editor (for the project that already has the first schema).
alter table bookings add column if not exists cancelled_at timestamptz;
alter table bookings add column if not exists cancel_reason text;
alter table bookings add column if not exists refund_amount numeric not null default 0;
alter table booking_events add column if not exists outdoor boolean not null default false;
create table if not exists production_tasks (
  id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade,
  ord int not null, label text not null, done boolean not null default false, done_on date, unique (booking_id, ord));
alter table production_tasks enable row level security;
create policy owner_only on production_tasks for all to authenticated using (is_owner()) with check (is_owner());
