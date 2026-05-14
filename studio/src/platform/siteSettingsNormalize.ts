/** Site Tina schema stores these as a `settings` list; the runtime uses flat TenantSite fields. */

export const SITE_SETTING_KEYS = [
  "subscription",
  "domains",
  "profile",
  "business",
  "presentation",
  "header",
  "seo",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export function unwrapSiteSettingsToFlat(site: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(site.settings)) {
    return { ...site };
  }
  const { settings, ...meta } = site;
  const out: Record<string, unknown> = { ...meta };
  for (const block of settings) {
    if (!block || typeof block !== "object") continue;
    const rec = block as Record<string, unknown>;
    const t = rec._template;
    if (typeof t !== "string" || !(SITE_SETTING_KEYS as readonly string[]).includes(t)) continue;
    const { _template: _ignored, ...payload } = rec;
    out[t] = payload;
  }
  return out;
}

/** On-disk / Tina shape: meta keys + `settings` blocks. */
export function wrapFlatSiteIntoSettings(site: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(site.settings)) {
    return { ...site };
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(site)) {
    if ((SITE_SETTING_KEYS as readonly string[]).includes(k)) continue;
    out[k] = v;
  }
  out.settings = SITE_SETTING_KEYS.map((key) => {
    const chunk = site[key];
    if (chunk && typeof chunk === "object" && !Array.isArray(chunk)) {
      return { _template: key, ...chunk };
    }
    return { _template: key };
  });
  return out;
}

export function isSiteSettingsDocument(doc: Record<string, unknown> | null | undefined): boolean {
  if (!doc || !Array.isArray(doc.settings)) return false;
  return (doc.settings as Array<{ _template?: string }>).some(
    (b) => typeof b?._template === "string" && (SITE_SETTING_KEYS as readonly string[]).includes(b._template)
  );
}

/** Map flat TenantSite paths to Tina `settings[i]…` when `doc` is a site document. */
export function toSiteSettingsPathFromFlat(flatDotPath: string, doc: Record<string, unknown>): string {
  if (!isSiteSettingsDocument(doc)) return flatDotPath;
  const parts = flatDotPath.split(".");
  const root = parts[0];
  if (!(SITE_SETTING_KEYS as readonly string[]).includes(root)) return flatDotPath;
  const i = (SITE_SETTING_KEYS as readonly string[]).indexOf(root);
  const tail = parts.slice(1).join(".");
  return tail ? `settings.${i}.${tail}` : `settings.${i}`;
}
