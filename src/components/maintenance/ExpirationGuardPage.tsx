import { buildExpirationScript } from "@/lib/siteStatus";
import { getExpiredMaintenanceHtml } from "./getMaintenanceHtml";
import type { Tenant } from "@/platform/types";

/**
 * Renders a page that self-checks subscription expiry on every browser load.
 * No rebuild needed — the inline script runs before paint and shows maintenance
 * content if the site has expired.
 */
export function ExpirationGuardPage({ tenant, children }: { tenant: Tenant; children: React.ReactNode }) {
  const expiredContent = getExpiredMaintenanceHtml(tenant);
  const script = buildExpirationScript(
    tenant.subscription.validUntil,
    tenant.subscription.graceUntil
  );

  return (
    <>
      {/* Inline script blocks render: if expired, replaces page. If valid, does nothing. */}
      <script dangerouslySetInnerHTML={script} />

      {/* Normal site content — shown when subscription is active */}
      <div id="__site-normal">{children}</div>

      {/* Maintenance content — shown when subscription expired. Hidden by default,
          revealed by the inline script if the date check fails. */}
      <div id="__site-expired" style={{ display: "none" }}>
        <div
          dangerouslySetInnerHTML={{
            __html: expiredContent,
          }}
        />
      </div>
    </>
  );
}
