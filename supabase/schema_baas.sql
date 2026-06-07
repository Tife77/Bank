-- ============================================================================
-- BaaS (Increase) schema additions — run AFTER schema.sql
-- Adds the columns/tables needed to mirror Increase's real-money objects.
-- ============================================================================

-- ---- Profiles: link to the Increase Entity (KYC) ----
alter table public.profiles
  add column if not exists increase_entity_id text,
  add column if not exists kyc_status text default 'not_started';  -- not_started | pending | approved | rejected

-- ---- Accounts: link to the Increase Account + Account Number ----
alter table public.accounts
  add column if not exists increase_account_id text,
  add column if not exists increase_account_number_id text,
  add column if not exists routing_number text,
  add column if not exists full_account_number text,   -- store masked or vaulted in prod
  add column if not exists provider text default 'simulation';  -- simulation | increase

-- ---- Transfers: link to the Increase transfer object + live status ----
alter table public.transfers
  add column if not exists increase_transfer_id text,
  add column if not exists increase_transfer_type text,  -- ach | wire | account
  add column if not exists provider text default 'simulation';

-- ---- KYC submissions: store what the user submitted (encrypt/vault in prod) ----
create table if not exists public.kyc_submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  ssn_last4   text,                 -- only keep last4 in our DB; full SSN goes to Increase, not stored here
  doc_type    text,
  id_front_path text,               -- path in Supabase Storage (private bucket)
  id_back_path  text,
  status      text default 'pending',
  created_at  timestamptz default now()
);

-- ---- Webhook event log: idempotency + audit for Increase events ----
create table if not exists public.increase_events (
  id          text primary key,     -- Increase event id (dedupe)
  category    text,
  payload     jsonb,
  received_at timestamptz default now()
);

-- RLS
alter table public.kyc_submissions enable row level security;
alter table public.increase_events enable row level security;

drop policy if exists "own kyc" on public.kyc_submissions;
create policy "own kyc" on public.kyc_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- increase_events is service-role only (no anon/user access) — no policy = locked down.

-- Indexes
create index if not exists accounts_increase_idx on public.accounts (increase_account_id);
create index if not exists transfers_increase_idx on public.transfers (increase_transfer_id);
