// Frontend client for the real-money (Increase) Edge Functions.
// These call server-side functions that hold the Increase secret — the browser
// never sees Increase keys and never moves money directly.
import { supabase } from "./supabaseClient";

async function callFunction(name, body) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) {
    // supabase.functions.invoke wraps non-2xx; surface the function's JSON error if present
    const msg = (await error.context?.json?.())?.error || error.message;
    throw new Error(msg || "Request failed");
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

// Run KYC + open a real account for the signed-in user.
export function onboardUser({ first_name, last_name, date_of_birth, ssn, address }) {
  return callFunction("onboard", { first_name, last_name, date_of_birth, ssn, address });
}

// kind: "ach" | "wire" | "internal"
export function createTransfer(payload) {
  return callFunction("transfer", payload);
}
