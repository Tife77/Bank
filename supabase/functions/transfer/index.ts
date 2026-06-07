// POST /functions/v1/transfer  (Unit)
// Creates a real payment via Unit for the signed-in user.
//
// Body:
//   { kind:"ach",      from_account_id, amount, recipient_name,
//       recipient_routing, recipient_account, account_type:"Checking"|"Savings" }
//   { kind:"wire",     from_account_id, amount, recipient_name,
//       recipient_routing, recipient_account, address:{...} }
//   { kind:"internal", from_account_id, to_account_id, amount, description }
//
// amount is in DOLLARS; Unit works in CENTS.
import { corsHeaders, json, unit, adminClient, getUser } from "../_shared/unit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { kind, from_account_id, amount } = body;
    const cents = Math.round(Number(amount) * 100);
    if (!kind || !from_account_id || !(cents > 0)) {
      return json({ error: "Missing or invalid fields" }, 400);
    }

    const supa = adminClient();
    const { data: from } = await supa
      .from("accounts").select("*")
      .eq("id", from_account_id).eq("user_id", user.id).single();
    if (!from?.increase_account_id) {
      return json({ error: "Source account not found or not provisioned" }, 404);
    }
    const unitAccountId = from.increase_account_id;

    let payload: Record<string, unknown>;
    let increaseType: string;

    if (kind === "ach") {
      increaseType = "ach";
      payload = {
        data: {
          type: "achPayment",
          attributes: {
            amount: cents,
            direction: "Credit",
            description: (body.description || "ACH Transfer").slice(0, 50),
            counterparty: {
              routingNumber: body.recipient_routing,
              accountNumber: body.recipient_account,
              accountType: body.account_type === "Savings" ? "Savings" : "Checking",
              name: body.recipient_name,
            },
          },
          relationships: { account: { data: { type: "depositAccount", id: unitAccountId } } },
        },
      };
    } else if (kind === "wire") {
      increaseType = "wire";
      payload = {
        data: {
          type: "wirePayment",
          attributes: {
            amount: cents,
            description: (body.description || "Wire Transfer").slice(0, 50),
            counterparty: {
              routingNumber: body.recipient_routing,
              accountNumber: body.recipient_account,
              name: body.recipient_name,
              address: {
                street: body.address?.line1 || "Unknown",
                city: body.address?.city || "Unknown",
                state: body.address?.state || "NV",
                postalCode: body.address?.postalCode || "00000",
                country: "US",
              },
            },
          },
          relationships: { account: { data: { type: "depositAccount", id: unitAccountId } } },
        },
      };
    } else if (kind === "internal") {
      increaseType = "book";
      const { data: to } = await supa
        .from("accounts").select("increase_account_id")
        .eq("id", body.to_account_id).eq("user_id", user.id).single();
      if (!to?.increase_account_id) return json({ error: "Destination account not found" }, 404);
      payload = {
        data: {
          type: "bookPayment",
          attributes: { amount: cents, description: (body.description || "Transfer").slice(0, 50) },
          relationships: {
            account: { data: { type: "depositAccount", id: unitAccountId } },
            counterpartyAccount: { data: { type: "depositAccount", id: to.increase_account_id } },
          },
        },
      };
    } else {
      return json({ error: "Unknown transfer kind" }, 400);
    }

    let result;
    try {
      result = await unit("/payments", { method: "POST", body: JSON.stringify(payload) });
    } catch (e) {
      return json({ error: String(e?.message ?? e), unit_detail: e?.unit ?? null }, 500);
    }

    const pay = result.data;
    await supa.from("transfers").insert({
      user_id: user.id,
      from_account: from.id,
      kind,
      recipient_name: body.recipient_name ?? null,
      recipient_acct: body.recipient_account ?? null,
      amount: Number(amount),
      status: pay.attributes?.status ?? "Pending",
      provider: "unit",
      increase_transfer_id: pay.id,
      increase_transfer_type: increaseType,
    });

    return json({ ok: true, transfer_id: pay.id, status: pay.attributes?.status });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
