import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, Eye, FileText, Search, ShieldCheck } from "lucide-react";
import logo from "./assets/onenevada.svg";

const user = { name: "Marcus Johnson", initials: "MJ" };

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Cash Cheque", path: "/cheque" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];

const statements = [
  { id: "STM-2026-05", account: "One Checking Rewards", period: "May 2026", date: "May 31, 2026", size: "1.8 MB", type: "Monthly" },
  { id: "STM-2026-04", account: "One Checking Rewards", period: "April 2026", date: "Apr 30, 2026", size: "1.7 MB", type: "Monthly" },
  { id: "STM-2026-Q1", account: "Primary Savings", period: "Q1 2026", date: "Mar 31, 2026", size: "2.4 MB", type: "Quarterly" },
  { id: "TAX-2025-INT", account: "Primary Savings", period: "2025 Tax Forms", date: "Jan 31, 2026", size: "824 KB", type: "Tax" },
];

function Header() {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="px-6 h-20 flex items-center justify-between">
        <div className="h-14 bg-white flex items-center justify-center overflow-hidden px-3 rounded-md">
          <img src={logo} alt="One Nevada Credit Union" className="h-full w-auto object-contain" />
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.label} to={item.path} className="text-sm font-semibold text-[#041a49] transition-all duration-200 hover:text-[#117ACA]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="border border-[#041a49] text-[#041a49] hover:bg-[#041a49] hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
            Settings
          </Link>
          <button className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md">Logout</button>
          <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2 bg-white">
            <div className="w-8 h-8 rounded-full bg-[#117ACA] text-white flex items-center justify-center text-xs font-black">{user.initials}</div>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-[#041a49]">{user.name}</p>
              <p className="text-[11px] text-gray-500">Premium Member</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function StatementsPage() {
  const [account, setAccount] = useState("All Accounts");
  const [documentType, setDocumentType] = useState("All Documents");

  const filteredStatements = useMemo(
    () =>
      statements.filter(
        (statement) =>
          (account === "All Accounts" || statement.account === account) &&
          (documentType === "All Documents" || statement.type === documentType)
      ),
    [account, documentType]
  );

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Documents</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Statements</h1>
            <p className="mt-2 text-sm text-slate-600">View, filter, and download account statements and tax documents.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#117ACA] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure documents
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#07133B]">Available statements</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a statement to preview or download.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select value={account} onChange={(event) => setAccount(event.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                  <option>All Accounts</option>
                  <option>One Checking Rewards</option>
                  <option>Primary Savings</option>
                </select>
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                  <option>All Documents</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Tax</option>
                </select>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-5 py-4">Document</th>
                    <th className="px-5 py-4">Account</th>
                    <th className="px-5 py-4">Period</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStatements.map((statement) => (
                    <tr key={statement.id} className="transition hover:bg-blue-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#117ACA]">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#041a49]">{statement.id}</p>
                            <p className="text-xs text-slate-500">{statement.type} - {statement.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{statement.account}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{statement.period}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">{statement.date}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="inline-flex items-center gap-2 rounded-full border border-[#117ACA] px-3 py-2 text-xs font-bold text-[#117ACA] hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-full bg-[#041a49] px-3 py-2 text-xs font-bold text-white hover:bg-[#0c2b70]">
                            <Download className="h-4 w-4" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
              <h2 className="text-base font-black text-[#07133B]">Statement tools</h2>
              <div className="mt-4 grid gap-3">
                <button className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#117ACA] hover:bg-blue-50">
                  <Search className="h-5 w-5 text-[#117ACA]" />
                  <span className="text-sm font-bold text-[#041a49]">Search statement archive</span>
                </button>
                <button className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#117ACA] hover:bg-blue-50">
                  <CalendarDays className="h-5 w-5 text-[#117ACA]" />
                  <span className="text-sm font-bold text-[#041a49]">Manage delivery preferences</span>
                </button>
              </div>
            </section>
            <section className="rounded-[28px] bg-[#041a49] p-5 text-white shadow-lg">
              <FileText className="h-8 w-8 text-sky-300" />
              <h2 className="mt-4 text-base font-black">Paperless access</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Statements stay available here for convenient online access whenever you need records.</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
