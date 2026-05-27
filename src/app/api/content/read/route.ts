import { NextRequest, NextResponse } from "next/server";
import { getContentAdapter, resolveTenantDir } from "@/platform/contentAdapter";
import { requireAuth, requireGemAuth, checkResellerAccess } from "@/lib/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantType = searchParams.get("tenantType") as "doctor" | "hospital";
  const tenantId   = searchParams.get("tenantId");
  const pageSlug   = searchParams.get("pageSlug");

  if (!tenantType || !tenantId) {
    return NextResponse.json(
      { error: "tenantType and tenantId required", details: [{ path: "", message: "Missing query parameters" }] },
      { status: 400 },
    );
  }

  let auth = requireAuth(request, { tenantId });
  if (!auth.ok) auth = await checkResellerAccess(request, tenantId);
  if (!auth.ok && auth.response.status === 401) auth = requireGemAuth(request, "");
  if (!auth.ok) return auth.response;

  const adapter    = await getContentAdapter();
  const tenantDir  = resolveTenantDir(tenantType, tenantId);
  const siteFile   = `${tenantDir}/site/index.json`;

  try {
    const siteRaw = await adapter.read(siteFile);
    const site    = JSON.parse(siteRaw);

    if (pageSlug) {
      const pageFile = `${tenantDir}/pages/${pageSlug}.json`;
      const pageRaw  = await adapter.read(pageFile);
      const page     = JSON.parse(pageRaw);
      return NextResponse.json({ site, page });
    }

    return NextResponse.json({ site });
  } catch {
    return NextResponse.json({ error: "Content not found", details: [{ path: "", message: "Tenant or page does not exist" }] }, { status: 404 });
  }
}
