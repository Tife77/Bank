import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/onenevada.svg";
import { supabase } from "./supabaseClient";
import { usePageUser } from "./pageHelpers";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(n || 0));

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Cash Cheque", path: "/cheque" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];


function StatusBadge({ status }) {
  const successful = status === "Successful";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        successful ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TransactionsPage() {
  const { user, logout } = usePageUser();
  const [transactions, setTransactions] = useState([]);
  const [profileName, setProfileName] = useState("You");
  const [summaryCards, setSummaryCards] = useState([
    { label: "Available Balance", value: "$0.00", note: "Total across active accounts" },
    { label: "Deposits", value: "$0.00", note: "Posted this month" },
    { label: "Withdrawals", value: "$0.00", note: "Debits this month" },
  ]);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const [{ data: profile }, { data: accts }, { data: txns }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", auth.user.id).single(),
        supabase.from("accounts").select("available, balance").eq("user_id", auth.user.id),
        supabase.from("transactions").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
      ]);
      const name = profile?.full_name || "You";
      setProfileName(name);

      // Dynamic summary cards
      const available = (accts || []).reduce((s, a) => s + Number(a.available || 0), 0);
      const now = new Date();
      const thisMonth = (txns || []).filter((t) => { const d = new Date(t.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
      const deposits = thisMonth.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
      const withdrawals = thisMonth.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      setSummaryCards([
        { label: "Available Balance", value: fmt(available), note: "Total across active accounts" },
        { label: "Deposits", value: fmt(deposits), note: "Posted this month" },
        { label: "Withdrawals", value: fmt(withdrawals), note: "Debits this month" },
      ]);

      setTransactions(
        (txns || []).map((t) => {
          const credit = Number(t.amount) >= 0;
          return {
            reference: "TRX-" + t.id.slice(0, 8).toUpperCase(),
            amount: fmt(t.amount),
            sender: credit ? t.merchant : name,
            receiver: credit ? name : t.merchant,
            type: credit ? "Credit" : "Debit",
            status: "Successful",
            date: new Date(t.created_at).toLocaleDateString(),
          };
        })
      );
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      <header className="w-full bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="px-6 h-20 flex items-center justify-between">
          <div className="h-14 bg-white flex items-center justify-center overflow-hidden px-3 rounded-md">
            <img src={logo} alt="One Nevada Credit Union" className="h-full w-auto object-contain" />
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-semibold transition-all duration-200 hover:text-[#117ACA] ${
                  item.label === "Transaction"
                    ? "text-[#041a49] border-b-2 border-[#041a49] pb-1"
                    : "text-[#041a49]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/settings" className="border border-[#041a49] text-[#041a49] hover:bg-[#041a49] hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
              Settings
            </Link>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md">
              Logout
            </button>
            <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2 bg-white">
              <div className="w-8 h-8 rounded-full bg-[#117ACA] text-white flex items-center justify-center text-xs font-black">
                {user.initials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold text-[#041a49]">{user.name}</p>
                <p className="text-[11px] text-gray-500">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Activity</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Transactions</h1>
            <p className="mt-2 text-sm text-slate-600">Review credits, debits, and transfer status across your accounts.</p>
          </div>
          <button className="w-fit rounded-full bg-[#041a49] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0c2b70]">
            Download Statement
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm border border-blue-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-black text-[#041a49]">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{card.note}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-2xl shadow-slate-900/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#07133B]">Transaction History</h2>
              <p className="mt-1 text-sm text-slate-500">Showing recent account activity</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex rounded-2xl bg-slate-100 p-1">
                {["All", "Credit", "Debit"].map((filter) => (
                  <button
                    key={filter}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                      filter === "All" ? "bg-[#117ACA] text-white shadow-sm" : "text-slate-600 hover:text-[#117ACA]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <select className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                <option>All Status</option>
                <option>Pending</option>
                <option>Successful</option>
                <option>Failed</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Sender</th>
                  <th className="px-5 py-4">Receiver</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">No transactions yet.</td></tr>
                )}
                {transactions.map((transaction) => (
                  <tr key={transaction.reference} className="transition hover:bg-blue-50/50">
                    <td className="px-5 py-4 text-sm font-bold text-[#041a49]">{transaction.reference}</td>
                    <td className={`px-5 py-4 text-sm font-black ${transaction.type === "Credit" ? "text-emerald-600" : "text-red-500"}`}>
                      {transaction.type === "Credit" ? "+" : "-"}{transaction.amount}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{transaction.sender}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{transaction.receiver}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
