"use client";

/**
 * Testimonials block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 1366–1399).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { TestimonialsBlock } from "./types";
import { Section, BlockTitle, Card, Text } from "../shared/primitives";
import { safeArray } from "../shared/utils";

export function TestimonialsComponent({
  block,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<TestimonialsBlock>) {
  const testimonials = safeArray(block.items);
  if (testimonials.length === 0) return null;

  const variant = block.variant || "";

  return (
    <Section
      className={`block testimonials-section${variant ? ` testimonials-${variant}` : ""}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "Testimonials"}
        title={block.title ?? "What our patients say"}
      />
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <Card key={i} className="testimonial-card">
            <Text
              editPath={
                studioMode
                  ? `blocks.${blockIndex}.items.${i}.quote`
                  : undefined
              }
            >
              &ldquo;{t.quote}&rdquo;
            </Text>
            <div style={{ marginTop: "16px", fontWeight: "bold" }}>
              <span
                data-edit-path={
                  studioMode
                    ? `blocks.${blockIndex}.items.${i}.author`
                    : undefined
                }
              >
                - {t.author || "Patient"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
