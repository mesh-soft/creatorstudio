import type { Tenant } from "@/platform/types";
import { formatValidUntil, daysUntilExpiry } from "@/lib/siteStatus";

export function MaintenancePage({ tenant }: { tenant: Tenant }) {
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
  const displayName = tenant.profile?.displayName ?? tenant.tenantId;
  const photo = tenant.profile?.photo;
  const daysLeft = daysUntilExpiry(tenant.subscription.graceUntil);
  const validUntilFormatted = formatValidUntil(tenant.subscription.validUntil);
  const graceUntilFormatted = formatValidUntil(tenant.subscription.graceUntil);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: ${bodyFont};
          background: ${colors.background};
          color: ${colors.text};
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          -webkit-font-smoothing: antialiased;
        }
        .maint-card {
          max-width: 480px;
          width: 100%;
          background: ${colors.surface};
          border-radius: 16px;
          padding: 48px 36px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 24px rgba(0,0,0,.06);
          border: 1px solid color-mix(in srgb, ${colors.primary}22, transparent);
        }
        .maint-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: color-mix(in srgb, ${colors.primary}14, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 28px;
          color: ${colors.primary};
        }
        .maint-card h1 {
          font-family: ${headingFont};
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: ${colors.text};
          margin-bottom: 12px;
        }
        .maint-card p {
          font-size: 15px;
          line-height: 1.7;
          color: color-mix(in srgb, ${colors.text} 80%, transparent);
          margin-bottom: 24px;
        }
        .maint-dates {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .maint-badge {
          padding: 10px 16px;
          border-radius: 10px;
          background: color-mix(in srgb, ${colors.primary}0A, ${colors.surface});
          border: 1px solid color-mix(in srgb, ${colors.primary}18, transparent);
          font-size: 12px;
          line-height: 1.5;
        }
        .maint-badge strong {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 2px;
        }
        .maint-badge span {
          color: color-mix(in srgb, ${colors.text} 60%, transparent);
        }
        .maint-photo {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 16px;
        }
      `}</style>
      <div className="maint-card">
        {photo && <img src={photo} alt="" className="maint-photo" />}
        {!photo && <div className="maint-icon">⏳</div>}
        <h1>{displayName}</h1>
        <p>
          This site&apos;s subscription period has ended. The website is temporarily unavailable.
          <br />
          Please contact the site owner to renew the subscription.
        </p>
        <div className="maint-dates">
          <div className="maint-badge">
            <strong>Subscribed until</strong>
            <span>{validUntilFormatted}</span>
          </div>
          <div className="maint-badge">
            <strong>Grace period ends</strong>
            <span>{graceUntilFormatted}</span>
          </div>
        </div>
        <p style={{ fontSize: "13px", opacity: 0.5, marginBottom: 0 }}>
          {daysLeft !== null && daysLeft > 0
            ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} past the grace period`
            : "Site has expired"}
        </p>
      </div>
    </>
  );
}
