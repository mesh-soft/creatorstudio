import type { Tenant } from "@/platform/types";
import { formatValidUntil, daysUntilExpiry } from "@/lib/siteStatus";

/**
 * Returns a plain HTML string for the maintenance card.
 * No React, no client JS — static HTML injected via innerHTML.
 * Styled with the tenant's theme colors and fonts.
 */
export function getExpiredMaintenanceHtml(tenant: Tenant): string {
  const colors = tenant.presentation?.style?.colors ?? {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
  };
  const headingFont = tenant.presentation?.style?.typography?.heading ?? "Inter, system-ui, sans-serif";
  const bodyFont = tenant.presentation?.style?.typography?.body ?? "Inter, system-ui, sans-serif";
  const displayName = escapeHtml(tenant.profile?.displayName ?? tenant.tenantId);
  const photo = tenant.profile?.photo ? escapeHtml(tenant.profile.photo) : "";
  const daysLeft = daysUntilExpiry(tenant.subscription.graceUntil);
  const validUntilFormatted = formatValidUntil(tenant.subscription.validUntil);
  const graceUntilFormatted = formatValidUntil(tenant.subscription.graceUntil ?? "");
  const primary = escapeHtml(colors.primary);
  const surface = escapeHtml(colors.surface);
  const text = escapeHtml(colors.text);
  const c = (v: string) => escapeHtml(v);

  const photoHtml = photo
    ? `<img src="${c(photo)}" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin-bottom:16px" />`
    : `<div style="width:64px;height:64px;border-radius:50%;background:color-mix(in srgb,${primary}14,transparent);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:28px;color:${primary}">⏳</div>`;

  const daysMsg =
    daysLeft !== null && daysLeft > 0
      ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} past the grace period`
      : "Site has expired";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Site Expired — ${c(displayName)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:${c(bodyFont)};
  background:${c(colors.background)};
  color:${text};
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  -webkit-font-smoothing:antialiased;
}
.card{
  max-width:480px;
  width:100%;
  background:${surface};
  border-radius:16px;
  padding:48px 36px;
  text-align:center;
  box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 24px rgba(0,0,0,.06);
  border:1px solid color-mix(in srgb,${primary}22,transparent);
}
h1{font-family:${c(headingFont)};font-size:24px;font-weight:800;letter-spacing:-0.02em;color:${text};margin-bottom:12px}
p{font-size:15px;line-height:1.7;color:color-mix(in srgb,${text}80%,transparent);margin-bottom:24px}
.dates{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:28px}
.badge{padding:10px 16px;border-radius:10px;background:color-mix(in srgb,${primary}0A,${surface});border:1px solid color-mix(in srgb,${primary}18,transparent);font-size:12px;line-height:1.5}
.badge strong{display:block;font-size:13px;font-weight:700;color:${primary};margin-bottom:2px}
.badge span{color:color-mix(in srgb,${text}60%,transparent)}
</style>
</head>
<body>
<div class="card">
${photoHtml}
<h1>${c(displayName)}</h1>
<p>This site's subscription period has ended. The website is temporarily unavailable.<br/>Please contact the site owner to renew the subscription.</p>
<div class="dates">
<div class="badge"><strong>Subscribed until</strong><span>${c(validUntilFormatted)}</span></div>
<div class="badge"><strong>Grace period ends</strong><span>${c(graceUntilFormatted)}</span></div>
</div>
<p style="font-size:13px;opacity:.5;margin-bottom:0">${daysMsg}</p>
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
