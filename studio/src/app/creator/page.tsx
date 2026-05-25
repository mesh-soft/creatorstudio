"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Shared icons (mirrors CreatorStudioClient) ───────────────────────────────
const MediaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0.5" y="0.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="4.5" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M0.5 9.5L4 6L6.5 8.5L9.5 5.5L13.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

/**
 * Extract tenantId from a TinaCMS admin hash.
 * Returns `{ collection, tenantId }` when a specific tenant is being navigated
 * to, or `null` when just browsing the collection list.
 *
 * Handled formats:
 *   #/collections/edit/<col>/<tenantId>          ← direct edit link
 *   #/collections/<col>/~/<tenantId>             ← tilde format
 */
function parseTenantFromHash(hash: string): { collection: string; tenantId: string } | null {
  const inner = hash.replace(/^#\/?/, "");

  // edit-format: collections/edit/<col>/<tenantId>
  const editM = inner.match(/^collections\/edit\/([^/]+)\/([^/?#]+)/);
  if (editM?.[2] && editM[2] !== "pages") {
    return { collection: editM[1], tenantId: editM[2] };
  }

  // tilde-format: collections/<col>/~/<tenantId>
  const tildeM = inner.match(/^collections\/([^/]+)\/~\/([^/?#]+)/);
  if (tildeM?.[2]) {
    return { collection: tildeM[1], tenantId: tildeM[2] };
  }

  return null;
}

const COLLECTION_TO_TENANT_TYPE: Record<string, string> = {
  doctorSite: "doctor",
  hospitalSite: "hospital",
};

export default function CreatorHomePage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "tina:route-change") return;
      const hash: string = event.data.hash ?? "";

      const parsed = parseTenantFromHash(hash);
      if (!parsed) return;

      const { collection, tenantId } = parsed;
      // Only redirect when a specific tenant is chosen (not the bare collection list)
      // The bare list hash is: #/collections/doctorSite  (no tenantId segment)
      if (!tenantId || tenantId === collection) return;

      router.push(`/creator/collections/${collection}/~/${tenantId}`);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "0 16px",
          height: "44px",
          flexShrink: 0,
          borderBottom: "1px solid #1e293b",
          color: "#e2e8f0",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <strong style={{ fontSize: "14px" }}>Creator Studio</strong>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href="/creator/create-tenant"
            style={{
              padding: "6px 12px",
              background: "#2296F3",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            + Create New Tenant
          </a>

          <a
            href="/admin/index.html#/media"
            target="_blank"
            title="Media manager"
            style={{
              padding: "6px 10px",
              background: "#10b981",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <MediaIcon /> Media
          </a>
        </div>
      </header>

      <iframe
        ref={iframeRef}
        title="Tina CMS"
        src="/admin/index.html#/collections/doctorSite/~"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          display: "block",
        }}
      />
    </main>
  );
}
