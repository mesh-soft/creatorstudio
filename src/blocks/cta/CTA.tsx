"use client";

/**
 * CTA block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 920–950).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { CtaBlock } from "./types";
import { Section, Heading } from "../shared/primitives";
import { MarkdownText } from "../shared/MarkdownText";
import { ButtonGroup } from "../shared/ButtonGroup";

export function CTAComponent({
  block,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<CtaBlock>) {
  const variant = block.variant || preset.cta;

  return (
    <Section
      className={`cta cta-${variant}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div className="cta-content">
        <Heading
          level={2}
          editPath={studioMode ? `blocks.${blockIndex}.title` : undefined}
        >
          {block.title || "Ready to book?"}
        </Heading>
        <MarkdownText
          editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}
        >
          {block.body}
        </MarkdownText>
      </div>
      <ButtonGroup
        buttons={block.buttons}
        blockIndex={blockIndex}
        studioMode={studioMode}
      />
    </Section>
  );
}
