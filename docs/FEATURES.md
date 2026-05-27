# Doctor Sites — Current Features

> Living inventory of what the platform can do today. Keep this updated when features ship or change.
> Last updated: 2026-05-27.

---

## Multi-tenant site management

- Each tenant is fully isolated: own content folder, own credentials, own deploy target.
- Two tenant types: **doctor** and **hospital** (separate field schemas and theme options).
- Tenant status: `active` or `inactive` (inactive tenants can still be edited but won't be shown publicly).
- Tenant list visible to admin at `/creator`.

**Tenant creation paths:**
1. Form UI at `/creator/create-tenant` → `POST /api/create-tenant`
2. AI-driven import at `/creator/import` → `POST /api/import/tenant`

---

## Visual editor (CreatorStudio)

Route: `/creator/[tenantType]/[tenantId]`

- **Split-pane layout**: TinaCMS form (left) + live preview iframe (right).
- **Instant preview sync**: draft values sent via `postMessage` to preview without saving.
- **Hash-based navigation**: editor tracks which page/document is open in TinaCMS via `location.hash` polling, updates preview URL automatically.
- **Inline edit click-through**: clicking an element in preview focuses the matching TinaCMS field.
- **Viewport toggle**: preview at mobile (375px), tablet (768px), or desktop (100%) width.
- **Snapshot on save**: old JSON archived before every write to `content/.../pages-backup/`.

---

## AI suggestion engine

Trigger: `Ctrl+Space` inside the editor.

- Opens `SuggestionPopup.tsx` overlay.
- Generates AI catchphrases for: headline, subheadline, services section.
- Context: doctor/hospital specialty, display name, clinic name.
- Uses Anthropic API (`ANTHROPIC_API_KEY`).

---

## Block system

15 available block types, each with its own React component, TinaCMS schema, and TypeScript type.

| Block | Key configurable content |
|-------|--------------------------|
| `hero` | Headline, subheadline, doctor photo, CTA buttons, background image |
| `profile` | Bio, experience years, registration number, credentials |
| `services` | Service cards with title, description, icon |
| `timings` | Clinic hours by day (primary + secondary timing per row) |
| `gallery` | Photo grid (src + alt per item) |
| `faq` | Accordion Q&A pairs |
| `testimonials` | Patient quotes with author attribution |
| `stats` | Value + label pairs (numbers, achievements) |
| `awards` | Award title, year, organization, icon |
| `cta` | Title, body, CTA buttons |
| `text` | Free-form heading + markdown body |
| `header` | Logo, nav links (page-level override of site header) |
| `footer` | Copyright, social links, business info (page-level override) |
| `whatsapp` | Floating chat button with phone + pre-filled message |
| `location` | Embedded Google Maps iframe via mapUrl |

Every block supports:
- `enabled` toggle (hide without deleting)
- `variant` (CSS layout variant from the active `variantPresetId`)
- `backgroundImage` (optional background URL)
- `css` field (custom per-block CSS via structured editor)

---

## Theming system

Three composable layers:

### Theme (block defaults)
Controls which blocks appear by default and their order.

| `themeId` | Focus |
|-----------|-------|
| `doctor-standard` | Balanced: hero, profile, services, timings, gallery, faq, cta |
| `doctor-profile-heavy` | Profile and credentials up front |
| `doctor-service-heavy` | Services-first layout |
| `hospital-standard` | General hospital layout |
| `hospital-emergency-first` | Emergency services up front |

### Variant preset (layout variants per block)
Controls CSS class variants for each block component.

| `variantPresetId` | Style personality |
|-------------------|-----------------|
| `doctor-classic` | Traditional clean |
| `doctor-editorial` | Magazine-style |
| `doctor-compact` | Dense, info-heavy |
| `doctor-premium` | Luxury feel |
| `doctor-specialist` | Technical/specialist |
| `hospital-standard` | Corporate clean |
| `hospital-emergency` | Bold, high-contrast |
| `hospital-specialty` | Department-focused |
| `hospital-community` | Warm, community |
| `hospital-network` | Multi-branch |

### Style preset (colors + typography)
Controls CSS custom properties: `--primary`, `--secondary`, `--accent`, `--site-bg`, `--surface`, `--site-text`, `--radius`, `--heading`, `--body`.

| `styleId` | Palette |
|-----------|---------|
| `doctor-teal-clean` | Teal primary, clean white |
| `doctor-premium-warm` | Deep navy + warm gold |
| `doctor-bright-child` | Bright blue, friendly |
| `doctor-derma-minimal` | Blush pink, minimal |
| `doctor-slate-precision` | Slate, precision grey |
| `hospital-blue-modern` | Professional blue |
| `hospital-green-trust` | Trustworthy green |
| `hospital-red-emergency` | Emergency red |
| `hospital-indigo-specialty` | Specialist indigo |
| `hospital-community-soft` | Soft warm tones |

Individual color/font overrides are possible via `presentation.style.*` (stored in site.json settings).

---

## CSS customisation per block

- Every block has a `css` field editable via a custom TinaCMS field plugin.
- Plugin presents a searchable list of 300+ CSS property names.
- Value suggestions for common properties (padding, margin, font-size, etc.).
- Integrated color picker for color/background properties.
- Toggle between structured UI and raw JSON editing.
- Values stored as a JSON string: `'{"padding-top":"40px","background-color":"#fff"}'`.
- Applied as `!important` inline style in `SiteRenderer`.

---

## Custom image uploads

- Upload via TinaCMS image field or media API (`POST /api/content/media`).
- Files routed to `public/content/{type}/{tenantId}/`.
- Served from `/content/{type}/{tenantId}/{filename}` in both dev and deployed sites.
- Pexels stock photo search available via `GET /api/pexels?query=...`.

---

## AI-driven import system

Route: `/creator/import`

### Import new tenant (tab 1)

- Paste `site.json` and `home.json` (or multi-page JSON array) into textareas.
- Real-time validation with field-level error highlighting.
- Image upload zone: drag-drop or browse, shows coverage audit (which `/content/...` refs are covered).
- Submit → `POST /api/import/tenant` → redirects to editor on success.

### Add page to tenant (tab 2)

- Select existing tenant from button list.
- Paste `page.json` into textarea.
- Overwrite toggle for existing page slug.
- Image upload zone (shows existing media on disk for selected tenant).
- Submit → `POST /api/import/page` → redirects to editor on success.

### Validation rules enforced at import time

- `tenantId` and `slug` must be kebab-case, max 50 chars.
- `tenantType` must be `"doctor"` or `"hospital"`.
- Block `_template` must be one of the 15 valid values.
- `themeId`, `styleId`, `variantPresetId` must be known enum values.
- `site.settings[]` must contain `profile` and `presentation` templates.
- Block sub-fields validated: gallery items need `src`, timings items need `day`, buttons need `label`.
- All `/content/...` image paths must be covered by uploads or existing disk files.

---

## Nav link types

Available on header navLinks and footer socialLinks fields:

| Type | Purpose |
|------|---------|
| `sectionLink` | Smooth scroll to a section ID on the page |
| `pageLink` | Internal navigation to another page by slug |
| `externalLink` | Full external URL (opens in browser) |

---

## Multi-page support

Each tenant can have multiple pages (e.g. `home`, `services`, `about`).

- Pages listed as separate JSON files in `content/{type}/{tenantId}/pages/`.
- Each page has its own blocks and settings.
- Page `settings[0]` (`urlSettings`) controls `slug`, `path`, `title`, `isHome`.
- The `isHome: true` page is served at the tenant root.
- Nav links reference pages by slug via `pageLink` template.

---

## Pluggable storage adapters

Content can be stored in:

| Adapter | `CONTENT_ADAPTER` value |
|---------|------------------------|
| Local filesystem | `"fs"` (default) |
| AWS S3 | `"s3"` |
| GitHub repository | `"github"` |
| Google Cloud Storage | `"gcp"` |

All adapters implement the same `ContentAdapter` interface: `read`, `write`, `delete`, `list`, `exists`.

---

## Authentication

- Username/password login at `/login` → JWT token stored in localStorage.
- Two roles: `tenant` (own content only) and `admin` (full access).
- Token verified server-side on every API request via `Authorization: Bearer <token>`.
- Admin token required for: tenant list, create, import endpoints.
- Credentials managed via `scripts/set-credentials.mjs` (writes PBKDF2 hashes to `data/credentials.json`).

---

## Deployment

### Single tenant

```bash
node scripts/deploy-tenant.mjs <tenantId>           # reuse existing .next build
node scripts/deploy-tenant.mjs <tenantId> --build   # full rebuild
```

### Batch

```bash
npm run deploy:surge       # all tenants to Surge.sh
npm run deploy:cloudflare  # all tenants to Cloudflare Pages
```

Deployed output lives in `sites/{type}/{tenantId}/`. Each tenant deploys to `{tenantId}.surge.sh` by default, or custom domain configured in `settings[1]` (domains).

---

## Version history / snapshots

- Before every save, the old JSON is archived to `content/{type}/{tenantId}/pages-backup/`.
- Snapshot filenames include a timestamp.
- No automatic pruning — manual cleanup required for old tenants.
- Triggered via `POST /api/content/snapshot`.

---

## Data migration scripts

Historical migration scripts in `scripts/` (for reference if schema upgrades are needed):

| Script | Purpose |
|--------|---------|
| `migrate-content-to-folders.mjs` | Move flat content to nested folder layout |
| `migrate-nested-pages.mjs` | Transform page JSON structure |
| `migrate-to-flat-structure.mjs` | Reverse — flatten nested pages |
| `split-nested-pages.mjs` | Split monolithic page JSON into per-slug files |
| `migrate-page-schema.mjs` | Upgrade block schema to current format |
| `migrate-settings-to-list.mjs` | Convert flat site settings to `settings[]` array |
| `copy-site-fields-to-home-pages.mjs` | Backfill home page settings from site.json |
| `flatten-settings.js` | Flatten nested settings arrays |

---

## Known constraints

- **Next.js 16** is in use — it has breaking changes from prior versions. Check `node_modules/next/dist/docs/` before writing App Router code.
- **TinaCMS runs local-only** (`TINA_PUBLIC_IS_LOCAL=true`). No cloud sync or content branch workflow.
- **Static output** — no server-side personalisation after deploy. All dynamic content is baked at build time.
- **No short-lived JWT expiry** — tokens are valid until the credential entry is removed.
- **`data/credentials.json` is git-tracked** — do not commit plaintext secrets; always use the set-credentials script to store PBKDF2 hashes.
