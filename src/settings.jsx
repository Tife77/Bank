import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/onenevada.svg";

const user = {
  name: "Marcus Johnson",
  initials: "MJ",
};

const navItems = [
  { label: "Account", path: "/dashboard" },
  { label: "Cash Cheque", path: "/cheque" },
  { label: "Transfer", path: "/transfer" },
  { label: "Transaction", path: "/transaction" },
  { label: "Card", path: "/card" },
  { label: "Report Issue", path: "/report" },
];

const settingsTabs = ["Profile", "Security", "Notifications", "Privacy"];

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        enabled ? "border-[#117ACA] bg-blue-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <span className="text-sm font-bold text-[#041a49]">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-[#117ACA]" : "bg-slate-300"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function ProfileSettings() {
  const [editing, setEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [profile, setProfile] = useState({
    fullName: "Marcus Johnson",
    email: "marcus.johnson@example.com",
    address: "4527 Desert Ridge Ave, Las Vegas, NV 89101",
    phone: "(702) 555-0148",
    state: "Nevada",
    country: "United States",
    zipCode: "89101",
    ssn: "***-**-4821",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfilePicture(URL.createObjectURL(file));
  };

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#07133B]">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Manage the personal information tied to your account.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="w-fit rounded-full border border-[#117ACA] px-4 py-2 text-sm font-bold text-[#117ACA] hover:bg-blue-50"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#117ACA] text-2xl font-black text-white">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              user.initials
            )}
          </div>
          <div>
            <p className="text-sm font-black text-[#041a49]">Profile Picture</p>
            <p className="mt-1 text-sm text-slate-500">Add, change, or remove your account photo.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              editing ? "cursor-pointer bg-[#117ACA] text-white hover:bg-[#0a5fa0]" : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {profilePicture ? "Change Photo" : "Add Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!editing}
              onChange={handleProfilePictureChange}
            />
          </label>
          <button
            type="button"
            disabled={!editing || !profilePicture}
            onClick={() => setProfilePicture("")}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          { label: "Full Name", name: "fullName" },
          { label: "Email", name: "email", type: "email" },
          { label: "Address", name: "address" },
          { label: "Phone Number", name: "phone" },
          { label: "State", name: "state" },
          { label: "Country", name: "country" },
          { label: "Zip Code", name: "zipCode" },
          { label: "SSN", name: "ssn" },
        ].map((field) => (
          <label key={field.name} className="space-y-2 text-sm text-slate-700">
            <span className="font-bold">{field.label}</span>
            <input
              type={field.type || "text"}
              name={field.name}
              value={profile[field.name]}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                editing
                  ? "border-[#117ACA] bg-white text-slate-900 focus:ring-2 focus:ring-blue-100"
                  : "border-slate-200 bg-slate-50 text-[#041a49]"
              }`}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("email");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#07133B]">Password</h2>
            <p className="mt-1 text-sm text-slate-500">Change your password using your current credentials.</p>
          </div>
          <button className="w-fit rounded-full bg-[#041a49] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c2b70]">
            Update Password
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Current Password", name: "currentPassword" },
            { label: "New Password", name: "newPassword" },
            { label: "Confirm Password", name: "confirmPassword" },
          ].map((field) => (
            <label key={field.name} className="space-y-2 text-sm text-slate-700">
              <span className="font-bold">{field.label}</span>
              <input
                type="password"
                name={field.name}
                value={passwords[field.name]}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#07133B]">Two-Factor Authentication</h2>
            <p className="mt-1 text-sm text-slate-500">
              Status: <span className={twoFactorEnabled ? "font-bold text-emerald-600" : "font-bold text-red-500"}>{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled((value) => !value)}
            className={`w-fit rounded-full px-5 py-2.5 text-sm font-bold text-white ${
              twoFactorEnabled ? "bg-red-500 hover:bg-red-600" : "bg-[#117ACA] hover:bg-[#0a5fa0]"
            }`}
          >
            {twoFactorEnabled ? "Disable" : "Enable"}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-bold text-[#041a49]">Choose verification method</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Email", value: "email", detail: "marcus.johnson@example.com" },
                { label: "Phone Number", value: "phone", detail: "(702) 555-0148" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setTwoFactorMethod(method.value)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    twoFactorMethod === method.value ? "border-[#117ACA] bg-white shadow-sm" : "border-blue-100 bg-white/60"
                  }`}
                >
                  <p className="text-sm font-black text-[#041a49]">{method.label}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{method.detail}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
        <h2 className="text-xl font-black text-[#07133B]">Trusted Devices</h2>
        <p className="mt-1 text-sm text-slate-500">Devices currently trusted for faster sign in.</p>
        <div className="mt-5 divide-y divide-slate-100 rounded-3xl border border-slate-200">
          {[
            { device: "Windows Desktop", location: "Las Vegas, NV", lastUsed: "Today, 9:14 AM" },
            { device: "iPhone 15 Pro", location: "Henderson, NV", lastUsed: "May 22, 2026" },
            { device: "Chrome Browser", location: "Reno, NV", lastUsed: "May 18, 2026" },
          ].map((device) => (
            <div key={device.device} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-[#041a49]">{device.device}</p>
                <p className="text-sm text-slate-500">{device.location} • Last used {device.lastUsed}</p>
              </div>
              <button className="w-fit rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotificationSettings() {
  const [alerts, setAlerts] = useState({
    transactions: true,
    balances: true,
    security: true,
  });

  const updateAlert = (key, value) => {
    setAlerts((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="grid gap-5">
      <div className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
        <h2 className="text-xl font-black text-[#07133B]">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">Choose when and how One Nevada should contact you.</p>

        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-[#041a49]">Transaction Alerts</h3>
                <p className="mt-1 text-sm text-slate-500">Notify me when money enters or leaves my account.</p>
              </div>
              <div className="w-full sm:w-56">
                <Toggle enabled={alerts.transactions} onChange={(value) => updateAlert("transactions", value)} label={alerts.transactions ? "On" : "Off"} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#117ACA]" placeholder="Alert above amount, e.g. $500" />
              <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#117ACA]">
                <option>Email and SMS</option>
                <option>Email only</option>
                <option>SMS only</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-[#041a49]">Balance Updates</h3>
                <p className="mt-1 text-sm text-slate-500">Receive balance summaries and low-balance warnings.</p>
              </div>
              <div className="w-full sm:w-56">
                <Toggle enabled={alerts.balances} onChange={(value) => updateAlert("balances", value)} label={alerts.balances ? "On" : "Off"} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#117ACA]">
                <option>Weekly summary</option>
                <option>Daily summary</option>
                <option>Monthly summary</option>
              </select>
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#117ACA]" placeholder="Low balance threshold, e.g. $250" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-[#041a49]">Security Messages</h3>
                <p className="mt-1 text-sm text-slate-500">Get notified about sign-ins, password changes, and device activity.</p>
              </div>
              <div className="w-full sm:w-56">
                <Toggle enabled={alerts.security} onChange={(value) => updateAlert("security", value)} label={alerts.security ? "On" : "Off"} />
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#041a49]">
              Recommended: keep security messages enabled for all accounts.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySettings() {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-900/10">
      <h2 className="text-xl font-black text-[#07133B]">Privacy</h2>
      <p className="mt-1 text-sm text-slate-500">Review data sharing and marketing preferences.</p>
      <div className="mt-6 grid gap-4">
        <Toggle enabled={false} onChange={() => {}} label="Share usage data for service improvements" />
        <Toggle enabled={true} onChange={() => {}} label="Receive product and rate updates" />
        <Toggle enabled={false} onChange={() => {}} label="Allow personalized offers" />
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  const renderActiveTab = () => {
    if (activeTab === "Profile") return <ProfileSettings />;
    if (activeTab === "Security") return <SecuritySettings />;
    if (activeTab === "Notifications") return <NotificationSettings />;
    return <PrivacySettings />;
  };

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
                className="text-sm font-semibold text-[#041a49] transition-all duration-200 hover:text-[#117ACA]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link className="bg-[#041a49] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md" to="/settings">
              Settings
            </Link>
            <button className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md">
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

      <main className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#117ACA]">Preferences</p>
            <h1 className="mt-2 text-3xl font-black text-[#07133B]">Settings</h1>
            <p className="mt-2 text-sm text-slate-600">Control your profile, alerts, and account security in one place.</p>
          </div>
          <button className="w-fit rounded-full bg-[#041a49] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0c2b70]">
            Save Changes
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[24px] bg-white p-4 shadow-sm border border-blue-100 h-fit">
            {settingsTabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === item ? "bg-[#117ACA] text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-[#117ACA]"
                }`}
              >
                {item}
              </button>
            ))}
          </aside>

          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}
