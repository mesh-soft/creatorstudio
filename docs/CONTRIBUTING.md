# Doctor Sites — Contribution Guide

> How to work on this codebase, with AI-assisted development as a first-class workflow.

---

## Core principles

1. **Content is the source of truth.** `content/{type}/{tenantId}/` is what gets rendered and deployed. Never edit `sites/` (generated output).
2. **Types first.** Any new block or setting must have its TypeScript type in `src/platform/types.ts` before anything else is changed.
3. **Validation stays in sync.** The enum lists in `src/lib/importValidator.ts` must mirror `src/platform/catalog.ts` at all times.
4. **Pure utilities stay pure.** `src/lib/imageScanner.ts` and `src/lib/importValidator.ts` must not import Node.js or Next.js modules — they run in both browser and server contexts.
5. **Block `css` is always JSON-serialised.** Never store raw CSS strings in block data.
6. **All content I/O through the adapter.** Never use `fs` directly — always call `getContentAdapter()`.

---

## Dev environment

```bash
pnpm dev            # Next.js dev server on :3000
pnpm build          # production build
pnpm build:tenants  # build + generate tenant static output
```

No middleware or CMS server needed. Content is read directly from the filesystem in dev.

Required environment variables:

| Variable | Purpose |
|----------|---------|
| `CONTENT_BACKEND` | `"fs"` (default), `"github"`, `"s3"`, `"gcp"` |
| `JWT_SECRET` | Token signing secret |
| `PEXELS_API_KEY` | Stock photo search |
| `ANTHROPIC_API_KEY` | AI suggestion feature |

Additional vars per backend — see `docs/ARCHITECTURE.md`.

---

## Recipe: adding a new block type

Follow these steps in order — skipping any step will cause a runtime error or type error.

### 1. Define the TypeScript type

In `src/platform/types.ts`, add a union member to `TenantBlock`:

```typescript
| {
    _template: "myblock";
    enabled?: boolean;
    title?: string;
    items?: Array<{ label: string; value: string }>;
    variant?: string;
    backgroundImage?: string;
    css?: string;
  }
```

### 2. Create the block folder

```
src/blocks/myblock/
  types.ts      — export interface MyblockBlock { ... }
  schema.ts     — field schema (for import validation)
  Myblock.tsx   — React component, accepts MyblockBlock props
  index.ts      — re-export component as default + schema
```

### 3. Register in the block registry

`src/blocks/registry.ts`:

```typescript
import Myblock from "./myblock";

export const blockRegistry: Record<string, React.ComponentType<any>> = {
  // existing entries...
  myblock: Myblock,
};
```

### 4. Add to the editor

`src/components/editor/BlockEditor.tsx`:

Add to `blockTemplates`:
```typescript
myblock: { _template: "myblock", enabled: true, title: "", items: [], variant: "", backgroundImage: "", css: "" },
```

Add to `variantLabels`:
```typescript
myblock: "My Block",
```

Add a case in `BlockForm` for `tpl === "myblock"`.

### 5. Update the import validator

`src/lib/importValidator.ts`:

```typescript
export const VALID_BLOCK_TEMPLATES = [
  // existing...
  "myblock",
] as const;
```

### 6. Add to theme layouts (optional)

`src/platform/catalog.ts` — add `{ _template: "myblock", enabled: true }` to relevant `themeLayouts` arrays.

---

## Recipe: adding a new style preset

### 1. Add to catalog

`src/platform/catalog.ts`:

```typescript
export const stylePresets: Record<string, StylePreset> = {
  // existing...
  "doctor-my-theme": {
    colors: { primary: "#...", secondary: "#...", accent: "#...", background: "#...", surface: "#...", text: "#..." },
    shape:  { radius: "8px" },
    typography: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif" },
  },
};
```

### 2. Add editor selector option

`src/components/editor/BlockEditor.tsx` — add to `styleOptions` array:
```typescript
{ v: "doctor-my-theme", l: "My Theme (Doctor)" }
```

### 3. Update validator

`src/lib/importValidator.ts`:

```typescript
export const VALID_STYLE_IDS = [
  // existing...
  "doctor-my-theme",
] as const;
```

---

## Recipe: adding a new API route

API routes live in `src/app/api/{name}/route.ts`. All auth-protected routes follow this pattern:

```typescript
import { verifyToken } from "@/lib/token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const payload = token ? await verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ... handler logic
}
```

For multipart form data:

```typescript
const formData = await req.formData();
const siteJson = formData.get("site") as string;
const files = formData.getAll("image") as File[];
```

---

## Working with the content adapter

Never read/write `content/` files directly in application code. Always go through the adapter:

```typescript
import { getContentAdapter } from "@/platform/contentAdapter";

const adapter = await getContentAdapter();
const raw = await adapter.read("content/doctors/dr-smith/site/index.json");
const site = JSON.parse(raw);
await adapter.write("content/doctors/dr-smith/site/index.json", JSON.stringify(site, null, 2));
```

**Path convention:** Adapter paths include the full relative path from project root, including `content/` prefix.

Available on the server side (`content.ts`) and in API routes. The factory returns a singleton based on `CONTENT_BACKEND`.

---

## Recipe: adding a new content adapter

1. Implement `ContentAdapter` interface in `src/platform/contentAdapter/adapters/{name}.ts`.
2. Register in `src/platform/contentAdapter/index.ts` factory under a new `CONTENT_BACKEND` value.

```typescript
case 'mycloud': {
  const { MyCloudAdapter } = await import('./adapters/mycloud');
  _adapter = new MyCloudAdapter({
    apiKey: process.env.MYCLOUD_API_KEY!,
    bucket: process.env.MYCLOUD_BUCKET!,
  });
  break;
}
```

---

## Block `css` field pattern

The `css` field on every block stores CSS as a **JSON-serialised object**:

```typescript
// Correct — JSON string of a CSS properties object
block.css = JSON.stringify({ "background-color": "#f5f5f5", "padding-top": "80px" });

// Wrong — raw CSS string
block.css = "background-color: #f5f5f5; padding-top: 80px;";
```

`SiteRenderer` parses and applies this as `style` with `!important` on the block wrapper.

---

## Settings array pattern

Both `site/index.json` and page JSON use `settings[]` arrays of template objects. The order is fixed.

When writing code that reads a specific setting by template name, use a find:

```typescript
const profile = site.settings.find(s => s._template === "profile");
```

When updating settings, replace by index (not push). The fixed order must be preserved.

`src/platform/siteSettingsNormalize.ts` handles conversion between `settings[]` format and flat properties:
- `unwrapSiteSettingsToFlat(site)` — `settings[]` → flat (used by content.ts for reading)
- `wrapFlatSiteIntoSettings(site)` — flat → `settings[]` (used by create-tenant API)

---

## Live preview protocol

The preview iframe communicates with the editor via `postMessage`:

```typescript
// Editor → Preview (draft update)
{ type: "studio:draft-update", payload: TenantObject }

// Preview receives via window.addEventListener("message", ...)
```

The editor pushes drafts on every field change (180ms debounced) by serializing the current `page` and `site` React state. The preview's `LivePreviewClient` receives the message and deep-merges the payload into the current `Tenant` state.

---

## Nav link data format

Header `navLinks` and footer `links`/`socialLinks` support three formats:

**New format** (from FNavLinks editor):
```typescript
{ type: "section", label: "Services", sectionId: "services", icon: "stethoscope" }
{ type: "page", label: "About", pageSlug: "about", icon: "info" }
{ type: "external", label: "Facebook", url: "https://facebook.com", icon: "globe" }
```

**Legacy format** (from TinaCMS):
```typescript
{ _template: "sectionLink", label: "Services", sectionId: "services" }
{ _template: "pageLink", label: "About", pageSlug: "about" }
{ _template: "externalLink", label: "Facebook", url: "https://facebook.com" }
```

**String format** (pipe-delimited):
```
"Services|#services"
"About|/about"
"Facebook|https://facebook.com"
```

`resolveNavLink()` in `SiteRenderer.tsx` handles all three. `normalizeNavItems()` in `BlockEditor.tsx` normalizes to the new format for the editor.

When writing data, prefer the new `type`-based format. The renderer supports all formats for backward compatibility.

---

## Image handling rules

Images in block/site JSON can be:

- **External URL** — `https://images.pexels.com/...` — served from CDN, no upload needed.
- **Local path** — `/content/{type}/{tenantId}/filename.jpg` — must exist in `public/content/` before deploy.

The import API validates that every `/content/...` reference in the JSON is covered by either an uploaded file or an existing file on disk.

---

## Authentication rules

| Role | Can access |
|------|-----------|
| `tenant` | Own content only (`/api/content/*` for own `tenantId`) |
| `admin` | All content + `/api/tenants`, `/api/create-tenant`, `/api/import/*` |

Add credentials with `node scripts/set-credentials.mjs`. Token expires when manually revoked.

---

## Testing a change end-to-end

1. Edit content via the editor at `http://localhost:3000/creator`.
2. View rendered result at `http://localhost:3000/site/{tenantId}/home`.
3. Preview at `http://localhost:3000/site/{tenantId}/home/preview`.
4. For deploy testing: `node scripts/deploy-tenant.mjs {tenantId}`.

For API testing:

```bash
# Read tenant
curl "http://localhost:3000/api/content/read?tenantType=doctor&tenantId=dr-smith&pageSlug=home" \
  -H "Authorization: Bearer <token>"

# Save content
curl -X POST http://localhost:3000/api/content/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenantType":"doctor","tenantId":"dr-smith","pageSlug":"home","data":{...}}'
```

---

## Common mistakes to avoid

| Mistake | Rule |
|---------|------|
| Editing `sites/` directly | It's generated output. Edit `content/` instead. |
| Using `fs` directly in app code | Always use `getContentAdapter()`. |
| Adding Node imports to `src/lib/imageScanner.ts` or `importValidator.ts` | These run in the browser — keep them pure TS. |
| Storing raw CSS in block `css` field | Must be a JSON-stringified object. |
| Out-of-order `settings[]` | Page must have exactly 3; site exactly 8-9. Order is fixed. |
| Adding a block type without updating `importValidator.ts` | Import API will reject valid JSON. |
| Adding a style/theme without updating `importValidator.ts` | Validator and catalog must stay in sync. |
| Adding a block type without adding it to `BlockEditor.tsx` | Editor won't show it in the add-block menu or render its form. |
| Committing real secrets to `data/credentials.json` | File is git-tracked. Use hashed credentials only. |
| Using `CONTENT_ADAPTER` env var | It's `CONTENT_BACKEND`. |
| Including `content/` prefix twice in adapter paths | Adapter paths include the prefix. Example: `content/doctors/dr-smith/site/index.json`, NOT `doctors/dr-smith/site/index.json`. |
