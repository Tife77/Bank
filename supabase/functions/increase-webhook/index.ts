// POST /functions/v1/increase-webhook
// Receives Increase events, verifies the signature, dedupes, and updates our
// ledger mirror. Deploy with --no-verify-jwt (Increase calls it, not a user).
import { json, increase, adminClient } from "../_shared/increase.ts";

const WEBHOOK_SECRET = Deno.env.get("INCREASE_WEBHOOK_SECRET") ?? "";

// Increase signs with header: Increase-Webhook-Signature: t=<ts>,v1=<hex hmac of "ts.body">
async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // allow in early sandbox dev if not yet configured
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const ts = parts["t"];
  const sig = parts["v1"];
  if (!ts || !sig) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return expected === sig;
}

// Pull the authoritative balance for an Increase account and mirror it.
async function syncBalance(supa: ReturnType<typeof adminClient>, increaseAccountId: string) {
  try {
    const bal = await increase(`/accounts/${increaseAccountId}/balance`);
    await supa.from("accounts").update({
      balance: (bal.current_balance ?? 0) / 100,
      available: (bal.available_balance ?? bal.current_balance ?? 0) / 100,
    }).eq("increase_account_id", increaseAccountId);
  } catch (_) { /* best effort */ }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const ok = await verifySignature(rawBody, req.headers.get("Increase-Webhook-Signature"));
  if (!ok) return json({ error: "Invalid signature" }, 400);

  const event = JSON.parse(rawBody);
  const supa = adminClient();

  // Idempotency: skip if we've seen this event id.
  const { error: dupeErr } = await supa.from("increase_events")
    .insert({ id: event.id, category: event.category, payload: event });
  if (dupeErr) return json({ ok: true, deduped: true }); // primary-key clash = already processed

  const category: string = event.category ?? "";
  const assocId: string = event.associated_object_id ?? "";

  // Transfer status changes → update our transfer row + resync source balance.
  if (category.includes("transfer")) {
    const typeMap: Record<string, string> = {
      ach_transfer: "/ach_transfers/",
      wire_transfer: "/wire_transfers/",
      account_transfer: "/account_transfers/",
    };
    const objType = category.split(".")[0]; // e.g. "ach_transfer"
    const path = typeMap[objType];
    if (path) {
      try {
        const obj = await increase(`${path}${assocId}`);
        await supa.from("transfers").update({ status: obj.status })
          .eq("increase_transfer_id", assocId);
        if (obj.account_id) await syncBalance(supa, obj.account_id);
      } catch (_) { /* ignore */ }
    }
  }

  // Transactions (incoming deposits, settlements) → resync the affected account.
  if (category.startsWith("transaction.") || category.startsWith("pending_transaction.")) {
    const acct = event.associated_object?.account_id;
    if (acct) await syncBalance(supa, acct);
  }

  return json({ ok: true });
});
