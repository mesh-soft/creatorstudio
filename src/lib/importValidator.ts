/**
 * Pure-TS JSON schema validator for import payloads.
 * No Node.js / Next.js imports — safe to use on both client and server.
 */

// ── Valid enum values (mirrors catalog.ts and types.ts) ──────────────────────

export const VALID_BLOCK_TEMPLATES = [
  "header", "footer", "hero", "profile", "services", "timings",
  "gallery", "faq", "testimonials", "stats", "awards", "cta", "text",
  "whatsapp", "location",
] as const;

export const VALID_THEME_IDS = [
  "doctor-standard", "doctor-profile-heavy", "doctor-service-heavy",
  "hospital-standard", "hospital-emergency-first",
] as const;

export const VALID_STYLE_IDS = [
  "doctor-teal-clean", "doctor-premium-warm", "doctor-bright-child",
  "doctor-derma-minimal", "doctor-slate-precision",
  "hospital-blue-modern", "hospital-green-trust", "hospital-red-emergency",
  "hospital-indigo-specialty", "hospital-community-soft",
] as const;

export const VALID_VARIANT_PRESET_IDS = [
  "doctor-classic", "doctor-editorial", "doctor-compact",
  "doctor-premium", "doctor-specialist",
  "hospital-standard", "hospital-emergency", "hospital-specialty",
  "hospital-community", "hospital-network",
] as const;

export const VALID_SITE_SETTING_TEMPLATES = [
  "subscription", "domains", "profile", "business",
  "presentation", "header", "footer", "seo", "analytics",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ── Canonical ID / slug rules ─────────────────────────────────────────────────
//
// Rule: must start AND end with [a-z0-9], middle may contain hyphens or
// underscores. Max 50 characters total.
//
// Valid:   dr-priya-sharma  dr_priya  home  services-and-care
// Invalid: -leading   trailing-   double--hyph (allowed but ugly)  UPPER  abc.def
//
// Both tenantId and page slugs share this rule.

export const TENANT_ID_RE = /^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/;
export const SLUG_RE      = /^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/;

function e(path: string, message: string): ValidationError {
  return { path, message };
}

function inSet<T extends string>(val: unknown, set: readonly T[], label: string): string | null {
  if (!val) return null; // optional — absence is fine
  if (!(set as readonly string[]).includes(val as string)) {
    return `Unknown ${label} "${val}". Valid: ${set.join(", ")}`;
  }
  return null;
}

// ── Presentation block ────────────────────────────────────────────────────────

function validatePresentation(
  p: Record<string, unknown>,
  path: string,
  errors: ValidationError[],
) {
  const themeErr   = inSet(p.themeId,          VALID_THEME_IDS,          "themeId");
  const styleErr   = inSet(p.styleId,           VALID_STYLE_IDS,          "styleId");
  const variantErr = inSet(p.variantPresetId,   VALID_VARIANT_PRESET_IDS, "variantPresetId");
  if (themeErr)   errors.push(e(`${path}.themeId`,          themeErr));
  if (styleErr)   errors.push(e(`${path}.styleId`,          styleErr));
  if (variantErr) errors.push(e(`${path}.variantPresetId`,  variantErr));
}

// ── Site JSON validator ───────────────────────────────────────────────────────

export function validateSiteJson(site: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  const tenantId   = String(site.tenantId   ?? "").trim();
  const tenantType = String(site.tenantType ?? "").trim();

  if (!tenantId) {
    errors.push(e("tenantId", "Required"));
  } else if (!TENANT_ID_RE.test(tenantId)) {
    errors.push(e("tenantId", "Must be kebab-case: lowercase letters, numbers, hyphens, underscores only"));
  }

  if (!tenantType) {
    errors.push(e("tenantType", 'Required — must be "doctor" or "hospital"'));
  } else if (tenantType !== "doctor" && tenantType !== "hospital") {
    errors.push(e("tenantType", `Must be "doctor" or "hospital", got "${tenantType}"`));
  }

  const hasSettings = Array.isArray(site.settings);

  if (hasSettings) {
    const settings = site.settings as Record<string, unknown>[];
    const templates = new Set(settings.map(s => s._template));

    if (!templates.has("profile")) {
      errors.push(e("settings", 'Missing required block: { "_template": "profile", ... }'));
    }
    if (!templates.has("presentation")) {
      errors.push(e("settings", 'Missing required block: { "_template": "presentation", ... }'));
    }

    settings.forEach((s, i) => {
      if (!s._template) {
        errors.push(e(`settings[${i}]`, "Missing _template field"));
        return;
      }
      if (!(VALID_SITE_SETTING_TEMPLATES as readonly string[]).includes(s._template as string)) {
        errors.push(e(`settings[${i}]._template`,
          `Unknown setting template "${s._template}". Valid: ${VALID_SITE_SETTING_TEMPLATES.join(", ")}`));
      }
      if (s._template === "presentation") {
        validatePresentation(s, `settings[${i}]`, errors);
      }
    });
  } else {
    // flat format
    if (!site.profile) {
      errors.push(e("profile", "Required — must include profile fields (displayName, specialty, etc.)"));
    }
    if (!site.presentation) {
      errors.push(e("presentation", "Required — must include presentation fields (themeId, styleId, etc.)"));
    } else {
      validatePresentation(site.presentation as Record<string, unknown>, "presentation", errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Page JSON validator ───────────────────────────────────────────────────────

export function validatePageJson(page: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(page.blocks)) {
    errors.push(e("blocks", "Required — must be an array of block objects"));
  } else if (page.blocks.length === 0) {
    errors.push(e("blocks", "Must contain at least one block"));
  } else {
    (page.blocks as Record<string, unknown>[]).forEach((b, i) => {
      if (!b._template) {
        errors.push(e(`blocks[${i}]`, "Missing _template field"));
        return;
      }
      if (!(VALID_BLOCK_TEMPLATES as readonly string[]).includes(b._template as string)) {
        errors.push(e(
          `blocks[${i}]._template`,
          `Unknown block type "${b._template}". Valid: ${VALID_BLOCK_TEMPLATES.join(", ")}`,
        ));
      }
      // Block-specific field checks
      if (b._template === "gallery" && Array.isArray(b.items)) {
        (b.items as Record<string, unknown>[]).forEach((item, j) => {
          if (!item.src) errors.push(e(`blocks[${i}].items[${j}].src`, "Gallery item requires a src field"));
        });
      }
      if (b._template === "timings" && Array.isArray(b.items)) {
        (b.items as Record<string, unknown>[]).forEach((item, j) => {
          if (!item.day) errors.push(e(`blocks[${i}].items[${j}].day`, "Timing item requires a day field"));
        });
      }
      if ((b._template === "hero" || b._template === "cta") && Array.isArray(b.buttons)) {
        (b.buttons as Record<string, unknown>[]).forEach((btn, j) => {
          if (!btn.label) errors.push(e(`blocks[${i}].buttons[${j}].label`, "Button requires a label"));
          if (btn.variant && btn.variant !== "primary" && btn.variant !== "secondary") {
            errors.push(e(`blocks[${i}].buttons[${j}].variant`, 'Must be "primary" or "secondary"'));
          }
        });
      }
    });
  }

  if (!Array.isArray(page.settings) || page.settings.length === 0) {
    errors.push(e("settings", 'Required — must include at least a urlSettings block with a "slug" field'));
  } else {
    const settings = page.settings as Record<string, unknown>[];
    const urlBlock = settings.find(s => s._template === "urlSettings");
    if (!urlBlock) {
      errors.push(e("settings", 'Missing required block: { "_template": "urlSettings", "slug": "home" }'));
    } else if (!urlBlock.slug) {
      errors.push(e("settings[urlSettings].slug", 'Required — determines the page filename (e.g. "home", "services")'));
    } else if (!SLUG_RE.test(String(urlBlock.slug))) {
      errors.push(e("settings[urlSettings].slug", "Must be kebab-case (lowercase letters, numbers, hyphens, underscores)"));
    }

    settings.forEach((s, i) => {
      if (s._template === "presentation") {
        validatePresentation(s, `settings[${i}]`, errors);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
