import { NextRequest, NextResponse } from "next/server";

const COOKIE_KEY = "ds_auth_token";
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/verify"];

/**
 * Decode base64url (no padding, URL-safe chars) — works in Edge runtime.
 * Only decodes the payload; does NOT verify the signature.
 * Signature verification happens server-side in API routes via `verifyToken()`.
 */
function decodePayload(token: string): { exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes — they have their own requireAuth checks
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon") || pathname.startsWith("/content/")) {
    return NextResponse.next();
  }

  // Protect /site/*, /creator/*, and /reseller/* routes
  if (pathname.startsWith("/site/") || pathname.startsWith("/creator") || pathname.startsWith("/reseller")) {
    const token = request.cookies.get(COOKIE_KEY)?.value;

    if (!token) {
      return redirectToLogin(request, pathname);
    }

    const payload = decodePayload(token);
    if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return redirectToLogin(request, pathname);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(COOKIE_KEY);
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest).*)",
  ],
};
