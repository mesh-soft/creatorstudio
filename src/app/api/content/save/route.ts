import { NextRequest, NextResponse } from "next/server";
import { getContentAdapter, resolveTenantDir } from "@/platform/contentAdapter";
import { requireAuth, requireGemAuth, checkResellerAccess } from "@/lib/token";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const { tenantType, tenantId, pageSlug, data } = body;

    if (!tenantType || !tenantId || !data) {
      return NextResponse.json(
        { error: "tenantType, tenantId, and data required", details: [{ path: "", message: "Missing required fields" }] },
        { status: 400 },
      );
    }

    let auth = requireAuth(request, { adminOnly: true });
    if (!auth.ok) auth = await checkResellerAccess(request, tenantId);
    if (!auth.ok && auth.response.status === 401) auth = requireGemAuth(request, rawBody);
    if (!auth.ok) return auth.response;

    const adapter   = await getContentAdapter();
    const tenantDir = resolveTenantDir(tenantType, tenantId);

    if (pageSlug && typeof pageSlug === "string") {
      await adapter.write(
        `${tenantDir}/pages/${pageSlug}.json`,
        JSON.stringify(data, null, 2),
      );
    } else {
      await adapter.write(
        `${tenantDir}/site/index.json`,
        JSON.stringify(data, null, 2),
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save content", details: [{ path: "", message: String(error) }] },
      { status: 500 },
    );
  }
}
