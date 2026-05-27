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

/** Look up a user by email, mobile, or tenantId. Returns { tenantId, cred } or null. */
async function findUserByLogin(login: string): Promise<{ tenantId: string; cred: any } | null> {
  const store = await getAuthStore();
  const creds = await store.getCredentials();

  // 1. Direct tenantId match
  if (creds[login]) return { tenantId: login, cred: creds[login] };

  // 2. Match by username field (email stored as username)
  for (const [tid, c] of Object.entries(creds)) {
    if (c.username === login) return { tenantId: tid, cred: c };
  }

  // 3. Search by email or mobile in user docs (MongoDB extended fields)
  if (store.getUser) {
    for (const [tid, c] of Object.entries(creds)) {
      const u = await store.getUser(tid);
      if (u?.email === login || u?.mobile === login) {
        return { tenantId: tid, cred: c };
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = body as Record<string, string>;
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "username and password are required" }, { status: 400 });
  }

  const login = username.trim().toLowerCase();
  const found = await findUserByLogin(login);

  const dummySalt = "00".repeat(32);
  const dummyHash = "00".repeat(64);

  if (!found) {
    verifyPassword(password, dummyHash, dummySalt);
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const { tenantId, cred } = found;

  if (!verifyPassword(password, cred.hash, cred.salt)) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const tenantType = cred.role === "admin" ? "admin" as const : (cred.tenantType ?? "doctor");
  const token = signToken({ tenantId, tenantType, username: cred.username, role: cred.role });

  let userDoc: any = null;
  const astore = await getAuthStore();
  if (astore.getUser) {
    try { userDoc = await astore.getUser(tenantId); } catch {}
  }

  let redirect = "/creator";
  if (cred.role === "reseller") redirect = "/creator";
  else if (cred.role === "user" || cred.role === "tenant") {
    redirect = `/creator/${tenantType}/${tenantId}`;
    if (userDoc?.subscription?.paymentStatus === "pending") redirect += "?pay=1";
  }

  return NextResponse.json({
    ok: true, token, tenantId, tenantType, role: cred.role, redirect,
    subscription: userDoc?.subscription ?? null,
    resellerId: userDoc?.resellerId ?? null,
    commissionPercent: userDoc?.commissionPercent ?? null,
    expiresIn: 7 * 24 * 60 * 60,
  });
}
