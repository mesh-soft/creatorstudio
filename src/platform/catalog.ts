import type { StylePreset, Tenant, TenantBlock, TenantType, VariantPreset } from "./types";

export const stylePresets: Record<string, StylePreset> = {
  "doctor-teal-clean": {
    name: "Clinical Emerald",
    colors: {
      primary: "#0D9488",
      secondary: "#99F6E4",
      accent: "#0F766E",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#134E4A",
    },
    shape: { radius: "8px" },
    typography: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
  },
  "doctor-premium-warm": {
    name: "Warm Patient-Centric",
    colors: {
      primary: "#7C2D12",
      secondary: "#FDBA74",
      accent: "#9A3412",
      background: "#FFFBF0",
      surface: "#FFFFFF",
      text: "#431407",
    },
    shape: { radius: "16px" },
    typography: { heading: "Merriweather, serif", body: "Inter, sans-serif" },
  },
  "doctor-bright-child": {
    name: "Pediatric Playful",
    colors: {
      primary: "#2563EB",
      secondary: "#F472B6",
      accent: "#FACC15",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#1E3A8A",
    },
    shape: { radius: "24px" },
    typography: { heading: "Outfit, sans-serif", body: "Inter, sans-serif" },
  },
  "doctor-derma-minimal": {
    name: "Minimalist Aesthetic",
    colors: {
      primary: "#BE185D",
      secondary: "#F9A8D4",
      accent: "#9D174D",
      background: "#FFFFFF",
      surface: "#FFF1F2",
      text: "#831843",
    },
    shape: { radius: "2px" },
    typography: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
  },
  "doctor-slate-precision": {
    name: "Modern Specialist",
    colors: {
      primary: "#0F172A",
      secondary: "#64748B",
      accent: "#3B82F6",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#1E293B",
    },
    shape: { radius: "4px" },
    typography: { heading: "Plus Jakarta Sans, sans-serif", body: "Plus Jakarta Sans, sans-serif" },
  },
  "hospital-blue-modern": {
    name: "Trusted Institution",
    colors: {
      primary: "#1E3A8A",
      secondary: "#BFDBFE",
      accent: "#2563EB",
      background: "#F1F5F9",
      surface: "#FFFFFF",
      text: "#1E293B",
    },
    shape: { radius: "10px" },
    typography: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
  },
  "hospital-green-trust": {
    name: "Wellness & Recovery",
    colors: {
      primary: "#064E3B",
      secondary: "#A7F3D0",
      accent: "#059669",
      background: "#F0FDF4",
      surface: "#FFFFFF",
      text: "#064E3B",
    },
    shape: { radius: "12px" },
    typography: { heading: "Fraunces, serif", body: "Inter, sans-serif" },
  },
  "hospital-red-emergency": {
    name: "High-Response Emergency",
    colors: {
      primary: "#991B1B",
      secondary: "#FECACA",
      accent: "#DC2626",
      background: "#FFFFFF",
      surface: "#FEF2F2",
      text: "#450A0A",
    },
    shape: { radius: "4px" },
    typography: { heading: "Roboto, sans-serif", body: "Roboto, sans-serif" },
  },
  "hospital-indigo-specialty": {
    name: "Corporate Specialty",
    colors: {
      primary: "#312E81",
      secondary: "#C7D2FE",
      accent: "#4F46E5",
      background: "#F5F3FF",
      surface: "#FFFFFF",
      text: "#1E1B4B",
    },
    shape: { radius: "20px" },
    typography: { heading: "Outfit, sans-serif", body: "Inter, sans-serif" },
  },
  "hospital-community-soft": {
    name: "Friendly Local Clinic",
    colors: {
      primary: "#365314",
      secondary: "#D9F99D",
      accent: "#65A30D",
      background: "#F7FEE7",
      surface: "#FFFFFF",
      text: "#1A2E05",
    },
    shape: { radius: "32px" },
    typography: { heading: "Lora, serif", body: "Inter, sans-serif" },
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
    { _template: "header", enabled: true },
    { _template: "hero", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "awards", enabled: true },
    { _template: "services", enabled: true },
    { _template: "gallery", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "doctor-profile-heavy": [
    { _template: "header", enabled: true },
    { _template: "hero", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "awards", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "faq", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "doctor-service-heavy": [
    { _template: "header", enabled: true },
    { _template: "hero", enabled: true },
    { _template: "services", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "profile", enabled: true },
    { _template: "awards", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "hospital-standard": [
    { _template: "header", enabled: true },
    { _template: "hero", enabled: true },
    { _template: "services", enabled: true },
    { _template: "timings", enabled: true },
    { _template: "gallery", enabled: true },
    { _template: "cta", enabled: true },
  ],
  "hospital-emergency-first": [
    { _template: "header", enabled: true },
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
