/**
 * @file src/blocks/shared/navlinks.ts
 *
 * Nav-link types and resolution helpers shared between the Header and Footer
 * block site renderers, and any future navigation blocks.
 *
 * Supports three storage formats:
 *   1. Legacy string — "Label|/url" or "Label|#sectionId"
 *   2. Legacy Tina _template — { _template: "sectionLink"|"pageLink"|"externalLink", ... }
 *   3. Modern type-based — { type: "section"|"page"|"external", label, ... }
 */

// ── Types ──────────────────────────────────────────────────────────────────

/** Modern normalized nav-link item (produced by FNavLinks and stored in JSON). */
export type NavLinkModern =
  | { type: "section"; label: string; sectionId: string; icon?: string }
  | { type: "page"; label: string; pageSlug: string; icon?: string }
  | { type: "external"; label: string; url: string; icon?: string };

/** Legacy Tina _template format still present in older JSON files. */
export type NavLinkLegacy =
  | { _template: "sectionLink"; label: string; sectionId: string; icon?: string }
  | { _template: "pageLink"; label: string; pageSlug: string; icon?: string }
  | { _template: "externalLink"; label: string; url: string; icon?: string };

/**
 * The union of all nav-link shapes that may appear in a page.blocks[]
 * or site.settings[].header.navLinks array.
 */
export type NavLinkItem = string | NavLinkModern | NavLinkLegacy;

/** Resolved, render-ready form of any NavLinkItem. */
export interface ResolvedNavLink {
  label: string;
  href: string;
  icon?: string;
}

// ── Resolver ───────────────────────────────────────────────────────────────

/**
 * Convert any nav-link format into a { label, href, icon } triple ready for
 * use in an <a> element.
 */
export function resolveNavLink(link: NavLinkItem): ResolvedNavLink {
  // String format: "Label|/url" or plain "Label"
  if (typeof link === "string") {
    const pipeIdx = link.indexOf("|");
    if (pipeIdx < 0) return { label: link, href: "#" };
    const label = link.slice(0, pipeIdx);
    const url   = link.slice(pipeIdx + 1);
    return { label, href: url || "#" };
  }

  // Legacy Tina _template format
  if ("_template" in link) {
    const l = link as NavLinkLegacy;
    if (l._template === "sectionLink")
      return { label: l.label, href: `#${l.sectionId}`, icon: l.icon };
    if (l._template === "pageLink")
      return { label: l.label, href: `/${(l as any).pageSlug}`, icon: l.icon };
    if (l._template === "externalLink")
      return { label: l.label, href: (l as any).url ?? "#", icon: l.icon };
  }

  // Modern type-based format
  const m = link as NavLinkModern;
  if (m.type === "section")
    return { label: m.label, href: `#${(m as any).sectionId ?? ""}`, icon: m.icon };
  if (m.type === "page")
    return { label: m.label, href: `/${(m as any).pageSlug ?? ""}`, icon: m.icon };
  if (m.type === "external")
    return { label: m.label, href: (m as any).url ?? "#", icon: m.icon };

  return { label: "", href: "#" };
}

/**
 * Normalize a raw array (strings, legacy, or modern items) into the modern
 * NavLinkModern format used by FNavLinks inside BlockEditor.
 */
export function normalizeNavItems(raw: NavLinkItem[]): NavLinkModern[] {
  return raw.map((nl) => {
    if (typeof nl === "string") {
      const pipe  = nl.indexOf("|");
      const label = pipe > 0 ? nl.slice(0, pipe) : nl;
      const target = pipe > 0 ? nl.slice(pipe + 1) : "";
      if (target.startsWith("#"))
        return { label, type: "section" as const, sectionId: target.slice(1) };
      if (target.startsWith("/"))
        return { label, type: "page" as const, pageSlug: target.slice(1) };
      if (target.startsWith("http"))
        return { label, type: "external" as const, url: target };
      return { label, type: "section" as const, sectionId: "" };
    }

    // Already modern (has `type` field)
    if ("type" in nl && ["section", "page", "external"].includes((nl as NavLinkModern).type)) {
      return nl as NavLinkModern;
    }

    // Legacy Tina _template format
    if ("_template" in nl) {
      const l = nl as NavLinkLegacy;
      if (l._template === "sectionLink")
        return { label: l.label ?? "", type: "section" as const, sectionId: l.sectionId ?? "", icon: l.icon };
      if (l._template === "pageLink")
        return { label: l.label ?? "", type: "page" as const, pageSlug: (l as any).pageSlug ?? "", icon: l.icon };
      if (l._template === "externalLink")
        return { label: l.label ?? "", type: "external" as const, url: (l as any).url ?? "", icon: l.icon };
    }

    return { label: String((nl as any).label ?? ""), type: "section" as const, sectionId: "" };
  });
}
