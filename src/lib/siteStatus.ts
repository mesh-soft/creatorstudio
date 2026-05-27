/** Build-time subscription check. Returns true if the site has exceeded its grace period. */
export function isSiteExpired(validUntil?: string, graceUntil?: string): boolean {
  if (!validUntil) return false;
  const cutoff = graceUntil ? new Date(graceUntil) : addDays(new Date(validUntil), 10);
  return Date.now() > cutoff.getTime();
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatValidUntil(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function daysUntilExpiry(graceUntil?: string): number | null {
  if (!graceUntil) return null;
  const ms = new Date(graceUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Builds an inline `<script>` that toggles visibility based on subscription expiry.
 * Runs synchronously before page paint — no flash of expired content.
 */
export function buildExpirationScript(validUntil: string, graceUntil: string | undefined): { __html: string } {
  const cutoff = graceUntil
    ? `new Date("${graceUntil}").getTime()`
    : `new Date("${validUntil}").getTime() + 10*24*60*60*1000`;

  return {
    __html: `(function(){var t=${cutoff},e=document.getElementById("__site-expired"),n=document.getElementById("__site-normal");if(!e||!n)return;if(Date.now()>t){e.style.display="";n.style.display="none"}else{e.style.display="none";n.style.display=""}})();`,
  };
}
