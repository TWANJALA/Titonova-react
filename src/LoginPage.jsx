import { useState } from "react";

const AUTH_TOKEN_STORAGE_KEY = "titonova_auth_token_v1";
const AUTH_USER_STORAGE_KEY = "titonova_auth_user_v1";

export default function LoginPage({ mode = "login", onAuthed }) {
  const [authMode, setAuthMode] = useState(mode === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [verifyTokenInput, setVerifyTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const call = async (path, body = {}) => {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(payload?.error || `Request failed (${response.status})`));
    return payload;
  };

  const handleAuth = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = await call(authMode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        name: authMode === "signup" ? name : undefined,
        email,
        password,
      });
      const token = String(payload?.token || "");
      const user = payload?.user;
      if (!token || !user?.id) throw new Error("Invalid auth response");
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      if (typeof onAuthed === "function") onAuthed();
    } catch (err) {
      setError(String(err?.message || "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setError("");
    setMessage("");
    try {
      const payload = await call("/api/auth/request-password-reset", { email: resetEmail || email });
      setMessage(String(payload?.message || "Password reset requested."));
      if (payload?.reset_url) setTokenInput(String(payload.reset_url).split("token=")[1] || "");
    } catch (err) {
      setError(String(err?.message || "Password reset request failed"));
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    try {
      const payload = await call("/api/auth/reset-password", {
        token: tokenInput,
        password,
      });
      setMessage(String(payload?.message || "Password reset complete."));
    } catch (err) {
      setError(String(err?.message || "Reset failed"));
    }
  };

  const handleRequestVerification = async () => {
    const token = String(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "");
    if (!token) {
      setError("Login first to request verification.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/request-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload?.error || "Verification request failed"));
      setMessage(String(payload?.message || "Verification requested."));
      if (payload?.verification_url) setVerifyTokenInput(String(payload.verification_url).split("token=")[1] || "");
    } catch (err) {
      setError(String(err?.message || "Verification request failed"));
    }
  };

  const handleVerifyEmail = async () => {
    setError("");
    setMessage("");
    try {
      const payload = await call("/api/auth/verify-email", { token: verifyTokenInput });
      setMessage(String(payload?.message || "Email verified."));
    } catch (err) {
      setError(String(err?.message || "Email verification failed"));
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.bgGlowA} />
      <div style={styles.bgGlowB} />
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <span style={styles.eyebrow}>TITONOVA CLOUD BUSINESS ENGINE</span>
          <h1 style={styles.heroTitle}>Launch Websites And Revenue Ops From One Workspace</h1>
          <p style={styles.heroSubtitle}>
            Sign in to keep every prompt, generated page, workflow, and publish operation connected in one conversion-focused platform.
          </p>
          <div style={styles.heroHighlights}>
            <article style={styles.heroHighlight}>
              <strong style={styles.heroHighlightTitle}>Unified Pipeline</strong>
              <small style={styles.heroHighlightText}>From prompt to live site without switching tools.</small>
            </article>
            <article style={styles.heroHighlight}>
              <strong style={styles.heroHighlightTitle}>Operational Stack</strong>
              <small style={styles.heroHighlightText}>Website generation plus CRM, bookings, and automation.</small>
            </article>
            <article style={styles.heroHighlight}>
              <strong style={styles.heroHighlightTitle}>Fast Iteration</strong>
              <small style={styles.heroHighlightText}>Refine copy and relaunch quickly with full context retained.</small>
            </article>
          </div>
        </section>
        <section style={styles.card}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to access your dashboard and saved projects</p>
          <div style={styles.modeRow}>
            <button style={authMode === "login" ? styles.modeActive : styles.mode} onClick={() => setAuthMode("login")}>
              Login
            </button>
            <button style={authMode === "signup" ? styles.modeActive : styles.mode} onClick={() => setAuthMode("signup")}>
              Sign Up
            </button>
          </div>
          {authMode === "signup" && (
            <input style={styles.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.primary} onClick={handleAuth} disabled={loading}>
            {loading ? "Please wait..." : authMode === "signup" ? "Create account" : "Login"}
          </button>

          <div style={styles.divider} />
          <strong style={styles.sectionTitle}>Password Reset</strong>
          <input
            style={styles.input}
            placeholder="Reset email (optional)"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button style={styles.secondary} onClick={handleRequestReset}>Request reset</button>
          <input
            style={styles.input}
            placeholder="Reset token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <button style={styles.secondary} onClick={handleResetPassword}>Apply new password</button>

          <div style={styles.divider} />
          <strong style={styles.sectionTitle}>Email Verification</strong>
          <button style={styles.secondary} onClick={handleRequestVerification}>Request verification</button>
          <input
            style={styles.input}
            placeholder="Verification token"
            value={verifyTokenInput}
            onChange={(e) => setVerifyTokenInput(e.target.value)}
          />
          <button style={styles.secondary} onClick={handleVerifyEmail}>Verify email</button>

          {message ? <p style={styles.ok}>{message}</p> : null}
          {error ? <p style={styles.err}>{error}</p> : null}
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(16px, 3vw, 34px)",
    background:
      "radial-gradient(circle at 12% 8%, rgba(244, 114, 182, 0.18), transparent 30%), radial-gradient(circle at 86% 14%, rgba(56, 189, 248, 0.22), transparent 34%), radial-gradient(circle at 48% 100%, rgba(20, 184, 166, 0.2), transparent 38%), linear-gradient(156deg, #05040c 0%, #11152c 44%, #0c2e3d 100%)",
    fontFamily: "'Manrope', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgGlowA: {
    position: "absolute",
    width: "46vw",
    height: "46vw",
    minWidth: "320px",
    minHeight: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, rgba(56, 189, 248, 0) 68%)",
    top: "-18vw",
    right: "-8vw",
    filter: "blur(12px)",
    pointerEvents: "none",
  },
  bgGlowB: {
    position: "absolute",
    width: "40vw",
    height: "40vw",
    minWidth: "280px",
    minHeight: "280px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, rgba(20, 184, 166, 0) 68%)",
    bottom: "-18vw",
    left: "-12vw",
    filter: "blur(14px)",
    pointerEvents: "none",
  },
  shell: {
    width: "min(1180px, 100%)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    alignItems: "stretch",
    position: "relative",
    zIndex: 1,
  },
  heroCard: {
    border: "1px solid rgba(125, 211, 252, 0.32)",
    borderRadius: "24px",
    padding: "clamp(16px, 2.6vw, 28px)",
    background:
      "radial-gradient(1200px 360px at 50% -16%, rgba(248, 113, 113, 0.13), rgba(248, 113, 113, 0) 58%), radial-gradient(760px 260px at 8% 96%, rgba(20, 184, 166, 0.16), rgba(20, 184, 166, 0) 60%), linear-gradient(164deg, rgba(15, 19, 36, 0.94), rgba(17, 32, 55, 0.86))",
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 56px rgba(3, 6, 18, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    display: "grid",
    alignContent: "center",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(56, 189, 248, 0.46)",
    color: "#dbeafe",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    borderRadius: "999px",
    padding: "7px 12px",
    marginBottom: "14px",
    background: "linear-gradient(135deg, rgba(11, 24, 48, 0.85), rgba(13, 42, 57, 0.72))",
    boxShadow: "0 10px 22px rgba(6, 13, 30, 0.32)",
    width: "fit-content",
  },
  heroTitle: {
    margin: "0 0 12px",
    color: "#f8fbff",
    fontFamily: "'Sora', 'Space Grotesk', 'Avenir Next', sans-serif",
    fontSize: "clamp(28px, 4vw, 52px)",
    lineHeight: 1.04,
    letterSpacing: "-0.04em",
    fontWeight: 800,
    textShadow: "0 10px 34px rgba(8, 145, 178, 0.26)",
  },
  heroSubtitle: {
    margin: 0,
    color: "#d6e4f6",
    fontSize: "15px",
    lineHeight: 1.6,
    maxWidth: "64ch",
  },
  heroHighlights: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    marginTop: "18px",
  },
  heroHighlight: {
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background:
      "radial-gradient(260px 180px at 82% -20%, rgba(56, 189, 248, 0.18), rgba(56, 189, 248, 0) 60%), linear-gradient(154deg, rgba(15, 23, 42, 0.92), rgba(20, 38, 67, 0.86))",
    padding: "13px",
    display: "grid",
    gap: "6px",
  },
  heroHighlightTitle: {
    color: "#f9fafb",
    fontFamily: "'Sora', 'Space Grotesk', sans-serif",
    fontSize: "13px",
    lineHeight: 1.3,
  },
  heroHighlightText: {
    color: "#dbe7fb",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  card: {
    width: "100%",
    borderRadius: "24px",
    border: "1px solid rgba(125, 211, 252, 0.32)",
    background:
      "radial-gradient(1200px 360px at 50% -16%, rgba(248, 113, 113, 0.1), rgba(248, 113, 113, 0) 58%), linear-gradient(160deg, rgba(10, 18, 38, 0.96), rgba(15, 29, 55, 0.9))",
    padding: "clamp(16px, 2.4vw, 24px)",
    display: "grid",
    gap: "10px",
    boxShadow: "0 24px 56px rgba(3, 6, 18, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
  },
  title: {
    margin: 0,
    color: "#f8fbff",
    fontSize: "clamp(26px, 3vw, 34px)",
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    fontFamily: "'Sora', 'Space Grotesk', 'Avenir Next', sans-serif",
    fontWeight: 800,
  },
  subtitle: { margin: 0, color: "#d6e4f6", fontSize: "14px", lineHeight: 1.55 },
  modeRow: { display: "flex", gap: "8px", marginTop: "4px" },
  mode: {
    background: "linear-gradient(140deg, rgba(15,23,42,0.88), rgba(30,41,59,0.75))",
    color: "#d8e8fd",
    border: "1px solid rgba(148,163,184,0.34)",
    borderRadius: "999px",
    padding: "7px 13px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modeActive: {
    background: "linear-gradient(135deg, #0ea5e9, #14b8a6)",
    color: "#032126",
    border: "1px solid rgba(103,232,249,0.9)",
    borderRadius: "999px",
    padding: "7px 13px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(6, 182, 212, 0.26)",
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(56, 189, 248, 0.32)",
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.82))",
    color: "#e5efff",
    fontSize: "14px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  primary: {
    background: "linear-gradient(135deg, #0ea5e9, #14b8a6)",
    color: "#032126",
    border: "1px solid rgba(103,232,249,0.9)",
    borderRadius: "12px",
    padding: "11px 12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 20px rgba(6, 182, 212, 0.24)",
  },
  secondary: {
    background: "linear-gradient(140deg, rgba(15,23,42,0.88), rgba(30,41,59,0.75))",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,0.34)",
    borderRadius: "12px",
    padding: "9px 10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionTitle: { color: "#dbeafe", fontSize: "13px", letterSpacing: "0.02em" },
  divider: { height: "1px", background: "rgba(148,163,184,0.3)", margin: "4px 0" },
  ok: { margin: 0, color: "#86efac", fontSize: "13px" },
  err: { margin: 0, color: "#fca5a5", fontSize: "13px" },
};
