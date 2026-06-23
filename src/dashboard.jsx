import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/onenevada.svg";
import { supabase } from "./supabaseClient";

const quickActions = [
  { label: "ACH", iconType: "bill", path: "/ach" },
  { label: "Transfer", iconType: "transfer", path: "/transfer" },
  { label: "Deposit", iconType: "deposit", path: "/deposit" },
  { label: "Statements", iconType: "statement", path: "/statements" },
  { label: "Wire Money", iconType: "wire", path: "/wire-money" },
];

// ── SVG Icon Helper Component ──────────────────────────────────
function Icon({ type, className = "w-6 h-6" }) {
  const vectors = {
    bill: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
    transfer: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
    deposit: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />,
    statement: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />,
    wire: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />,
    cart: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 1 0 3 3h-3m-4.5-3h11.25m-9.75 0c.115-.5.4-1 .75-1.428M15.75 14.25a3 3 0 1 0 3 3h-3m-9.75-3h9.75m4.5-3.75h-14.25V3h16.5v7.5Z" />,
    briefcase: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 0 0-1.875-2.217A48.553 48.553 0 0 0 12 10.5c-2.203 0-4.364.147-6.478.433A2.25 2.25 0 0 0 3.65 13.15m16.6 0a48.108 48.108 0 0 0-3.478-.397m-12 .397c1.075-.122 2.18-.198 3.3-.23m0 0L12 6.75m0 0h1.5m-1.5 0H10.5m3 0v.625c0 .621-.504 1.125-1.125 1.125H10.5a1.125 1.125 0 0 1-1.125-1.125V6.75a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v.625Z" />,
    film: <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Zm0-13.5h.008v.008H6V6.75Zm0 3.5h.008v.008H6v-.008Zm0 3.5h.008v.008H6v-.008Zm0 3.5h.008v.008H6v-.008Zm12-10.5h.008v.008H18V6.75Zm0 3.5h.008v.008H18v-.008Zm0 3.5h.008v.008H18v-.008Zm0 3.5h.008v.008H18v-.008ZM10.5 7.5h3v9h-3v-9Z" />,
    gas: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5M3 6.75h18M3 12h18M3 17.25h18" />,
    box: <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-5.25v9" />,
    music: <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3v12m-10.5-9v12m0-12l10.5-3m-10.5 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10.5-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-10.5-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-10.5 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
    pill: <path strokeLinecap="round" strokeLinejoin="round" d="M9.375 9.375l5.25 5.25m3.562-10.312a4.5 4.5 0 1 1 6.364 6.364l-11.314 11.314a4.5 4.5 0 1 1-6.364-6.364L18.187 4.312Z" />,
    bank: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5h-15V21m16.5 0H1.5" />,
    card: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767a1.123 1.123 0 0 0-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 0 0 .417 1.03l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456a1.125 1.125 0 0 0-1.07.124c-.073.044-.146.087-.22.128-.332.183-.582.495-.645.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.125 1.125 0 0 0-.646-.87c-.074-.041-.147-.084-.22-.127a1.125 1.125 0 0 0-1.074-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767a1.122 1.122 0 0 0 .416-1.03c-.004-.074-.006-.148-.006-.222 0-.074.002-.148.006-.222a1.122 1.122 0 0 0-.416-1.03l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.041.146-.084.218-.128.333-.183.582-.495.646-.869l.214-1.281Z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className={className}>
      {vectors[type] || null}
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(n));

// ── Components ─────────────────────────────────────────────────
function AccountCard({ acct, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl p-5 bg-gradient-to-br ${acct.color} text-white transition-all duration-200 shadow-lg
        ${selected ? "ring-2 ring-white/60 scale-[1.02]" : "hover:scale-[1.01] opacity-90 hover:opacity-100"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/60">{acct.type}</p>
          <p className="text-sm text-white/70 mt-0.5">{acct.number}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
          <Icon type={acct.credit ? "card" : "bank"} className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-0.5">{acct.credit ? "Current Balance" : "Available Balance"}</p>
        <p className={`text-3xl font-bold tracking-tight ${acct.balance < 0 ? "text-red-300" : "text-white"}`}>
          {acct.balance < 0 ? "-" : ""}{fmt(acct.balance)}
        </p>
      </div>
      {selected && (
        <div className="absolute bottom-3 right-4 w-2 h-2 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );
}

function TransactionRow({ tx }) {
  const positive = tx.amount > 0;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
        <Icon type={tx.iconType} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{tx.merchant}</p>
        <p className="text-xs text-gray-400">{tx.category} · {tx.date}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${positive ? "text-emerald-600" : "text-gray-800"}`}>
        {positive ? "+" : "-"}{fmt(tx.amount)}
      </span>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function ChaseDashboard() {
  const [selectedAcct, setSelectedAcct] = useState(0);
  const [activeNav, setActiveNav] = useState("Account");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [user, setUser] = useState({ name: "", initials: "", lastLogin: "" });
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [spending, setSpending] = useState([]);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [creditScore, setCreditScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const [{ data: profile }, { data: accts }, { data: txns }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
        supabase.from("accounts").select("*").eq("user_id", auth.user.id).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(100),
      ]);

      if (profile) {
        setUser({
          name: profile.full_name || profile.email,
          initials: profile.initials || "U",
          lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : "First login",
        });
        setCreditScore(profile.credit_score ?? null);
      }
      setAccounts(
        (accts || []).map((a) => ({
          id: a.id, type: a.type, number: a.account_number,
          fullNumber: a.full_account_number,
          balance: Number(a.balance), available: Number(a.available),
          color: a.color, credit: a.is_credit,
        }))
      );
      const mapped = (txns || []).map((t) => ({
        id: t.id, merchant: t.merchant, category: t.category,
        date: new Date(t.created_at).toLocaleDateString(),
        amount: Number(t.amount), iconType: t.icon_type || "box",
        ts: new Date(t.created_at),
      }));
      setTransactions(mapped);

      // ── Compute dynamic spending + monthly income from this month's activity ──
      const now = new Date();
      const thisMonth = mapped.filter((t) => t.ts.getMonth() === now.getMonth() && t.ts.getFullYear() === now.getFullYear());
      setMonthlyChange(thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0));
      const byCat = {};
      thisMonth.filter((t) => t.amount < 0).forEach((t) => {
        const c = t.category || "Other";
        byCat[c] = (byCat[c] || 0) + Math.abs(t.amount);
      });
      const palette = ["bg-blue-500", "bg-indigo-400", "bg-[#117ACA]", "bg-sky-400", "bg-cyan-500"];
      const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
      const max = top.length ? top[0][1] : 1;
      setSpending(top.map(([label, amount], i) => ({ label, amount, pct: Math.round((amount / max) * 100), color: palette[i % palette.length] })));

      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance > 0 ? a.balance : 0), 0);
  const current = accounts[selectedAcct];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D6EAF8] flex items-center justify-center text-[#117ACA] font-semibold">
        Loading your accounts…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      {/* ── Top Nav ── */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="px-6 h-20 flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center gap-3">
            <div className="h-14 bg-white flex items-center justify-center overflow-hidden px-3 rounded-md">
              <img src={logo} alt="One Nevada Credit Union" className="h-full w-auto object-contain" />
            </div>
          </div>

          {/* Center Navigation - Explicit route targets for each nav element */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "Account", path: "/dashboard" },
              { label: "Cash Cheque", path: "/cheque" },
              { label: "Transfer", path: "/transfer" },
              { label: "Transaction", path: "/transaction" },
              { label: "Card", path: "/card" },
              { label: "Report Issue", path: "/report" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-semibold transition-all duration-200 ${
                  activeNav === item.label
                    ? "text-[#0a2a66] border-b-2 border-[#117ACA] pb-1"
                    : "text-[#0a2a66] hover:text-[#117ACA]"
                }`}
                onClick={() => setActiveNav(item.label)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            {/* Settings */}
            <Link to="/settings" className="bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-[#0a2a66]">
              <Icon type="settings" className="w-4 h-4 text-[#0a2a66]" /> Settings
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md text-white">
              <Icon type="logout" className="w-4 h-4 text-white" /> Logout
            </button>

            {/* User */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[#117ACA] text-white flex items-center justify-center text-xs font-black">
                {user.initials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold text-[#0a2a66]">{user.name}</p>
                <p className="text-[11px] text-gray-500">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {/* ── Welcome + Net Worth ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-gray-500 text-sm">Good morning,</p>
            <h1 className="text-2xl font-black text-[#1a3a5c] tracking-tight">{user.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last login: {user.lastLogin}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-6 py-4 text-right border border-blue-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Assets</p>
            <p className="text-3xl font-black text-[#117ACA] tracking-tight">{fmt(totalBalance)}</p>
            <p className="text-xs text-emerald-500 font-semibold mt-0.5">↑ {fmt(monthlyChange)} this month</p>
          </div>
        </div>

        {/* ── Security Alert ── */}
        {!alertDismissed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between gap-3 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <p className="text-sm text-amber-800 font-medium">
                <strong>Security tip:</strong> One Nevada Credit Union will never ask for your password, PIN, or one-time code.
              </p>
            </div>
            <button onClick={() => setAlertDismissed(true)} className="text-amber-400 hover:text-amber-600 text-lg font-bold flex-shrink-0">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-[#1a3a5c] tracking-tight">My Accounts</h2>
                <Link to="/signup" className="text-[#117ACA] text-sm font-semibold hover:underline">+ Open Account</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {accounts.map((acct, i) => (
                  <AccountCard key={acct.id} acct={acct} selected={selectedAcct === i} onClick={() => setSelectedAcct(i)} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-base font-black text-[#1a3a5c] tracking-tight mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {quickActions.map((qa) => (
                  <Link
                    key={qa.label}
                    to={qa.path || "#"}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-full bg-gray-50 text-gray-500 group-hover:bg-[#117ACA] group-hover:text-white flex items-center justify-center transition-colors">
                      <span className="group-hover:scale-110 transition-transform inline-block">
                        <Icon type={qa.iconType} className="w-5 h-5" />
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-[#117ACA] text-center leading-tight transition-colors">
                      {qa.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-[#1a3a5c] tracking-tight">Recent Transactions</h2>
                <div className="flex items-center gap-3">
                  <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                    <Icon type="search" className="w-3.5 h-3.5" /> Search
                  </button>
                  <button className="text-[#117ACA] text-sm font-semibold hover:underline">View All</button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {["All Accounts", ...accounts.map((a) => a.type)].map((label, i) => (
                  <button
                    key={label}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      i === 0 ? "bg-[#117ACA] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div>
                {transactions.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No transactions yet.</p>
                )}
                {transactions.slice(0, 8).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">
            {/* Selected Account Detail */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-base font-black text-[#1a3a5c] tracking-tight mb-4">Account Details</h2>
              {current ? (
                <>
                  <div className={`rounded-xl bg-gradient-to-br ${current.color} p-4 text-white mb-4`}>
                    <p className="text-xs font-semibold tracking-widest uppercase text-white/60">{current.type}</p>
                    <p className="text-xl font-black mt-1">{fmt(current.balance)}</p>
                    <p className="text-xs text-white/50 mt-0.5">{current.number}</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Available Balance", val: fmt(current.available) },
                      { label: "Current Balance", val: fmt(current.balance) },
                      { label: "Account Type", val: current.type },
                      { label: "Account Number (share to receive)", val: current.fullNumber || current.number },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-400 font-medium">{label}</span>
                        <span className="text-sm font-bold text-[#1a3a5c]">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link to="/ach" className="bg-[#117ACA] text-white text-center text-sm font-bold py-2.5 rounded-xl hover:bg-[#0a5fa0] transition-colors">ACH</Link>
                    <Link to="/transfer" className="border-2 border-[#117ACA] text-[#117ACA] text-center text-sm font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Transfer</Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No accounts yet.</p>
              )}
            </div>

            {/* Spending Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-[#1a3a5c] tracking-tight">Spending This Month</h2>
                <span className="text-xs text-gray-400 font-medium">{new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
              <div className="space-y-3">
                {spending.length === 0 && (
                  <p className="text-xs text-gray-400">No spending this month yet.</p>
                )}
                {spending.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-600">{cat.label}</span>
                      <span className="text-xs font-black text-[#1a3a5c]">{fmt(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[#117ACA] text-sm font-bold hover:underline text-center">View Full Report →</button>
            </div>

            {/* Offers */}
            <div className="bg-gradient-to-br from-[#117ACA] to-[#0a5fa0] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-white/60">Offer for You</p>
                  <h3 className="text-base font-black mt-1 leading-snug">Earn 5% cash back on groceries</h3>
                </div>
                <span className="text-2xl">🎁</span>
              </div>
              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                Activate your Freedom Unlimited bonus offer and earn up to $75 back this quarter.
              </p>
              <button className="w-full bg-white text-[#117ACA] text-sm font-black py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Activate Offer</button>
            </div>

            {/* Credit Score */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-[#1a3a5c] tracking-tight">Credit Score</h2>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">↑ +12</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#117ACA" strokeWidth="3" strokeDasharray={`${Math.round((((creditScore ?? 0) - 300) / 550) * 100)} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-[#1a3a5c]">{creditScore ?? "—"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-600">
                    {creditScore == null ? "—" : creditScore >= 740 ? "Very Good" : creditScore >= 670 ? "Good" : creditScore >= 580 ? "Fair" : "Poor"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p className="text-xs text-gray-400">Range: 300–850</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2026 One Nevada & Co. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Privacy", "Security", "Terms", "Accessibility"].map((l) => (
              <button key={l} className="hover:text-gray-600 transition-colors">{l}</button>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
