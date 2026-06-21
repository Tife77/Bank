// POST /functions/v1/send-welcome
// Sends a welcome email to the signed-in user via Resend.
// Body: { name?: string }  (email is taken from the verified JWT — can't be spoofed)
import { corsHeaders, json, getUser } from "../_shared/unit.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Use a verified sender once you have a domain in Resend; onboarding@resend.dev works for testing.
const FROM = Deno.env.get("WELCOME_FROM") ?? "One Nevada Credit Union <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);
    if (!RESEND_API_KEY) return json({ error: "Email not configured (set RESEND_API_KEY)" }, 500);

    const { name } = await req.json().catch(() => ({}));
    const firstName = (name || user.email?.split("@")[0] || "there").split(" ")[0];

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e2edf6;border-radius:12px;overflow:hidden">
        <div style="background:#003865;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">One Nevada Credit Union</h1>
        </div>
        <div style="padding:28px;color:#1a2e45">
          <h2 style="color:#003865;margin:0 0 12px">Welcome, ${firstName}! 🎉</h2>
          <p style="line-height:1.6;font-size:15px">
            Your account has been created successfully. You can now sign in to view your
            balances, move money, deposit cheques, and manage your cards.
          </p>
          <p style="line-height:1.6;font-size:15px">
            <strong>Security reminder:</strong> One Nevada will never call, email, or text
            asking for your password, PIN, or one-time code.
          </p>
          <p style="margin-top:24px;font-size:13px;color:#6b7f94">
            Thanks for banking with us,<br/>The One Nevada Team
          </p>
        </div>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [user.email],
        subject: "Welcome to One Nevada Credit Union",
        html,
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data?.message || "Email send failed", detail: data }, 502);
    return json({ ok: true, id: data.id });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
