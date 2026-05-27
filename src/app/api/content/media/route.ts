import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/token";

const IMAGE_EXTS   = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const MAX_BYTES    = 10 * 1024 * 1024; // 10 MB
const TYPE_DIR: Record<string, string> = {
  doctor:   "doctors",
  hospital: "hospitals",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantType = searchParams.get("tenantType") ?? "";
  const tenantId   = searchParams.get("tenantId")   ?? "";

  if (!tenantType || !tenantId || !TYPE_DIR[tenantType]) {
    return NextResponse.json({ ok: false, error: "Missing or invalid params" }, { status: 400 });
  }

  // Token must belong to this tenant (or be an admin token)
  const auth = requireAuth(req, { tenantId });
  if (!auth.ok) return auth.response;

  const dir = path.join(
    process.cwd(),
    "public",
    "content",
    TYPE_DIR[tenantType],
    tenantId,
  );

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ ok: true, files: [] });
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile() && IMAGE_EXTS.test(e.name))
      .map(e => ({
        name: e.name,
        url: `/content/${TYPE_DIR[tenantType]}/${tenantId}/${encodeURIComponent(e.name)}`,
      }));
    return NextResponse.json({ ok: true, files });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not read media directory" }, { status: 500 });
  }
}

/**
 * POST /api/content/media?tenantType=doctor&tenantId=nitesh-garwa
 * Body: multipart/form-data with a "file" field (image file).
 *
 * Saves the file to public/content/{type}/{tenantId}/ and returns its public URL.
 * Max size: 10 MB. Only image MIME types accepted.
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantType = searchParams.get("tenantType") ?? "";
  const tenantId   = searchParams.get("tenantId")   ?? "";

  if (!tenantType || !tenantId || !TYPE_DIR[tenantType]) {
    return NextResponse.json({ ok: false, error: "Missing or invalid params" }, { status: 400 });
  }

  const auth = requireAuth(req, { tenantId });
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "No file field in form data" }, { status: 400 });
  }

  if (!IMAGE_EXTS.test(file.name)) {
    return NextResponse.json(
      { ok: false, error: "Only image files are allowed (jpg, png, gif, webp, svg, avif)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large — maximum size is 10 MB" },
      { status: 413 },
    );
  }

  // Sanitise filename: keep only safe characters
  const safeName = file.name
    .normalize("NFC")
    .replace(/[^\w.\- ]/g, "_")
    .replace(/\s+/g, "_");

  const dir = path.join(
    process.cwd(), "public", "content", TYPE_DIR[tenantType], tenantId,
  );
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, safeName);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save file" }, { status: 500 });
  }

  const url = `/content/${TYPE_DIR[tenantType]}/${tenantId}/${encodeURIComponent(safeName)}`;
  return NextResponse.json({ ok: true, url, name: safeName });
}
