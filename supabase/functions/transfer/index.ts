// POST /functions/v1/transfer
// Creates a real transfer via Increase for the signed-in user.
//
// Body:
//   { kind: "ach",      from_account_id, amount, recipient_name,
//       recipient_routing, recipient_account, account_holder: "checking"|"savings" }
//   { kind: "wire",     from_account_id, amount, recipient_name,
//       recipient_routing, recipient_account, message }
//   { kind: "internal", from_account_id, to_account_id, amount }
//
// amount is in DOLLARS here; Increase works in CENTS (we convert).
import { corsHeaders, json, increase, adminClient, getUser } from "../_shared/increase.ts";

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

    // Verify the source account belongs to this user and is an Increase account.
    const { data: from } = await supa
      .from("accounts").select("*")
      .eq("id", from_account_id).eq("user_id", user.id).single();
    if (!from?.increase_account_id) {
      return json({ error: "Source account not found or not provisioned" }, 404);
    }

    let result: Record<string, unknown>;
    let increaseType: string;

    if (kind === "ach") {
      increaseType = "ach";
      result = await increase("/ach_transfers", {
        method: "POST",
        body: JSON.stringify({
          account_id: from.increase_account_id,
          amount: cents,
          statement_descriptor: (body.statement_descriptor || "ONCU Transfer").slice(0, 10),
          routing_number: body.recipient_routing,
          account_number: body.recipient_account,
          funding: body.account_holder === "savings" ? "savings" : "checking",
          individual_name: body.recipient_name,
        }),
      });
    } else if (kind === "wire") {
      increaseType = "wire";
      result = await increase("/wire_transfers", {
        method: "POST",
        body: JSON.stringify({
          account_id: from.increase_account_id,
          amount: cents,
          message_to_recipient: (body.message || "Wire transfer").slice(0, 35),
          routing_number: body.recipient_routing,
          account_number: body.recipient_account,
          beneficiary_name: body.recipient_name,
        }),
      });
    } else if (kind === "internal") {
      increaseType = "account";
      const { data: to } = await supa
        .from("accounts").select("increase_account_id")
        .eq("id", body.to_account_id).eq("user_id", user.id).single();
      if (!to?.increase_account_id) return json({ error: "Destination account not found" }, 404);
      result = await increase("/account_transfers", {
        method: "POST",
        body: JSON.stringify({
          account_id: from.increase_account_id,
          destination_account_id: to.increase_account_id,
          amount: cents,
          description: (body.description || "Transfer").slice(0, 100),
        }),
      });
    } else {
      return json({ error: "Unknown transfer kind" }, 400);
    }

    // Record in our ledger (status will be finalized by webhook events).
    await supa.from("transfers").insert({
      user_id: user.id,
      from_account: from.id,
      kind,
      recipient_name: body.recipient_name ?? null,
      recipient_acct: body.recipient_account ?? null,
      amount: Number(amount),
      status: (result.status as string) ?? "pending",
      provider: "increase",
      increase_transfer_id: result.id as string,
      increase_transfer_type: increaseType,
    });

    return json({ ok: true, transfer_id: result.id, status: result.status });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
