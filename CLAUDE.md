# Doctor Sites — Codebase Guide

## What this is

A **multi-tenant static website builder** for doctors and hospitals. Each tenant gets a
visual editor (TinaCMS + custom split-pane studio) that writes JSON config files. Those
JSON files are rendered by Next.js into static HTML and deployed to Surge.sh.

---

## Repository layout

```
/
├── content/
│   ├── doctors/{tenantId}/site/index.json      Tenant metadata + global settings
│   └── doctors/{tenantId}/pages/{slug}.json    Page blocks + page settings
├── public/content/{type}/{tenantId}/           Media uploads
├── sites/{type}/{tenantId}/                    Pre-rendered static output (deployed)
├── src/
│   ├── app/                                    Next.js App Router routes
│   │   ├── creator/[tenantType]/[tenantId]/    Split-pane editor entry
│   │   ├── site/[tenantId]/[pageSlug]/         Public site + preview route
│   │   └── api/content/snapshot/route.ts       Snapshot versioning API
│   ├── platform/                               Core rendering + types
│   │   ├── SiteRenderer.tsx                    Block → React component mapper
│   │   ├── types.ts                            TypeScript: Tenant, TenantBlock, TenantPage
│   │   ├── catalog.ts                          Theme presets + themeBlocks defaults
│   │   ├── content.ts                          Filesystem reader (SSR only)
│   │   └── siteSettingsNormalize.ts            Flat ↔ nested settings transform
│   └── components/
│       ├── TenantImageField.tsx                Custom Tina image uploader
│       └── SuggestionPopup.tsx                 AI catchphrase suggestions (Ctrl+Space)
├── tina/config.ts                              TinaCMS collection + field schemas
└── scripts/
    ├── deploy-tenant.mjs                       Build → assemble → Surge deploy
    └── build-tenants.mjs                       Batch build helper
```

---

## Data flow

```
content/{type}/{tenantId}/site/index.json
content/{type}/{tenantId}/pages/{slug}.json
        │
        ▼ TinaCMS reads via local filesystem (TINA_PUBLIC_IS_LOCAL=true)
        │
        ▼ CreatorStudioClient (split-pane editor)
          Left iframe  → /admin/index.html  (TinaCMS form UI)
          Right iframe → /site/{tenantId}/{slug}/preview?studio=1
          Parent window orchestrates both via postMessage
        │
        ▼ On save: snapshot API archives old JSON, TinaCMS writes new JSON
        │
        ▼ deploy-tenant.mjs
          1. next build  (or reuse existing .next/)
          2. Copy .next/server/app/site/{tenantId}/*.html  → sites/{type}/{id}/
          3. Copy .next/static/ → sites/{type}/{id}/_next/static/
          4. Fix relative paths in HTML
          5. Copy public/content/{type}/{id}/ media
          6. surge "sites/doctors/{id}" "{id}.surge.sh"
```

---

## Key files

| File | Role |
|------|------|
| `src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx` | Split-pane editor hub. Parses Tina hash, collects form drafts, broadcasts postMessage to preview iframe, AI suggestion trigger |
| `src/platform/SiteRenderer.tsx` | Converts `Tenant` object → React component tree. Injects CSS custom props, resolves header/footer fallbacks |
| `src/platform/types.ts` | Single source of truth for `Tenant`, `TenantSite`, `TenantPage`, `TenantBlock`, `VariantPreset`, `StylePreset` |
| `tina/config.ts` | Full TinaCMS schema: `doctorSite` and `hospitalSite` collections, all field definitions, nav-link templates, icon options |
| `src/platform/catalog.ts` | `stylePresets` map (10 colour/typography themes), `variantPresets`, `getThemeBlocks()` default block list per `themeId` |
| `src/platform/content.ts` | SSR: reads JSON files from disk, merges site + page into `Tenant` |
| `src/platform/siteSettingsNormalize.ts` | `toSiteSettingsPathFromFlat()` — maps flat dot-path (e.g. `profile.displayName`) to nested Tina document path through the `settings[]` array |
| `scripts/deploy-tenant.mjs` | Single-tenant deploy. Args: `<tenantId> [--build]` |

---

## JSON data structures

### `content/{type}/{tenantId}/site/index.json`

Flat structure as written by Tina, but conceptually grouped as `settings[]` templates:

```json
{
  "tenantId": "nitesh-garwa",
  "tenantType": "doctor",
  "status": "active",
  "settings": [
    { "_template": "subscription", "plan": "...", "billingCycle": "monthly", ... },
    { "_template": "domains", "primary": "nitesh-garwa.surge.sh" },
    { "_template": "profile", "displayName": "Dr. Nitesh Garwa", "specialty": "...", "photo": "..." },
    { "_template": "business", "clinicName": "...", "phone": "...", "email": "...", "address": "...", "mapUrl": "..." },
    { "_template": "presentation", "themeId": "doctor-standard", "variantPresetId": "doctor-classic", "styleId": "doctor-teal-clean", "style": { "colors": {...}, "shape": {...}, "typography": {...} } },
    { "_template": "header", "show": true, "navLinks": [ { "_template": "sectionLink", "label": "Services", "sectionId": "services" } ] },
    { "_template": "footer", "show": true, "copyright": "...", "socialLinks": [] },
    { "_template": "seo", "title": "...", "description": "...", "keywords": [] }
  ]
}
```

### `content/{type}/{tenantId}/pages/{slug}.json`

```json
{
  "blocks": [
    { "_template": "hero", "enabled": true, "headline": "...", "subheadline": "...", "buttons": [...], "css": "{\"background-color\":\"#f5f5f5\"}" },
    { "_template": "services", "enabled": true, "kicker": "...", "title": "...", "items": [...], "css": "" },
    ...
  ],
  "settings": [
    { "_template": "urlSettings", "slug": "home", "title": "Home", "path": "/", "isHome": true },
    { "_template": "presentation", "themeId": "...", "variantPresetId": "...", "styleId": "..." },
    { "_template": "seo", "title": "...", "description": "...", "keywords": [] }
  ]
}
```

---

## Block system

All blocks live in `page.blocks[]`. Every block has:
- `_template` — identifies the block type
- `enabled` — if `false`, block is hidden in the rendered site
- `css` — JSON string of CSS properties applied as inline style with `!important`

### Available block templates

| `_template` | Key fields |
|-------------|-----------|
| `header` | `logo`, `navLinks` (overrides global header) |
| `footer` | `copyright`, `socialLinks` (overrides global footer) |
| `hero` | `headline`, `subheadline`, `buttons[]` |
| `profile` | `kicker`, `title`, `body`, `experienceYears`, `registrationNumber` (all overrides) |
| `services` | `kicker`, `title`, `items[]{title, description, icon}` |
| `timings` | `kicker`, `title`, `items[]{day, primary, secondary}` |
| `gallery` | `kicker`, `title`, `items[]{src, alt}` |
| `faq` | `kicker`, `title`, `items[]{question, answer}` |
| `testimonials` | `kicker`, `title`, `items[]{quote, author}` |
| `stats` | `items[]{value, label}` |
| `awards` | `kicker`, `title`, `items[]{title, year, organization, icon}` |
| `cta` | `title`, `body`, `buttons[]` |
| `text` | `heading`, `body` |

Buttons use: `{ label, url, icon, variant: "primary" | "secondary" }`.

---

## Presentation / theming system

Three layered concepts — all stored in the `presentation` settings block:

| Field | What it controls | Options |
|-------|-----------------|---------|
| `themeId` | Block order & which blocks are included by default | `doctor-standard`, `doctor-profile-heavy`, `doctor-service-heavy`, `hospital-*` |
| `variantPresetId` | CSS variant classes per block (e.g. hero layout style) | `doctor-classic`, `doctor-editorial`, `doctor-premium`, `hospital-*` |
| `styleId` | Full colour palette + typography + border radius | 10 presets (teal-clean, premium-warm, bright-child, etc.) |

`styleId` maps to `catalog.ts#stylePresets`. Individual color/font overrides via `presentation.style.*` override the preset.

CSS custom properties set by `SiteRenderer`:
`--primary`, `--secondary`, `--accent`, `--site-bg`, `--surface`, `--site-text`, `--radius`, `--heading`, `--body`

---

## TinaCMS customisations

### Custom field: `ui: { component: "css" }`

Registered in `packages/tinacms/…/css-field-plugin.tsx`.  
Used on every block's `css` field. Opens a modal with:
- Searchable list of 300+ CSS properties
- Value suggestions for common props
- Color picker for color/background props
- Toggle between Structured UI and Raw JSON
- Dispatches `set-active-css` CMS event for live preview

### Custom image upload routing

`tina/config.ts#tenantImageField()` — determines upload path from Tina breadcrumbs or URL hash, routing to `public/content/{type}/{tenantId}/`.

### Nav-link polymorphism

Three templates on any nav/social links field:
- `sectionLink` — scrolls to a section ID on the page
- `pageLink` — internal page by slug
- `externalLink` — full external URL

### Admin iframe integration

The TinaCMS admin iframe reports hash changes to the parent window so `CreatorStudioClient` can track which tenant/page is being edited.

---

## CreatorStudioClient mechanics

`src/app/creator/[tenantType]/[tenantId]/CreatorStudioClient.tsx`

- **Hash monitoring**: polls TinaCMS iframe `location.hash` to detect current collection/document → updates preview URL
- **Draft sync**: collects all TinaCMS form field values via DOM inspection (`data-tina-field` attributes), sends as `postMessage` to preview iframe
- **Inline editing**: clicks on preview with `data-tina-field` route focus back to editor field
- **Viewport toggle**: mobile / tablet / desktop preview widths
- **Suggestion engine**: Ctrl+Space opens `SuggestionPopup`, generates AI catchphrases for headline/subheadline/services based on specialty

---

## `siteSettingsNormalize.ts`

The `settings[]` array pattern means a flat path like `profile.displayName` must be
translated to `settings[2].displayName` (where index 2 is the `profile` template).
`toSiteSettingsPathFromFlat(flatPath, doc)` performs this translation for `tinaField()`
annotations in `SiteRenderer`.

---

## Dev workflow

```bash
# From repo root
pnpm dev             # starts Next.js dev server

# Deploy a tenant
node scripts/deploy-tenant.mjs nitesh-garwa           # reuse .next
node scripts/deploy-tenant.mjs nitesh-garwa --build   # full rebuild
```

---

## Adding a new block type

1. Add TypeScript union member to `TenantBlock` in `src/platform/types.ts`
2. Add a template entry in `tina/config.ts` inside `pageFields[0].templates`
3. Add a render case in `SiteRenderer.tsx` mapping `_template` to a React component
4. Optionally add the block to default theme block lists in `catalog.ts#getThemeBlocks()`

## Adding a new style preset

1. Add an entry to `stylePresets` in `catalog.ts`
2. Add the `{ label, value }` option to both `siteFields` and `pageFields` `styleId` selectors in `tina/config.ts`

---

## Important notes

- `AGENTS.md` warns: this is Next.js 16 with breaking changes from prior versions. Check `node_modules/next/dist/docs/` before writing App Router code.
- The `sites/{type}/{tenantId}/` directory is **generated output** — do not hand-edit it.
- `content/` files are the source of truth — TinaCMS writes here, `content.ts` reads here.
- CSS in blocks is stored as a JSON string (`'{"background-color":"red"}'`), not raw CSS. `SiteRenderer` parses and applies it as inline style with `!important`.
- Page `settings[]` is locked at exactly 3 items (urlSettings, presentation, seo). Site `settings[]` is locked at exactly 8.
