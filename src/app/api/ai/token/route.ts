import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";
import { signToken } from "@/lib/token";

const GEM_TOKEN_TTL = 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const { payload } = auth;

  // Generate a short-lived token with the same scope as the requesting user
  const token = signToken({
    tenantId: payload.tenantId,
    tenantType: payload.tenantType,
    username: payload.username,
    role: payload.role,
  });

  // Override expiry to be short-lived (1 hour)
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify({
    tenantId: payload.tenantId,
    tenantType: payload.tenantType,
    username: payload.username,
    role: payload.role,
    iat: now,
    exp: now + GEM_TOKEN_TTL,
  })).toString("base64url");
  const body = `${header}.${payloadB64}`;
  const secret = process.env.TOKEN_SECRET || "";
  const sig = require("node:crypto").createHmac("sha256", secret).update(body).digest("base64url");
  const shortLivedToken = `${body}.${sig}`;

  return NextResponse.json({
    ok: true,
    token: shortLivedToken,
    expiresIn: GEM_TOKEN_TTL,
    expiresAt: new Date((now + GEM_TOKEN_TTL) * 1000).toISOString(),
    note: "Copy this token and paste it into the Gemini Gem. It grants the Gem access to edit ONLY your sites.",
  });
}
