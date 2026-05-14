import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

type SnapshotPayload = {
  tenantType?: "doctor" | "hospital";
  tenantSlug?: string;
  pageSlug?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SnapshotPayload;
  const tenantType = body.tenantType;
  const tenantSlug = body.tenantSlug;
  const pageSlug = body.pageSlug;

  if (!tenantType || !tenantSlug || !pageSlug) {
    return NextResponse.json(
      { ok: false, message: "tenantType, tenantSlug and pageSlug are required" },
      { status: 400 }
    );
  }

  const folder = tenantType === "doctor" ? "doctors" : "hospitals";
  const sourceFile = path.join(process.cwd(), "content", folder, tenantSlug, "pages", `${pageSlug}.json`);
  const historyRoot = path.join(process.cwd(), "content-history", folder, tenantSlug);
  const historyDir = path.join(historyRoot, pageSlug);
  const historyIndexFile = path.join(historyRoot, "history-index.json");

  try {
    const currentContent = await fs.readFile(sourceFile, "utf8");
    const checksum = createHash("sha256").update(currentContent).digest("hex");

    const index = await readHistoryIndex(historyIndexFile);
    const latestForPage = index.entries.filter((entry) => entry.pageSlug === pageSlug).at(-1);
    if (latestForPage?.checksum === checksum) {
      return NextResponse.json({ ok: true, skipped: true, reason: "unchanged" });
    }

    await fs.mkdir(historyDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historyFile = path.join(historyDir, `${timestamp}.json`);
    await fs.writeFile(historyFile, currentContent, "utf8");

    index.entries.push({
      timestamp,
      pageSlug,
      checksum,
      file: path.relative(process.cwd(), historyFile),
    });
    await fs.mkdir(historyRoot, { recursive: true });
    await fs.writeFile(historyIndexFile, JSON.stringify(index, null, 2), "utf8");

    return NextResponse.json({ ok: true, historyFile, checksum });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to snapshot current content file" }, { status: 500 });
  }
}

type HistoryIndex = {
  entries: Array<{
    timestamp: string;
    pageSlug: string;
    checksum: string;
    file: string;
  }>;
};

async function readHistoryIndex(file: string): Promise<HistoryIndex> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as HistoryIndex;
  } catch {
    return { entries: [] };
  }
}
