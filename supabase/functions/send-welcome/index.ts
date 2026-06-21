// POST /functions/v1/send-welcome
// Sends a welcome email to the signed-in user via YOUR SMTP server (no Resend).
// Body: { name?: string }  (recipient email comes from the verified JWT — can't be spoofed)
//
// Secrets required (supabase secrets set ...):
//   SMTP_HOST   e.g. mail.onenevada.com
//   SMTP_PORT   465 (implicit TLS) or 587 (STARTTLS)
//   SMTP_USER   no-reply@onenevada.com
//   SMTP_PASS   <mailbox password>
//   SMTP_TLS    "true" for port 465, "false" for 587   (optional, default true)
//   WELCOME_FROM  optional display, default uses SMTP_USER
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { corsHeaders, json, getUser } from "../_shared/unit.ts";

const HOST = Deno.env.get("SMTP_HOST") ?? "";
const PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
const USER = Deno.env.get("SMTP_USER") ?? "";
const PASS = Deno.env.get("SMTP_PASS") ?? "";
const TLS = (Deno.env.get("SMTP_TLS") ?? "true") === "true";
const FROM = Deno.env.get("WELCOME_FROM") || `One Nevada Credit Union <${USER}>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);
    if (!HOST || !USER || !PASS) return json({ error: "SMTP not configured (set SMTP_HOST/USER/PASS)" }, 500);

    const { name } = await req.json().catch(() => ({}));
    const firstName = (name || user.email?.split("@")[0] || "there").split(" ")[0];

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e2edf6;border-radius:12px;overflow:hidden">
        <div style="background:#003865;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">One Nevada Credit Union</h1>
        </div>
        <div style="padding:28px;color:#1a2e45">
          <h2 style="color:#003865;margin:0 0 12px">Welcome, ${firstName}!</h2>
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

    const client = new SMTPClient({
      connection: {
        hostname: HOST,
        port: PORT,
        tls: TLS,
        auth: { username: USER, password: PASS },
      },
    });

    await client.send({
      from: FROM,
      to: user.email,
      subject: "Welcome to One Nevada Credit Union",
      html,
    });
    await client.close();

    return json({ ok: true, to: user.email });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
