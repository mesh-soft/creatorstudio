import type { StylePreset, Tenant, TenantType, VariantPreset } from "./types";

export const stylePresets: Record<string, StylePreset> = {
  "doctor-teal-clean": {
    colors: {
      primary: "#0f766e",
      secondary: "#2dd4bf",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f0fdfa",
      text: "#111827",
    },
    shape: { radius: "8px" },
    typography: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
  },
  "doctor-premium-warm": {
    colors: {
      primary: "#7c2d12",
      secondary: "#fbbf24",
      accent: "#ea580c",
      background: "#fffbeb",
      surface: "#fef3c7",
      text: "#451a03",
    },
    shape: { radius: "12px" },
    typography: { heading: "Georgia, serif", body: "Inter, sans-serif" },
  },
  "doctor-bright-child": {
    colors: {
      primary: "#2563eb",
      secondary: "#f472b6",
      accent: "#facc15",
      background: "#ffffff",
      surface: "#eff6ff",
      text: "#1e3a8a",
    },
    shape: { radius: "24px" },
    typography: { heading: "Comic Sans MS, cursive", body: "Inter, sans-serif" },
  },
  "doctor-derma-minimal": {
    colors: {
      primary: "#be185d",
      secondary: "#f9a8d4",
      accent: "#fbcfe8",
      background: "#ffffff",
      surface: "#fff1f2",
      text: "#4c0519",
    },
    shape: { radius: "4px" },
    typography: { heading: "Helvetica, sans-serif", body: "Helvetica, sans-serif" },
  },
  "doctor-slate-precision": {
    colors: {
      primary: "#334155",
      secondary: "#94a3b8",
      accent: "#0ea5e9",
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
    },
    shape: { radius: "6px" },
    typography: { heading: "Courier New, monospace", body: "Courier New, monospace" },
  },
  "hospital-blue-modern": {
    colors: {
      primary: "#1e3a8a",
      secondary: "#60a5fa",
      accent: "#3b82f6",
      background: "#ffffff",
      surface: "#eff6ff",
      text: "#1e1b4b",
    },
    shape: { radius: "8px" },
    typography: { heading: "Arial, sans-serif", body: "Arial, sans-serif" },
  },
  "hospital-green-trust": {
    colors: {
      primary: "#065f46",
      secondary: "#34d399",
      accent: "#10b981",
      background: "#f0fdf4",
      surface: "#dcfce7",
      text: "#064e3b",
    },
    shape: { radius: "10px" },
    typography: { heading: "Times New Roman, serif", body: "Inter, sans-serif" },
  },
  "hospital-red-emergency": {
    colors: {
      primary: "#991b1b",
      secondary: "#f87171",
      accent: "#ef4444",
      background: "#ffffff",
      surface: "#fef2f2",
      text: "#450a0a",
    },
    shape: { radius: "4px" },
    typography: { heading: "Verdana, sans-serif", body: "Verdana, sans-serif" },
  },
  "hospital-indigo-specialty": {
    colors: {
      primary: "#3730a3",
      secondary: "#818cf8",
      accent: "#6366f1",
      background: "#ffffff",
      surface: "#eef2ff",
      text: "#1e1b4b",
    },
    shape: { radius: "14px" },
    typography: { heading: "Trebuchet MS, sans-serif", body: "Trebuchet MS, sans-serif" },
  },
  "hospital-community-soft": {
    colors: {
      primary: "#3f6212",
      secondary: "#a3e635",
      accent: "#84cc16",
      background: "#f7fee7",
      surface: "#ecfccb",
      text: "#1a2e05",
    },
    shape: { radius: "20px" },
    typography: { heading: "Garamond, serif", body: "Garamond, serif" },
  },
};

export const variantPresets: Record<TenantType, Record<string, VariantPreset>> = {
  doctor: {
    "doctor-classic": {
      hero: "split",
      profile: "credentials",
      services: "cards",
      timings: "table",
      gallery: "grid",
      faq: "accordion",
      cta: "banner",
    },
    "doctor-editorial": {
      hero: "centered",
      profile: "editorial",
      services: "list",
      timings: "list",
      gallery: "showcase",
      faq: "list",
      cta: "inline",
    },
    "doctor-compact": {
      hero: "compact",
      profile: "credentials",
      services: "compact",
      timings: "chips",
      gallery: "strip",
      faq: "accordion",
      cta: "sticky",
    },
    "doctor-premium": {
      hero: "profile-card",
      profile: "editorial",
      services: "featured",
      timings: "cards",
      gallery: "showcase",
      faq: "two-column",
      cta: "floating",
    },
    "doctor-specialist": {
      hero: "credential",
      profile: "timeline",
      services: "treatment-grid",
      timings: "cards",
      gallery: "grid",
      faq: "checklist",
      cta: "booking-panel",
    },
  },
  hospital: {
    "hospital-standard": {
      hero: "hospital",
      profile: "overview",
      services: "departments",
      timings: "emergency",
      gallery: "facility",
      faq: "search",
      cta: "emergency",
    },
    "hospital-emergency": {
      hero: "emergency",
      profile: "overview",
      services: "departments",
      timings: "emergency",
      gallery: "facility",
      faq: "accordion",
      cta: "emergency",
    },
    "hospital-specialty": {
      hero: "specialty",
      profile: "leadership",
      services: "programs",
      timings: "table",
      gallery: "showcase",
      faq: "two-column",
      cta: "banner",
    },
    "hospital-community": {
      hero: "community",
      profile: "overview",
      services: "cards",
      timings: "list",
      gallery: "grid",
      faq: "list",
      cta: "inline",
    },
    "hospital-network": {
      hero: "network",
      profile: "overview",
      services: "departments",
      timings: "cards",
      gallery: "facility",
      faq: "search",
      cta: "emergency",
    },
  },
};

export const themeLayouts: Record<string, TenantBlock[]> = {
  "doctor-standard": [
    { _template: "hero", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "services", enabled: true },
    { _template: "gallery", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "doctor-profile-heavy": [
    { _template: "hero", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "faq", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "doctor-service-heavy": [
    { _template: "hero", enabled: true },
    { _template: "services", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "hospital-standard": [
    { _template: "hero", enabled: true },
    { _template: "services", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "gallery", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "hospital-emergency-first": [
    { _template: "timings", enabled: true },
    { _template: "hero", enabled: true },
    { _template: "services", enabled: true },
    { _template: "cta", enabled: true },
  ],
};

export function getPreset(tenant: Tenant): VariantPreset {
  const typePresets = variantPresets[tenant.tenantType];
  if (!typePresets) {
    return Object.values(variantPresets.doctor)[0];
  }
  const presetId = tenant.presentation?.variantPresetId;
  const preset = typePresets[presetId];
  if (preset) return preset;
  
  const firstPreset = Object.values(typePresets)[0];
  return firstPreset ?? Object.values(variantPresets.doctor)[0];
}

export function getThemeBlocks(tenant: Tenant): TenantBlock[] {
  const themeId = tenant.presentation?.themeId;
  return themeLayouts[themeId] ?? themeLayouts["doctor-standard"];
}
