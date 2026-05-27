"use client";

/**
 * Gallery block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 861–888).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { GalleryBlock } from "./types";
import { Section, BlockTitle, ImagePrimitive } from "../shared/primitives";
import { safeArray } from "../shared/utils";

export function GalleryComponent({
  block,
  preset,
  sectionField,
}: BlockProps<GalleryBlock>) {
  const variant = block.variant || preset.gallery;

  return (
    <Section
      className="block"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <BlockTitle
        kicker={block.kicker ?? "Gallery"}
        title={block.title ?? "Clinic Photos"}
      />
      <div className={`gallery gallery-${variant}`}>
        {safeArray(block.items).map((image, index) => (
          <div
            key={`${image?.src ?? "image"}-${index}`}
            className="gallery-item"
            style={{
              overflow: "hidden",
              borderRadius: "var(--radius)",
              aspectRatio: "1 / 1",
            }}
          >
            <ImagePrimitive
              src={image.src}
              alt={image.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
