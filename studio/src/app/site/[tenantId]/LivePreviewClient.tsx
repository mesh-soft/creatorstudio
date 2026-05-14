"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteRenderer } from "@/platform/SiteRenderer";
import type { Tenant } from "@/platform/types";

type LivePreviewClientProps = {
  initialTenant: Tenant;
};

type DraftMessage = {
  type: "studio:draft-update";
  payload: Record<string, unknown>;
};
type InlineEditMessage = {
  type: "studio:inline-edit";
  path: string;
  value: string;
};

export function LivePreviewClient({ initialTenant }: LivePreviewClientProps) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [uiEditingEnabled, setUiEditingEnabled] = useState(false);
  const undoStack = useState<Array<{ path: string; before: string; after: string }>>([])[0];
  const redoStack = useState<Array<{ path: string; before: string; after: string }>>([])[0];
  const inlineOverlay = useState<Record<string, string>>({})[0];

  useEffect(() => {
    setTenant(initialTenant);
  }, [initialTenant]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUiEditingEnabled(params.get("ui") === "1");
  }, []);

  const [activeCss, setActiveCss] = useState<{ id: string; css: string } | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      console.log("Preview Frame Received Message:", data.type);

      // Handle draft updates
      if (data.type === "studio:draft-update") {
        console.log("Handling Draft Update Payload:", data.payload);
        setTenant((previous) => {
          const merged = deepMerge(previous, data.payload) as Tenant & { settings?: any[] };
          
          // Flatten settings array to root on the fly for the renderer
          const urlSettings = Array.isArray(merged.settings) ? merged.settings.find(s => s._template === "urlSettings") : undefined;
          const presentation = Array.isArray(merged.settings) ? merged.settings.find(s => s._template === "presentation") : undefined;
          const seo = Array.isArray(merged.settings) ? merged.settings.find(s => s._template === "seo") : undefined;

          if (urlSettings) {
            merged.slug = urlSettings.slug ?? merged.slug;
            merged.title = urlSettings.title ?? merged.title;
            merged.path = urlSettings.path ?? merged.path;
            merged.isHome = urlSettings.isHome ?? merged.isHome;
          }
          if (presentation) {
            merged.presentation = presentation as any;
          }
          if (seo) {
            merged.seo = seo as any;
          }

          const withInline = applyOverlay(merged, inlineOverlay);
          return withInline as Tenant;
        });
      }
      
      // Handle active CSS sync
      if (data.type === "TINA_ACTIVE_CSS") {
        console.log("Handling Active CSS Sync:", data.value);
        setActiveCss(data.value);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [inlineOverlay]);

  const cssStyles = useMemo(() => {
    if (!activeCss) return null;
    try {
      const cssObj = JSON.parse(activeCss.css);
      const rules = Object.entries(cssObj)
        .filter(([_, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v} !important;`)
        .join(" ");
      
      const fieldId = activeCss.id.replace(/\.css$/, '');
      const selector = fieldId.includes('.') 
        ? `#tina-${fieldId.replace(/\./g, '-')}` 
        : `[data-tina-field="${fieldId}"]`;
        
      return `${selector} { ${rules} }`;
    } catch (e) {
      return null;
    }
  }, [activeCss]);

  useEffect(() => {
    if (!uiEditingEnabled) return;
    const root = document.querySelector(".tenant-site");
    if (!root) return;

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const node = target?.closest("[data-edit-path]") as HTMLElement | null;
      const path = node?.dataset?.editPath;
      if (!node || !path) return;

      event.preventDefault();
      event.stopPropagation();

      enableInlineEditing(node, path);
    };

    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [tenant, uiEditingEnabled]);

  useEffect(() => {
    if (!uiEditingEnabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const metaOrCtrl = event.metaKey || event.ctrlKey;
      if (!metaOrCtrl) return;

      const key = event.key.toLowerCase();
      const isUndo = key === "z" && !event.shiftKey;
      const isRedo = (key === "y" && !event.shiftKey) || (key === "z" && event.shiftKey);
      if (!isUndo && !isRedo) return;

      // Only handle when focus is on body/contenteditable (avoid fighting Tina editor).
      const active = document.activeElement as HTMLElement | null;
      const activeTag = active?.tagName?.toLowerCase();
      const isTypingInInput =
        activeTag === "input" || activeTag === "textarea" || activeTag === "select" || active?.isContentEditable;

      if (!isTypingInInput) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (isUndo) {
        const op = undoStack.pop();
        if (!op) return;
        redoStack.push(op);
        applyOperation(op.path, op.before);
        return;
      }

      const op = redoStack.pop();
      if (!op) return;
      undoStack.push(op);
      applyOperation(op.path, op.after);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [uiEditingEnabled, undoStack, redoStack]);

  return (
    <>
      {cssStyles && <style dangerouslySetInnerHTML={{ __html: cssStyles }} />}
      <SiteRenderer tenant={tenant} studioMode={uiEditingEnabled} />
    </>
  );

  function enableInlineEditing(node: HTMLElement, path: string) {
    if (node.isContentEditable) return;

    const previous = node.textContent ?? "";
    node.setAttribute("contenteditable", "true");
    node.focus();

    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const commit = (cancel = false) => {
      node.removeAttribute("contenteditable");
      node.removeEventListener("blur", onBlur);
      node.removeEventListener("keydown", onKeyDown);
      if (cancel) {
        node.textContent = previous;
        return;
      }
      const value = (node.textContent ?? "").trim();
      const patch = buildPathPatch(path, value);
      setTenant((previousTenant) => deepMerge(previousTenant, patch) as Tenant);
      inlineOverlay[path] = value;
      undoStack.push({ path, before: previous.trim(), after: value });
      redoStack.length = 0;
      const message: InlineEditMessage = { type: "studio:inline-edit", path, value };
      window.parent.postMessage(message, window.location.origin);
    };

    const onBlur = () => commit(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        node.blur();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        commit(true);
      }
    };

    node.addEventListener("blur", onBlur);
    node.addEventListener("keydown", onKeyDown);
  }

  function applyOperation(path: string, value: string) {
    const patch = buildPathPatch(path, value);
    setTenant((previousTenant) => deepMerge(previousTenant, patch) as Tenant);
    inlineOverlay[path] = value;
    const message: InlineEditMessage = { type: "studio:inline-edit", path, value };
    window.parent.postMessage(message, window.location.origin);
  }
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) return mergeArrays(base, patch) as T;
  if (typeof base !== "object" || base === null || typeof patch !== "object" || patch === null) {
    return patch as T;
  }

  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    const current = output[key];
    output[key] = deepMerge(current, value);
  }
  return output as T;
}

function mergeArrays(base: unknown[], patch: unknown[]) {
  const maxLength = Math.max(base.length, patch.length);
  const out: unknown[] = new Array(maxLength);

  for (let i = 0; i < maxLength; i += 1) {
    if (patch[i] === undefined) {
      out[i] = base[i];
    } else if (base[i] === undefined) {
      out[i] = patch[i];
    } else {
      out[i] = deepMerge(base[i], patch[i]);
    }
  }
  return out;
}

function buildPathPatch(path: string, value: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const segments = path.split(".").filter(Boolean);
  let cursor: Record<string, unknown> | unknown[] = root;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];
    const nextIsIndex = /^\d+$/.test(next);
    const isIndex = /^\d+$/.test(segment);

    if (isIndex && Array.isArray(cursor)) {
      const numericIndex = Number(segment);
      if (cursor[numericIndex] === undefined) {
        cursor[numericIndex] = nextIsIndex ? [] : {};
      }
      cursor = cursor[numericIndex] as Record<string, unknown> | unknown[];
      continue;
    }

    if (!Array.isArray(cursor)) {
      const record = cursor as Record<string, unknown>;
      if (record[segment] === undefined) {
        record[segment] = nextIsIndex ? [] : {};
      }
      cursor = record[segment] as Record<string, unknown> | unknown[];
    }
  }

  const last = segments[segments.length - 1];
  if (Array.isArray(cursor) && /^\d+$/.test(last)) {
    cursor[Number(last)] = value;
  } else if (!Array.isArray(cursor)) {
    (cursor as Record<string, unknown>)[last] = value;
  }

  return root;
}

function applyOverlay<T>(base: T, overlay: Record<string, string>) {
  let out = base as unknown;
  for (const [path, value] of Object.entries(overlay)) {
    out = deepMerge(out, buildPathPatch(path, value));
  }
  return out as T;
}
