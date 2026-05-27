import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth, requireGemAuth } from "@/lib/token";
import { getContentAdapter } from "@/platform/contentAdapter";
import { wrapFlatSiteIntoSettings, isSiteSettingsDocument } from "@/platform/siteSettingsNormalize";
import { validateSiteJson, validatePageJson, SLUG_RE } from "@/lib/importValidator";
import { auditImages, filenameFromPath } from "@/lib/imageScanner";

const IMAGE_EXTS   = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const MAX_IMG_BYTES = 10 * 1024 * 1024;
const TYPE_DIR: Record<string, string> = { doctor: "doctors", hospital: "hospitals" };

async function saveImage(file: File, typeDir: string, tenantId: string): Promise<string> {
  const safeName = file.name.normalize("NFC").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_");
  const dir = path.join(process.cwd(), "public", "content", typeDir, tenantId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, safeName), buffer);
  return `/content/${typeDir}/${tenantId}/${encodeURIComponent(safeName)}`;
}

function existingFilenames(typeDir: string, tenantId: string): string[] {
  const dir = path.join(process.cwd(), "public", "content", typeDir, tenantId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => IMAGE_EXTS.test(f));
}

export async function POST(req: NextRequest) {
  // ── Auth: HMAC path requires reading raw body before FormData ────────────
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

  // ── Extract fields ─────────────────────────────────────────────────────
  const siteRaw  = form.get("site")  as string | null;
  const pagesRaw = form.get("pages") as string | null;

  if (!siteRaw?.trim()) {
    return NextResponse.json({ error: "Form field `site` (JSON string) is required", details: [{ path: "site", message: "Missing" }] }, { status: 400 });
  }
  if (!pagesRaw?.trim()) {
    return NextResponse.json({ error: "Form field `pages` (JSON string) is required", details: [{ path: "pages", message: "Missing" }] }, { status: 400 });
  }

  // ── Parse JSON ─────────────────────────────────────────────────────────
  let site: Record<string, unknown>;
  let pagesInput: Record<string, unknown>[];

  try {
    site = JSON.parse(siteRaw);
    if (!site || typeof site !== "object" || Array.isArray(site)) throw new Error("site must be a JSON object");
  } catch (err) {
    return NextResponse.json({ error: "site JSON parse error", details: [{ path: "site", message: (err as Error).message }] }, { status: 400 });
  }

  try {
    const raw = JSON.parse(pagesRaw);
    pagesInput = Array.isArray(raw) ? raw : [raw];
    if (pagesInput.length === 0) throw new Error("pages must not be empty");
  } catch (err) {
    return NextResponse.json({ error: "pages JSON parse error", details: [{ path: "pages", message: (err as Error).message }] }, { status: 400 });
  }

  // ── Schema validation ──────────────────────────────────────────────────
  const siteValidation = validateSiteJson(site);
  const pageValidations = pagesInput.map((p, i) => ({
    index: i,
    result: validatePageJson(p as Record<string, unknown>),
  }));

  const allErrors = [
    ...siteValidation.errors.map(er => ({ ...er, source: "site.json" })),
    ...pageValidations.flatMap(({ index, result }) =>
      result.errors.map(er => ({ ...er, source: `pages[${index}]` }))
    ),
  ];

  if (allErrors.length > 0) {
    return NextResponse.json({ error: "JSON validation failed", details: allErrors }, { status: 422 });
  }

  // ── Collect uploaded image files ───────────────────────────────────────
  const imageFiles = form.getAll("image") as File[];
  const validImages: File[] = [];
  const imageErrors: string[] = [];

  for (const file of imageFiles) {
    if (typeof file === "string") continue;
    if (!IMAGE_EXTS.test(file.name)) {
      imageErrors.push(`"${file.name}" is not a supported image type (jpg, png, gif, webp, svg, avif)`);
      continue;
    }
    if (file.size > MAX_IMG_BYTES) {
      imageErrors.push(`"${file.name}" exceeds the 10 MB size limit`);
      continue;
    }
    validImages.push(file);
  }

  if (imageErrors.length > 0) {
    return NextResponse.json({ error: "Invalid image files", details: imageErrors.map(m => ({ path: "", message: m })) }, { status: 400 });
  }

  // ── Image audit ────────────────────────────────────────────────────────
  const tenantId   = String(site.tenantId).trim();
  const tenantType = String(site.tenantType).trim() as "doctor" | "hospital";
  const typeDir    = TYPE_DIR[tenantType];

  const allJsonData: Record<string, unknown> = { ...site, pages: pagesInput };
  const existing   = existingFilenames(typeDir, tenantId);
  const audit      = auditImages(allJsonData, validImages, existing);

  if (audit.missing.length > 0) {
    return NextResponse.json({
      error: "Missing image files",
      message: `The JSON references ${audit.missing.length} image(s) that were not uploaded and do not exist on disk. Upload them with the form or use external URLs.`,
      details: audit.missing.map(imgPath => ({ path: imgPath, message: `Missing: ${filenameFromPath(imgPath)}` })),
    }, { status: 422 });
  }

  // ── Write images ───────────────────────────────────────────────────────
  const uploadedUrls: string[] = [];
  for (const file of validImages) {
    const url = await saveImage(file, typeDir, tenantId);
    uploadedUrls.push(url);
  }

  // ── Write JSON files ───────────────────────────────────────────────────
  const baseDir  = tenantType === "doctor" ? "content/doctors" : "content/hospitals";
  const adapter  = await getContentAdapter();
  const written: string[] = [];

  const sitePayload = isSiteSettingsDocument(site)
    ? { ...site }
    : wrapFlatSiteIntoSettings({ ...site });

  await adapter.write(`${baseDir}/${tenantId}/site/index.json`, JSON.stringify(sitePayload, null, 2));
  written.push(`${baseDir}/${tenantId}/site/index.json`);

  for (const page of pagesInput) {
    const settingsArr = Array.isArray(page.settings) ? page.settings : [];
    const urlSettings = settingsArr.find(
      (s: unknown) => s && typeof s === "object" && (s as Record<string, unknown>)._template === "urlSettings",
    ) as Record<string, unknown> | undefined;
    const slug = String(urlSettings?.slug ?? (page as Record<string, unknown>).slug ?? "home").trim();
    if (!SLUG_RE.test(slug)) continue;

    const pagePath = `${baseDir}/${tenantId}/pages/${slug}.json`;
    await adapter.write(pagePath, JSON.stringify(page, null, 2));
    written.push(pagePath);
  }

  const firstPageSlug = (() => {
    const p = pagesInput[0];
    if (!p) return "home";
    const sa = Array.isArray(p.settings) ? p.settings : [];
    const us = sa.find((s: unknown) => s && typeof s === "object" && (s as any)._template === "urlSettings") as any;
    return us?.slug ?? (p as any).slug ?? "home";
  })();

  return NextResponse.json({
    success: true,
    tenantId,
    tenantType,
    paths: written,
    uploadedImages: uploadedUrls,
    previewUrl: `/site/${tenantId}/${firstPageSlug}/preview`,
  });
}
