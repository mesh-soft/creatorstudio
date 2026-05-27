import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";
import { getAuthStore } from "@/lib/authStore";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = requireAuth(req, { tenantId });
  if (!auth.ok) return auth.response;

  const store = await getAuthStore();
  if (!store.getUser) {
    return NextResponse.json({ error: "MongoDB backend required" }, { status: 503 });
  }

  const user = await store.getUser(tenantId);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    tenantId: user._id,
    resellerId: user.resellerId,
    resellerCanEdit: user.resellerCanEdit,
    subscription: user.subscription,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = requireAuth(req, { tenantId });
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const store = await getAuthStore();

  if (!store.updateUser) {
    return NextResponse.json({ error: "MongoDB backend required" }, { status: 503 });
  }

  // Only allow updating resellerCanEdit (tenant controlling reseller access)
  const allowedKeys = ["resellerCanEdit", "commissionPercent"];
  const updates: any = {};
  for (const key of allowedKeys) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await store.updateUser(tenantId, updates);
  return NextResponse.json({ ok: true, updated: updates });
}
