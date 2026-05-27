/**
 * @file src/blocks/index.ts
 *
 * Bootstrap file — imports and registers all block definitions into the
 * global registry.  Import this file once (as a side-effect) at the app's
 * entry point or inside SiteRenderer so the registry is populated before
 * any block is resolved.
 *
 * Adding a new block:
 *   1. Create src/blocks/{name}/ following the 4-file pattern
 *   2. Import its definition below and add it to the register call
 *
 * Adding a tenant-specific block:
 *   1. Create src/blocks/tenants/{tenantId}/index.ts
 *   2. Import it in the "Tenant-specific" section below
 *
 * Adding a tenant-type block (doctor-only / hospital-only):
 *   1. Create src/blocks/types/{type}/{name}/index.ts
 *   2. Import it in the "Tenant-type-scoped" section below
 */

import { registry } from "./registry";

// ── Global blocks (available to all tenants) ──────────────────────────────

import { heroDefinition }         from "./hero";
import { profileDefinition }      from "./profile";
import { servicesDefinition }     from "./services";
import { timingsDefinition }      from "./timings";
import { galleryDefinition }      from "./gallery";
import { faqDefinition }          from "./faq";
import { ctaDefinition }          from "./cta";
import { testimonialsDefinition } from "./testimonials";
import { statsDefinition }        from "./stats";
import { textDefinition }         from "./text";
import { awardsDefinition }       from "./awards";
import { whatsappDefinition }     from "./whatsapp";
import { locationDefinition }     from "./location";
import { headerDefinition }       from "./header";
import { footerDefinition }       from "./footer";

[
  heroDefinition,
  profileDefinition,
  servicesDefinition,
  timingsDefinition,
  galleryDefinition,
  faqDefinition,
  ctaDefinition,
  testimonialsDefinition,
  statsDefinition,
  textDefinition,
  awardsDefinition,
  whatsappDefinition,
  locationDefinition,
  headerDefinition,
  footerDefinition,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
].forEach((def) => registry.register(def as any));

// ── Tenant-type-scoped blocks ─────────────────────────────────────────────
// Uncomment when you create doctor-only or hospital-only blocks.
//
// import "./types/doctor/procedure-checklist";
// import "./types/hospital/department-directory";

// ── Tenant-specific blocks ────────────────────────────────────────────────
// Uncomment when a specific tenant gets custom blocks.
//
// import "./tenants/nitesh-garwa";

// ── Re-exports ────────────────────────────────────────────────────────────

export { registry } from "./registry";
export { registerBlock } from "./registry";
