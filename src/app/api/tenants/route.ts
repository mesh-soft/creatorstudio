import { NextRequest, NextResponse } from "next/server";
import { getAllTenants } from "@/platform/content";
import { requireAuth, requireGemAuth } from "@/lib/token";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let auth = requireAuth(request, { adminOnly: true });
  if (!auth.ok && auth.response.status === 401) auth = requireGemAuth(request, "");
  if (!auth.ok) return auth.response;

  const q = request.nextUrl.searchParams;
  const page   = Math.max(1, Number(q.get("page") ?? "1"));
  const limit  = Math.min(100, Math.max(1, Number(q.get("limit") ?? "10")));
  const search = (q.get("search") ?? "").toLowerCase().trim();
  const typeFilter = q.get("type") ?? "";

  try {
    let tenants = await getAllTenants();

    let raw = tenants.map(t => ({
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

    if (typeFilter && typeFilter !== "all") {
      raw = raw.filter(t => t.tenantType === typeFilter);
    }
    if (search) {
      raw = raw.filter(t =>
        t.tenantId.toLowerCase().includes(search) ||
        (t.profile?.displayName ?? "").toLowerCase().includes(search) ||
        (t.business?.clinicName ?? "").toLowerCase().includes(search) ||
        (t.profile?.specialty ?? "").toLowerCase().includes(search)
      );
    }

    const total = raw.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = raw.slice(offset, offset + limit);

    return NextResponse.json({ tenants: paged, total, page, limit, totalPages });
  } catch (e) {
    return NextResponse.json({ error: "Failed to list tenants", details: [{ path: "", message: String(e) }] }, { status: 500 });
  }
}
