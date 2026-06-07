// POST /functions/v1/increase-webhook
// Receives UNIT webhook events, verifies the signature, dedupes, and syncs
// balances/statuses into our Postgres ledger mirror.
// (Function name kept as "increase-webhook" to avoid re-deploying a new endpoint.)
// Deploy with --no-verify-jwt (Unit calls it, not a user).
import { json, unit, adminClient } from "../_shared/unit.ts";

const WEBHOOK_SECRET = Deno.env.get("UNIT_WEBHOOK_SECRET") ?? "";

// Unit signs with header x-unit-signature: base64( HMAC-SHA256(rawBody, secret) )
async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // allow during early sandbox dev if not yet configured
  if (!header) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return expected === header;
}

// Pull the authoritative balance for a Unit account and mirror it.
async function syncBalance(supa: ReturnType<typeof adminClient>, unitAccountId: string) {
  try {
    const acct = await unit(`/accounts/${unitAccountId}`);
    const a = acct.data.attributes;
    await supa.from("accounts").update({
      balance: (a.balance ?? 0) / 100,
      available: (a.available ?? a.balance ?? 0) / 100,
    }).eq("increase_account_id", unitAccountId);
  } catch (_) { /* best effort */ }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const ok = await verifySignature(rawBody, req.headers.get("x-unit-signature"));
  if (!ok) return json({ error: "Invalid signature" }, 400);

  const body = JSON.parse(rawBody);
  const supa = adminClient();

  // Unit batches events under `data: [...]`.
  const events = Array.isArray(body?.data) ? body.data : [body];

  for (const ev of events) {
    const id = ev.id ?? crypto.randomUUID();
    const type: string = ev.type ?? ev.attributes?.type ?? "";

    // Idempotency
    const { error: dupeErr } = await supa.from("increase_events")
      .insert({ id, category: type, payload: ev });
    if (dupeErr) continue; // already processed

    const accountId = ev.relationships?.account?.data?.id;

    // Payment status changes -> update the transfer row + resync balance.
    if (type.startsWith("payment.")) {
      const payId = ev.relationships?.payment?.data?.id ?? ev.relationships?.resource?.data?.id;
      const status = ev.attributes?.status;
      if (payId) {
        await supa.from("transfers").update({ status: status ?? "Updated" })
          .eq("increase_transfer_id", payId);
      }
      if (accountId) await syncBalance(supa, accountId);
    }

    // Transactions / account changes -> resync the affected account.
    if (type.startsWith("transaction.") || type.startsWith("account.")) {
      if (accountId) await syncBalance(supa, accountId);
    }
  }

  return json({ ok: true });
});
