import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";

type SnapshotPayload = {
  tenantType?: "doctor" | "hospital";
  tenantSlug?: string;
  pageSlug?: string;
};

// Snapshots require a writable local filesystem — skip in cloud environments.
const IS_READONLY_ENV = Boolean(process.env.VERCEL || process.env.SNAPSHOT_DISABLED);

export async function POST(request: NextRequest) {
  if (IS_READONLY_ENV) {
    return NextResponse.json({ ok: false, skipped: true, reason: "read-only environment" });
  }

  const body = (await request.json()) as SnapshotPayload;
  const { tenantType, tenantSlug, pageSlug } = body;

  if (!tenantType || !tenantSlug || !pageSlug) {
    return NextResponse.json(
      { ok: false, message: "tenantType, tenantSlug and pageSlug are required" },
      { status: 400 },
    );
  }

  const auth = requireAuth(request, { tenantId: tenantSlug });
  if (!auth.ok) return auth.response;

  const folder      = tenantType === "doctor" ? "doctors" : "hospitals";
  const sourceFile  = path.join(process.cwd(), "content", folder, tenantSlug, "pages", `${pageSlug}.json`);
  const historyRoot = path.join(process.cwd(), "content-history", folder, tenantSlug);
  const historyDir  = path.join(historyRoot, pageSlug);
  const historyIndexFile = path.join(historyRoot, "history-index.json");

  try {
    const currentContent = await fs.readFile(sourceFile, "utf8");
    const checksum = createHash("sha256").update(currentContent).digest("hex");

    const index = await readHistoryIndex(historyIndexFile);
    const latestForPage = index.entries.filter(e => e.pageSlug === pageSlug).at(-1);
    if (latestForPage?.checksum === checksum) {
      return NextResponse.json({ ok: true, skipped: true, reason: "unchanged" });
    }

    await fs.mkdir(historyDir, { recursive: true });
    const timestamp   = new Date().toISOString().replace(/[:.]/g, "-");
    const historyFile = path.join(historyDir, `${timestamp}.json`);
    await fs.writeFile(historyFile, currentContent, "utf8");

    index.entries.push({ timestamp, pageSlug, checksum, file: path.relative(process.cwd(), historyFile) });
    await fs.mkdir(historyRoot, { recursive: true });
    await fs.writeFile(historyIndexFile, JSON.stringify(index, null, 2), "utf8");

    return NextResponse.json({ ok: true, historyFile, checksum });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to snapshot current content file" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (IS_READONLY_ENV) {
    return NextResponse.json({ ok: true, entries: [] });
  }

  const { searchParams } = new URL(request.url);
  const tenantType  = searchParams.get("tenantType") as "doctor" | "hospital" | null;
  const tenantSlug  = searchParams.get("tenantSlug");
  const pageSlug    = searchParams.get("pageSlug");
  const timestamp   = searchParams.get("timestamp");

  if (!tenantType || !tenantSlug) {
    return NextResponse.json({ ok: false, message: "tenantType and tenantSlug are required" }, { status: 400 });
  }

  const auth = requireAuth(request, { tenantId: tenantSlug });
  if (!auth.ok) return auth.response;

  const folder = tenantType === "doctor" ? "doctors" : "hospitals";

  // Single snapshot file content
  if (timestamp && pageSlug) {
    const historyDir   = path.join(process.cwd(), "content-history", folder, tenantSlug, pageSlug);
    const snapshotFile = path.join(historyDir, `${timestamp}.json`);
    try {
      const raw     = await fs.readFile(snapshotFile, "utf8");
      const content = JSON.parse(raw);
      return NextResponse.json({ ok: true, content });
    } catch {
      return NextResponse.json({ ok: false, message: "Snapshot not found" }, { status: 404 });
    }
  }

  // Entry list
  const historyRoot      = path.join(process.cwd(), "content-history", folder, tenantSlug);
  const historyIndexFile = path.join(historyRoot, "history-index.json");
  const index            = await readHistoryIndex(historyIndexFile);

  const entries = pageSlug
    ? index.entries.filter(e => e.pageSlug === pageSlug)
    : index.entries;

  return NextResponse.json({ ok: true, entries: entries.slice().reverse() });
}

export async function PUT(request: NextRequest) {
  if (IS_READONLY_ENV) {
    return NextResponse.json({ ok: false, skipped: true, reason: "read-only environment" });
  }

  const body = (await request.json()) as SnapshotPayload & { timestamp?: string };
  const { tenantType, tenantSlug, pageSlug, timestamp } = body;

  if (!tenantType || !tenantSlug || !pageSlug || !timestamp) {
    return NextResponse.json(
      { ok: false, message: "tenantType, tenantSlug, pageSlug and timestamp are required" },
      { status: 400 },
    );
  }

  const auth = requireAuth(request, { tenantId: tenantSlug });
  if (!auth.ok) return auth.response;

  const folder       = tenantType === "doctor" ? "doctors" : "hospitals";
  const historyDir   = path.join(process.cwd(), "content-history", folder, tenantSlug, pageSlug);
  const snapshotFile = path.join(historyDir, `${timestamp}.json`);
  const targetFile   = path.join(process.cwd(), "content", folder, tenantSlug, "pages", `${pageSlug}.json`);

  try {
    const content = await fs.readFile(snapshotFile, "utf8");
    await fs.writeFile(targetFile, content, "utf8");
    return NextResponse.json({ ok: true, restored: timestamp });
  } catch {
    return NextResponse.json({ ok: false, message: "Snapshot file not found or could not be restored" }, { status: 404 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type HistoryIndex = {
  entries: Array<{ timestamp: string; pageSlug: string; checksum: string; file: string }>;
};

async function readHistoryIndex(file: string): Promise<HistoryIndex> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as HistoryIndex;
  } catch {
    return { entries: [] };
  }
}
