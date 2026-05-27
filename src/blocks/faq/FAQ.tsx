"use client";

/**
 * FAQ block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 890–918).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { FaqBlock } from "./types";
import { Section, BlockTitle, Card } from "../shared/primitives";
import { MarkdownText } from "../shared/MarkdownText";
import { safeArray } from "../shared/utils";

export function FAQComponent({
  block,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<FaqBlock>) {
  const variant = block.variant || preset.faq;

  return (
    <Section
      className="block"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "FAQ"}
        title={block.title ?? "Frequently Asked Questions"}
      />
      <div className={`faq faq-${variant}`}>
        {safeArray(block.items).map((faq, index) => (
          <Card
            key={`${faq?.question ?? "faq"}-${index}`}
            className="faq-card"
          >
            <h3
              data-edit-path={
                studioMode
                  ? `blocks.${blockIndex}.items.${index}.question`
                  : undefined
              }
            >
              {faq.question}
            </h3>
            <MarkdownText
              editPath={
                studioMode
                  ? `blocks.${blockIndex}.items.${index}.answer`
                  : undefined
              }
            >
              {faq.answer}
            </MarkdownText>
          </Card>
        ))}
      </div>
    </Section>
  );
}
