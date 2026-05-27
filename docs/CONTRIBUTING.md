# Doctor Sites — Contribution Guide

> How to work on this codebase, with AI-assisted development as a first-class workflow.

---

## Core principles

1. **Content is the source of truth.** `content/{type}/{tenantId}/` is what gets rendered and deployed. Never edit `sites/` (generated output).
2. **Types first.** Any new block or setting must have its TypeScript type in `src/platform/types.ts` before anything else is changed.
3. **Validation stays in sync.** The enum lists in `src/lib/importValidator.ts` must mirror `src/platform/catalog.ts` at all times.
4. **Pure utilities stay pure.** `src/lib/imageScanner.ts` and `src/lib/importValidator.ts` must not import Node.js or Next.js modules — they run in both browser and server contexts.
5. **Block `css` is always JSON-serialised.** Never store raw CSS strings in block data.

---

## Dev environment

```bash
pnpm dev            # Next.js dev server on :3000
pnpm build          # production build
```

TinaCMS runs in local mode (`TINA_PUBLIC_IS_LOCAL=true`). No cloud CMS needed.

Required environment variables:

| Variable | Purpose |
|----------|---------|
| `CONTENT_ADAPTER` | `"fs"` (default), `"s3"`, `"github"`, `"gcp"` |
| `JWT_SECRET` | Token signing secret |
| `PEXELS_API_KEY` | Stock photo search |
| `ANTHROPIC_API_KEY` | AI suggestion feature |

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

Also export a named type from the per-block file and re-export from `types.ts`:

```typescript
export type { MyblockBlock } from "../blocks/myblock/types";
```

### 2. Create the block folder

```
src/blocks/myblock/
  types.ts      — export interface MyblockBlock { ... }
  schema.ts     — TinaCMS field schema (array of Tina field objects)
  Myblock.tsx   — React component, accepts MyblockBlock props
  index.ts      — re-export component as default + schema
```

Component signature:

```typescript
import type { MyblockBlock } from "./types";

export default function Myblock(props: MyblockBlock & { variant?: string }) { ... }
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

### 4. Add TinaCMS schema

`tina/config.ts` — inside `pageFields[0].templates`, add the schema from `schema.ts`.
Pattern used by every existing block:

```typescript
{
  name: "myblock",
  label: "My Block",
  fields: [...myblockSchema],
}
```

### 5. Update the import validator

`src/lib/importValidator.ts`:

```typescript
export const VALID_BLOCK_TEMPLATES = [
  // existing...
  "myblock",
] as const;
```

### 6. Add to theme layouts (optional)

`src/platform/catalog.ts` — add `{ _template: "myblock", enabled: true }` to the relevant
`themeLayouts` arrays if the block should appear by default.

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

### 2. Add Tina selector option

`tina/config.ts` — in both `siteFields` and `pageFields`, add to the `styleId` select options:

```typescript
{ label: "My Theme (Doctor)", value: "doctor-my-theme" }
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

## Recipe: AI-driven site creation workflow

The import system (`/api/import/tenant`) enables a full AI → JSON → site pipeline:

1. Provide `docs/ai-context.md` to an AI assistant to generate `site.json` + `home.json`.
2. Optionally use `/api/pexels?query=...` to find stock photos (returns Pexels photo objects).
3. POST to `/api/import/tenant` with the JSON + any image files.
4. On success, tenant is live in the editor at `/creator/doctor/{tenantId}`.
5. Deploy with `node scripts/deploy-tenant.mjs {tenantId} --build`.

**Validation errors** come back as:

```json
{ "error": "Validation failed", "details": [{ "path": "blocks[0].items[1].src", "message": "..." }] }
```

Fix the JSON and re-submit.

---

## Working with the content adapter

Never read/write `content/` files directly in application code. Always go through the adapter:

```typescript
import { getContentAdapter } from "@/platform/contentAdapter";

const adapter = getContentAdapter();
const raw = await adapter.read("doctors/dr-smith/site/index.json");
const site = JSON.parse(raw);
await adapter.write("doctors/dr-smith/site/index.json", JSON.stringify(site, null, 2));
```

File paths passed to the adapter are **relative** to the `content/` root — do not include `content/` prefix.

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

`src/platform/siteSettingsNormalize.ts#toSiteSettingsPathFromFlat()` handles the
flat-path ↔ array-index translation needed for TinaCMS `tinaField()` annotations.

---

## Image handling rules

Images in block/site JSON can be:

- **External URL** — `https://images.pexels.com/...` — served from CDN, no upload needed.
- **Local path** — `/content/{type}/{tenantId}/filename.jpg` — must exist in `public/content/` before deploy.

The import API (`/api/import/tenant`) validates that every `/content/...` reference in the
JSON is covered by either:
- An uploaded file in the multipart request, OR
- An existing file already on disk at `public/content/{type}/{tenantId}/`

Use `src/lib/imageScanner.ts#auditImages()` to check coverage before submitting.
Keys scanned: `photo`, `src`, `backgroundImage`, `logo`, `ogImage`, `image`.

---

## Authentication rules

| Role | Can access |
|------|-----------|
| `tenant` | Own content only (`/api/content/*` for own `tenantId`) |
| `admin` | All content + `/api/tenants`, `/api/create-tenant`, `/api/import/*` |

Add credentials with `node scripts/set-credentials.mjs`. Token expires when manually revoked
(there is no short-lived expiry — revoke by removing the credential entry).

---

## Snapshot / version history

Before every `content/save` write, the API calls `content/snapshot` to archive the old JSON.
Snapshots live in `content/{type}/{tenantId}/pages-backup/`. Do not delete these manually —
they are the rollback mechanism.

---

## Common mistakes to avoid

| Mistake | Rule |
|---------|------|
| Editing `sites/` directly | It's generated output. Edit `content/` instead. |
| Adding Node imports to `src/lib/imageScanner.ts` or `importValidator.ts` | These run in the browser. Keep them pure TS. |
| Storing raw CSS in block `css` field | Must be a JSON-stringified object. |
| Out-of-order `settings[]` | Page must have exactly 3; site exactly 8. Order is fixed. |
| Adding a block type without updating `importValidator.ts` | Import API will reject valid JSON. |
| Adding a style/theme without updating `importValidator.ts` | Same — validator and catalog must stay in sync. |
| Using `catalog.ts` enums in client components | `catalog.ts` imports platform types — check for Node.js server-only imports before using client-side. |
| Committing real secrets to `data/credentials.json` | File is git-tracked. Use hashed credentials only. |

---

## Testing a change end-to-end

1. Edit `content/{type}/{tenantId}/pages/home.json` directly (or via the editor).
2. View at `http://localhost:3000/site/{tenantId}/home` to see the rendered result.
3. View at `http://localhost:3000/creator/doctor/{tenantId}` to test the editor flow.
4. For deploy testing: `node scripts/deploy-tenant.mjs {tenantId}` (reuses existing build).

For import flow testing:

```bash
curl -X POST http://localhost:3000/api/import/tenant \
  -H "Authorization: Bearer <admin-token>" \
  -F "site=@/path/to/site.json" \
  -F "pages=@/path/to/home.json"
```

---

## File naming conventions

| What | Convention |
|------|------------|
| Tenant IDs | `dr-firstname-lastname` (doctor), `city-name-hospital` (hospital) |
| Page slugs | `home`, `services`, `about`, `contact` |
| Block component files | `PascalCase.tsx` matching `_template` in PascalCase |
| Block folders | `kebab-case` matching `_template` value |
| API route files | `route.ts` (Next.js convention) |
| Page route files | `page.tsx` (Next.js convention) |
