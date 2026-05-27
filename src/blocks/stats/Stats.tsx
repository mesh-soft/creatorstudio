"use client";

/**
 * Stats block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 1401–1440).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { StatsBlock } from "./types";
import { Section } from "../shared/primitives";
import { safeArray } from "../shared/utils";

export function StatsComponent({
  block,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<StatsBlock>) {
  const stats = safeArray(block.items);
  if (stats.length === 0) return null;

  const variant = block.variant || "";

  return (
    <Section
      className={`block stats-section${variant ? ` stats-${variant}` : ""}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          gap: "24px",
          textAlign: "center",
        }}
      >
        {stats.map((s, i) => (
          <div key={i} className="stat-item" style={{ flex: "1 1 200px" }}>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                marginBottom: "8px",
              }}
              data-edit-path={
                studioMode
                  ? `blocks.${blockIndex}.items.${i}.value`
                  : undefined
              }
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "1rem",
                opacity: 0.8,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
              data-edit-path={
                studioMode
                  ? `blocks.${blockIndex}.items.${i}.label`
                  : undefined
              }
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
