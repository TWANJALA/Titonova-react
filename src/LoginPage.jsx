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
      "linear-gradient(145deg,#03091d 0%, #081938 45%, #0a274d 100%)",
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
    background: "radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0) 68%)",
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
    background: "radial-gradient(circle, rgba(45,212,191,0.24) 0%, rgba(45,212,191,0) 68%)",
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
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "24px",
    padding: "clamp(16px, 2.6vw, 28px)",
    background:
      "linear-gradient(180deg, rgba(9,18,42,0.78), rgba(9,20,46,0.58))",
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 56px rgba(3, 6, 18, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    display: "grid",
    alignContent: "center",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(45,212,191,0.45)",
    color: "#63f5b4",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    borderRadius: "999px",
    padding: "7px 12px",
    marginBottom: "14px",
    background: "rgba(7,16,38,0.75)",
    boxShadow: "0 10px 22px rgba(6, 13, 30, 0.32)",
    width: "fit-content",
  },
  heroTitle: {
    margin: "0 0 12px",
    color: "#39df82",
    fontFamily: "'Sora', 'Space Grotesk', 'Avenir Next', sans-serif",
    fontSize: "clamp(28px, 4vw, 52px)",
    lineHeight: 1.04,
    letterSpacing: "-0.04em",
    fontWeight: 800,
    textShadow: "0 10px 34px rgba(57, 223, 130, 0.2)",
  },
  heroSubtitle: {
    margin: 0,
    color: "#c8d8ef",
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
    border: "1px solid rgba(99,245,180,0.28)",
    background: "linear-gradient(160deg, rgba(11,28,56,0.88), rgba(10,20,44,0.92))",
    padding: "13px",
    display: "grid",
    gap: "6px",
  },
  heroHighlightTitle: {
    color: "#9cfed0",
    fontFamily: "'Sora', 'Space Grotesk', sans-serif",
    fontSize: "13px",
    lineHeight: 1.3,
  },
  heroHighlightText: {
    color: "#d5e3f8",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  card: {
    width: "100%",
    borderRadius: "24px",
    border: "2px solid rgba(76,117,168,0.58)",
    background: "linear-gradient(180deg, rgba(8,24,58,0.74), rgba(11,34,74,0.58))",
    padding: "clamp(16px, 2.4vw, 24px)",
    display: "grid",
    gap: "10px",
    boxShadow: "0 24px 56px rgba(3, 6, 18, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
  },
  title: {
    margin: 0,
    color: "#39df82",
    fontSize: "clamp(26px, 3vw, 34px)",
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    fontFamily: "'Sora', 'Space Grotesk', 'Avenir Next', sans-serif",
    fontWeight: 800,
  },
  subtitle: { margin: 0, color: "#c8d8ef", fontSize: "14px", lineHeight: 1.55 },
  modeRow: { display: "flex", gap: "8px", marginTop: "4px" },
  mode: {
    background: "rgba(15,23,42,0.72)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: "999px",
    padding: "7px 13px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modeActive: {
    background: "#1d4ed8",
    color: "#fff",
    border: "1px solid #3b82f6",
    borderRadius: "999px",
    padding: "7px 13px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "none",
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.4)",
    background: "rgba(10,28,66,0.95)",
    color: "#d8e5ff",
    fontSize: "14px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  primary: {
    background: "linear-gradient(180deg,#2f66ff 0%, #2855d8 100%)",
    color: "white",
    border: "1px solid rgba(129,161,255,0.65)",
    borderRadius: "12px",
    padding: "11px 12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "none",
  },
  secondary: {
    background: "rgba(15,23,42,0.7)",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: "12px",
    padding: "9px 10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionTitle: { color: "#dbeafe", fontSize: "13px", letterSpacing: "0.02em" },
  divider: { height: "1px", background: "rgba(148,163,184,0.35)", margin: "4px 0" },
  ok: { margin: 0, color: "#86efac", fontSize: "13px" },
  err: { margin: 0, color: "#fca5a5", fontSize: "13px" },
};
