"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getActiveSession, getAuthHeaders, clearStoredToken } from "@/lib/clientAuth";

type TenantMeta = {
  tenantId: string;
  tenantType: "doctor" | "hospital";
  status?: string;
  profile?: { displayName?: string; specialty?: string; photo?: string };
  business?: { clinicName?: string; phone?: string };
  seo?: { description?: string };
};

// ── Theme tokens (matches BlockEditor's dark palette) ─────────────────────────
const T = {
  shell:      "#0c0a14",
  bg:         "#110f1e",
  surface:    "#1a172b",
  input:      "#0e0c1a",
  border:     "#2d2748",
  borderMd:   "#3d3660",
  text:       "#ede9f8",
  textSub:    "#9488bc",
  textMute:   "#5a5080",
  textDim:    "#322d4a",
  accent:     "#8b5cf6",
  accentHov:  "#7c3aed",
  green:      "#10b981",
  greenBg:    "rgba(16,185,129,.1)",
  red:        "#f87171",
  shadow:     "0 1px 4px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.08)",
  shadowMd:   "0 4px 20px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.12)",
};

export default function CreatorHomePage() {
  const [tenants, setTenants]   = useState<TenantMeta[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query,   setQuery]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "doctor" | "hospital">("all");

  // Auth guard — redirect to login if no valid session
  useEffect(() => {
    const session = getActiveSession();
    if (!session) { window.location.replace("/login"); return; }
    // Non-admin tenants shouldn't be on the tenant list page — send them to their own editor
    if (session.role !== "admin") {
      window.location.replace(`/creator/${session.tenantType}/${session.tenantId}`);
    }
  }, []);

  useEffect(() => {
    fetch("/api/tenants", { headers: getAuthHeaders() })
      .then(r => {
        if (r.status === 401 || r.status === 403) { clearStoredToken(); window.location.replace("/login"); return Promise.reject(); }
        return r.json();
      })
      .then(d => setTenants(Array.isArray(d) ? d : []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tenants.filter(t => {
      if (typeFilter !== "all" && t.tenantType !== typeFilter) return false;
      if (!q) return true;
      const name = (t.profile?.displayName ?? t.tenantId).toLowerCase();
      return name.includes(q) || t.tenantId.includes(q) || (t.business?.clinicName ?? "").toLowerCase().includes(q);
    });
  }, [tenants, query, typeFilter]);

  return (
    <main style={{ minHeight:"100vh", background:T.shell, fontFamily:"'Inter',system-ui,sans-serif", color:T.text }}>

      {/* Header */}
      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:54, borderBottom:`1px solid ${T.border}`,
        background:T.surface, boxShadow:T.shadow, gap:12, flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:28, height:28, borderRadius:8,
            background:`linear-gradient(135deg,${T.accent},#a78bfa)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#fff",
          }}>S</div>
          <strong style={{ fontSize:14, letterSpacing:"-.3px" }}>Creator Studio</strong>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Link href="/creator/create-tenant" style={{
            padding:"7px 16px", background:T.accent, color:"#fff",
            textDecoration:"none", borderRadius:6, fontSize:12, fontWeight:700,
            letterSpacing:".2px",
          }}>
            + New Tenant
          </Link>
          <button
            onClick={() => { clearStoredToken(); window.location.replace("/login"); }}
            style={{
              padding:"7px 14px", background:"transparent", color:T.textSub,
              border:`1px solid ${T.borderMd}`, borderRadius:6, fontSize:12, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit", letterSpacing:".2px",
              transition:"all .15s",
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="#f87171";(e.currentTarget as HTMLButtonElement).style.borderColor="#f87171";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.textSub;(e.currentTarget as HTMLButtonElement).style.borderColor=T.borderMd;}}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>

        {/* Search + filter bar */}
        <div style={{
          display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap",
        }}>
          {/* Search */}
          <div style={{ position:"relative", flex:"1 1 260px" }}>
            <span style={{
              position:"absolute", left:11, top:"50%", transform:"translateY(-50%)",
              color:T.textMute, fontSize:14, pointerEvents:"none",
            }}>⌕</span>
            <input
              type="text" value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Search tenants…"
              style={{
                width:"100%", padding:"8px 10px 8px 30px", borderRadius:8,
                border:`1px solid ${T.borderMd}`, background:T.input,
                color:T.text, fontSize:13, outline:"none", fontFamily:"inherit",
                boxSizing:"border-box",
              }}
            />
          </div>

          {/* Type filter pills */}
          <div style={{ display:"flex", gap:6 }}>
            {(["all","doctor","hospital"] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding:"7px 14px", borderRadius:20, border:`1px solid ${typeFilter===t ? T.accent : T.borderMd}`,
                background: typeFilter===t ? `${T.accent}22` : "transparent",
                color: typeFilter===t ? T.accent : T.textSub,
                fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                textTransform:"capitalize", transition:"all .15s",
              }}>{t === "all" ? "All" : t==="doctor" ? "Doctors" : "Hospitals"}</button>
            ))}
          </div>

          <span style={{ fontSize:12, color:T.textMute, marginLeft:"auto" }}>
            {loading ? "Loading…" : `${filtered.length} tenant${filtered.length!==1?"s":""}`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:80, color:T.textMute, fontSize:13, gap:8 }}>
            <span style={{ display:"inline-block", width:14, height:14, border:`2px solid ${T.accent}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            Loading tenants…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", paddingTop:80 }}>
            <div style={{ fontSize:40, marginBottom:16, opacity:.4 }}>⊘</div>
            <p style={{ color:T.textSub, fontSize:14, margin:"0 0 20px" }}>
              {query || typeFilter!=="all" ? "No tenants match your filter" : "No tenants yet"}
            </p>
            {!query && typeFilter==="all" && (
              <Link href="/creator/create-tenant" style={{
                padding:"9px 22px", background:T.accent, color:"#fff",
                textDecoration:"none", borderRadius:6, fontSize:13, fontWeight:700,
              }}>Create your first tenant</Link>
            )}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {filtered.map(tenant => {
              const href = `/creator/${tenant.tenantType}/${tenant.tenantId}`;
              const name = tenant.profile?.displayName ?? tenant.tenantId;
              const sub  = tenant.tenantType === "doctor"
                ? tenant.profile?.specialty ?? "Doctor"
                : tenant.business?.clinicName ?? "Hospital";
              const active = (tenant.status ?? "active") === "active";
              return (
                <Link key={tenant.tenantId} href={href} style={{
                  display:"block", padding:"16px 18px",
                  background:T.surface, borderRadius:10,
                  border:`1px solid ${T.border}`, textDecoration:"none",
                  color:T.text, transition:"all .18s", boxShadow:T.shadow,
                }}
                onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor=T.accent;(e.currentTarget as HTMLAnchorElement).style.boxShadow=T.shadowMd;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor=T.border;(e.currentTarget as HTMLAnchorElement).style.boxShadow=T.shadow;}}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                    {tenant.profile?.photo ? (
                      <img src={tenant.profile.photo} alt="" style={{
                        width:44, height:44, borderRadius:"50%", objectFit:"cover",
                        border:`2px solid ${T.borderMd}`, flexShrink:0,
                      }} onError={e=>(e.currentTarget as HTMLImageElement).style.display="none"} />
                    ) : (
                      <div style={{
                        width:44, height:44, borderRadius:"50%", flexShrink:0,
                        background:`linear-gradient(135deg,${T.accent}44,${T.accent}22)`,
                        border:`2px solid ${T.accent}44`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:18, fontWeight:700, color:T.accent,
                      }}>{name[0]?.toUpperCase() ?? "?"}</div>
                    )}
                    <div style={{ minWidth:0, flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
                      <div style={{ fontSize:11, color:T.textMute, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                      <span style={{
                        fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".4px",
                        padding:"2px 7px", borderRadius:20,
                        background: active ? T.greenBg : `${T.textMute}18`,
                        color: active ? T.green : T.textMute,
                        border: `1px solid ${active ? "rgba(16,185,129,.2)" : T.border}`,
                      }}>{tenant.status ?? "active"}</span>
                      <span style={{
                        fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20,
                        background:`${T.accent}12`, color:T.accent, border:`1px solid ${T.accent}30`,
                        textTransform:"capitalize",
                      }}>{tenant.tenantType}</span>
                    </div>
                  </div>
                  {tenant.seo?.description && (
                    <p style={{ fontSize:12, color:T.textSub, margin:0, lineHeight:1.5,
                      display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                      {tenant.seo.description}
                    </p>
                  )}
                  <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <code style={{ fontSize:11, color:T.textMute, fontFamily:"'SF Mono',monospace" }}>{tenant.tenantId}</code>
                    <span style={{ fontSize:11, color:T.accent, fontWeight:600 }}>Open Editor →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
