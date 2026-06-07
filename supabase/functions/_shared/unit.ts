// Shared helpers for the Unit (BaaS) Edge Functions. Deno runtime.
// Unit uses the JSON:API spec (application/vnd.api+json).
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

const UNIT_BASE_URL = Deno.env.get("UNIT_BASE_URL") ?? "https://api.s.unit.sh"; // sandbox
const UNIT_API_TOKEN = Deno.env.get("UNIT_API_TOKEN") ?? "";

// Thin wrapper around the Unit REST API (JSON:API).
export async function unit(path: string, init: RequestInit = {}) {
  const res = await fetch(`${UNIT_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${UNIT_API_TOKEN}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || `HTTP ${res.status}`;
    const err = new Error(`${res.status} ${detail}`);
    // @ts-ignore attach raw body
    err.unit = data;
    throw err;
  }
  return data;
}

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
  const { data, error } = await adminClient().auth.getUser(token);
  if (error) return null;
  return data.user;
}
