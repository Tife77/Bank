-- ============================================================================
-- Storage for KYC/ID uploads + unique account numbers + cross-user transfers.
-- Run after schema.sql / schema_pages.sql / schema_admin.sql.  Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Private Storage bucket for ID / KYC images (500 KB cap, images + pdf)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kyc-documents', 'kyc-documents', false, 512000,
        array['image/png','image/jpeg','image/jpg','image/webp','application/pdf'])
on conflict (id) do update
  set file_size_limit = 512000,
      allowed_mime_types = array['image/png','image/jpeg','image/jpg','image/webp','application/pdf'];

-- RLS on storage.objects: each user manages only files under their own user-id folder.
drop policy if exists "kyc upload own"  on storage.objects;
drop policy if exists "kyc read own"    on storage.objects;
drop policy if exists "kyc update own"  on storage.objects;
drop policy if exists "kyc admin read"  on storage.objects;

create policy "kyc upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kyc read own" on storage.objects for select to authenticated
  using (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kyc update own" on storage.objects for update to authenticated
  using (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text);
-- admins (is_admin()) can read every KYC file
create policy "kyc admin read" on storage.objects for select to authenticated
  using (bucket_id = 'kyc-documents' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Unique full account numbers (10 digits) on every account
-- ---------------------------------------------------------------------------
alter table public.accounts add column if not exists full_account_number text;
create unique index if not exists accounts_full_number_uidx
  on public.accounts (full_account_number) where full_account_number is not null;

-- Generate a guaranteed-unique 10-digit account number.
create or replace function public.gen_account_number()
returns text language plpgsql as $$
declare n text;
begin
  loop
    n := lpad(((floor(random()*9000000000))::bigint + 1000000000)::text, 10, '0');
    exit when not exists (select 1 from public.accounts where full_account_number = n);
  end loop;
  return n;
end $$;

-- Backfill any existing accounts that have no full number (one at a time = unique).
do $$
declare r record; v text;
begin
  for r in select id from public.accounts where full_account_number is null loop
    v := public.gen_account_number();
    update public.accounts
      set full_account_number = v,
          account_number = '••••' || right(v, 4)
      where id = r.id;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. New-user trigger: give starter accounts real unique numbers
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fname text := coalesce(meta->>'first_name', split_part(new.email,'@',1));
  lname text := coalesce(meta->>'last_name', '');
  num1 text := public.gen_account_number();
  num2 text := public.gen_account_number();
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

  insert into public.accounts (user_id, type, account_number, full_account_number, balance, available, color)
  values (new.id, 'Total Checking', '••••' || right(num1,4), num1, 1000.00, 1000.00,
          'from-[#117ACA] to-[#0a5fa0]');
  insert into public.accounts (user_id, type, account_number, full_account_number, balance, available, color)
  values (new.id, 'Sapphire Savings', '••••' || right(num2,4), num2, 0.00, 0.00,
          'from-[#1a3a5c] to-[#0d2640]');

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Cross-user transfer by account number (same-bank credit, else external)
--    "Both": if the number matches a One Nevada account -> credit it.
--    Otherwise -> outbound external (debit only).
-- ---------------------------------------------------------------------------
create or replace function public.transfer_by_number(
  p_from uuid,
  p_amount numeric,
  p_to_number text,
  p_memo text default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_from public.accounts%rowtype;
  v_to   public.accounts%rowtype;
  v_num  text := regexp_replace(coalesce(p_to_number,''), '\D', '', 'g');
  v_recipient text;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be positive'; end if;

  select * into v_from from public.accounts where id = p_from and user_id = auth.uid();
  if not found then raise exception 'Source account not found'; end if;
  if v_from.available < p_amount then raise exception 'Insufficient funds'; end if;

  select * into v_to from public.accounts where full_account_number = v_num limit 1;

  if found and v_to.id = v_from.id then
    raise exception 'Cannot transfer to the same account';
  end if;

  -- Debit the sender (always)
  update public.accounts set balance = balance - p_amount, available = available - p_amount
   where id = p_from;

  if found then
    -- Same-bank: credit the matching account (may belong to another user)
    v_recipient := coalesce((select full_name from public.profiles where id = v_to.user_id), 'One Nevada account');
    update public.accounts set balance = balance + p_amount, available = available + p_amount
     where id = v_to.id;
    insert into public.transactions (account_id, user_id, merchant, category, amount, icon_type)
     values (v_from.id, auth.uid(), 'Transfer to ' || v_recipient, 'Transfer', -p_amount, 'transfer');
    insert into public.transactions (account_id, user_id, merchant, category, amount, icon_type)
     values (v_to.id, v_to.user_id, 'Transfer from ' ||
             coalesce((select full_name from public.profiles where id = auth.uid()), 'a One Nevada member'),
             'Transfer', p_amount, 'transfer');
    insert into public.transfers (user_id, from_account, kind, recipient_name, recipient_acct, amount, memo, status)
     values (auth.uid(), v_from.id, 'internal', v_recipient, v_num, p_amount, p_memo, 'completed');
    return jsonb_build_object('credited', true, 'recipient', v_recipient);
  else
    -- No match: outbound external transfer (debit only)
    insert into public.transactions (account_id, user_id, merchant, category, amount, icon_type)
     values (v_from.id, auth.uid(), 'External transfer', 'Transfer', -p_amount, 'transfer');
    insert into public.transfers (user_id, from_account, kind, recipient_acct, amount, memo, status)
     values (auth.uid(), v_from.id, 'external', v_num, p_amount, p_memo, 'completed');
    return jsonb_build_object('credited', false, 'recipient', null);
  end if;
end;
$$;
