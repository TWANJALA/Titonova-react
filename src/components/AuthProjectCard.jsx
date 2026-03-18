import React from "react";

export default function AuthProjectCard({
  styles,
  authEnabled = true,
  authUser,
  authMode,
  setAuthMode,
  handleLogout,
  authNameInput,
  setAuthNameInput,
  authEmailInput,
  setAuthEmailInput,
  authPasswordInput,
  setAuthPasswordInput,
  handleSignup,
  handleLogin,
  authLoading,
  userProjects,
  refreshUserProjects,
}) {
  return (
    <section style={styles.authCard}>
      <div style={styles.authHeader}>
        <strong style={styles.authTitle}>
          {authUser ? `Logged in as ${authUser.name || authUser.email}` : "Account Login Required"}
        </strong>
        {authUser ? (
          <button type="button" style={styles.authGhostButton} onClick={handleLogout}>
            Logout
          </button>
        ) : authEnabled ? (
          <div style={styles.authModeRow}>
            <button
              type="button"
              style={authMode === "login" ? styles.authModeButtonActive : styles.authModeButton}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              style={authMode === "signup" ? styles.authModeButtonActive : styles.authModeButton}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <small style={styles.authMeta}>Login and account creation are temporarily disabled.</small>
        )}
      </div>
      {!authUser && authEnabled ? (
        <div style={styles.authFormGrid}>
          {authMode === "signup" && (
            <input
              style={styles.solutionInput}
              placeholder="Full name"
              value={authNameInput}
              onChange={(event) => setAuthNameInput(event.target.value)}
            />
          )}
          <input
            style={styles.solutionInput}
            placeholder="Email"
            type="email"
            value={authEmailInput}
            onChange={(event) => setAuthEmailInput(event.target.value)}
          />
          <input
            style={styles.solutionInput}
            placeholder="Password"
            type="password"
            value={authPasswordInput}
            onChange={(event) => setAuthPasswordInput(event.target.value)}
          />
          <button
            type="button"
            style={styles.authPrimaryButton}
            onClick={authMode === "signup" ? handleSignup : handleLogin}
            disabled={authLoading}
          >
            {authLoading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Login"}
          </button>
        </div>
      ) : authUser ? (
        <div style={styles.authProjectWrap}>
          <small style={styles.authMeta}>Saved projects: {userProjects.length}</small>
          <button type="button" style={styles.authGhostButton} onClick={() => refreshUserProjects()}>
            Refresh Projects
          </button>
        </div>
      ) : (
        <small style={styles.authMeta}>Guest mode is active. Auth flows will be re-enabled later.</small>
      )}
      {!authUser && authEnabled && (
        <small style={styles.authMeta}>
          Guest mode is enabled. You can generate first, then create an account to save and publish.
        </small>
      )}
      {authUser && userProjects.length > 0 && (
        <div style={styles.authProjectList}>
          {userProjects.slice(0, 5).map((project) => (
            <small key={project.id} style={styles.authProjectItem}>
              {project.project_name}
            </small>
          ))}
        </div>
      )}
    </section>
  );
}
