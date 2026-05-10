"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type CreatorStudioClientProps = {
  tenantType: "doctor" | "hospital";
  tenantId: string;
};
type InlineEditMessage = {
  type: "studio:inline-edit";
  path: string;
  value: string;
};

export function CreatorStudioClient({ tenantType, tenantId }: CreatorStudioClientProps) {
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);
  const refreshTimer = useRef<number | null>(null);
  const snapshotInFlight = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const [uiEditingEnabled, setUiEditingEnabled] = useState(false);
  const overlayRef = useRef<Record<string, string>>({});
  const fieldIndexRef = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const indexTimerRef = useRef<number | null>(null);

  const adminEditUrl = `/admin/index.html#/collections/edit/${tenantType}/${tenantId}`;
  const previewUrl = useMemo(
    () => `/site/${tenantId}?studio=1&ui=${uiEditingEnabled ? "1" : "0"}`,
    [tenantId, uiEditingEnabled]
  );

  useEffect(() => {
    const leftFrame = leftRef.current;
    const rightFrame = rightRef.current;
    if (!leftFrame || !rightFrame) return;

    const wireLeftEditor = () => {
      const leftDoc = leftFrame.contentDocument;
      if (!leftDoc) return;

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
        await createVersionSnapshot(tenantType, tenantId);
        snapshotInFlight.current = false;
      };

      leftDoc.addEventListener("input", onInput, true);
      leftDoc.addEventListener("change", onInput, true);
      leftDoc.addEventListener("click", onClick, true);

      // Capture non-input UI actions like reorder/add/delete blocks in Tina.
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      observerRef.current = new MutationObserver(() => {
        // Tina re-renders controlled inputs; re-apply our unsaved overlay.
        scheduleIndexRebuild();
        scheduleDraftRefresh();
      });
      observerRef.current.observe(leftDoc.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Initial apply in case Tina loads with different state.
      fieldIndexRef.current = buildFieldIndex(leftDoc);
      reapplyOverlayToEditor(leftDoc, overlayRef.current, fieldIndexRef.current);
      scheduleDraftRefresh();
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
    window.addEventListener("message", onPreviewMessage);

    return () => {
      leftFrame.removeEventListener("load", wireLeftEditor);
      rightFrame.removeEventListener("load", wireRightPreview);
      window.removeEventListener("message", onPreviewMessage);
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
    };
  }, [previewUrl, tenantId, tenantType]);

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
        <iframe ref={leftRef} title="Tina Editor" src={adminEditUrl} style={frameStyle} />
        <iframe ref={rightRef} title="Live Preview" src={previewUrl} style={frameStyle} />
      </section>
    </main>
  );
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

async function createVersionSnapshot(tenantType: "doctor" | "hospital", tenantId: string) {
  try {
    await fetch("/api/content/snapshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantType, tenantId }),
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

  node.dispatchEvent(new (win as Window).InputEvent("input", { bubbles: true }));
  node.dispatchEvent(new (win as Window).KeyboardEvent("keyup", { bubbles: true }));
  node.dispatchEvent(new (win as Window).Event("change", { bubbles: true }));
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
