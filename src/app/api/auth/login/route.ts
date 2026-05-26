/**
 * POST /api/auth/login
 *
 * Public endpoint — no token required.
 * Accepts { tenantId, username, password } and returns a signed token.
 *
 * Credentials are read from:
 *   1. CREDENTIALS_JSON env var  (Vercel — paste the full JSON in the dashboard)
 *   2. data/credentials.json     (local dev — set via scripts/set-credentials.mjs)
 */

import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { signToken } from "@/lib/token";
const CREDENTIALS_PATH = join(process.cwd(), "data", "credentials.json");

// ── Types ────────────────────────────────────────────────────────────────────

interface Credential {
  username: string;
  hash: string;   // hex-encoded scrypt output (64 bytes)
  salt: string;   // hex-encoded random salt  (32 bytes)
  role: "tenant" | "admin";
  tenantType?: "doctor" | "hospital"; // undefined for __admin__
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function readCredentials(): Record<string, Credential> {
  // Vercel: set CREDENTIALS_JSON to the full JSON string in project env vars
  const fromEnv = process.env.CREDENTIALS_JSON;
  if (fromEnv) {
    try { return JSON.parse(fromEnv) as Record<string, Credential>; } catch {}
  }
  // Local dev: read from data/credentials.json
  try {
    return JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8")) as Record<string, Credential>;
  } catch {
    return {};
  }
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = Buffer.from(hash, "hex");
    if (derived.length !== stored.length) return false;
    return timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { tenantId, username, password } = body as Record<string, string>;

  if (!tenantId || !username || !password) {
    return NextResponse.json(
      { ok: false, error: "tenantId, username, and password are required" },
      { status: 400 },
    );
  }

  const credentials = readCredentials();
  const cred = credentials[tenantId];

  // Always run scrypt even if tenant not found — prevents timing-based enumeration
  const dummySalt = "00".repeat(32);
  const dummyHash = "00".repeat(64);

  if (!cred || cred.username !== username) {
    verifyPassword(password, dummyHash, dummySalt);
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const valid = verifyPassword(password, cred.hash, cred.salt);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  // For admin accounts tenantType is "admin"; for tenants read from the credential
  const tenantType = cred.role === "admin"
    ? ("admin" as const)
    : (cred.tenantType ?? "doctor");

  const token = signToken({ tenantId, tenantType, username, role: cred.role });

  return NextResponse.json({
    ok: true,
    token,
    tenantId,
    tenantType,
    role: cred.role,
    // Tell the client when the token expires so it can refresh proactively
    expiresIn: 7 * 24 * 60 * 60, // seconds
  });
}
