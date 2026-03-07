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
      <div style={styles.card}>
        <h1 style={styles.title}>TitoNova Cloud Engine</h1>
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
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "20px",
    background: "linear-gradient(145deg,#03091d 0%, #081938 45%, #0a274d 100%)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    width: "min(520px, 100%)",
    borderRadius: "18px",
    border: "2px solid rgba(76,117,168,0.58)",
    background: "linear-gradient(180deg, rgba(8,24,58,0.74), rgba(11,34,74,0.58))",
    padding: "18px",
    display: "grid",
    gap: "10px",
  },
  title: { margin: 0, color: "#39df82", fontSize: "32px", fontWeight: 800 },
  subtitle: { margin: 0, color: "#c8d8ef", fontSize: "14px" },
  modeRow: { display: "flex", gap: "8px", marginTop: "4px" },
  mode: {
    background: "rgba(15,23,42,0.72)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modeActive: {
    background: "#1d4ed8",
    color: "#fff",
    border: "1px solid #3b82f6",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.4)",
    background: "rgba(10,28,66,0.95)",
    color: "#d8e5ff",
    fontSize: "14px",
  },
  primary: {
    background: "linear-gradient(180deg,#2f66ff 0%, #2855d8 100%)",
    color: "white",
    border: "1px solid rgba(129,161,255,0.65)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    background: "rgba(15,23,42,0.7)",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: "10px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionTitle: { color: "#dbeafe", fontSize: "13px" },
  divider: { height: "1px", background: "rgba(148,163,184,0.35)", margin: "2px 0" },
  ok: { margin: 0, color: "#86efac", fontSize: "13px" },
  err: { margin: 0, color: "#fca5a5", fontSize: "13px" },
};

