-- Run ONCE in Supabase > SQL Editor (after migration-002 and 003).
alter table booking_slots add column if not exists cost numeric not null default 0;
