-- Run ONCE in Supabase > SQL Editor (after migration-002).
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(), booking_id uuid references bookings on delete set null,
  spent_on date not null default current_date, amount numeric not null check (amount > 0),
  category text not null, note text, created_at timestamptz default now());
alter table expenses enable row level security;
create policy owner_only on expenses for all to authenticated using (is_owner()) with check (is_owner());
