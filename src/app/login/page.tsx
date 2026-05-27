"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { setStoredToken, getActiveSession } from "@/lib/clientAuth";
import { usePageTheme } from "@/components/theme/usePageTheme";

const FONT = "'Salesforce Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const { T, isDark, toggle } = usePageTheme();

  useEffect(() => {
    const session = getActiveSession();
    if (!session) return;
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect) { window.location.replace(redirect); return; }
    if (session.role === "admin" || session.role === "reseller") {
      window.location.replace("/creator");
    } else {
      window.location.replace(`/creator/${session.tenantType}/${session.tenantId}`);
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
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Login failed"); return; }
      setStoredToken(data.token);
      window.location.replace(data.redirect || "/creator");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const inputS: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.borderMd}`, background: T.input,
    color: T.text, fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", transition: "border-color .15s",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: T.textSub, marginBottom: 6, letterSpacing: ".2px",
  };

  return (
    <main style={{ minHeight: "100vh", background: T.shell, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: T.text, padding: 24, transition: "background .2s" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${T.accent},${isDark ? "#a78bfa" : "#9360d4"})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 14, boxShadow: `0 4px 20px ${T.accent}44` }}>S</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", color: T.text }}>Sign In</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textSub }}>Email, mobile, or tenant ID</p>
        </div>
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "28px 28px 24px", boxShadow: T.shadow, transition: "background .2s, border-color .2s" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={lbl}>Username or Email</label>
              <input type="text" autoComplete="username" placeholder="dr-amit-sharma / amit@example.com / +91..." value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} style={inputS} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.borderMd} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} style={{ ...inputS, paddingRight: 40 }} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.borderMd} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.textMute, cursor: "pointer", fontSize: 14, padding: 2, lineHeight: 1 }} tabIndex={-1}>{showPass ? "🙈" : "👁"}</button>
              </div>
            </div>
            {error && <div style={{ background: `${T.red}18`, border: `1px solid ${T.red}40`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: T.red, lineHeight: 1.5 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ padding: "11px 0", borderRadius: 8, border: "none", background: loading ? T.borderMd : T.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: ".2px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s" }} onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.accentHov; }} onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.accent; }}>
              {loading && <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.textMute }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: T.accent, textDecoration: "none", fontWeight: 600 }}>Create a free site</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: T.textDim }}>
          <Link href="/signup/reseller" style={{ color: T.accent, textDecoration: "none", fontWeight: 500 }}>Become a reseller →</Link>
        </p>

        {/* Theme toggle */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={toggle} title={isDark ? "Switch to light" : "Switch to dark"}
            style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.borderMd}`, background: "transparent", color: T.textMute, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .12s", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {isDark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
