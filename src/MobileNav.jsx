import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabaseClient";

// Mobile/tablet navigation. The page headers hide their nav links below `lg`,
// leaving phones with no way to move between pages — this floating menu fills that
// gap. Only renders for signed-in users, only below the `lg` breakpoint.
const LINKS = [
  { label: "Account", path: "/dashboard" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "ACH / Pay Bills", path: "/ach" },
  { label: "Deposit", path: "/deposit" },
  { label: "Cash Cheque", path: "/cheque" },
  { label: "Wire Money", path: "/wire-money" },
  { label: "Statements", path: "/statements" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
  { label: "Settings", path: "/settings" },
];

export default function MobileNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  if (!user) return null;

  const go = (path) => { setOpen(false); navigate(path); };
  const logout = async () => { await supabase.auth.signOut(); navigate("/signin"); };
  const links = isAdmin ? [...LINKS, { label: "Admin", path: "/admin" }] : LINKS;

  return (
    <div className="lg:hidden">
      {/* Hamburger FAB (bottom-left; chat widget is bottom-right) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-6 left-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-[#003865] text-white shadow-xl ring-1 ring-white/20"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <nav
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#003865] px-5 py-4 text-white">
              <span className="text-base font-black">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-2xl leading-none">×</button>
            </div>
            <div className="py-2">
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => go(l.path)}
                  className="block w-full px-5 py-3 text-left text-sm font-semibold text-[#041a49] hover:bg-blue-50"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="mt-2 block w-full border-t border-slate-100 px-5 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
