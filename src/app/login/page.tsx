"use client";

import { useState, useEffect, FormEvent } from "react";
import { setStoredToken, getActiveSession } from "@/lib/clientAuth";

// ── Theme (matches Creator Studio palette) ────────────────────────────────────
const T = {
  shell:     "#0c0a14",
  surface:   "#1a172b",
  input:     "#0e0c1a",
  border:    "#2d2748",
  borderMd:  "#3d3660",
  text:      "#ede9f8",
  textSub:   "#9488bc",
  textMute:  "#5a5080",
  accent:    "#8b5cf6",
  accentHov: "#7c3aed",
  red:       "#f87171",
  green:     "#10b981",
  shadow:    "0 8px 32px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.12)",
};

export default function LoginPage() {
  const [tenantId, setTenantId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Pre-fill tenant ID from subdomain (e.g. nitesh-garwa.studio.example.com → "nitesh-garwa")
  useEffect(() => {
    const host = window.location.hostname; // e.g. "nitesh-garwa.studio.example.com"
    const sub  = host.split(".")[0];       // first label before the first dot
    // Skip non-tenant hostnames: bare IPs, localhost, "www", "studio", "app", etc.
    const SKIP = new Set(["localhost", "www", "studio", "app", "admin", "creator"]);
    if (sub && !SKIP.has(sub) && !/^\d+$/.test(sub)) {
      setTenantId(sub);
    }
  }, []);

  // If already logged in, redirect immediately
  useEffect(() => {
    const session = getActiveSession();
    if (session) {
      if (session.role === "admin") {
        window.location.replace("/creator");
      } else {
        window.location.replace(`/creator/${session.tenantType}/${session.tenantId}`);
      }
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenantId.trim(), username: username.trim(), password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Login failed. Please check your credentials.");
        return;
      }

      setStoredToken(data.token);

      // Redirect based on role
      if (data.role === "admin") {
        window.location.replace("/creator");
      } else {
        const type = data.tenantType ?? "doctor";
        window.location.replace(`/creator/${type}/${data.tenantId}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.borderMd}`, background: T.input,
    color: T.text, fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color .15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: T.textSub, marginBottom: 6, letterSpacing: ".2px",
  };

  return (
    <main style={{
      minHeight: "100vh", background: T.shell,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif", color: T.text,
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg,${T.accent},#a78bfa)`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 14,
            boxShadow: `0 4px 20px ${T.accent}44`,
          }}>S</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>
            Creator Studio
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textSub }}>
            Sign in to manage your site
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "28px 28px 24px",
          boxShadow: T.shadow,
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Tenant ID */}
            <div>
              <label style={labelStyle}>Tenant ID</label>
              <input
                type="text" autoComplete="username"
                placeholder="e.g. nitesh-garwa"
                value={tenantId} onChange={e => setTenantId(e.target.value)}
                disabled={loading}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e  => (e.currentTarget.style.borderColor = T.borderMd)}
              />
            </div>

            {/* Username */}
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text" autoComplete="username"
                placeholder="admin"
                value={username} onChange={e => setUsername(e.target.value)}
                required disabled={loading}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e  => (e.currentTarget.style.borderColor = T.borderMd)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required disabled={loading}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                  onBlur={e  => (e.currentTarget.style.borderColor = T.borderMd)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: T.textMute, cursor: "pointer",
                    fontSize: 14, padding: 2, lineHeight: 1,
                  }}
                  tabIndex={-1}
                >{showPass ? "🙈" : "👁"}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: `${T.red}18`, border: `1px solid ${T.red}40`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: 12, color: T.red, lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                padding: "11px 0", borderRadius: 8, border: "none",
                background: loading ? T.borderMd : T.accent,
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: ".2px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .15s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = T.accentHov; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = T.accent; }}
            >
              {loading && (
                <span style={{
                  display: "inline-block", width: 12, height: 12,
                  border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                  borderRadius: "50%", animation: "spin .6s linear infinite",
                }} />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.textMute }}>
          Creator Studio · Healthcare Sites Builder
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
