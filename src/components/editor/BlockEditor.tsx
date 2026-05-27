"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo,
  useRef, useState,
} from "react";
import { SuggestionPopup } from "../SuggestionPopup";
import { type SuggestionFieldType } from "../../lib/catchphrases";
import { getActiveSession, getAuthHeaders, clearStoredToken } from "../../lib/clientAuth";
import { iconElement } from "../../lib/icons";

// ── Types ──────────────────────────────────────────────────────────────────
type JsonObject  = { [key: string]: any };
type TenantType  = "doctor" | "hospital";
type Viewport    = "mobile" | "tablet" | "desktop";
type SiteSection = "profile" | "business" | "presentation" | "header" | "footer" | "seo" | "analytics";
type PickerTab   = "media" | "stock" | "unsplash";
type Breakpoint  = "base" | "mobile" | "tablet";

// ── Option lists ───────────────────────────────────────────────────────────
const variantLabels: Record<string, string> = {
  hero:"Hero", services:"Services", timings:"Timings", gallery:"Gallery",
  faq:"FAQ", cta:"CTA", testimonials:"Testimonials", stats:"Stats",
  text:"Text", header:"Header", footer:"Footer", awards:"Awards",
  whatsapp:"WhatsApp", location:"Location", profile:"Profile",
};
const themeOptions = [
  {v:"doctor-standard",l:"Standard Practice"},{v:"doctor-profile-heavy",l:"Profile Intensive"},
  {v:"doctor-service-heavy",l:"Service Focused"},{v:"hospital-standard",l:"Hospital Standard"},
  {v:"hospital-emergency-first",l:"Emergency First"},{v:"hospital-departments",l:"Departmental"},
];
const variantPresetOptions = [
  {v:"doctor-classic",l:"Classic Medical"},{v:"doctor-editorial",l:"Editorial Showcase"},
  {v:"doctor-compact",l:"Compact Profile"},{v:"doctor-premium",l:"Premium Concierge"},
  {v:"doctor-specialist",l:"Specialist Portfolio"},{v:"hospital-standard",l:"Standard Institution"},
  {v:"hospital-emergency",l:"Emergency Priority"},{v:"hospital-specialty",l:"Specialty Center"},
  {v:"hospital-community",l:"Community Health"},{v:"hospital-network",l:"Network Directory"},
];
const styleOptions = [
  {v:"doctor-teal-clean",l:"Clinical Emerald"},{v:"doctor-premium-warm",l:"Warm Patient-Centric"},
  {v:"doctor-bright-child",l:"Pediatric Playful"},{v:"doctor-derma-minimal",l:"Minimalist Aesthetic"},
  {v:"doctor-slate-precision",l:"Modern Specialist"},{v:"hospital-blue-modern",l:"Trusted Institution"},
  {v:"hospital-green-trust",l:"Wellness & Recovery"},{v:"hospital-red-emergency",l:"High-Response Emergency"},
  {v:"hospital-indigo-specialty",l:"Corporate Specialty"},{v:"hospital-community-soft",l:"Friendly Local Clinic"},
];
// Each entry has v=value stored in JSON, l=display label, e=emoji for visual picker
const iconOptions: {v:string;l:string;e:string}[] = [
  // Medical / Clinical
  {v:"stethoscope",    l:"Stethoscope",    e:"🩺"},
  {v:"heart-pulse",    l:"Heart Pulse",    e:"💗"},
  {v:"syringe",        l:"Syringe",        e:"💉"},
  {v:"bandage",        l:"Bandage",        e:"🩹"},
  {v:"pill",           l:"Pill",           e:"💊"},
  {v:"thermometer",    l:"Thermometer",    e:"🌡️"},
  {v:"brain",          l:"Brain",          e:"🧠"},
  {v:"bone",           l:"Bone",           e:"🦴"},
  {v:"heart",          l:"Heart",          e:"❤️"},
  {v:"lungs",          l:"Lungs",          e:"🫁"},
  {v:"tooth",          l:"Tooth",          e:"🦷"},
  {v:"eye",            l:"Eye",            e:"👁️"},
  {v:"baby",           l:"Pediatrics",     e:"👶"},
  {v:"dna",            l:"Genetics",       e:"🧬"},
  {v:"microscope",     l:"Lab",            e:"🔬"},
  {v:"ambulance",      l:"Ambulance",      e:"🚑"},
  {v:"hospital",       l:"Hospital",       e:"🏥"},
  {v:"ribbon",         l:"Oncology",       e:"🎗️"},
  {v:"siren",          l:"Emergency",      e:"🚨"},
  {v:"activity",       l:"Vitals",         e:"📈"},
  // People & Trust
  {v:"users",          l:"Team",           e:"👥"},
  {v:"user-check",     l:"Doctor",         e:"🥼"},
  {v:"smile",          l:"Satisfaction",   e:"😊"},
  {v:"award",          l:"Award",          e:"🏆"},
  {v:"certificate",    l:"Certificate",    e:"📜"},
  {v:"shield",         l:"Trust",          e:"🛡️"},
  {v:"star",           l:"Rating",         e:"⭐"},
  {v:"check",          l:"Checkmark",      e:"✅"},
  {v:"lock",           l:"Privacy",        e:"🔒"},
  {v:"verified",       l:"Verified",       e:"✔️"},
  // Contact & Schedule
  {v:"calendar",       l:"Calendar",       e:"📅"},
  {v:"clock",          l:"Timings",        e:"⏰"},
  {v:"phone",          l:"Phone",          e:"📞"},
  {v:"mail",           l:"Email",          e:"✉️"},
  {v:"map-pin",        l:"Location",       e:"📍"},
  {v:"whatsapp",       l:"WhatsApp",       e:"💬"},
  {v:"video",          l:"Video Call",     e:"📹"},
  {v:"globe",          l:"Online",         e:"🌐"},
  // Facilities & General
  {v:"building",       l:"Clinic",         e:"🏢"},
  {v:"home",           l:"Home Visit",     e:"🏠"},
  {v:"car",            l:"Transport",      e:"🚗"},
  {v:"chart",          l:"Reports",        e:"📊"},
  {v:"document",       l:"Records",        e:"📄"},
  {v:"sparkles",       l:"Premium",        e:"✨"},
  {v:"zap",            l:"Quick",          e:"⚡"},
  {v:"leaf",           l:"Wellness",       e:"🌿"},
  {v:"sun",            l:"Health",         e:"☀️"},
  {v:"info",           l:"Info",           e:"ℹ️"},
  {v:"arrow-right",    l:"Proceed",        e:"→"},
  // Social
  {v:"facebook",        l:"Facebook",       e:""},
  {v:"twitter",         l:"Twitter / X",    e:""},
  {v:"instagram",       l:"Instagram",      e:""},
  {v:"linkedin",        l:"LinkedIn",       e:""},
  {v:"youtube",         l:"YouTube",        e:""},
  // Others / extras
  {v:"heartFill",       l:"Heart Filled",   e:"❤️"},
  {v:"cross",           l:"Medical Plus",   e:"➕"},
  {v:"scan",            l:"Scan / CT",      e:"🖨️"},
  {v:"graduation",      l:"Graduation",     e:"🎓"},
  {v:"user",            l:"Person",         e:"👤"},
  {v:"checkCircle",     l:"Check Circle",   e:"✅"},
];
const blockTemplates: Record<string, JsonObject> = {
  hero:{_template:"hero",enabled:true,headline:"",subheadline:"",photo:"",buttons:[],variant:"",backgroundImage:"",css:""},
  profile:{_template:"profile",enabled:true,kicker:"",title:"",body:"",experienceYears:0,experienceLabel:"",registrationNumber:"",registrationLabel:"",variant:"",backgroundImage:"",css:""},
  services:{_template:"services",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  timings:{_template:"timings",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  gallery:{_template:"gallery",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  faq:{_template:"faq",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  cta:{_template:"cta",enabled:true,title:"",body:"",buttons:[],variant:"",backgroundImage:"",css:""},
  testimonials:{_template:"testimonials",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  stats:{_template:"stats",enabled:true,items:[],variant:"",backgroundImage:"",css:""},
  text:{_template:"text",enabled:true,heading:"",body:"",variant:"",backgroundImage:"",css:""},
  header:{_template:"header",enabled:true,logo:"",navLinks:[],backgroundImage:"",css:""},
  footer:{_template:"footer",enabled:true,copyright:"",socialLinks:[],backgroundImage:"",css:""},
  awards:{_template:"awards",enabled:true,kicker:"",title:"",items:[],variant:"",backgroundImage:"",css:""},
  whatsapp:{_template:"whatsapp",enabled:true,phone:"",message:"",label:""},
  location:{_template:"location",enabled:true,kicker:"",title:"",mapUrl:"",height:400,variant:"",backgroundImage:"",css:""},
};
const blockTypes = Object.keys(blockTemplates);
const SITE_SECTIONS: {key:SiteSection;label:string}[] = [
  {key:"profile",label:"Profile"},{key:"business",label:"Business"},
  {key:"presentation",label:"Presentation"},{key:"header",label:"Header"},{key:"footer",label:"Footer"},{key:"seo",label:"SEO"},{key:"analytics",label:"Analytics"},
];

// Per-block variant presets shown in the Presentation tab dropdown
const BLOCK_VARIANTS: Record<string, {v:string;l:string}[]> = {
  hero:         [{v:"",l:"Default"},{v:"compact",l:"Compact"},{v:"editorial",l:"Editorial"},{v:"centered",l:"Centered"},{v:"split",l:"Split"}],
  profile:      [{v:"",l:"Default"},{v:"editorial",l:"Editorial"},{v:"centered",l:"Centered"},{v:"compact",l:"Compact"},{v:"split",l:"Split"}],
  services:     [{v:"",l:"Default"},{v:"grid",l:"Grid"},{v:"list",l:"List"},{v:"cards",l:"Cards"},{v:"compact",l:"Compact"}],
  timings:      [{v:"",l:"Default"},{v:"compact",l:"Compact"},{v:"cards",l:"Cards"},{v:"split",l:"Split"}],
  gallery:      [{v:"",l:"Default"},{v:"masonry",l:"Masonry"},{v:"carousel",l:"Carousel"},{v:"wide",l:"Wide"}],
  faq:          [{v:"",l:"Default"},{v:"accordion",l:"Accordion"},{v:"minimal",l:"Minimal"}],
  cta:          [{v:"",l:"Default"},{v:"minimal",l:"Minimal"},{v:"bold",l:"Bold"},{v:"centered",l:"Centered"}],
  testimonials: [{v:"",l:"Default"},{v:"grid",l:"Grid"},{v:"carousel",l:"Carousel"},{v:"minimal",l:"Minimal"}],
  stats:        [{v:"",l:"Default"},{v:"horizontal",l:"Horizontal"},{v:"compact",l:"Compact"}],
  text:         [{v:"",l:"Default"},{v:"centered",l:"Centered"},{v:"narrow",l:"Narrow"},{v:"wide",l:"Wide"}],
  awards:       [{v:"",l:"Default"},{v:"timeline",l:"Timeline"},{v:"cards",l:"Cards"},{v:"compact",l:"Compact"}],
  location:     [{v:"",l:"Default"},{v:"full-width",l:"Full Width"},{v:"compact",l:"Compact"}],
};

// Searchable CSS property list for the CSS editor popup
const COMMON_CSS_PROPS = [
  "background-color","background","color","padding","padding-top","padding-bottom",
  "padding-left","padding-right","margin","margin-top","margin-bottom","margin-left","margin-right",
  "font-size","font-weight","line-height","letter-spacing","text-align","text-transform","text-decoration",
  "border","border-radius","border-top","border-bottom","border-left","border-right","border-color","border-width","border-style",
  "width","max-width","min-width","height","max-height","min-height",
  "display","flex-direction","justify-content","align-items","flex-wrap","gap","grid-template-columns",
  "position","top","left","right","bottom","z-index",
  "box-shadow","opacity","overflow","cursor","transform","transition",
];

// ── Stock photos ───────────────────────────────────────────────────────────
const STOCK_PHOTOS = [
  {url:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",label:"Doctor smiling"},
  {url:"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",label:"Consultation"},
  {url:"https://images.unsplash.com/photo-1584820927498-cad076e8edd6?auto=format&fit=crop&w=400&q=80",label:"Doctor with tablet"},
  {url:"https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",label:"Medical professional"},
  {url:"https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",label:"Doctor portrait"},
  {url:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",label:"Stethoscope"},
  {url:"https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&q=80",label:"Operating room"},
  {url:"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",label:"Hospital corridor"},
  {url:"https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80",label:"Hospital exterior"},
  {url:"https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",label:"Hospital room"},
  {url:"https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=400&q=80",label:"Medical team"},
  {url:"https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=400&q=80",label:"ICU"},
  {url:"https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?auto=format&fit=crop&w=400&q=80",label:"Patient care"},
  {url:"https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",label:"Patient recovery"},
  {url:"https://images.unsplash.com/photo-1587351021759-3e566b1afbb2?auto=format&fit=crop&w=400&q=80",label:"Doctor & patient"},
  {url:"https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80",label:"Patient checkup"},
  {url:"https://images.unsplash.com/photo-1666214276372-24b8f15c5b43?auto=format&fit=crop&w=400&q=80",label:"Elderly care"},
  {url:"https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=400&q=80",label:"Pediatrics"},
  {url:"https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&w=400&q=80",label:"Lab equipment"},
  {url:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80",label:"Microscope"},
  {url:"https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=400&q=80",label:"Medical device"},
  {url:"https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80",label:"Surgery prep"},
  {url:"https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=400&q=80",label:"Medical scan"},
  {url:"https://images.unsplash.com/photo-1559305616-3f99cd43e353?auto=format&fit=crop&w=400&q=80",label:"Pharmacy"},
  {url:"https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=400&q=80",label:"Wellness"},
  {url:"https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=400&q=80",label:"Physio therapy"},
  {url:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",label:"Mental health"},
  {url:"https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",label:"Spa & recovery"},
  {url:"https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",label:"Nutrition"},
  {url:"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80",label:"Blood test"},
];

// ── Theme tokens — Heroku brand design system ────────────────────────────────
// Dark: clean slate-blue palette — readable, professional, gentle on eyes
const darkTokens = {
  shell:      "#0d1117",
  bg:         "#161b22",
  surface:    "#1c2333",
  input:      "#0d1117",
  border:     "#21262d",
  borderMd:   "#30363d",
  borderFocus:"#79589f",
  text:       "#e6edf3",
  textSub:    "#8b949e",
  textMute:   "#6e7681",
  textDim:    "#484f58",
  accent:     "#79589f",
  accentHov:  "#8b6bb8",
  green:      "#3d2c5e",
  greenBg:    "rgba(121,88,159,.15)",
  red:        "#f85149",
  redBg:      "rgba(248,81,73,.08)",
  redText:    "#ffa198",
  overlay:    "rgba(1,4,9,.8)",
  isDark:     true,
  shadow:     "0 1px 3px rgba(0,0,0,.4),0 0 0 1px rgba(48,54,61,.6)",
  shadowMd:   "0 6px 24px rgba(0,0,0,.45),0 0 0 1px rgba(48,54,61,.5)",
};

// Light: matches actual Heroku dashboard (heroku.com) visual audit
// White surfaces, neutral-gray borders — purple reserved for interactive elements only
const lightTokens = {
  shell:      "#F5F6F7",   // Heroku page shell — off-white neutral (not lavender)
  bg:         "#FFFFFF",   // main content area — pure white
  surface:    "#F9F9F9",   // cards, raised panels — very light neutral gray
  input:      "#FFFFFF",   // input wells — pure white
  border:     "#E4E7EB",   // hairline dividers — neutral gray
  borderMd:   "#C8CBD0",   // input strokes, card borders — Heroku's neutral gray
  borderFocus:"#79589f",
  // Text — Heroku uses near-black with no purple cast in body text
  text:       "#1F2531",   // primary text — dark charcoal (Heroku body)
  textSub:    "#4B5563",   // secondary text — medium gray (labels, nav)
  textMute:   "#68737A",   // muted text — lighter gray (placeholders, hints)
  textDim:    "#A0ADB8",   // very dim — divider labels, timestamps
  // Accent — Purple-40 for interactive; secondary uses Purple-30
  accent:     "#79589f",   // Primary accent — deep purple
  accentHov:  "#7526E3",   // Purple-40 on hover
  green:      "#59437a",
  greenBg:    "rgba(89,67,122,.08)",
  red:        "#C0392B",
  redBg:      "rgba(192,57,43,.06)",
  redText:    "#922B21",
  overlay:    "rgba(10,10,20,.45)",
  isDark:     false,
  shadow:     "0 1px 3px rgba(0,0,0,.08),0 0 0 1px rgba(200,203,208,.5)",
  shadowMd:   "0 4px 14px rgba(0,0,0,.10),0 0 0 1px rgba(200,203,208,.4)",
};

type Tokens = typeof darkTokens;
const ThemeCtx     = createContext<Tokens>(darkTokens);
const TenantCtx    = createContext<{tenantType:TenantType;tenantId:string}>({tenantType:"doctor",tenantId:""});
const SpecialtyCtx = createContext<{specialty:string;experienceYears:number}>({specialty:"",experienceYears:0});
const useT         = () => useContext(ThemeCtx);
const useTenant    = () => useContext(TenantCtx);
const useSpecialty = () => useContext(SpecialtyCtx);

// Shared label style factory
const lbl = (T: Tokens): React.CSSProperties => T.isDark ? ({
  display:"block", fontSize:"14px", fontWeight:700,
  color:T.textSub, textTransform:"uppercase", letterSpacing:".7px", marginBottom:5,
}) : ({
  display:"block", fontSize:"15px", fontWeight:600,
  color:T.textSub, textTransform:"none", letterSpacing:"0", marginBottom:5,
});
// Heroku inputs: 4px radius
// Light: neutral gray border (matches dashboard), Purple-40 focus ring
// Dark: Purple-20 border, Purple-40 focus ring
const inputBase = (T: Tokens, focused: boolean): React.CSSProperties => ({
  width:"100%", padding:"7px 10px", borderRadius:4,
  border:`1px solid ${focused ? T.borderFocus : (T.isDark ? T.borderMd : "#C8CBD0")}`,
  boxShadow: focused ? `0 0 0 1px ${T.accent},0 0 0 3px ${T.accent}28` : "none",
  background:T.input, color:T.text, fontSize:"12.5px",
  boxSizing:"border-box", outline:"none", fontFamily:"inherit",
  transition:"border-color .12s, box-shadow .12s",
});

// ── BlockEditor (main) ─────────────────────────────────────────────────────
interface BlockEditorProps {
  tenantType:TenantType; tenantId:string;
  pageSlug:string; pages:string[];
  onPageChange:(slug:string)=>void;
  onOpenHistory?:()=>void;
  // Snapshot preview — when set the preview iframe shows the historical snapshot
  snapshotPage?:object|null;
  snapshotLabel?:string;
  snapshotTimestamp?:string;
  onClearSnapshot?:()=>void;
  onRestoreSnapshot?:(timestamp:string)=>void;
}

export function BlockEditor({
  tenantType, tenantId, pageSlug, pages, onPageChange, onOpenHistory,
  snapshotPage, snapshotLabel, snapshotTimestamp, onClearSnapshot, onRestoreSnapshot,
}: BlockEditorProps) {
  // Auth guard — redirect to login if no valid session
  useEffect(() => {
    const session = getActiveSession();
    if (!session) {
      window.location.replace("/login");
    }
  }, []);

  // Persist theme preference to localStorage so it survives page reloads
  const [isDark, setIsDark] = useState(true);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor-theme");
      if (saved !== null) setIsDark(saved === "dark");
    } catch {}
    setThemeReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("editor-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);
  const T = themeReady ? (isDark ? darkTokens : lightTokens) : darkTokens;

  const [site,     setSite]     = useState<JsonObject|null>(null);
  const [page,     setPage]     = useState<JsonObject|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState<"site"|"page"|null>(null);
  const [saved,    setSaved]    = useState<"site"|"page"|null>(null);
  const [error,    setError]    = useState<string|null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [siteOpen, setSiteOpen] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const debRef     = useRef<number|null>(null);
  const dragIdx    = useRef<number|null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/content/read?${new URLSearchParams({tenantType,tenantId,pageSlug})}`, {
        headers: getAuthHeaders(),
      });
      if (r.status === 401 || r.status === 403) {
        clearStoredToken();
        window.location.replace("/login");
        return;
      }
      if (!r.ok) throw new Error("Not found");
      const j = await r.json();
      setSite(j.site ?? null); setPage(j.page ?? null);
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [tenantType, tenantId, pageSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pushDraft = useCallback(() => {
    if (!previewRef.current?.contentWindow) return;
    // Use snapshot override when viewing history, otherwise use live page data
    const activePage = snapshotPage ?? page;
    if (!activePage) return;

    // Normalize site.settings[] into flat top-level properties so the renderer
    // (SiteRenderer / LivePreviewClient) can access tenant.profile, tenant.presentation, etc.
    // Then overlay page.settings (urlSettings / presentation / seo) on top so page-level
    // presentation overrides are respected by LivePreviewClient.
    let payload: JsonObject = activePage as JsonObject;
    if (site) {
      const ss: any[] = Array.isArray(site.settings) ? site.settings : [];
      const gs = (tpl: string) => ss.find(s => s._template === tpl) ?? {};
      payload = {
        ...site,
        // Flatten site settings to root properties the renderer reads
        profile:      gs("profile"),
        business:     gs("business"),
        header:       gs("header"),
        footer:       gs("footer"),
        presentation: gs("presentation"),
        seo:          gs("seo"),
        subscription: gs("subscription"),
        // Page data — blocks + settings (carries page-level presentation override)
        blocks:   (activePage as any).blocks   ?? [],
        settings: (activePage as any).settings ?? [],
      };
    }

    previewRef.current.contentWindow.postMessage(
      { type:"studio:draft-update", payload },
      window.location.origin,
    );
  }, [page, site, snapshotPage]);

  useEffect(() => {
    if (loading) return;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = window.setTimeout(pushDraft, 180);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [page, site, loading, pushDraft, snapshotPage]);

  const save = useCallback(async (target: "site"|"page") => {
    setSaving(target); setSaved(null);
    const data = target === "page" ? page : site;
    if (!data) { setSaving(null); return; }
    try {
      const r = await fetch("/api/content/save", {
        method:"POST",
        headers:{"Content-Type":"application/json", ...getAuthHeaders()},
        body: JSON.stringify({ tenantType, tenantId, pageSlug: target==="page" ? pageSlug : undefined, data }),
      });
      if (r.status === 401 || r.status === 403) {
        clearStoredToken();
        window.location.replace("/login");
        return;
      }
      if (!r.ok) throw new Error("Save failed");
      setSaved(target); setTimeout(()=>setSaved(null), 2500);
      previewRef.current?.contentWindow?.location.reload();
    } catch(e) { setError(String(e)); }
    finally { setSaving(null); }
  }, [page, site, tenantType, tenantId, pageSlug]);

  const blocks: JsonObject[] = useMemo(() => {
    const r = page?.blocks ?? []; return Array.isArray(r) ? r : [];
  }, [page]);

  const updateBlock = (i:number, val:JsonObject) =>
    setPage(p => p ? {...p, blocks:(p.blocks as any[]).map((b,j)=>j===i?val:b)} : p);
  const addBlock = (tpl:string) =>
    setPage(p => p ? {...p, blocks:[...(p.blocks??[]),{...blockTemplates[tpl]}]} : p);
  const removeBlock = (i:number) =>
    setPage(p => p ? {...p, blocks:(p.blocks as any[]).filter((_,j)=>j!==i)} : p);
  const moveBlock = (from:number, to:number) => setPage(p => {
    if (!p || from===to) return p;
    const b = [...(p.blocks as any[])];
    b.splice(to, 0, b.splice(from, 1)[0]);
    return {...p, blocks:b};
  });

  const isBusy = saving !== null;
  const collLabel = tenantType==="doctor" ? "Doctor Site" : "Hospital Site";

  // Derive specialty + experienceYears from site settings for the suggestion engine
  const specialtyCtxValue = useMemo(() => {
    if (!site) return { specialty:"", experienceYears:0 };
    const ss: any[] = Array.isArray(site.settings) ? site.settings : [];
    const profile = ss.find((s:any) => s._template === "profile") ?? {};
    return {
      specialty: (profile.specialty ?? "").toLowerCase(),
      experienceYears: Number(profile.experienceYears ?? 0),
    };
  }, [site]);

  return (
    <ThemeCtx.Provider value={T}>
    <TenantCtx.Provider value={{tenantType,tenantId}}>
    <SpecialtyCtx.Provider value={specialtyCtxValue}>

      <div style={{display:"grid",gridTemplateRows:snapshotPage?"48px 40px 1fr":"48px 1fr",height:"100vh",background:T.shell,fontFamily:"'Salesforce Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",color:T.text,overflow:"hidden",colorScheme:T.isDark?"dark":"light"}}>

        {/* ─── Header ─── */}
        <header style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 14px",background:T.bg,
          borderBottom:`1px solid ${T.borderMd}`,
          gap:8,flexShrink:0,zIndex:10,
        }}>
          {/* Breadcrumb */}
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,overflow:"hidden"}}>
            <a href="/creator" style={{color:T.textMute,textDecoration:"none",fontSize:"15px",flexShrink:0,transition:"color .15s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color=T.accent}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color=T.textMute}>
              ← Back
            </a>
            <span style={{color:T.textDim,fontSize:"15px"}}>/</span>
            <span style={{color:T.textMute,fontSize:"15px",flexShrink:0}}>{collLabel}</span>
            <span style={{color:T.textDim,fontSize:"15px"}}>/</span>
            <span style={{fontWeight:600,fontSize:"14px",color:T.text,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{tenantId}</span>
            <span style={{color:T.textDim,fontSize:"15px"}}>/</span>
            <span style={{fontSize:"15px",color:T.accent,flexShrink:0,fontWeight:500}}>{pageSlug}</span>
          </div>

          {/* Actions row */}
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            {/* Site Settings */}
            <button onClick={()=>setSiteOpen(true)} style={hdrBtn(T, true)}>
              Site Settings
            </button>

            <Divider />

            {/* Viewport — segmented control with device SVG icons */}
            <div style={{display:"flex",borderRadius:4,border:`1px solid ${T.borderMd}`,overflow:"hidden"}}>
              {(["mobile","tablet","desktop"] as Viewport[]).map((vp,idx)=>(
                <button key={vp} onClick={()=>setViewport(vp)}
                  title={vp[0].toUpperCase()+vp.slice(1)}
                  style={{
                    padding:"5px 10px", border:"none",
                    borderLeft: idx>0 ? `1px solid ${T.borderMd}` : "none",
                    cursor:"pointer", lineHeight:"1.4",
                    background:viewport===vp ? T.accent : "transparent",
                    color:viewport===vp ? "#fff" : T.textMute,
                    transition:"background .1s, color .1s", fontFamily:"inherit",
                    display:"inline-flex", alignItems:"center",
                  }}>
                  {vp==="mobile" && (
                    <svg width="11" height="15" viewBox="0 0 11 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="0.8" width="9" height="13.4" rx="1.6"/>
                      <line x1="3.8" y1="12.2" x2="7.2" y2="12.2"/>
                    </svg>
                  )}
                  {vp==="tablet" && (
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="0.8" width="11" height="13.4" rx="1.6"/>
                      <line x1="4.8" y1="12.2" x2="8.2" y2="12.2"/>
                    </svg>
                  )}
                  {vp==="desktop" && (
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="0.7" y="0.7" width="14.6" height="9.6" rx="1.3"/>
                      <line x1="5" y1="13.3" x2="11" y2="13.3"/>
                      <line x1="8" y1="10.3" x2="8" y2="13.3"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <Divider />

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              title={isDark ? "Switch to light" : "Switch to dark"}
              style={{...hdrBtn(T), display:"inline-flex", alignItems:"center"}}>
              {isDark ? "☀" : "🌙"}
            </button>

            {/* View site */}
            <a href={`/site/${tenantId}/${pageSlug}`} target="_blank"
              style={{...hdrBtn(T), display:"inline-flex", textDecoration:"none"}}>
              ↗ View
            </a>

            {onOpenHistory && (
              <button onClick={onOpenHistory} style={{
                ...hdrBtn(T),
                ...(snapshotPage ? {
                  border:     `1px solid ${T.accent}`,
                  background: `${T.accent}22`,
                  color:      T.accent,
                } : {}),
              }}>
                {snapshotPage ? "⏱ History" : "History"}
              </button>
            )}

            <Divider />

            {/* Sign out */}
            <button
              title="Sign out"
              onClick={() => { clearStoredToken(); window.location.replace("/login"); }}
              style={hdrBtn(T)}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.border="1px solid #f87171";(e.currentTarget as HTMLButtonElement).style.color="#f87171";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.border=`1px solid ${T.isDark?T.borderMd:"#C8CBD0"}`;(e.currentTarget as HTMLButtonElement).style.color=T.textSub;}}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* ─── Snapshot history banner ─── */}
        {snapshotPage && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"0 14px",
            background: T.isDark
              ? `linear-gradient(90deg,rgba(117,38,227,.22),rgba(117,38,227,.10))`
              : `linear-gradient(90deg,rgba(90,27,169,.12),rgba(90,27,169,.06))`,
            borderBottom:`1px solid ${T.accent}55`,
            zIndex:9, flexShrink:0,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8,overflow:"hidden",minWidth:0}}>
              <span style={{fontSize:11,flexShrink:0}}>⏱</span>
              <span style={{fontSize:11,fontWeight:700,color:T.accent,flexShrink:0,letterSpacing:".3px",textTransform:"uppercase"}}>Viewing History</span>
              <span style={{fontSize:11,color:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                — {snapshotLabel}
              </span>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {onRestoreSnapshot && snapshotTimestamp && (
                <button
                  onClick={()=>{
                    if(confirm(`Restore snapshot from ${snapshotLabel}?\n\nThis will overwrite the current saved page.`)){
                      onRestoreSnapshot(snapshotTimestamp);
                    }
                  }}
                  style={{
                    padding:"4px 12px", borderRadius:4, border:"none",
                    background:T.accent, color:"#fff",
                    fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>
                  Restore this version
                </button>
              )}
              <button
                onClick={()=>onClearSnapshot?.()}
                style={{
                  padding:"4px 10px", borderRadius:4,
                  border:`1px solid ${T.accent}55`, background:"transparent",
                  color:T.accent, fontSize:11, fontWeight:500,
                  cursor:"pointer", fontFamily:"inherit",
                }}>
                ← Current
              </button>
            </div>
          </div>
        )}

        {/* ─── Body ─── */}
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:T.textMute,gap:8,fontSize:"14px"}}>
            <span style={{display:"inline-block",width:14,height:14,borderWidth:2,borderStyle:"solid",borderLeftColor:T.accent,borderRightColor:T.accent,borderBottomColor:T.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}} />
            Loading…
          </div>
        ) : error ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
            <p style={{color:T.red,fontSize:"14px",margin:0}}>{error}</p>
            <button onClick={fetchData} style={{...hdrBtn(T, true)}}>Retry</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"420px 1fr",overflow:"hidden",height:"100%"}}>

            {/* ─── Form Panel ─── */}
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden",background:T.bg,borderRight:`1px solid ${T.borderMd}`}}>
              {/* Panel header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:`1px solid ${T.borderMd}`,flexShrink:0,background:T.surface}}>
                <span style={{fontSize:"15px",fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:".8px"}}>
                  Blocks
                </span>
                {pages.length > 1 && (
                  <select value={pageSlug} onChange={e=>onPageChange(e.target.value)}
                    style={{padding:"4px 8px",borderRadius:4,border:`1px solid ${T.borderMd}`,background:T.input,color:T.text,fontSize:"15px",cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
                    {pages.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              {/* Scrollable form */}
              <div style={{flex:1,overflowY:"scroll",padding:"12px 14px 24px"}}>
                {/* Block list — shown FIRST */}
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {blocks.length===0 && <EmptyBlockState onAdd={addBlock} />}
                  {blocks.map((blk,i)=>(
                    <BlockCard key={`${blk._template}-${i}`} block={blk} index={i}
                      onChange={v=>updateBlock(i,v)} onRemove={()=>removeBlock(i)}
                      onDragStart={()=>{ dragIdx.current=i; }}
                      onDragOver={e=>{ e.preventDefault(); if(dragIdx.current!==null&&dragIdx.current!==i){moveBlock(dragIdx.current,i);dragIdx.current=i;} }}
                      onDragEnd={()=>{ dragIdx.current=null; }}
                      pages={pages} />
                  ))}
                  {blocks.length>0 && (
                    <div style={{marginTop:4}}><AddBlockMenu onAdd={addBlock} /></div>
                  )}
                </div>

                {/* Page-level settings (urlSettings, presentation, seo) — below blocks */}
                {page && (
                  <div style={{marginTop:16}}>
                    <PageSettingsPanel page={page} onChange={setPage} />
                  </div>
                )}
              </div>

              {/* ─── Sticky Save Page bar ─── */}
              <div style={{
                flexShrink:0, padding:"9px 14px",
                borderTop:`1px solid ${T.borderMd}`,
                background:T.surface,
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
              }}>
                <span style={{fontSize:"14px",color:T.textMute,letterSpacing:".1px"}}>
                  {saved==="page" ? "✓ Saved" : saving==="page" ? "Saving…" : `${blocks.length} block${blocks.length!==1?"s":""}`}
                </span>
                <button onClick={()=>save("page")} disabled={isBusy} style={{
                  padding:"7px 18px", borderRadius:4, border:"none",
                  background: saved==="page" ? T.green : T.accent,
                  color:"#fff", fontSize:"15px", fontWeight:600,
                  cursor: isBusy ? "default" : "pointer",
                  fontFamily:"inherit", opacity: saving==="page" ? .65 : 1, transition:"background .15s",
                  flexShrink:0, letterSpacing:".1px",
                }}>
                  {saving==="page" ? "Saving…" : saved==="page" ? "✓ Saved" : "Save Page"}
                </button>
              </div>
            </div>

            {/* ─── Preview ─── */}
            <div style={{background:"#060b12",overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}}>
              <div style={{
                flex:1, overflow:"hidden",
                display:"flex", alignItems:viewport!=="desktop"?"flex-start":"stretch",
                justifyContent:"center", paddingTop:viewport!=="desktop"?20:0,
              }}>
                <div style={{
                  width:viewport==="mobile"?390:viewport==="tablet"?768:"100%",
                  height:viewport!=="desktop"?"calc(100% - 20px)":"100%",
                  borderRadius:viewport!=="desktop"?10:0,
                  overflow:"hidden",
                  boxShadow:viewport!=="desktop"?T.shadowMd:"none",
                }}>
                  <iframe key={`${tenantId}-${pageSlug}`} ref={previewRef}
                    src={`/site/${tenantId}/${pageSlug}/preview?studio=1`}
                    style={{width:"100%",height:"100%",border:"none",background:"#fff"}}
                    onLoad={()=>pushDraft()} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Site Settings Drawer ─── */}
      {siteOpen && site && (
        <SiteSettingsDrawer
          site={site} onChange={setSite}
          onSave={()=>save("site")}
          saving={saving==="site"} saved={saved==="site"}
          onClose={()=>setSiteOpen(false)}
          pages={pages}
          layout="tabs"
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} select option{background:#161b22;color:#e6edf3} select optgroup{background:#1c2333;color:#8b949e;font-style:normal}`}</style>
    </SpecialtyCtx.Provider>
    </TenantCtx.Provider>
    </ThemeCtx.Provider>
  );
}

// ─── Style helpers ──────────────────────────────────────────────────────────
// Heroku button: 4px radius — never pill.
// Primary = solid fill (Purple-40 dark / Purple-30-ish light).
// Ghost = white bg + neutral gray border in light, transparent + purple border in dark.
function hdrBtn(T: Tokens, primary?: boolean): React.CSSProperties {
  if (primary) {
    return {
      padding:"5px 14px", borderRadius:4, border:"none",
      background:T.accent, color:"#fff",
      fontSize:"15px", fontWeight:600, cursor:"pointer",
      fontFamily:"inherit", whiteSpace:"nowrap" as const,
      transition:"background .12s", lineHeight:"1.4",
    };
  }
  // Ghost — neutral gray border in light, subtle purple border in dark
  return {
    padding:"5px 12px", borderRadius:4,
    border:`1px solid ${T.isDark ? T.borderMd : "#C8CBD0"}`,
    background: T.isDark ? "transparent" : "#FFFFFF",
    color: T.isDark ? T.textSub : T.textSub,
    fontSize:"15px", fontWeight:500, cursor:"pointer",
    fontFamily:"inherit", whiteSpace:"nowrap" as const,
    transition:"all .12s", lineHeight:"1.4",
  };
}
function saveBtn(T: Tokens, saving: boolean, saved: boolean, primary: boolean): React.CSSProperties {
  const bg = saved ? T.green : primary ? T.accent : "transparent";
  return {
    padding:"6px 16px", borderRadius:4,
    border: primary ? "none" : `1px solid ${T.borderMd}`,
    background: bg, color: (saved||primary) ? "#fff" : T.textSub,
    fontSize:"15px", fontWeight:600, cursor: saving ? "default" : "pointer",
    fontFamily:"inherit", opacity: saving ? .65 : 1, transition:"all .15s",
  };
}
function Divider() {
  const T = useT();
  return <div style={{width:1,height:16,background:T.borderMd,margin:"0 3px",flexShrink:0}} />;
}

// ─── Page Settings Panel ────────────────────────────────────────────────────
function PageSettingsPanel({ page, onChange }: {page:JsonObject;onChange:(v:JsonObject)=>void}) {
  const T = useT();
  const [open, setOpen] = useState(false);

  const settings: any[] = Array.isArray(page.settings) ? page.settings : [];
  const urlS = settings.find(s=>s._template==="urlSettings") ?? {};
  const presS = settings.find(s=>s._template==="presentation") ?? {};
  const seoS = settings.find(s=>s._template==="seo") ?? {};

  const updSetting = (template: string, patch: object) => {
    const existing = settings.find(s=>s._template===template);
    const newSettings = existing
      ? settings.map(s=>s._template===template ? {...s,...patch} : s)
      : [...settings, {_template:template,...patch}];
    onChange({...page, settings:newSettings});
  };

  return (
    <div style={{
      borderRadius:4, border:`1px solid ${T.border}`,
      background:T.surface, overflow:"hidden", marginBottom:0,
    }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 12px", border:"none", background:"transparent",
        cursor:"pointer", fontFamily:"inherit",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"15px",fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:".7px"}}>Page Settings</span>
          {urlS.slug && <span style={{fontSize:"15px",color:T.textMute,background:T.bg,padding:"1px 6px",borderRadius:3,border:`1px solid ${T.border}`}}>{urlS.slug}</span>}
        </div>
        <span style={{color:T.textDim,fontSize:"14px",transition:"transform .12s",transform:open?"rotate(90deg)":"rotate(0)"}}>▶</span>
      </button>

      {open && (
        <div style={{padding:"0 14px 16px",display:"flex",flexDirection:"column",gap:12,borderTop:`1px solid ${T.border}`}}>
          <div style={{paddingTop:14,display:"flex",flexDirection:"column",gap:12}}>
            {/* URL */}
            <FieldGroupLabel>URL &amp; Navigation</FieldGroupLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FField label="Slug" value={urlS.slug??""} onChange={v=>updSetting("urlSettings",{...urlS,slug:v})} />
              <FField label="Title" value={urlS.title??""} onChange={v=>updSetting("urlSettings",{...urlS,title:v})} />
            </div>
            <FField label="Path" value={urlS.path??""} onChange={v=>updSetting("urlSettings",{...urlS,path:v})} />
            <FToggle label="Is Home Page" value={urlS.isHome??false} onChange={v=>updSetting("urlSettings",{...urlS,isHome:v})} />

            {/* Presentation overrides */}
            <FieldGroupLabel>Layout Overrides</FieldGroupLabel>
            <FSelect label="Theme" value={presS.themeId??""} options={themeOptions} onChange={v=>updSetting("presentation",{...presS,themeId:v})} />
            <FSelect label="Variant Preset" value={presS.variantPresetId??""} options={variantPresetOptions} onChange={v=>updSetting("presentation",{...presS,variantPresetId:v})} />
            <FSelect label="Style Preset" value={presS.styleId??""} options={styleOptions} onChange={v=>updSetting("presentation",{...presS,styleId:v})} />

            {/* Page SEO */}
            <FieldGroupLabel>SEO</FieldGroupLabel>
            <FField label="Meta Title" value={seoS.title??""} onChange={v=>updSetting("seo",{...seoS,title:v})} />
            <FField label="Meta Description" value={seoS.description??""} onChange={v=>updSetting("seo",{...seoS,description:v})} />
            <FField label="Keywords (comma-separated)" value={Array.isArray(seoS.keywords)?seoS.keywords.join(", "):""} onChange={v=>updSetting("seo",{...seoS,keywords:v.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Setting Card (mirrors BlockCard style for site settings) ────────────────
function SettingCard({ label, children, defaultOpen }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const T = useT();
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div style={{
      background: T.surface,
      borderRadius: 2,
      overflow: "hidden",
      borderTop:    `1px solid ${T.border}`,
      borderRight:  `1px solid ${T.border}`,
      borderBottom: `1px solid ${T.border}`,
      borderLeft:   open ? `3px solid ${T.accent}` : `1px solid ${T.border}`,
      boxShadow:    open ? `0 2px 14px rgba(117,38,227,.14),0 1px 4px rgba(0,0,0,.28)` : "none",
      transition:   "border-left .14s, box-shadow .14s",
    }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"9px 12px", cursor:"pointer", userSelect:"none",
        borderBottom: open ? `1px solid ${T.border}` : "none",
        background: open ? `${T.accent}09` : "transparent",
      }}>
        <span style={{fontSize:"15px", fontWeight:600, color:T.text, letterSpacing:".1px"}}>{label}</span>
        <span style={{color:T.textMute, fontSize:"14px", transition:"transform .14s", transform:open?"rotate(90deg)":"", display:"inline-block"}}>▶</span>
      </div>
      {open && (
        <div style={{padding:"16px 14px", display:"flex", flexDirection:"column", gap:14}}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Site Settings Drawer ───────────────────────────────────────────────────
function SiteSettingsDrawer({site,onChange,onSave,saving,saved,onClose,pages,layout="vertical"}:{
  site:JsonObject; onChange:(v:JsonObject)=>void;
  onSave:()=>void; saving:boolean; saved:boolean; onClose:()=>void;
  pages:string[]; layout?:"tabs"|"vertical";
}) {
  const T = useT();
  const [activeTab, setActiveTab] = useState<SiteSection>(SITE_SECTIONS[0].key);

  const settings: any[] = Array.isArray(site.settings) ? site.settings : [];
  const getSetting = (template: string) => settings.find(s => s._template === template) ?? {};
  const updSetting = (template: string, patch: object) => {
    const existing = settings.find(s => s._template === template);
    const newSettings = existing
      ? settings.map(s => s._template === template ? {...s, ...patch} : s)
      : [...settings, {_template: template, ...patch}];
    onChange({...site, settings: newSettings});
  };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:400}} />
      <div style={{
        position:"fixed", top:48, right:0, bottom:0,
        width: layout==="tabs" ? "min(624px,100vw)" : "min(504px,100vw)",
        minWidth: layout==="tabs" ? 456 : undefined,
        background:T.surface, borderLeft:`1px solid ${T.borderMd}`,
        zIndex:500, display:"flex", flexDirection:"column",
        boxShadow:"-8px 0 32px rgba(0,0,0,.45)",
        fontFamily:"'Salesforce Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
        color:T.text,
        colorScheme:T.isDark?"dark":"light",
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:`1px solid ${T.borderMd}`,background:T.surface,flexShrink:0}}>
          <span style={{fontSize:"15px",fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:".8px"}}>Site Settings</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={onSave} disabled={saving} style={{
              padding:"6px 16px", borderRadius:4, border:"none",
              background:saved?T.green:T.accent, color:"white",
              fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:saving?.65:1,
            }}>{saving?"Saving…":saved?"✓ Saved":"Save Site"}</button>
            <button onClick={onClose} style={{
              padding:"5px 9px", border:`1px solid ${T.borderMd}`, background:"transparent",
              color:T.textMute, borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:"14px",
            }}>✕</button>
          </div>
        </div>

        {layout === "tabs" ? (
          <>
            {/* Tab bar */}
            <div style={{
              display:"flex", flexShrink:0, overflowX:"auto", gap:0,
              borderBottom:`1px solid ${T.borderMd}`, background:T.surface,
              scrollbarWidth:"none",
            }}>
              {SITE_SECTIONS.map(s => {
                const active = s.key === activeTab;
                return (
                  <button key={s.key} onClick={() => setActiveTab(s.key)} style={{
                    padding:"9px 14px", border:"none",
                    borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
                    background:"transparent",
                    color: active ? T.accent : T.textMute,
                    fontSize:"14px", fontWeight: active ? 600 : 400, letterSpacing: active ? ".2px" : "0",
                    cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0,
                    transition:"color .12s, border-color .12s",
                  }}>{s.label}</button>
                );
              })}
            </div>
            {/* Active tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 14px 40px 17px",display:"flex",flexDirection:"column",gap:12,background:T.bg,borderLeft:`3px solid ${T.accent}`}}>
              <SiteSectionForm section={activeTab} getSetting={getSetting} updSetting={updSetting} pages={pages} />
            </div>
          </>
        ) : (
          /* Accordion sections */
          <div style={{flex:1,overflowY:"scroll",padding:"12px 14px 40px",display:"flex",flexDirection:"column",gap:5}}>
            {SITE_SECTIONS.map(s => (
              <SettingCard key={s.key} label={s.label}>
                <SiteSectionForm section={s.key} getSetting={getSetting} updSetting={updSetting} pages={pages} />
              </SettingCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Image Picker Modal ─────────────────────────────────────────────────────
type UnsplashPhoto = { id:string; url:string; thumb:string; small:string; description:string; credit:string; creditUrl:string; };

function ImagePickerModal({current,onSelect,onClose}:{
  current:string;onSelect:(url:string)=>void;onClose:()=>void;
}) {
  const T = useT();
  const { tenantType, tenantId } = useTenant();
  const [tab,          setTab]          = useState<PickerTab>("media");
  const [mediaFiles,   setMediaFiles]   = useState<{name:string;url:string}[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [urlInput,     setUrlInput]     = useState(current);

  // Unsplash state
  const [uQuery,    setUQuery]    = useState("medical healthcare");
  const [uPhotos,   setUPhotos]   = useState<UnsplashPhoto[]>([]);
  const [uPage,     setUPage]     = useState(1);
  const [uTotal,    setUTotal]    = useState(0);
  const [uTotalPg,  setUTotalPg]  = useState(0);
  const [uLoading,  setULoading]  = useState(false);
  const [uNoKey,    setUNoKey]    = useState(false);
  const [uError,    setUError]    = useState<string|null>(null);
  const uDebounce = useRef<number|null>(null);

  useEffect(() => {
    fetch(`/api/content/media?tenantType=${tenantType}&tenantId=${tenantId}`, {
      headers: getAuthHeaders(),
    }).then(r=>{
      if (r.status === 401 || r.status === 403) { clearStoredToken(); window.location.replace("/login"); return Promise.reject(); }
      return r.json();
    }).then(d=>{ if(d?.ok) setMediaFiles(d.files); })
      .catch(()=>{}).finally(()=>setMediaLoading(false));
  }, [tenantType, tenantId]);

  const fetchUnsplash = useCallback(async (q: string, pg: number, append = false) => {
    setULoading(true); setUError(null);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(q)}&page=${pg}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) { clearStoredToken(); window.location.replace("/login"); return; }
      const data = await res.json();
      if (!data.ok) {
        if (data.error?.includes("not configured")) setUNoKey(true);
        else setUError(data.error ?? "Failed to load photos");
        return;
      }
      setUNoKey(false);
      setUPhotos(prev => append ? [...prev, ...data.photos] : data.photos);
      setUTotal(data.total ?? 0);
      setUTotalPg(data.totalPages ?? 0);
      setUPage(pg);
    } catch { setUError("Network error"); }
    finally { setULoading(false); }
  }, []);

  // Auto-search when Unsplash tab first opens
  useEffect(() => {
    if (tab === "unsplash" && uPhotos.length === 0 && !uLoading && !uNoKey) {
      fetchUnsplash(uQuery, 1);
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce re-search on query change
  useEffect(() => {
    if (tab !== "unsplash") return;
    if (uDebounce.current) clearTimeout(uDebounce.current);
    uDebounce.current = window.setTimeout(() => {
      setUPhotos([]);
      fetchUnsplash(uQuery, 1);
    }, 400);
    return () => { if(uDebounce.current) clearTimeout(uDebounce.current); };
  }, [uQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (url: string) => { onSelect(url); onClose(); };

  const TABS = [
    { id:"media" as PickerTab, label:"My Media" },
    { id:"stock" as PickerTab, label:"Stock" },
    { id:"unsplash" as PickerTab, label:"🔍 Unsplash" },
  ];

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:600}} />
      <div style={{
        position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:"min(880px,96vw)",height:"min(640px,92vh)",
        background:T.bg,border:`1px solid ${T.borderMd}`,
        borderRadius:6,zIndex:700,display:"flex",flexDirection:"column",
        boxShadow:T.shadowMd,
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:`1px solid ${T.borderMd}`,background:T.surface,borderRadius:"6px 6px 0 0",flexShrink:0}}>
          <span style={{fontSize:"14px",fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:".7px"}}>Select Image</span>
          <button onClick={onClose} style={{padding:"3px 8px",border:`1px solid ${T.borderMd}`,background:"transparent",color:T.textMute,borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}>✕</button>
        </div>

        {/* Tabs — Heroku underline */}
        <div style={{display:"flex",borderBottom:`1px solid ${T.borderMd}`,padding:"0 18px",background:T.surface,flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"8px 12px", border:"none", cursor:"pointer", background:"transparent",
              fontFamily:"inherit", color:tab===t.id?T.accent:T.textMute,
              fontSize:"14px", fontWeight:tab===t.id?600:400,
              borderBottom:tab===t.id?`2px solid ${T.accent}`:"2px solid transparent",
              transition:"color .12s", flexShrink:0, marginBottom:"-1px",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Unsplash search bar */}
        {tab === "unsplash" && (
          <div style={{padding:"10px 16px",borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0,display:"flex",gap:8}}>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.textMute,fontSize:13,pointerEvents:"none"}}>⌕</span>
              <input type="text" value={uQuery} onChange={e=>setUQuery(e.target.value)}
                placeholder="Search Unsplash (e.g. doctor, hospital, healthcare)…"
                style={{
                  width:"100%",padding:"8px 10px 8px 28px",borderRadius:7,
                  border:`1px solid ${T.borderMd}`,background:T.input,
                  color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",
                  boxSizing:"border-box",
                }}
                onFocus={e=>e.target.style.border=`1px solid ${T.borderFocus}`}
                onBlur={e=>e.target.style.border=`1px solid ${T.borderMd}`}
              />
            </div>
            {uTotal > 0 && <span style={{alignSelf:"center",fontSize:11,color:T.textMute,flexShrink:0}}>{uTotal.toLocaleString()} results</span>}
          </div>
        )}

        {/* Grid */}
        <div style={{flex:1,overflowY:"auto",padding:14}}>
          {tab==="media" ? (
            mediaLoading ? (
              <LoadingSpinner T={T} label="Loading media…" />
            ) : mediaFiles.length===0 ? (
              <div style={{textAlign:"center",padding:"56px 20px"}}>
                <div style={{fontSize:"36px",marginBottom:12,opacity:.5}}>📂</div>
                <p style={{color:T.textSub,fontSize:"14px",margin:"0 0 6px",fontWeight:500}}>No images uploaded yet</p>
                <p style={{color:T.textMute,fontSize:"15px",margin:0}}>
                  Upload to: <code style={{background:T.surface,padding:"2px 6px",borderRadius:4,fontSize:"14px"}}>public/content/{tenantType}s/{tenantId}/</code>
                </p>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                {mediaFiles.map(f=><ImageThumb key={f.url} url={f.url} label={f.name} selected={current===f.url} onClick={()=>pick(f.url)} />)}
              </div>
            )
          ) : tab==="stock" ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
              {STOCK_PHOTOS.map(p=><ImageThumb key={p.url} url={p.url} label={p.label} selected={current===p.url} onClick={()=>pick(p.url)} />)}
            </div>
          ) : (
            /* ── Unsplash tab ── */
            uNoKey ? (
              <div style={{textAlign:"center",padding:"48px 24px",maxWidth:480,margin:"0 auto"}}>
                <div style={{fontSize:32,marginBottom:12,opacity:.6}}>🔑</div>
                <p style={{color:T.textSub,fontSize:"14px",fontWeight:500,margin:"0 0 8px"}}>Unsplash API key not configured</p>
                <p style={{color:T.textMute,fontSize:"15px",margin:"0 0 16px",lineHeight:1.6}}>
                  Add your free Unsplash API key to <code style={{background:T.surface,padding:"2px 6px",borderRadius:4,fontSize:"14px"}}>.env.local</code>:
                </p>
                <code style={{display:"block",background:T.surface,border:`1px solid ${T.borderMd}`,borderRadius:6,padding:"10px 14px",fontSize:"14px",color:T.accent,textAlign:"left",lineHeight:1.8,fontFamily:"'SF Mono',monospace"}}>
                  UNSPLASH_ACCESS_KEY=your_access_key
                </code>
                <p style={{color:T.textMute,fontSize:"14px",marginTop:10}}>
                  Get a free key at <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer" style={{color:T.accent}}>unsplash.com/developers</a>
                </p>
              </div>
            ) : uError ? (
              <div style={{textAlign:"center",padding:40,color:T.red,fontSize:13}}>{uError}</div>
            ) : uLoading && uPhotos.length === 0 ? (
              <LoadingSpinner T={T} label="Searching Unsplash…" />
            ) : uPhotos.length === 0 ? (
              <div style={{textAlign:"center",padding:48,color:T.textMute,fontSize:13}}>No results for "{uQuery}"</div>
            ) : (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                  {uPhotos.map(p=>(
                    <button key={p.id} onClick={()=>pick(p.url)}
                      title={p.description || p.credit}
                      style={{
                        padding:0,border:"none",background:"transparent",cursor:"pointer",
                        borderRadius:7,overflow:"hidden",
                        outline:current===p.url?`2.5px solid ${T.accent}`:"none",
                        outlineOffset:2,display:"block",position:"relative",
                      }}>
                      <img src={p.thumb} alt={p.description || ""}
                        style={{width:"100%",height:90,objectFit:"cover",display:"block",borderRadius:6}}
                        loading="lazy" />
                      {/* Credit overlay */}
                      <div style={{
                        position:"absolute",bottom:0,left:0,right:0,
                        padding:"3px 5px",background:"rgba(0,0,0,.55)",
                        fontSize:9,color:"rgba(255,255,255,.8)",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      }}>📷 {p.credit}</div>
                      {current===p.url && (
                        <div style={{position:"absolute",top:5,right:5,width:18,height:18,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:"white",fontWeight:700}}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Load more */}
                {uPage < uTotalPg && (
                  <div style={{textAlign:"center",marginTop:16}}>
                    <button onClick={()=>fetchUnsplash(uQuery,uPage+1,true)} disabled={uLoading}
                      style={{
                        padding:"7px 24px", borderRadius:4, border:`1px solid ${T.borderMd}`,
                        background:"transparent", color:T.textSub, fontSize:11, fontWeight:600,
                        cursor:uLoading?"default":"pointer", fontFamily:"inherit",
                        opacity:uLoading?.65:1,
                      }}>
                      {uLoading ? "Loading…" : `Load more (page ${uPage+1} of ${uTotalPg})`}
                    </button>
                  </div>
                )}
                <p style={{textAlign:"center",margin:"12px 0 0",fontSize:10,color:T.textDim}}>
                  Photos from <a href="https://unsplash.com?utm_source=doctor_sites&utm_medium=referral" target="_blank" rel="noreferrer" style={{color:T.textMute}}>Unsplash</a>
                </p>
              </div>
            )
          )}
        </div>

        {/* URL footer */}
        <div style={{padding:"10px 16px",borderTop:`1px solid ${T.borderMd}`,flexShrink:0,display:"flex",gap:6,background:T.surface,borderRadius:"0 0 6px 6px"}}>
          <input type="text" value={urlInput} onChange={e=>setUrlInput(e.target.value)}
            placeholder="Or paste any image URL and press Enter…"
            onKeyDown={e=>{if(e.key==="Enter"&&urlInput.trim())pick(urlInput.trim());}}
            style={{flex:1,padding:"6px 10px",borderRadius:4,border:`1px solid ${T.borderMd}`,background:T.input,color:T.text,fontSize:"15px",outline:"none",fontFamily:"inherit"}} />
          <button onClick={()=>{if(urlInput.trim())pick(urlInput.trim());}}
            style={{padding:"6px 14px",borderRadius:4,border:"none",background:T.accent,color:"white",fontSize:"15px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
            Use URL
          </button>
        </div>
      </div>
    </>
  );
}

function LoadingSpinner({ T, label }: { T: Tokens; label: string }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,paddingTop:60,color:T.textMute,fontSize:13}}>
      <span style={{display:"inline-block",width:14,height:14,borderWidth:2,borderStyle:"solid",borderColor:T.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}} />
      {label}
    </div>
  );
}

function ImageThumb({url,label,selected,onClick}:{url:string;label:string;selected:boolean;onClick:()=>void}) {
  const T = useT();
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <button onClick={onClick} title={label} style={{
      padding:0,border:"none",background:"transparent",cursor:"pointer",borderRadius:7,overflow:"hidden",
      outline:selected?`2.5px solid ${T.accent}`:"none",outlineOffset:2,position:"relative",display:"block",
    }}>
      <img src={url} alt={label} onError={()=>setErr(true)}
        style={{width:"100%",height:96,objectFit:"cover",display:"block",borderRadius:6}} />
      {selected && <div style={{position:"absolute",top:5,right:5,width:18,height:18,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:"white",fontWeight:700}}>✓</div>}
      <div style={{padding:"5px 6px",fontSize:"14px",color:T.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",background:T.surface}}>{label}</div>
    </button>
  );
}

// ─── Block Card ─────────────────────────────────────────────────────────────
function BlockCard({block,index,onChange,onRemove,onDragStart,onDragOver,onDragEnd,pages}:{
  block:JsonObject;index:number;
  onChange:(v:JsonObject)=>void;onRemove:()=>void;
  onDragStart:()=>void;onDragOver:(e:React.DragEvent)=>void;onDragEnd:()=>void;
  pages?:string[];
}) {
  const T = useT();
  const [collapsed, setCollapsed] = useState(true);
  const [tab,       setTab]       = useState<"content"|"presentation">("content");
  const cardRef = useRef<HTMLDivElement>(null);
  const tpl = block._template as string;
  const enabled = block.enabled !== false;

  const handleToggle = () => {
    setCollapsed(c => {
      if (c) {
        // Expanding — scroll card into view after paint
        setTimeout(() => cardRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }), 60);
      }
      return !c;
    });
  };

  return (
    <div ref={cardRef} draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
      style={{
        background: T.surface,
        borderRadius: 2,
        overflow: "hidden",
        borderTop:    `1px solid ${T.border}`,
        borderRight:  `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        borderLeft:   collapsed ? `1px solid ${T.border}` : `3px solid ${T.accent}`,
        boxShadow:    collapsed ? "none" : `0 2px 14px rgba(117,38,227,.14),0 1px 4px rgba(0,0,0,.28)`,
        transition:   "border-left .14s, box-shadow .14s",
      }}
    >
      {/* Header — entire row toggles expand/collapse */}
      <div onClick={handleToggle} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 10px", cursor:"pointer", userSelect:"none",
        borderBottom: collapsed ? "none" : `1px solid ${T.border}`,
        background: collapsed ? "transparent" : `${T.accent}09`,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Drag handle — stopPropagation so dragging doesn't toggle */}
          <span onClick={e=>e.stopPropagation()} style={{color:T.textDim,fontSize:"15px",lineHeight:1,cursor:"grab",flexShrink:0,letterSpacing:"0.5px"}}>⠿</span>
          <span style={{fontSize:"15px",fontWeight:600,color:enabled?T.text:T.textMute,letterSpacing:".1px"}}>
            {variantLabels[tpl]??tpl}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {/* Toggle — stopPropagation so it doesn't also collapse */}
          <div onClick={e=>{e.stopPropagation();onChange({...block,enabled:!enabled});}}
            title={enabled?"Disable block":"Enable block"}
            style={{
              width:34, height:18, borderRadius:9,
              background: enabled ? T.accent : T.borderMd,
              position:"relative", cursor:"pointer",
              transition:"background .18s", flexShrink:0,
              boxShadow:`inset 0 1px 2px rgba(0,0,0,.3)`,
            }}>
            <div style={{
              position:"absolute", top:2, left:enabled?17:2,
              width:14, height:14, borderRadius:"50%", background:"white",
              boxShadow:"0 1px 3px rgba(0,0,0,.35)", transition:"left .16s",
            }} />
          </div>
          {/* Delete — stopPropagation */}
          <button onClick={e=>{e.stopPropagation();onRemove();}} style={{
            padding:"2px 6px", border:`1px solid transparent`, background:"transparent",
            color:T.textMute, cursor:"pointer", borderRadius:3, fontSize:"15px", lineHeight:1,
            transition:"all .12s",
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.red;(e.currentTarget as HTMLButtonElement).style.borderColor=T.redBg;(e.currentTarget as HTMLButtonElement).style.background=T.redBg;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.textMute;(e.currentTarget as HTMLButtonElement).style.borderColor="transparent";(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
            ✕
          </button>
          {/* Chevron — NO stopPropagation, intentionally part of the clickable row */}
          <span style={{color:T.textMute,fontSize:"14px",transition:"transform .14s",transform:collapsed?"":"rotate(90deg)"}}>▶</span>
        </div>
      </div>

      {/* Expanded */}
      {!collapsed && (
        <>
          {/* Tabs — Heroku underline style */}
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,background:T.bg,padding:"0 10px",gap:0}}>
            {(["content","presentation"] as const).map(t=>(
              <button key={t} onClick={e=>{e.stopPropagation();setTab(t);}} style={{
                padding:"7px 12px", border:"none", cursor:"pointer", background:"transparent",
                fontFamily:"inherit", fontSize:"14px", fontWeight:tab===t?600:400,
                letterSpacing:tab===t?".2px":"0",
                color:tab===t?T.accent:T.textMute,
                borderBottom:tab===t?`2px solid ${T.accent}`:"2px solid transparent",
                transition:"all .12s", marginBottom:"-1px",
              }}>{t[0].toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          {/* Fields */}
          <div style={{padding:"12px 12px 14px",display:"flex",flexDirection:"column",gap:12}}>
            <BlockForm block={block} onChange={onChange} index={index} mode={tab} pages={pages} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Block Form ─────────────────────────────────────────────────────────────
function BlockForm({block,onChange,index,mode,pages}:{block:JsonObject;onChange:(v:JsonObject)=>void;index:number;mode:"content"|"presentation";pages?:string[]}) {
  const u = (k:string,v:any)=>onChange({...block,[k]:v});
  const tpl = block._template as string;

  if (mode==="presentation") {
    const variantOpts = BLOCK_VARIANTS[tpl] ?? [];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <FImage label="Background Image" value={block.backgroundImage??""} onChange={v=>u("backgroundImage",v)} />
        {!["header","footer","whatsapp","location"].includes(tpl) && variantOpts.length > 0 && (
          <FSelect label="Layout Variant" value={block.variant??""} options={variantOpts} onChange={v=>u("variant",v)} />
        )}
        <FCSSField label="CSS Overrides" value={block.css??""} onChange={v=>u("css",v)} />
      </div>
    );
  }

  switch(tpl) {
    case "hero": return <><FRich label="Headline" value={block.headline??""} onChange={v=>u("headline",v)} fieldType="headline" /><FRich label="Subheadline" value={block.subheadline??""} onChange={v=>u("subheadline",v)} rows={2} fieldType="subheadline" /><FImage label="Hero Photo" value={block.photo??""} onChange={v=>u("photo",v)} /><FButtons btns={block.buttons??[]} onChange={v=>u("buttons",v)} /></>;
    case "services": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="Services" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"title",l:"Title",ft:"serviceTitle"},{k:"description",l:"Description",rt:true,ft:"serviceDescription"},{k:"icon",l:"Icon",ico:true}]} /></>;
    case "timings": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="Timings" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"day",l:"Day",ft:"timingDay"},{k:"primary",l:"Primary",ft:"timingSlot"},{k:"secondary",l:"Secondary",ft:"timingSlot"}]} /></>;
    case "gallery": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="Images" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"src",l:"Image",img:true},{k:"alt",l:"Alt Text"}]} /></>;
    case "faq": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="FAQs" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"question",l:"Question",ft:"faqQuestion"},{k:"answer",l:"Answer",rt:true,ft:"faqAnswer"}]} /></>;
    case "cta": return <><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="cta" /><FRich label="Body" value={block.body??""} onChange={v=>u("body",v)} rows={2} fieldType="subheadline" /><FButtons btns={block.buttons??[]} onChange={v=>u("buttons",v)} /></>;
    case "testimonials": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="Testimonials" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"quote",l:"Quote",rt:true,ft:"testimonialQuote"},{k:"author",l:"Author",ft:"testimonialAuthor"}]} /></>;
    case "stats": return <FItems label="Stats" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"value",l:"Value",ft:"statValue"},{k:"label",l:"Label",ft:"statLabel"}]} />;
    case "text": return <><FRich label="Heading" value={block.heading??""} onChange={v=>u("heading",v)} fieldType="sectionTitle" /><FRich label="Body" value={block.body??""} onChange={v=>u("body",v)} rows={3} fieldType="bio" /></>;
    case "header": {
      const navRaw: any[] = Array.isArray(block.navLinks) ? block.navLinks : [];
      const navItems = normalizeNavItems(navRaw);
      return <><FImage label="Logo" value={block.logo??""} onChange={v=>u("logo",v)} /><FNavLinks label="Nav Links" value={navItems} onChange={v=>u("navLinks",v)} pages={pages} /></>;
    }
    case "footer": {
      const socialRaw: any[] = Array.isArray(block.socialLinks) ? block.socialLinks : [];
      const socialItems = normalizeNavItems(socialRaw);
      const linksRaw: any[] = Array.isArray(block.links) ? block.links : [];
      const linksItems = normalizeNavItems(linksRaw);
      return (
        <>
          <FToggle label="Show Business Info" value={block.showBusinessInfo!==false} onChange={v=>u("showBusinessInfo",v)} />
          {block.showBusinessInfo!==false && <>
            <FField label="Address" hint="Overrides business info" value={block.address??""} onChange={v=>u("address",v)} />
            <FField label="Phone" hint="Overrides business info" value={block.phone??""} onChange={v=>u("phone",v)} />
            <FField label="Email" hint="Overrides business info" value={block.email??""} onChange={v=>u("email",v)} />
          </>}
          <FToggle label="All Rights Reserved" value={block.allRightsReserved!==false} onChange={v=>u("allRightsReserved",v)} />
          <FRich label="Copyright Text" value={block.copyright??""} onChange={v=>u("copyright",v)} />
          <FField label="Links Heading" value={block.linksHeading??""} onChange={v=>u("linksHeading",v)} />
          <FNavLinks label="Footer Links" value={linksItems} onChange={v=>u("links",v)} pages={pages} />
          <FField label="Social Heading" value={block.socialHeading??""} onChange={v=>u("socialHeading",v)} />
          <FNavLinks label="Social Links" value={socialItems} onChange={v=>u("socialLinks",v)} defaultType="external" hideType />
        </>
      );
    }
    case "whatsapp": return <><FField label="Phone (with country code)" value={block.phone??""} onChange={v=>u("phone",v)} /><FRich label="Pre-filled Message" value={block.message??""} onChange={v=>u("message",v)} /><FField label="Tooltip" value={block.label??""} onChange={v=>u("label",v)} /></>;
    case "location": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FField label="Map URL or lat,lng" value={block.mapUrl??""} onChange={v=>u("mapUrl",v)} /><FField label="Height (px)" type="number" value={block.height??400} onChange={v=>u("height",v)} /></>;
    case "awards": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Title" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FItems label="Awards" items={block.items??[]} onChange={v=>u("items",v)} fields={[{k:"title",l:"Name",ft:"awardTitle"},{k:"year",l:"Year"},{k:"organization",l:"Org",ft:"awardOrg"}]} /></>;
    case "profile": return <><FField label="Kicker" value={block.kicker??""} onChange={v=>u("kicker",v)} fieldType="kicker" /><FRich label="Display Name" value={block.title??""} onChange={v=>u("title",v)} fieldType="sectionTitle" /><FRich label="Bio" value={block.body??""} onChange={v=>u("body",v)} rows={3} fieldType="bio" /><FField label="Experience (yrs)" type="number" value={block.experienceYears??0} onChange={v=>u("experienceYears",v)} /><FField label="Exp. Label" value={block.experienceLabel??""} onChange={v=>u("experienceLabel",v)} /><FField label="Reg. #" value={block.registrationNumber??""} onChange={v=>u("registrationNumber",v)} /><FField label="Reg. Label" value={block.registrationLabel??""} onChange={v=>u("registrationLabel",v)} /></>;
    default: return <span style={{fontSize:"15px",color:"#64748b"}}>Unknown block: {tpl}</span>;
  }
}

// ─── Site Section Form ──────────────────────────────────────────────────────
// Reads from / writes to site.settings[] array by _template name.
function SiteSectionForm({section,getSetting,updSetting,pages}:{
  section:SiteSection;
  getSetting:(tpl:string)=>any;
  updSetting:(tpl:string,patch:object)=>void;
  pages:string[];
}) {
  const T = useT();
  switch(section) {
    case "profile": {
      const p = getSetting("profile");
      return (<>
        <FField label="Display Name" value={p.displayName??""} onChange={v=>updSetting("profile",{...p,displayName:v})} />
        <FField label="Specialty" value={p.specialty??""} onChange={v=>updSetting("profile",{...p,specialty:v})} />
        <FField label="Degrees (comma-separated)" value={Array.isArray(p.degrees)?p.degrees.join(", "):""} onChange={v=>updSetting("profile",{...p,degrees:v.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
        <FField label="Registration #" value={p.registrationNumber??""} onChange={v=>updSetting("profile",{...p,registrationNumber:v})} />
        <FField label="Experience (years)" type="number" value={p.experienceYears??0} onChange={v=>updSetting("profile",{...p,experienceYears:v})} />
        <FImage label="Profile Photo" value={p.photo??""} onChange={v=>updSetting("profile",{...p,photo:v})} />
        <FRich label="Bio" value={p.bio??""} onChange={v=>updSetting("profile",{...p,bio:v})} rows={4} />
      </>);
    }
    case "business": {
      const b = getSetting("business");
      return (<>
        <FField label="Clinic / Hospital Name" value={b.clinicName??""} onChange={v=>updSetting("business",{...b,clinicName:v})} />
        <FField label="Phone" value={b.phone??""} onChange={v=>updSetting("business",{...b,phone:v})} />
        <FField label="WhatsApp" value={b.whatsapp??""} onChange={v=>updSetting("business",{...b,whatsapp:v})} />
        <FField label="Email" value={b.email??""} onChange={v=>updSetting("business",{...b,email:v})} />
        <FRich label="Address" value={b.address??""} onChange={v=>updSetting("business",{...b,address:v})} rows={2} />
        <FField label="Map URL" value={b.mapUrl??""} onChange={v=>updSetting("business",{...b,mapUrl:v})} />
      </>);
    }
    case "presentation": {
      const pr = getSetting("presentation");
      return (<>
        <FSelect label="Theme Layout" value={pr.themeId??""} options={themeOptions} onChange={v=>updSetting("presentation",{...pr,themeId:v})} />
        <FSelect label="Variant Preset" value={pr.variantPresetId??""} options={variantPresetOptions} onChange={v=>updSetting("presentation",{...pr,variantPresetId:v})} />
        <FSelect label="Style Preset" value={pr.styleId??""} options={styleOptions} onChange={v=>updSetting("presentation",{...pr,styleId:v})} />
        <FieldGroupLabel>Colors</FieldGroupLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[{k:"primary",d:"#2563eb"},{k:"secondary",d:"#64748b"},{k:"accent",d:"#f59e0b"},{k:"background",d:"#ffffff"},{k:"surface",d:"#f8fafc"},{k:"text",d:"#1e293b"}].map(c=>(
            <FColor key={c.k} label={c.k[0].toUpperCase()+c.k.slice(1)}
              value={pr.style?.colors?.[c.k]??c.d}
              onChange={v=>updSetting("presentation",{...pr,style:{...pr.style,colors:{...pr.style?.colors,[c.k]:v}}})} />
          ))}
        </div>
        <FieldGroupLabel>Shape</FieldGroupLabel>
        <FField label="Border Radius (e.g. 8px)" value={pr.style?.shape?.radius??""} onChange={v=>updSetting("presentation",{...pr,style:{...pr.style,shape:{...pr.style?.shape,radius:v}}})} />
        <FieldGroupLabel>Typography</FieldGroupLabel>
        <FField label="Heading Font" value={pr.style?.typography?.heading??""} onChange={v=>updSetting("presentation",{...pr,style:{...pr.style,typography:{...pr.style?.typography,heading:v}}})} />
        <FField label="Body Font" value={pr.style?.typography?.body??""} onChange={v=>updSetting("presentation",{...pr,style:{...pr.style,typography:{...pr.style?.typography,body:v}}})} />
      </>);
    }
    case "header": {
      const h = getSetting("header");
      const navLinksRaw: any[] = Array.isArray(h.navLinks) ? h.navLinks : [];
      const navItems = normalizeNavItems(navLinksRaw);
      return (<>
        <FToggle label="Show Header" value={h.show!==false} onChange={v=>updSetting("header",{...h,show:v})} />
        <FImage label="Logo" value={h.logo??""} onChange={v=>updSetting("header",{...h,logo:v})} />
        <FNavLinks label="Nav Links" value={navItems} onChange={v=>updSetting("header",{...h,navLinks:v})} pages={pages} />
      </>);
    }
    case "footer": {
      const f = getSetting("footer");
      const socialLinksRaw: any[] = Array.isArray(f.socialLinks) ? f.socialLinks : [];
      const socialItems = normalizeNavItems(socialLinksRaw);
      const linksRaw: any[] = Array.isArray(f.links) ? f.links : [];
      const linksItems = normalizeNavItems(linksRaw);
      return (<>
        <FToggle label="Show Footer" value={f.show!==false} onChange={v=>updSetting("footer",{...f,show:v})} />
        <FToggle label="Show Business Info (Address, Phone, Email)" value={f.showBusinessInfo!==false} onChange={v=>updSetting("footer",{...f,showBusinessInfo:v})} />
        {f.showBusinessInfo!==false && <>
          <FField label="Address" hint="Overrides business info" value={f.address??""} onChange={v=>updSetting("footer",{...f,address:v})} />
          <FField label="Phone" hint="Overrides business info" value={f.phone??""} onChange={v=>updSetting("footer",{...f,phone:v})} />
          <FField label="Email" hint="Overrides business info" value={f.email??""} onChange={v=>updSetting("footer",{...f,email:v})} />
        </>}
        <FToggle label="All Rights Reserved" value={f.allRightsReserved!==false} onChange={v=>updSetting("footer",{...f,allRightsReserved:v})} />
        <FRich label="Copyright Text" value={f.copyright??""} onChange={v=>updSetting("footer",{...f,copyright:v})} rows={1} />
        <FField label="Links Heading" value={f.linksHeading??""} onChange={v=>updSetting("footer",{...f,linksHeading:v})} />
        <FNavLinks label="Footer Links" value={linksItems} onChange={v=>updSetting("footer",{...f,links:v})} pages={pages} />
        <FField label="Social Heading" value={f.socialHeading??""} onChange={v=>updSetting("footer",{...f,socialHeading:v})} />
        <FNavLinks label="Social Links" value={socialItems} onChange={v=>updSetting("footer",{...f,socialLinks:v})} defaultType="external" hideType />
      </>);
    }
    case "seo": {
      const seo = getSetting("seo");
      return (<>
        <FField label="Title" value={seo.title??""} onChange={v=>updSetting("seo",{...seo,title:v})} />
        <FRich label="Description" value={seo.description??""} onChange={v=>updSetting("seo",{...seo,description:v})} rows={2} />
        <FField label="Keywords (comma-separated)" value={Array.isArray(seo.keywords)?seo.keywords.join(", "):""} onChange={v=>updSetting("seo",{...seo,keywords:v.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
        <FImage label="OG Image" value={seo.ogImage??""} onChange={v=>updSetting("seo",{...seo,ogImage:v})} />
      </>);
    }
    case "analytics": {
      const a = getSetting("analytics");
      const scripts: {code:string;inHead:boolean}[] = Array.isArray(a.customScripts) ? a.customScripts : [];
      const setScripts = (s: {code:string;inHead:boolean}[]) => updSetting("analytics",{...a,customScripts:s});
      return (<>
        <FieldGroupLabel>Google Analytics / Tag Manager</FieldGroupLabel>
        <FField label="GA Measurement ID" value={a.gaMeasurementId??""} onChange={v=>updSetting("analytics",{...a,gaMeasurementId:v})} />
        <FField label="GTM Container ID" value={a.gtmContainerId??""} onChange={v=>updSetting("analytics",{...a,gtmContainerId:v})} />
        <FieldGroupLabel>Meta / Facebook Pixel</FieldGroupLabel>
        <FField label="Meta Pixel ID" value={a.metaPixelId??""} onChange={v=>updSetting("analytics",{...a,metaPixelId:v})} />

        {/* ── Custom Scripts ── */}
        <FieldGroupLabel>Custom Scripts</FieldGroupLabel>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {scripts.map((sc,idx) => (
            <CustomScriptItem
              key={idx}
              script={sc}
              index={idx}
              total={scripts.length}
              onChange={updated => {
                const n = [...scripts];
                n[idx] = updated;
                setScripts(n);
              }}
              onRemove={() => setScripts(scripts.filter((_,j)=>j!==idx))}
              onMove={(dir) => {
                const n = [...scripts];
                const swap = idx + dir;
                if (swap < 0 || swap >= n.length) return;
                [n[idx],n[swap]] = [n[swap],n[idx]];
                setScripts(n);
              }}
            />
          ))}
          <button
            onClick={() => setScripts([...scripts, {code:"", inHead:false}])}
            style={{
              padding:"7px 14px", borderRadius:4,
              border:`1px dashed ${T.accent}`, background:`${T.accent}10`,
              color:T.accent, fontSize:"13px", fontWeight:600,
              cursor:"pointer", fontFamily:"inherit", transition:"all .12s",
            }}>
            + Add Script
          </button>
        </div>
      </>);
    }
    default: return null;
  }
}

// ─── CustomScriptItem — one entry in the analytics custom scripts list ───────
function CustomScriptItem({
  script, index, total, onChange, onRemove, onMove,
}: {
  script: {code:string;inHead:boolean};
  index: number; total: number;
  onChange:(s:{code:string;inHead:boolean})=>void;
  onRemove:()=>void;
  onMove:(dir:1|-1)=>void;
}) {
  const T = useT();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      background:T.bg, borderRadius:6,
      border:`1px solid ${T.border}`, overflow:"hidden",
    }}>
      {/* Header row */}
      <div style={{
        display:"flex", alignItems:"center", gap:6,
        padding:"6px 10px", borderBottom:`1px solid ${T.border}`,
        background:T.surface,
      }}>
        <span style={{fontSize:"13px",fontWeight:600,color:T.textSub,flex:1}}>
          Script {index + 1}
        </span>

        {/* in <head> toggle */}
        <label style={{
          display:"flex", alignItems:"center", gap:5, cursor:"pointer",
          fontSize:"12px", color: script.inHead ? T.accent : T.textMute,
          fontWeight:600, letterSpacing:".2px",
          padding:"3px 8px", borderRadius:4,
          border:`1px solid ${script.inHead ? T.accent : T.borderMd}`,
          background: script.inHead ? `${T.accent}15` : "transparent",
          transition:"all .15s",
        }}>
          <input
            type="checkbox" checked={script.inHead}
            onChange={e => onChange({...script, inHead:e.target.checked})}
            style={{accentColor:T.accent, width:12, height:12, cursor:"pointer"}}
          />
          &lt;head&gt;
        </label>

        {/* Move up/down */}
        <button onClick={()=>onMove(-1)} disabled={index===0}
          style={{padding:"2px 6px",border:"none",background:"transparent",color:index===0?T.textDim:T.textMute,cursor:index===0?"default":"pointer",fontSize:"13px",fontFamily:"inherit",borderRadius:3}}
          title="Move up">↑</button>
        <button onClick={()=>onMove(1)} disabled={index===total-1}
          style={{padding:"2px 6px",border:"none",background:"transparent",color:index===total-1?T.textDim:T.textMute,cursor:index===total-1?"default":"pointer",fontSize:"13px",fontFamily:"inherit",borderRadius:3}}
          title="Move down">↓</button>

        {/* Remove */}
        <button onClick={onRemove}
          style={{padding:"2px 7px",border:"1px solid transparent",background:"transparent",color:T.textMute,cursor:"pointer",fontSize:"13px",fontFamily:"inherit",borderRadius:3,transition:"all .12s"}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.red;(e.currentTarget as HTMLButtonElement).style.borderColor=T.red;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.textMute;(e.currentTarget as HTMLButtonElement).style.borderColor="transparent";}}
          title="Remove">✕</button>
      </div>

      {/* Code textarea */}
      <div style={{padding:"8px 10px"}}>
        <div style={{fontSize:"11px",color:T.textMute,marginBottom:4,letterSpacing:".3px"}}>
          Paste full &lt;script&gt;…&lt;/script&gt; or raw JS · injects {script.inHead ? "in <head>" : "before </body>"}
        </div>
        <textarea
          value={script.code}
          onChange={e => onChange({...script, code:e.target.value})}
          rows={5}
          placeholder={"<script>\n  // your code here\n</script>"}
          style={{
            ...inputBase(T, focused),
            resize:"vertical", minHeight:90,
            fontFamily:"'SF Mono','Fira Code',monospace", fontSize:"12px",
            lineHeight:1.6,
          }}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
        />
      </div>
    </div>
  );
}

function FieldGroupLabel({children}:{children:React.ReactNode}) {
  const T = useT();
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0 2px"}}>
      <span style={{fontSize:"15px",fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:".8px",whiteSpace:"nowrap"}}>{children}</span>
      <div style={{flex:1,height:"1px",background:T.border}} />
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyBlockState({onAdd}:{onAdd:(tpl:string)=>void}) {
  const T = useT();
  return (
    <div style={{padding:"40px 16px",textAlign:"center",borderRadius:4,border:`1px dashed ${T.borderMd}`,background:T.surface}}>
      <div style={{fontSize:"28px",marginBottom:10,opacity:.4}}>▤</div>
      <p style={{color:T.textSub,fontSize:"15px",margin:"0 0 6px",fontWeight:600,letterSpacing:".1px"}}>No blocks yet</p>
      <p style={{color:T.textMute,fontSize:"14px",margin:"0 0 18px"}}>Add a block below to start building your page</p>
      <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
        {["hero","services","cta","footer"].map(tpl=>(
          <button key={tpl} onClick={()=>onAdd(tpl)} style={{
            padding:"5px 12px", borderRadius:4, border:`1px solid ${T.borderMd}`,
            background:"transparent", color:T.textSub, fontSize:"14px", fontWeight:600,
            cursor:"pointer", fontFamily:"inherit", transition:"all .12s",
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.accent;(e.currentTarget as HTMLButtonElement).style.color=T.accent;(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}10`;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=T.textSub;(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
            + {variantLabels[tpl]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Add Block Menu ──────────────────────────────────────────────────────────
function AddBlockMenu({onAdd}:{onAdd:(tpl:string)=>void}) {
  const T = useT();
  const [open,setOpen] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", padding:"7px 12px", border:`1px dashed ${T.borderMd}`, borderRadius:4,
        background:"transparent", color:T.textMute, fontSize:"14px", fontWeight:600,
        cursor:"pointer", fontFamily:"inherit", transition:"all .12s", letterSpacing:".2px",
      }}
      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.accent;(e.currentTarget as HTMLButtonElement).style.color=T.accent;(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}0A`;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=T.textMute;(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
        + Add Block
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:200,
          background:T.surface, border:`1px solid ${T.borderMd}`,
          borderRadius:4, padding:4, maxHeight:260, overflow:"auto",
          boxShadow:T.shadowMd,
        }} onClick={()=>setOpen(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1}}>
            {blockTypes.filter(t=>!["header","footer"].includes(t)).map(tpl=>(
              <button key={tpl} onClick={()=>onAdd(tpl)} style={{
                padding:"7px 10px", border:"none", background:"transparent",
                color:T.textSub, fontSize:"14px", textAlign:"left", cursor:"pointer",
                borderRadius:3, fontFamily:"inherit", transition:"all .10s",
              }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}14`;(e.currentTarget as HTMLButtonElement).style.color=T.text;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color=T.textSub;}}>
                {variantLabels[tpl]??tpl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field Primitives (prefixed F to keep concise) ───────────────────────────
function FField({label,value,onChange,type,fieldType,hint}:{label:string;value:any;onChange:(v:any)=>void;type?:string;fieldType?:SuggestionFieldType;hint?:string}) {
  const T = useT();
  const {specialty,experienceYears} = useSpecialty();
  const [focused,setFocused] = useState(false);
  const [suggEl,setSuggEl] = useState<HTMLElement|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = inputBase(T, focused);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.code === "Space" && fieldType) {
      e.preventDefault();
      setSuggEl(inputRef.current);
    }
  };
  return (
    <div style={{position:"relative"}}>
      <label style={{...lbl(T), ...(hint ? {marginBottom:2} : {})}}>
        {label}
        {fieldType && <span style={{marginLeft:5,fontSize:"14px",fontWeight:400,color:T.textMute,letterSpacing:0,textTransform:"none",verticalAlign:"middle"}}>⌃Space</span>}
      </label>
      {hint && <div style={{fontSize:"11px",color:T.textMute,marginBottom:5,letterSpacing:".1px",textTransform:"none",fontWeight:400,lineHeight:1.35}}>{hint}</div>}
      {type==="number"
        ? <input ref={inputRef} type="number" value={value??""} onChange={e=>onChange(e.target.value===""?undefined:Number(e.target.value))} style={s} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
        : <input ref={inputRef} type="text" value={typeof value==="string"?value:value==null?"":String(value)} onChange={e=>onChange(e.target.value)} style={s} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onKeyDown={handleKeyDown} />
      }
      {suggEl && fieldType && (
        <SuggestionPopup
          anchorEl={suggEl}
          context={{fieldType, specialty, experienceYears}}
          onSelect={v=>{onChange(v);setSuggEl(null);}}
          onClose={()=>setSuggEl(null)}
        />
      )}
    </div>
  );
}

function FTextarea({label,value,onChange,rows=3}:{label:string;value:string;onChange:(v:string)=>void;rows?:number}) {
  const T = useT();
  const [focused,setFocused] = useState(false);
  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{...inputBase(T,focused),resize:"vertical",minHeight:rows*34}}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
    </div>
  );
}

function FSelect({label,value,options,onChange}:{label:string;value:string;options:{v:string;l:string}[];onChange:(v:string)=>void}) {
  const T = useT();
  const [focused,setFocused] = useState(false);
  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      <select value={value??""} onChange={e=>onChange(e.target.value)}
        style={{...inputBase(T,focused),cursor:"pointer"}}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}>
        <option value="">— {label} —</option>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

// ─── FIconPicker — tabbed SVG icon picker ───────────────────────────────────
const ICON_TABS: {key:string;label:string;ids:string[];emoji?:true}[] = [
  { key:"medical",    label:"Medical",
    ids:["stethoscope","heart-pulse","syringe","bandage","pill","thermometer","brain","bone","heart","lungs","tooth","eye","baby","dna","microscope","ambulance","hospital","ribbon","siren","activity"] },
  { key:"people",     label:"People",
    ids:["users","user-check","smile","award","certificate","shield","star","check","lock","verified"] },
  { key:"contact",    label:"Contact",
    ids:["calendar","clock","phone","mail","map-pin","whatsapp","video","globe"] },
  { key:"facilities", label:"Facilts.",
    ids:["building","home","car","chart","document","sparkles","zap","leaf","sun","info","arrow-right"] },
  { key:"social",     label:"Social",
    ids:["facebook","twitter","instagram","linkedin","youtube"] },
  { key:"emoji",      label:"Emoji",
    ids:iconOptions.map(o=>o.v), emoji:true },
  { key:"others",     label:"Others",
    ids:["heartFill","cross","scan","graduation","user","checkCircle"] },
];

function FIconPicker({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  const T = useT();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pos, setPos] = useState({ top:0, left:0, width:0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const selected = iconOptions.find(o => o.v === value);

  // Close on click outside — no backdrop so the editor stays scrollable
  useEffect(()=>{
    if (!open) return;
    const h = (e:MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropW = Math.max(r.width, 292);
      const left  = Math.min(r.left, window.innerWidth - dropW - 8);
      setPos({ top: r.bottom + 4, left, width: dropW });
    }
    setOpen(o => !o);
  };

  const tab = ICON_TABS[activeTab];

  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      <div style={{position:"relative"}}>
        {/* Trigger */}
        <button ref={btnRef} onClick={handleOpen} style={{
          width:"100%", padding:"7px 10px", borderRadius:4,
          border:`1px solid ${open ? T.borderFocus : T.borderMd}`,
          boxShadow: open ? `0 0 0 1px ${T.accent},0 0 0 3px ${T.accent}28` : "none",
          background:T.input, color:T.text, fontSize:"14px", cursor:"pointer",
          fontFamily:"inherit", textAlign:"left", display:"flex", alignItems:"center", gap:8,
          transition:"border-color .12s, box-shadow .12s", outline:"none",
        }}>
          <span style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.text}}>
            {value ? iconElement(value,{width:18,height:18}) : <span style={{color:T.textMute,fontSize:16,lineHeight:1}}>—</span>}
          </span>
          <span style={{flex:1,color:selected?T.text:T.textMute,fontSize:"15px"}}>{selected?.l ?? "None"}</span>
          <span style={{color:T.textMute,fontSize:"13px",flexShrink:0,transition:"transform .12s",transform:open?"rotate(180deg)":"none"}}>▾</span>
        </button>

        {/* Fixed-position dropdown — no backdrop so editor scroll is unblocked */}
        {open && (
          <div ref={dropRef} style={{
            position:"fixed", top:pos.top, left:pos.left, width:pos.width, zIndex:9999,
            background:T.surface, border:`1px solid ${T.borderMd}`,
            borderRadius:6, boxShadow:T.shadowMd,
          }}>
            <div style={{display:"flex",borderBottom:`1px solid ${T.borderMd}`,borderRadius:"6px 6px 0 0",
              background:T.isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",overflow:"hidden"}}>
              {ICON_TABS.map((t,i)=>(
                <button key={t.key} onClick={()=>setActiveTab(i)} style={{
                  flex:1, padding:"7px 2px", fontSize:"11px", fontWeight:500, border:"none",
                  borderBottom: i===activeTab?`2px solid ${T.accent}`:"2px solid transparent",
                  background:"transparent", color:i===activeTab?T.accent:T.textMute,
                  cursor:"pointer", fontFamily:"inherit", transition:"color .1s,border-color .1s",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{padding:8}}>
              <button onClick={()=>{onChange("");setOpen(false);}} style={{
                width:"100%", padding:"4px 8px", textAlign:"left", marginBottom:6,
                border:`1px solid ${!value?T.accent:"transparent"}`,
                background:!value?`${T.accent}18`:"transparent",
                color:!value?T.accent:T.textMute,
                fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
                borderRadius:4, transition:"all .1s",
                display:"flex", alignItems:"center", gap:5,
              }}><span style={{fontSize:13,lineHeight:1,fontWeight:600}}>✕</span> Clear</button>
              <div onWheel={e=>e.stopPropagation()} style={{
                display:"grid",
                gridTemplateColumns:tab.emoji?"repeat(auto-fill,minmax(44px,1fr))":"repeat(auto-fill,minmax(52px,1fr))",
                gap:3, maxHeight:204, overflowY:"scroll",
              }}>
                {tab.ids.map(id=>{
                  const opt = iconOptions.find(o=>o.v===id);
                  if (!opt) return null;
                  const sel = value===opt.v;
                  return (
                    <button key={opt.v} onClick={()=>{onChange(opt.v);setOpen(false);}} title={opt.l}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",
                        padding:tab.emoji?"5px 2px 4px":"7px 3px 5px",borderRadius:5,cursor:"pointer",
                        border:`1px solid ${sel?T.accent:"transparent"}`,
                        background:sel?`${T.accent}20`:"transparent",
                        color:sel?T.accent:T.text,fontFamily:"inherit",transition:"all .1s"}}
                      onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}0C`;}}
                      onMouseLeave={e=>{if(!sel)(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
                      {tab.emoji
                        ? <span style={{fontSize:20,lineHeight:1.3}}>{opt.e}</span>
                        : <span style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>{iconElement(opt.v,{width:18,height:18})}</span>}
                      <span style={{fontSize:9,color:T.textMute,marginTop:2,lineHeight:1.2,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:"100%"}}>
                        {opt.l.length>9?opt.l.slice(0,8)+"…":opt.l}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FToggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}) {
  const T = useT();
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 0"}}>
      <span style={{...lbl(T),marginBottom:0}}>{label}</span>
      {/* Heroku toggle: Purple-40 when on, borderMd when off */}
      <div onClick={()=>onChange(!value)} style={{
        width:38, height:20, borderRadius:10,
        background: value ? T.accent : T.borderMd,
        position:"relative", cursor:"pointer",
        transition:"background .18s", flexShrink:0,
        boxShadow:`inset 0 1px 2px rgba(0,0,0,.25)`,
      }}>
        <div style={{
          position:"absolute", top:2, left:value?20:2,
          width:16, height:16, borderRadius:"50%", background:"white",
          boxShadow:"0 1px 4px rgba(0,0,0,.3)", transition:"left .16s",
        }} />
      </div>
    </div>
  );
}

function FColor({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  const T = useT();
  // Local text state prevents the pink "invalid hex" flicker while typing
  const [text, setText] = useState(value ?? "");
  useEffect(() => { setText(value ?? ""); }, [value]);

  const handleText = (raw: string) => {
    setText(raw);
    // Only push to parent when it's a valid 6-digit hex
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) onChange(raw);
  };

  // Swatch only gets a value when it's valid (avoids pink state)
  const swatchVal = /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value : "#000000";

  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <input type="color" value={swatchVal}
          onChange={e=>{ onChange(e.target.value); setText(e.target.value); }}
          style={{width:30,height:30,borderRadius:6,border:`1px solid ${T.borderMd}`,padding:0,cursor:"pointer",background:"none",flexShrink:0}} />
        <input type="text" value={text} onChange={e=>handleText(e.target.value)}
          placeholder="#rrggbb"
          style={{...inputBase(T,false),fontSize:"14px",fontFamily:"'SF Mono',monospace"}} />
      </div>
    </div>
  );
}

function FImage({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  const T = useT();
  const [pickerOpen,setPickerOpen] = useState(false);
  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      {value ? (
        <div style={{position:"relative",marginBottom:8,borderRadius:7,overflow:"hidden",border:`1px solid ${T.border}`}}>
          <img src={value} alt="" style={{width:"100%",maxHeight:140,objectFit:"cover",display:"block"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.0)",transition:"background .15s"}}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(0,0,0,.15)"}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(0,0,0,.0)"}>
            <button onClick={()=>onChange("")} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,.6)",color:"white",border:"none",cursor:"pointer",fontSize:"14px",lineHeight:1,backdropFilter:"blur(2px)"}}>×</button>
          </div>
        </div>
      ) : (
        <div onClick={()=>setPickerOpen(true)} style={{
          height:56, border:`1px dashed ${T.borderMd}`, borderRadius:4,
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          color:T.textMute, fontSize:"14px", marginBottom:6, cursor:"pointer", transition:"all .12s",
        }}
        onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=T.accent;(e.currentTarget as HTMLDivElement).style.color=T.accent;(e.currentTarget as HTMLDivElement).style.background=`${T.accent}08`;}}
        onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=T.borderMd;(e.currentTarget as HTMLDivElement).style.color=T.textMute;(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
          + Select Image
        </div>
      )}
      <button onClick={()=>setPickerOpen(true)} style={{
        width:"100%", padding:"6px 10px", border:`1px solid ${T.borderMd}`, borderRadius:4,
        background:"transparent", color:T.textMute, fontSize:"14px", cursor:"pointer",
        fontFamily:"inherit", transition:"all .12s",
      }}
      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.accent;(e.currentTarget as HTMLButtonElement).style.color=T.accent;(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}0A`;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=T.textMute;(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
        {value ? "Change image…" : "Browse images…"}
      </button>
      {pickerOpen && <ImagePickerModal current={value} onSelect={onChange} onClose={()=>setPickerOpen(false)} />}
    </div>
  );
}

// ─── CSS value hints (Chrome DevTools-style per-property suggestions) ────────
const CSS_VALUE_HINTS: Record<string, string[]> = {
  "display":          ["block","flex","grid","inline","inline-flex","inline-block","none","contents","table"],
  "position":         ["static","relative","absolute","fixed","sticky"],
  "flex-direction":   ["row","column","row-reverse","column-reverse"],
  "flex-wrap":        ["nowrap","wrap","wrap-reverse"],
  "justify-content":  ["flex-start","flex-end","center","space-between","space-around","space-evenly"],
  "align-items":      ["flex-start","flex-end","center","stretch","baseline"],
  "align-self":       ["auto","flex-start","flex-end","center","stretch","baseline"],
  "text-align":       ["left","center","right","justify","start","end"],
  "text-transform":   ["none","uppercase","lowercase","capitalize"],
  "text-decoration":  ["none","underline","line-through","overline"],
  "font-weight":      ["100","200","300","400","500","600","700","800","900","bold","normal","lighter","bolder"],
  "font-style":       ["normal","italic","oblique"],
  "overflow":         ["visible","hidden","scroll","auto","clip"],
  "overflow-x":       ["visible","hidden","scroll","auto"],
  "overflow-y":       ["visible","hidden","scroll","auto"],
  "cursor":           ["pointer","default","text","move","not-allowed","grab","grabbing","zoom-in","crosshair","ns-resize","ew-resize"],
  "visibility":       ["visible","hidden","collapse"],
  "white-space":      ["normal","nowrap","pre","pre-wrap","pre-line"],
  "box-sizing":       ["border-box","content-box"],
  "background-size":  ["cover","contain","auto","100%","100% 100%"],
  "background-position":  ["center","top","bottom","left","right","center center","top center","bottom center"],
  "background-repeat":    ["no-repeat","repeat","repeat-x","repeat-y"],
  "background-attachment":["scroll","fixed","local"],
  "border-style":     ["solid","dashed","dotted","none","double","groove","ridge","inset","outset"],
  "object-fit":       ["fill","contain","cover","none","scale-down"],
  "pointer-events":   ["none","auto","all"],
  "user-select":      ["none","auto","text","all"],
  "resize":           ["none","both","horizontal","vertical"],
  "vertical-align":   ["baseline","top","middle","bottom","text-top","text-bottom","sub","super"],
  "float":            ["none","left","right"],
  "mix-blend-mode":   ["normal","multiply","screen","overlay","darken","lighten","difference","exclusion"],
  "word-break":       ["normal","break-all","keep-all","break-word"],
  "grid-auto-flow":   ["row","column","dense","row dense","column dense"],
  "transition-timing-function": ["ease","linear","ease-in","ease-out","ease-in-out","cubic-bezier(0.4,0,0.2,1)"],
  "animation-fill-mode":        ["none","forwards","backwards","both"],
  "animation-iteration-count":  ["1","2","infinite"],
};

// CSS text ↔ object helpers
function cssobjToText(obj: Record<string,string>): string {
  return Object.entries(obj).map(([k,v]) => `${k}: ${v};`).join("\n");
}
function textToCssobj(text: string): Record<string,string> {
  const out: Record<string,string> = {};
  text.split(/[\n;]/).forEach(line => {
    const ci = line.indexOf(":");
    if (ci < 1) return;
    const k = line.slice(0, ci).trim();
    const v = line.slice(ci + 1).trim();
    if (k && v) out[k] = v;
  });
  return out;
}
const isCssPropColor = (k: string) => /color|background(-color)?$/.test(k);

// ─── FCSSField — button that opens the CSS editor popup ────────────────────
function FCSSField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const T = useT();
  const [open, setOpen] = useState(false);
  const propCount = useMemo(() => {
    try {
      const obj = JSON.parse(value || "{}");
      const base   = ("base" in obj ? obj.base : obj) || {};
      const mobile = obj.mobile || {};
      const tablet = obj.tablet || {};
      return Object.keys(base).length + Object.keys(mobile).length + Object.keys(tablet).length;
    } catch { return 0; }
  }, [value]);
  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      <button onClick={() => setOpen(true)} style={{
        width:"100%", padding:"7px 12px", borderRadius:4,
        border:`1px solid ${propCount > 0 ? T.accent : T.borderMd}`,
        background: propCount > 0 ? `${T.accent}10` : "transparent",
        color: propCount > 0 ? T.accent : T.textMute,
        fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"inherit",
        display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .12s",
      }}
      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.accent;(e.currentTarget as HTMLButtonElement).style.color=T.accent;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=propCount>0?T.accent:T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=propCount>0?T.accent:T.textMute;}}>
        <span>CSS Overrides{propCount > 0 ? ` · ${propCount} rule${propCount!==1?"s":""}` : ""}</span>
        <span style={{fontSize:"14px",opacity:.7}}>⚙</span>
      </button>
      {open && <CSSEditorModal value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── CSSEditorModal — Chrome DevTools-style CSS property editor ────────────
function CSSEditorModal({ value, onChange, onClose }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
}) {
  const T = useT();
  const [tab, setTab] = useState<Breakpoint>("base");
  const [rawMode, setRawMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const init = useMemo((): Record<Breakpoint, Record<string,string>> => {
    try {
      const obj = JSON.parse(value || "{}");
      if ("base" in obj || "mobile" in obj || "tablet" in obj) {
        return { base: obj.base??{}, mobile: obj.mobile??{}, tablet: obj.tablet??{} };
      }
      return { base: obj, mobile: {}, tablet: {} };
    } catch { return { base:{}, mobile:{}, tablet:{} }; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [bps, setBps] = useState<Record<Breakpoint, Record<string,string>>>(init);
  // Raw CSS text per breakpoint (only used in raw mode)
  const [rawTexts, setRawTexts] = useState<Record<Breakpoint, string>>({
    base:   cssobjToText(init.base),
    mobile: cssobjToText(init.mobile),
    tablet: cssobjToText(init.tablet),
  });

  const toggleRaw = () => {
    if (!rawMode) {
      // Sync structured → raw CSS text
      setRawTexts({ base: cssobjToText(bps.base), mobile: cssobjToText(bps.mobile), tablet: cssobjToText(bps.tablet) });
    } else {
      // Parse raw CSS text → structured
      try {
        setBps({ base: textToCssobj(rawTexts.base), mobile: textToCssobj(rawTexts.mobile), tablet: textToCssobj(rawTexts.tablet) });
        setError(null);
      } catch { setError("Could not parse CSS — check syntax"); return; }
    }
    setRawMode(r => !r);
  };

  const apply = () => {
    let finalBps = bps;
    if (rawMode) {
      try {
        finalBps = { base: textToCssobj(rawTexts.base), mobile: textToCssobj(rawTexts.mobile), tablet: textToCssobj(rawTexts.tablet) };
      } catch { setError("Could not parse CSS"); return; }
    }
    onChange(JSON.stringify(finalBps));
    onClose();
  };

  const setProperty  = (bp: Breakpoint, k: string, v: string) => setBps(p => ({ ...p, [bp]: { ...p[bp], [k]: v } }));
  const removeProperty = (bp: Breakpoint, k: string) => setBps(p => { const { [k]: _, ...rest } = p[bp]; return { ...p, [bp]: rest }; });
  const renameProperty = (bp: Breakpoint, oldK: string, newK: string, v: string) =>
    setBps(p => { const { [oldK]: _, ...rest } = p[bp]; return newK ? { ...p, [bp]: { ...rest, [newK]: v } } : { ...p, [bp]: rest }; });

  const totalRules = Object.values(bps).reduce((s, o) => s + Object.keys(o).length, 0);

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:T.overlay,zIndex:800}} />
      <div style={{
        position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:"min(720px,96vw)",maxHeight:"min(640px,92vh)",
        background:T.bg,border:`1px solid ${T.borderMd}`,borderRadius:6,
        zIndex:900,display:"flex",flexDirection:"column",boxShadow:T.shadowMd,
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderBottom:`1px solid ${T.borderMd}`,background:T.surface,borderRadius:"6px 6px 0 0",flexShrink:0}}>
          <span style={{fontSize:"14px",fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:".7px"}}>CSS Overrides</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={toggleRaw} style={{
              padding:"4px 10px", borderRadius:4,
              border:`1px solid ${rawMode?T.accent:T.borderMd}`,
              background:rawMode?`${T.accent}16`:"transparent",
              color:rawMode?T.accent:T.textMute, fontSize:"14px", fontWeight:600,
              cursor:"pointer", fontFamily:"inherit",
            }}>Raw CSS</button>
            <button onClick={onClose} style={{padding:"4px 8px",border:`1px solid ${T.borderMd}`,background:"transparent",color:T.textMute,borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}>✕</button>
          </div>
        </div>

        {/* Breakpoint tabs — Heroku underline */}
        <div style={{display:"flex",borderBottom:`1px solid ${T.borderMd}`,padding:"0 16px",background:T.surface,flexShrink:0,alignItems:"center"}}>
          {(["base","mobile","tablet"] as Breakpoint[]).map(bp => {
            const cnt = rawMode ? Object.keys(textToCssobj(rawTexts[bp])).length : Object.keys(bps[bp]).length;
            return (
              <button key={bp} onClick={()=>setTab(bp)} style={{
                padding:"8px 12px", border:"none", cursor:"pointer", background:"transparent",
                fontFamily:"inherit", fontSize:"14px", fontWeight:tab===bp?600:400,
                color:tab===bp?T.accent:T.textMute,
                borderBottom:tab===bp?`2px solid ${T.accent}`:"2px solid transparent",
                transition:"color .12s", display:"flex", alignItems:"center", gap:5, flexShrink:0,
                marginBottom:"-1px",
              }}>
                {bp[0].toUpperCase()+bp.slice(1)}
                {cnt > 0 && <span style={{fontSize:"15px",background:tab===bp?T.accent:T.borderMd,color:tab===bp?"#fff":T.textSub,padding:"1px 5px",borderRadius:3,fontWeight:700}}>{cnt}</span>}
              </button>
            );
          })}
          <span style={{flex:1,textAlign:"right",fontSize:"15px",color:T.textMute,paddingRight:4}}>
            {tab==="mobile"?"< 768px":tab==="tablet"?"768–1023px":"all screens"}
          </span>
        </div>

        {/* Body */}
        <div style={{flex:1,overflow:"auto",padding:"10px 18px 16px"}}>
          {rawMode ? (
            <div>
              <p style={{margin:"0 0 8px",fontSize:"14px",color:T.textMute}}>
                CSS for <strong>{tab}</strong> · one declaration per line
              </p>
              <textarea
                value={rawTexts[tab]}
                onChange={e=>setRawTexts(r=>({...r,[tab]:e.target.value}))}
                spellCheck={false}
                placeholder={"background-color: #fff;\npadding: 24px 32px;\nfont-size: 18px;"}
                style={{
                  width:"100%",height:"320px",padding:"12px 14px",borderRadius:6,
                  border:`1px solid ${T.borderMd}`,background:T.input,color:T.text,
                  fontFamily:"'SF Mono','Fira Code','Consolas',monospace",
                  fontSize:"14px",lineHeight:1.85,resize:"vertical",outline:"none",boxSizing:"border-box",
                }}
              />
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div style={{display:"flex",alignItems:"center",padding:"0 0 4px",borderBottom:`1px solid ${T.border}`,marginBottom:4}}>
                <span style={{flex:"0 0 200px",fontSize:"15px",fontWeight:600,color:T.textMute,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:8}}>Property</span>
                <span style={{flex:1,fontSize:"15px",fontWeight:600,color:T.textMute,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:8}}>Value</span>
              </div>
              {Object.keys(bps[tab]).length === 0 && (
                <div style={{padding:"24px",textAlign:"center",color:T.textMute,fontSize:"15px",border:`1px dashed ${T.borderMd}`,borderRadius:6,margin:"6px 0"}}>
                  No rules yet for <strong>{tab}</strong>. Click "Add property" below.
                </div>
              )}
              {Object.entries(bps[tab]).map(([key, val]) => (
                <CSSPropertyRow key={key}
                  propKey={key} propValue={val}
                  onKeyChange={nk => renameProperty(tab, key, nk, val)}
                  onValueChange={nv => setProperty(tab, key, nv)}
                  onRemove={() => removeProperty(tab, key)}
                />
              ))}
              <AddCSSPropertyRow onAdd={(k, v) => setProperty(tab, k, v)} />
            </div>
          )}
          {error && <p style={{color:T.red,fontSize:"14px",margin:"8px 0 0"}}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{padding:"10px 16px",borderTop:`1px solid ${T.borderMd}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.surface,borderRadius:"0 0 6px 6px"}}>
          <span style={{fontSize:"15px",color:T.textMute,letterSpacing:".1px"}}>{totalRules} rule{totalRules!==1?"s":""} total</span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={onClose} style={{padding:"6px 16px",borderRadius:4,border:`1px solid ${T.borderMd}`,background:"transparent",color:T.textMute,fontSize:"15px",fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={apply} style={{padding:"6px 16px",borderRadius:4,border:"none",background:T.accent,color:"white",fontSize:"15px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Apply</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CSSPropertyRow — single editable property:value; line ─────────────────
function CSSPropertyRow({ propKey, propValue, onKeyChange, onValueChange, onRemove }: {
  propKey: string; propValue: string;
  onKeyChange: (k: string) => void;
  onValueChange: (v: string) => void;
  onRemove: () => void;
}) {
  const T = useT();
  const [keyDraft, setKeyDraft] = useState(propKey);
  const [valDraft, setValDraft] = useState(propValue);
  const [keyFocused, setKeyFocused] = useState(false);
  const [valFocused, setValFocused] = useState(false);
  const [keySuggIdx, setKeySuggIdx] = useState(-1);
  const [valSuggIdx, setValSuggIdx] = useState(-1);
  const valRef = useRef<HTMLInputElement>(null);

  useEffect(() => setKeyDraft(propKey), [propKey]);
  useEffect(() => setValDraft(propValue), [propValue]);

  const keySuggs = keyDraft.trim()
    ? COMMON_CSS_PROPS.filter(p => p.toLowerCase().includes(keyDraft.toLowerCase()) && p !== keyDraft).slice(0, 7)
    : [];
  const valHints = CSS_VALUE_HINTS[propKey] ?? [];
  const filteredHints = valDraft.trim()
    ? valHints.filter(h => h.toLowerCase().startsWith(valDraft.toLowerCase()) && h !== valDraft)
    : valHints.slice(0, 7);

  const colorProp = isCssPropColor(propKey);

  return (
    <div style={{display:"flex",alignItems:"center",gap:0,borderBottom:`1px solid ${T.border}`,minHeight:30}}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=`${T.accent}05`}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
      {/* Property name */}
      <div style={{position:"relative",flex:"0 0 200px"}}>
        <input type="text" value={keyDraft}
          onChange={e=>{setKeyDraft(e.target.value);setKeySuggIdx(-1);}}
          onFocus={()=>setKeyFocused(true)}
          onBlur={()=>{
            setTimeout(()=>setKeyFocused(false),120);
            const k = keyDraft.trim();
            if (k && k !== propKey) onKeyChange(k);
          }}
          onKeyDown={e=>{
            if(e.key==="ArrowDown"){e.preventDefault();setKeySuggIdx(i=>Math.min(i+1,keySuggs.length-1));}
            if(e.key==="ArrowUp"){e.preventDefault();setKeySuggIdx(i=>Math.max(i-1,-1));}
            if(e.key==="Enter"||e.key==="Tab"){
              e.preventDefault();
              const k = (keySuggIdx>=0&&keySuggs[keySuggIdx])||keyDraft.trim();
              setKeyDraft(k); onKeyChange(k); setKeySuggIdx(-1); setKeyFocused(false);
              setTimeout(()=>valRef.current?.focus(),10);
            }
            if(e.key==="Escape"){setKeyDraft(propKey);setKeyFocused(false);}
          }}
          style={{
            width:"100%",padding:"5px 8px",border:"none",outline:"none",
            background:keyFocused?T.input:"transparent",
            borderRadius:keyFocused?4:0,
            color:T.accent,fontSize:"15px",
            fontFamily:"'SF Mono','Fira Code','Consolas',monospace",
            fontWeight:500,boxSizing:"border-box",transition:"background .1s",
          }}
        />
        {keyFocused && keySuggs.length > 0 && (
          <CSSDropdown items={keySuggs} activeIdx={keySuggIdx}
            onSelect={k=>{setKeyDraft(k);onKeyChange(k);setKeyFocused(false);setTimeout(()=>valRef.current?.focus(),10);}} />
        )}
      </div>
      <span style={{color:T.textMute,fontSize:"15px",fontFamily:"monospace",flexShrink:0,padding:"0 1px",userSelect:"none"}}>:</span>
      {/* Color swatch */}
      {colorProp && (
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(valDraft)?valDraft:"#000000"}
          onChange={e=>{setValDraft(e.target.value);onValueChange(e.target.value);}}
          title="Pick color"
          style={{width:18,height:18,padding:0,border:`1px solid ${T.borderMd}`,borderRadius:3,cursor:"pointer",flexShrink:0,background:"none",marginLeft:5}} />
      )}
      {/* Value */}
      <div style={{position:"relative",flex:1,marginLeft:4}}>
        <input ref={valRef} type="text" value={valDraft}
          onChange={e=>{setValDraft(e.target.value);setValSuggIdx(-1);}}
          onFocus={()=>setValFocused(true)}
          onBlur={()=>{
            setTimeout(()=>setValFocused(false),120);
            if (valDraft !== propValue) onValueChange(valDraft);
          }}
          onKeyDown={e=>{
            const hasSugg = filteredHints.length > 0;
            if(hasSugg&&e.key==="ArrowDown"){e.preventDefault();setValSuggIdx(i=>Math.min(i+1,filteredHints.length-1));return;}
            if(hasSugg&&e.key==="ArrowUp"){e.preventDefault();setValSuggIdx(i=>Math.max(i-1,-1));return;}
            // Number nudge with ↑/↓ when no hint list is shown
            if(!hasSugg&&(e.key==="ArrowUp"||e.key==="ArrowDown")){
              e.preventDefault();
              const m = valDraft.match(/^(-?\d*\.?\d+)(.*)/);
              if(m){
                const delta = e.shiftKey?10:e.altKey?.1:1;
                const nv = `${+(parseFloat(m[1])+(e.key==="ArrowUp"?delta:-delta)).toFixed(3)}${m[2]}`;
                setValDraft(nv); onValueChange(nv);
              }
              return;
            }
            if(e.key==="Enter"){
              e.preventDefault();
              const h = valSuggIdx>=0&&filteredHints[valSuggIdx];
              if(h){setValDraft(h);onValueChange(h);setValSuggIdx(-1);}
              else if(valDraft!==propValue){onValueChange(valDraft);}
              setValFocused(false);
            }
            if(e.key==="Tab"){
              e.preventDefault();
              const h = (valSuggIdx>=0&&filteredHints[valSuggIdx])||filteredHints[0];
              if(h){setValDraft(h);onValueChange(h);}
              setValFocused(false);
            }
            if(e.key==="Escape"){setValDraft(propValue);setValFocused(false);}
          }}
          style={{
            width:"100%",padding:"5px 8px",border:"none",outline:"none",
            background:valFocused?T.input:"transparent",
            borderRadius:valFocused?4:0,
            color:T.text,fontSize:"15px",
            fontFamily:"'SF Mono','Fira Code','Consolas',monospace",
            boxSizing:"border-box",transition:"background .1s",
          }}
        />
        {valFocused && filteredHints.length > 0 && (
          <CSSDropdown items={filteredHints} activeIdx={valSuggIdx}
            onSelect={h=>{setValDraft(h);onValueChange(h);setValFocused(false);}} />
        )}
      </div>
      <span style={{color:T.textMute,fontSize:"15px",fontFamily:"monospace",flexShrink:0,padding:"0 3px",userSelect:"none"}}>;</span>
      <button onClick={onRemove}
        style={{padding:"3px 6px",border:"1px solid transparent",background:"transparent",color:T.textDim,borderRadius:3,cursor:"pointer",fontSize:"14px",flexShrink:0,transition:"all .1s",lineHeight:1,marginRight:4}}
        onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.red;(e.currentTarget as HTMLButtonElement).style.borderColor=T.red;(e.currentTarget as HTMLButtonElement).style.background=T.redBg;}}
        onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.textDim;(e.currentTarget as HTMLButtonElement).style.borderColor="transparent";(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>✕</button>
    </div>
  );
}

// ─── AddCSSPropertyRow — inline "+" entry row ─────────────────────────────
function AddCSSPropertyRow({ onAdd }: { onAdd: (k: string, v: string) => void }) {
  const T = useT();
  const [active, setActive] = useState(false);
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  const [keyFocused, setKeyFocused] = useState(false);
  const [valFocused, setValFocused] = useState(false);
  const [keySuggIdx, setKeySuggIdx] = useState(-1);
  const [valSuggIdx, setValSuggIdx] = useState(-1);
  const keyRef = useRef<HTMLInputElement>(null);
  const valRef = useRef<HTMLInputElement>(null);

  const keySuggs = key.trim()
    ? COMMON_CSS_PROPS.filter(p=>p.toLowerCase().includes(key.toLowerCase())).slice(0,7)
    : COMMON_CSS_PROPS.slice(0,7);
  const valHints = (CSS_VALUE_HINTS[key] ?? []).slice(0,7);
  const filteredHints = val.trim()
    ? valHints.filter(h=>h.toLowerCase().startsWith(val.toLowerCase()))
    : valHints;

  const commit = (k: string, v: string) => {
    if (k.trim()) onAdd(k.trim(), v.trim());
    setKey(""); setVal(""); setActive(false);
  };

  if (!active) return (
    <button onClick={()=>{setActive(true);setTimeout(()=>keyRef.current?.focus(),10);}}
      style={{
        width:"100%",padding:"7px 12px",marginTop:6,
        border:`1px dashed ${T.borderMd}`,borderRadius:6,
        background:"transparent",color:T.textMute,fontSize:"15px",fontWeight:600,
        cursor:"pointer",fontFamily:"'SF Mono',monospace",transition:"all .15s",
        display:"flex",alignItems:"center",gap:6,
      }}
      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.accent;(e.currentTarget as HTMLButtonElement).style.color=T.accent;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=T.textMute;}}>
      + Add property
    </button>
  );

  return (
    <div style={{display:"flex",alignItems:"center",gap:0,marginTop:6,borderRadius:6,border:`1px solid ${T.accent}30`,background:`${T.accent}06`,padding:"1px 0"}}>
      <div style={{position:"relative",flex:"0 0 200px"}}>
        <input ref={keyRef} type="text" value={key} placeholder="property-name"
          onChange={e=>{setKey(e.target.value);setKeySuggIdx(-1);}}
          onFocus={()=>setKeyFocused(true)}
          onBlur={()=>setTimeout(()=>setKeyFocused(false),120)}
          onKeyDown={e=>{
            if(e.key==="ArrowDown"){e.preventDefault();setKeySuggIdx(i=>Math.min(i+1,keySuggs.length-1));}
            if(e.key==="ArrowUp"){e.preventDefault();setKeySuggIdx(i=>Math.max(i-1,-1));}
            if(e.key==="Enter"||e.key==="Tab"){
              e.preventDefault();
              const k=(keySuggIdx>=0&&keySuggs[keySuggIdx])||key.trim();
              setKey(k);setKeySuggIdx(-1);setKeyFocused(false);
              setTimeout(()=>valRef.current?.focus(),10);
            }
            if(e.key==="Escape"){setKey("");setVal("");setActive(false);}
          }}
          style={{
            width:"100%",padding:"5px 8px",border:"none",outline:"none",background:"transparent",
            color:T.accent,fontSize:"15px",fontFamily:"'SF Mono','Fira Code','Consolas',monospace",
            fontWeight:500,boxSizing:"border-box",
          }}
        />
        {keyFocused && keySuggs.length > 0 && (
          <CSSDropdown items={keySuggs} activeIdx={keySuggIdx}
            onSelect={k=>{setKey(k);setKeySuggIdx(-1);setKeyFocused(false);setTimeout(()=>valRef.current?.focus(),10);}} />
        )}
      </div>
      <span style={{color:T.textMute,fontSize:"15px",fontFamily:"monospace",flexShrink:0,padding:"0 1px",userSelect:"none"}}>:</span>
      <div style={{position:"relative",flex:1,marginLeft:4}}>
        <input ref={valRef} type="text" value={val} placeholder="value"
          onChange={e=>{setVal(e.target.value);setValSuggIdx(-1);}}
          onFocus={()=>setValFocused(true)}
          onBlur={()=>{setTimeout(()=>setValFocused(false),120);if(key.trim())commit(key,val);}}
          onKeyDown={e=>{
            const hasSugg = filteredHints.length > 0;
            if(hasSugg&&e.key==="ArrowDown"){e.preventDefault();setValSuggIdx(i=>Math.min(i+1,filteredHints.length-1));return;}
            if(hasSugg&&e.key==="ArrowUp"){e.preventDefault();setValSuggIdx(i=>Math.max(i-1,-1));return;}
            if(e.key==="Enter"||e.key==="Tab"){
              e.preventDefault();
              const h=(valSuggIdx>=0&&filteredHints[valSuggIdx])||undefined;
              commit(key, h||val);
              // Stay active for next property
              setTimeout(()=>{setActive(true);setTimeout(()=>keyRef.current?.focus(),10);},10);
            }
            if(e.key==="Escape"){setKey("");setVal("");setActive(false);}
          }}
          style={{
            width:"100%",padding:"5px 8px",border:"none",outline:"none",background:"transparent",
            color:T.text,fontSize:"15px",fontFamily:"'SF Mono','Fira Code','Consolas',monospace",boxSizing:"border-box",
          }}
        />
        {valFocused && filteredHints.length > 0 && (
          <CSSDropdown items={filteredHints} activeIdx={valSuggIdx}
            onSelect={h=>{commit(key,h);}} />
        )}
      </div>
      <span style={{color:T.textMute,fontSize:"15px",fontFamily:"monospace",flexShrink:0,padding:"0 3px",userSelect:"none"}}>;</span>
      <button onClick={()=>{setKey("");setVal("");setActive(false);}}
        style={{padding:"3px 6px",border:"none",background:"transparent",color:T.textMute,borderRadius:3,cursor:"pointer",fontSize:"14px",flexShrink:0,marginRight:4}}>✕</button>
    </div>
  );
}

// ─── Shared dropdown for CSS autocomplete ────────────────────────────────────
function CSSDropdown({ items, activeIdx, onSelect }: {
  items: string[]; activeIdx: number; onSelect: (item: string) => void;
}) {
  const T = useT();
  return (
    <div style={{
      position:"absolute",top:"100%",left:0,right:0,zIndex:40,
      background:T.surface,border:`1px solid ${T.borderMd}`,
      borderRadius:6,marginTop:2,overflow:"hidden",boxShadow:T.shadowMd,maxHeight:200,overflowY:"auto",
    }}>
      {items.map((item, i) => (
        <div key={item} onMouseDown={()=>onSelect(item)}
          style={{
            padding:"5px 10px",cursor:"pointer",fontSize:"15px",
            fontFamily:"'SF Mono','Fira Code','Consolas',monospace",
            color:i===activeIdx?"#fff":T.textSub,
            background:i===activeIdx?T.accent:"transparent",
            transition:"background .08s",
          }}
          onMouseEnter={e=>{if(i!==activeIdx)(e.currentTarget as HTMLDivElement).style.background=T.bg;}}
          onMouseLeave={e=>{if(i!==activeIdx)(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
          {item}
        </div>
      ))}
    </div>
  );
}

type NavLinkItem = { label: string; type: "section" | "page" | "external"; sectionId?: string; pageSlug?: string; url?: string; icon?: string };

function normalizeNavItems(raw: any[]): NavLinkItem[] {
  return raw.map(nl => {
    if (typeof nl === "string") {
      const pipe = nl.indexOf("|");
      const label = pipe > 0 ? nl.slice(0, pipe) : nl;
      const target = pipe > 0 ? nl.slice(pipe + 1) : "";
      if (target.startsWith("#")) return { label, type: "section" as const, sectionId: target.slice(1) };
      if (target.startsWith("/")) return { label, type: "page" as const, pageSlug: target.slice(1) };
      if (target.startsWith("http")) return { label, type: "external" as const, url: target };
      return { label, type: "section" as const };
    }
    // Already a NavLinkItem (has `type` field from FNavLinks save)
    if (typeof nl.type === "string" && ["section","page","external"].includes(nl.type)) {
      return { label: nl.label ?? "", type: nl.type, sectionId: nl.sectionId, pageSlug: nl.pageSlug, url: nl.url, icon: nl.icon };
    }
    // Legacy Tina format (has `_template` field)
    if (nl._template === "sectionLink") return { label: nl.label ?? "", type: "section" as const, sectionId: nl.sectionId ?? "" };
    if (nl._template === "pageLink") return { label: nl.label ?? "", type: "page" as const, pageSlug: nl.pageSlug ?? "" };
    if (nl._template === "externalLink") return { label: nl.label ?? "", type: "external" as const, url: nl.url ?? "" };
    return { label: String(nl.label ?? ""), type: "section" as const };
  });
}

function NavLinkRow({ item, i, value, onChange, dt, pages, sections, T, onDragStart, onDragOver, onDragEnd, hideType, defaultOpen }: {
  item: NavLinkItem; i: number; value: NavLinkItem[]; onChange: (v: NavLinkItem[]) => void;
  dt: NavLinkItem["type"]; pages?: string[]; sections: string[]; T: Tokens;
  onDragStart: (e: React.DragEvent, i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  hideType?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const selectStyle = (): React.CSSProperties => ({ ...inputBase(T, false), fontSize:"12.5px", cursor:"pointer", lineHeight:"1.5" });

  return (
    <div draggable onDragStart={(e) => onDragStart(e, i)} onDragOver={(e) => onDragOver(e, i)} onDragEnd={(e) => onDragEnd(e)}
      style={{ background:T.bg, borderRadius:6, border:`1px solid ${open ? T.accent : T.border}`, overflow:"hidden", transition:"border-color .12s" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", cursor:"pointer", userSelect:"none",
          borderBottom: open ? `1px solid ${T.border}` : "none", background: open ? `${T.accent}08` : "transparent" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
          <span onClick={e => e.stopPropagation()} style={{ color:T.textDim, fontSize:"14px", cursor:"grab", flexShrink:0 }}>⠿</span>
          <span style={{ fontSize:"13px", color: item.label ? T.text : T.textMute, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {item.label || "New link"}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onChange(value.filter((_, j) => j !== i)); }}
            style={{ padding:"1px 5px", borderRadius:3, border:"1px solid transparent", background:"transparent", color:T.textMute, fontSize:"12px", cursor:"pointer", transition:"all .15s", lineHeight:1 }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = T.red; el.style.borderColor = T.redBg; el.style.background = T.redBg; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = T.textMute; el.style.borderColor = "transparent"; el.style.background = "transparent"; }}>✕</button>
          <span style={{ color:T.textMute, fontSize:"12px", transition:"transform .12s", transform:open?"rotate(90deg)":"none", display:"inline-block" }}>▶</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"10px", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:6 }}>
            <input placeholder="Label" value={item.label}
              onChange={e => { const n = [...value]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
              style={{ ...inputBase(T, false), fontSize:"12.5px", flex:1, width:"auto", minWidth:0 }} />
            {!hideType && (
              <select value={item.type ?? dt}
                onChange={e => { const n = [...value]; n[i] = { ...n[i], type: e.target.value as NavLinkItem["type"] }; onChange(n); }}
                style={{ ...selectStyle(), width:90, flex:"none" }}>
                <option value="section">Section</option>
                <option value="page">Page</option>
                <option value="external">URL</option>
              </select>
            )}
            <IconPicker value={item.icon ?? ""} onChange={v => { const n = [...value]; n[i] = v ? { ...n[i], icon: v } : (() => { const { icon, ...rest } = n[i]; return rest; })(); onChange(n); }} />
          </div>
          {(item.type ?? dt) === "section" && (
            <select value={item.sectionId ?? ""}
              onChange={e => { const n = [...value]; n[i] = { ...n[i], sectionId: e.target.value }; onChange(n); }}
              style={{ width:"100%", ...selectStyle() }}>
              <option value="">-- Pick a section --</option>
              {sections.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
          {(item.type ?? dt) === "page" && (pages?.length ? (
            <select value={item.pageSlug ?? ""}
              onChange={e => { const n = [...value]; n[i] = { ...n[i], pageSlug: e.target.value }; onChange(n); }}
              style={{ width:"100%", ...selectStyle() }}>
              <option value="">-- Pick a page --</option>
              {pages.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <input placeholder="Page slug" value={item.pageSlug ?? ""}
              onChange={e => { const n = [...value]; n[i] = { ...n[i], pageSlug: e.target.value }; onChange(n); }}
              style={{ width:"100%", ...inputBase(T, false), fontSize:"12.5px" }} />
          ))}
          {(item.type ?? dt) === "external" && (
            <input placeholder="https://..." value={item.url ?? ""}
              onChange={e => { const n = [...value]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }}
              style={{ width:"100%", ...inputBase(T, false), fontSize:"12.5px" }} />
          )}
        </div>
      )}
    </div>
  );
}

function FNavLinks({ label, value, onChange, pages, defaultType, hideType }: {
  label: string; value: NavLinkItem[]; onChange: (v: NavLinkItem[]) => void;
  pages?: string[]; defaultType?: NavLinkItem["type"]; hideType?: boolean;
}) {
  const T = useT();
  const dt = defaultType ?? "section";
  const sections = Object.keys(blockTemplates).filter(k => !["header","footer"].includes(k));
  const dragIdx = useRef<number | null>(null);
  const [newIdx, setNewIdx] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent, i: number) => { e.stopPropagation(); dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.stopPropagation(); e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const n = [...value];
    const [item] = n.splice(dragIdx.current, 1);
    n.splice(i, 0, item);
    dragIdx.current = i;
    onChange(n);
  };
  const onDragEnd = (e: React.DragEvent) => { e.stopPropagation(); dragIdx.current = null; };

  const handleAdd = () => {
    const next = [...value, { label:"", type:dt }];
    setNewIdx(next.length - 1);
    onChange(next);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <label style={lbl(T)}>{label}</label>
        <button onClick={handleAdd}
          style={{ padding:"3px 10px", borderRadius:4, border:`1px solid ${T.accent}`, background:`${T.accent}14`, color:T.accent, fontSize:"10px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>+ Add</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {value.map((item, i) => (
          <NavLinkRow
            key={i} item={item} i={i} value={value} onChange={v => { setNewIdx(null); onChange(v); }}
            dt={dt} pages={pages} sections={sections} T={T}
            onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
            hideType={hideType} defaultOpen={i === newIdx}
          />
        ))}
        {value.length === 0 && (
          <div style={{ padding:"16px", textAlign:"center", color:T.textMute, fontSize:"12px", border:`1px dashed ${T.borderMd}`, borderRadius:6 }}>
            No links yet. Click "+ Add" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

// Compact icon-button trigger used inline in FNavLinks rows
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const T = useT();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pos, setPos] = useState({ top:0, left:0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on click outside — no backdrop so editor scroll is unblocked
  useEffect(()=>{
    if (!open) return;
    const h = (e:MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropW = 292;
      const left = Math.min(r.left, window.innerWidth - dropW - 8);
      setPos({ top: r.bottom + 4, left });
    }
    setOpen(o => !o);
  };

  const tab = ICON_TABS[activeTab];

  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <button ref={btnRef} onClick={handleOpen} title="Pick icon"
        style={{
          width:36, height:32, borderRadius:4, padding:0, cursor:"pointer",
          border:`1px solid ${open?T.borderFocus:T.borderMd}`,
          background:T.input, display:"flex", alignItems:"center", justifyContent:"center",
          color:T.text, flexShrink:0, transition:"border-color .12s",
        }}>
        {value ? iconElement(value,{width:17,height:17}) : <span style={{color:T.textMute,fontSize:16,lineHeight:1}}>·</span>}
      </button>

      {open && (
        <div ref={dropRef} style={{
          position:"fixed", top:pos.top, left:pos.left, width:292, zIndex:9999,
          background:T.surface, border:`1px solid ${T.borderMd}`,
          borderRadius:6, boxShadow:T.shadowMd,
        }}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.borderMd}`,borderRadius:"6px 6px 0 0",
            background:T.isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",overflow:"hidden"}}>
            {ICON_TABS.map((t,i)=>(
              <button key={t.key} onClick={()=>setActiveTab(i)} style={{
                flex:1, padding:"7px 2px", fontSize:"11px", fontWeight:500, border:"none",
                borderBottom:i===activeTab?`2px solid ${T.accent}`:"2px solid transparent",
                background:"transparent", color:i===activeTab?T.accent:T.textMute,
                cursor:"pointer", fontFamily:"inherit", transition:"color .1s,border-color .1s",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{padding:8}}>
            <button onClick={()=>{onChange("");setOpen(false);}} style={{
              width:"100%", padding:"4px 8px", textAlign:"left", marginBottom:6,
              border:`1px solid ${!value?T.accent:"transparent"}`,
              background:!value?`${T.accent}18`:"transparent",
              color:!value?T.accent:T.textMute,
              fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
              borderRadius:4, transition:"all .1s",
              display:"flex", alignItems:"center", gap:5,
            }}><span style={{fontSize:13,lineHeight:1,fontWeight:600}}>✕</span> Clear</button>
            <div onWheel={e=>e.stopPropagation()} style={{
              display:"grid",
              gridTemplateColumns:tab.emoji?"repeat(auto-fill,minmax(44px,1fr))":"repeat(auto-fill,minmax(52px,1fr))",
              gap:3, maxHeight:204, overflowY:"scroll",
            }}>
              {tab.ids.map(id=>{
                const opt = iconOptions.find(o=>o.v===id);
                if (!opt) return null;
                const sel = value===opt.v;
                return (
                  <button key={opt.v} onClick={()=>{onChange(opt.v);setOpen(false);}} title={opt.l}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",
                      padding:tab.emoji?"5px 2px 4px":"7px 3px 5px",borderRadius:5,cursor:"pointer",
                      border:`1px solid ${sel?T.accent:"transparent"}`,
                      background:sel?`${T.accent}20`:"transparent",
                      color:sel?T.accent:T.text,fontFamily:"inherit",transition:"all .1s"}}
                    onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}0C`;}}
                    onMouseLeave={e=>{if(!sel)(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
                    {tab.emoji
                      ? <span style={{fontSize:20,lineHeight:1.3}}>{opt.e}</span>
                      : <span style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>{iconElement(opt.v,{width:18,height:18})}</span>}
                    <span style={{fontSize:9,color:T.textMute,marginTop:2,lineHeight:1.2,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:"100%"}}>
                      {opt.l.length>9?opt.l.slice(0,8)+"…":opt.l}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FStringList — editable list of strings (for nav/social links) ──────────
function FStringList({ label, hint, value, onChange }: {
  label: string; hint?: string; value: string[]; onChange: (v: string[]) => void;
}) {
  const T = useT();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={lbl(T)}>{label}</label>
      {hint && <p style={{margin:"0 0 6px",fontSize:"14px",color:T.textMute,lineHeight:1.5}}>{hint}</p>}
      <textarea
        value={value.join("\n")}
        onChange={e => onChange(e.target.value.split("\n").map(s=>s.trimEnd()).filter(Boolean))}
        rows={Math.max(3, value.length + 1)}
        placeholder="One item per line…"
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{...inputBase(T,focused),resize:"vertical",minHeight:80,fontFamily:"'SF Mono',monospace",fontSize:"15px",lineHeight:1.7}}
      />
    </div>
  );
}

function FRich({label,value,onChange,rows=1,fieldType}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;fieldType?:SuggestionFieldType}) {
  const T = useT();
  const {specialty,experienceYears} = useSpecialty();
  const ref = useRef<HTMLDivElement>(null);
  const [focused,setFocused] = useState(false);
  const [suggEl,setSuggEl] = useState<HTMLElement|null>(null);

  useEffect(() => {
    if (ref.current && !focused && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? "";
    }
  }, [value, focused]);

  const exec = (cmd:string,arg?:string) => { document.execCommand(cmd,false,arg); ref.current?.focus(); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.code === "Space" && fieldType) {
      e.preventDefault();
      setSuggEl(ref.current);
    }
  };

  return (
    <div style={{position:"relative"}}>
      <label style={lbl(T)}>
        {label}
        {fieldType && <span style={{marginLeft:5,fontSize:"14px",fontWeight:400,color:T.textMute,letterSpacing:0,textTransform:"none",verticalAlign:"middle"}}>⌃Space</span>}
      </label>
      <div style={{
        border:`1px solid ${focused?T.borderFocus:T.borderMd}`, borderRadius:4,
        overflow:"hidden", background:T.input,
        boxShadow:focused?`0 0 0 1px ${T.accent},0 0 0 3px ${T.accent}28`:"none",
        transition:"border-color .12s, box-shadow .12s",
      }}>
        {/* Toolbar — compact Heroku style */}
        <div style={{display:"flex",gap:0,padding:"3px 6px",borderBottom:`1px solid ${T.border}`,background:T.surface}}>
          {[{c:"bold",l:"B",s:{fontWeight:700}},{c:"italic",l:"I",s:{fontStyle:"italic"}},{c:"underline",l:"U",s:{textDecoration:"underline"}},{c:"formatBlock",a:"<h3>",l:"H3",s:{}}].map(b=>(
            <button key={b.c} onMouseDown={e=>{e.preventDefault();exec(b.c,b.a);}}
              style={{padding:"2px 7px",border:"none",borderRadius:3,background:"transparent",color:T.textMute,fontSize:"14px",cursor:"pointer",fontFamily:"inherit",...b.s,transition:"all .1s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=T.borderMd;(e.currentTarget as HTMLButtonElement).style.color=T.text;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color=T.textMute;}}>
              {b.l}
            </button>
          ))}
          <div style={{width:"1px",height:14,background:T.border,margin:"3px 4px",flexShrink:0}} />
          <button onMouseDown={e=>{e.preventDefault();const u=prompt("URL:");if(u)exec("createLink",u);}}
            style={{padding:"2px 7px",border:"none",borderRadius:3,background:"transparent",color:T.accent,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=T.border}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="transparent"}>
            Link
          </button>
        </div>
        <div ref={ref} contentEditable suppressContentEditableWarning
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          onInput={()=>{if(ref.current)onChange(ref.current.innerHTML);}}
          onKeyDown={handleKeyDown}
          style={{padding:"8px 10px",minHeight:rows*36,maxHeight:280,overflow:"auto",fontSize:"14px",lineHeight:1.65,color:T.text,outline:"none",cursor:"text"}} />
      </div>
      {suggEl && fieldType && (
        <SuggestionPopup
          anchorEl={suggEl}
          context={{fieldType, specialty, experienceYears}}
          onSelect={v=>{// Insert plain text into contentEditable
            if(ref.current){ref.current.innerHTML=v;onChange(v);}setSuggEl(null);}}
          onClose={()=>setSuggEl(null)}
        />
      )}
    </div>
  );
}

function FButtons({btns,onChange}:{btns:JsonObject[];onChange:(v:JsonObject[])=>void}) {
  const T = useT();
  const addBtn = () => onChange([...btns, {label:"",url:"",icon:"",variant:"primary"}]);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <label style={lbl(T)}>Buttons</label>
        <button onClick={addBtn} style={{padding:"3px 10px",borderRadius:4,border:`1px solid ${T.accent}`,background:`${T.accent}14`,color:T.accent,fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
      </div>
      {btns.map((btn,i)=>(
        <div key={i} style={{padding:"10px 12px",marginBottom:6,background:T.bg,borderRadius:7,border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <button onClick={()=>onChange(btns.filter((_,j)=>j!==i))} style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${T.border}`,background:"transparent",color:T.textMute,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <FField label="Label" value={btn.label??""} onChange={v=>{const n=[...btns];n[i]={...n[i],label:v};onChange(n);}} />
            <FField label="URL" value={btn.url??""} onChange={v=>{const n=[...btns];n[i]={...n[i],url:v};onChange(n);}} />
            <FIconPicker label="Icon" value={btn.icon??""} onChange={v=>{const n=[...btns];n[i]={...n[i],icon:v};onChange(n);}} />
            <FSelect label="Variant" value={btn.variant??"primary"} options={[{v:"primary",l:"Primary"},{v:"secondary",l:"Secondary"}]} onChange={v=>{const n=[...btns];n[i]={...n[i],variant:v};onChange(n);}} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FItems({label,items,onChange,fields}:{
  label:string;items:JsonObject[];onChange:(v:JsonObject[])=>void;
  fields:{k:string;l:string;rt?:boolean;s?:boolean;opts?:{v:string;l:string}[];img?:boolean;ico?:boolean}[];
}) {
  const T = useT();
  const [openItems,setOpenItems] = useState<Set<number>>(new Set());
  const dragIdx = useRef<number | null>(null);

  const toggle = (i:number) => setOpenItems(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});

  const addItem = () => {
    const idx = items.length;
    onChange([...items,{}]);
    setOpenItems(p=>new Set([...p,idx]));
  };

  const moveItem = (from: number, to: number) => {
    if (from === to) return;
    const n = [...items];
    const [item] = n.splice(from, 1);
    n.splice(to, 0, item);
    onChange(n);
    setOpenItems(p => {
      const next = new Set<number>();
      for (const idx of p) {
        if (idx === from) next.add(to);
        else if (from < to && idx > from && idx <= to) next.add(idx - 1);
        else if (from > to && idx >= to && idx < from) next.add(idx + 1);
        else next.add(idx);
      }
      return next;
    });
  };

  const onDragStart = (e: React.DragEvent, i: number) => { e.stopPropagation(); dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.stopPropagation(); e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    moveItem(dragIdx.current, i);
    dragIdx.current = i;
  };
  const onDragEnd = (e: React.DragEvent) => { e.stopPropagation(); dragIdx.current = null; };

  // If the first field is an image, use the second field for text summary
  const textField = fields[0].img && fields[1] ? fields[1] : fields[0];
  const imgField  = fields[0].img ? fields[0] : null;

  const summary = (item:JsonObject) => {
    const v = item[textField.k];
    return typeof v==="string" ? v.replace(/<[^>]+>/g,"").slice(0,48)||`${label} item` : `${label} item`;
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <label style={lbl(T)}>{label} <span style={{fontWeight:400,color:T.textMute,textTransform:"none",letterSpacing:0}}>({items.length})</span></label>
        <button onClick={addItem} style={{padding:"3px 10px",borderRadius:4,border:`1px solid ${T.accent}`,background:`${T.accent}15`,color:T.accent,fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {items.map((item,i)=>{
          const isOpen = openItems.has(i);
          const thumbUrl = imgField ? (item[imgField.k] as string | undefined) : undefined;
          // Find the icon field if present for the emoji badge in collapsed row
          const icoField = fields.find(f=>f.ico);
          const iconEntry = icoField ? iconOptions.find(o=>o.v===item[icoField.k]) : undefined;

            return (
              <div key={i} draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={(e)=>onDragOver(e,i)} onDragEnd={(e)=>onDragEnd(e)}
                style={{
              background:T.bg,
              borderRadius:2,
              borderTop:`1px solid ${T.border}`,
              borderRight:`1px solid ${T.border}`,
              borderBottom:`1px solid ${T.border}`,
              borderLeft: isOpen ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
              overflow:"hidden",
              transition:"border-left .12s",
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",cursor:"pointer"}} onClick={()=>toggle(i)}>
                <div style={{display:"flex",alignItems:"center",gap:5,flex:1,overflow:"hidden"}}>
                  <span style={{color:T.textDim,fontSize:"12px",cursor:"grab",flexShrink:0}}>⠿</span>
                  {/* Image thumbnail in collapsed row */}
                  {thumbUrl && (
                    <img src={thumbUrl} alt="" style={{
                      width:28,height:28,objectFit:"cover",borderRadius:2,
                      flexShrink:0,border:`1px solid ${T.border}`,display:"block",
                    }} onError={e=>(e.currentTarget as HTMLImageElement).style.display="none"} />
                  )}
                  {/* Icon emoji badge */}
                  {!thumbUrl && iconEntry && (
                    <span style={{fontSize:16,flexShrink:0,lineHeight:1}}>{iconEntry.e}</span>
                  )}
                  <span style={{fontSize:"15px",color:isOpen?T.text:T.textSub,fontWeight:isOpen?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {summary(item)}
                  </span>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>onChange(items.filter((_,j)=>j!==i))} style={{padding:"2px 6px",borderRadius:3,border:`1px solid transparent`,background:"transparent",color:T.textMute,fontSize:"15px",cursor:"pointer",transition:"all .15s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.red;(e.currentTarget as HTMLButtonElement).style.borderColor=T.red;(e.currentTarget as HTMLButtonElement).style.background=T.redBg;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color=T.textMute;(e.currentTarget as HTMLButtonElement).style.borderColor="transparent";(e.currentTarget as HTMLButtonElement).style.background="transparent";}}>
                    ✕
                  </button>
                  <span style={{color:T.textDim,fontSize:"14px",transition:"transform .14s",transform:isOpen?"rotate(90deg)":"none"}}>▶</span>
                </div>
              </div>
              {isOpen && (
                <div style={{padding:"10px 12px 12px",display:"flex",flexDirection:"column",gap:10,borderTop:`1px solid ${T.border}`}}>
                  {fields.map(f=>{
                    const ft = f.ft as SuggestionFieldType | undefined;
                    if(f.img) return <FImage key={f.k} label={f.l} value={item[f.k]??""} onChange={v=>{const n=[...items];n[i]={...n[i],[f.k]:v};onChange(n);}} />;
                    if(f.rt) return <FRich key={f.k} label={f.l} value={item[f.k]??""} onChange={v=>{const n=[...items];n[i]={...n[i],[f.k]:v};onChange(n);}} rows={2} fieldType={ft} />;
                    if(f.ico) return <FIconPicker key={f.k} label={f.l} value={item[f.k]??""} onChange={v=>{const n=[...items];n[i]={...n[i],[f.k]:v};onChange(n);}} />;
                    if(f.s&&f.opts) return <FSelect key={f.k} label={f.l} value={item[f.k]??""} options={f.opts} onChange={v=>{const n=[...items];n[i]={...n[i],[f.k]:v};onChange(n);}} />;
                    return <FField key={f.k} label={f.l} value={item[f.k]??""} onChange={v=>{const n=[...items];n[i]={...n[i],[f.k]:v};onChange(n);}} fieldType={ft} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
