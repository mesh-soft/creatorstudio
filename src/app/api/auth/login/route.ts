import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { signToken } from "@/lib/token";
import { getAuthStore } from "@/lib/authStore";

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = Buffer.from(hash, "hex");
    if (derived.length !== stored.length) return false;
    return timingSafeEqual(derived, stored);
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { tenantId, username, password } = body as Record<string, string>;
  if (!tenantId || !username || !password) {
    return NextResponse.json({ ok: false, error: "tenantId, username, and password are required" }, { status: 400 });
  }

  const store = await getAuthStore();
  const credentials = await store.getCredentials();
  const cred = credentials[tenantId];

  const dummySalt = "00".repeat(32);
  const dummyHash = "00".repeat(64);

  if (!cred || cred.username !== username) {
    verifyPassword(password, dummyHash, dummySalt);
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  if (!verifyPassword(password, cred.hash, cred.salt)) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const tenantType = cred.role === "admin" ? "admin" as const : (cred.tenantType ?? "doctor");
  const token = signToken({ tenantId, tenantType, username, role: cred.role });

  // Fetch full user doc for subscription/reseller info (MongoDB only)
  let userDoc: any = null;
  if (store.getUser) {
    try { userDoc = await store.getUser(tenantId); } catch {}
  }

  let redirect = "/creator";
  if (cred.role === "reseller") redirect = "/reseller";
  else if (cred.role === "user" || cred.role === "tenant") {
    redirect = `/site/${tenantId}/home`;
    if (userDoc?.subscription?.paymentStatus === "pending") {
      redirect += "?pay=1";
    }
  } else if (cred.role === "admin") {
    redirect = "/creator";
  }

  return NextResponse.json({
    ok: true,
    token,
    tenantId,
    tenantType,
    role: cred.role,
    redirect,
    subscription: userDoc?.subscription ?? null,
    resellerId: userDoc?.resellerId ?? null,
    commissionPercent: userDoc?.commissionPercent ?? null,
    expiresIn: 7 * 24 * 60 * 60,
  });
}
