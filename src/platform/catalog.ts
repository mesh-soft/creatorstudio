import type { Tenant, TenantType, VariantPreset } from "./types";

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

export function getPreset(tenant: Tenant): VariantPreset {
  const typePresets = variantPresets[tenant.tenantType];
  if (!typePresets) {
    return Object.values(variantPresets.doctor)[0];
  }
  const preset = typePresets[tenant.presentation?.variantPresetId];
  if (preset) return preset;
  const firstPreset = Object.values(typePresets)[0];
  return firstPreset ?? Object.values(variantPresets.doctor)[0];
}
