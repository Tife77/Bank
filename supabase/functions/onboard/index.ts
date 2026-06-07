// POST /functions/v1/onboard
// Creates an Increase Entity (KYC) + Account + Account Number for the signed-in
// user, and mirrors the IDs / routing+account number into Postgres.
//
// Body: { first_name, last_name, date_of_birth (YYYY-MM-DD), ssn,
//         address: { line1, city, state, zip } }
import { corsHeaders, json, increase, adminClient, getUser } from "../_shared/increase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { first_name, last_name, date_of_birth, ssn, address } = body;
    if (!first_name || !last_name || !date_of_birth || !ssn || !address?.line1) {
      return json({ error: "Missing required KYC fields" }, 400);
    }

    const supa = adminClient();

    // Idempotency: if this user already has an entity, don't create another.
    const { data: profile } = await supa
      .from("profiles").select("increase_entity_id").eq("id", user.id).single();
    if (profile?.increase_entity_id) {
      return json({ error: "User already onboarded", entity_id: profile.increase_entity_id }, 409);
    }

    let step = "create_entity";
    let entity, account, acctNumber;
    try {
      // 1) Create the Entity (KYC identity) in Increase.
      entity = await increase("/entities", {
        method: "POST",
        body: JSON.stringify({
          structure: "natural_person",
          natural_person: {
            name: `${first_name} ${last_name}`,
            date_of_birth,
            address: {
              line1: address.line1,
              city: address.city,
              state: address.state,
              zip: address.zip,
            },
            identification: { method: "social_security_number", number: ssn },
          },
        }),
      });

      // 2) Create the Account, owned by that Entity.
      step = "create_account";
      account = await increase("/accounts", {
        method: "POST",
        body: JSON.stringify({ entity_id: entity.id, name: "Total Checking" }),
      });

      // 3) Create an Account Number (routing + account number to receive ACH).
      step = "create_account_number";
      acctNumber = await increase("/account_numbers", {
        method: "POST",
        body: JSON.stringify({ account_id: account.id, name: "Primary" }),
      });
    } catch (e) {
      return json({
        error: String(e?.message ?? e),
        failed_step: step,
        increase_detail: e?.increase ?? null,
        partial: { entity_id: entity?.id, account_id: account?.id },
      }, 500);
    }

    // 4) Mirror into Postgres.
    await supa.from("profiles").update({
      increase_entity_id: entity.id,
      kyc_status: entity.status === "active" ? "approved" : "pending",
    }).eq("id", user.id);

    await supa.from("accounts").insert({
      user_id: user.id,
      type: "Total Checking",
      account_number: "••••" + (acctNumber.account_number?.slice(-4) ?? "0000"),
      balance: 0,
      available: 0,
      provider: "increase",
      increase_account_id: account.id,
      increase_account_number_id: acctNumber.id,
      routing_number: acctNumber.routing_number,
      full_account_number: acctNumber.account_number,
    });

    await supa.from("kyc_submissions").insert({
      user_id: user.id,
      ssn_last4: String(ssn).slice(-4),
      doc_type: "ssn",
      status: "submitted",
    });

    return json({
      ok: true,
      entity_id: entity.id,
      account_id: account.id,
      routing_number: acctNumber.routing_number,
      account_number_last4: acctNumber.account_number?.slice(-4),
      kyc_status: entity.status,
    });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
