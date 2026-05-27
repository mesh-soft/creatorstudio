import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAllowExpired, signToken, extractBearerToken } from "@/lib/token";

const REFRESH_TTL = 60 * 60; // 1 hour

/**
 * POST /api/auth/refresh
 * Body: { token?: string } or Authorization: Bearer <token> header
 *
 * Accepts an expired (but validly signed) JWT and returns a fresh one
 * with the same user scope. This lets the Gemini Gem self-renew its token
 * without going back to the user.
 *
 * The old token must be signed by our TOKEN_SECRET. Signature is verified
 * even if the token has expired.
 */
export async function POST(req: NextRequest) {
  let token: string | null = null;

  // Try header first
  token = extractBearerToken(req);

  // Try body fallback
  if (!token) {
    try {
      const body = await req.json();
      token = body.token ?? null;
    } catch {}
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: "No token provided. Send via Authorization header or { token } body." }, { status: 400 });
  }

  const result = verifyTokenAllowExpired(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: `Invalid token: ${result.error}` }, { status: 401 });
  }

  const { payload } = result;

  // Generate fresh token with same scope
  const freshToken = signToken({
    tenantId: payload.tenantId,
    tenantType: payload.tenantType,
    username: payload.username,
    role: payload.role,
  });

  const now = Math.floor(Date.now() / 1000);

  return NextResponse.json({
    ok: true,
    token: freshToken,
    expiresIn: REFRESH_TTL,
    expiresAt: new Date((now + REFRESH_TTL) * 1000).toISOString(),
    tenantId: payload.tenantId,
    role: payload.role,
  });
}
