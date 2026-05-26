/**
 * Lightweight JWT-compatible HS256 token utilities.
 * Uses only Node.js built-ins — no external dependencies.
 *
 * Token format: base64url(header) . base64url(payload) . base64url(HMAC-SHA256)
 * Payload shape: { tenantId, username, role, iat, exp }
 *
 * Secret key: TOKEN_SECRET environment variable (Vercel env var, never in source).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// ── Types ────────────────────────────────────────────────────────────────────

export type TokenRole = "tenant" | "admin";

export interface TokenPayload {
  tenantId: string;
  tenantType: "doctor" | "hospital" | "admin";
  username: string;
  role: TokenRole;
  iat: number; // issued-at  (Unix seconds)
  exp: number; // expires-at (Unix seconds)
}

export interface AuthOptions {
  /** If set, token's tenantId must equal this value — unless the token has role "admin". */
  tenantId?: string;
  /** If true, only tokens with role "admin" are accepted. */
  adminOnly?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADER_B64 = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

const TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  const s = process.env.TOKEN_SECRET;
  if (!s) throw new Error("TOKEN_SECRET env var is not set");
  return s;
}

// ── Core: sign / verify ──────────────────────────────────────────────────────

export function signToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
): string {
  const now = Math.floor(Date.now() / 1000);
  const full: TokenPayload = { ...payload, iat: now, exp: now + TOKEN_TTL };
  const payloadB64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  const body = `${HEADER_B64}.${payloadB64}`;
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export type VerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; error: string };

export function verifyToken(token: string): VerifyResult {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, error: "malformed token" };

    const [header, payloadB64, sig] = parts;
    const body = `${header}.${payloadB64}`;
    const expected = createHmac("sha256", getSecret()).update(body).digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, error: "invalid signature" };
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as TokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, error: "token expired" };
    }

    return { ok: true, payload };
  } catch {
    return { ok: false, error: "invalid token" };
  }
}

// ── Extract Bearer token from Authorization header ────────────────────────────

export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const raw = auth.slice(7).trim();
  return raw || null;
}

// ── requireAuth — drop-in guard for API route handlers ───────────────────────

export type AuthResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; response: NextResponse };

export function requireAuth(req: NextRequest, options?: AuthOptions): AuthResult {
  const TOKEN_SECRET = process.env.TOKEN_SECRET;
  if (!TOKEN_SECRET) {
    // Fail closed: if secret is not configured, reject all requests
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Auth not configured (TOKEN_SECRET missing)" },
        { status: 503 },
      ),
    };
  }

  const raw = extractBearerToken(req);
  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Authorization header missing or not a Bearer token" },
        { status: 401 },
      ),
    };
  }

  const result = verifyToken(raw);
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: `Unauthorized: ${result.error}` },
        { status: 401 },
      ),
    };
  }

  const { payload } = result;

  // Admin-only routes
  if (options?.adminOnly && payload.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  // Tenant-scoped routes: token must match the requested tenantId
  // Admin tokens bypass this check (they can access any tenant)
  if (options?.tenantId && payload.role !== "admin" && payload.tenantId !== options.tenantId) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: `Access denied: token is not authorised for tenant "${options.tenantId}"` },
        { status: 403 },
      ),
    };
  }

  return { ok: true, payload };
}
