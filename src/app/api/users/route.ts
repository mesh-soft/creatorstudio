import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";
import { getAuthStore } from "@/lib/authStore";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const role = req.nextUrl.searchParams.get("role") ?? undefined;
  const resellerId = req.nextUrl.searchParams.get("resellerId") ?? undefined;

  const store = await getAuthStore();
  if (!store.listUsers) {
    return NextResponse.json({ error: "MongoDB backend required" }, { status: 503 });
  }

  const users = await store.listUsers({ role, resellerId });
  return NextResponse.json(users.map(u => ({
    tenantId: u._id,
    username: u.username,
    role: u.role,
    tenantType: u.tenantType,
    resellerId: u.resellerId,
    resellerCanEdit: u.resellerCanEdit,
    commissionPercent: u.commissionPercent,
    subscription: u.subscription,
  })));
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, { adminOnly: true });
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { tenantId, username, password, role, tenantType, resellerId, commissionPercent } = body;
  if (!tenantId || !username || !password || !role) {
    return NextResponse.json({ error: "tenantId, username, password, role required" }, { status: 400 });
  }

  const store = await getAuthStore();
  const { scryptSync, randomBytes } = await import("node:crypto");
  const salt = randomBytes(32).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

  await store.setCredential(tenantId, { username, hash, salt, role, tenantType });
  if (store.updateUser && (resellerId || commissionPercent !== undefined)) {
    await store.updateUser(tenantId, {
      resellerId,
      commissionPercent,
      resellerCanEdit: true,
    } as any);
  }

  return NextResponse.json({ ok: true, tenantId });
}
