// Shared helpers for the Increase Edge Functions.
// Runs on Deno (Supabase Edge Functions runtime).
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const INCREASE_BASE_URL = Deno.env.get("INCREASE_BASE_URL") ?? "https://sandbox.increase.com";
const INCREASE_API_KEY = Deno.env.get("INCREASE_API_KEY") ?? "";

// Thin wrapper around the Increase REST API.
export async function increase(path: string, init: RequestInit = {}) {
  const res = await fetch(`${INCREASE_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${INCREASE_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.title || data?.detail || `Increase error ${res.status}`);
  }
  return data;
}

// Service-role client (full DB access) — for writing the ledger mirror.
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// Verify the caller's Supabase JWT and return their user, or null.
export async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supa = adminClient();
  const { data, error } = await supa.auth.getUser(token);
  if (error) return null;
  return data.user;
}
