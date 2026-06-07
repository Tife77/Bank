import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { usePageUser, fetchMyAccounts } from "./pageHelpers";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  FileText,
  Landmark,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import logo from "./assets/onenevada.svg";

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];

const recipients = [
  { id: "john", name: "John Doe", type: "Individual (PPD)", bank: "Wells Fargo", routing: "021000021", account: "5678", accountType: "Checking", amount: 500 },
  { id: "abc", name: "ABC LLC", type: "Business (CCD)", bank: "Bank of America", routing: "026009593", account: "4412", accountType: "Checking", amount: 1200 },
  { id: "summit", name: "Summit Office Supply", type: "Business (CCD)", bank: "Chase", routing: "322271627", account: "4188", accountType: "Savings", amount: 684.25 },
];

const activityRows = [
  { date: "05/28", recipient: "John Doe", amount: "$500", type: "Credit", status: "Completed" },
  { date: "05/27", recipient: "ABC LLC", amount: "$1,200", type: "Debit", status: "Pending" },
  { date: "05/23", recipient: "Summit Office Supply", amount: "$684.25", type: "Credit", status: "Processing" },
];

const tabs = [
  { id: "send", label: "Send Money (ACH Credit)" },
  { id: "request", label: "Request / Collect (ACH Debit)" },
  { id: "recipients", label: "Recipients / Beneficiaries" },
  { id: "activity", label: "Activity / History" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(value || 0));

function Header() {
  const { user, logout } = usePageUser();
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="px-6 h-20 flex items-center justify-between">
        <div className="h-14 bg-white flex items-center justify-center overflow-hidden px-3 rounded-md">
          <img src={logo} alt="One Nevada Credit Union" className="h-full w-auto object-contain" />
        </div>

        <nav className="hidden lg:flex items-center gap-7">
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
  );
}

function FieldLabel({ children }) {
  return <span className="text-sm font-bold text-[#0B1C48]">{children}</span>;
}

function SectionHeader({ icon: Icon, title, detail }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#117ACA]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-black text-[#07133B]">{title}</h2>
        {detail && <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const complete = status === "Completed";
  const processing = status === "Processing";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${complete ? "bg-emerald-100 text-emerald-700" : processing ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
      {status}
    </span>
  );
}

export default function AchPage() {
  const [step, setStep] = useState("form");
  const [activeTab, setActiveTab] = useState("send");
  const [selectedRecipient, setSelectedRecipient] = useState("john");
  const [accounts, setAccounts] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    account: "",
    recipientName: "John Doe",
    recipientType: "Individual (PPD)",
    bankName: "Wells Fargo",
    routingNumber: "021000021",
    accountNumber: "5678",
    accountType: "Checking",
    amount: "2500.00",
    paymentType: "One-time",
    recurringSchedule: "Monthly",
    effectiveDate: "2026-06-03",
    companyId: "ONCU-4821",
    addenda: "Consulting Payment",
    transactionType: "ACH Credit",
    memo: "Consulting Payment",
    authorized: false,
  });

  useEffect(() => {
    (async () => {
      const accs = await fetchMyAccounts();
      const { data: auth } = await supabase.auth.getUser();
      let holder = "";
      if (auth.user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", auth.user.id).single();
        holder = p?.full_name || "";
      }
      const withHolder = accs.map((a) => ({ ...a, holder }));
      setAccounts(withHolder);
      if (withHolder[0]) setForm((f) => ({ ...f, account: withHolder[0].id }));
    })();
  }, []);

  const originator = accounts.find((item) => item.id === form.account) || accounts[0] || { name: "", mask: "", routing: "322484401", bank: "One Nevada Credit Union", holder: "" };
  const amount = Number(form.amount || 0);

  const handleSubmitAch = async () => {
    setSubmitError("");
    setSubmitting(true);
    const { error } = await supabase.rpc("make_transfer", {
      p_from: form.account,
      p_amount: amount,
      p_kind: "ach",
      p_to_account: null,
      p_recipient_name: form.recipientName,
      p_recipient_bank: form.bankName,
      p_recipient_acct: form.accountNumber,
      p_memo: form.memo || form.addenda || null,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || "ACH failed.");
      return;
    }
    setStep("success");
  };
  const estimatedDelivery = "June 6, 2026";
  const transactionId = "ACH-60412";
  const canReview =
    amount > 0 &&
    form.recipientName &&
    form.bankName &&
    form.routingNumber.length === 9 &&
    form.accountNumber &&
    form.effectiveDate &&
    form.authorized;

  const updateForm = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setStep("form");
    if (tabId === "send") {
      setForm((current) => ({ ...current, transactionType: "ACH Credit" }));
    }
    if (tabId === "request") {
      setForm((current) => ({ ...current, transactionType: "ACH Debit" }));
    }
  };

  const selectRecipient = (recipientId) => {
    const recipient = recipients.find((item) => item.id === recipientId) || recipients[0];
    setSelectedRecipient(recipient.id);
    setForm((current) => ({
      ...current,
      recipientName: recipient.name,
      recipientType: recipient.type,
      bankName: recipient.bank,
      routingNumber: recipient.routing,
      accountNumber: recipient.account,
      accountType: recipient.accountType,
      amount: String(recipient.amount),
    }));
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#D6EAF8] font-sans">
        <Header />
        <main className="mx-auto flex max-w-3xl px-4 py-10">
          <section className="w-full rounded-[28px] bg-white p-8 text-center shadow-2xl shadow-slate-900/10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-11 w-11" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">ACH Submitted</p>
            <h1 className="mt-3 text-3xl font-black text-[#07133B]">{formatCurrency(amount)} {form.transactionType.toLowerCase()} scheduled</h1>
            <div className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Reference</p>
                <p className="mt-1 text-sm font-bold text-[#041a49]">{transactionId}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-1 text-sm font-bold text-[#041a49]">Processing</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Delivery</p>
                <p className="mt-1 text-sm font-bold text-[#041a49]">{estimatedDelivery}</p>
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-600">
              Your ACH transaction to {form.recipientName} is pending processing and can be tracked in activity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => setStep("form")} className="rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#0c2b70]">
                Create Another ACH
              </button>
              <button onClick={() => setActiveTab("activity")} className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] hover:bg-white">
                View Activity
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">ACH Section</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">ACH Payments / Transfers</h1>
            <p className="mt-2 text-sm text-slate-600">Send money, collect funds, manage beneficiaries, and review ACH activity.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#117ACA] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            NACHA authorization required
          </div>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[#041a49] text-white" : "text-[#041a49] hover:bg-blue-50"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "activity" ? (
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <SectionHeader icon={Clock3} title="Activity / History Table" detail="Track recent ACH credits and debits by recipient, type, and status." />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="py-3 font-black">Date</th>
                    <th className="py-3 font-black">Recipient</th>
                    <th className="py-3 font-black">Amount</th>
                    <th className="py-3 font-black">Type</th>
                    <th className="py-3 font-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityRows.map((row) => (
                    <tr key={`${row.date}-${row.recipient}`}>
                      <td className="py-4 font-bold text-[#041a49]">{row.date}</td>
                      <td className="py-4 font-bold text-[#041a49]">{row.recipient}</td>
                      <td className="py-4 font-bold text-[#07133B]">{row.amount}</td>
                      <td className="py-4 text-slate-600">{row.type}</td>
                      <td className="py-4"><StatusPill status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : activeTab === "recipients" ? (
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader icon={Users} title="Recipients / Beneficiaries" detail="Mandatory ACH recipient fields include holder name, recipient type, bank name, routing number, account number, and account type." />
              <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                Search recipients
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recipients.map((recipient) => (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() => {
                    selectRecipient(recipient.id);
                    setActiveTab(form.transactionType === "ACH Debit" ? "request" : "send");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${selectedRecipient === recipient.id ? "border-[#117ACA] bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-[#117ACA]"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#117ACA]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-black text-[#041a49]">{recipient.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{recipient.type}</p>
                  <p className="mt-3 text-xs font-bold text-slate-500">{recipient.bank} - routing {recipient.routing}</p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
              {step === "review" ? (
                <>
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#117ACA]">
                      <ClipboardCheck className="h-7 w-7" />
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-[#07133B]">Review this ACH transfer?</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Confirm these ACH details before submitting for processing.
                    </p>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                    <div className="divide-y divide-slate-200">
                      {[
                        { label: "ACH from", value: `${originator.name} ending ${originator.mask}` },
                        { label: "ACH to", value: `${form.recipientName} - ${form.bankName}` },
                        { label: "Routing number", value: form.routingNumber },
                        { label: "Account number", value: `Ending ${form.accountNumber.slice(-4)}` },
                        { label: "Amount", value: formatCurrency(amount) },
                        { label: "Effective date", value: form.effectiveDate },
                        { label: "Transaction type", value: form.transactionType },
                        { label: "Payment type", value: form.paymentType },
                        { label: "Company / ACH ID", value: form.companyId },
                        { label: "Delivery", value: "1-3 business days" },
                        { label: "Memo", value: form.memo || "No memo added" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-5 py-3">
                          <span className="font-semibold text-slate-500">{item.label}</span>
                          <span className="text-right font-bold text-slate-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-500">
                    ACH transactions may remain pending while processing. Verify the recipient routing and account number before submitting.
                  </p>

                  {submitError && (
                    <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">⚠ {submitError}</div>
                  )}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button onClick={() => setStep("form")} className="rounded bg-slate-100 py-3 text-sm font-black text-[#041a49] transition hover:bg-slate-200">
                      Edit ACH
                    </button>
                    <button onClick={handleSubmitAch} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded bg-[#0b48ff] py-3 text-sm font-black text-white transition hover:bg-[#0637bd] disabled:bg-slate-300">
                      <Send className="h-4 w-4" />
                      {submitting ? "Submitting…" : "Confirm & Submit"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  <section>
                    <SectionHeader icon={Landmark} title="Sender (Originator) Details" detail="These fields are auto-filled from the selected One Nevada account." />
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <FieldLabel>Account name</FieldLabel>
                        <select name="account" value={form.account} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} ending {account.mask}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Business / Individual Name</p>
                        <p className="mt-1 text-sm font-bold text-[#041a49]">{originator.holder}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Bank Name</p>
                        <p className="mt-1 text-sm font-bold text-[#041a49]">{originator.bank}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Routing / Account</p>
                        <p className="mt-1 text-sm font-bold text-[#041a49]">{originator.routing} - ****{originator.mask}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <SectionHeader icon={Users} title="Recipient (Beneficiary) Section" detail="These are mandatory ACH fields across U.S. systems." />
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <label className="space-y-2">
                        <FieldLabel>Recipient name (account holder)</FieldLabel>
                        <input name="recipientName" value={form.recipientName} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Recipient type</FieldLabel>
                        <select name="recipientType" value={form.recipientType} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          <option>Individual (PPD)</option>
                          <option>Business (CCD)</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Bank name</FieldLabel>
                        <input name="bankName" value={form.bankName} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Routing number (ABA - 9 digits)</FieldLabel>
                        <input name="routingNumber" value={form.routingNumber} onChange={updateForm} maxLength={9} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Account number</FieldLabel>
                        <input name="accountNumber" value={form.accountNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Account type</FieldLabel>
                        <select name="accountType" value={form.accountType} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          <option>Checking</option>
                          <option>Savings</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section>
                    <SectionHeader icon={CalendarDays} title="Payment Details" detail="Choose amount, timing, transaction type, and remittance notes." />
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <label className="space-y-2">
                        <FieldLabel>Amount (USD)</FieldLabel>
                        <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Payment type</FieldLabel>
                        <select name="paymentType" value={form.paymentType} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          <option>One-time</option>
                          <option>Recurring</option>
                        </select>
                      </label>
                      {form.paymentType === "Recurring" && (
                        <label className="space-y-2">
                          <FieldLabel>Recurring schedule</FieldLabel>
                          <select name="recurringSchedule" value={form.recurringSchedule} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                          </select>
                        </label>
                      )}
                      <label className="space-y-2">
                        <FieldLabel>Effective date</FieldLabel>
                        <input type="date" name="effectiveDate" value={form.effectiveDate} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Company ID / ACH ID</FieldLabel>
                        <input name="companyId" value={form.companyId} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Transaction type</FieldLabel>
                        <select name="transactionType" value={form.transactionType} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          <option>ACH Credit</option>
                          <option>ACH Debit</option>
                        </select>
                      </label>
                      <label className="space-y-2 md:col-span-2">
                        <FieldLabel>Addenda / notes (remittance info)</FieldLabel>
                        <input name="memo" value={form.memo} onChange={updateForm} placeholder="Optional note" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none placeholder:text-slate-400 focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                    <SectionHeader icon={ShieldCheck} title="Authorization & Compliance" detail="Authorization is legally required for ACH processing." />
                    <label className="mt-5 flex items-start gap-3 text-sm font-bold text-[#041a49]">
                      <input type="checkbox" name="authorized" checked={form.authorized} onChange={updateForm} className="mt-1 h-4 w-4 rounded border-slate-300" />
                      <span>I authorize this ACH transaction and confirm the recipient details are accurate.</span>
                    </label>
                    <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">
                      By continuing, you agree to the ACH terms and acknowledge NACHA compliance requirements.
                    </p>
                  </section>

                  <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-[#041a49]">ACH total</p>
                      <p className="mt-1 text-2xl font-black text-[#07133B]">{formatCurrency(amount)}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">Estimated delivery: 1-3 business days</p>
                    </div>
                    <button disabled={!canReview} onClick={() => setStep("review")} className="rounded-full bg-[#041a49] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70] disabled:cursor-not-allowed disabled:bg-slate-300">
                      Review ACH
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
                <h2 className="text-base font-black text-[#07133B]">Selected recipient</h2>
                <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#117ACA]">{form.recipientType}</p>
                  <p className="mt-1 text-xl font-black text-[#041a49]">{form.recipientName}</p>
                  <p className="mt-1 text-sm text-slate-600">{form.bankName} - ****{form.accountNumber.slice(-4)}</p>
                </div>
              </section>

              <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-[#07133B]">Activity / History</h2>
                  <Clock3 className="h-5 w-5 text-[#117ACA]" />
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {activityRows.map((row) => (
                    <div key={`${row.date}-${row.recipient}`} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#041a49]">{row.recipient}</p>
                          <p className="mt-1 text-xs text-slate-500">{row.date} - {row.type}</p>
                        </div>
                        <p className="text-sm font-black text-[#07133B]">{row.amount}</p>
                      </div>
                      <div className="mt-2">
                        <StatusPill status={row.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] bg-[#041a49] p-5 text-white shadow-lg">
                <CalendarDays className="h-8 w-8 text-sky-300" />
                <h2 className="mt-4 text-base font-black">ACH processing</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  ACH files use fixed-format records and typically settle within 1-3 business days.
                </p>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
