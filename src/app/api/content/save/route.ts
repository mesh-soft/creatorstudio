import { NextRequest, NextResponse } from "next/server";
import { getContentAdapter, resolveTenantDir } from "@/platform/contentAdapter";
import { requireAuth } from "@/lib/token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantType, tenantId, pageSlug, data } = body;

    if (!tenantType || !tenantId || !data) {
      return NextResponse.json(
        { error: "tenantType, tenantId, and data required" },
        { status: 400 },
      );
    }

    // Token must belong to this tenant (or be an admin token)
    const auth = requireAuth(request, { tenantId });
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
      { error: "Failed to save content", details: String(error) },
      { status: 500 },
    );
  }
}
