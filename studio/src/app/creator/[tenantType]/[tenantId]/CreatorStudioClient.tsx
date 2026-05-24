"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CSSProperties } from "react";
import { SuggestionPopup } from "../../../../components/SuggestionPopup";
import type { SuggestionContext } from "../../../../lib/catchphrases";

type CreatorStudioClientProps = {
  tenantType: "doctor" | "hospital";
  tenantId: string;
  pageSlug: string;
  pages: string[];
};
type InlineEditMessage = {
  type: "studio:inline-edit";
  path: string;
  value: string;
};

// Routes in the admin where the preview pane should be hidden (Tina takes full width)
const NON_CONTENT_HASH_PREFIXES = [
  "#/media",
  "#/graphql",
  "#/screen",
  "#/collections/new",
  "#/login",
];

/**
 * Detect if a Tina hash should show the preview pane.
 *
 * - No preview: media, graphql, list views, collection root (no tenant selected)
 * - Preview: editing a specific tenant's document/page
 */
/**
 * Extract tenantId from any known Tina hash format:
 *   - #/collections/edit/<col>/<tenantId>[/pages/<slug>]
 *   - #/collections/<col>/~/<tenantId>[/pages/<slug>]
 *   - #/collections/<col>/<tenantId>[/pages/<slug>]  (no edit, no tilde)
 */
function extractTenantIdFromHash(hash: string): string | null {
  const inner = hash.replace(/^#\/?/, "");
  // tilde-format: collections/<col>/~/<tenantId>
  const tildeM = inner.match(/^collections\/[^/]+\/~\/([^/?#]+)/);
  if (tildeM?.[1]) return tildeM[1];
  // edit-format: collections/edit/<col>/<tenantId>
  const editM = inner.match(/^collections\/edit\/[^/]+\/([^/?#]+)/);
  if (editM?.[1] && editM[1] !== "pages") return editM[1];
  // generic: collections/<col>/<tenantId>  (fallback)
  const genM = inner.match(/^collections\/[^/]+\/([^/?#~]+)/);
  if (genM?.[1] && genM[1] !== "pages" && genM[1] !== "~") return genM[1];
  return null;
}

function shouldShowPreview(hash: string, tenantId: string): boolean {
  if (!hash || hash === "#/" || hash === "#") return false;
  if (NON_CONTENT_HASH_PREFIXES.some((p) => hash.startsWith(p))) return false;
  // Must contain tenantId to know which tenant to preview
  return hash.includes(tenantId);
}

/**
 * Parse the TinaCMS admin iframe hash to extract which page is being edited.
 * Tina hash format: #/collections/edit/<collection>/<tenantId>/pages/<pageSlug>
 * Returns the page slug (without .json) or "home" for the root.
 */
function parsePageSlugFromHash(hash: string, tenantId: string): string {
  const pageMatch = hash.match(/\/pages\/([^/?#]+)/);
  if (pageMatch?.[1]) {
    return decodeURIComponent(pageMatch[1]).replace(/\.json$/, "");
  }
  if (hash.includes(tenantId)) return "home";
  return "home";
}

/**
 * Translate a TinaCMS admin hash to a clean parent-window path.
 *
 * URL scheme (no "edit" segment):
 *   #/collections/edit/doctorSite                              → /creator/collections/doctorSite/~
 *   #/collections/edit/doctorSite/dr-amit-sharma               → /creator/collections/doctorSite/~/dr-amit-sharma
 *   #/collections/edit/doctorSite/dr-amit-sharma/pages/home    → /creator/collections/doctorSite/~/dr-amit-sharma/pages/home
 *   #/media                                                    → /creator/media
 */
function tinaHashToCleanPath(hash: string, tenantId: string, collection: string): string {
  const inner = hash.replace(/^#\/?/, "");

  // Collection edit routes: collections/edit/<col>[/<tenantId>[/pages/<slug>]]
  const editMatch = inner.match(
    /^collections\/edit\/([^/]+)(?:\/([^/]+)(?:\/pages\/([^/?#]+))?)?/
  );
  if (editMatch) {
    const col = editMatch[1];           // e.g. "doctorSite"
    const tid = editMatch[2];           // e.g. "dr-amit-sharma" or undefined
    const rawSlug = editMatch[3];       // e.g. "home.json" or undefined

    if (!tid) {
      // Collection list: no tenant selected
      return `/creator/collections/${col}/~`;
    }
    if (!rawSlug) {
      // Tenant root: no specific page — preview will show home
      return `/creator/collections/${col}/~/${tid}`;
    }
    const slug = decodeURIComponent(rawSlug).replace(/\.json$/, "");
    return `/creator/collections/${col}/~/${tid}/pages/${slug}`;
  }

  // Tilde-format routes: collections/<col>/~/<tenantId>[/pages/<slug>]
  const tildeMatch = inner.match(
    /^collections\/([^/]+)\/~\/([^/]+)(?:\/pages\/([^/?#]+))?/
  );
  if (tildeMatch) {
    const col = tildeMatch[1];
    const tid = tildeMatch[2];
    const rawSlug = tildeMatch[3];
    if (!rawSlug) {
      return `/creator/collections/${col}/~/${tid}`;
    }
    const slug = decodeURIComponent(rawSlug).replace(/\.json$/, "");
    return `/creator/collections/${col}/~/${tid}/pages/${slug}`;
  }

  // Non-content routes (media, graphql, etc.)
  return `/creator/${inner || "collections/" + collection + "/~/" + tenantId}`;
}

export function CreatorStudioClient({ tenantType, tenantId, pageSlug, pages }: CreatorStudioClientProps) {
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);
  const refreshTimer = useRef<number | null>(null);
  const snapshotInFlight = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const lastPushedPathRef = useRef(typeof window !== "undefined" ? window.location.pathname : "/");
  const [uiEditingEnabled, setUiEditingEnabled] = useState(false);
  const [activeTenantId, setActiveTenantId] = useState(tenantId);
  const [selectedPageSlug, setSelectedPageSlug] = useState(pageSlug);
  const activeTenantIdRef = useRef(activeTenantId);
  const selectedPageSlugRef = useRef(selectedPageSlug);
  useEffect(() => { activeTenantIdRef.current = activeTenantId; }, [activeTenantId]);
  useEffect(() => { selectedPageSlugRef.current = selectedPageSlug; }, [selectedPageSlug]);
  const [showPreview, setShowPreview] = useState(true);
  const [previewViewport, setPreviewViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const overlayRef = useRef<Record<string, string>>({});
  const fieldIndexRef = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const indexTimerRef = useRef<number | null>(null);
  const [suggestionPopup, setSuggestionPopup] = useState<{
    anchorEl: HTMLElement;
    context: SuggestionContext;
  } | null>(null);

  const pageCollection = tenantType === "doctor" ? "doctorSite" : "hospitalSite";

  // Initial src for the admin iframe — user navigates freely inside.
  // The iframe src is only updated on initial mount to match the URL params.
  const adminEditUrl = useRef(
    `/admin/index.html#/collections/edit/${pageCollection}/${tenantId}/pages/${pageSlug}`
  ).current;

  const previewUrl = useMemo(
    () => `/site/${activeTenantId}/${selectedPageSlug}/preview?studio=1&ui=${uiEditingEnabled ? "1" : "0"}`,
    [activeTenantId, selectedPageSlug, uiEditingEnabled]
  );

  useEffect(() => {
    const leftFrame = leftRef.current;
    const rightFrame = rightRef.current;
    if (!leftFrame || !rightFrame) return;

    const wireLeftEditor = () => {
      const leftDoc = leftFrame.contentDocument;
      if (!leftDoc) return;
      suppressNestedTinaPreview(leftDoc);


      const onClick = async (event: Event) => {
        const target = event.target as HTMLElement | null;
        const saveButton = target?.closest("button");
        if (!saveButton) return;

        const label = (saveButton.textContent ?? "").trim().toLowerCase();
        if (label !== "save" && !label.includes("save ")) return;

        if (snapshotInFlight.current) return;
        snapshotInFlight.current = true;
        await createVersionSnapshot(tenantType, activeTenantIdRef.current, selectedPageSlugRef.current);
        snapshotInFlight.current = false;
      };

      const onFocus = (event: Event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        const name = (target as HTMLInputElement | HTMLTextAreaElement).name ?? "";
        const specialty = extractSpecialtyFromEditor(leftDoc);
        const context = getSuggestionContextFromFieldName(name, tenantType, specialty);
        if (!context) return;
        setSuggestionPopup({ anchorEl: target, context });
      };

      leftDoc.addEventListener("click", onClick, true);
      leftDoc.addEventListener("focusin", onFocus, true);


      fieldIndexRef.current = buildFieldIndex(leftDoc);
    };

    const wireRightPreview = () => {
      const rightDoc = rightFrame.contentDocument;
      const leftDoc = leftFrame.contentDocument;
      if (!rightDoc || !leftDoc) return;

      const onClick = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const el = (target?.closest("[data-tina-field]") || target?.closest("[data-edit-path]")) as HTMLElement | null;
        const field = el?.dataset?.tinaField || el?.dataset?.editPath;
        if (!field) return;
        event.preventDefault();
        event.stopPropagation();
        focusField(leftDoc, field);
      };

      rightDoc.addEventListener("click", onClick, true);
    };

    const onPreviewMessage = (event: MessageEvent) => {
      const data = event.data as InlineEditMessage | undefined;
      if (!data || data.type !== "studio:inline-edit") return;
      const leftDoc = leftFrame.contentDocument;
      if (!leftDoc) return;
      overlayRef.current[data.path] = data.value;
      // Ensure we have a fresh index before applying.
      fieldIndexRef.current = buildFieldIndex(leftDoc);
      applyInlineEditToEditor(leftDoc, data.path, data.value, fieldIndexRef.current);
    };

    leftFrame.addEventListener("load", wireLeftEditor);
    rightFrame.addEventListener("load", wireRightPreview);

    wireLeftEditor();
    wireRightPreview();
    // Listen for suggestion trigger messages from the injected iframe script
    const onSuggestionMessage = (event: MessageEvent) => {
      const data = event.data as { type: string; fieldName: string } | undefined;
      if (!data || data.type !== "studio:show-suggestions") return;
      const leftDoc2 = leftFrame.contentDocument;
      if (!leftDoc2) return;
      const focused = leftDoc2.activeElement as HTMLElement | null;
      if (!focused) return;
      const specialty = extractSpecialtyFromEditor(leftDoc2);
      const context = getSuggestionContextFromFieldName(data.fieldName, tenantType, specialty);
      if (!context) return;
      setSuggestionPopup({ anchorEl: focused, context });
    };

    const onEscapeMessage = (event: MessageEvent) => {
      const data = event.data as { type: string } | undefined;
      if (data?.type === "studio:hide-suggestions" || data?.type === "studio:escape") {
        setSuggestionPopup(null);
      }
    };

    const onActiveCssMessage = (e: MessageEvent) => {
      const lf = leftRef.current;
      const rf = rightRef.current;
      if (e.data?.type === 'TINA_ACTIVE_CSS') {
        if (e.source === lf?.contentWindow) {
          rf?.contentWindow?.postMessage(e.data, '*');
        } else if (e.source === rf?.contentWindow) {
          lf?.contentWindow?.postMessage(e.data, '*');
        }
      }
      if (e.data?.type === 'studio:draft-update' && e.source === lf?.contentWindow) {
        rf?.contentWindow?.postMessage(e.data, '*');
      }
    };
    window.addEventListener("message", onActiveCssMessage);
    window.addEventListener("message", onSuggestionMessage);
    window.addEventListener("message", onEscapeMessage);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSuggestionPopup(null);
    });

    const collection = tenantType === "doctor" ? "doctorSite" : "hospitalSite";

    const processHash = () => {
      let hash = "";
      let pathname = "";
      try {
        hash = leftFrame.contentWindow?.location.hash ?? "";
        pathname = leftFrame.contentWindow?.location.pathname ?? "";
      } catch { return; }

      // Admin iframe navigated to a site preview URL via ui.router
      // (window.location.href = "/site/<tenantId>/<pageSlug>/preview")
      // Redirect it back to the Tina editor and update preview state.
      if (!hash && pathname && !pathname.startsWith('/admin')) {
        const previewMatch = pathname.match(/^\/site\/([^/]+)\/([^/]+)\/preview/);
        if (previewMatch) {
          const tenantFromPath = previewMatch[1];
          const slugFromPath = previewMatch[2];
          let searchStr = "";
          try { searchStr = leftFrame.contentWindow?.location.search ?? ""; } catch {}
          const isEditingSite = new URLSearchParams(searchStr).get("editing") === "site";
          // Update preview state
          if (tenantFromPath !== activeTenantIdRef.current) {
            setActiveTenantId(tenantFromPath);
            activeTenantIdRef.current = tenantFromPath;
          }
          const previewSlug = isEditingSite ? "home" : slugFromPath;
          if (previewSlug !== selectedPageSlugRef.current) {
            setSelectedPageSlug(previewSlug);
            selectedPageSlugRef.current = previewSlug;
          }
          setShowPreview(true);
          // Redirect the left iframe back to the Tina editor
          const col = tenantType === "doctor" ? "doctorSite" : "hospitalSite";
          const docPath = isEditingSite
            ? `${tenantFromPath}/site/index`
            : `${tenantFromPath}/pages/${slugFromPath}`;
          try {
            leftFrame.contentWindow?.location.replace(
              `/admin/index.html#/collections/edit/${col}/${docPath}`
            );
          } catch { /* cross-origin, ignore */ }
        }
        return;
      }

      if (!hash) return;

      const currentActive = activeTenantIdRef.current;
      const extractedId = extractTenantIdFromHash(hash);
      let currentTenantId = extractedId ?? currentActive;
      if (extractedId && extractedId !== currentActive) {
        setActiveTenantId(extractedId);
        activeTenantIdRef.current = extractedId;
      }

      const cleanPath = tinaHashToCleanPath(hash, currentTenantId, collection);
      const showPrev = shouldShowPreview(hash, currentTenantId);

      if (showPrev && cleanPath !== lastPushedPathRef.current) {
        window.history.pushState(null, "", cleanPath);
        lastPushedPathRef.current = cleanPath;
      }

      setShowPreview(showPrev);

      if (showPrev) {
        const slug = parsePageSlugFromHash(hash, currentTenantId);
        if (slug) {
          setSelectedPageSlug((prev) => (prev === slug ? prev : slug));
          selectedPageSlugRef.current = slug;
        }
      }
    };

    const onRouteChange = (e: MessageEvent) => {
      if (e.data?.type !== 'tina:route-change') return;
      if (e.source !== leftFrame.contentWindow) return;
      processHash();
    };
    window.addEventListener('message', onRouteChange);
    leftFrame.addEventListener("load", processHash);

    processHash();

    window.addEventListener("message", onPreviewMessage);

    return () => {
      leftFrame.removeEventListener("load", wireLeftEditor);
      rightFrame.removeEventListener("load", wireRightPreview);
      window.removeEventListener("message", onPreviewMessage);
      window.removeEventListener("message", onSuggestionMessage);
      window.removeEventListener("message", onEscapeMessage);
      window.removeEventListener("message", onActiveCssMessage);
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current);
      }
      if (indexTimerRef.current) {
        window.clearTimeout(indexTimerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      window.removeEventListener('message', onRouteChange);
      leftFrame.removeEventListener("load", processHash);
      setSuggestionPopup(null);
    };
  }, [pages, tenantId, tenantType]);

  return (
    <main
      style={{
        display: "grid",
        gridTemplateRows: "56px 1fr",
        minHeight: "100vh",
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
          borderBottom: "1px solid #1e293b",
          color: "#e2e8f0",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <strong>
          Creator Studio - {tenantType} / {tenantId}
        </strong>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
            title={`Upload images to: content/${tenantType}s/${tenantId}/`}
            style={{
              padding: "6px 12px",
              background: "#10b981",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            📁 Media
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0" }}>
            <span>Page</span>
            <select
              value={selectedPageSlug}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedPageSlug(next);
              }}
              style={{ borderRadius: "6px", padding: "4px 6px" }}
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#1e293b", borderRadius: "8px", padding: "3px" }}>
            {(["mobile", "tablet", "desktop"] as const).map((vp) => {
              const icons: Record<string, string> = { mobile: "📱", tablet: "⬜", desktop: "🖥️" };
              const labels: Record<string, string> = { mobile: "375", tablet: "768", desktop: "Full" };
              return (
                <button
                  key={vp}
                  onClick={() => setPreviewViewport(vp)}
                  title={`${vp[0].toUpperCase()}${vp.slice(1)} preview`}
                  style={{
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: previewViewport === vp ? "#0f172a" : "#94a3b8",
                    background: previewViewport === vp ? "#e2e8f0" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {icons[vp]} {labels[vp]}
                </button>
              );
            })}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0" }}>
            <input
              type="checkbox"
              checked={uiEditingEnabled}
              onChange={(e) => setUiEditingEnabled(e.target.checked)}
            />
            UI edit
          </label>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Type/reorder on left {"->"} right hot updates. Click Save {"->"} snapshot old JSON + write new JSON.
            <span style={{ marginLeft: "12px", color: "#60a5fa" }}>Ctrl+Space</span> for suggestions.
          </div>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: showPreview ? "46% 54%" : "100%",
          minHeight: 0,
        }}
      >
        <iframe
          ref={leftRef}
          title="Tina Editor"
          src={adminEditUrl}
          style={frameStyle}
        />
        {showPreview && (
          <div
            style={{
              background: "#1e293b",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "auto",
              height: "100%",
              padding: 0,
              boxSizing: "border-box",
            }}
          >
            <iframe
              key={previewUrl}
              ref={rightRef}
              title="Live Preview"
              src={previewUrl}
              style={{
                ...frameStyle,
                width:
                  previewViewport === "mobile"
                    ? "375px"
                    : previewViewport === "tablet"
                    ? "768px"
                    : "100%",
                flexShrink: 0,
                borderRadius: previewViewport !== "desktop" ? "12px" : "0",
                boxShadow: previewViewport !== "desktop" ? "0 0 0 1px #334155, 0 8px 32px rgba(0,0,0,0.4)" : "none",
              }}
            />
          </div>
        )}
      </section>
      {suggestionPopup && (
        <SuggestionPopup
          anchorEl={suggestionPopup.anchorEl}
          context={suggestionPopup.context}
          onSelect={(value: string) => {
            const anchor = suggestionPopup?.anchorEl;
            if (!anchor) return;
            setReactInputValue(anchor as HTMLInputElement | HTMLTextAreaElement, value);
            setSuggestionPopup(null);
          }}
          onClose={() => setSuggestionPopup(null)}
        />
      )}
    </main>
  );
}

function injectSuggestionScript(leftDoc: Document) {
  const scriptId = "creator-studio-suggestion-listener";
  if (leftDoc.getElementById(scriptId)) return;
  const script = leftDoc.createElement("script");
  script.id = scriptId;
  script.textContent = `
    (function() {
      var handler = function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          var target = e.target;
          var name = (target && (target.name || "")) || "";
          if (name) {
            window.parent.postMessage({ type: "studio:show-suggestions", fieldName: name }, "*");
          }
        }
        if (e.key === "Escape") {
          window.parent.postMessage({ type: "studio:hide-suggestions" }, "*");
        }
      };
      document.addEventListener("keydown", handler, true);
    })();
  `;
  leftDoc.head.appendChild(script);
}

function setReactInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const win = el.ownerDocument.defaultView || window;
  const prototype = el.tagName === "TEXTAREA"
    ? win.HTMLTextAreaElement.prototype
    : win.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor && descriptor.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

let lastDraftJson = "";

function pushDraftToPreview(frame: HTMLIFrameElement, draft: Record<string, unknown>) {
  if (!frame.contentWindow) return;
  const draftJson = JSON.stringify(draft);
  if (draftJson === lastDraftJson) return; // Prevent spamming unchanged data
  lastDraftJson = draftJson;
  
  frame.contentWindow.postMessage(
    {
      type: "studio:draft-update",
      payload: draft,
    },
    window.location.origin
  );
}

function collectDraftFromEditor(
  leftDoc: Document,
  overlay: Record<string, string> = {}
): Record<string, unknown> {
  const draft: Record<string, unknown> = {};
  const fields = leftDoc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input[name], textarea[name], select[name]"
  );

  fields.forEach((field) => {
    if (field.disabled) return;
    const type = field.getAttribute("type");
    if (type === "button" || type === "submit") return;

    const rawName = field.name.trim();
    if (!rawName) return;

    const name = normalizeFieldName(rawName);
    if (!name) return;

    const value = parseFieldValue(field);
    setDeepValue(draft, name, value);
  });

  // Overlay unsaved UI edits on top of Tina form draft.
  for (const [path, value] of Object.entries(overlay ?? {})) {
    setDeepValue(draft, path, value);
  }

  return draft;
}


function extractSpecialtyFromEditor(leftDoc: Document): string | undefined {
  const specialtyField = leftDoc.querySelector<HTMLInputElement>("input[name*=\"profile.specialty\"], input[name*=\"specialty\"]");
  return specialtyField?.value || undefined;
}

function getSuggestionContextFromFieldName(
  fieldName: string,
  _tenantType: "doctor" | "hospital",
  specialty?: string
): SuggestionContext | null {
  const normalized = fieldName.toLowerCase();

  if (normalized.includes("headline")) {
    return { fieldType: "headline", specialty };
  }
  if (normalized.includes("subheadline")) {
    return { fieldType: "subheadline", specialty };
  }
  if (normalized.includes("services") && normalized.includes("title")) {
    return { fieldType: "serviceTitle", specialty };
  }
  if (normalized.includes("services") && normalized.includes("description")) {
    return { fieldType: "serviceDescription", specialty };
  }
  if (normalized.includes("gallery") && normalized.includes("alt")) {
    return { fieldType: "general", specialty };
  }
  if (normalized.includes("testimonials") && normalized.includes("quote")) {
    return { fieldType: "general", specialty };
  }
  if (normalized.includes("testimonials") && normalized.includes("author")) {
    return { fieldType: "general", specialty };
  }
  if (normalized.includes("stats") && normalized.includes("value")) {
    return { fieldType: "general", specialty };
  }
  if (normalized.includes("stats") && normalized.includes("label")) {
    return { fieldType: "general", specialty };
  }
  if (normalized.includes("blocks") && (normalized.includes("kicker") || normalized.includes("title"))) {
    return { fieldType: "cta", specialty };
  }
  if (normalized.includes("copy") && normalized.includes("title")) {
    return { fieldType: "cta", specialty };
  }
  if (normalized.includes("copy") && normalized.includes("body")) {
    return { fieldType: "cta", specialty };
  }
  if (normalized.includes("copy") && normalized.includes("kicker")) {
    return { fieldType: "cta", specialty };
  }
  if (normalized.includes("cta")) {
    return { fieldType: "cta", specialty };
  }
  if (normalized.includes("faq") && normalized.includes("question")) {
    return { fieldType: "faqQuestion", specialty };
  }
  if (normalized.includes("faq") && normalized.includes("answer")) {
    return { fieldType: "faqAnswer", specialty };
  }
  if (normalized.includes("timing") && normalized.includes("day")) {
    return { fieldType: "timingDay", specialty };
  }
  if (normalized.includes("timing")) {
    return { fieldType: "timingSlot", specialty };
  }
  if (normalized.includes("profile") && normalized.includes("bio")) {
    return { fieldType: "subheadline", specialty };
  }
  if (normalized.includes("displayname") || normalized.includes("display_name")) {
    return { fieldType: "general", specialty };
  }

  return null;
}

function suppressNestedTinaPreview(leftDoc: Document) {
  const styleId = "creator-studio-hide-nested-preview";
  if (!leftDoc.getElementById(styleId)) {
    const style = leftDoc.createElement("style");
    style.id = styleId;
    style.textContent = `
      iframe[src*="/site/"],
      iframe[src*="/creator/"] {
        display: none !important;
      }
    `;
    leftDoc.head.appendChild(style);
  }

  leftDoc.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    const shouldHide = src.includes("/site/") || src.includes("/creator/");
    if (shouldHide && iframe.getAttribute("data-creator-studio-hidden") !== "true") {
      iframe.setAttribute("data-creator-studio-hidden", "true");
      iframe.style.display = "none";
    }
  });
}

function normalizeFieldName(rawName: string): string | null {
  let cleaned = rawName.replace(/\[(\d+)\]/g, ".$1").replace(/^\.+/, "");
  
  // Strip prefixes repeatedly until none remain
  let stripped = true;
  while (stripped) {
    const prev = cleaned;
    cleaned = cleaned
      .replace(/^(data|values|doctorSite|hospitalSite)\./, "");
    stripped = prev !== cleaned;
  }
    
  if (!cleaned) return null;

  const root = cleaned.split(".")[0];
  const allowedRoots = new Set([
    "tenantId",
    "tenantType",
    "status",
    "subscription",
    "domains",
    "profile",
    "business",
    "presentation",
    "header",
    "seo",
    "pages",
    "content",
    "settings",
    "blocks",
  ]);

  return allowedRoots.has(root) ? cleaned : null;
}

function parseFieldValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): unknown {
  const type = field.getAttribute("type");
  if (type === "checkbox") {
    return (field as HTMLInputElement).checked;
  }
  if (type === "number") {
    if (field.value.trim() === "") return undefined;
    return Number(field.value);
  }
  return field.value;
}

function setDeepValue(target: Record<string, unknown>, path: string, value: unknown) {
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) return;

  let cursor: Record<string, unknown> | unknown[] = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];
    const nextIsArrayIndex = /^\d+$/.test(nextSegment);
    const isArrayIndex = /^\d+$/.test(segment);

    if (isArrayIndex && Array.isArray(cursor)) {
      const numericIndex = Number(segment);
      if (cursor[numericIndex] === undefined) {
        cursor[numericIndex] = nextIsArrayIndex ? [] : {};
      }
      cursor = cursor[numericIndex] as Record<string, unknown> | unknown[];
      continue;
    }

    if (!isArrayIndex && !Array.isArray(cursor)) {
      const record = cursor as Record<string, unknown>;
      if (record[segment] === undefined) {
        record[segment] = nextIsArrayIndex ? [] : {};
      }
      cursor = record[segment] as Record<string, unknown> | unknown[];
    }
  }

  const last = segments[segments.length - 1];
  const isLastArrayIndex = /^\d+$/.test(last);

  if (isLastArrayIndex && Array.isArray(cursor)) {
    cursor[Number(last)] = value;
    return;
  }

  if (!isLastArrayIndex && !Array.isArray(cursor)) {
    (cursor as Record<string, unknown>)[last] = value;
  }
}

async function createVersionSnapshot(tenantType: "doctor" | "hospital", tenantId: string, pageSlug: string) {
  try {
    await fetch("/api/content/snapshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantType, tenantSlug: tenantId, pageSlug }),
    });
  } catch {
    // Ignore snapshot failures so save flow in Tina is never blocked.
  }
}

function applyInlineEditToEditor(
  leftDoc: Document,
  path: string,
  value: string,
  index: Map<string, HTMLInputElement | HTMLTextAreaElement>
) {
  const candidates = normalizeCandidatePaths(path);
  const node = findTinaFieldNode(leftDoc, candidates, index);
  if (!node) return;

  setFieldValue(node, value);

  // Some Tina field components only commit on blur.
  node.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
  node.dispatchEvent(new FocusEvent("blur", { bubbles: true }));

  // Nudge any form-level listeners.
  const form = node.closest("form");
  form?.dispatchEvent(new Event("change", { bubbles: true }));
  form?.dispatchEvent(new Event("input", { bubbles: true }));
}

function toBracketPath(path: string) {
  return path.replace(/\.([0-9]+)\./g, "[$1].").replace(/\.([0-9]+)$/g, "[$1]");
}

function normalizeCandidatePaths(path: string) {
  const out = new Set<string>();
  out.add(path);
  out.add(toBracketPath(path));
  out.add(path.replace(/^content\./, "data.content.").replace(/^profile\./, "data.profile."));
  out.add(path.replace(/^content\./, "values.content.").replace(/^profile\./, "values.profile."));
  return Array.from(out);
}

function buildFieldIndex(leftDoc: Document) {
  const map = new Map<string, HTMLInputElement | HTMLTextAreaElement>();
  const nodes = leftDoc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]");
  nodes.forEach((node) => {
    const raw = (node.getAttribute("name") ?? "").trim();
    if (!raw) return;
    const normalized = normalizeAnyName(raw);
    for (const key of normalized) {
      if (!map.has(key)) map.set(key, node);
    }
  });
  return map;
}

function normalizeAnyName(raw: string) {
  const out = new Set<string>();
  let cleaned = raw.replace(/\[(\d+)\]/g, ".$1").replace(/^\.+/, "");
  
  let stripped = true;
  while (stripped) {
    const prev = cleaned;
    cleaned = cleaned.replace(/^(data|values|doctorSite|hospitalSite)\./, "");
    stripped = prev !== cleaned;
  }
  
  out.add(cleaned);
  out.add(cleaned.replace(/\[(\d+)\]/g, ".$1"));
  out.add(toDotPath(cleaned));
  out.add(toBracketPath(toDotPath(cleaned)));
  return Array.from(out).filter(Boolean);
}

function toDotPath(name: string) {
  return name.replace(/\[(\d+)\]/g, ".$1").replace(/^\.+/, "");
}

function findTinaFieldNode(
  leftDoc: Document,
  candidates: string[],
  index: Map<string, HTMLInputElement | HTMLTextAreaElement>
) {
  // 0) Index lookup first
  for (const candidate of candidates) {
    const dot = toDotPath(candidate);
    const hit = index.get(dot) ?? index.get(candidate);
    if (hit) return hit;
  }

  // 1) Exact name match (fast path)
  for (const candidate of candidates) {
    const exact =
      (leftDoc.querySelector(`input[name="${cssEscape(candidate)}"]`) as HTMLInputElement | null) ??
      (leftDoc.querySelector(`textarea[name="${cssEscape(candidate)}"]`) as HTMLTextAreaElement | null);
    if (exact) return exact;
  }

  // 2) Suffix/contains match for Tina's internal name prefixes
  const all = Array.from(
    leftDoc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]")
  );
  for (const candidate of candidates) {
    const hit = all.find((el) => {
      const name = el.getAttribute("name") ?? "";
      return name === candidate || name.endsWith(candidate) || name.includes(candidate);
    });
    if (hit) return hit;
  }

  // 3) Bracket path is sometimes stored without dots for root
  for (const candidate of candidates) {
    const alt = candidate.replace(/^content\./, "data.content.").replace(/^profile\./, "data.profile.");
    const hit =
      (leftDoc.querySelector(`input[name="${cssEscape(alt)}"]`) as HTMLInputElement | null) ??
      (leftDoc.querySelector(`textarea[name="${cssEscape(alt)}"]`) as HTMLTextAreaElement | null);
    if (hit) return hit;
  }

  return null;
}

function setFieldValue(node: HTMLInputElement | HTMLTextAreaElement, value: string) {
  // IMPORTANT: `node` lives inside an iframe; `instanceof HTMLInputElement` can fail across realms.
  const win = node.ownerDocument.defaultView ?? window;

  // Use the element's own prototype chain (iframe-safe).
  const proto = Object.getPrototypeOf(node) as object | null;
  const setter = proto ? Object.getOwnPropertyDescriptor(proto, "value")?.set : undefined;
  if (setter) {
    setter.call(node, value);
  } else {
    // Fallback (should still work for uncontrolled inputs)
    (node as HTMLInputElement | HTMLTextAreaElement).value = value;
  }

  node.dispatchEvent(new InputEvent("input", { bubbles: true }));
  node.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  node.dispatchEvent(new Event("change", { bubbles: true }));
}

function reapplyOverlayToEditor(
  leftDoc: Document,
  overlay: Record<string, string>,
  index: Map<string, HTMLInputElement | HTMLTextAreaElement>
) {
  const entries = Object.entries(overlay);
  if (entries.length === 0) return;

  for (const [path, value] of entries) {
    const candidates = normalizeCandidatePaths(path);
    const node = findTinaFieldNode(leftDoc, candidates, index);
    if (!node) continue;
    if ((node.value ?? "") === value) continue;
    setFieldValue(node, value);
  }
}

function focusField(leftDoc: Document, field: string) {
  const escapedField = cssEscape(field);
  const selector = [
    `[name="${escapedField}"]`,
    `textarea[name="${escapedField}"]`,
    `input[name="${escapedField}"]`,
    `[id*="${escapedField}"]`,
  ].join(", ");

  const node = leftDoc.querySelector(selector) as HTMLElement | null;
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.focus();
}

function cssEscape(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/(["\\#.:,[\]])/g, "\\$1");
}

const frameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
  background: "white",
};
