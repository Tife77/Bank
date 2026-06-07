// POST /functions/v1/onboard  (Unit)
// Creates a Unit individual application (KYC) -> customer -> deposit account,
// and mirrors IDs / routing+account number into Postgres.
//
// Body: { first_name, last_name, date_of_birth (YYYY-MM-DD), ssn, email, phone,
//         address: { line1, city, state, postalCode } }
//
// NOTE: we reuse the existing increase_* columns to store Unit IDs to avoid a
// schema change: increase_entity_id = Unit customerId, increase_account_id = Unit accountId.
import { corsHeaders, json, unit, adminClient, getUser } from "../_shared/unit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const b = await req.json();
    const { first_name, last_name, date_of_birth, ssn, address } = b;
    const email = b.email || user.email;
    const phone = b.phone || "5555555555";
    if (!first_name || !last_name || !date_of_birth || !ssn || !address?.line1) {
      return json({ error: "Missing required KYC fields" }, 400);
    }

    const supa = adminClient();
    const { data: profile } = await supa
      .from("profiles").select("increase_entity_id").eq("id", user.id).single();
    if (profile?.increase_entity_id) {
      return json({ error: "User already onboarded", customer_id: profile.increase_entity_id }, 409);
    }

    let step = "create_application";
    let customerId: string | undefined;
    let account, app;
    try {
      // 1) Individual application (KYC). Sandbox auto-approves typical values.
      app = await unit("/applications", {
        method: "POST",
        body: JSON.stringify({
          data: {
            type: "individualApplication",
            attributes: {
              ssn: String(ssn).replace(/\D/g, ""),
              fullName: { first: first_name, last: last_name },
              dateOfBirth: date_of_birth,
              address: {
                street: address.line1,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode || address.zip,
                country: "US",
              },
              email,
              phone: { countryCode: "1", number: String(phone).replace(/\D/g, "") },
            },
          },
        }),
      });

      // When approved, Unit links a customer to the application.
      customerId = app?.data?.relationships?.customer?.data?.id;
      const status = app?.data?.attributes?.status;
      if (!customerId) {
        return json({
          error: `Application status: ${status}. No customer created (may be pending review).`,
          failed_step: "application_not_approved",
          application_status: status,
          application_id: app?.data?.id,
        }, 409);
      }

      // 2) Open a deposit (checking) account for the customer.
      step = "create_account";
      account = await unit("/accounts", {
        method: "POST",
        body: JSON.stringify({
          data: {
            type: "depositAccount",
            attributes: { depositProduct: "checking" },
            relationships: { customer: { data: { type: "customer", id: customerId } } },
          },
        }),
      });
    } catch (e) {
      return json({
        error: String(e?.message ?? e),
        failed_step: step,
        unit_detail: e?.unit ?? null,
      }, 500);
    }

    const acctId = account.data.id;
    const attrs = account.data.attributes;
    const acctNum = attrs.accountNumber || "";

    // 3) Mirror into Postgres.
    await supa.from("profiles").update({
      increase_entity_id: customerId,
      kyc_status: "approved",
    }).eq("id", user.id);

    await supa.from("accounts").insert({
      user_id: user.id,
      type: "Total Checking",
      account_number: "••••" + acctNum.slice(-4),
      balance: (attrs.balance ?? 0) / 100,
      available: (attrs.available ?? attrs.balance ?? 0) / 100,
      provider: "unit",
      increase_account_id: acctId,
      routing_number: attrs.routingNumber,
      full_account_number: acctNum,
    });

    await supa.from("kyc_submissions").insert({
      user_id: user.id, ssn_last4: String(ssn).slice(-4), doc_type: "ssn", status: "approved",
    });

    return json({
      ok: true,
      customer_id: customerId,
      account_id: acctId,
      routing_number: attrs.routingNumber,
      account_number_last4: acctNum.slice(-4),
    });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
