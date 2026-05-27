import { NextRequest, NextResponse } from "next/server";
import { getAllTenants } from "@/platform/content";
import { requireAuth, requireGemAuth } from "@/lib/token";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let auth = requireAuth(request, { adminOnly: true });
  if (!auth.ok) auth = requireGemAuth(request, "");
  if (!auth.ok) return auth.response;

  try {
    const tenants = await getAllTenants();
    const meta = tenants.map(t => ({
      tenantId:   t.tenantId,
      tenantType: t.tenantType,
      status:     t.status,
      profile: t.profile ? {
        displayName: t.profile.displayName,
        specialty:   (t.profile as any).specialty,
        photo:       t.profile.photo,
      } : undefined,
      business: t.business ? {
        clinicName: (t.business as any).clinicName,
        phone:      t.business.phone,
      } : undefined,
      seo: t.seo ? { description: t.seo.description } : undefined,
    }));
    return NextResponse.json(meta);
  } catch (e) {
    return NextResponse.json({ error: "Failed to list tenants", details: [{ path: "", message: String(e) }] }, { status: 500 });
  }
}
