"use client";

/**
 * Hero block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 688–733).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { HeroBlock } from "./types";
import { Section, Eyebrow, Heading, Text, ImagePrimitive } from "../shared/primitives";
import { ButtonGroup } from "../shared/ButtonGroup";

export function HeroComponent({
  block,
  tenant,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<HeroBlock>) {
  const variant = block.variant || preset.hero;

  return (
    <Section
      className={`hero hero-${variant}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div className="hero-content">
        <Eyebrow editPath={studioMode ? "profile.specialty" : undefined}>
          {tenant.profile.specialty}
        </Eyebrow>
        <Heading
          level={1}
          editPath={studioMode ? `blocks.${blockIndex}.headline` : undefined}
        >
          {block.headline}
        </Heading>
        <Text
          editPath={studioMode ? `blocks.${blockIndex}.subheadline` : undefined}
        >
          {block.subheadline}
        </Text>
        <ButtonGroup
          buttons={block.buttons}
          blockIndex={blockIndex}
          studioMode={studioMode}
        />
      </div>
      <div className="hero-image-wrapper">
        <ImagePrimitive
          src={block.photo || tenant.profile.photo}
          alt={tenant.profile.displayName}
          className="hero-photo"
        />
      </div>
    </Section>
  );
}
