import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe2,
  PlusCircle,
  Search,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";
import logo from "./assets/onenevada.svg";
import { usePageUser } from "./pageHelpers";

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Cash Cheque", path: "/cheque" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];

const externalAccountsSeed = [];

const popularBanks = [
  "Bank of America",
  "Wells Fargo",
  "Navy Federal Credit Union",
  "Citibank",
  "TD Bank",
  "Ally Bank",
  "Capital One",
  "USAA",
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

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`text-sm font-semibold transition-all duration-200 hover:text-[#117ACA] ${
                item.label === "Transfer" ? "text-[#041a49] border-b-2 border-[#041a49] pb-1" : "text-[#041a49]"
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
  );
}

function TransferRow({ label, value, placeholder, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-b border-slate-200 py-4 text-left transition hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 truncate text-base font-semibold ${
              value
                ? "text-black"
                : "text-black"
            }`}
          >
            {value || placeholder}
          </p>
        </div>

        <ChevronDown className="h-5 w-5 flex-shrink-0 text-black" />
      </div>
    </button>
  );
}
function BottomSheet({
  title,
  children,
  onClose,
  onBack,
  wide = false,
  hideBackButton = false,
  contentClassName = "",
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 px-3">
      <section
        className={`rounded-[28px] bg-white shadow-2xl flex flex-col w-full overflow-hidden ${
          wide
  ? "max-w-2xl h-[500px]"
  : "max-w-xl h-[420px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="w-8">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
            )}
          </div>

          <h2 className="text-lg font-black text-[#07133B]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {!hideBackButton && !onBack && (
          <div className="border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-[#041a49] font-bold rounded-lg transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function AccountList({ accounts, selectedId, onSelect }) {
  return (
    <div className="divide-y divide-slate-100">
      {accounts.map((account) => (
        <button key={account.id} type="button" onClick={() => onSelect(account.id)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#041a49]">{account.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {account.bank ? `${account.bank} - ` : ""}
              Account ending {account.mask}
            </p>
          </div>
          {selectedId === account.id && <Check className="h-6 w-6 flex-shrink-0 text-[#3b3dce]" />}
        </button>
      ))}
    </div>
  );
}

function AccountPickerSheet({ title, selectedId, internal, external, onSelect, onAddExternal, onClose }) {
  return (
    <BottomSheet title={title} onClose={onClose} hideBackButton={true} contentClassName="modal-scrollbar">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Internal account</p>
          <AccountList accounts={internal} selectedId={selectedId} onSelect={onSelect} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">External account</p>
          <AccountList accounts={external} selectedId={selectedId} onSelect={onSelect} />
        </div>
        <button type="button" onClick={onAddExternal} className="inline-flex items-center gap-2 text-sm font-black text-black">
          Add an external account
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </button>
      </div>
    </BottomSheet>
  );
}

function BankTile({ bank, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-20 flex-col items-center justify-center border-b border-slate-200 text-center transition hover:bg-blue-50 ${selected ? "bg-blue-50" : "bg-white"}`}>
      <Building2 className={`h-5 w-5 ${selected ? "text-[#117ACA]" : "text-slate-400"}`} />
      <span className="mt-2 text-xs font-bold text-slate-600">{bank}</span>
    </button>
  );
}

function AddExternalAccountSheet({ step, setStep, draft, setDraft, onSave, onClose, onBackToPicker }) {
  const accountsMatch = draft.accountNumber && draft.accountNumber === draft.confirmAccountNumber;
  const canSave = draft.bankName && draft.routingNumber && draft.accountNumber && accountsMatch;

  if (step === "manual") {
    return (
      <BottomSheet title="Add an external account" onClose={onClose} onBack={() => setStep("bank")} hideBackButton={true} contentClassName="modal-scrollbar">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-end justify-center gap-5 font-mono text-xl text-[#041a49]">
              <span>123456789</span>
              <span>01234567890</span>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-xs font-black text-white">
              <span className="rounded bg-[#0b48ff] px-2 py-1">Routing number</span>
              <span className="rounded bg-[#0b48ff] px-2 py-1">Account number</span>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-500">
            Before you can transfer money, verify the external account by entering its routing and account number.
          </p>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Bank name</span>
              <input value={draft.bankName} onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Routing number</span>
              <input value={draft.routingNumber} onChange={(event) => setDraft((current) => ({ ...current, routingNumber: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Account number</span>
              <input type={draft.showAccount ? "text" : "password"} value={draft.accountNumber} onChange={(event) => setDraft((current) => ({ ...current, accountNumber: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <span>Show account number</span>
              <input type="checkbox" checked={draft.showAccount} onChange={(event) => setDraft((current) => ({ ...current, showAccount: event.target.checked }))} className="h-4 w-4" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Confirm account number</span>
              <input type={draft.showAccount ? "text" : "password"} value={draft.confirmAccountNumber} onChange={(event) => setDraft((current) => ({ ...current, confirmAccountNumber: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
            {accountsMatch && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                Account numbers match
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!draft.bankName || !draft.routingNumber || !draft.accountNumber || !accountsMatch}
            onClick={() => setStep("review")}
            className="w-full rounded bg-[#0b48ff] py-3 text-sm font-black text-white transition disabled:bg-slate-200 disabled:text-slate-500"
          >
            Next
          </button>
        </div>
      </BottomSheet>
    );
  }

  if (step === "review") {
    return (
      <BottomSheet title="Add an external account" onClose={onClose} onBack={() => setStep("manual")} hideBackButton={true} contentClassName="modal-scrollbar">
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-black leading-tight text-[#07133B]">Review your account information and give your account an optional nickname</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              With account transfers you can streamline cash management by scheduling one-time or repeating payments.
            </p>
          </div>
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Bank name</span>
              <input value={draft.bankName} onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Account type</span>
              <select value={draft.accountType} onChange={(event) => setDraft((current) => ({ ...current, accountType: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]">
                <option>Checking</option>
                <option>Savings</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Purpose</span>
              <select value={draft.purpose} onChange={(event) => setDraft((current) => ({ ...current, purpose: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]">
                <option>Personal</option>
                <option>Business</option>
                <option>Savings</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-600">Account nickname (optional)</span>
              <input value={draft.nickname} onChange={(event) => setDraft((current) => ({ ...current, nickname: event.target.value }))} className="w-full border-b border-slate-300 bg-white px-1 py-2 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
            </label>
          </div>
          <button type="button" disabled={!canSave} onClick={onSave} className="w-full rounded bg-[#0b48ff] py-3 text-sm font-black text-white transition disabled:bg-slate-200 disabled:text-slate-500">
            Done
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet title="Add an external account" onClose={onClose} onBack={onBackToPicker} wide hideBackButton={true} contentClassName="modal-scrollbar">
      <div className="space-y-5">
        <p className="text-lg leading-7 text-slate-500">
          Choose your bank to add your external checking or savings account, or add it manually using your routing and account number.
        </p>
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-600">Bank name</span>
          <div className="flex items-center gap-3 border border-slate-300 px-3 py-3 bg-white rounded-lg">
            <Search className="h-5 w-5 text-slate-400" />
            <input value={draft.bankName} onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))} placeholder="Search for a bank" className="w-full bg-white text-sm font-semibold text-black outline-none" />
          </div>
        </label>
        <button type="button" disabled={!draft.bankName} onClick={() => setStep("manual")} className="w-full rounded bg-[#0b48ff] py-3 text-sm font-black text-white transition disabled:bg-slate-200 disabled:text-slate-500">
          Next
        </button>

        <div className="grid grid-cols-2 gap-x-8">
          {popularBanks.map((bank) => (
            <BankTile key={bank} bank={bank} selected={draft.bankName === bank} onClick={() => setDraft((current) => ({ ...current, bankName: bank }))} />
          ))}
        </div>

        <button type="button" onClick={() => setStep("manual")} className="mx-auto flex items-center gap-2 text-sm font-black text-black">
          <PlusCircle className="h-5 w-5" />
          Add account manually
        </button>
      </div>
    </BottomSheet>
  );
}

function ScheduleReviewSheet({ amount, fromAccount, toAccount, form, onConfirm, onClose }) {
  return (
    <BottomSheet title="Schedule this transfer?" onClose={onClose} contentClassName="modal-scrollbar">
      <div className="space-y-2 text-center">
        <div className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
          <p>Transfer from: {fromAccount.name}</p>
          <p>Transfer to: {toAccount.name}</p>
          <p>Amount: {formatCurrency(amount)}</p>
          <p>Transfer on: {form.date}</p>
          <p>Delivery method: {form.deliveryMethod}</p>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Keep in mind: You cannot cancel same-day real-time transfers.
        </p>
        <button type="button" onClick={onConfirm} className="w-full border-t border-slate-200 py-4 text-base font-black text-black">
          Yes
        </button>
        <button type="button" onClick={onClose} className="w-full border-t border-slate-200 py-4 text-base font-black text-black">
          No
        </button>
      </div>
    </BottomSheet>
  );
}

function InternationalTransferSheet({ form, accounts, onChange, onReview, onClose }) {
  const canReview =
    Number(form.amount || 0) > 0 &&
    form.beneficiary &&
    form.bankName &&
    form.swiftCode &&
    form.country &&
    form.accountNumber &&
    form.purpose;

  return (
    <BottomSheet title="International transfer" onClose={onClose} wide hideBackButton={true} contentClassName="modal-scrollbar">
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black text-[#07133B]">Send money internationally</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the recipient bank details for a transfer outside the United States.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-600">Transfer from</span>
            <select name="fromId" value={form.fromId} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]">
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ending {account.mask} - {formatCurrency(account.balance || 0)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Amount</span>
            <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Currency</span>
            <select name="currency" value={form.currency} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>MXN</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Beneficiary name</span>
            <input name="beneficiary" value={form.beneficiary} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Beneficiary bank</span>
            <input name="bankName" value={form.bankName} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">SWIFT / BIC</span>
            <input name="swiftCode" value={form.swiftCode} onChange={onChange} placeholder="Bank SWIFT code" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold uppercase text-black outline-none placeholder:text-slate-400 focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Country</span>
            <input name="country" value={form.country} onChange={onChange} placeholder="Destination country" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none placeholder:text-slate-400 focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-600">Recipient account number / IBAN</span>
            <input name="accountNumber" value={form.accountNumber} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-600">Purpose</span>
            <input name="purpose" value={form.purpose} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#117ACA]" />
          </label>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-black text-[#041a49]">Estimated fee</p>
          <p className="mt-1 text-2xl font-black text-[#07133B]">$45.00</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">International transfers may require additional verification.</p>
        </div>

        <button type="button" disabled={!canReview} onClick={onReview} className="flex w-full items-center justify-center gap-2 rounded bg-[#0b48ff] py-3 text-sm font-black text-white transition disabled:bg-slate-200 disabled:text-slate-500">
          <Send className="h-4 w-4" />
          Review international transfer
        </button>
      </div>
    </BottomSheet>
  );
}

function InternationalReviewSheet({ form, account, onBack, onConfirm, onClose }) {
  const amount = Number(form.amount || 0);
  const rows = [
    { label: "Transfer from", value: `${account.name} ending ${account.mask}` },
    { label: "Beneficiary", value: form.beneficiary },
    { label: "Bank", value: form.bankName },
    { label: "SWIFT / BIC", value: form.swiftCode },
    { label: "Country", value: form.country },
    { label: "Account / IBAN", value: form.accountNumber },
    { label: "Amount", value: `${form.currency} ${formatCurrency(amount)}` },
    { label: "Fee", value: "$45.00" },
    { label: "Purpose", value: form.purpose },
  ];

  return (
    <BottomSheet title="Review international transfer" onClose={onClose} onBack={onBack} hideBackButton={true} contentClassName="modal-scrollbar">
      <div className="space-y-4">
        <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-semibold text-slate-500">{row.label}</span>
              <span className="text-right font-bold text-[#041a49]">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold leading-5 text-slate-500">
          International transfers are reviewed before funds are released.
        </p>
        <button type="button" onClick={onConfirm} className="flex w-full items-center justify-center gap-2 rounded bg-[#0b48ff] py-3 text-sm font-black text-white">
          <Check className="h-4 w-4" />
          Submit transfer
        </button>
      </div>
    </BottomSheet>
  );
}

export default function TransferPage() {
  const [step, setStep] = useState("schedule");
  const [sheet, setSheet] = useState(null);
  const [internalAccounts, setInternalAccounts] = useState([]);
  const [externalAccounts, setExternalAccounts] = useState(externalAccountsSeed);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const [{ data: profile }, { data: accts }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", auth.user.id).single(),
        supabase.from("accounts").select("*").eq("user_id", auth.user.id).order("created_at"),
      ]);
      const mapped = (accts || []).map((a) => ({
        id: a.id, name: (a.type || "").toUpperCase(), holder: profile?.full_name || "",
        mask: (a.account_number || "").replace(/\D/g, "").slice(-4),
        balance: Number(a.balance), type: "Internal account",
      }));
      setInternalAccounts(mapped);
      if (mapped[0]) {
        setForm((f) => ({ ...f, fromId: mapped[0].id }));
        setInternationalForm((f) => ({ ...f, fromId: mapped[0].id }));
      }
    })();
  }, []);
  const [addStep, setAddStep] = useState("bank");
  const [addReturnSheet, setAddReturnSheet] = useState("to");
  const [internationalForm, setInternationalForm] = useState({
    fromId: "checking",
    amount: "2500",
    currency: "USD",
    beneficiary: "",
    bankName: "",
    swiftCode: "",
    country: "",
    accountNumber: "",
    purpose: "Personal payment",
  });
  const [draftAccount, setDraftAccount] = useState({
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    showAccount: false,
    accountType: "Checking",
    purpose: "Personal",
    nickname: "",
  });
  const [form, setForm] = useState({
    amount: "1.00",
    fromId: "checking",
    toId: "",
    date: "2026-05-26",
    deliveryMethod: "Real-time",
    memo: "",
  });

  const allAccounts = useMemo(() => [...internalAccounts, ...externalAccounts], [externalAccounts]);
  const emptyAcct = { name: "", mask: "", balance: 0, type: "Internal account" };
  const fromAccount = allAccounts.find((account) => account.id === form.fromId) || internalAccounts[0] || emptyAcct;
  const toAccount = allAccounts.find((account) => account.id === form.toId);
  const internationalFromAccount = internalAccounts.find((account) => account.id === internationalForm.fromId) || internalAccounts[0] || emptyAcct;
  const amount = Number(form.amount || 0);
  const canTransfer = amount > 0 && form.fromId && form.toId && form.fromId !== form.toId;
  const memoRemaining = 32 - form.memo.length;

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "memo" ? value.slice(0, 32) : value }));
  };

  const updateInternationalForm = (event) => {
    const { name, value } = event.target;
    setInternationalForm((current) => ({ ...current, [name]: value }));
  };

  const selectAccount = (field, accountId) => {
    setForm((current) => ({ ...current, [field]: accountId }));
    setSheet(null);
  };

  const openAddExternal = (returnSheet = "to") => {
    setAddReturnSheet(returnSheet);
    setAddStep("bank");
    setDraftAccount({
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      showAccount: false,
      accountType: "Checking",
      purpose: "Personal",
      nickname: "",
    });
    setSheet("addExternal");
  };

  const saveExternalAccount = () => {
    const newAccount = {
      id: `external-${Date.now()}`,
      name: draftAccount.nickname || draftAccount.bankName,
      bank: draftAccount.bankName,
      mask: draftAccount.accountNumber.slice(-4),
      delivery: "Real-time",
      type: "External account",
    };
    setExternalAccounts((current) => [...current, newAccount]);
    setForm((current) => ({ ...current, toId: newAccount.id }));
    setSheet(null);
  };

  const handleConfirmTransfer = async () => {
    setSubmitError("");
    const isInternal = toAccount?.type === "Internal account";
    const { error } = await supabase.rpc("make_transfer", {
      p_from: form.fromId,
      p_amount: amount,
      p_kind: isInternal ? "internal" : "external",
      p_to_account: isInternal ? form.toId : null,
      p_recipient_name: isInternal ? null : toAccount?.name,
      p_recipient_bank: isInternal ? null : toAccount?.bank,
      p_recipient_acct: isInternal ? null : toAccount?.mask,
      p_memo: form.memo || null,
    });
    if (error) {
      setSubmitError(error.message || "Transfer failed.");
      setSheet(null);
      return;
    }
    setSheet(null);
    setStep("confirmation");
  };

  const handleConfirmInternational = async () => {
    setSubmitError("");
    const { error } = await supabase.rpc("make_transfer", {
      p_from: internationalForm.fromId,
      p_amount: Number(internationalForm.amount || 0),
      p_kind: "wire",
      p_to_account: null,
      p_recipient_name: internationalForm.beneficiary,
      p_recipient_bank: internationalForm.bankName,
      p_recipient_acct: internationalForm.accountNumber,
      p_memo: internationalForm.purpose || null,
    });
    if (error) {
      setSubmitError(error.message || "Transfer failed.");
      setSheet(null);
      return;
    }
    setSheet(null);
    setStep("internationalConfirmation");
  };

  if (step === "confirmation" && toAccount) {
    return (
      <div className="min-h-screen bg-[#D6EAF8] font-sans">
        <Header />
        <main className="mx-auto flex max-w-3xl px-4 py-10">
          <section className="w-full rounded-[28px] bg-white p-8 text-center shadow-2xl shadow-slate-900/10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-11 w-11" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Transfer Completed</p>
            <h1 className="mt-3 text-3xl font-black text-[#07133B]">{formatCurrency(amount)} transfer sent</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Your transfer from {fromAccount.name} to {toAccount.name} has been completed. Confirmation TRF-74119 is available in activity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => setStep("schedule")} className="rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70]">
                Schedule another transfer
              </button>
              <Link to="/transaction" className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] transition hover:bg-white">
                View Activity
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (step === "internationalConfirmation") {
    return (
      <div className="min-h-screen bg-[#D6EAF8] font-sans">
        <Header />
        <main className="mx-auto flex max-w-3xl px-4 py-10">
          <section className="w-full rounded-[28px] bg-white p-8 text-center shadow-2xl shadow-slate-900/10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-11 w-11" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Transfer Completed</p>
            <h1 className="mt-3 text-3xl font-black text-[#07133B]">
              {internationalForm.currency} {formatCurrency(Number(internationalForm.amount || 0))} transfer sent
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Your international transfer to {internationalForm.beneficiary} has been submitted for verification. Confirmation INT-60412 is available in activity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => setStep("schedule")} className="rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70]">
                Schedule another transfer
              </button>
              <Link to="/transaction" className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] transition hover:bg-white">
                View Activity
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6EAF8] font-sans">
      <Header />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(360px,520px)_1fr] lg:px-8">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="w-16" />
            <h1 className="text-lg font-black text-[#07133B]">Schedule a Transfer</h1>
            <Link to="/dashboard" className="text-sm font-black text-black">
              Cancel
            </Link>
          </div>

          <div className="px-7 py-6">
            <label className="block text-center">
              <span className="text-sm font-semibold text-slate-400">Amount</span>
              <div className="mx-auto mt-2 flex max-w-xs items-center justify-center border-b border-slate-300">
                <span className="text-5xl font-light text-[#07133B]">$</span>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={updateForm}
                  className="w-40 bg-transparent py-1 text-center text-5xl font-light text-[#07133B] outline-none"
                />
              </div>
            </label>

            <div className="mt-7">
              <TransferRow label="Transfer from" value={`${fromAccount.name} ending ${fromAccount.mask}`} onClick={() => setSheet("from")} />
              <TransferRow label="Transfer to" value={toAccount ? `${toAccount.name} ending ${toAccount.mask}` : ""} placeholder="Choose an account" onClick={() => setSheet("to")} />
              {toAccount?.type === "External account" && (
                <TransferRow label="Delivery method" value={form.deliveryMethod} onClick={() => setSheet("delivery")} />
              )}
              <TransferRow label="Transfer on" value={form.date === "2026-05-26" ? "Today" : form.date} onClick={() => setSheet("date")} />

              <label className="block border-b border-slate-200 py-4">
                <span className="text-sm font-semibold text-slate-500">Memo</span>
                <input
                  name="memo"
                  value={form.memo}
                  onChange={updateForm}
                  placeholder="What's it for? (optional)"
                  className="mt-1 w-full bg-white text-base font-semibold text-black outline-none placeholder:text-slate-400"
                />
                <span className="mt-1 block text-xs font-semibold text-slate-400">You have {memoRemaining} of 32 characters remaining.</span>
              </label>
            </div>

         <button
          type="button"
          disabled={!canTransfer}
           onClick={() => setSheet("review")}
              className="mt-8 w-full rounded bg-blue-500 py-3 text-sm font-black text-white transition
             disabled:bg-gray-300 disabled:text-gray-600"
              >
              Transfer
          </button>
          {submitError && (
            <p className="mt-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">⚠ {submitError}</p>
          )}
          <button
            type="button"
            onClick={() => setSheet("international")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-[#117ACA] bg-white py-3 text-sm font-black text-[#041a49] transition hover:bg-blue-50"
          >
            <Globe2 className="h-4 w-4" />
            International transfer
          </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] bg-white p-6 shadow-sm border border-blue-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-6 w-6 text-[#117ACA]" />
              <div>
                <h2 className="text-lg font-black text-[#07133B]">Transfer setup</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose internal or external accounts, add a new external bank account, send international transfers, and confirm before sending.
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-[28px] bg-white p-6 shadow-sm border border-blue-100">
            <h2 className="text-base font-black text-[#07133B]">Selected source</h2>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#117ACA] to-[#0a5fa0] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{fromAccount.type}</p>
              <p className="mt-1 text-lg font-black">{fromAccount.name}</p>
              <p className="mt-4 text-3xl font-black">{formatCurrency(fromAccount.balance || 0)}</p>
              <p className="mt-1 text-xs text-white/70">Account ending {fromAccount.mask}</p>
            </div>
          </section>
        </aside>
      </main>

      {sheet === "from" && (
        <AccountPickerSheet
          title="Transfer from"
          selectedId={form.fromId}
          internal={internalAccounts}
          external={externalAccounts}
          onSelect={(accountId) => selectAccount("fromId", accountId)}
          onAddExternal={() => openAddExternal("from")}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "to" && (
        <AccountPickerSheet
          title="Transfer to"
          selectedId={form.toId}
          internal={internalAccounts.filter((account) => account.id !== form.fromId)}
          external={externalAccounts}
          onSelect={(accountId) => selectAccount("toId", accountId)}
          onAddExternal={() => openAddExternal("to")}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "delivery" && (
        <BottomSheet title="Delivery method" onClose={() => setSheet(null)}>
          <div className="divide-y divide-slate-100">
            {["Real-time", "Next business day", "Standard"].map((method) => (
              <button key={method} type="button" onClick={() => { setForm((current) => ({ ...current, deliveryMethod: method })); setSheet(null); }} className="flex w-full items-center justify-between py-4 text-left">
                <span className="font-bold text-[#041a49]">{method}</span>
                {form.deliveryMethod === method && <Check className="h-5 w-5 text-[#3b3dce]" />}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {sheet === "date" && (
        <BottomSheet title="Transfer on" onClose={() => setSheet(null)}>
          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-600">Date</span>
            <input type="date" name="date" value={form.date} onChange={updateForm} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#117ACA]" />
          </label>
          <button
  type="button"
  onClick={() => setSheet(null)}
  className="mt-5 w-full rounded bg-black py-3 text-sm font-black text-white"
>
  Done
</button>
        </BottomSheet>
      )}

      {sheet === "addExternal" && (
        <AddExternalAccountSheet
          step={addStep}
          setStep={setAddStep}
          draft={draftAccount}
          setDraft={setDraftAccount}
          onSave={saveExternalAccount}
          onClose={() => setSheet(null)}
          onBackToPicker={() => setSheet(addReturnSheet)}
        />
      )}

      {sheet === "international" && (
        <InternationalTransferSheet
          form={internationalForm}
          accounts={internalAccounts}
          onChange={updateInternationalForm}
          onReview={() => setSheet("internationalReview")}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "internationalReview" && (
        <InternationalReviewSheet
          form={internationalForm}
          account={internationalFromAccount}
          onBack={() => setSheet("international")}
          onConfirm={handleConfirmInternational}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "review" && toAccount && (
        <ScheduleReviewSheet
          amount={amount}
          fromAccount={fromAccount}
          toAccount={toAccount}
          form={form}
          onConfirm={handleConfirmTransfer}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
