"use client";

/**
 * @file src/blocks/shared/ButtonGroup.tsx
 *
 * Renders an array of CTA buttons as a flex row.
 * Used by the Hero and CTA block site renderers.
 * Extracted verbatim from SiteRenderer.tsx.
 */

import React from "react";
import { safeArray, iconFor } from "./utils";

export interface ButtonItem {
  label: string;
  url?: string;
  icon?: string;
  variant?: "primary" | "secondary";
}

export function ButtonGroup({
  buttons,
  blockIndex,
  studioMode,
}: {
  buttons?: ButtonItem[];
  blockIndex?: number;
  studioMode?: boolean;
}) {
  const displayButtons = safeArray(buttons);
  if (displayButtons.length === 0) return null;

  return (
    <div className="button-row">
      {displayButtons.map((btn, i) => (
        <a
          key={i}
          className={`btn ${btn.variant === "secondary" ? "secondary" : "primary"}`}
          href={btn.url || "#"}
          data-edit-path={
            studioMode && blockIndex !== undefined
              ? `blocks.${blockIndex}.buttons.${i}.label`
              : undefined
          }
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          {btn.icon && <span className="btn-icon">{iconFor(btn.icon)}</span>}
          {btn.label}
        </a>
      ))}
    </div>
  );
}
