import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/token";

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
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
