# Doctor Sites — Architecture Reference

> Precise technical reference for AI-assisted development. Covers every subsystem,
> data contract, extension point, and constraint that matters when writing or reviewing code.

---

## System overview

Doctor Sites is a **multi-tenant static site builder** for doctors and hospitals.

```
content/{type}/{tenantId}/      ← source of truth (JSON files)
        │
        ▼  TinaCMS or import API writes JSON
        │
        ▼  Next.js renders JSON → React → HTML
        │
        ▼  deploy-tenant.mjs copies .next/ output → sites/{type}/{tenantId}/
        │
        ▼  surge / cloudflare publishes sites/ as static hosting
```

Each tenant is completely isolated: separate content folder, separate deploy target,
separate credentials entry.

---

## Directory map

```
/
├── content/
│   ├── doctors/{tenantId}/site/index.json         site config
│   └── doctors/{tenantId}/pages/{slug}.json       page blocks
├── public/content/{type}/{tenantId}/              uploaded media
├── sites/{type}/{tenantId}/                       GENERATED — do not edit
├── data/
│   └── credentials.json                           PBKDF2 hashed passwords + roles
├── docs/                                          documentation
├── scripts/                                       build + deploy CLI tools
├── src/
│   ├── app/                                       Next.js App Router
│   │   ├── api/                                   REST API routes
│   │   ├── creator/                               editor UI routes
│   │   └── site/                                  public + preview render routes
│   ├── blocks/                                    block component system
│   ├── components/                                shared React components
│   ├── lib/                                       pure utilities (no Next.js imports)
│   └── platform/                                  core rendering + types
└── tina/config.ts                                 TinaCMS field schemas
```

---

## Data layer

### JSON file contracts

**`content/{type}/{tenantId}/site/index.json`**

Top-level fields:

| Field | Type | Notes |
|-------|------|-------|
| `tenantId` | string | kebab-case, max 50 chars, `TENANT_ID_RE` |
| `tenantType` | `"doctor" \| "hospital"` | |
| `status` | `"active" \| "inactive"` | |
| `settings` | array | 8 template objects, order is significant |

`settings[]` order (must be preserved):

| Index | `_template` | Purpose |
|-------|-------------|---------|
| 0 | `subscription` | plan, billingCycle, validFrom/Until, paymentStatus |
| 1 | `domains` | primary domain, aliases[] |
| 2 | `profile` | displayName, specialty, degrees[], bio, photo |
| 3 | `business` | clinicName, phone, whatsapp, email, address, mapUrl |
| 4 | `presentation` | themeId, variantPresetId, styleId, style.{colors,shape,typography} |
| 5 | `header` | show, logo, navLinks[] |
| 6 | `footer` | show, copyright, socialLinks[], showBusinessInfo |
| 7 | `seo` | title, description, keywords[] |

Optional 8th template: `analytics` (gaMeasurementId, gtmContainerId, metaPixelId, customScripts[]).

---

**`content/{type}/{tenantId}/pages/{slug}.json`**

| Field | Type | Notes |
|-------|------|-------|
| `blocks` | array | TenantBlock union members |
| `settings` | array | Exactly 3 items, fixed order |
| `_template` | `"page"` | Always |

`settings[]` order (must be exactly 3 items in this order):

| Index | `_template` | Fields |
|-------|-------------|--------|
| 0 | `urlSettings` | slug, path, title, isHome |
| 1 | `presentation` | themeId, variantPresetId, styleId (page overrides site) |
| 2 | `seo` | title, description, keywords[], ogImage |

---

### TypeScript types — `src/platform/types.ts`

**Key exports:**

```typescript
TenantType = "doctor" | "hospital"

TenantBlock  // union of 15 block shapes, discriminated by _template

TenantPage {
  blocks: TenantBlock[];
  settings?: [...];
  slug?, title?, path?, isHome?, presentation?, seo?  // merged from settings
}

TenantSite {
  tenantId, tenantType, status
  subscription, domains, profile, business, presentation, seo
  header?, footer?, pages?
}

Tenant = TenantSite & TenantPage  // what SiteRenderer receives

VariantPreset { hero, profile, services, timings, gallery, faq, cta }
StylePreset   { colors{primary,secondary,accent,background,surface,text}, shape{radius}, typography{heading,body} }
```

Per-block types are re-exported from `src/blocks/{name}/types.ts` and available via `src/platform/types.ts`.

---

### Valid enum values

All enums are defined in `src/lib/importValidator.ts` and mirrored in `src/platform/catalog.ts`.

**`themeId`** (controls block order defaults):
- `doctor-standard`, `doctor-profile-heavy`, `doctor-service-heavy`
- `hospital-standard`, `hospital-emergency-first`

**`styleId`** (color palette + typography):
- Doctor: `doctor-teal-clean`, `doctor-premium-warm`, `doctor-bright-child`, `doctor-derma-minimal`, `doctor-slate-precision`
- Hospital: `hospital-blue-modern`, `hospital-green-trust`, `hospital-red-emergency`, `hospital-indigo-specialty`, `hospital-community-soft`

**`variantPresetId`** (CSS layout variant per block type):
- Doctor: `doctor-classic`, `doctor-editorial`, `doctor-compact`, `doctor-premium`, `doctor-specialist`
- Hospital: `hospital-standard`, `hospital-emergency`, `hospital-specialty`, `hospital-community`, `hospital-network`

**Block `_template` values** (15 total):
`header`, `footer`, `hero`, `profile`, `services`, `timings`, `gallery`, `faq`, `testimonials`, `stats`, `awards`, `cta`, `text`, `whatsapp`, `location`

---

### ID format rules (`src/lib/importValidator.ts`)

```
TENANT_ID_RE = /^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/
SLUG_RE      = /^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$/
```

Both `tenantId` and page `slug` must match. Max 50 chars. No leading/trailing hyphens.

---

## Content adapter layer — `src/platform/contentAdapter/`

Pluggable storage backend. Interface (`types.ts`):

```typescript
interface ContentAdapter {
  read(path: string): Promise<string>
  write(path, content): Promise<void>
  delete(path): Promise<void>
  list(dir): Promise<ContentEntry[]>
  exists(path): Promise<boolean>
}
```

Implementations in `adapters/`:
- `fs.ts` — local filesystem (default in dev)
- `s3.ts` — AWS S3
- `github.ts` — GitHub repository via `@octokit/rest`
- `gcp.ts` — Google Cloud Storage

Factory in `index.ts` selects adapter from `CONTENT_ADAPTER` env var.

---

## Block system — `src/blocks/`

### Structure per block

Every block folder contains:
- `index.ts` — entry (re-exports)
- `types.ts` — TypeScript interface for the block's props
- `schema.ts` — TinaCMS field schema (used by `tina/config.ts`)
- `{BlockName}.tsx` — React component

### Block fields (universal)

Every block has:
- `_template` — discriminant
- `enabled?: boolean` — if `false`, block is skipped in render
- `css?: string` — JSON-serialised CSS properties applied as `!important` inline style
- `variant?: string` — selects layout variant class
- `backgroundImage?: string` — optional background image URL

### Block registry — `src/blocks/registry.ts`

Maps `_template` string → React component. `SiteRenderer` resolves via this registry.

### Shared block utilities — `src/blocks/shared/`

- `ButtonGroup.tsx` — renders `buttons[]` arrays
- `MarkdownText.tsx` — simple markdown → HTML renderer
- `primitives.tsx` — Kicker, SectionTitle, etc.
- `navLinks.tsx` — renders nav/social link polymorphic types (sectionLink, pageLink, externalLink)

---

## Rendering pipeline — `src/platform/SiteRenderer.tsx`

Input: `Tenant` object (merged site + page).

1. Computes active `StylePreset` from `styleId` (plus any `presentation.style.*` overrides).
2. Injects CSS custom properties onto root element: `--primary`, `--secondary`, `--accent`, `--site-bg`, `--surface`, `--site-text`, `--radius`, `--heading`, `--body`.
3. Resolves header/footer: page-level block overrides site-level settings.
4. Maps each enabled block in `page.blocks` → component via `registry.ts`.
5. Applies per-block `css` field (parsed JSON → inline style with `!important`).
6. Applies per-block `variant` as a CSS class (resolved from `VariantPreset`).

`SiteRenderer` is used by both the public page route and the preview iframe.

---

## Settings normalization — `src/platform/siteSettingsNormalize.ts`

The `settings[]` array uses a template-indexed pattern. TinaCMS `tinaField()` annotations
need array-index paths (e.g. `settings.2.displayName`) not flat paths (e.g. `profile.displayName`).

`toSiteSettingsPathFromFlat(flatPath, doc)` translates between these representations by
scanning `settings[]` for the matching `_template` and returning the resolved index path.

---

## Theming system — `src/platform/catalog.ts`

Three independent concepts, composed at render time:

| Concept | Field | Controls | Example |
|---------|-------|----------|---------|
| Theme | `themeId` | Block order / default block list | `doctor-standard` |
| Variant preset | `variantPresetId` | CSS layout variant per block | `doctor-classic` |
| Style preset | `styleId` | Colors + typography + border radius | `doctor-teal-clean` |

`getThemeBlocks(tenant)` returns default `TenantBlock[]` for a given `themeId`.
`getPreset(tenant)` returns the `VariantPreset` for a `variantPresetId`.
`stylePresets` is a `Record<string, StylePreset>` of 10 colour themes.

---

## API routes — `src/app/api/`

### Auth

| Route | Method | Body | Notes |
|-------|--------|------|-------|
| `/api/auth/login` | POST | `{ username, password }` | Returns JWT |
| `/api/auth/verify` | GET | — | Header: `Authorization: Bearer <token>` |

JWT uses PBKDF2 SHA-256 (32k iterations). Token payload: `{ tenantId, role, tenantType }`.
Credentials stored in `data/credentials.json`. Managed via `scripts/set-credentials.mjs`.

### Content

| Route | Method | Query / Body | Auth |
|-------|--------|-------------|------|
| `/api/content/read` | GET | `?tenantType&tenantId&pageSlug` | tenant or admin |
| `/api/content/save` | POST | `{ tenantType, tenantId, slug, data }` | tenant or admin |
| `/api/content/media` | GET | `?tenantType&tenantId` | tenant or admin |
| `/api/content/media` | POST | multipart: `file` | tenant or admin |
| `/api/content/snapshot` | POST | `{ tenantType, tenantId, slug }` | tenant or admin |

### Tenant management

| Route | Method | Body | Auth |
|-------|--------|------|------|
| `/api/tenants` | GET | — | admin |
| `/api/create-tenant` | POST | `{ tenantType, profile, presentation }` JSON | admin |
| `/api/import/tenant` | POST | multipart: `site` (JSON str), `pages` (JSON str), `image` (files) | admin |
| `/api/import/page` | POST | multipart: `tenantId`, `tenantType`, `page` (JSON str), `overwrite`, `image` (files) | admin |

### Utilities

| Route | Method | Query | Notes |
|-------|--------|-------|-------|
| `/api/pexels` | GET | `?query&page&per_page` | Stock photo proxy |

---

## UI routes — `src/app/`

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | `login/page.tsx` | JWT login form |
| `/creator` | `creator/page.tsx` | Tenant dashboard list |
| `/creator/create-tenant` | `creator/create-tenant/page.tsx` | New tenant creation form |
| `/creator/import` | `creator/import/page.tsx` | AI JSON import (two tabs) |
| `/creator/[tenantType]/[tenantId]` | `CreatorStudioClient.tsx` | Split-pane editor |
| `/site/[tenantId]/[pageSlug]` | `site/.../page.tsx` | Public site render |
| `/site/[tenantId]/[pageSlug]/preview` | `preview/page.tsx` + `LivePreviewClient.tsx` | Preview iframe |

---

## CreatorStudio mechanics — `src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx`

Key responsibilities:

1. **Hash monitoring** — polls TinaCMS admin iframe `location.hash` to detect which
   document is active → updates preview iframe URL accordingly.

2. **Draft sync** — collects all TinaCMS form values via DOM inspection of
   `data-tina-field` attributes, sends as `postMessage` to preview iframe so preview
   reflects unsaved changes.

3. **Inline editing** — clicks in preview with `data-tina-field` route focus back to
   the matching TinaCMS form field.

4. **Viewport toggle** — mobile / tablet / desktop preview frame widths.

5. **AI suggestion engine** — `Ctrl+Space` opens `SuggestionPopup.tsx`, calls
   `/api/...` to generate AI catchphrases for headline/subheadline/services content
   based on specialty.

---

## Import system — `src/app/api/import/` + `src/app/creator/import/`

End-to-end flow for AI-generated site creation:

```
AI generates site.json + page.json
        │
        ▼  POST /api/import/tenant (multipart)
           1. validateSiteJson()   — importValidator.ts
           2. validatePageJson()   — importValidator.ts
           3. auditImages()        — imageScanner.ts (checks all /content/... refs)
           4. Returns 422 if any image ref is missing
           5. Writes content/{type}/{id}/site/index.json
           6. Writes content/{type}/{id}/pages/{slug}.json
           7. Writes uploaded files → public/content/{type}/{id}/
```

**`src/lib/imageScanner.ts`** — scans JSON for `/content/...` paths in these keys:
`photo`, `src`, `backgroundImage`, `logo`, `ogImage`, `image`

**`src/lib/importValidator.ts`** — pure TS, no Node/Next imports, safe client+server.
Validates: ID format, tenantType enum, required settings templates, block `_template`
enum, themeId/styleId/variantPresetId enums, required sub-fields per block type.

---

## Authentication model

```
data/credentials.json
  {
    "{tenantId}": { username, hash, salt, role: "tenant", tenantType },
    "__admin__":  { username, hash, salt, role: "admin" }
  }
```

- Tenant tokens can only read/write their own `tenantId` content.
- Admin tokens can access all content and management endpoints.
- PBKDF2 SHA-256, 32k iterations, 32-byte random salt.
- `src/lib/token.ts` — token generation and verification.
- `src/lib/clientAuth.ts` — reads token from localStorage, builds `Authorization` header.

---

## Deploy pipeline — `scripts/deploy-tenant.mjs`

```
node scripts/deploy-tenant.mjs <tenantId> [--build]
```

Steps:
1. `next build` (only if `--build` flag or no `.next/` exists)
2. Copy `.next/server/app/site/{tenantId}/*.html` → `sites/{type}/{id}/`
3. Copy `.next/static/` → `sites/{type}/{id}/_next/static/`
4. Fix relative paths in HTML (make `_next/` refs work from custom domain)
5. Copy `public/content/{type}/{id}/` media to `sites/{type}/{id}/content/`
6. Run `surge sites/doctors/{id} {id}.surge.sh`

Batch deploy: `scripts/deploy-surge.mjs` (all tenants), `scripts/deploy-cloudflare.mjs`.

---

## TinaCMS integration — `tina/config.ts`

Key customisations:

- **CSS field plugin** `ui: { component: "css" }` — registered as custom Tina field.
  Modal with 300+ CSS property search, color picker, structured/raw JSON toggle.
  Dispatches `set-active-css` event for live preview sync.

- **Image field** `tenantImageField()` — custom upload handler that routes to
  `public/content/{type}/{tenantId}/` by reading tenant context from URL hash or breadcrumbs.

- **Nav-link polymorphism** — three templates on nav/social fields:
  `sectionLink` (scroll to section), `pageLink` (internal slug), `externalLink` (full URL).

- **Admin iframe integration** — TinaCMS iframe posts hash changes to parent window
  so `CreatorStudioClient` can update the preview URL.

- **Local-only mode** — `TINA_PUBLIC_IS_LOCAL=true` means TinaCMS reads/writes files
  directly via filesystem, no cloud CMS involved.

---

## CSS-in-blocks pattern

Block `css` field is stored as a JSON string, not raw CSS:

```json
{ "css": "{\"background-color\":\"#f5f5f5\",\"padding-top\":\"80px\"}" }
```

`SiteRenderer` parses this and applies as inline style with `!important` on the block wrapper.
The CSS field plugin in TinaCMS presents a structured UI for building this string.

---

## Extension points

### Add a new block type

1. Create `src/blocks/{name}/` with `types.ts`, `schema.ts`, `{Name}.tsx`, `index.ts`.
2. Add union member to `TenantBlock` in `src/platform/types.ts`.
3. Register in `src/blocks/registry.ts`.
4. Add template to `tina/config.ts` `pageFields[0].templates`.
5. Export per-block type from `src/platform/types.ts`.
6. Add `_template` value to `VALID_BLOCK_TEMPLATES` in `src/lib/importValidator.ts`.
7. Optionally add to default theme layouts in `src/platform/catalog.ts#themeLayouts`.

### Add a new style preset

1. Add entry to `stylePresets` in `src/platform/catalog.ts`.
2. Add `{ label, value }` to `styleId` selector in `tina/config.ts` (both site and page fields).
3. Add to `VALID_STYLE_IDS` in `src/lib/importValidator.ts`.

### Add a new theme (block order preset)

1. Add entry to `themeLayouts` in `src/platform/catalog.ts`.
2. Add `{ label, value }` to `themeId` selector in `tina/config.ts`.
3. Add to `VALID_THEME_IDS` in `src/lib/importValidator.ts`.

### Add a new content adapter

1. Implement `ContentAdapter` interface in `src/platform/contentAdapter/adapters/{name}.ts`.
2. Register in `src/platform/contentAdapter/index.ts` factory.

---

## Key invariants

- `content/` files are the source of truth. Never hand-edit `sites/`.
- `page.settings[]` must be exactly 3 items in fixed order.
- `site.settings[]` must be exactly 8 items in fixed order (+ optional analytics at 8).
- Block `css` field is always a JSON string, never raw CSS.
- `tenantId` and page `slug` must satisfy `TENANT_ID_RE` / `SLUG_RE`.
- The `whatsapp` and `location` blocks do not have `kicker`/`title` top-level — check the type.
- `src/lib/imageScanner.ts` and `src/lib/importValidator.ts` must remain import-free of Node.js/Next.js.
- `SiteRenderer.tsx` is used for both public render and preview — changes affect both.
- `data/credentials.json` is tracked in git. Do not commit real production secrets.
