import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Shared hook for page headers: returns the signed-in user's display name/initials
// and a logout function that signs out and redirects to /signin.
export function usePageUser() {
  const [user, setUser] = useState({ name: "", initials: "" });

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, initials, email")
        .eq("id", auth.user.id)
        .single();
      if (profile) {
        setUser({
          name: profile.full_name || profile.email || "Member",
          initials: profile.initials || "U",
        });
      }
    })();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  return { user, logout };
}

// Fetch the signed-in user's accounts, normalized for transfer/ach/wire forms.
export async function fetchMyAccounts() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at");
  return (data || []).map((a) => ({
    id: a.id,
    type: a.type,
    name: a.type,
    mask: (a.account_number || "").replace(/\D/g, "").slice(-4),
    balance: Number(a.balance),
    available: Number(a.available),
    routing: "322484401",
    bank: "One Nevada Credit Union",
    is_credit: a.is_credit,
  }));
}
