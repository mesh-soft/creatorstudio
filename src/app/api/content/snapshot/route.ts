import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type SnapshotPayload = {
  tenantType?: "doctor" | "hospital";
  tenantId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SnapshotPayload;
  const tenantType = body.tenantType;
  const tenantId = body.tenantId;

  if (!tenantType || !tenantId) {
    return NextResponse.json({ ok: false, message: "tenantType and tenantId are required" }, { status: 400 });
  }

  const folder = tenantType === "doctor" ? "doctors" : "hospitals";
  const sourceFile = path.join(process.cwd(), "content", folder, `${tenantId}.json`);
  const historyDir = path.join(process.cwd(), "content-history", folder, tenantId);

  try {
    const currentContent = await fs.readFile(sourceFile, "utf8");
    await fs.mkdir(historyDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historyFile = path.join(historyDir, `${timestamp}.json`);
    await fs.writeFile(historyFile, currentContent, "utf8");

    return NextResponse.json({ ok: true, historyFile });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to snapshot current content file" }, { status: 500 });
  }
}
