"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { usePageTheme } from "@/components/theme/usePageTheme";

const FONT = "'Salesforce Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function ResellerSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { T, isDark, toggle } = usePageTheme();

  const passValid = password.length >= 8 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), mobile: mobile.trim(), password, role: "reseller" }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Signup failed"); return; }
      setSuccess(true);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const inputS: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.borderMd}`, background:T.input, color:T.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:6 };

  if (success) {
    return (
      <main style={{ minHeight:"100vh", background:T.shell, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, color:T.text, padding:24, transition:"background .2s" }}>
        <div style={{ maxWidth:420, width:"100%", textAlign:"center", background:T.surface, borderRadius:14, border:`1px solid ${T.border}`, padding:"48px 32px", boxShadow:T.shadow, transition:"background .2s" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:8, color:T.text }}>Reseller Account Created</h1>
          <p style={{ fontSize:13, color:T.textSub, marginBottom:24 }}>You can now create and manage doctor/hospital sites for your clients. 15% commission on every payment.</p>
          <Link href="/login" style={{ display:"inline-block", padding:"11px 32px", borderRadius:8, background:T.accent, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight:"100vh", background:T.shell, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, color:T.text, padding:24, transition:"background .2s" }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, letterSpacing:"-.5px", color:T.text }}>Become a Reseller</h1>
          <p style={{ margin:"6px 0 0", fontSize:13, color:T.textSub }}>Create and manage sites for your medical practice clients</p>
        </div>

        <div style={{ background:T.surface, borderRadius:14, border:`1px solid ${T.border}`, padding:"28px 28px 24px", boxShadow:T.shadow, transition:"background .2s" }}>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label style={lbl}>Full Name</label><input placeholder="Rajesh Kumar" value={name} onChange={e => setName(e.target.value)} required disabled={loading} style={inputS} onFocus={e => e.currentTarget.style.borderColor=T.accent} onBlur={e => e.currentTarget.style.borderColor=T.borderMd} /></div>
            <div><label style={lbl}>Email</label><input type="email" placeholder="rajesh@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} style={inputS} onFocus={e => e.currentTarget.style.borderColor=T.accent} onBlur={e => e.currentTarget.style.borderColor=T.borderMd} /></div>
            <div><label style={lbl}>Mobile *</label><input type="tel" placeholder="+91 98765 43210" value={mobile} onChange={e => setMobile(e.target.value)} required disabled={loading} style={inputS} onFocus={e => e.currentTarget.style.borderColor=T.accent} onBlur={e => e.currentTarget.style.borderColor=T.borderMd} /></div>
            <div>
              <label style={lbl}>Password</label>
              <input type="password" placeholder="8+ characters, 1 special char" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={8} style={inputS} onFocus={e => e.currentTarget.style.borderColor=T.accent} onBlur={e => e.currentTarget.style.borderColor=T.borderMd} />
              {password && (
                <div style={{ marginTop:4, fontSize:11, color: passValid ? T.green : T.red }}>
                  {password.length<8?"• At least 8 characters":"✓ 8+ characters"}
                  <span style={{ marginLeft:12 }}>{!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)?"• 1 special character":"✓ Special character"}</span>
                </div>
              )}
            </div>
            {error && <div style={{ background:`${T.red}18`, border:`1px solid ${T.red}40`, borderRadius:8, padding:"10px 14px", fontSize:12, color:T.red }}>{error}</div>}
            <button type="submit" disabled={loading || !passValid} style={{ padding:"11px 0", borderRadius:8, border:"none", background: loading||!passValid ? T.borderMd : T.accent, color:"#fff", fontSize:13, fontWeight:700, cursor: loading||!passValid ? "not-allowed" : "pointer", fontFamily:"inherit", marginTop:4 }}>
              {loading ? "Creating…" : "Create Reseller Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:T.textMute }}>Already have an account? <Link href="/login" style={{ color:T.accent, textDecoration:"none", fontWeight:600 }}>Sign in</Link></p>
        <p style={{ textAlign:"center", marginTop:8, fontSize:11, color:T.textDim }}>Looking to create your own site? <Link href="/signup" style={{ color:T.accent, textDecoration:"none", fontWeight:500 }}>Normal signup →</Link></p>

        <div style={{ textAlign:"center", marginTop:16 }}>
          <button onClick={toggle} title={isDark?"Switch to light":"Switch to dark"}
            style={{ padding:"6px 14px", borderRadius:6, border:`1px solid ${T.borderMd}`, background:"transparent", color:T.textMute, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6 }}>
            {isDark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </main>
  );
}
