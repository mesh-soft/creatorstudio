"use client";

/**
 * Services block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 796–825).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { ServicesBlock } from "./types";
import { Section, BlockTitle, Card } from "../shared/primitives";
import { MarkdownText } from "../shared/MarkdownText";
import { safeArray, iconFor } from "../shared/utils";

export function ServicesComponent({
  block,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<ServicesBlock>) {
  const variant = block.variant || preset.services;

  return (
    <Section
      className="block"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "Services"}
        title={block.title ?? "What We Offer"}
      />
      <div className={`services services-${variant}`}>
        {safeArray(block.items).map((service, index) => (
          <Card
            key={`${service?.title ?? "service"}-${index}`}
            className="service-card"
          >
            <span className="icon">{iconFor(service.icon)}</span>
            <h3
              data-edit-path={
                studioMode ? `blocks.${blockIndex}.items.${index}.title` : undefined
              }
            >
              {service.title}
            </h3>
            <MarkdownText
              editPath={
                studioMode
                  ? `blocks.${blockIndex}.items.${index}.description`
                  : undefined
              }
            >
              {service.description}
            </MarkdownText>
          </Card>
        ))}
      </div>
    </Section>
  );
}
