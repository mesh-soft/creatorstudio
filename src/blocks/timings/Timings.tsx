"use client";

/**
 * Timings block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 827–859).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { TimingsBlock } from "./types";
import { Section, BlockTitle } from "../shared/primitives";
import { safeArray } from "../shared/utils";

export function TimingsComponent({
  block,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<TimingsBlock>) {
  const variant = block.variant || preset.timings;

  return (
    <Section
      className="block"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "Schedule"}
        title={block.title ?? "Visiting Hours"}
      />
      <div className={`timings timings-${variant}`}>
        {safeArray(block.items).map((timing, index) => (
          <div
            key={`${timing?.day ?? "timing"}-${index}`}
            className="timing-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <strong
              data-edit-path={
                studioMode
                  ? `blocks.${blockIndex}.items.${index}.day`
                  : undefined
              }
            >
              {timing.day}
            </strong>
            <div style={{ textAlign: "right" }}>
              <span
                data-edit-path={
                  studioMode
                    ? `blocks.${blockIndex}.items.${index}.primary`
                    : undefined
                }
              >
                {timing.primary}
              </span>
              <br />
              <small
                style={{ opacity: 0.6 }}
                data-edit-path={
                  studioMode
                    ? `blocks.${blockIndex}.items.${index}.secondary`
                    : undefined
                }
              >
                {timing.secondary}
              </small>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
