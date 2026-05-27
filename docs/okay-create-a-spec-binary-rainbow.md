# Gemini Gem Integration — Two-Phase Spec

## Context

The platform needs a Gemini Gem that can create and update doctor/hospital websites by
calling the platform API directly, instead of doctors handling JSON manually. The security
constraint: API calls over the network must not expose credentials in the Gem's config.
Phase 1 covers all functionality except screenshots. Phase 2 adds a screenshot endpoint
(with two implementation options) so the Gem can visually verify changes.

---

## Phase 1 — Secure Gem Integration (no screenshot)

### What changes and why

**Auth mechanism: HMAC-SHA256 webhook signing**
The current JWT system requires a username+password to get a token — not suitable for
machine-to-machine. HMAC signing uses a shared secret (`GEMINI_WEBHOOK_SECRET` env var)
as the credential. The Gem signs each request; the server verifies the signature and treats
a valid one as admin-level access. No password ever stored in the Gem's config.

Existing JWT auth is completely unchanged — the editor UI and TinaCMS continue to work.
HMAC is a second parallel auth path.

---

### Files to create

| File | Purpose |
|------|---------|
| `src/lib/hmac.ts` | HMAC-SHA256 verification. Pure Node.js `crypto` — no new packages. |
| `docs/gemini-gem/tools.json` | Gemini function-calling schemas for all 6 Phase 1 tools. |
| `docs/gemini-gem/gem-instructions.md` | System prompt for the Gem (error handling, iteration patterns, image rules). |
| `docs/gemini-gem/SETUP.md` | How to create the Gem in Google AI Studio and configure the secret. |

### Files to modify

| File | Change |
|------|--------|
| `src/lib/token.ts` | Add exported `requireGemAuth(req, rawBody)` — same return shape as `requireAuth()`. |
| `src/app/api/tenants/route.ts` | Accept HMAC. Fix error shape: `String(e)` → `{ error, details: [{path, message}] }`. |
| `src/app/api/content/read/route.ts` | Accept HMAC. Audit error shape. |
| `src/app/api/content/save/route.ts` | Accept HMAC. Fix `details: String(error)` → `details: [{path, message}]`. Read body as text before parsing. |
| `src/app/api/import/tenant/route.ts` | Accept HMAC. Rename `validationErrors` key → `details`. Add `previewUrl` to success response. |
| `src/app/api/import/page/route.ts` | Accept HMAC. Rename `validationErrors` key → `details`. Add `previewUrl` to success response. |
| `src/app/api/pexels/route.ts` | Accept HMAC. Honor `per_page` query param (currently hardcoded to 20). |
| `src/app/creator/import/page.tsx` | Update client-side read of `validationErrors` → `details` (line ~250) to match renamed key. |

---

### HMAC algorithm — `src/lib/hmac.ts`

```typescript
// Signing protocol (Gem side):
//   bodyHash  = SHA256(rawBody)                           // hex string
//   message   = timestamp + "." + bodyHash
//   signature = HMAC-SHA256(GEMINI_WEBHOOK_SECRET, message)  // hex string
//
// Headers sent by Gem:
//   X-Gem-Timestamp: <unix seconds>
//   X-Gem-Signature: sha256=<hex>
//
// Server rejects if: header missing, timestamp > 5 min old or > 30s future,
// signatures don't match (timing-safe), or secret is not configured.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const REPLAY_WINDOW = 300; // 5 minutes
const FUTURE_SLACK  = 30;  // allow clock skew

export function verifyGemSignature(
  timestampHeader: string | null,
  signatureHeader: string | null,
  rawBody: string,
): boolean {
  const secret = process.env.GEMINI_WEBHOOK_SECRET;
  if (!secret || !timestampHeader || !signatureHeader) return false;

  const ts  = parseInt(timestampHeader, 10);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts)) return false;
  if (ts < now - REPLAY_WINDOW || ts > now + FUTURE_SLACK) return false;

  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const expected = createHmac("sha256", secret)
    .update(`${ts}.${bodyHash}`, "utf8")
    .digest("hex");

  if (!signatureHeader.startsWith("sha256=")) return false;
  const received = signatureHeader.slice(7);

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(received, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
```

---

### `requireGemAuth` — addition to `src/lib/token.ts`

```typescript
import { verifyGemSignature } from "./hmac";

export function requireGemAuth(req: NextRequest, rawBody: string): AuthResult {
  const secret = process.env.GEMINI_WEBHOOK_SECRET;
  if (!secret)
    return { ok: false, response: NextResponse.json({ error: "Gem auth not configured" }, { status: 503 }) };

  const valid = verifyGemSignature(
    req.headers.get("x-gem-timestamp"),
    req.headers.get("x-gem-signature"),
    rawBody,
  );
  if (!valid)
    return { ok: false, response: NextResponse.json({ error: "Invalid or expired Gem signature" }, { status: 401 }) };

  return {
    ok: true,
    payload: { tenantId: "__gem__", tenantType: "admin", username: "gemini-gem",
                role: "admin", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 },
  };
}
```

---

### Auth dual-path pattern for each route

**GET routes** (`tenants`, `content/read`, `pexels`) — rawBody is `""`:

```typescript
export async function GET(req: NextRequest) {
  let auth = requireAuth(req, { adminOnly: true }); // or { tenantId }
  if (!auth.ok) auth = requireGemAuth(req, "");
  if (!auth.ok) return auth.response;
  // ... rest unchanged
}
```

**JSON POST routes** (`content/save`) — read body once as text:

```typescript
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let auth = requireAuth(req, { adminOnly: true });
  if (!auth.ok) auth = requireGemAuth(req, rawBody);
  if (!auth.ok) return auth.response;
  const body = JSON.parse(rawBody); // safe — already consumed as text
  // ... rest unchanged
}
```

**Multipart routes** (`import/tenant`, `import/page`) — detect Gem vs JWT before consuming body:

```typescript
export async function POST(req: NextRequest) {
  let form: FormData;
  if (req.headers.has("x-gem-signature")) {
    const rawBody = await req.text();
    const auth = requireGemAuth(req, rawBody);
    if (!auth.ok) return auth.response;
    // Re-parse FormData from raw text
    form = await new Request(req.url, { method: "POST", headers: req.headers, body: rawBody }).formData();
  } else {
    const auth = requireAuth(req, { adminOnly: true });
    if (!auth.ok) return auth.response;
    form = await req.formData();
  }
  // ... rest unchanged
}
```

---

### Canonical error shape (all routes must conform)

```json
{ "error": "Human-readable summary", "details": [{ "path": "blocks[0].items[1].src", "message": "What to fix" }] }
```

Key renames needed:
- `import/tenant` and `import/page`: `validationErrors` → `details`, `missingImages` items wrapped in same shape
- `content/save`: `details: String(error)` → `details: [{ path: "", message: String(error) }]`
- `tenants`: `error: String(e)` → `{ error: "Failed to list tenants", details: [{ path: "", message: String(e) }] }`

---

### `previewUrl` in import success responses

Pattern: `/site/{tenantId}/{firstPageSlug}/preview`

Add to both import routes' success `NextResponse.json({})` calls. Derive slug from
`pages[0].settings.find(s => s._template === "urlSettings")?.slug ?? "home"`.

---

### Gem tool definitions — `docs/gemini-gem/tools.json`

6 tools for Phase 1:

| Tool name | Maps to | Key params |
|-----------|---------|-----------|
| `list_tenants` | `GET /api/tenants` | (none) |
| `read_content` | `GET /api/content/read` | `tenantType`, `tenantId`, `pageSlug?` |
| `save_content` | `POST /api/content/save` | `tenantType`, `tenantId`, `pageSlug?`, `data` (object) |
| `import_tenant` | `POST /api/import/tenant` | `site` (JSON string), `pages` (JSON string) |
| `import_page` | `POST /api/import/page` | `tenantId`, `tenantType`, `page` (JSON string), `overwrite?` |
| `search_photos` | `GET /api/pexels` | `query`, `page?`, `per_page?` |

Full JSON schemas go in the file. Key constraint documented in `gem-instructions.md`:
**all image refs must be external URLs** (Pexels or https://…). The Gem cannot upload binary
files, so `/content/...` relative paths must never appear in Gem-generated JSON.

---

### Gem system prompt — `docs/gemini-gem/gem-instructions.md`

Must cover:
- Always call `read_content` before `save_content` (never overwrite blindly)
- Self-correct on enum/format errors silently; ask user only for missing data (phone, address, real photos)
- All images must be external URLs; call `search_photos` before writing blocks with image fields
- HMAC signing instructions (pseudocode for how to compute headers before each call)
- Error interpretation: parse `details[]` array, map each `path` to the JSON field to fix
- Iteration loop: save → return `previewUrl` → ask user to review → apply feedback

---

### `SETUP.md` must document

- Generate `GEMINI_WEBHOOK_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Set secret in Vercel env vars (not in source)
- Set same secret in Gem's system prompt (Gem uses it to sign requests)
- Register all 6 tools from `tools.json` in Google AI Studio
- Base URL to use in tool HTTP configs

---

### Implementation order

1. `src/lib/hmac.ts`
2. `src/lib/token.ts` — add `requireGemAuth`
3. GET routes: `tenants` → `content/read` → `pexels`
4. JSON POST: `content/save`
5. Multipart: `import/page` → `import/tenant`
6. `src/app/creator/import/page.tsx` — update `validationErrors` → `details`
7. `docs/gemini-gem/` directory and all three files

---

## Phase 2 — Screenshot endpoint

### New file: `src/app/api/preview/screenshot/route.ts`

`GET /api/preview/screenshot?tenantId=&slug=&width=1280`
Auth: HMAC only (no JWT path needed).
Response: `{ image: "data:image/png;base64,..." }`

Switched by `SCREENSHOT_MODE` env var (`"external"` default, `"self"` for self-hosted).

**Option A — Self-hosted** (`SCREENSHOT_MODE=self`):

```
packages: @sparticuz/chromium  puppeteer-core
Vercel: Pro plan required (maxDuration: 30)
Cold start: 4–8s
Cost: free
```

Uses `chromium.executablePath()` and `puppeteer.launch({ args: chromium.args, ... })`.
Navigate to `/site/{tenantId}/{slug}/preview`, wait for `networkidle0`, `page.screenshot()`.

**Option B — External** (`SCREENSHOT_MODE=external`, default):

```
env var: SCREENSHOTONE_API_KEY
Vercel: Hobby works (sub-second cold start)
Cost: free tier 100/month, then ~$9/mo
```

Proxies to `https://api.screenshotone.com/take` with `access_key`, `url`, `viewport_width`,
`format=png`, `delay=2` (allow React hydration). Returns base64-encoded PNG.

Both options use the same error response shape: `{ error, details: [{path, message}] }`.

### `vercel.json` update (for Option A)

```json
{
  "functions": {
    "src/app/api/preview/screenshot/route.ts": { "maxDuration": 30 }
  }
}
```

Only needed when `SCREENSHOT_MODE=self`. Option B works without it.

### `docs/gemini-gem/tools.json` update

Add 7th tool `screenshot_preview`: `GET /api/preview/screenshot`, params: `tenantId`, `slug`, `width?`.

Update `gem-instructions.md`: after every `save_content`, call `screenshot_preview` and
reason about the image before reporting back to the user. If layout issues are visible,
self-correct and re-screenshot before asking the user to review.

---

## Verification

### Phase 1 — curl-based testing without a real Gem

**Step 1 — generate HMAC headers for a test request:**
```bash
node -e "
  const c = require('crypto'), secret = process.env.GEMINI_WEBHOOK_SECRET;
  const body = '', ts = Math.floor(Date.now()/1000);
  const bh = c.createHash('sha256').update(body).digest('hex');
  const sig = 'sha256=' + c.createHmac('sha256', secret).update(ts+'.'+bh).digest('hex');
  console.log('TS=' + ts + '\nSIG=' + sig);
"
```

**Step 2 — verify each endpoint accepts HMAC:**
```bash
curl http://localhost:3000/api/tenants -H "X-Gem-Timestamp: $TS" -H "X-Gem-Signature: $SIG"
curl "http://localhost:3000/api/content/read?tenantType=doctor&tenantId=nitesh-garwa" \
  -H "X-Gem-Timestamp: $TS" -H "X-Gem-Signature: $SIG"
```

**Step 3 — verify replay protection:**
```bash
# Use timestamp 301 seconds old → must return 401
OLD_TS=$(($(date +%s) - 301))
# compute sig with OLD_TS, call any endpoint → expect {"error":"Invalid or expired Gem signature"}
```

**Step 4 — verify JWT still works (backward compat):**
```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login -d '{"tenantId":"__admin__","username":"...","password":"..."}' | jq -r .token)
curl localhost:3000/api/tenants -H "Authorization: Bearer $TOKEN"
# Must return tenant list
```

### Phase 2 — screenshot endpoint

```bash
# Option B (external)
SCREENSHOT_MODE=external SCREENSHOTONE_API_KEY=... \
  curl "http://localhost:3000/api/preview/screenshot?tenantId=nitesh-garwa&slug=home" \
  -H "X-Gem-Timestamp: $TS" -H "X-Gem-Signature: $SIG" | jq '.image | length'
# Should return a large number (base64 PNG)

# Option A (self-hosted) — only testable locally, not in Vercel dev
SCREENSHOT_MODE=self \
  curl "http://localhost:3000/api/preview/screenshot?tenantId=nitesh-garwa&slug=home" \
  -H "X-Gem-Timestamp: $TS" -H "X-Gem-Signature: $SIG" | jq '.image | length'
```

---

## Key constraints to remember during implementation

1. `ReadableStream` can only be consumed once — JSON POST routes must switch from `req.json()` to `req.text()` + `JSON.parse()`. Multipart routes need the re-Request pattern.
2. `src/app/creator/import/page.tsx` reads `validationErrors` client-side — must be updated when the key is renamed to `details`.
3. Gem must only use external image URLs — document this as a hard rule in `gem-instructions.md`.
4. `GEMINI_WEBHOOK_SECRET` must be ≥32 random bytes; document the generation command in `SETUP.md`.
5. Phase 2 Option A requires Vercel Pro; Option B defaults and works on Hobby.
6. The preview route (`/site/{tenantId}/{slug}/preview`) has no auth — this is required so Option B's external screenshot service can fetch it.
