/**
 * POST /api/import/page  (multipart/form-data)
 *
 * Superadmin-only. Adds or replaces a single page on an existing tenant.
 * site.json is NOT required — the tenant must already exist.
 *
 * Form fields:
 *   tenantId    string  — existing tenant ID
 *   tenantType  string  — "doctor" | "hospital"
 *   page        string  — page.json content (JSON)
 *   overwrite   string  — "true" | "false" (default "true")
 *   image       File    — image files (repeat field for multiple)
 *
 * Validation:
 *   • page JSON validated against platform schema.
 *   • Any /content/... image path in the JSON must be covered by an uploaded
 *     file OR already exist on disk for this tenant. Missing images → 422.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/token";
import { getContentAdapter } from "@/platform/contentAdapter";
import { validatePageJson, TENANT_ID_RE, SLUG_RE } from "@/lib/importValidator";
import { auditImages, filenameFromPath } from "@/lib/imageScanner";

const IMAGE_EXTS    = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const MAX_IMG_BYTES = 10 * 1024 * 1024;
const TYPE_DIR: Record<string, string> = { doctor: "doctors", hospital: "hospitals" };

async function saveImage(file: File, typeDir: string, tenantId: string): Promise<string> {
  const safeName = file.name
    .normalize("NFC")
    .replace(/[^\w.\- ]/g, "_")
    .replace(/\s+/g, "_");
  const dir = path.join(process.cwd(), "public", "content", typeDir, tenantId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));
  return `/content/${typeDir}/${tenantId}/${encodeURIComponent(safeName)}`;
}

function existingFilenames(typeDir: string, tenantId: string): string[] {
  const dir = path.join(process.cwd(), "public", "content", typeDir, tenantId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => IMAGE_EXTS.test(f));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, { adminOnly: true });
  if (!auth.ok) return auth.response;

  // ── Parse multipart form ───────────────────────────────────────────────
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data body" }, { status: 400 });
  }

  const tenantId   = String(form.get("tenantId")   ?? "").trim();
  const tenantType = String(form.get("tenantType") ?? "").trim();
  const pageRaw    = form.get("page") as string | null;
  const overwrite  = form.get("overwrite") !== "false";

  // ── Validate scalar fields ─────────────────────────────────────────────
  if (!tenantId || !TENANT_ID_RE.test(tenantId)) {
    return NextResponse.json({ error: "tenantId is required and must be kebab-case" }, { status: 400 });
  }
  if (tenantType !== "doctor" && tenantType !== "hospital") {
    return NextResponse.json({ error: 'tenantType must be "doctor" or "hospital"' }, { status: 400 });
  }
  if (!pageRaw?.trim()) {
    return NextResponse.json({ error: "Form field `page` (JSON string) is required" }, { status: 400 });
  }

  // ── Parse JSON ─────────────────────────────────────────────────────────
  let page: Record<string, unknown>;
  try {
    page = JSON.parse(pageRaw);
    if (!page || typeof page !== "object" || Array.isArray(page)) throw new Error("Must be a JSON object");
  } catch (err) {
    return NextResponse.json({ error: `page JSON parse error: ${(err as Error).message}` }, { status: 400 });
  }

  // ── Schema validation ──────────────────────────────────────────────────
  const { valid, errors: validationErrors } = validatePageJson(page);
  if (!valid) {
    return NextResponse.json({ error: "JSON validation failed", validationErrors }, { status: 422 });
  }

  // ── Resolve slug ───────────────────────────────────────────────────────
  const settingsArr = Array.isArray(page.settings) ? page.settings : [];
  const urlSettings = settingsArr.find(
    (s: unknown) => s && typeof s === "object" && (s as Record<string, unknown>)._template === "urlSettings",
  ) as Record<string, unknown> | undefined;

  const slug = String(urlSettings?.slug ?? page.slug ?? "").trim();
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Page slug is required in settings[urlSettings].slug and must be kebab-case' },
      { status: 400 },
    );
  }

  // ── Collect + validate uploaded images ─────────────────────────────────
  const imageFiles  = form.getAll("image") as File[];
  const validImages: File[] = [];
  const imageErrors: string[] = [];

  for (const file of imageFiles) {
    if (typeof file === "string") continue;
    if (!IMAGE_EXTS.test(file.name)) {
      imageErrors.push(`"${file.name}" is not a supported image type`);
      continue;
    }
    if (file.size > MAX_IMG_BYTES) {
      imageErrors.push(`"${file.name}" exceeds the 10 MB limit`);
      continue;
    }
    validImages.push(file);
  }

  if (imageErrors.length > 0) {
    return NextResponse.json({ error: "Invalid image files", imageErrors }, { status: 400 });
  }

  // ── Image audit ────────────────────────────────────────────────────────
  const typeDir  = TYPE_DIR[tenantType];
  const existing = existingFilenames(typeDir, tenantId);
  const audit    = auditImages(page, validImages, existing);

  if (audit.missing.length > 0) {
    return NextResponse.json(
      {
        error: "Missing image files",
        message: `The JSON references ${audit.missing.length} image(s) that were not uploaded and do not exist on disk.`,
        missingImages: audit.missing.map(imgPath => ({
          path: imgPath,
          filename: filenameFromPath(imgPath),
        })),
      },
      { status: 422 },
    );
  }

  // ── Verify tenant exists ───────────────────────────────────────────────
  const baseDir  = tenantType === "doctor" ? "content/doctors" : "content/hospitals";
  const sitePath = `${baseDir}/${tenantId}/site/index.json`;
  const pagePath = `${baseDir}/${tenantId}/pages/${slug}.json`;

  const adapter = await getContentAdapter();

  if (!(await adapter.exists(sitePath))) {
    return NextResponse.json(
      { error: `Tenant "${tenantId}" not found. Create the tenant first or check tenantType.` },
      { status: 404 },
    );
  }

  if (!overwrite && (await adapter.exists(pagePath))) {
    return NextResponse.json(
      { error: `Page "${slug}" already exists. Pass overwrite=true to replace it.` },
      { status: 409 },
    );
  }

  // ── Write images first, then JSON ──────────────────────────────────────
  const uploadedUrls: string[] = [];
  for (const file of validImages) {
    uploadedUrls.push(await saveImage(file, typeDir, tenantId));
  }

  await adapter.write(pagePath, JSON.stringify(page, null, 2));

  return NextResponse.json({
    success: true,
    tenantId,
    tenantType,
    slug,
    path: pagePath,
    uploadedImages: uploadedUrls,
  });
}
