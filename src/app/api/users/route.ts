import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";
import { getAuthStore } from "@/lib/authStore";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const store = await getAuthStore();
  if (!store.listUsers) {
    return NextResponse.json({ users: [], total: 0, page: 1, limit: 10, totalPages: 0 });
  }

  const q = req.nextUrl.searchParams;
  const page   = Math.max(1, Number(q.get("page") ?? "1"));
  const limit  = Math.min(100, Math.max(1, Number(q.get("limit") ?? "10")));
  const search = (q.get("search") ?? "").toLowerCase().trim();
  const role   = q.get("role") ?? undefined;
  const resellerId = q.get("resellerId") ?? undefined;
  const typeFilter = q.get("type") ?? "";

  // Build filter for MongoDB
  const filter: any = {};
  if (role) filter.role = role;
  if (resellerId) filter.resellerId = resellerId;
  if (typeFilter && typeFilter !== "all") filter.tenantType = typeFilter;

  // Search across multiple fields using $or
  if (search) {
    filter.$or = [
      { _id: { $regex: search, $options: "i" } },
      { displayName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await store.listUsers(filter as any);

  // Additional post-filter for specialty and clinic name (not indexed)
  let filtered = users;
  if (search) {
    filtered = users.filter(u => {
      const specialty = (u as any).specialty ?? "";
      const displayName = (u as any).displayName ?? "";
      return displayName.toLowerCase().includes(search) ||
             (u._id ?? "").toLowerCase().includes(search) ||
             (u.email ?? "").toLowerCase().includes(search) ||
             specialty.toLowerCase().includes(search);
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paged = filtered.slice(offset, offset + limit);

  const result = paged.map(u => ({
    tenantId: u._id,
    username: u.username,
    role: u.role,
    tenantType: u.tenantType,
    displayName: (u as any).displayName,
    email: (u as any).email,
    mobile: (u as any).mobile,
    resellerId: u.resellerId,
    resellerCanEdit: u.resellerCanEdit,
    commissionPercent: u.commissionPercent,
    subscription: u.subscription,
    specialty: (u as any).specialty,
    photo: (u as any).photo,
  }));

  return NextResponse.json({ users: result, total, page, limit, totalPages });
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
    await store.updateUser(tenantId, { resellerId, commissionPercent, resellerCanEdit: true } as any);
  }

  return NextResponse.json({ ok: true, tenantId });
}
