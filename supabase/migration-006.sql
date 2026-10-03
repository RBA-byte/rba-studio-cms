-- Run ONCE in Supabase > SQL Editor (after 002-005). Stores default rates and business details.
create table if not exists settings (id int primary key default 1 check (id = 1), data jsonb not null default '{}'::jsonb);
alter table settings enable row level security;
create policy owner_only on settings for all to authenticated using (is_owner()) with check (is_owner());
