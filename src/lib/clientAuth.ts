/**
 * Client-side auth helpers.
 * These run in the browser — NO secret access, no signature verification.
 * They only read/write localStorage and decode (not verify) the JWT payload.
 */

const STORAGE_KEY = "ds_auth_token";

// ── Token storage ─────────────────────────────────────────────────────────────

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
    // Also set as cookie for middleware access (server-side auth check)
    const payload = parseTokenPayload(token);
    const maxAge = payload ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000)) : 86400;
    document.cookie = `${STORAGE_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {}
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
  } catch {}
}

export function getStoredToken(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

// ── Decode payload (NO signature check — server does that) ────────────────────

export interface ClientTokenPayload {
  tenantId: string;
  tenantType: "doctor" | "hospital" | "admin";
  username: string;
  role: "tenant" | "admin";
  iat: number;
  exp: number;
}

export function parseTokenPayload(token: string): ClientTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as ClientTokenPayload;
  } catch {
    return null;
  }
}

/** Returns the stored payload if the token exists and has not expired. */
export function getActiveSession(): ClientTokenPayload | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = parseTokenPayload(token);
  if (!payload) return null;
  // Add a 60-second buffer so we don't use a token that's about to expire
  if (payload.exp < Math.floor(Date.now() / 1000) + 60) {
    clearStoredToken();
    return null;
  }
  return payload;
}

// ── Auth headers ──────────────────────────────────────────────────────────────

/** Returns { Authorization: "Bearer <token>" } or {} if not logged in. */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
