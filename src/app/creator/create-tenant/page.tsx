"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Token palette (Heroku/violet) ──────────────────────────────────────────
const T = {
  shell:     "#0c0a14",
  bg:        "#110f1e",
  surface:   "#1a172b",
  surface2:  "#211d33",
  input:     "#0e0c1a",
  border:    "#2d2748",
  borderMd:  "#3d3660",
  borderFocus:"#8b5cf6",
  text:      "#ede9f8",
  textSub:   "#9488bc",
  textMute:  "#5a5080",
  accent:    "#8b5cf6",
  accentHov: "#7c3aed",
  green:     "#10b981",
  red:       "#f87171",
  shadow:    "0 1px 4px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.08)",
  shadowMd:  "0 4px 20px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.12)",
};

const styleOptions = [
  { id:"doctor-teal-clean",     label:"Clinical Emerald",   primary:"#0D9488", bg:"#FAFAFA", desc:"Clean & professional" },
  { id:"doctor-premium-warm",   label:"Warm Patient-Centric",primary:"#7C2D12",bg:"#FFFBF0", desc:"Warm & approachable" },
  { id:"doctor-derma-minimal",  label:"Minimalist Aesthetic",primary:"#BE185D",bg:"#FFFFFF", desc:"Sleek & modern" },
  { id:"doctor-slate-precision",label:"Modern Specialist",  primary:"#334155", bg:"#F8FAFC", desc:"Corporate & precise" },
  { id:"doctor-bright-child",   label:"Pediatric Playful",  primary:"#2563EB", bg:"#F8FAFC", desc:"Friendly & bright" },
  { id:"hospital-blue-modern",  label:"Trusted Institution",primary:"#1E40AF", bg:"#F0F9FF", desc:"Authoritative & calm" },
  { id:"hospital-green-trust",  label:"Wellness & Recovery",primary:"#065F46", bg:"#F0FDF4", desc:"Fresh & hopeful" },
  { id:"hospital-red-emergency",label:"Emergency Response", primary:"#991B1B", bg:"#FFF1F2", desc:"Urgent & bold" },
  { id:"hospital-community-soft",label:"Friendly Local Clinic",primary:"#6D28D9",bg:"#F5F3FF",desc:"Warm & accessible"},
];

type Step = 1 | 2 | 3 | 4;
type TenantType = "doctor" | "hospital";

interface FormData {
  // Step 1
  type:        TenantType;
  name:        string;
  slug:        string;
  plan:        "free" | "basic" | "pro";
  // Step 2 – contact
  phone:       string;
  whatsapp:    string;
  email:       string;
  website:     string;
  // Step 3 – profile
  clinicName:       string;
  specialty:        string;
  degrees:          string;
  experienceYears:  string;
  address:          string;
  established:      string;
  beds:             string;
  // Step 4 – theme
  styleId:     string;
}

const STEPS: { label: string; sub: string }[] = [
  { label:"Basics",   sub:"Type & identity" },
  { label:"Contact",  sub:"How patients reach you" },
  { label:"Details",  sub:"Profile & location" },
  { label:"Theme",    sub:"Look & feel" },
];

export default function CreateTenantPage() {
  const router = useRouter();
  const [step,    setStep]    = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState<FormData>({
    type:"doctor", name:"", slug:"", plan:"free",
    phone:"", whatsapp:"", email:"", website:"",
    clinicName:"", specialty:"", degrees:"MBBS, MD", experienceYears:"10",
    address:"", established:"", beds:"",
    styleId:"doctor-teal-clean",
  });

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const generateSlug = (n: string) =>
    n.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/[-_]{2,}/g, "-")        // collapse consecutive separators
      .replace(/^[-_]+|[-_]+$/g, "")   // strip leading/trailing separators
      .slice(0, 50);

  const handleNameChange = (v: string) => {
    set("name", v);
    if (!form.slug || form.slug === generateSlug(form.name)) set("slug", generateSlug(v));
  };

  const handleTypeChange = (t: TenantType) => {
    set("type", t);
    // Switch to a relevant style default
    set("styleId", t === "doctor" ? "doctor-teal-clean" : "hospital-blue-modern");
  };

  const canProceed = useCallback((): boolean => {
    if (step === 1) return form.name.trim().length > 0 && /^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/.test(form.slug);
    if (step === 2) return form.phone.trim().length > 0 && form.email.trim().length > 0;
    if (step === 3) return form.address.trim().length > 0;
    return true;
  }, [step, form]);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/create-tenant", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          type:   form.type,
          name:   form.name,
          slug:   form.slug,
          plan:   form.plan,
          // enrich defaults written by the API
          overrides: {
            phone:          form.phone,
            whatsapp:       form.whatsapp || form.phone.replace(/\s/g,""),
            email:          form.email,
            website:        form.website,
            clinicName:     form.clinicName || form.name + (form.type==="doctor" ? " Clinic" : ""),
            specialty:      form.specialty,
            degrees:        form.degrees.split(",").map(s=>s.trim()).filter(Boolean),
            experienceYears:Number(form.experienceYears) || 10,
            address:        form.address,
            established:    form.established,
            beds:           form.beds,
            styleId:        form.styleId,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tenant");
      router.push(`/creator/${form.type}/${form.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally { setLoading(false); }
  };

  // ── Field helper ─────────────────────────────────────────────────────────
  const Field = ({ label, id, value, onChange, placeholder, type = "text", required = false, hint }:
    { label:string; id:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; required?:boolean; hint?:string }) => (
    <div>
      <label htmlFor={id} style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:".6px", marginBottom:5 }}>
        {label}{required && <span style={{ color:T.accent }}> *</span>}
      </label>
      <input id={id} type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"10px 12px", borderRadius:7,
          border:`1px solid ${T.borderMd}`, background:T.input,
          color:T.text, fontSize:13, outline:"none", fontFamily:"inherit",
          boxSizing:"border-box", transition:"border-color .15s",
        }}
        onFocus={e=>(e.target.style.borderColor=T.borderFocus)}
        onBlur={e=>(e.target.style.borderColor=T.borderMd)}
      />
      {hint && <p style={{ margin:"4px 0 0", fontSize:11, color:T.textMute }}>{hint}</p>}
    </div>
  );

  const Textarea = ({ label, id, value, onChange, placeholder, rows = 3 }:
    { label:string; id:string; value:string; onChange:(v:string)=>void; placeholder?:string; rows?:number }) => (
    <div>
      <label htmlFor={id} style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:".6px", marginBottom:5 }}>
        {label}
      </label>
      <textarea id={id} value={value} onChange={e=>onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{
          width:"100%", padding:"10px 12px", borderRadius:7,
          border:`1px solid ${T.borderMd}`, background:T.input,
          color:T.text, fontSize:13, outline:"none", fontFamily:"inherit",
          boxSizing:"border-box", resize:"vertical", lineHeight:1.6,
          transition:"border-color .15s",
        }}
        onFocus={e=>(e.target.style.borderColor=T.borderFocus)}
        onBlur={e=>(e.target.style.borderColor=T.borderMd)}
      />
    </div>
  );

  const planOptions: { v: "free"|"basic"|"pro"; l: string; price: string; features: string[] }[] = [
    { v:"free",  l:"Free",  price:"₹0/mo",    features:["1 page","Basic blocks","Surge deploy"] },
    { v:"basic", l:"Basic", price:"₹499/mo",  features:["5 pages","All blocks","Custom domain","Analytics"] },
    { v:"pro",   l:"Pro",   price:"₹1499/mo", features:["Unlimited pages","Priority support","SEO tools","Multi-user"] },
  ];

  // ── Step content ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Type */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:".6px", marginBottom:10 }}>
              Tenant Type <span style={{ color:T.accent }}>*</span>
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {(["doctor","hospital"] as TenantType[]).map(t => (
                <button key={t} type="button" onClick={()=>handleTypeChange(t)} style={{
                  padding:"16px 20px", borderRadius:8,
                  border:`2px solid ${form.type===t ? T.accent : T.borderMd}`,
                  background: form.type===t ? `${T.accent}18` : T.surface2,
                  color: form.type===t ? T.accent : T.textSub,
                  cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit",
                  display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4, transition:"all .15s",
                }}>
                  <span style={{ fontSize:22 }}>{t==="doctor" ? "👨‍⚕️" : "🏥"}</span>
                  <span>{t==="doctor" ? "Doctor / Clinic" : "Hospital"}</span>
                  <span style={{ fontSize:11, fontWeight:400, color:T.textMute }}>
                    {t==="doctor" ? "Individual practitioner or small clinic" : "Multi-department healthcare facility"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Full Name" id="name" value={form.name} onChange={handleNameChange}
            placeholder={form.type==="doctor" ? "Dr. Naveen Kumar" : "City Care Hospital"} required />

          <div>
            <Field label="URL Slug" id="slug" value={form.slug} onChange={v=>set("slug",v)}
              placeholder="dr-naveen-kumar" required
              hint={`Site URL: ${form.slug || "your-slug"}.surge.sh`} />
            {form.slug && !/^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/.test(form.slug) && (
              <p style={{ margin:"4px 0 0", fontSize:11, color:T.red }}>Must start and end with a letter or number · only lowercase, hyphens, underscores · max 50 characters</p>
            )}
          </div>

          {/* Plan */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSub, textTransform:"uppercase", letterSpacing:".6px", marginBottom:10 }}>
              Subscription Plan
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {planOptions.map(p => (
                <button key={p.v} type="button" onClick={()=>set("plan",p.v)} style={{
                  padding:"14px 12px", borderRadius:8, textAlign:"left",
                  border:`2px solid ${form.plan===p.v ? T.accent : T.borderMd}`,
                  background: form.plan===p.v ? `${T.accent}15` : T.surface2,
                  color: T.text, cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
                }}>
                  <div style={{ fontWeight:700, fontSize:14, color: form.plan===p.v ? T.accent : T.text, marginBottom:2 }}>{p.l}</div>
                  <div style={{ fontSize:13, color:T.accent, fontWeight:600, marginBottom:8 }}>{p.price}</div>
                  {p.features.map(f => <div key={f} style={{ fontSize:11, color:T.textMute, marginBottom:2 }}>· {f}</div>)}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <p style={{ margin:0, fontSize:13, color:T.textMute }}>
            How patients and visitors can contact {form.name || "this tenant"}.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Phone Number" id="phone" value={form.phone} onChange={v=>set("phone",v)}
              placeholder="+91 98765 43210" type="tel" required hint="Shown in header/footer" />
            <Field label="WhatsApp Number" id="whatsapp" value={form.whatsapp} onChange={v=>set("whatsapp",v)}
              placeholder="+919876543210" hint="With country code, no spaces" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Email Address" id="email" value={form.email} onChange={v=>set("email",v)}
              placeholder="clinic@example.com" type="email" required />
            <Field label="Website (optional)" id="website" value={form.website} onChange={v=>set("website",v)}
              placeholder="https://existing-website.com" />
          </div>
          <div style={{ padding:"12px 16px", borderRadius:8, background:`${T.accent}10`, border:`1px solid ${T.accent}22`, fontSize:12, color:T.textSub, lineHeight:1.6 }}>
            💡 These will be pre-filled in the CTA and footer blocks. You can always update them later in Site Settings.
          </div>
        </div>
      );

      case 3: return form.type === "doctor" ? (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <p style={{ margin:0, fontSize:13, color:T.textMute }}>
            Profile and clinic information. Used across multiple blocks by default.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Clinic Name" id="clinicName" value={form.clinicName} onChange={v=>set("clinicName",v)}
              placeholder={form.name ? form.name + " Clinic" : "Sunrise Health Clinic"} />
            <Field label="Medical Specialty" id="specialty" value={form.specialty} onChange={v=>set("specialty",v)}
              placeholder="General Physician" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Degrees / Qualifications" id="degrees" value={form.degrees} onChange={v=>set("degrees",v)}
              placeholder="MBBS, MD" hint="Comma-separated" />
            <Field label="Years of Experience" id="experienceYears" value={form.experienceYears} onChange={v=>set("experienceYears",v)}
              placeholder="10" type="number" />
          </div>
          <Textarea label="Clinic / Practice Address" id="address" value={form.address} onChange={v=>set("address",v)}
            placeholder={"123 Main Road, Near City Hospital\nNew Delhi - 110001"} rows={3} />
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <p style={{ margin:0, fontSize:13, color:T.textMute }}>Hospital profile and facility information.</p>
          <Field label="Hospital / Facility Name" id="clinicName" value={form.clinicName} onChange={v=>set("clinicName",v)}
            placeholder={form.name || "City Care Hospital"} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Year Established" id="established" value={form.established} onChange={v=>set("established",v)}
              placeholder="2005" type="number" />
            <Field label="Number of Beds" id="beds" value={form.beds} onChange={v=>set("beds",v)}
              placeholder="200+" />
          </div>
          <Textarea label="Hospital Address" id="address" value={form.address} onChange={v=>set("address",v)}
            placeholder={"456 Hospital Road, Medical City\nMumbai - 400001"} rows={3} />
        </div>
      );

      case 4: return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <p style={{ margin:0, fontSize:13, color:T.textMute }}>
            Pick a visual style for the initial site. You can customise every color and font later.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
            {styleOptions.filter(s => form.type==="doctor" ? s.id.startsWith("doctor") : s.id.startsWith("hospital")).map(s => (
              <button key={s.id} type="button" onClick={()=>set("styleId",s.id)} style={{
                borderRadius:10, border:`2px solid ${form.styleId===s.id ? T.accent : T.borderMd}`,
                background: form.styleId===s.id ? `${T.accent}12` : T.surface2,
                cursor:"pointer", padding:0, overflow:"hidden", transition:"all .15s",
                boxShadow: form.styleId===s.id ? `0 0 0 3px ${T.accent}30` : "none",
              }}>
                {/* Color preview swatch */}
                <div style={{ height:54, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"0 12px" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:s.primary, boxShadow:"0 2px 8px rgba(0,0,0,.15)" }} />
                  <div style={{ flex:1, height:6, borderRadius:3, background:s.primary, opacity:.3 }} />
                  <div style={{ width:10, height:10, borderRadius:3, background:s.primary, opacity:.6 }} />
                </div>
                <div style={{ padding:"10px 12px", textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, color: form.styleId===s.id ? T.accent : T.text, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:T.textMute }}>{s.desc}</div>
                </div>
                {form.styleId===s.id && (
                  <div style={{ background:T.accent, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 12px", textAlign:"center" }}>Selected ✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.shell, fontFamily:"'Inter',system-ui,sans-serif", color:T.text, display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:54, borderBottom:`1px solid ${T.border}`,
        background:T.surface, boxShadow:T.shadow, flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <a href="/creator" style={{ color:T.textMute, textDecoration:"none", fontSize:12 }}>← Tenants</a>
          <span style={{ color:T.textMute, fontSize:12 }}>/</span>
          <strong style={{ fontSize:13 }}>New Tenant</strong>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{
              width:6, height:6, borderRadius:"50%",
              background: step > i+1 ? T.green : step===i+1 ? T.accent : T.borderMd,
              transition:"background .2s",
            }} />
          ))}
        </div>
      </header>

      <div style={{ flex:1, display:"flex", overflow:"auto" }}>
        {/* Sidebar steps */}
        <div style={{
          width:220, flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`,
          padding:"24px 16px", display:"flex", flexDirection:"column", gap:4,
        }}>
          {STEPS.map((s,i) => {
            const sn = (i+1) as Step;
            const done = step > sn;
            const active = step === sn;
            return (
              <button key={i} onClick={()=>{ if(done) setStep(sn); }} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                borderRadius:8, border:"none", background: active ? `${T.accent}18` : "transparent",
                color: active ? T.accent : done ? T.text : T.textMute,
                cursor: done ? "pointer" : "default", fontFamily:"inherit", textAlign:"left",
                width:"100%", transition:"all .15s",
              }}>
                <div style={{
                  width:24, height:24, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700,
                  background: done ? T.green : active ? T.accent : T.borderMd,
                  color: (done||active) ? "#fff" : T.textMute,
                  transition:"all .2s",
                }}>
                  {done ? "✓" : sn}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:active ? T.accent : T.textMute, marginTop:1 }}>{s.sub}</div>
                </div>
              </button>
            );
          })}

          {/* Summary preview */}
          {(form.name || form.slug) && (
            <div style={{ marginTop:"auto", paddingTop:20, borderTop:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, color:T.textMute, marginBottom:6, textTransform:"uppercase", letterSpacing:".5px", fontWeight:700 }}>Preview</div>
              {form.name && <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:2 }}>{form.name}</div>}
              {form.slug && <code style={{ fontSize:11, color:T.accent, fontFamily:"'SF Mono',monospace" }}>{form.slug}.surge.sh</code>}
            </div>
          )}
        </div>

        {/* Main form area */}
        <div style={{ flex:1, overflow:"auto", padding:"32px 40px", maxWidth:700 }}>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, letterSpacing:"-.3px" }}>
              {STEPS[step-1].label}
            </h1>
            <p style={{ margin:0, fontSize:13, color:T.textMute }}>{STEPS[step-1].sub}</p>
          </div>

          {error && (
            <div style={{ background:`rgba(248,113,113,.1)`, border:`1px solid rgba(248,113,113,.3)`, color:"#fca5a5", padding:"12px 16px", borderRadius:8, marginBottom:16, fontSize:13 }}>
              {error}
            </div>
          )}

          {renderStep()}

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:32, paddingTop:24, borderTop:`1px solid ${T.border}` }}>
            <button
              type="button"
              onClick={()=>{ if(step > 1) setStep(s => (s-1) as Step); else router.back(); }}
              style={{
                padding:"10px 24px", borderRadius:7, border:`1px solid ${T.borderMd}`,
                background:"transparent", color:T.textSub, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit",
              }}
            >
              {step===1 ? "← Cancel" : "← Back"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={()=>setStep(s => (s+1) as Step)}
                style={{
                  padding:"10px 28px", borderRadius:7, border:"none",
                  background: canProceed() ? T.accent : T.borderMd,
                  color:"#fff", fontSize:13, fontWeight:700,
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  fontFamily:"inherit", transition:"background .15s",
                  opacity: canProceed() ? 1 : .5,
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  padding:"10px 28px", borderRadius:7, border:"none",
                  background: loading ? T.borderMd : T.accent,
                  color:"#fff", fontSize:13, fontWeight:700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"inherit", opacity: loading ? .7 : 1,
                }}
              >
                {loading ? "Creating…" : "Create Tenant ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
