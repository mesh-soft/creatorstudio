# Doctor Sites — Current Features

> Living inventory of what the platform can do today. Keep this updated when features ship or change.
> Last updated: 2026-05-27.

---

## Multi-tenant site management

- Each tenant is fully isolated: own content folder, own credentials, own deploy target.
- Two tenant types: **doctor** and **hospital** (separate field schemas and theme options).
- Tenant status: `active` or `inactive` (inactive tenants can still be edited but won't be shown publicly).
- Tenant list visible at `/creator` (server-rendered, async content query).

**Tenant creation paths:**
1. Form UI at `/creator/create-tenant` → `POST /api/create-tenant`
2. AI-driven import at `/creator/import` → `POST /api/import/tenant`

---

## Visual Block Editor (CreatorStudio)

Route: `/creator/[tenantType]/[tenantId]`

Fully native React editor — no iframe CMS or middleware involved.

### Editor layout

- **Split-pane**: form panel (420px) + live preview iframe (responsive)
- **Block cards**: collapsible, drag-to-reorder via HTML5 drag-and-drop
- **Two tabs per block**: Content (block-specific fields) + Presentation (background image, layout variant, CSS overrides)
- **Block types**: 15 available (hero, profile, services, timings, gallery, faq, cta, testimonials, stats, text, header, footer, awards, whatsapp, location)
- **Add block menu**: grid dropdown of all available block templates

### Live preview

- Every field change triggers a 180ms debounced `postMessage` to the preview iframe
- Preview updates instantly without save — draft built from React state
- Viewport toggle: mobile (375px) / tablet (768px) / desktop
- Preview URL: `/site/{tenantId}/{slug}/preview?studio=1`

### Rich editing features

- **Rich text editor**: contentEditable with toolbar (Bold, Italic, Underline, Heading, Link)
- **Image picker**: thumbnail preview + sample image grid + URL input
- **Color pickers**: native color input + hex text field
- **Icon picker**: emoji grid popup (fixed positioning for stacking-context safety)
- **Nav links editor**: multi-item with label, type selector (Section Anchor / Page Link / External URL), icon picker, drag-to-reorder
- **Footer sections**: Links (page navigation) and Connect (social media), each with customizable heading text
- **Button editor**: label, URL, icon, variant per CTA/hero button
- **Item editors**: collapsible items with drag-to-reorder for services, timings, gallery, faq, testimonials, stats, awards

### Site settings

Right-side drawer with tabbed sections:
- **Profile**: displayName, specialty, degrees, registration, experience, photo, bio
- **Business**: clinic name, phone, WhatsApp, email, address, map URL
- **Presentation**: theme layout, variant preset, style preset, color overrides (6 colors), shape (radius), typography (heading/body fonts)
- **Header**: toggle, logo, nav links
- **Footer**: toggle, copyright, links (with heading), social links (with heading)
- **SEO**: title, description, keywords, OG image
- **Analytics**: GA Measurement ID, GTM Container ID, Meta Pixel ID

### Dark/light theme

- Editor has its own dark/light theme toggle (persisted in localStorage as `editor-theme`)
- Dark theme: slate-blue palette (#0d1117 shell, #161b22 bg, #e6edf3 text)
- Light theme: Heroku-dashboard-style (#F5F6F7 shell, #FFFFFF bg, #1F2531 text)
- Primary accent: #79589f (deep purple) across both themes

### Save & history

- **Save Page** / **Save Site** buttons POST to `/api/content/save`
- Save success shows purple accent color on button
- **Version history**: right-side panel reads from `/api/content/snapshot`
- Snapshots archived on every save to `content/{type}/{tenantId}/pages-backup/`
- Restore any snapshot with confirmation dialog

---

## AI suggestion engine

Trigger: `Ctrl+Space` inside any rich text or text field.

- Opens `SuggestionPopup.tsx` overlay adjacent to the focused field
- Generates AI catchphrases for: headline, subheadline, services, bios, CTAs
- Context: doctor/hospital specialty, display name, experience years, clinic name
- Returns up to 12 suggestions per field type
- Click a suggestion to insert it into the field
- Uses Anthropic API (`ANTHROPIC_API_KEY`)
- Local fallback suggestions from `data/catchphrases.json`

---

## Block system

15 available block types, each with its own React component, block form in the editor, and TypeScript type.

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
| `awards` | Award title, year, organization |
| `cta` | Title, body, CTA buttons |
| `text` | Free-form heading + rich text body |
| `header` | Logo, nav links (with icon support) |
| `footer` | Copyright, links section (with heading), social links section (with heading) |
| `whatsapp` | Floating chat button with phone + pre-filled message |
| `location` | Embedded map via mapUrl + height |

Every block supports:
- `enabled` toggle (hide without deleting)
- `variant` (CSS layout variant from the active `variantPresetId`)
- `backgroundImage` (optional background image URL)
- `css` field (custom per-block CSS as JSON string)

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

## Nav link system

Header `navLinks` and footer `links`/`socialLinks` support three link types with full editor support:

| Type | Target | Editor form |
|------|--------|-------------|
| **Section Anchor** | Scroll to a section on the page | Dropdown of all available block sections |
| **Page Link** | Internal navigation to another page by slug | Dropdown of all tenant page slugs |
| **External URL** | Full external URL | Free-text URL input |

Each link has:
- **Label** — display text
- **Icon** — emoji icon from 50+ medical/contact icons (via emoji grid picker)
- **Type** — section/page/URL selector

The renderer (`resolveNavLink()`) handles all three data formats (new `type`-based, legacy `_template`-based, and pipe-delimited strings) plus renders emoji icons alongside link text.

---

## CSS customisation per block

- Every block has a `css` field in the Presentation tab.
- Stored as a JSON string: `'{"padding-top":"40px","background-color":"#fff"}'`.
- Applied as `!important` inline style in `SiteRenderer`.

---

## Media management

- Upload via `POST /api/content/media` (multipart).
- Files routed to `public/content/{type}/{tenantId}/`.
- Served from `/content/{type}/{tenantId}/{filename}`.
- Pexels stock photo search via `GET /api/pexels?query=...`.
- Image picker in editor shows thumbnail preview + 6 sample images.

---

## AI-driven import system

Route: `/creator/import`

### Import new tenant

- Paste `site.json` and `home.json` into textareas.
- Real-time validation with field-level error highlighting.
- Image upload zone: drag-drop or browse.
- Submit → `POST /api/import/tenant` → redirects to editor.

### Add page to tenant

- Select existing tenant.
- Paste `page.json` into textarea.
- Overwrite toggle for existing page slug.
- Submit → `POST /api/import/page` → redirects to editor.

### Validation rules at import

- `tenantId` and `slug`: kebab-case, max 50 chars.
- `tenantType`: `"doctor"` or `"hospital"`.
- Block `_template`: one of 15 valid values.
- `themeId`, `styleId`, `variantPresetId`: known enum values.
- `site.settings[]`: must contain `profile` and `presentation`.
- Block sub-fields validated per type.
- All `/content/...` image paths must be covered by uploads or existing files.

---

## Multi-page support

Each tenant can have multiple pages (e.g. `home`, `services`, `about`).

- Pages listed as separate JSON files in `content/{type}/{tenantId}/pages/`.
- Each page has its own blocks and settings.
- Page `settings[0]` (`urlSettings`) controls `slug`, `path`, `title`, `isHome`.
- Navigation between pages via header nav links (`pageLink` type).

---

## Analytics integration

Site-level Analytics section with configurable fields:
- **GA Measurement ID** — Google Analytics 4 (`G-XXXXXXXXXX`)
- **GTM Container ID** — Google Tag Manager (`GTM-XXXXXXX`)
- **Meta Pixel ID** — Facebook/Instagram ad tracking

These are rendered in `SiteRenderer.tsx` via `<script>` tags when present.

---

## Pluggable storage backends

Content can be stored in:

| Adapter | `CONTENT_BACKEND` value | Write behavior |
|---------|------------------------|---------------|
| Local filesystem | `"fs"` (default) | Direct `fs.writeFile` |
| GitHub repository | `"github"` | Commits JSON changes via `@octokit/rest` |
| AWS S3 | `"s3"` | Object store via `@aws-sdk/client-s3` |
| Google Cloud Storage | `"gcp"` | JSON API via `fetch` + JWT auth |

All adapters implement the same `ContentAdapter` interface. The factory selects the adapter based on `CONTENT_BACKEND` env var. All content reads and writes use the adapter — no direct filesystem access in application code.

---

## Authentication

- Username/password login at `/login` → JWT token stored in localStorage.
- Two roles: `tenant` (own content only) and `admin` (full access).
- Token verified server-side on every API request via `Authorization: Bearer <token>`.
- Credentials managed via `scripts/set-credentials.mjs` (PBKDF2 hashes → `data/credentials.json`).

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

Deployed output in `sites/{type}/{tenantId}/`. Custom domain via `settings[1]` (domains).

---

## Version history / snapshots

- Before every save, old JSON archived to `content/{type}/{tenantId}/pages-backup/`.
- Snapshot filenames include timestamp.
- Restore via version history panel in editor (view, restore with confirmation).
- Triggered via `POST /api/content/snapshot`.

---

## Known constraints

- **Next.js 16** — breaking changes from prior versions. Check `node_modules/next/dist/docs/`.
- **Static output** — no server-side personalisation after deploy. All dynamic content baked at build time.
- **No short-lived JWT expiry** — tokens valid until credential entry removed.
- **`data/credentials.json` is git-tracked** — use set-credentials script for PBKDF2 hashes only.
