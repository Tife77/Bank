# Real-Money Architecture — BaaS

> **CURRENT PROVIDER: Unit** (`api.s.unit.sh` sandbox). We switched from Increase
> because Increase gated third-party customer onboarding. Unit's sandbox supports
> onboarding individual customers immediately. The Edge Functions
> (`onboard`, `transfer`, `increase-webhook`) now call Unit via `_shared/unit.ts`.
>
> **Secrets for Unit:**
> ```bash
> supabase secrets set UNIT_API_TOKEN=<your sandbox org token>
> supabase secrets set UNIT_BASE_URL=https://api.s.unit.sh
> supabase secrets set UNIT_WEBHOOK_SECRET=<from Unit webhook config>   # later
> ```
> **Get a token:** sign up at https://www.unit.co / the Unit dashboard, switch to
> **Sandbox**, create an **API token** (org-level). Then redeploy the functions.
>
> We reuse the existing DB columns: `profiles.increase_entity_id` = Unit customerId,
> `accounts.increase_account_id` = Unit accountId, `transfers.increase_transfer_id`
> = Unit paymentId. So **no new SQL** beyond `schema_baas.sql`.
>
> The Increase-specific notes below are kept for reference.

---

# (Reference) Increase architecture notes

This document describes how the Bank app moves from a **simulation** (balances are
numbers in Postgres) to a **real fintech** where money is held and moved by a
licensed partner, **Increase**.

## Core principle

> The frontend NEVER holds Increase secrets and NEVER moves money directly.
> All money operations go through server-side **Supabase Edge Functions** that
> hold the Increase API key. Increase is the **source of truth** for balances;
> our Postgres tables are a **mirror/ledger** kept in sync via webhooks.

```
React app ──(Supabase JWT)──> Edge Function ──(Increase API key)──> Increase
   ▲                                │
   │                                ▼
   └──────── Postgres (ledger mirror) <──── Increase webhooks ──── Increase
```

## Increase object model (sandbox = https://sandbox.increase.com)

- **Entity** — the customer's identity (KYC). For a person: name, DOB, address, SSN.
- **Account** — a money account, owned by an Entity.
- **Account Number** — routing + account number for an Account (needed to receive ACH).
- **Transfers** — `ach_transfers`, `wire_transfers`, `account_transfers` (internal).
- **Events / Webhooks** — Increase notifies us when things settle.

## What maps to what

| App concept            | Increase object                          |
|------------------------|------------------------------------------|
| Signup KYC (SSN/ID)    | `POST /entities`                         |
| Open account           | `POST /accounts` (+ `POST /account_numbers`) |
| Deposit (incoming ACH) | inbound ACH to the account number (or `POST /inbound_ach_transfer_simulations` in sandbox) |
| Transfer (external)    | `POST /ach_transfers`                    |
| Wire                   | `POST /wire_transfers`                   |
| Internal transfer      | `POST /account_transfers`                |
| Balance                | reconciled from Increase + transaction events |

## Edge Functions in this repo (`supabase/functions/`)

| Function           | Purpose |
|--------------------|---------|
| `onboard`          | Create Increase Entity (KYC) + Account + Account Number for the signed-in user; store IDs + routing/account number in Postgres. |
| `transfer`         | Create an ACH / wire / internal transfer via Increase for the signed-in user. |
| `increase-webhook` | Receive Increase events, verify signature, update the Postgres ledger (balances, transaction status). |

Each user-facing function authenticates the caller with their **Supabase JWT**
(verified server-side) before doing anything.

## Secrets (set in Supabase, never in the repo)

```bash
supabase secrets set INCREASE_API_KEY=sk_sandbox_xxx
supabase secrets set INCREASE_BASE_URL=https://sandbox.increase.com
supabase secrets set INCREASE_WEBHOOK_SECRET=whsec_xxx   # from Increase webhook config
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically into
Edge Functions — do not set them manually.

## Setup steps

1. **Get an Increase sandbox key**: sign in at https://increase.com → switch to
   the **Sandbox** environment → API keys → create one (`sk_sandbox_...`).
2. **Install Supabase CLI** and log in:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref zkgzuxbjlteqqlbuujol
   ```
3. **Run the BaaS schema migration** (`supabase/schema_baas.sql`) in the SQL editor.
4. **Set the secrets** (above).
5. **Deploy the functions**:
   ```bash
   supabase functions deploy onboard
   supabase functions deploy transfer
   supabase functions deploy increase-webhook --no-verify-jwt
   ```
   (`increase-webhook` uses `--no-verify-jwt` because Increase calls it, not a user.)
6. **Configure the webhook in Increase** → point it at
   `https://zkgzuxbjlteqqlbuujol.supabase.co/functions/v1/increase-webhook`,
   copy the signing secret into `INCREASE_WEBHOOK_SECRET`.
7. **Point the frontend at the functions** (already wired in `src/baasClient.js`).

## Going from sandbox → production (later, gated on approval)

- Complete Increase's onboarding/underwriting for your business entity.
- Swap `INCREASE_BASE_URL` to `https://api.increase.com` and use a production key.
- Finalize compliance: privacy policy, terms, dispute handling, KYC review flow.
- Security hardening: rate limiting, audit logs, MFA, monitoring/alerting.

## What the old simulation RPCs become

`make_deposit` / `make_transfer` (pure Postgres) are kept ONLY for the simulation/
demo build. In real-money mode they are replaced by the `transfer` Edge Function +
Increase. Balances are updated from Increase webhook events, not by trusting the client.
