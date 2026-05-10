import { getAllTenants } from "@/platform/content";

export default function Home() {
  const tenants = getAllTenants();

  if (tenants.length === 0) {
    return <main className="empty-state">No tenants found.</main>;
  }

  return (
    <section className="tenant-dashboard">
      <div>
        <span>Mini Website Creator</span>
        <h1>Choose a tenant to edit in live visual mode</h1>
        <p>
          Open a tenant site for in-context editing. Use Tina sidebar to reorder
          sections, add blocks, remove blocks, and update content live.
        </p>
      </div>
      <div className="tenant-list">
        {tenants.map((tenant) => (
          <a key={tenant.tenantId} href={`/creator/${tenant.tenantType}/${tenant.tenantId}`}>
            <strong>{tenant.profile.displayName} - Open Creator Studio</strong>
            <small>
              {tenant.tenantType} · {tenant.presentation.variantPresetId}
            </small>
          </a>
        ))}
        <a href="/admin/index.html#/collections">
          <strong>Open Collection Manager</strong>
          <small>Direct JSON/document management</small>
        </a>
      </div>
    </section>
  );
}
