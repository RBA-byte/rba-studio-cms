-- RBA CMS schema. Paste into Supabase > SQL Editor > Run. Safe to run on a fresh project.
create or replace function is_owner() returns boolean language sql stable as
$$ select auth.uid() = 'c5d52273-32ef-47f8-8a55-f7529c94725d'::uuid $$;

create table clients (id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, created_at timestamptz default now());
create table quotations (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1030) unique,
  client_id uuid references clients,
  status text not null default 'Draft' check (status in ('Draft','Sent','Revision requested','Accepted','Rejected','Expired')),
  current_revision int not null default 1, created_at timestamptz default now());
create table quotation_revisions (
  id uuid primary key default gen_random_uuid(), quotation_id uuid not null references quotations on delete cascade,
  revision int not null, total numeric not null, data jsonb not null, created_at timestamptz default now(), unique (quotation_id, revision));
create table bookings (
  id uuid primary key default gen_random_uuid(), quotation_id uuid unique references quotations, ref text not null,
  couple text not null, phone text, total numeric not null, status text not null default 'Booked', phase int not null default 1, created_at timestamptz default now(),
  cancelled_at timestamptz, cancel_reason text, refund_amount numeric not null default 0);
create table booking_events (id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade, name text not null, event_date date, venue text, outdoor boolean not null default false);
create table booking_slots (
  id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade, ord int not null default 0,
  event_name text not null, role text not null, status text not null default 'pending' check (status in ('assigned','pending','agency')), person text, agency text, cost numeric not null default 0);
create table production_tasks (id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade, ord int not null, label text not null, done boolean not null default false, done_on date, unique (booking_id, ord));
create table expenses (id uuid primary key default gen_random_uuid(), booking_id uuid references bookings on delete set null, spent_on date not null default current_date, amount numeric not null check (amount > 0), category text not null, note text, created_at timestamptz default now());
create table booking_addons (id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade, description text not null, amount numeric not null, created_at timestamptz default now());
create table payments (
  id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings on delete cascade,
  seq bigint generated always as identity unique, amount numeric not null check (amount > 0), paid_on date not null default current_date, created_at timestamptz default now());

do $$ declare t text; begin
 foreach t in array array['clients','quotations','quotation_revisions','bookings','booking_events','booking_slots','payments','production_tasks','expenses','booking_addons'] loop
  execute format('alter table %I enable row level security', t);
  execute format('create policy owner_only on %I for all to authenticated using (is_owner()) with check (is_owner())', t);
 end loop; end $$;
