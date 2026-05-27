# Doctor Sites — Architecture Reference

> Precise technical reference for AI-assisted development. Covers every subsystem,
> data contract, extension point, and constraint that matters when writing or reviewing code.

---

## System overview

Doctor Sites is a **multi-tenant static site builder** for doctors and hospitals.

```
content/{type}/{tenantId}/      ← source of truth (JSON files)
        │
        ▼  BlockEditor (native React) or import API writes JSON via ContentAdapter
        │
        ▼  Next.js renders JSON → React → HTML (SSG + preview)
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
│   │   │   ├── auth/                               login + verify
│   │   │   ├── content/                            read, save, media, snapshot
│   │   │   ├── create-tenant/                      tenant creation
│   │   │   └── import/                              AI import endpoints
│   │   ├── creator/                                editor UI routes
│   │   ├── login/                                  auth form
│   │   └── site/                                   public + preview render routes
│   ├── blocks/                                     block component system
│   ├── components/                                 shared React components
│   │   └── editor/                                 BlockEditor + JsonForm
│   ├── lib/                                        pure utilities
│   │   ├── icons.tsx                               icon registry (emoji + SVG)
│   │   ├── token.ts                                JWT generation/verification
│   │   ├── importValidator.ts                      validation enums + regex
│   │   └── catchphrases.ts                         AI suggestion engine
│   └── platform/                                   core rendering + types + adapters
│       ├── content.ts                              async content queries
│       ├── contentAdapter/                         pluggable storage backends
│       │   ├── index.ts                            factory (CONTENT_BACKEND env)
│       │   └── adapters/                           fs, github, s3, gcp
│       ├── SiteRenderer.tsx                        renders Tenant → HTML
│       ├── SitePageClient.tsx                      preview client
│       ├── types.ts                                Tenant, TenantBlock, etc.
│       ├── catalog.ts                              themes, presets, style config
│       └── siteSettingsNormalize.ts                settings[] ↔ flat translation
└── docs/                                           architecture, features, contributing
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
| `settings` | array | Up to 9 template objects, order is significant |

`settings[]` order (must be preserved):

| Index | `_template` | Purpose |
|-------|-------------|---------|
| 0 | `subscription` | plan, billingCycle, validFrom/Until, paymentStatus |
| 1 | `domains` | primary domain, aliases[] |
| 2 | `profile` | displayName, specialty, degrees[], bio, photo |
| 3 | `business` | clinicName, phone, whatsapp, email, address, mapUrl |
| 4 | `presentation` | themeId, variantPresetId, styleId, style.{colors,shape,typography} |
| 5 | `header` | show, logo, navLinks[] |
| 6 | `footer` | show, copyright, links[], socialLinks[], linksHeading, socialHeading |
| 7 | `seo` | title, description, keywords[], ogImage |
| 8 | `analytics` | gaMeasurementId, gtmContainerId, metaPixelId |

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
  header?, footer?, analytics?, pages?
}

Tenant = TenantSite & TenantPage  // what SiteRenderer receives

VariantPreset { hero, profile, services, timings, gallery, faq, cta }
StylePreset   { colors{primary,secondary,accent,background,surface,text}, shape{radius}, typography{heading,body} }
```

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

Pluggable storage backend. Selects adapter via `CONTENT_BACKEND` env var.

Interface (`types.ts`):

```typescript
interface ContentEntry { name: string; type: 'file' | 'dir' }

interface ContentAdapter {
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  delete(path: string): Promise<void>
  list(dir: string): Promise<ContentEntry[]>
  exists(path: string): Promise<boolean>
}
```

Implèmentations in `adapters/`:

| Adapter | `CONTENT_BACKEND` | Uses |
|---------|-------------------|------|
| `fs.ts` | `"fs"` (default) | `node:fs/promises` |
| `github.ts` | `"github"` | `@octokit/rest` — commits JSON on write |
| `s3.ts` | `"s3"` | `@aws-sdk/client-s3` |
| `gcp.ts` | `"gcp"` | GCP JSON API via `fetch` + service account JWT |

**Path convention:** Adapter paths include the `content/` prefix. Example: `content/doctors/dr-smith/site/index.json`.

**Factory** (`index.ts`) returns a singleton adapter based on `CONTENT_BACKEND`. All content reads (`content.ts`) and writes (`api/content/save`, `api/create-tenant`) use the adapter.

---

## Visual editor — `src/components/editor/BlockEditor.tsx`

The editor is **fully native React** — no TinaCMS, no iframe admin, no GraphQL backend.

### Architecture

```
/creator                            ← tenant list (server component, async)
/creator/[tenantType]/[tenantId]    ← split-pane editor (client component)
    ├── Left: panel header + block list + add block menu
    │   ├── Block cards (collapsible, drag-to-reorder)
    │   │   ├── Tabs: Content | Presentation
    │   │   ├── Content: block-specific fields with suggestion engine
    │   │   └── Presentation: background image, variant, CSS overrides
    │   └── Site settings drawer (right-side modal)
    │       └── Sections: Profile, Business, Presentation, Header, Footer, SEO, Analytics
    └── Right: live preview iframe
        └── Renders /site/{tenantId}/{slug}/preview?studio=1
```

### Key features

- **Dark/light theme toggle** — persisted in localStorage (`editor-theme`)
- **Live preview sync** — every field change triggers a 180ms debounced `postMessage({ type: "studio:draft-update", payload })` to the preview iframe
- **Drag-to-reorder** — blocks and nested items (services, timings, nav links, etc.) all support HTML5 drag-and-drop
- **Block tabs** — each block has Content + Presentation tabs
- **Icon picker** — emoji grid popup (position: fixed) for selecting icons on nav links, service items, etc.
- **Rich text fields** — contentEditable with toolbar (B/I/U/H3/Link)
- **Image picker** — thumbnail preview + sample image grid + URL input
- **Color pickers** — native `<input type="color">` + hex text input
- **WYSIWYG suggestions** — `Ctrl+Space` opens AI-generated catchphrases via `SuggestionPopup`
- **Save flow** — Save Page and Save Site buttons POST to `/api/content/save`
- **Version history** — right-side panel shows snapshots, allows restore (reads from `/api/content/snapshot`)
- **Viewport toggle** — mobile (375px) / tablet (768px) / desktop preview

### Sub-components

| Component | Purpose |
|-----------|---------|
| `BlockCard` | Collapsible card per block with drag handle, enable toggle, type badge |
| `BlockForm` | Renders Content or Presentation tab fields per block type |
| `SiteSettingsDrawer` | Right-side modal with section tabs + save button |
| `FNavLinks` | Multi-item nav link editor: label, type (section/page/URL), icon picker, drag-to-reorder |
| `FItems` | Collapsible item list (services, timings, gallery, etc.) with drag-to-reorder |
| `FButtons` | Button editor: label, URL, icon, variant |
| `FRich` | Rich text editor with toolbar + suggestion trigger |
| `FImage` | Image URL input with thumbnail preview + sample grid |
| `FColor` | Color picker input |
| `IconPicker` | Emoji grid popup (fixed positioning, z-index 9999) |

### Draft sync flow

```
Field change → React setState → useEffect (180ms debounce) → pushDraft()
  → builds payload from page.blocks + flattened site.settings
  → postMessage({ type: "studio:draft-update", payload }, previewOrigin)
  → LivePreviewClient receives → deepMerge into tenant state → re-render
```

---

## Rendering pipeline — `src/platform/SiteRenderer.tsx`

Input: `Tenant` object (merged site + page).

1. Computes active `StylePreset` from `styleId` (plus any `presentation.style.*` overrides).
2. Injects CSS custom properties onto root element: `--primary`, `--secondary`, `--accent`, `--site-bg`, `--surface`, `--site-text`, `--radius`, `--heading`, `--body`.
3. Resolves header/footer: page-level block overrides site-level settings.
4. Maps each enabled block in `page.blocks` → component via registry.
5. Applies per-block `css` field (parsed JSON → inline style with `!important`).
6. Applies per-block `variant` as a CSS class (resolved from `VariantPreset`).

`SiteRenderer` is used by both the public page route and the preview iframe.

---

## Block system — `src/blocks/`

### Structure per block

Every block folder contains:
- `index.ts` — entry (re-exports)
- `types.ts` — TypeScript interface for the block's props
- `schema.ts` — field schema (used for validation/import)
- `{BlockName}.tsx` — React component

### Block fields (universal)

Every block has:
- `_template` — discriminant
- `enabled?: boolean` — if `false`, block is skipped in render
- `css?: string` — JSON-serialised CSS properties applied as `!important` inline style
- `variant?: string` — selects layout variant class
- `backgroundImage?: string` — optional background image URL

### Nav link data format

Header `navLinks` and footer `links`/`socialLinks` fields accept two formats:

**New format** (from FNavLinks editor):
```typescript
{ type: "section" | "page" | "external", label: string, sectionId?: string, pageSlug?: string, url?: string, icon?: string }
```

**Legacy format** (from TinaCMS):
```typescript
{ _template: "sectionLink" | "pageLink" | "externalLink", label: string, sectionId?: string, pageSlug?: string, url?: string }
```

**String format** (pipe-delimited):
```
"Label|#sectionId"       // section link
"Label|/pageSlug"        // page link
"Label|https://..."      // external link
```

`resolveNavLink()` in `SiteRenderer.tsx` handles all three formats plus renders emoji icons via `iconToEmoji()`.

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

| Route | Method | Query / Body | Auth | Notes |
|-------|--------|-------------|------|-------|
| `/api/content/read` | GET | `?tenantType&tenantId&pageSlug` | tenant or admin | Reads via ContentAdapter |
| `/api/content/save` | POST | `{ tenantType, tenantId, pageSlug, data }` | tenant or admin | Writes via ContentAdapter |
| `/api/content/media` | GET | `?tenantType&tenantId` | tenant or admin | List media |
| `/api/content/media` | POST | multipart: `file` | tenant or admin | Upload media |
| `/api/content/snapshot` | POST/GET/PUT | `{ tenantType, tenantId, slug, timestamp }` | tenant or admin | Version history |

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
| `/creator` | `creator/page.tsx` | Tenant dashboard list (server component, async) |
| `/creator/create-tenant` | `creator/create-tenant/page.tsx` | New tenant creation form |
| `/creator/import` | `creator/import/page.tsx` | AI JSON import (two tabs) |
| `/creator/[tenantType]/[tenantId]` | `CreatorStudioClient.tsx` | Split-pane BlockEditor |
| `/site/[tenantId]/[pageSlug]` | `site/.../page.tsx` | Public site render (SSG) |
| `/site/[tenantId]/[pageSlug]/preview` | `preview/page.tsx` + `LivePreviewClient.tsx` | Preview iframe |

---

## Settings normalization — `src/platform/siteSettingsNormalize.ts`

The `settings[]` array uses a template-indexed pattern. For reading content on the server:

```typescript
// siteSettingsNormalize exports:
export const SITE_SETTING_KEYS = [
  "subscription", "domains", "profile", "business",
  "presentation", "header", "footer", "seo", "analytics"
] as const;
```

`unwrapSiteSettingsToFlat(site)` converts `settings[]` → flat properties (e.g., `site.settings` with `_template: "footer"` → `site.footer = { ...payload }`).

`wrapFlatSiteIntoSettings(site)` does the reverse — used by `create-tenant` API.

---

## Import system — `src/app/api/import/` + `src/app/creator/import/`

End-to-end flow for AI-generated site creation:

```
AI generates site.json + page.json
        │
        ▼  POST /api/import/tenant (multipart)
           1. validateSiteJson()   — importValidator.ts
           2. validatePageJson()   — importValidator.ts
           3. auditImages()        — imageScanner.ts
           4. Returns 422 if any image ref is missing
           5. Writes content/{type}/{id}/site/index.json via ContentAdapter
           6. Writes content/{type}/{id}/pages/{slug}.json via ContentAdapter
           7. Writes uploaded files → public/content/{type}/{id}/
```

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

---

## Deploy pipeline — `scripts/deploy-tenant.mjs`

```
node scripts/deploy-tenant.mjs <tenantId> [--build]
```

Steps:
1. `next build` (only if `--build` flag or no `.next/` exists)
2. Copy `.next/server/app/site/{tenantId}/*.html` → `sites/{type}/{id}/`
3. Copy `.next/static/` → `sites/{type}/{id}/_next/static/`
4. Fix relative paths in HTML
5. Copy `public/content/{type}/{id}/` media to `sites/{type}/{id}/content/`
6. Run `surge` or Cloudflare deploy

Batch deploy: `scripts/deploy-surge.mjs` (all tenants), `scripts/deploy-cloudflare.mjs`.

---

## Build & dev

```bash
pnpm dev            # Next.js dev server on :3000
pnpm build          # Production build
pnpm build:tenants  # Build + generate tenant static output
```

No TinaCMS build step. Content is read from filesystem (local dev) or configured backend (production).

Environment variables:

| Variable | Purpose |
|----------|---------|
| `CONTENT_BACKEND` | `"fs"` (default), `"github"`, `"s3"`, `"gcp"` |
| `JWT_SECRET` | Token signing secret |
| `PEXELS_API_KEY` | Stock photo search |
| `ANTHROPIC_API_KEY` | AI suggestion feature |
| `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_PERSONAL_ACCESS_TOKEN` / `GITHUB_BRANCH` | GitHub backend |
| `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_ENDPOINT` | S3 backend |
| `GCP_PROJECT_ID` / `GCP_BUCKET` / `GCP_CLIENT_EMAIL` / `GCP_PRIVATE_KEY` | GCP backend |

---

## C̀SS-in-blocks pattern

Block `css` field is stored as a JSON string, not raw CSS:

```json
{ "css": "{\"background-color\":\"#f5f5f5\",\"padding-top\":\"80px\"}" }
```

`SiteRenderer` parses this and applies as inline style with `!important` on the block wrapper.

---

## Live preview protocol

The preview iframe communicates with the editor via `postMessage`:

```typescript
// Editor → Preview (draft update)
{ type: "studio:draft-update", payload: Tenant }

// Preview receives via window.addEventListener("message", ...)
// LivePreviewClient deep-merges payload into current tenant state
```

---

## Version history / snapshots

- Before every save, the old JSON is archived to `content/{type}/{tenantId}/pages-backup/`.
- Snapshot filenames include a timestamp.
- Triggered via `POST /api/content/snapshot`.
- Restored via `PUT /api/content/snapshot` with `timestamp` in body.
- Version history panel in CreatorStudio reads from `GET /api/content/snapshot`.

---

## Extension points

### Add a new block type

1. Create `src/blocks/{name}/` with `types.ts`, `schema.ts`, `{Name}.tsx`, `index.ts`.
2. Add union member to `TenantBlock` in `src/platform/types.ts`.
3. Register in `src/blocks/registry.ts`.
4. Add case to `BlockForm` in `src/components/editor/BlockEditor.tsx`.
5. Add to `blockTemplates` and `variantLabels` in `BlockEditor.tsx`.
6. Add `_template` value to `VALID_BLOCK_TEMPLATES` in `src/lib/importValidator.ts`.

### Add a new style preset

1. Add entry to `stylePresets` in `src/platform/catalog.ts`.
2. Add `{ label, value }` to `styleId` selector in `src/components/editor/BlockEditor.tsx`.
3. Add to `VALID_STYLE_IDS` in `src/lib/importValidator.ts`.

### Add a new content adapter

1. Implement `ContentAdapter` interface in `src/platform/contentAdapter/adapters/{name}.ts`.
2. Register in `src/platform/contentAdapter/index.ts` factory under a new `CONTENT_BACKEND` value.

---

## Key invariants

- `content/` files are the source of truth. Never hand-edit `sites/`.
- All content reads/writes go through `ContentAdapter` — never use `fs` directly.
- `page.settings[]` must be exactly 3 items in fixed order.
- `site.settings[]` must be 8-9 items in fixed order (subscription through analytics).
- Block `css` field is always a JSON string, never raw CSS.
- `tenantId` and page `slug` must satisfy `TENANT_ID_RE` / `SLUG_RE`.
- `src/lib/imageScanner.ts` and `src/lib/importValidator.ts` must remain import-free of Node.js/Next.js.
- `SiteRenderer.tsx` is used for both public render and preview — changes affect both.
- `data/credentials.json` is git-tracked. Use hashed credentials only.
- The editor is fully native React — no wrapper/iframe CMS.
