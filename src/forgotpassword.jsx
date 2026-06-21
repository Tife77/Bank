import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/onenevada.svg";
import { supabase } from "./supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter the email address for your account.");
      setNotice("");
      return;
    }

    setError("");
    setNotice("");
    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/signin`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message || "Unable to send reset instructions right now.");
      return;
    }

    setEmail("");
    setNotice("If that email is connected to an account, password reset instructions will be sent shortly.");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EBF5FB", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <header className="bg-[white] h-20 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-5 text-black">
          <Link to="/" className="text-2xl font-medium hover:opacity-80 text-black no-underline">
            Exit
          </Link>
          <Link to="/signin" className="text-2xl font-medium hover:opacity-80 text-black no-underline">
            Sign In
          </Link>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <div className="w-full h-14 bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="One Nevada Credit Union" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", backgroundColor: "#EBF5FB" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 460, border: "1px solid #d0e4f5" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#003865", textAlign: "center", margin: "0 0 6px" }}>
            Reset your password
          </h1>
          <p style={{ fontSize: 14, color: "#6b7f94", textAlign: "center", margin: "0 0 24px", lineHeight: 1.6 }}>
            Enter your email address and we will send instructions to help you get back into online banking.
          </p>

          <div style={{ height: 1, backgroundColor: "#e2edf6", marginBottom: 24 }} />

          {error && (
            <div style={{ backgroundColor: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {notice && (
            <div style={{ backgroundColor: "#eefaf1", border: "1px solid #bee8c8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#237a3b", marginBottom: 16, lineHeight: 1.5 }}>
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2c4a6e", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1.5px solid #c5d9ec",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#1a2e45",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#005EB8"; e.target.style.boxShadow = "0 0 0 3px rgba(0,94,184,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#c5d9ec"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor: submitting ? "#7fa8d0" : "#005EB8",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                borderRadius: 8,
                cursor: submitting ? "not-allowed" : "pointer",
                letterSpacing: 0.3,
              }}
              onMouseEnter={(e) => { if (!submitting) e.target.style.backgroundColor = "#004a96"; }}
              onMouseLeave={(e) => { if (!submitting) e.target.style.backgroundColor = "#005EB8"; }}
            >
              {submitting ? "Sending instructions..." : "Send reset instructions"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#dde9f4" }} />
            <span style={{ fontSize: 12, color: "#8fa8c0", fontWeight: 500 }}>Need help?</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#dde9f4" }} />
          </div>

          <div style={{ backgroundColor: "#f0f7ff", border: "1px solid #c8ddf4", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 12, color: "#3a5f84", lineHeight: 1.6, margin: 0 }}>
              If you forgot your username, contact support or visit a branch so your identity can be verified.
            </p>
          </div>

          <Link
            to="/signin"
            style={{ display: "block", marginTop: 18, textAlign: "center", color: "#005EB8", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Back to sign in
          </Link>
        </div>
      </main>

      <footer style={{ backgroundColor: "white", borderTop: "1px solid #dde9f4", padding: "14px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px", marginBottom: 6 }}>
          {["Privacy Policy", "Security", "Accessibility", "Contact Us"].map((l) => (
            <a key={l} href="#" style={{ fontSize: 11, color: "#005EB8", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#8fa8c0", margin: 0 }}>
          &copy; 2026 One Nevada Credit Union. Federally insured by NCUA.
        </p>
      </footer>
    </div>
  );
}
