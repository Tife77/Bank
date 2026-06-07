-- ============================================================================
-- One Nevada Credit Union — Supabase schema
-- Paste this whole file into Supabase Dashboard > SQL Editor > New query > Run.
-- Safe to re-run (drops & recreates policies/functions).
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles: one row per auth user
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  first_name  text,
  middle_name text,
  last_name   text,
  full_name   text,
  initials    text,
  phone       text,
  address     text,
  city        text,
  state       text,
  zip         text,
  date_of_birth date,
  credit_score  int default 748,
  last_login    timestamptz,
  created_at    timestamptz default now()
);

-- Accounts: a user can have several (checking, savings, credit, ...)
create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  type           text not null,
  account_number text not null,
  balance        numeric(14,2) not null default 0,
  available      numeric(14,2) not null default 0,
  is_credit      boolean not null default false,
  color          text default 'from-[#117ACA] to-[#0a5fa0]',
  created_at     timestamptz default now()
);
create index if not exists accounts_user_idx on public.accounts (user_id);

-- Transactions: ledger entries against an account
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.accounts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  merchant    text not null,
  category    text default 'General',
  amount      numeric(14,2) not null,        -- negative = debit, positive = credit
  icon_type   text default 'box',
  created_at  timestamptz default now()
);
create index if not exists transactions_user_idx on public.transactions (user_id, created_at desc);

-- Transfers / wires / ACH: a record of money movement requests
create table if not exists public.transfers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  from_account   uuid references public.accounts (id) on delete set null,
  kind           text not null default 'internal',  -- internal | external | ach | wire | deposit
  recipient_name text,
  recipient_bank text,
  recipient_acct text,
  amount         numeric(14,2) not null,
  memo           text,
  status         text not null default 'completed',
  created_at     timestamptz default now()
);
create index if not exists transfers_user_idx on public.transfers (user_id, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY  (each user only ever sees / touches their own rows)
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.accounts     enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers    enable row level security;

drop policy if exists "own profile"        on public.profiles;
drop policy if exists "own accounts"        on public.accounts;
drop policy if exists "own transactions"    on public.transactions;
drop policy if exists "own transfers"       on public.transfers;

create policy "own profile"     on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own accounts"    on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own transfers"   on public.transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: when a user signs up, create their profile + starter accounts
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fname text := coalesce(meta->>'first_name', split_part(new.email,'@',1));
  lname text := coalesce(meta->>'last_name', '');
  acct_no text;
begin
  insert into public.profiles (id, email, first_name, middle_name, last_name, full_name, initials,
                               phone, address, city, state, zip, date_of_birth, last_login)
  values (
    new.id, new.email, fname, meta->>'middle_name', lname,
    trim(both ' ' from fname || ' ' || lname),
    upper(left(coalesce(fname,'U'),1) || left(coalesce(nullif(lname,''),'X'),1)),
    meta->>'phone', meta->>'address', meta->>'city', meta->>'state', meta->>'zip',
    nullif(meta->>'date_of_birth','')::date, now()
  )
  on conflict (id) do nothing;

  -- Starter Checking account (with a small welcome balance so the UI isn't empty)
  acct_no := lpad((floor(random()*9000)+1000)::text, 4, '0');
  insert into public.accounts (user_id, type, account_number, balance, available, color)
  values (new.id, 'Total Checking', '••••' || acct_no, 1000.00, 1000.00,
          'from-[#117ACA] to-[#0a5fa0]');

  -- Starter Savings account
  acct_no := lpad((floor(random()*9000)+1000)::text, 4, '0');
  insert into public.accounts (user_id, type, account_number, balance, available, color)
  values (new.id, 'Sapphire Savings', '••••' || acct_no, 0.00, 0.00,
          'from-[#1a3a5c] to-[#0d2640]');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- RPC: deposit money into one of my accounts (atomic)
-- ============================================================================
create or replace function public.make_deposit(
  p_account uuid, p_amount numeric, p_source text default 'Mobile Deposit'
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if not exists (select 1 from accounts where id = p_account and user_id = auth.uid()) then
    raise exception 'Account not found';
  end if;

  update accounts set balance = balance + p_amount, available = available + p_amount
   where id = p_account and user_id = auth.uid();

  insert into transactions (account_id, user_id, merchant, category, amount, icon_type)
  values (p_account, auth.uid(), p_source, 'Deposit', p_amount, 'deposit');

  insert into transfers (user_id, from_account, kind, amount, status, memo)
  values (auth.uid(), p_account, 'deposit', p_amount, 'completed', p_source);
end;
$$;

-- ============================================================================
-- RPC: transfer money (internal between my accounts, or external/ach/wire)
-- For internal: pass p_to_account. For external: pass recipient details.
-- ============================================================================
create or replace function public.make_transfer(
  p_from uuid,
  p_amount numeric,
  p_kind text default 'internal',
  p_to_account uuid default null,
  p_recipient_name text default null,
  p_recipient_bank text default null,
  p_recipient_acct text default null,
  p_memo text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_from accounts%rowtype;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into v_from from accounts where id = p_from and user_id = auth.uid();
  if not found then raise exception 'Source account not found'; end if;
  if v_from.available < p_amount then raise exception 'Insufficient funds'; end if;

  -- Debit source
  update accounts set balance = balance - p_amount, available = available - p_amount
   where id = p_from;
  insert into transactions (account_id, user_id, merchant, category, amount, icon_type)
  values (p_from, auth.uid(),
          coalesce(p_recipient_name, 'Transfer'), 'Transfer', -p_amount, 'transfer');

  -- Credit destination if internal
  if p_kind = 'internal' and p_to_account is not null then
    if not exists (select 1 from accounts where id = p_to_account and user_id = auth.uid()) then
      raise exception 'Destination account not found';
    end if;
    update accounts set balance = balance + p_amount, available = available + p_amount
     where id = p_to_account;
    insert into transactions (account_id, user_id, merchant, category, amount, icon_type)
    values (p_to_account, auth.uid(), 'Transfer from account', 'Transfer', p_amount, 'transfer');
  end if;

  insert into transfers (user_id, from_account, kind, recipient_name, recipient_bank,
                         recipient_acct, amount, memo, status)
  values (auth.uid(), p_from, p_kind, p_recipient_name, p_recipient_bank,
          p_recipient_acct, p_amount, p_memo, 'completed');
end;
$$;
