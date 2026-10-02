-- Phase 1. Single owner: set your auth user's id below, then run in the Supabase SQL editor.
create table profiles (id uuid primary key references auth.users, name text);
create table clients (id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, created_at timestamptz default now());
create table quotations (id uuid primary key default gen_random_uuid(), number text unique not null, client_id uuid references clients,
  status text not null default 'draft' check (status in ('draft','sent','revision_requested','accepted','rejected','expired')),
  current_revision int not null default 1, created_at timestamptz default now());
create table quotation_revisions (id uuid primary key default gen_random_uuid(), quotation_id uuid references quotations on delete cascade,
  revision int not null, additional_profit numeric default 0, discount numeric default 0, total numeric not null,
  terms_snapshot text, created_at timestamptz default now(), unique (quotation_id, revision));
create table quotation_events (id uuid primary key default gen_random_uuid(), revision_id uuid references quotation_revisions on delete cascade, name text, event_date date, venue text);
create table quotation_resources (id uuid primary key default gen_random_uuid(), revision_id uuid references quotation_revisions on delete cascade, kind text, quantity int, days int, rate numeric);
create table quotation_deliverables (id uuid primary key default gen_random_uuid(), revision_id uuid references quotation_revisions on delete cascade, description text, quantity int, note text);
create table quotation_terms (id int primary key default 1, body text not null);
do $$ declare t text; begin
 foreach t in array array['profiles','clients','quotations','quotation_revisions','quotation_events','quotation_resources','quotation_deliverables','quotation_terms'] loop
  execute format('alter table %I enable row level security', t);
  execute format($p$create policy owner_only on %I for all using (auth.uid() = 'REPLACE-WITH-YOUR-USER-UUID'::uuid)$p$, t);
 end loop; end $$;
