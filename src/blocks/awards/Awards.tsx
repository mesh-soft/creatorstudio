"use client";

/**
 * Awards block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 626–663).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { AwardsBlock } from "./types";
import { Section, BlockTitle, Card } from "../shared/primitives";
import { safeArray, iconFor } from "../shared/utils";

const DEFAULT_AWARDS: NonNullable<AwardsBlock["items"]> = [
  { title: "Best Healthcare Provider", year: "2023", organization: "Global Health Awards" },
  { title: "Excellence in Surgery",    year: "2022", organization: "National Medical Board" },
];

export function AwardsComponent({
  block,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<AwardsBlock>) {
  const variant = block.variant || "";
  const awards =
    Array.isArray(block.items) && block.items.length > 0
      ? block.items
      : DEFAULT_AWARDS;

  return (
    <Section
      className={`block awards-section${variant ? ` awards-${variant}` : ""}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "Recognition"}
        title={block.title ?? "Awards & Achievements"}
      />
      <div className="awards-grid">
        {awards.map((award, i) => (
          <Card
            key={i}
            className="award-card"
            style={{ textAlign: "center", padding: "24px" }}
          >
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>
              {iconFor(award.icon) || "🏆"}
            </div>
            <h3
              data-edit-path={
                studioMode
                  ? `blocks.${blockIndex}.items.${i}.title`
                  : undefined
              }
              style={{ fontSize: "18px", marginBottom: "4px" }}
            >
              {award.title}
            </h3>
            <div style={{ fontSize: "14px", opacity: 0.6 }}>
              <span
                data-edit-path={
                  studioMode
                    ? `blocks.${blockIndex}.items.${i}.organization`
                    : undefined
                }
              >
                {award.organization}
              </span>{" "}
              •{" "}
              <span
                data-edit-path={
                  studioMode
                    ? `blocks.${blockIndex}.items.${i}.year`
                    : undefined
                }
              >
                {award.year}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
