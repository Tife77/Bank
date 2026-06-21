import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck2,
  Lock,
  Mail,
  MinusCircle,
  PlusCircle,
  UserRound,
} from "lucide-react";
import logo from "./assets/onenevada.svg";

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "ACH", path: "/ach" },
  { label: "Admin", path: "/admin" },
];


const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(value || 0));

const formatSignedCurrency = (value) => `${value < 0 ? "-" : ""}${formatCurrency(value)}`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapePdfText = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const getRecordSections = (record) => [
  {
    title: "Lookup",
    rows: [
      ["Full name", record.lookup.fullName],
      ["Email", record.lookup.email],
      ["Member ID", record.lookup.memberId],
      ["Extracted at", new Date(record.extractedAt).toLocaleString()],
      ["Requested by", record.requestedBy],
    ],
  },
  { title: "Personal Details", rows: Object.entries(record.personalDetails) },
  {
    title: "Accounts",
    columns: ["Owner", "Type", "Account Number", "Balance", "Status"],
    rows: record.accounts.map((account) => [
      account.owner,
      account.type,
      account.accountNumber,
      formatSignedCurrency(account.balance),
      account.status,
    ]),
  },
  { title: "Card Information", rows: Object.entries(record.cardInformation) },
  { title: "Cheque Information", rows: Object.entries(record.chequeInformation) },
  {
    title: "Transactions",
    columns: ["Reference", "Channel", "Amount", "Status", "Date"],
    rows: record.transactions.map((transaction) => [
      transaction.reference,
      transaction.channel,
      formatCurrency(transaction.amount),
      transaction.status,
      transaction.date,
    ]),
  },
  {
    title: "Verifications",
    columns: ["ID", "Item", "Owner", "Status", "Notification"],
    rows: record.verifications.map((verification) => [
      verification.id,
      verification.item,
      verification.owner,
      verification.status,
      verification.notification,
    ]),
  },
];

const makeDownloadName = (name, extension) =>
  `${name || "user"}-admin-record.${extension}`.replace(/[^a-z0-9.-]+/gi, "-");

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildReportHtml = (record) => {
  const sections = getRecordSections(record);
  const sectionHtml = sections
    .map((section) => {
      const headerCells = section.columns || ["Field", "Value"];
      const rows = section.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
        )
        .join("");

      return `
        <h2>${escapeHtml(section.title)}</h2>
        <table>
          <thead><tr>${headerCells.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #07133B; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          h2 { background: #EAF4FC; color: #041a49; font-size: 14px; margin: 22px 0 0; padding: 10px; }
          p { color: #475569; margin: 0 0 18px; }
          table { border-collapse: collapse; margin: 0 0 12px; width: 100%; }
          th, td { border: 1px solid #CBD5E1; font-size: 12px; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #F8FAFC; color: #334155; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Admin User Record</h1>
        <p>${escapeHtml(record.lookup.fullName)} - ${escapeHtml(record.lookup.memberId)}</p>
        ${sectionHtml}
      </body>
    </html>
  `;
};

const buildPdfBlob = (record) => {
  const lines = [`Admin User Record`, `${record.lookup.fullName} - ${record.lookup.memberId}`, ""];
  getRecordSections(record).forEach((section) => {
    lines.push(section.title);
    if (section.columns) {
      lines.push(section.columns.join(" | "));
      section.rows.forEach((row) => lines.push(row.join(" | ")));
    } else {
      section.rows.forEach(([label, value]) => lines.push(`${label}: ${value}`));
    }
    lines.push("");
  });

  const pageHeight = 760;
  const lineHeight = 14;
  const linesPerPage = Math.floor(pageHeight / lineHeight);
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects = ["<< /Type /Catalog /Pages 2 0 R >>"];
  const pageRefs = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const text = pageLines
      .map((line, lineIndex) => `BT /F1 10 Tf 36 ${806 - lineIndex * lineHeight} Td (${escapePdfText(line).slice(0, 130)}) Tj ET`)
      .join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${text.length} >>\nstream\n${text}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

function StatusBadge({ status }) {
  const good = status === "Active" || status === "Approved" || status === "Successful" || status === "Sent";
  const bad = status === "Frozen" || status === "Rejected";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${good ? "bg-emerald-100 text-emerald-700" : bad ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
      {status}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, detail }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#117ACA]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-black text-[#07133B]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("500");
  const [notAdmin, setNotAdmin] = useState(false);
  const [profilesById, setProfilesById] = useState({});

  const loadAll = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", auth.user.id).single();
    if (!me?.is_admin) { setNotAdmin(true); return; }

    const [{ data: profiles }, { data: accts }, { data: txns }, { data: kyc }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("accounts").select("*").order("created_at"),
      supabase.from("transfers").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("kyc_submissions").select("*").order("created_at", { ascending: false }),
    ]);
    const nameOf = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name || p.email]));
    setProfilesById(Object.fromEntries((profiles || []).map((p) => [p.id, p])));

    setAccounts((accts || []).map((a) => ({
      id: a.id, owner: nameOf[a.user_id] || "Unknown", type: a.type,
      number: a.account_number, balance: Number(a.balance), status: a.status || "Active",
      userId: a.user_id, routing: a.routing_number, provider: a.provider,
    })));
    setTransactions((txns || []).map((t) => ({
      id: t.id, channel: (t.kind || "transfer").toUpperCase(), owner: nameOf[t.user_id] || "Unknown",
      amount: Number(t.amount), status: t.status || "Pending",
      date: new Date(t.created_at).toLocaleDateString(),
    })));
    setVerifications((kyc || []).map((k) => ({
      id: k.id, item: k.doc_type || "KYC", owner: nameOf[k.user_id] || "Unknown",
      status: k.status === "approved" ? "Approved" : "Pending",
      notification: k.status === "approved" ? "Sent" : "Queued",
    })));
    if (accts && accts[0]) setSelectedAccountId(accts[0].id);
  };

  useEffect(() => { loadAll(); }, []);
  const [mail, setMail] = useState({
    to: "",
    subject: "One Nevada account update",
    message: "Your request has been reviewed by One Nevada Credit Union.",
  });
  const [mailLog, setMailLog] = useState([]);
  const [extractForm, setExtractForm] = useState({
    fullName: "",
    email: "",
    memberId: "",
  });
  const [extractedRecord, setExtractedRecord] = useState(null);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) || accounts[0] || { id: "", owner: "—", type: "—", number: "—", balance: 0, status: "—" };

  // Live details for the selected account's owner (replaces hardcoded userDetails).
  const ownerProfile = profilesById[selectedAccount.userId] || {};
  const userDetails = {
    personal: [
      ["Full name", ownerProfile.full_name || selectedAccount.owner || "—"],
      ["Email", ownerProfile.email || "—"],
      ["Phone", ownerProfile.phone || "—"],
      ["Address", [ownerProfile.address, ownerProfile.city, ownerProfile.state, ownerProfile.zip].filter(Boolean).join(", ") || "—"],
      ["Date of birth", ownerProfile.date_of_birth || "—"],
      ["KYC status", ownerProfile.kyc_status || "not_started"],
    ],
    cards: [
      ["Cardholder", ownerProfile.full_name || selectedAccount.owner || "—"],
      ["Account product", selectedAccount.type || "—"],
      ["Account number", selectedAccount.number || "—"],
      ["Routing", selectedAccount.routing || "—"],
      ["Status", selectedAccount.status || "—"],
      ["Provider", selectedAccount.provider || "simulation"],
    ],
    cheques: [
      ["Owner", ownerProfile.full_name || selectedAccount.owner || "—"],
      ["Account", `${selectedAccount.type} ${selectedAccount.number}`],
      ["Balance", formatCurrency(selectedAccount.balance)],
      ["Member since", ownerProfile.created_at ? new Date(ownerProfile.created_at).toLocaleDateString() : "—"],
    ],
  };
  const pendingTransactions = useMemo(() => transactions.filter((item) => item.status === "Pending").length, [transactions]);

  const setAccountStatus = async (accountId, status) => {
    setAccounts((current) => current.map((account) => (account.id === accountId ? { ...account, status } : account)));
    await supabase.from("accounts").update({ status }).eq("id", accountId);
  };

  const adjustBalance = async (direction) => {
    const delta = Number(balanceAmount || 0);
    if (!(delta > 0)) return;
    const acct = accounts.find((a) => a.id === selectedAccountId);
    if (!acct) return;
    const newBalance = direction === "topup" ? acct.balance + delta : acct.balance - delta;
    setAccounts((current) => current.map((a) => (a.id === selectedAccountId ? { ...a, balance: newBalance } : a)));
    await supabase.from("accounts").update({ balance: newBalance, available: newBalance }).eq("id", selectedAccountId);
    // Record an admin adjustment as a transaction for the user's ledger.
    await supabase.from("transactions").insert({
      account_id: selectedAccountId, user_id: (await supabase.from("accounts").select("user_id").eq("id", selectedAccountId).single()).data.user_id,
      merchant: "Admin Adjustment", category: "Adjustment",
      amount: direction === "topup" ? delta : -delta, icon_type: "bank",
    });
  };

  const updateTransaction = async (transactionId, status) => {
    setTransactions((current) => current.map((item) => (item.id === transactionId ? { ...item, status } : item)));
    await supabase.from("transfers").update({ status }).eq("id", transactionId);
  };

  const approveAllTransactions = async () => {
    const pendingIds = transactions.filter((t) => t.status === "Pending").map((t) => t.id);
    setTransactions((current) => current.map((item) => ({ ...item, status: "Successful" })));
    if (pendingIds.length) await supabase.from("transfers").update({ status: "Successful" }).in("id", pendingIds);
  };

  const updateVerification = async (verificationId, status) => {
    setVerifications((current) =>
      current.map((item) =>
        item.id === verificationId
          ? { ...item, status, notification: status === "Approved" ? "Sent" : "Queued" }
          : item
      )
    );
    await supabase.from("kyc_submissions").update({ status: status === "Approved" ? "approved" : "rejected" }).eq("id", verificationId);
  };

  const sendMail = () => {
    setMailLog((current) => [
      { id: `MAIL-${Date.now()}`, to: mail.to, subject: mail.subject, status: "Queued from company mail" },
      ...current,
    ]);
  };

  const generateExtractPreview = () => {
    const record = {
      extractedAt: new Date().toISOString(),
      requestedBy: "Internal Admin",
      lookup: extractForm,
      personalDetails: Object.fromEntries(userDetails.personal),
      accounts: accounts.map((account) => ({
        owner: account.owner,
        type: account.type,
        accountNumber: account.number,
        balance: account.balance,
        status: account.status,
      })),
      cardInformation: Object.fromEntries(userDetails.cards),
      chequeInformation: Object.fromEntries(userDetails.cheques),
      transactions: transactions.map((transaction) => ({
        reference: transaction.id,
        channel: transaction.channel,
        amount: transaction.amount,
        status: transaction.status,
        date: transaction.date,
      })),
      verifications,
    };
    setExtractedRecord(record);
  };

  const downloadExtractedRecord = (format) => {
    if (!extractedRecord) return;

    if (format === "pdf") {
      downloadBlob(buildPdfBlob(extractedRecord), makeDownloadName(extractedRecord.lookup.fullName, "pdf"));
      return;
    }

    const excelBlob = new Blob([buildReportHtml(extractedRecord)], { type: "application/vnd.ms-excel" });
    downloadBlob(excelBlob, makeDownloadName(extractedRecord.lookup.fullName, "xls"));
  };

  if (notAdmin) {
    return (
      <div className="min-h-screen bg-[#D6EAF8] flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white p-8 shadow-xl text-center max-w-md">
          <Lock className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-black text-[#07133B]">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">Your account is not an administrator. Ask an admin to grant you access.</p>
          <Link to="/dashboard" className="mt-6 inline-block rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-md">
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex h-14 items-center justify-center overflow-hidden rounded-md bg-white px-3">
            <img src={logo} alt="One Nevada Credit Union" className="h-full w-auto object-contain" />
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-semibold transition-all duration-200 hover:text-[#117ACA] ${
                  item.label === "Admin" ? "border-b-2 border-[#041a49] pb-1 text-[#041a49]" : "text-[#041a49]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="rounded-full bg-[#041a49] px-4 py-2 text-sm font-black text-white">
            Internal Admin
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Operations</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Admin Control Center</h1>
            <p className="mt-2 text-sm text-slate-600">Manage account status, transaction approvals, verification queues, balances, messaging, and user records.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Pending", pendingTransactions],
              ["Accounts", accounts.length],
              ["Verifications", verifications.length],
              ["Mail queued", mailLog.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-black text-[#07133B]">{value}</p>
                <p className="text-xs font-bold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <SectionTitle icon={Lock} title="Account Control" detail="Freeze or reactivate any account, then top up or reduce balances for controlled adjustments." />
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Account</th>
                    <th className="px-5 py-4">Owner</th>
                    <th className="px-5 py-4">Balance</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-[#041a49]">{account.type}</p>
                        <p className="text-xs font-semibold text-slate-500">{account.number}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{account.owner}</td>
                      <td className="px-5 py-4 text-sm font-black text-[#07133B]">{account.balance < 0 ? "-" : ""}{formatCurrency(account.balance)}</td>
                      <td className="px-5 py-4"><StatusBadge status={account.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setAccountStatus(account.id, "Frozen")} className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">Freeze</button>
                          <button onClick={() => setAccountStatus(account.id, "Active")} className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">Activate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="text-base font-black text-[#07133B]">Balance Adjustment</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px_auto_auto] md:items-end">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-[#0B1C48]">Account</span>
                  <select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none">
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.type} {account.number}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-bold text-[#0B1C48]">Amount</span>
                  <input value={balanceAmount} onChange={(event) => setBalanceAmount(event.target.value)} type="number" min="0" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" />
                </label>
                <button onClick={() => adjustBalance("topup")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
                  <PlusCircle className="h-4 w-4" />
                  Top Up
                </button>
                <button onClick={() => adjustBalance("reduce")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white">
                  <MinusCircle className="h-4 w-4" />
                  Reduce
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-600">Selected balance: {selectedAccount?.balance < 0 ? "-" : ""}{formatCurrency(selectedAccount?.balance || 0)}</p>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <SectionTitle icon={CheckCircle2} title="Approvals" detail="Approve cheque, ACH, wire, transfer, and other transaction requests. Status can remain pending or become successful." />
            <button onClick={approveAllTransactions} className="mt-5 w-full rounded-2xl bg-[#041a49] px-4 py-3 text-sm font-black text-white">Approve All Pending Transactions</button>
            <div className="mt-5 space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#041a49]">{transaction.id}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{transaction.channel} - {transaction.owner} - {transaction.date}</p>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <p className="mt-3 text-xl font-black text-[#07133B]">{formatCurrency(transaction.amount)}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => updateTransaction(transaction.id, "Pending")} className="rounded-xl bg-amber-100 py-2 text-xs font-black text-amber-700">Pending</button>
                    <button onClick={() => updateTransaction(transaction.id, "Successful")} className="rounded-xl bg-emerald-100 py-2 text-xs font-black text-emerald-700">Successful</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <SectionTitle icon={Bell} title="Verification & Notifications" detail="Approve verification records and queue automated member notifications." />
            <div className="mt-5 space-y-3">
              {verifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#041a49]">{item.item}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.id} - {item.owner}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500">Notification: {item.notification}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => updateVerification(item.id, "Approved")} className="rounded-xl bg-emerald-100 py-2 text-xs font-black text-emerald-700">Approve</button>
                    <button onClick={() => updateVerification(item.id, "Rejected")} className="rounded-xl bg-red-100 py-2 text-xs font-black text-red-700">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <SectionTitle icon={Mail} title="Company Mail" detail="Compose direct member messages from the company mail workflow. This demo queues the message in the admin log." />
            <div className="mt-5 grid gap-4">
              <input value={mail.to} onChange={(event) => setMail((current) => ({ ...current, to: event.target.value }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" placeholder="Recipient email" />
              <input value={mail.subject} onChange={(event) => setMail((current) => ({ ...current, subject: event.target.value }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" placeholder="Subject" />
              <textarea value={mail.message} onChange={(event) => setMail((current) => ({ ...current, message: event.target.value }))} className="min-h-32 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" placeholder="Message" />
              <button onClick={sendMail} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#041a49] px-5 py-3 text-sm font-black text-white">
                <Mail className="h-4 w-4" />
                Queue Company Mail
              </button>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {mailLog.length === 0 && <p className="py-4 text-sm font-semibold text-slate-400">No mail queued yet.</p>}
              {mailLog.map((item) => (
                <div key={item.id} className="py-3">
                  <p className="text-sm font-black text-[#041a49]">{item.subject}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.to} - {item.status}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
          <SectionTitle icon={UserRound} title="Extract User Records" detail="Enter user details, generate a preview, then download the compiled admin record. Card numbers are intentionally masked in this console." />

          <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_auto] lg:items-end">
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#0B1C48]">Full name</span>
                <input value={extractForm.fullName} onChange={(event) => setExtractForm((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#0B1C48]">Email</span>
                <input value={extractForm.email} onChange={(event) => setExtractForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#0B1C48]">Member ID</span>
                <input value={extractForm.memberId} onChange={(event) => setExtractForm((current) => ({ ...current, memberId: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none" />
              </label>
              <button onClick={generateExtractPreview} className="rounded-2xl bg-[#041a49] px-5 py-3 text-sm font-black text-white">
                Extract Preview
              </button>
            </div>
          </div>

          {extractedRecord && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-[#07133B]">Preview for {extractedRecord.lookup.fullName}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Generated {new Date(extractedRecord.extractedAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button onClick={() => downloadExtractedRecord("pdf")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#117ACA] px-5 py-3 text-sm font-black text-white">
                    <Download className="h-4 w-4" />
                    PDF
                  </button>
                  <button onClick={() => downloadExtractedRecord("excel")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">
                    <Download className="h-4 w-4" />
                    Excel
                  </button>
                  <button onClick={() => setExtractedRecord(null)} className="inline-flex items-center justify-center rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-[#041a49]">
                    Exit
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {getRecordSections(extractedRecord).map((section) => (
                  <div key={section.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <h4 className="bg-blue-50 px-4 py-3 text-sm font-black text-[#041a49]">{section.title}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-400">
                          <tr>
                            {(section.columns || ["Field", "Value"]).map((column) => (
                              <th key={column} className="px-4 py-3">{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.rows.map((row, rowIndex) => (
                            <tr key={`${section.title}-${rowIndex}`}>
                              {row.map((cell, cellIndex) => (
                                <td key={`${section.title}-${rowIndex}-${cellIndex}`} className="px-4 py-3 font-semibold text-slate-600">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {[
              ["Personal details", UserRound, userDetails.personal],
              ["Card information", CreditCard, userDetails.cards],
              ["Cheque information", FileCheck2, userDetails.cheques],
            ].map(([title, Icon, rows]) => (
              <div key={title} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#117ACA]" />
                  <h3 className="text-base font-black text-[#07133B]">{title}</h3>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold text-slate-500">{label}</span>
                      <span className="text-right font-bold text-[#041a49]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
