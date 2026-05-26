/**
 * POST /api/auth/verify
 *
 * Public endpoint — validates a token without requiring credentials.
 * Useful for client-side session checks on page load.
 *
 * Pass the token as:  Authorization: Bearer <token>
 *
 * Returns 200 { ok: true, tenantId, username, role, exp } if valid
 * Returns 401 { ok: false, error }                         if invalid / expired
 */

import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/token";

export async function POST(req: NextRequest) {
  const raw = extractBearerToken(req);

  if (!raw) {
    return NextResponse.json(
      { ok: false, error: "Authorization header missing or not a Bearer token" },
      { status: 401 },
    );
  }

  const result = verifyToken(raw);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 401 },
    );
  }

  const { payload } = result;

  return NextResponse.json({
    ok: true,
    tenantId:  payload.tenantId,
    username:  payload.username,
    role:      payload.role,
    exp:       payload.exp,
    expiresIn: payload.exp - Math.floor(Date.now() / 1000), // seconds remaining
  });
}
