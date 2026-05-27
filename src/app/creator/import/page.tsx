"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/clientAuth";
import { validateSiteJson, validatePageJson, type ValidationError } from "@/lib/importValidator";
import { auditImages, filenameFromPath, type ImageScanResult } from "@/lib/imageScanner";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  shell:       "#0c0a14",
  surface:     "#1a172b",
  surface2:    "#211d33",
  input:       "#0e0c1a",
  border:      "#2d2748",
  borderMd:    "#3d3660",
  borderFocus: "#8b5cf6",
  text:        "#ede9f8",
  textSub:     "#9488bc",
  textMute:    "#5a5080",
  accent:      "#8b5cf6",
  green:       "#10b981",
  greenBg:     "rgba(16,185,129,.1)",
  red:         "#f87171",
  redBg:       "rgba(248,113,113,.08)",
  amber:       "#f59e0b",
  amberBg:     "rgba(245,158,11,.08)",
  shadow:      "0 1px 4px rgba(0,0,0,.7),0 0 0 1px rgba(100,80,255,.08)",
};

type Tab = "tenant" | "page";

interface TenantMeta {
  tenantId: string;
  tenantType: "doctor" | "hospital";
  profile?: { displayName?: string };
}

// ── JSON parsing helpers ──────────────────────────────────────────────────────

function tryParse(raw: string): { value: Record<string, unknown> } | { error: string } {
  if (!raw.trim()) return { error: "" };
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object" || Array.isArray(v)) return { error: "Must be a JSON object { … }" };
    return { value: v as Record<string, unknown> };
  } catch (ex) {
    return { error: (ex as Error).message };
  }
}

function parsedOrNull(raw: string): Record<string, unknown> | null {
  const r = tryParse(raw);
  return "value" in r ? r.value : null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ValidationPanel({ errors, source }: { errors: ValidationError[]; source: string }) {
  if (errors.length === 0) return null;
  return (
    <div style={{ background: T.redBg, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>
        {source} — {errors.length} validation error{errors.length > 1 ? "s" : ""}
      </div>
      {errors.map((er, i) => (
        <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: T.red, marginBottom: 3 }}>
          <code style={{ opacity: 0.65, flexShrink: 0 }}>{er.path}</code>
          <span>{er.message}</span>
        </div>
      ))}
    </div>
  );
}

function JsonArea({
  label, value, onChange, hint, rows = 14,
  parseError, validationErrors, preview,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  parseError?: string;
  validationErrors?: ValidationError[];
  preview?: React.ReactNode;
}) {
  const isEmpty  = !value.trim();
  const hasParseErr = !!parseError;
  const hasValidErr = !!validationErrors?.length;
  const isValid  = !isEmpty && !hasParseErr && !hasValidErr;

  const borderColor = hasParseErr || hasValidErr ? T.red : isValid ? T.green : T.borderMd;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".6px" }}>
          {label}
        </label>
        {isValid && <span style={{ fontSize: 11, color: T.green }}>✓ Valid JSON</span>}
        {hasParseErr && <span style={{ fontSize: 11, color: T.red, maxWidth: 300, textAlign: "right" }}>✗ {parseError}</span>}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 8,
          border: `1px solid ${borderColor}`,
          background: T.input, color: T.text, fontSize: 12,
          fontFamily: "'SF Mono','Fira Code',monospace", outline: "none",
          boxSizing: "border-box", resize: "vertical", lineHeight: 1.6,
          transition: "border-color .15s",
        }}
        onFocus={e => { if (!hasParseErr && !isValid) e.target.style.borderColor = T.borderFocus; }}
        onBlur={e => { if (!hasParseErr && !isValid) e.target.style.borderColor = T.borderMd; }}
        placeholder='{ "paste": "JSON here" }'
      />
      {hint && <p style={{ margin: 0, fontSize: 11, color: T.textMute }}>{hint}</p>}
      {preview}
      {hasValidErr && <ValidationPanel errors={validationErrors!} source={label} />}
    </div>
  );
}

function Chip({ label, value, color = T.accent }: { label: string; value: string; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
      <span style={{ color: T.textMute }}>{label}</span>
      <code style={{ color, fontFamily: "'SF Mono',monospace", fontSize: 11 }}>{value}</code>
    </span>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────

function ImageUploadZone({
  files,
  onChange,
  audit,
  label = "Upload Images",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  audit: ImageScanResult | null;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles = [...files];
    for (const f of Array.from(incoming)) {
      if (!newFiles.find(x => x.name === f.name)) newFiles.push(f);
    }
    onChange(newFiles);
  };

  const removeFile = (name: string) => onChange(files.filter(f => f.name !== name));

  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    setDragging(false);
    addFiles(ev.dataTransfer.files);
  };

  // If there are no required images and no uploaded files, show a minimal zone
  const required = audit?.all ?? [];
  const missing  = audit?.missing ?? [];
  const covered  = audit?.covered ?? [];

  // Map uploaded file → sanitised name (mirrors server logic)
  const sanitise = (name: string) =>
    name.normalize("NFC").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".6px" }}>
          {label}
        </label>
        {required.length > 0 && (
          <span style={{ fontSize: 11, color: missing.length > 0 ? T.red : T.green, fontWeight: 600 }}>
            {covered.length}/{required.length} images covered
          </span>
        )}
      </div>

      {/* Required image list */}
      {required.length > 0 && (
        <div style={{ background: T.surface2, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontSize: 11, color: T.textMute, marginBottom: 2 }}>Images referenced in JSON</div>
          {required.map(imgPath => {
            const fname   = filenameFromPath(imgPath);
            const isCovered = covered.includes(imgPath);
            const uploadedFile = files.find(f => sanitise(f.name) === sanitise(fname));
            return (
              <div key={imgPath} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ width: 14, flexShrink: 0, color: isCovered ? T.green : T.red, fontWeight: 700 }}>
                  {isCovered ? "✓" : "✗"}
                </span>
                <code style={{ color: isCovered ? T.textSub : T.red, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {imgPath}
                </code>
                {uploadedFile && (
                  <span style={{ fontSize: 10, color: T.green, flexShrink: 0 }}>← {uploadedFile.name}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={ev => { ev.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.accent : T.borderMd}`,
          borderRadius: 10, padding: "20px 16px", textAlign: "center",
          background: dragging ? `${T.accent}0a` : T.surface2,
          cursor: "pointer", transition: "all .15s",
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 6 }}>🖼</div>
        <div style={{ fontSize: 13, color: T.textSub, marginBottom: 4 }}>
          Drop image files here or <span style={{ color: T.accent, fontWeight: 600 }}>click to browse</span>
        </div>
        <div style={{ fontSize: 11, color: T.textMute }}>
          JPG, PNG, WebP, GIF, SVG, AVIF · Max 10 MB each
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {files.map(f => {
            const previewUrl = URL.createObjectURL(f);
            const sname = sanitise(f.name);
            const isNeeded = required.some(p => sanitise(filenameFromPath(p)) === sname);
            return (
              <div key={f.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: T.surface2, borderRadius: 7,
                padding: "6px 10px",
                border: `1px solid ${isNeeded ? T.green + "44" : T.border}`,
              }}>
                <img
                  src={previewUrl}
                  alt=""
                  style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 5, flexShrink: 0 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: T.textMute }}>{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                {isNeeded && <span style={{ fontSize: 11, color: T.green, flexShrink: 0 }}>Matched ✓</span>}
                {!isNeeded && required.length > 0 && <span style={{ fontSize: 11, color: T.amber, flexShrink: 0 }}>Not in JSON</span>}
                <button
                  onClick={e => { e.stopPropagation(); removeFile(f.name); }}
                  style={{
                    background: "none", border: "none", color: T.textMute,
                    cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0,
                  }}
                  aria-label="Remove"
                >✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ImportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tenant");

  // ── Tenant import state ───────────────────────────────────────────────
  const [siteRaw,  setSiteRaw]  = useState("");
  const [pagesRaw, setPagesRaw] = useState("");
  const [tenantImages, setTenantImages] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [tenantResult, setTenantResult] = useState<{ ok: boolean; msg: string; tenantId?: string; tenantType?: string } | null>(null);

  // ── Page import state ─────────────────────────────────────────────────
  const [tenants,      setTenants]      = useState<TenantMeta[]>([]);
  const [tenantsErr,   setTenantsErr]   = useState("");
  const [selectedId,   setSelectedId]   = useState("");
  const [selectedType, setSelectedType] = useState<"doctor" | "hospital">("doctor");
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [newPageRaw,   setNewPageRaw]   = useState("");
  const [overwrite,    setOverwrite]    = useState(true);
  const [pageImages,   setPageImages]   = useState<File[]>([]);
  const [addingPage,   setAddingPage]   = useState(false);
  const [pageResult,   setPageResult]   = useState<{ ok: boolean; msg: string; slug?: string } | null>(null);

  // ── Derived parsing (tenant tab) ──────────────────────────────────────
  const siteParsed   = parsedOrNull(siteRaw);
  const pagesParsed  = parsedOrNull(pagesRaw);

  const siteParseErr  = siteRaw.trim()  ? ("error" in tryParse(siteRaw)  ? (tryParse(siteRaw) as { error: string }).error  : "") : "";
  const pagesParseErr = pagesRaw.trim() ? ("error" in tryParse(pagesRaw) ? (tryParse(pagesRaw) as { error: string }).error : "") : "";

  const siteValidation  = siteParsed  ? validateSiteJson(siteParsed)  : null;
  const pagesValidation = pagesParsed ? validatePageJson(pagesParsed) : null;

  const tenantId   = siteParsed ? String(siteParsed.tenantId   ?? "") : "";
  const tenantType = siteParsed ? String(siteParsed.tenantType ?? "") : "";

  // Combined JSON for image scanning
  const tenantJsonForScan: Record<string, unknown> | null =
    siteParsed && pagesParsed ? { ...siteParsed, pages: [pagesParsed] } : (siteParsed ?? pagesParsed);

  const tenantAudit: ImageScanResult | null = tenantJsonForScan
    ? auditImages(tenantJsonForScan, tenantImages, [])
    : null;

  // ── Derived parsing (page tab) ────────────────────────────────────────
  const newPageParsed    = parsedOrNull(newPageRaw);
  const newPageParseErr  = newPageRaw.trim() ? ("error" in tryParse(newPageRaw) ? (tryParse(newPageRaw) as { error: string }).error : "") : "";
  const newPageValidation = newPageParsed ? validatePageJson(newPageParsed) : null;

  const pageAudit: ImageScanResult | null = newPageParsed
    ? auditImages(newPageParsed, pageImages, existingMedia)
    : null;

  // ── Load tenants for page tab ─────────────────────────────────────────
  useEffect(() => {
    if (tab !== "page") return;
    fetch("/api/tenants", { headers: getAuthHeaders() })
      .then(r => r.json())
      .then((data: TenantMeta[]) => {
        if (Array.isArray(data)) {
          setTenants(data);
          if (!selectedId && data.length > 0) {
            setSelectedId(data[0].tenantId);
            setSelectedType(data[0].tenantType);
          }
        } else {
          setTenantsErr("Could not load tenants. Make sure you are logged in as admin.");
        }
      })
      .catch(() => setTenantsErr("Network error loading tenants."));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep tenantType in sync with selection
  useEffect(() => {
    const t = tenants.find(x => x.tenantId === selectedId);
    if (t) setSelectedType(t.tenantType);
  }, [selectedId, tenants]);

  // Load existing media when tenant selection changes
  useEffect(() => {
    if (!selectedId || !selectedType) return;
    fetch(`/api/content/media?tenantType=${selectedType}&tenantId=${selectedId}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then((d: { ok: boolean; files?: { name: string }[] }) => {
        if (d.ok && Array.isArray(d.files)) {
          setExistingMedia(d.files.map((f: { name: string }) => f.name));
        }
      })
      .catch(() => {});
  }, [selectedId, selectedType]);

  // ── Submit: Import tenant ─────────────────────────────────────────────
  const canImportTenant = useCallback(() => {
    if (!siteParsed || !pagesParsed) return false;
    if (siteParseErr || pagesParseErr) return false;
    if (siteValidation && !siteValidation.valid) return false;
    if (pagesValidation && !pagesValidation.valid) return false;
    if (tenantAudit && tenantAudit.missing.length > 0) return false;
    return !!tenantId && (tenantType === "doctor" || tenantType === "hospital");
  }, [siteParsed, pagesParsed, siteParseErr, pagesParseErr, siteValidation, pagesValidation, tenantAudit, tenantId, tenantType]);

  const handleImportTenant = async () => {
    setImporting(true);
    setTenantResult(null);
    try {
      const fd = new FormData();
      fd.append("site",  siteRaw);
      fd.append("pages", pagesRaw);
      for (const img of tenantImages) fd.append("image", img);

      const res  = await fetch("/api/import/tenant", { method: "POST", headers: getAuthHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.details
          ? `Validation: ${data.details.map((e: ValidationError) => `${e.path}: ${e.message}`).join("; ")}`
          : data.error ?? "Import failed";
        throw new Error(msg);
      }
      setTenantResult({ ok: true, msg: `Tenant "${data.tenantId}" created (${data.paths.length} files${data.uploadedImages?.length ? `, ${data.uploadedImages.length} image(s)` : ""}).`, tenantId: data.tenantId, tenantType: data.tenantType });
    } catch (ex) {
      setTenantResult({ ok: false, msg: ex instanceof Error ? ex.message : "Unknown error" });
    } finally {
      setImporting(false);
    }
  };

  // ── Submit: Add page ──────────────────────────────────────────────────
  const canAddPage = useCallback(() => {
    if (!newPageParsed || newPageParseErr) return false;
    if (newPageValidation && !newPageValidation.valid) return false;
    if (!selectedId) return false;
    if (pageAudit && pageAudit.missing.length > 0) return false;
    return true;
  }, [newPageParsed, newPageParseErr, newPageValidation, selectedId, pageAudit]);

  const handleAddPage = async () => {
    setAddingPage(true);
    setPageResult(null);
    try {
      const fd = new FormData();
      fd.append("tenantId",   selectedId);
      fd.append("tenantType", selectedType);
      fd.append("page",       newPageRaw);
      fd.append("overwrite",  overwrite ? "true" : "false");
      for (const img of pageImages) fd.append("image", img);

      const res  = await fetch("/api/import/page", { method: "POST", headers: getAuthHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.details
          ? `Validation: ${data.details.map((e: ValidationError) => `${e.path}: ${e.message}`).join("; ")}`
          : data.error ?? "Failed";
        throw new Error(msg);
      }
      setPageResult({ ok: true, msg: `Page "${data.slug}" added to "${data.tenantId}".`, slug: data.slug });
    } catch (ex) {
      setPageResult({ ok: false, msg: ex instanceof Error ? ex.message : "Unknown error" });
    } finally {
      setAddingPage(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.shell, fontFamily: "'Inter',system-ui,sans-serif", color: T.text, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 54, borderBottom: `1px solid ${T.border}`, background: T.surface, boxShadow: T.shadow, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/creator" style={{ color: T.textMute, textDecoration: "none", fontSize: 12 }}>← Tenants</a>
          <span style={{ color: T.textMute, fontSize: 12 }}>/</span>
          <strong style={{ fontSize: 13 }}>Import from JSON</strong>
        </div>
        <a href="/docs/ai-context.md" target="_blank" rel="noopener"
          style={{ fontSize: 11, color: T.textMute, textDecoration: "none", padding: "4px 10px", border: `1px solid ${T.borderMd}`, borderRadius: 6 }}>
          AI Context Doc ↗
        </a>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.surface, padding: "0 24px", flexShrink: 0 }}>
        {([["tenant", "Import New Tenant"], ["page", "Add Page to Tenant"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => { setTab(t); setTenantResult(null); setPageResult(null); }} style={{
            padding: "14px 20px", border: "none", borderBottom: `2px solid ${tab === t ? T.accent : "transparent"}`,
            background: "transparent", color: tab === t ? T.accent : T.textMute,
            fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "32px 40px", maxWidth: 900 }}>

        {/* ══ IMPORT TENANT ══════════════════════════════════════════════ */}
        {tab === "tenant" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Import New Tenant</h1>
              <p style={{ margin: 0, fontSize: 13, color: T.textMute, lineHeight: 1.6 }}>
                Paste AI-generated JSON to create a new doctor or hospital site.
                <code style={{ color: T.accent }}> tenantId</code> and<code style={{ color: T.accent }}> tenantType</code> are read from the site JSON.
              </p>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: 8, background: `${T.accent}0d`, border: `1px solid ${T.accent}22`, fontSize: 12, color: T.textSub, lineHeight: 1.7 }}>
              <strong style={{ color: T.accent }}>How it works: </strong>
              Use the <a href="/docs/ai-context.md" target="_blank" style={{ color: T.accent }}>AI Context Doc</a> with Gemini to generate
              a <strong>site.json</strong> and <strong>home.json</strong>. If the JSON references local images (paths starting
              with <code>/content/</code>), upload those image files below before submitting.
            </div>

            {/* site.json */}
            <JsonArea
              label="site.json — tenant identity & settings"
              value={siteRaw}
              onChange={setSiteRaw}
              hint='Must contain "tenantId" and "tenantType". Accepts both flat and settings[] format.'
              rows={14}
              parseError={siteParseErr}
              validationErrors={siteValidation?.errors}
              preview={siteParsed && !siteParseErr ? (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                  {tenantId   && <Chip label="tenantId"   value={tenantId} />}
                  {tenantType && <Chip label="tenantType" value={tenantType} color={T.textSub} />}
                  {(() => {
                    let name = (siteParsed.profile as Record<string,unknown>)?.displayName as string ?? "";
                    if (!name && Array.isArray(siteParsed.settings)) {
                      const p = (siteParsed.settings as Record<string,unknown>[]).find(s => s._template === "profile");
                      name = p?.displayName as string ?? "";
                    }
                    return name ? <Chip label="name" value={name} color={T.green} /> : null;
                  })()}
                </div>
              ) : null}
            />

            {/* home.json */}
            <JsonArea
              label="home.json — home page blocks"
              value={pagesRaw}
              onChange={setPagesRaw}
              hint='Must contain "blocks" array and settings[0] = { "_template": "urlSettings", "slug": "home" }.'
              rows={14}
              parseError={pagesParseErr}
              validationErrors={pagesValidation?.errors}
              preview={pagesParsed && !pagesParseErr ? (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                  {(() => {
                    const s = (Array.isArray(pagesParsed.settings) ? pagesParsed.settings as Record<string,unknown>[] : []).find(x => x._template === "urlSettings");
                    const slug = s?.slug as string ?? "";
                    return slug ? <Chip label="slug" value={slug} color={T.green} /> : null;
                  })()}
                  {Array.isArray(pagesParsed.blocks) && (
                    <Chip label="blocks" value={String((pagesParsed.blocks as unknown[]).length)} color={T.textSub} />
                  )}
                </div>
              ) : null}
            />

            {/* Images */}
            <ImageUploadZone
              files={tenantImages}
              onChange={setTenantImages}
              audit={tenantAudit}
              label="Images (optional if JSON uses external URLs)"
            />

            {/* Result */}
            {tenantResult && (
              <div style={{ padding: "14px 18px", borderRadius: 8, background: tenantResult.ok ? T.greenBg : T.redBg, border: `1px solid ${tenantResult.ok ? T.green : T.red}44`, color: tenantResult.ok ? T.green : T.red, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>{tenantResult.ok ? "✓ " : "✗ "}{tenantResult.msg}</span>
                {tenantResult.ok && tenantResult.tenantId && (
                  <button onClick={() => router.push(`/creator/${tenantResult.tenantType}/${tenantResult.tenantId}`)}
                    style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: T.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    Open in Editor →
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => router.back()} style={{ padding: "10px 24px", borderRadius: 7, border: `1px solid ${T.borderMd}`, background: "transparent", color: T.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button disabled={!canImportTenant() || importing} onClick={handleImportTenant} style={{
                padding: "10px 28px", borderRadius: 7, border: "none",
                background: canImportTenant() && !importing ? T.accent : T.borderMd,
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: canImportTenant() && !importing ? "pointer" : "not-allowed",
                fontFamily: "inherit", opacity: !canImportTenant() || importing ? 0.6 : 1,
              }}>
                {importing ? "Importing…" : "Import Tenant"}
              </button>
            </div>
          </div>
        )}

        {/* ══ ADD PAGE ════════════════════════════════════════════════════ */}
        {tab === "page" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Add Page to Existing Tenant</h1>
              <p style={{ margin: 0, fontSize: 13, color: T.textMute, lineHeight: 1.6 }}>
                Select a tenant and paste a page JSON. Images already uploaded to that tenant are matched automatically.
              </p>
            </div>

            {/* Tenant selector */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>
                Target Tenant
              </label>
              {tenantsErr ? (
                <div style={{ color: T.red, fontSize: 13 }}>{tenantsErr}</div>
              ) : tenants.length === 0 ? (
                <div style={{ color: T.textMute, fontSize: 13 }}>Loading tenants…</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tenants.map(t => (
                    <button key={t.tenantId} onClick={() => setSelectedId(t.tenantId)} style={{
                      padding: "8px 14px", borderRadius: 8,
                      border: `2px solid ${selectedId === t.tenantId ? T.accent : T.borderMd}`,
                      background: selectedId === t.tenantId ? `${T.accent}18` : T.surface2,
                      color: selectedId === t.tenantId ? T.accent : T.textSub,
                      cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                    }}>
                      <div style={{ fontWeight: 700 }}>{t.profile?.displayName || t.tenantId}</div>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{t.tenantId} · {t.tenantType}</div>
                    </button>
                  ))}
                </div>
              )}
              {existingMedia.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: T.textMute }}>
                  {existingMedia.length} image{existingMedia.length !== 1 ? "s" : ""} already on disk for this tenant — will be counted as covered.
                </div>
              )}
            </div>

            {/* Overwrite toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setOverwrite(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, border: "none", background: overwrite ? T.accent : T.borderMd, cursor: "pointer", position: "relative", flexShrink: 0 }} aria-label="Toggle overwrite">
                <div style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", left: overwrite ? 18 : 2, transition: "left .2s" }} />
              </button>
              <span style={{ fontSize: 13, color: T.textSub }}>
                {overwrite ? "Overwrite existing page if it already exists" : "Fail if the page already exists"}
              </span>
            </div>

            {/* page.json */}
            <JsonArea
              label="page.json — blocks & settings"
              value={newPageRaw}
              onChange={setNewPageRaw}
              hint='settings[0] must be { "_template": "urlSettings", "slug": "services" }. The slug becomes the filename.'
              rows={18}
              parseError={newPageParseErr}
              validationErrors={newPageValidation?.errors}
              preview={newPageParsed && !newPageParseErr ? (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                  {(() => {
                    const s = (Array.isArray(newPageParsed.settings) ? newPageParsed.settings as Record<string,unknown>[] : []).find(x => x._template === "urlSettings");
                    const slug = s?.slug as string ?? "";
                    return slug ? <Chip label="slug" value={slug} color={T.green} /> : <Chip label="slug" value="(missing)" color={T.red} />;
                  })()}
                  {Array.isArray(newPageParsed.blocks) && (
                    <Chip label="blocks" value={String((newPageParsed.blocks as unknown[]).length)} color={T.textSub} />
                  )}
                </div>
              ) : null}
            />

            {/* Images */}
            <ImageUploadZone
              files={pageImages}
              onChange={setPageImages}
              audit={pageAudit}
              label="Upload New Images for This Page"
            />

            {/* Result */}
            {pageResult && (
              <div style={{ padding: "14px 18px", borderRadius: 8, background: pageResult.ok ? T.greenBg : T.redBg, border: `1px solid ${pageResult.ok ? T.green : T.red}44`, color: pageResult.ok ? T.green : T.red, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>{pageResult.ok ? "✓ " : "✗ "}{pageResult.msg}</span>
                {pageResult.ok && selectedId && (
                  <button onClick={() => router.push(`/creator/${selectedType}/${selectedId}`)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: T.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    Open in Editor →
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => router.back()} style={{ padding: "10px 24px", borderRadius: 7, border: `1px solid ${T.borderMd}`, background: "transparent", color: T.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button disabled={!canAddPage() || addingPage} onClick={handleAddPage} style={{
                padding: "10px 28px", borderRadius: 7, border: "none",
                background: canAddPage() && !addingPage ? T.accent : T.borderMd,
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: canAddPage() && !addingPage ? "pointer" : "not-allowed",
                fontFamily: "inherit", opacity: !canAddPage() || addingPage ? 0.6 : 1,
              }}>
                {addingPage ? "Adding Page…" : "Add Page"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
