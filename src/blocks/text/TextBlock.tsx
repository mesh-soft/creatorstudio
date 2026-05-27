"use client";

/**
 * Text block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 952–961).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { TextBlock } from "./types";
import { Section, Heading } from "../shared/primitives";
import { MarkdownText } from "../shared/MarkdownText";

export function TextBlockComponent({
  block,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<TextBlock>) {
  if (!block.heading && !block.body) return null;

  const variant = block.variant || "";

  return (
    <Section
      className={`block text-block${variant ? ` text-${variant}` : ""}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      {block.heading ? (
        <Heading
          level={2}
          editPath={studioMode ? `blocks.${blockIndex}.heading` : undefined}
        >
          {block.heading}
        </Heading>
      ) : null}
      {block.body ? (
        <MarkdownText
          editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}
        >
          {block.body}
        </MarkdownText>
      ) : null}
    </Section>
  );
}
