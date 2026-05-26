"use client";

import { useState, useEffect, useCallback } from "react";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { getAuthHeaders, clearStoredToken } from "@/lib/clientAuth";

type CreatorStudioClientProps = {
  tenantType: "doctor" | "hospital";
  tenantId: string;
  pageSlug: string;
  pages: string[];
};

export function CreatorStudioClient({
  tenantType, tenantId, pageSlug, pages,
}: CreatorStudioClientProps) {
  const [selectedPageSlug, setSelectedPageSlug] = useState(pageSlug);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Snapshot preview state — when set, BlockEditor shows the snapshot in the preview panel
  const [snapshotPage,      setSnapshotPage]      = useState<object | null>(null);
  const [snapshotLabel,     setSnapshotLabel]     = useState<string>("");
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string>("");

  const handlePageChange = useCallback((slug: string) => {
    setSelectedPageSlug(slug);
    setSnapshotPage(null);
    const col = tenantType === "doctor" ? "doctorSite" : "hospitalSite";
    window.history.pushState(null, "", `/creator/collections/${col}/~/${tenantId}/pages/${slug}`);
  }, [tenantType, tenantId]);

  const handleViewSnapshot = useCallback(async (timestamp: string, label: string) => {
    try {
      const res = await fetch(
        `/api/content/snapshot?tenantType=${tenantType}&tenantSlug=${tenantId}&pageSlug=${selectedPageSlug}&timestamp=${encodeURIComponent(timestamp)}`,
        { headers: getAuthHeaders() },
      );
      if (res.status === 401 || res.status === 403) { clearStoredToken(); window.location.replace("/login"); return; }
      const data = await res.json();
      if (data.ok && data.content) {
        setSnapshotPage(data.content);
        setSnapshotLabel(label);
        setSnapshotTimestamp(timestamp);
      } else {
        alert("Could not load snapshot: " + (data.message ?? "unknown error"));
      }
    } catch {
      alert("Network error loading snapshot");
    }
  }, [tenantType, tenantId, selectedPageSlug]);

  const handleRestoreSnapshot = useCallback(async (timestamp: string) => {
    try {
      const res = await fetch("/api/content/snapshot", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          tenantType,
          tenantSlug: tenantId,
          pageSlug: selectedPageSlug,
          timestamp,
        }),
      });
      if (res.status === 401 || res.status === 403) { clearStoredToken(); window.location.replace("/login"); return; }
      const data = await res.json();
      if (data.ok) {
        // Clear snapshot view and close history panel — live page is now restored
        setSnapshotPage(null);
        setSnapshotLabel("");
        setSnapshotTimestamp("");
        setHistoryOpen(false);
      } else {
        alert("Restore failed: " + (data.message ?? "unknown error"));
      }
    } catch {
      alert("Network error during restore");
    }
  }, [tenantType, tenantId, selectedPageSlug]);

  return (
    <>
      <BlockEditor
        tenantType={tenantType}
        tenantId={tenantId}
        pageSlug={selectedPageSlug}
        pages={pages}
        onPageChange={handlePageChange}
        onOpenHistory={() => setHistoryOpen(true)}
        snapshotPage={snapshotPage}
        snapshotLabel={snapshotLabel}
        snapshotTimestamp={snapshotTimestamp}
        onClearSnapshot={() => { setSnapshotPage(null); setSnapshotLabel(""); setSnapshotTimestamp(""); }}
        onRestoreSnapshot={handleRestoreSnapshot}
      />

      {historyOpen && (
        <VersionHistoryPanel
          tenantType={tenantType}
          tenantId={tenantId}
          pageSlug={selectedPageSlug}
          onClose={() => setHistoryOpen(false)}
          onRestored={() => { setHistoryOpen(false); setSnapshotPage(null); }}
          onView={handleViewSnapshot}
        />
      )}
    </>
  );
}

// ── Version History Panel ──────────────────────────────────────────────────
type SnapshotEntry = {
  timestamp: string;
  pageSlug: string;
  checksum: string;
  file: string;
};

function VersionHistoryPanel({
  tenantType, tenantId, pageSlug, onClose, onRestored, onView,
}: {
  tenantType: "doctor" | "hospital";
  tenantId: string;
  pageSlug: string;
  onClose: () => void;
  onRestored: () => void;
  onView: (timestamp: string, label: string) => void;
}) {
  const [entries, setEntries] = useState<SnapshotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [viewing,   setViewing]   = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    fetch(`/api/content/snapshot?tenantType=${tenantType}&tenantSlug=${tenantId}&pageSlug=${pageSlug}`, {
      headers: getAuthHeaders(),
    }).then(r => {
        if (r.status === 401 || r.status === 403) { clearStoredToken(); window.location.replace("/login"); return Promise.reject(); }
        return r.json();
      })
      .then(data => {
        if (data?.ok) setEntries(data.entries);
        else setError(data?.message ?? "Failed to load history");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [tenantType, tenantId, pageSlug]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor-theme");
      if (saved !== null) setIsDark(saved === "dark");
    } catch {}
  }, []);

  const handleView = async (entry: SnapshotEntry) => {
    setViewing(entry.timestamp);
    try {
      await onView(entry.timestamp, formatTimestamp(entry.timestamp));
    } finally {
      setViewing(null);
    }
  };

  const T = isDark ? {
    bg:      "#161b22",
    surface: "#1c2333",
    border:  "#21262d",
    borderMd:"#30363d",
    text:    "#e6edf3",
    textSub: "#8b949e",
    textMute:"#6e7681",
    accent:  "#79589f",
    green:   "#59437a",
    red:     "#f85149",
    input:   "#0d1117",
  } : {
    bg:      "#F5F6F7",
    surface: "#FFFFFF",
    border:  "#E4E7EB",
    borderMd:"#C8CBD0",
    text:    "#1F2531",
    textSub: "#68737A",
    textMute:"#A0ADB8",
    accent:  "#6B3FA0",
    green:   "#10b981",
    red:     "#f87171",
    input:   "#FFFFFF",
  };

  return (
    <div style={{
      position:"fixed", top:0, right:0, bottom:0, width:320,
      background:T.bg, borderLeft:`1px solid ${T.borderMd}`,
      zIndex:1000, display:"flex", flexDirection:"column",
      color:T.text, fontFamily:"'Inter',system-ui,sans-serif",
      boxShadow:"-8px 0 32px rgba(0,0,0,.5)",
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:`1px solid ${T.border}`, background:T.surface }}>
        <strong style={{ fontSize:13 }}>Version History</strong>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMute, cursor:"pointer", fontSize:18, lineHeight:1, padding:"2px 6px" }}>✕</button>
      </div>
      <div style={{ padding:"6px 12px 4px", borderBottom:`1px solid ${T.border}`, background:T.surface }}>
        <p style={{ margin:0, fontSize:11, color:T.textMute }}>Page: <strong style={{ color:T.textSub }}>{pageSlug}</strong></p>
      </div>

      {/* List */}
      <div style={{ flex:1, overflow:"auto", padding:8 }}>
        {loading && <p style={{ padding:16, color:T.textMute, fontSize:12 }}>Loading…</p>}
        {error   && <p style={{ padding:16, color:T.red, fontSize:12 }}>{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p style={{ padding:16, color:T.textMute, fontSize:12 }}>No snapshots yet for this page.</p>
        )}
        {entries.map(entry => (
          <div key={entry.timestamp} style={{
            padding:"10px 12px", borderRadius:8, marginBottom:4,
            background:T.surface, border:`1px solid ${T.border}`, fontSize:12,
          }}>
            <div style={{ fontWeight:600, fontSize:12, marginBottom:3 }}>{formatTimestamp(entry.timestamp)}</div>
            <div style={{ color:T.textMute, marginBottom:8, fontSize:11, fontFamily:"'SF Mono',monospace" }}>
              sha: {entry.checksum.slice(0,8)}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button
                onClick={() => handleView(entry)}
                disabled={!!viewing}
                style={{
                  flex:1, padding:"5px 8px",
                  background: viewing===entry.timestamp ? T.borderMd : `${T.accent}20`,
                  color: viewing===entry.timestamp ? T.textMute : T.accent,
                  border:`1px solid ${T.accent}40`, borderRadius:5,
                  fontSize:11, cursor:"pointer", fontWeight:600, fontFamily:"inherit",
                  transition:"all .15s",
                }}
                onMouseEnter={e=>{if(!viewing)(e.currentTarget as HTMLButtonElement).style.background=`${T.accent}35`;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=viewing===entry.timestamp?T.borderMd:`${T.accent}20`;}}
              >
                {viewing===entry.timestamp ? "…" : "👁 View"}
              </button>
              <button
                onClick={() => restore(entry.timestamp)}
                disabled={restoring === entry.timestamp}
                style={{
                  flex:1, padding:"5px 8px",
                  background: restoring===entry.timestamp ? T.borderMd : "#7c3aed",
                  color:"white", border:"none", borderRadius:5,
                  fontSize:11, cursor:"pointer", fontWeight:600, fontFamily:"inherit",
                  transition:"background .15s",
                }}
              >
                {restoring===entry.timestamp ? "…" : "Restore"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts.replace(/-(\d{2})-(\d{2})-(\d{3})Z$/, ":$1:$2.$3Z")).toLocaleString();
  } catch {
    return ts;
  }
}
