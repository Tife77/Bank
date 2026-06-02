import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Globe2, Landmark, Send, ShieldCheck, Zap } from "lucide-react";
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

const accounts = [
  { id: "checking", name: "One Checking Rewards", mask: "4821", balance: 8452.37 },
  { id: "savings", name: "Primary Savings", mask: "9204", balance: 24310.0 },
];

const wireTypes = [
  { id: "domestic", title: "Domestic Wire", detail: "Send same-day funds to a U.S. bank.", icon: Landmark },
  { id: "international", title: "International Wire", detail: "Send funds to a bank outside the U.S.", icon: Globe2 },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(value || 0));

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

function FieldLabel({ children }) {
  return <span className="text-sm font-bold text-[#0B1C48]">{children}</span>;
}

export default function WireMoneyPage() {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    wireType: "domestic",
    from: "checking",
    beneficiary: "Maria Amorim",
    bankName: "Wells Fargo",
    routingNumber: "121000248",
    accountNumber: "4400291440",
    swiftCode: "",
    country: "",
    currency: "USD",
    amount: "2500",
    purpose: "Personal payment",
    memo: "Wire transfer",
    beneficiaryAddress: "",
    beneficiaryPhone: "",
    idFront: "",
    idBack: "",
    deliveryTime: "1-3 business days",
    disclaimerAccepted: false,
  });

  const account = accounts.find((item) => item.id === form.from) || accounts[0];
  const wireType = wireTypes.find((item) => item.id === form.wireType) || wireTypes[0];
  const amount = Number(form.amount || 0);
  const fee = form.wireType === "international" ? 45 : 25;
  const canSubmit =
    amount > 0 &&
    form.beneficiary &&
    form.beneficiaryPhone &&
    form.bankName &&
    form.accountNumber &&
    (form.wireType === "domestic" ? form.routingNumber : form.swiftCode && form.country && form.idFront && form.idBack);

  const reviewRows = useMemo(
    () =>
      [
        { label: "Wire Type", value: wireType.title },
        { label: "From", value: `${account.name} ending ${account.mask}` },
        { label: "Beneficiary", value: form.beneficiary },
        { label: "Beneficiary Phone", value: form.beneficiaryPhone },
        form.beneficiaryAddress ? { label: "Beneficiary Address", value: form.beneficiaryAddress } : null,
        { label: "Bank", value: form.bankName },
        { label: "Account Number", value: form.accountNumber },
        form.wireType === "domestic" ? { label: "Routing Number", value: form.routingNumber } : { label: "SWIFT / BIC", value: form.swiftCode },
        form.wireType === "international" ? { label: "Country", value: form.country } : null,
        form.wireType === "international" ? { label: "Currency", value: form.currency } : null,
        form.wireType === "international" ? { label: "ID Front", value: form.idFront } : null,
        form.wireType === "international" ? { label: "ID Back", value: form.idBack } : null,
        { label: "Amount", value: formatCurrency(amount) },
        { label: "Wire Fee", value: formatCurrency(fee) },
        { label: "Delivery Time", value: form.deliveryTime },
        { label: "Purpose", value: form.purpose },
      ].filter(Boolean),
    [account, amount, fee, form, wireType]
  );

  const updateForm = (event) => {
    const { checked, files, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : type === "file" ? files?.[0]?.name || "" : value,
    }));
  };

  const reviewWire = () => {
    setForm((current) => ({ ...current, disclaimerAccepted: false }));
    setStep("review");
  };

  const selectWireType = (wireTypeId) => {
    setStep("form");
    setForm((current) => ({
      ...current,
      wireType: wireTypeId,
      routingNumber: wireTypeId === "domestic" ? current.routingNumber || "121000248" : "",
      swiftCode: wireTypeId === "international" ? current.swiftCode : "",
      country: wireTypeId === "international" ? current.country : "",
      currency: wireTypeId === "international" ? current.currency : "USD",
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
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Wire Submitted</p>
            <h1 className="mt-3 text-3xl font-black text-[#07133B]">{formatCurrency(amount)} wire requested</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Your wire request to {form.beneficiary} has been received for verification. Confirmation WIR-60412 is available in activity.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => setStep("form")} className="rounded-full bg-[#041a49] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#0c2b70]">Send Another Wire</button>
              <Link to="/transaction" className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] hover:bg-white">View Activity</Link>
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Wire Money</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Wire Transfer</h1>
            <p className="mt-2 text-sm text-slate-600">Send domestic or international wire transfers with beneficiary bank details.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#117ACA] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Verification required
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
            {step === "review" ? (
              <>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Review</p>
                  <h2 className="mt-2 text-2xl font-black text-[#07133B]">Confirm wire details</h2>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {reviewRows.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-[#041a49]">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-[#07133B]">Wire transfer disclaimer</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Note: Payments made via wire transfer should only be sent to the bank account details as provided. You hereby verify that the information provided is accurate. Kindly understand we are not responsible for losses resulting from fraudulent or unauthorized changes to payment information.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Kindly confirm the information provided is accurate and complete.
                  </p>
                  <label className="mt-4 flex items-start gap-3 text-sm font-bold text-[#041a49]">
                    <input type="checkbox" name="disclaimerAccepted" checked={form.disclaimerAccepted} onChange={updateForm} className="mt-1 h-4 w-4 rounded border-slate-300" />
                    <span>Yes, I confirm the wire information is accurate and complete.</span>
                  </label>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setStep("form")} className="rounded-full border border-[#041a49] px-6 py-3 text-sm font-bold text-[#041a49] transition hover:bg-slate-50">Edit Wire</button>
                  <button disabled={!form.disclaimerAccepted} onClick={() => setStep("success")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#041a49] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70] disabled:cursor-not-allowed disabled:bg-slate-300">
                    <Send className="h-4 w-4" />
                    Submit Wire
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-[#07133B]">Wire details</h2>
                  <p className="mt-1 text-sm text-slate-500">Select wire type and enter beneficiary information.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {wireTypes.map((type) => {
                    const Icon = type.icon;
                    const active = form.wireType === type.id;
                    return (
                      <button key={type.id} type="button" onClick={() => selectWireType(type.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-[#117ACA] bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-[#117ACA]"}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-[#117ACA] text-white" : "bg-slate-100 text-slate-500"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-black text-[#041a49]">{type.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{type.detail}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <FieldLabel>Wire from</FieldLabel>
                    <select name="from" value={form.from} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                      {accounts.map((item) => (
                        <option key={item.id} value={item.id}>{item.name} ending {item.mask} - {formatCurrency(item.balance)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Amount</FieldLabel>
                    <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Beneficiary name</FieldLabel>
                    <input type="text" name="beneficiary" value={form.beneficiary} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Beneficiary phone number</FieldLabel>
                    <input type="tel" name="beneficiaryPhone" value={form.beneficiaryPhone} onChange={updateForm} placeholder="Phone number" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none placeholder:text-slate-400 focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <FieldLabel>Beneficiary address (optional)</FieldLabel>
                    <input type="text" name="beneficiaryAddress" value={form.beneficiaryAddress} onChange={updateForm} placeholder="Street, city, state/province, country" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none placeholder:text-slate-400 focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Beneficiary bank</FieldLabel>
                    <input type="text" name="bankName" value={form.bankName} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  {form.wireType === "domestic" ? (
                    <label className="space-y-2">
                      <FieldLabel>Routing number</FieldLabel>
                      <input type="text" name="routingNumber" value={form.routingNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                    </label>
                  ) : (
                    <>
                      <label className="space-y-2">
                        <FieldLabel>SWIFT / BIC</FieldLabel>
                        <input type="text" name="swiftCode" value={form.swiftCode} onChange={updateForm} placeholder="Bank SWIFT code" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold uppercase text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Country</FieldLabel>
                        <input type="text" name="country" value={form.country} onChange={updateForm} placeholder="Destination country" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                      </label>
                      <label className="space-y-2">
                        <FieldLabel>Currency</FieldLabel>
                        <select name="currency" value={form.currency} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                          <option>CAD</option>
                          <option>MXN</option>
                        </select>
                      </label>
                      <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div>
                          <p className="text-sm font-black text-[#07133B]">Identity verification</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">Attach a picture of your ID. Front and back are required for international wires.</p>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <label className="space-y-2">
                            <FieldLabel>ID front</FieldLabel>
                            <input type="file" name="idFront" accept="image/*" onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] file:mr-3 file:rounded-full file:border-0 file:bg-[#041a49] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" />
                            {form.idFront && <span className="block text-xs font-bold text-slate-500">{form.idFront}</span>}
                          </label>
                          <label className="space-y-2">
                            <FieldLabel>ID back</FieldLabel>
                            <input type="file" name="idBack" accept="image/*" onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] file:mr-3 file:rounded-full file:border-0 file:bg-[#041a49] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" />
                            {form.idBack && <span className="block text-xs font-bold text-slate-500">{form.idBack}</span>}
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  <label className="space-y-2">
                    <FieldLabel>Account number</FieldLabel>
                    <input type="text" name="accountNumber" value={form.accountNumber} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Purpose</FieldLabel>
                    <input type="text" name="purpose" value={form.purpose} onChange={updateForm} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#041a49] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100" />
                  </label>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#041a49]">Estimated total</p>
                    <p className="mt-1 text-2xl font-black text-[#07133B]">{formatCurrency(amount + fee)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Includes {formatCurrency(fee)} wire fee</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Delivery time: {form.deliveryTime}</p>
                  </div>
                  <button disabled={!canSubmit} onClick={reviewWire} className="rounded-full bg-[#041a49] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0c2b70] disabled:cursor-not-allowed disabled:bg-slate-300">Review Wire</button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
              <h2 className="text-base font-black text-[#07133B]">Wire source</h2>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#117ACA] to-[#0a5fa0] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Selected account</p>
                <p className="mt-1 text-lg font-black">{account.name}</p>
                <p className="mt-4 text-3xl font-black">{formatCurrency(account.balance)}</p>
                <p className="mt-1 text-xs text-white/70">Account ending {account.mask}</p>
              </div>
            </section>
            <section className="rounded-[28px] bg-[#041a49] p-5 text-white shadow-lg">
              <Zap className="h-8 w-8 text-sky-300" />
              <h2 className="mt-4 text-base font-black">Wire verification</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Wire transfers may require extra verification before funds are released.</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
