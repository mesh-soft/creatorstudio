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

export function CreatorStudioClient({ tenantType, tenantId, pageSlug, pages }: CreatorStudioClientProps) {
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);
  const refreshTimer = useRef<number | null>(null);
  const snapshotInFlight = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const hashPollTimerRef = useRef<number | null>(null);
  const [uiEditingEnabled, setUiEditingEnabled] = useState(false);
  const [selectedPageSlug, setSelectedPageSlug] = useState(pageSlug);
  const overlayRef = useRef<Record<string, string>>({});
  const fieldIndexRef = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const indexTimerRef = useRef<number | null>(null);
  const [suggestionPopup, setSuggestionPopup] = useState<{
    anchorEl: HTMLElement;
    context: SuggestionContext;
  } | null>(null);

  const pageCollection = tenantType === "doctor" ? "doctorSite" : "hospitalSite";
  const adminEditUrl = `/admin/index.html#/collections/edit/${pageCollection}/${tenantId}/pages/${selectedPageSlug}`;
  const previewUrl = useMemo(
    () => `/site/${tenantId}/${selectedPageSlug}?studio=1&ui=${uiEditingEnabled ? "1" : "0"}`,
    [tenantId, selectedPageSlug, uiEditingEnabled]
  );

  useEffect(() => {
    const leftFrame = leftRef.current;
    const rightFrame = rightRef.current;
    if (!leftFrame || !rightFrame) return;

    const wireLeftEditor = () => {
      const leftDoc = leftFrame.contentDocument;
      if (!leftDoc) return;
      suppressNestedTinaPreview(leftDoc);

      const scheduleDraftRefresh = () => {
        if (refreshTimer.current) {
          window.clearTimeout(refreshTimer.current);
        }
        refreshTimer.current = window.setTimeout(() => {
          const draft = collectDraftFromEditor(leftDoc, overlayRef.current);
          pushDraftToPreview(rightFrame, draft);
        }, 180);
      };

      const scheduleIndexRebuild = () => {
        if (indexTimerRef.current) window.clearTimeout(indexTimerRef.current);
        indexTimerRef.current = window.setTimeout(() => {
          fieldIndexRef.current = buildFieldIndex(leftDoc);
          reapplyOverlayToEditor(leftDoc, overlayRef.current, fieldIndexRef.current);
        }, 120);
      };

      const onInput = () => {
        scheduleIndexRebuild();
        scheduleDraftRefresh();
      };

      const onClick = async (event: Event) => {
        const target = event.target as HTMLElement | null;
        const saveButton = target?.closest("button");
        if (!saveButton) return;

        const label = (saveButton.textContent ?? "").trim().toLowerCase();
        if (label !== "save" && !label.includes("save ")) return;

        if (snapshotInFlight.current) return;
        snapshotInFlight.current = true;
        await createVersionSnapshot(tenantType, tenantId, pageSlug);
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

      leftDoc.addEventListener("input", onInput, true);
      leftDoc.addEventListener("change", onInput, true);
      leftDoc.addEventListener("click", onClick, true);
      leftDoc.addEventListener("focusin", onFocus, true);

      // Capture non-input UI actions like reorder/add/delete blocks in Tina.
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      observerRef.current = new MutationObserver(() => {
        // Tina re-renders controlled inputs; re-apply our unsaved overlay.
        suppressNestedTinaPreview(leftDoc);
        scheduleIndexRebuild();
        scheduleDraftRefresh();
      });
      observerRef.current.observe(leftDoc.body, {
        childList: true,
        subtree: true,
      });

      // Initial apply in case Tina loads with different state.
      fieldIndexRef.current = buildFieldIndex(leftDoc);
      reapplyOverlayToEditor(leftDoc, overlayRef.current, fieldIndexRef.current);
      scheduleDraftRefresh();
      syncSelectedPageFromTinaEditor(leftFrame, pages, setSelectedPageSlug, tenantType, tenantId, rightFrame);
    };

    const wireRightPreview = () => {
      const rightDoc = rightFrame.contentDocument;
      const leftDoc = leftFrame.contentDocument;
      if (!rightDoc || !leftDoc) return;

      const onClick = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const el = target?.closest("[data-tina-field]") as HTMLElement | null;
        const field = el?.dataset?.tinaField;
        if (!field) return;
        event.preventDefault();
        event.stopPropagation();
        focusField(leftDoc, field);
      };

      rightDoc.addEventListener("click", onClick, true);
      const initialDraft = collectDraftFromEditor(leftDoc, overlayRef.current);
      pushDraftToPreview(rightFrame, initialDraft);
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

    window.addEventListener("message", onSuggestionMessage);
    window.addEventListener("message", onEscapeMessage);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSuggestionPopup(null);
    });

    // Poll for hash changes in Tina iframe (hashchange doesn't work cross-origin)
    let lastHash = leftFrame.contentWindow?.location.hash || '';
    hashPollTimerRef.current = window.setInterval(() => {
      const currentHash = leftFrame.contentWindow?.location.hash || '';
      if (currentHash !== lastHash) {
        lastHash = currentHash;
        const result = syncSelectedPageFromTinaEditor(leftFrame, pages, setSelectedPageSlug, tenantType, tenantId, rightFrame);
        // If tenant changed, reload the preview with new tenant
        if (result?.tenantChanged && result.newTenantId && result.newTenantType) {
          const newPreviewUrl = `/site/${result.newTenantId}/home?studio=1&ui=${uiEditingEnabled ? "1" : "0"}`;
          rightFrame.src = newPreviewUrl;
        }
      }
    }, 300);
    window.addEventListener("message", onPreviewMessage);

    return () => {
      leftFrame.removeEventListener("load", wireLeftEditor);
      rightFrame.removeEventListener("load", wireRightPreview);
      window.removeEventListener("message", onPreviewMessage);
      window.removeEventListener("message", onSuggestionMessage);
      window.removeEventListener("message", onEscapeMessage);
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current);
      }
      if (hashPollTimerRef.current) {
        window.clearInterval(hashPollTimerRef.current);
        hashPollTimerRef.current = null;
      }
      if (indexTimerRef.current) {
        window.clearTimeout(indexTimerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      setSuggestionPopup(null);
    };
  }, [pages, previewUrl, selectedPageSlug, tenantId, tenantType]);

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
          padding: "0 20px",
          height: "56px",
          background: "#1e293b",
          color: "#e2e8f0",
          borderBottom: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <strong>Creator Studio</strong>
          <select
            value={`${tenantType}/${tenantId}`}
            onChange={(e) => {
              const [type, id] = e.target.value.split('/');
              window.location.href = `/creator/${type}/${id}`;
            }}
            style={{
              background: "#334155",
              color: "#e2e8f0",
              border: "none",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "13px",
            }}
          >
            <optgroup label="Doctors">
              <option value="doctor/dr-amit-sharma">dr-amit-sharma</option>
              <option value="doctor/nitesh-garwa">nitesh-garwa</option>
            </optgroup>
            <optgroup label="Hospitals">
              <option value="hospital/test-hospital">test-hospital</option>
            </optgroup>
          </select>
        </div>
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
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0" }}>
            <input
              type="checkbox"
              checked={uiEditingEnabled}
              onChange={(e) => setUiEditingEnabled(e.target.checked)}
            />
            Enable UI editing (experimental)
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
          gridTemplateColumns: "46% 54%",
          minHeight: 0,
        }}
      >
        <iframe key={adminEditUrl} ref={leftRef} title="Tina Editor" src={adminEditUrl} style={frameStyle} />
        <iframe key={previewUrl} ref={rightRef} title="Live Preview" src={previewUrl} style={frameStyle} />
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
  const prototype = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor && descriptor.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function pushDraftToPreview(frame: HTMLIFrameElement, draft: Record<string, unknown>) {
  if (!frame.contentWindow) return;
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
    if (field instanceof HTMLInputElement && (field.type === "button" || field.type === "submit")) return;

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

function syncSelectedPageFromTinaEditor(
  leftFrame: HTMLIFrameElement,
  pages: string[],
  setSelectedPageSlug: Dispatch<SetStateAction<string>>,
  tenantType: string,
  tenantId: string,
  rightFrame?: HTMLIFrameElement
): { tenantChanged: boolean; newTenantId?: string; newTenantType?: string } | undefined {
  const hash = leftFrame.contentWindow?.location.hash ?? "";
  
  // Tina URL format: #/collections/doctorSite/~/nitesh-garwa/pages/home.json
  // Match: /{collectionType}/~/{tenantId}
  const tenantMatch = hash.match(/\/(doctorSite|hospitalSite)\/~\/([^/?#]+)/);
  if (!tenantMatch) return; // Not in a tenant context
  
  // Extract tenant info from Tina URL
  const tinaType = tenantMatch[1] === 'doctorSite' ? 'doctor' : 'hospital';
  const tinaId = tenantMatch[2];
  
  // Check if tenant changed
  const tenantChanged = tinaId !== tenantId || tinaType !== tenantType;
  
  // Try to extract specific page being edited
  const pageMatch = hash.match(/\/pages\/([^/?#]+)/);
  let pageSlug: string;
  
  if (pageMatch) {
    // Editing a specific page
    pageSlug = decodeURIComponent(pageMatch[1]).replace(/\.json$/, "");
  } else {
    // In tenant folder but not editing a specific page - default to home
    pageSlug = "home";
  }
  
  if (!pages.includes(pageSlug)) return;
  
  // Update state
  setSelectedPageSlug((current) => (current === pageSlug ? current : pageSlug));
  
  // Update browser URL to match current state
  const newUrl = `/creator/${tinaType}/${tinaId}/${pageSlug}`;
  if (window.location.pathname !== newUrl) {
    window.history.replaceState(null, '', newUrl);
  }
  
  return { tenantChanged, newTenantId: tinaId, newTenantType: tinaType };
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
  const cleaned = rawName.replace(/\[(\d+)\]/g, ".$1").replace(/^\.+/, "");
  const withoutPrefix = cleaned.replace(/^data\./, "").replace(/^values\./, "");
  if (!withoutPrefix) return null;

  const root = withoutPrefix.split(".")[0];
  const allowedRoots = new Set([
    "tenantId",
    "tenantType",
    "status",
    "subscription",
    "domains",
    "profile",
    "business",
    "presentation",
    "seo",
    "pages",
    "content",
  ]);

  return allowedRoots.has(root) ? withoutPrefix : null;
}

function parseFieldValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): unknown {
  if (field instanceof HTMLInputElement && field.type === "checkbox") {
    return field.checked;
  }
  if (field instanceof HTMLInputElement && field.type === "number") {
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
  const cleaned = raw.replace(/^data\./, "").replace(/^values\./, "");
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
