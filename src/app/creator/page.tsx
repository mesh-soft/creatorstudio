"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { getActiveSession, getAuthHeaders, clearStoredToken } from "@/lib/clientAuth";

type TenantMeta = {
  tenantId: string;
  tenantType: "doctor" | "hospital";
  status?: string;
  role?: string;
  subscription?: { paymentStatus?: string; amount?: number; validUntil?: string; graceUntil?: string; plan?: string };
  profile?: { displayName?: string; specialty?: string; photo?: string };
  business?: { clinicName?: string; phone?: string };
  seo?: { description?: string };
};

const darkTokens = {
  shell: "#0c0a14", bg: "#110f1e", surface: "#1a172b", input: "#0e0c1a",
  border: "#2d2748", borderMd: "#3d3660", text: "#ede9f8",
  textSub: "#9488bc", textMute: "#5a5080", textDim: "#322d4a",
  accent: "#79589f", accentHov: "#6b3fa0", green: "#10b981",
  greenBg: "rgba(16,185,129,.1)", red: "#f87171",
  shadow: "0 1px 4px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.08)",
  shadowMd: "0 4px 20px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.12)",
};

const lightTokens = {
  shell: "#F5F6F7", bg: "#FFFFFF", surface: "#FFFFFF", input: "#FFFFFF",
  border: "#E4E7EB", borderMd: "#C8CBD0", text: "#1F2531",
  textSub: "#4B5563", textMute: "#68737A", textDim: "#A0ADB8",
  accent: "#79589f", accentHov: "#6b3fa0", green: "#1E8449",
  greenBg: "rgba(30,132,73,.08)", red: "#C0392B",
  shadow: "0 1px 3px rgba(0,0,0,.08),0 0 0 1px rgba(200,203,208,.5)",
  shadowMd: "0 4px 14px rgba(0,0,0,.1),0 0 0 1px rgba(200,203,208,.4)",
};

const FONT = "'Salesforce Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function CreatorHomePage() {
  const [items, setItems] = useState<TenantMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "doctor" | "hospital">("all");
  const [session, setSession] = useState<ReturnType<typeof getActiveSession>>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const limit = 10;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor-theme");
      if (saved === "light") setIsDark(false);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("editor-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  const T = isDark ? darkTokens : lightTokens;
  const debounceRef = { current: 0 as any }; // useRef equivalent for inline

  const fetchTenants = useCallback((search: string, type: string, p: number) => {
    if (!session) return;
    setLoading(true);
    const isReseller = session.role === "reseller";
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search) params.set("search", search);
    if (type && type !== "all") params.set("type", type);
    if (isReseller) params.set("resellerId", session.tenantId);

    const url = isReseller
      ? `/api/users?${params}`
      : `/api/tenants?${params}`;

    fetch(url, { headers: getAuthHeaders() })
      .then(r => {
        if (r.status === 401 || r.status === 403) { if (r.status === 403) window.location.replace("/creator"); else { clearStoredToken(); window.location.replace("/login"); } return Promise.reject(); }
        return r.json();
      })
      .then(d => {
        const list = d.users ?? d.tenants ?? [];
        setItems(list);
        setTotal(d.total ?? list.length);
        setTotalPages(d.totalPages ?? Math.ceil((d.total ?? list.length) / limit));
      })
      .catch(() => { setItems([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    const s = getActiveSession();
    if (!s) { window.location.replace("/login"); return; }
    setSession(s);
    if (s.role === "tenant" || s.role === "user") {
      window.location.replace(`/creator/${s.tenantType}/${s.tenantId}`);
    }
  }, []);

  useEffect(() => { fetchTenants(query, typeFilter, page); }, [fetchTenants, query, typeFilter, page, session]);

  const handleSearch = (val: string) => {
    setQuery(val);
    setPage(1); // Reset to first page on new search
  };

  const isReseller = session?.role === "reseller";
  const isAdmin = session?.role === "admin";

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  const subBadge = (s: TenantMeta["subscription"]) => {
    if (!s) return null;
    const status = s.paymentStatus ?? "unknown";
    const colors: Record<string, { bg: string; color: string; label: string }> = {
      paid: { bg: T.greenBg, color: T.green, label: "Paid" },
      pending: { bg: "rgba(251,191,36,.12)", color: "#fbbf24", label: "Payment Pending" },
      expired: { bg: "rgba(248,113,113,.12)", color: T.red, label: "Expired" },
    };
    const c = colors[status] ?? { bg: T.greenBg, color: T.textMute, label: status };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:600, background:c.bg, color:c.color, textTransform:"uppercase", letterSpacing:".3px" }}>
        {c.label}
      </span>
    );
  };

  return (
    <main style={{ minHeight:"100vh", background:T.shell, fontFamily:FONT, color:T.text }}>
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:54, borderBottom:`1px solid ${T.border}`, background:T.surface, boxShadow:T.shadow, gap:12, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${T.accent},#a78bfa)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>S</div>
          <strong style={{ fontSize:14, letterSpacing:"-.3px" }}>Creator Studio</strong>
          {isReseller && <span style={{ fontSize:11, color:T.textMute, background:`${T.accent}18`, padding:"2px 8px", borderRadius:10 }}>Reseller</span>}
          {isAdmin && <span style={{ fontSize:11, color:T.textMute, background:`${T.accent}18`, padding:"2px 8px", borderRadius:10 }}>Admin</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isReseller && (
            <button onClick={() => setShowCreateModal(true)} style={{ padding:"7px 16px", background:T.accent, color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:".2px" }}>
              + New Tenant
            </button>
          )}
          {isAdmin && (
            <>
              <Link href="/creator/import" style={{ padding:"7px 14px", background:"transparent", color:T.textSub, textDecoration:"none", borderRadius:6, fontSize:12, fontWeight:600, border:`1px solid ${T.borderMd}` }}>
                Import JSON
              </Link>
              <Link href="/creator/create-tenant" style={{ padding:"7px 16px", background:T.accent, color:"#fff", textDecoration:"none", borderRadius:6, fontSize:12, fontWeight:700 }}>
                + New Tenant
              </Link>
            </>
          )}
          <button onClick={() => { clearStoredToken(); window.location.replace("/login"); }}
            style={{ padding:"7px 14px", background:"transparent", color:T.textSub, border:`1px solid ${T.borderMd}`, borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
            onMouseEnter={e=>{ const el = e.currentTarget as HTMLButtonElement; el.style.color="#f87171"; el.style.borderColor="#f87171"; }}
            onMouseLeave={e=>{ const el = e.currentTarget as HTMLButtonElement; el.style.color=T.textSub; el.style.borderColor=T.borderMd; }}>
            Sign out
          </button>
          <button onClick={toggleTheme} title={isDark?"Light mode":"Dark mode"}
            style={{ padding:"7px 12px", background:"transparent", color:T.textSub, border:`1px solid ${T.borderMd}`, borderRadius:6, fontSize:13, cursor:"pointer", fontFamily:"inherit", lineHeight:1 }}>
            {isDark ? "☀" : "🌙"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
          <input placeholder="Search tenants…" value={query} onChange={e => handleSearch(e.target.value)}
            style={{ flex:1, minWidth:200, padding:"9px 14px", borderRadius:8, border:`1px solid ${T.borderMd}`, background:T.input, color:T.text, fontSize:13, outline:"none", fontFamily:"inherit", letterSpacing:".2px" }}
            onFocus={e=>e.currentTarget.style.borderColor=T.accent} onBlur={e=>e.currentTarget.style.borderColor=T.borderMd} />
          {(["all","doctor","hospital"] as const).map(t =>
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
              style={{ padding:"8px 14px", borderRadius:8, border:typeFilter===t?`1px solid ${T.accent}`:`1px solid ${T.borderMd}`, background:typeFilter===t?`${T.accent}18`:"transparent", color:typeFilter===t?T.accent:T.textSub, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize" }}>
              {t}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:T.textMute, fontSize:13 }}>Loading tenants…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <p style={{ color:T.textMute, fontSize:14, marginBottom:16 }}>No tenants found.</p>
            {isReseller && <button onClick={() => setShowCreateModal(true)} style={{ padding:"10px 24px", borderRadius:8, background:T.accent, color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Create Your First Tenant</button>}
            {isAdmin && <Link href="/creator/create-tenant" style={{ padding:"10px 24px", borderRadius:8, background:T.accent, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>Create Your First Tenant</Link>}
          </div>
        ) : (
          <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:14 }}>
            {items.map(tenant => {
              const col = tenant.tenantType === "doctor" ? "doctorSite" : "hospitalSite";
              const editUrl = `/creator/collections/${col}/~/${tenant.tenantId}/pages/home`;
              const viewUrl = `/site/${tenant.tenantId}/home`;
              const displayName = tenant.profile?.displayName ?? tenant.tenantId;
              return (
                <Link key={tenant.tenantId} href={editUrl}
                  style={{ display:"block", padding:18, background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, textDecoration:"none", color:T.text, transition:"border-color .15s, box-shadow .15s" }}
                  onMouseEnter={e=>{ const el = e.currentTarget as HTMLElement; el.style.borderColor=T.accent; el.style.boxShadow=T.shadowMd; }}
                  onMouseLeave={e=>{ const el = e.currentTarget as HTMLElement; el.style.borderColor=T.border; el.style.boxShadow="none"; }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                    {tenant.profile?.photo && <img src={tenant.profile.photo} alt="" style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />}
                    {!tenant.profile?.photo && <div style={{ width:40, height:40, borderRadius:"50%", background:`${T.accent}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏥</div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, letterSpacing:"-.2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</div>
                      <div style={{ fontSize:11, color:T.textMute, textTransform:"capitalize", marginTop:2 }}>
                        {tenant.tenantType}{tenant.profile?.specialty ? ` · ${tenant.profile.specialty}` : ""}
                      </div>
                    </div>
                    {tenant.subscription && subBadge(tenant.subscription)}
                  </div>
                  {tenant.subscription && (
                    <div style={{ display:"flex", gap:12, fontSize:11, color:T.textSub, marginBottom:10 }}>
                      <span>Until {formatDate(tenant.subscription.validUntil)}</span>
                      {tenant.subscription.amount && <span>₹{tenant.subscription.amount}</span>}
                    </div>
                  )}
                  {tenant.seo?.description && (
                    <p style={{ fontSize:11, color:T.textMute, margin:0, lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>
                      {tenant.seo.description.slice(0, 120)}{tenant.seo.description.length > 120 ? "…" : ""}
                    </p>
                  )}
                  {tenant.subscription && <SubPayBar tenantId={tenant.tenantId} sub={tenant.subscription} T={T} />}
                </Link>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:12, marginTop:24, paddingBottom:16 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${T.borderMd}`, background:"transparent", color:page<=1?T.textDim:T.textSub, fontSize:12, fontWeight:600, cursor:page<=1?"default":"pointer", fontFamily:"inherit" }}>
                ← Prev
              </button>
              <span style={{ fontSize:12, color:T.textMute }}>
                Page {page} of {totalPages} · {total} tenants
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${T.borderMd}`, background:"transparent", color:page>=totalPages?T.textDim:T.textSub, fontSize:12, fontWeight:600, cursor:page>=totalPages?"default":"pointer", fontFamily:"inherit" }}>
                Next →
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {showCreateModal && <CreateTenantModal session={session} T={T} onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); window.location.reload(); }} />}
    </main>
  );
}

function SubPayBar({ tenantId, sub, T }: { tenantId: string; sub: any; T: typeof darkTokens }) {
  const endDate = sub.graceUntil || sub.validUntil;
  if (!endDate) return null;
  const d = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const expiring = d <= 30;

  return (
    <div onClick={e => e.preventDefault()} style={{ marginTop:10, padding:"6px 10px", borderRadius:6, background: expiring ? `${T.accent}0E` : T.bg, border: expiring ? `1px solid ${T.accent}22` : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:10, color:T.textSub }}>
      <span>{expiring ? `⚠ Expires in ${d} day${d!==1?"s":""}` : `${d} days remaining`}</span>
      {expiring && <PayNowBtn tenantId={tenantId} T={T} />}
    </div>
  );
}

function PayNowBtn({ tenantId, T }: { tenantId: string; T: typeof darkTokens }) {
  return (
    <button onClick={async (e) => {
      e.preventDefault(); e.stopPropagation();
      const cookie = document.cookie.split("; ").find(r => r.startsWith("ds_auth_token="));
      const h: Record<string,string> = { "Content-Type": "application/json" };
      if (cookie) h.Authorization = `Bearer ${cookie.split("=")[1]}`;
      const r = await fetch("/api/payment/create", { method:"POST", headers:h, body:JSON.stringify({ tenantId }) });
      const d = await r.json();
      if (!d.ok || !d.orderId) return;
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => {
        new (window as any).Razorpay({
          key: d.key, amount: d.amount, currency: d.currency, name:"Subscription Renewal", order_id: d.orderId,
          handler: async (resp: any) => {
            await fetch("/api/payment/verify", { method:"POST", headers:h, body:JSON.stringify({ tenantId, razorpayPaymentId: resp.razorpay_payment_id, razorpayOrderId: resp.razorpay_order_id, razorpaySignature: resp.razorpay_signature }) });
            window.location.reload();
          },
          theme: { color: "#79589f" },
        }).open();
      };
      document.body.appendChild(s);
    }}
      style={{ padding:"3px 8px", borderRadius:3, border:"none", background:T.accent, color:"#fff", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
      Pay to extend →
    </button>
  );
}

function CreateTenantModal({ session, T, onClose, onCreated }: { session: any; T: typeof darkTokens; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [price, setPrice] = useState(2999);
  const [discount, setDiscount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const passValid = password.length >= 8 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const finalPrice = Math.max(999, Math.round(price * (1 - discount / 100)));
  const tenantIdPreview = name.trim()
    ? name.toLowerCase().replace(/\bdr\.?\s*/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").slice(0, 45) || "new-site"
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users/create-tenant", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), mobile: mobile.trim(), password, plan:"monthly", originalPrice: price, discountPercent: discount, tenantType: "doctor" }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Failed"); return; }
      onCreated();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.7)", padding:24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:14, border:`1px solid ${T.border}`, padding:"28px", maxWidth:460, width:"100%", boxShadow:T.shadowMd }}>
        <h2 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:T.text }}>Create New Tenant</h2>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Doctor / Clinic Name</label>
            <input placeholder="Dr. Amit Sharma" value={name} onChange={e => setName(e.target.value)} required style={inputS(T)} />
            {tenantIdPreview && <div style={{ marginTop:4, fontSize:11, color:T.textMute }}>Site ID: <strong style={{ color:T.textSub }}>{tenantIdPreview}</strong> (auto-generated)</div>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Email</label><input type="email" placeholder="tenant@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputS(T)} /></div>
            <div><label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Mobile</label><input type="tel" placeholder="+91 98765 43210" value={mobile} onChange={e => setMobile(e.target.value)} required style={inputS(T)} /></div>
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Password</label>
            <input type="password" placeholder="8+ characters, 1 special char" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputS(T)} />
            {password && (
              <div style={{ marginTop:4, fontSize:11, color: passValid ? T.green : T.red }}>
                {password.length<8?"• At least 8 characters":"✓ 8+ characters"}
                <span style={{ marginLeft:12 }}>{!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)?"• 1 special character":"✓ Special character"}</span>
              </div>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Yearly Price ₹ (incl. tax)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={999} style={inputS(T)} /></div>
            <div><label style={{ display:"block", fontSize:12, fontWeight:600, color:T.textSub, marginBottom:4 }}>Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0} max={100} style={inputS(T)} /></div>
          </div>
          <div style={{ padding:"10px 14px", background:`${T.accent}12`, borderRadius:8, fontSize:12, color:T.textSub, textAlign:"center" }}>
            Final price: <strong style={{ color:T.accent, fontSize:15 }}>₹{finalPrice}/year</strong> · Trial: 5 days + 10 days grace
          </div>
          {error && <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(248,113,113,.1)", color:T.red, fontSize:12 }}>{error}</div>}
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:"10px 0", borderRadius:8, border:`1px solid ${T.borderMd}`, background:"transparent", color:T.textSub, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={loading || !passValid} style={{ flex:2, padding:"10px 0", borderRadius:8, border:"none", background: loading||!passValid ? T.borderMd : T.accent, color:"#fff", fontSize:13, fontWeight:700, cursor: loading||!passValid ? "not-allowed" : "pointer", fontFamily:"inherit" }}>{loading ? "Creating…" : "Create Tenant"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function inputS(T: typeof darkTokens): React.CSSProperties {
  return { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${T.borderMd}`, background:T.input, color:T.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
}
