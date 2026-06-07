import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey || url.includes("YOUR_PROJECT_URL")) {
  // Helpful console hint during setup
  console.warn(
    "[Supabase] Missing credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server."
  );
}

export const supabase = createClient(url, anonKey);
