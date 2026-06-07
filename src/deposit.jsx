import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  Camera,
  CheckCircle2,
  Clock3,
  FileImage,
  Info,
  Landmark,
  ShieldCheck,
  Upload,
} from "lucide-react";
import logo from "./assets/onenevada.svg";
import { usePageUser } from "./pageHelpers";

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];

const recentDeposits = [
  { id: "DEP-51029", account: "One Checking Rewards", amount: "$1,250.00", date: "May 21, 2026", status: "Accepted" },
  { id: "DEP-50981", account: "Primary Savings", amount: "$475.25", date: "May 12, 2026", status: "Accepted" },
  { id: "DEP-50844", account: "One Checking Rewards", amount: "$830.00", date: "Apr 30, 2026", status: "Hold" },
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
            <Link
              key={item.label}
              to={item.path}
              className="text-sm font-semibold text-[#041a49] transition-all duration-200 hover:text-[#117ACA]"
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

function FieldLabel({ children }) {
  return <span className="text-sm font-bold text-[#0B1C48]">{children}</span>;
}

function UploadBox({ id, label, fileName, onChange }) {
  return (
    <label htmlFor={id} className="group cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-[#117ACA] hover:bg-blue-50">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D6EAF8] text-[#117ACA]">
        {fileName ? <FileImage className="h-7 w-7" /> : <Camera className="h-7 w-7" />}
      </div>
      <p className="mt-4 text-sm font-black text-[#041a49]">{label}</p>
      <p className="mt-2 text-sm text-slate-500">{fileName || "Upload clear image"}</p>
      <input id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
}

export default function DepositPage() {
  const [step, setStep] = useState("form");
  const [frontFile, setFrontFile] = useState("");
  const [backFile, setBackFile] = useState("");
  const [idFrontFile, setIdFrontFile] = useState("");
  const [idBackFile, setIdBackFile] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    account: "",
    depositorName: "",
    routingNumber: "322484401",
    accountNumber: "",
    amount: "",
    checkNumber: "",
    payer: "",
    memo: "Mobile deposit",
  });

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("accounts").select("*").eq("user_id", auth.user.id).order("created_at");
      const mapped = (data || []).map((a) => ({
        id: a.id, name: a.type, mask: (a.account_number || "").replace(/\D/g, "").slice(-4), balance: Number(a.balance),
      }));
      setAccounts(mapped);
      if (mapped[0]) setForm((f) => ({ ...f, account: mapped[0].id, accountNumber: mapped[0].mask }));
    })();
  }, []);

  const account = accounts.find((item) => item.id === form.account) || accounts[0] || { name: "", mask: "", balance: 0 };
  const amount = Number(form.amount || 0);

  const handleSubmitDeposit = async () => {
    setSubmitError("");
    setSubmitting(true);
    const { error } = await supabase.rpc("make_deposit", {
      p_account: form.account,
      p_amount: amount,
      p_source: form.payer || "Mobile Deposit",
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || "Deposit failed.");
      return;
    }
    setStep("success");
  };
  const canSubmit =
    amount > 0 &&
    form.depositorName &&
    form.routingNumber &&
    form.accountNumber &&
    form.checkNumber &&
    frontFile &&
    backFile &&
    idFrontFile &&
    idBackFile;

  const reviewRows = useMemo(
    () => [
      { label: "Deposit To", value: `${account.name} ending ${account.mask}` },
      { label: "Name of Depositor", value: form.depositorName },
      { label: "Routing Number", value: form.routingNumber },
      { label: "Account Number", value: form.accountNumber },
      { label: "Amount", value: formatCurrency(amount) },
      { label: "Check Number", value: form.checkNumber },
      { label: "Payer", value: form.payer || "Not provided" },
      { label: "Check Front Image", value: frontFile },
      { label: "Check Back Image", value: backFile },
      { label: "ID Front Image", value: idFrontFile },
      { label: "ID Back Image", value: idBackFile },
    ],
    [account, amount, backFile, form, frontFile, idBackFile, idFrontFile]
  );

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Deposit Submitted</p>
            <h1 className="mt-3 text-3xl font-black text-[#07133B]">{formatCurrency(amount)} check received</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Your mobile check deposit was submitted for review. Confirmation DEP-51088 is now available in activity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => setStep("form")} className="rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#0c2b70]">
                Deposit Another Check
              </button>
              <Link to="/transaction" className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] hover:bg-white">
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

      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Mobile Deposit</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Deposit Check</h1>
            <p className="mt-2 text-sm text-slate-600">Deposit a paper check by uploading clear check and ID verification images.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#117ACA] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure mobile deposit
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            {step === "review" ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Review</p>
                    <h2 className="mt-2 text-2xl font-black text-[#07133B]">Confirm check deposit</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    Images ready for review
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {reviewRows.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-[#041a49]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-[#041a49]">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#117ACA]" />
                  <p>Keep the original check until the deposit has been accepted and posted to your account.</p>
                </div>

                {submitError && (
                  <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">⚠ {submitError}</div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setStep("form")} className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] transition hover:bg-slate-50">
                    Edit Deposit
                  </button>
                  <button onClick={handleSubmitDeposit} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#041a49] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70] disabled:bg-slate-300">
                    <Upload className="h-4 w-4" />
                    {submitting ? "Submitting…" : "Submit Deposit"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#07133B]">Check details</h2>
                    <p className="mt-1 text-sm text-slate-500">Enter the check information, upload both sides, and verify your ID.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <FieldLabel>Deposit to</FieldLabel>
                      <select name="account" value={form.account} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                        {accounts.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ending {item.mask} - {formatCurrency(item.balance)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Name of Depositor</FieldLabel>
                      <input type="text" name="depositorName" value={form.depositorName} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Routing number</FieldLabel>
                      <input type="text" name="routingNumber" value={form.routingNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Account number</FieldLabel>
                      <input type="text" name="accountNumber" value={form.accountNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Deposit amount</FieldLabel>
                      <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Check number</FieldLabel>
                      <input type="text" name="checkNumber" value={form.checkNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>

                    <label className="space-y-2">
                      <FieldLabel>Payer</FieldLabel>
                      <input type="text" name="payer" value={form.payer} onChange={updateForm} placeholder="Who wrote the check?" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <UploadBox id="front-check" label="Front of check" fileName={frontFile} onChange={(event) => setFrontFile(event.target.files?.[0]?.name || "")} />
                    <UploadBox id="back-check" label="Back of check" fileName={backFile} onChange={(event) => setBackFile(event.target.files?.[0]?.name || "")} />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-[#041a49]">ID verification</p>
                        <p className="mt-1 text-sm text-slate-500">Upload the front and back of a valid government-issued ID.</p>
                      </div>
                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#117ACA]">Required</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <UploadBox id="front-id" label="Front of ID" fileName={idFrontFile} onChange={(event) => setIdFrontFile(event.target.files?.[0]?.name || "")} />
                      <UploadBox id="back-id" label="Back of ID" fileName={idBackFile} onChange={(event) => setIdBackFile(event.target.files?.[0]?.name || "")} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm font-black text-[#041a49]">Endorsement reminder</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Sign the back of the check and include a mobile deposit endorsement before uploading the back image.
                    </p>
                  </div>

                  <label className="space-y-2">
                    <FieldLabel>Memo</FieldLabel>
                    <input type="text" name="memo" value={form.memo} onChange={updateForm} placeholder="Optional note" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>

                  <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-[#041a49]">Deposit amount</p>
                      <p className="mt-1 text-2xl font-black text-[#07133B]">{formatCurrency(amount)}</p>
                    </div>
                    <button disabled={!canSubmit} onClick={() => setStep("review")} className="rounded-full bg-[#041a49] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70] disabled:cursor-not-allowed disabled:bg-slate-300">
                      Review Deposit
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
              <h2 className="text-base font-black text-[#07133B]">Deposit account</h2>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#117ACA] to-[#0a5fa0] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Selected account</p>
                <p className="mt-1 text-lg font-black">{account.name}</p>
                <p className="mt-4 text-3xl font-black">{formatCurrency(account.balance)}</p>
                <p className="mt-1 text-xs text-white/70">Account ending {account.mask}</p>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#07133B]">Recent deposits</h2>
                <Clock3 className="h-5 w-5 text-[#117ACA]" />
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#041a49]">{deposit.account}</p>
                        <p className="mt-1 text-xs text-slate-500">{deposit.date} - {deposit.id}</p>
                      </div>
                      <p className="text-sm font-black text-[#07133B]">{deposit.amount}</p>
                    </div>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${deposit.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {deposit.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-[#041a49] p-5 text-white shadow-lg">
              <Landmark className="h-8 w-8 text-sky-300" />
              <h2 className="mt-4 text-base font-black">Deposit review</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Mobile check deposits may be reviewed before funds become available.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
