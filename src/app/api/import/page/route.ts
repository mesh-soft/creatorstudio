import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth, requireGemAuth } from "@/lib/token";
import { getContentAdapter } from "@/platform/contentAdapter";
import { validatePageJson, TENANT_ID_RE, SLUG_RE } from "@/lib/importValidator";
import { auditImages, filenameFromPath } from "@/lib/imageScanner";

const IMAGE_EXTS    = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const MAX_IMG_BYTES = 10 * 1024 * 1024;
const TYPE_DIR: Record<string, string> = { doctor: "doctors", hospital: "hospitals" };

async function saveImage(file: File, typeDir: string, tenantId: string): Promise<string> {
  const safeName = file.name.normalize("NFC").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_");
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
  // ── Auth ────────────────────────────────────────────────────────────────
  let form: FormData;
  if (req.headers.has("x-gem-signature")) {
    const rawBody = await req.text();
    const auth = requireGemAuth(req, rawBody);
    if (!auth.ok) return auth.response;
    form = await new Request(req.url, { method: "POST", headers: req.headers, body: rawBody }).formData();
  } else {
    const auth = requireAuth(req, { adminOnly: true });
    if (!auth.ok) return auth.response;
    form = await req.formData();
  }

  const tenantId   = String(form.get("tenantId")   ?? "").trim();
  const tenantType = String(form.get("tenantType") ?? "").trim();
  const pageRaw    = form.get("page") as string | null;
  const overwrite  = form.get("overwrite") !== "false";

  if (!tenantId || !TENANT_ID_RE.test(tenantId)) {
    return NextResponse.json({ error: "tenantId is required and must be kebab-case", details: [{ path: "tenantId", message: "Invalid or missing" }] }, { status: 400 });
  }
  if (tenantType !== "doctor" && tenantType !== "hospital") {
    return NextResponse.json({ error: 'tenantType must be "doctor" or "hospital"', details: [{ path: "tenantType", message: "Invalid" }] }, { status: 400 });
  }
  if (!pageRaw?.trim()) {
    return NextResponse.json({ error: "Form field `page` (JSON string) is required", details: [{ path: "page", message: "Missing" }] }, { status: 400 });
  }

  let page: Record<string, unknown>;
  try {
    page = JSON.parse(pageRaw);
    if (!page || typeof page !== "object" || Array.isArray(page)) throw new Error("Must be a JSON object");
  } catch (err) {
    return NextResponse.json({ error: "page JSON parse error", details: [{ path: "page", message: (err as Error).message }] }, { status: 400 });
  }

  const { valid, errors: validationErrors } = validatePageJson(page);
  if (!valid) {
    return NextResponse.json({ error: "JSON validation failed", details: validationErrors.map((e: any) => ({ path: e.path, message: e.message })) }, { status: 422 });
  }

  const settingsArr = Array.isArray(page.settings) ? page.settings : [];
  const urlSettings = settingsArr.find(
    (s: unknown) => s && typeof s === "object" && (s as Record<string, unknown>)._template === "urlSettings",
  ) as Record<string, unknown> | undefined;

  const slug = String(urlSettings?.slug ?? page.slug ?? "").trim();
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Page slug is required and must be kebab-case", details: [{ path: "", message: "Missing slug in urlSettings" }] }, { status: 400 });
  }

  const imageFiles  = form.getAll("image") as File[];
  const validImages: File[] = [];
  const imageErrors: string[] = [];

  for (const file of imageFiles) {
    if (typeof file === "string") continue;
    if (!IMAGE_EXTS.test(file.name)) { imageErrors.push(`"${file.name}" is not a supported image type`); continue; }
    if (file.size > MAX_IMG_BYTES) { imageErrors.push(`"${file.name}" exceeds the 10 MB limit`); continue; }
    validImages.push(file);
  }

  if (imageErrors.length > 0) {
    return NextResponse.json({ error: "Invalid image files", details: imageErrors.map(m => ({ path: "", message: m })) }, { status: 400 });
  }

  const typeDir  = TYPE_DIR[tenantType];
  const existing = existingFilenames(typeDir, tenantId);
  const audit    = auditImages(page, validImages, existing);

  if (audit.missing.length > 0) {
    return NextResponse.json({
      error: "Missing image files",
      message: `The JSON references ${audit.missing.length} image(s) that were not uploaded and do not exist on disk.`,
      details: audit.missing.map(imgPath => ({ path: imgPath, message: `Missing: ${filenameFromPath(imgPath)}` })),
    }, { status: 422 });
  }

  const baseDir  = tenantType === "doctor" ? "content/doctors" : "content/hospitals";
  const sitePath = `${baseDir}/${tenantId}/site/index.json`;
  const pagePath = `${baseDir}/${tenantId}/pages/${slug}.json`;

  const adapter = await getContentAdapter();

  if (!(await adapter.exists(sitePath))) {
    return NextResponse.json({ error: `Tenant "${tenantId}" not found`, details: [{ path: "tenantId", message: "Tenant does not exist. Create it first." }] }, { status: 404 });
  }

  if (!overwrite && (await adapter.exists(pagePath))) {
    return NextResponse.json({ error: `Page "${slug}" already exists. Pass overwrite=true to replace it.`, details: [{ path: "slug", message: "Page exists" }] }, { status: 409 });
  }

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
    previewUrl: `/site/${tenantId}/${slug}/preview`,
  });
}
