import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/onenevada.svg";
import { supabase } from "./supabaseClient";

// Landing page for the password-reset email link. Supabase parses the recovery
// token from the URL and fires a PASSWORD_RECOVERY session; here the user sets
// a new password via supabase.auth.updateUser.
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If the recovery link set a session, we're good to let them reset.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || "Could not reset your password. The link may have expired — request a new one.");
      return;
    }
    setNotice("Your password has been reset. Redirecting you to sign in…");
    await supabase.auth.signOut();
    setTimeout(() => navigate("/signin"), 1800);
  };

  const inputStyle = {
    width: "100%", padding: "11px 44px 11px 14px", border: "1.5px solid #c5d9ec",
    borderRadius: 8, fontSize: 14, color: "#1a2e45", backgroundColor: "#ffffff",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EBF5FB", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <header className="bg-[white] h-20 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-5 text-black">
          <Link to="/" className="text-2xl font-medium hover:opacity-80 text-black no-underline">Exit</Link>
          <Link to="/signin" className="text-2xl font-medium hover:opacity-80 text-black no-underline">Sign In</Link>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <div className="w-full h-14 bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="One Nevada Credit Union" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 460, border: "1px solid #d0e4f5" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#003865", textAlign: "center", margin: "0 0 6px" }}>
            Choose a new password
          </h1>
          <p style={{ fontSize: 14, color: "#6b7f94", textAlign: "center", margin: "0 0 24px", lineHeight: 1.6 }}>
            Enter a new password for your One Nevada online banking account.
          </p>

          <div style={{ height: 1, backgroundColor: "#e2edf6", marginBottom: 24 }} />

          {!ready && !notice && (
            <div style={{ backgroundColor: "#fff8ec", border: "1px solid #f6e0b8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#8a6d3b", marginBottom: 16, lineHeight: 1.5 }}>
              Open this page from the reset link in your email. If you arrived here directly, request a new link from “Forgot password”.
            </div>
          )}
          {error && (
            <div style={{ backgroundColor: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>{error}</div>
          )}
          {notice && (
            <div style={{ backgroundColor: "#eefaf1", border: "1px solid #bee8c8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#237a3b", marginBottom: 16, lineHeight: 1.5 }}>{notice}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2c4a6e", marginBottom: 6 }}>New password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" autoComplete="new-password" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7f94", fontSize: 13, fontWeight: 500 }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2c4a6e", marginBottom: 6 }}>Confirm new password</label>
              <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" autoComplete="new-password" style={{ ...inputStyle, paddingRight: 14 }} />
            </div>

            <button type="submit" disabled={submitting || !ready} style={{ width: "100%", padding: "13px", backgroundColor: (submitting || !ready) ? "#7fa8d0" : "#005EB8", color: "white", fontSize: 15, fontWeight: 700, border: "none", borderRadius: 8, cursor: (submitting || !ready) ? "not-allowed" : "pointer", letterSpacing: 0.3 }}>
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <Link to="/signin" style={{ display: "block", marginTop: 18, textAlign: "center", color: "#005EB8", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Back to sign in
          </Link>
        </div>
      </main>

      <footer style={{ backgroundColor: "white", borderTop: "1px solid #dde9f4", padding: "14px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#8fa8c0", margin: 0 }}>© 2026 One Nevada Credit Union. Federally insured by NCUA.</p>
      </footer>
    </div>
  );
}
