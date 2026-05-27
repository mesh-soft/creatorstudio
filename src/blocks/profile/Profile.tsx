"use client";

/**
 * Profile block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 735–794).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { ProfileBlock } from "./types";
import { Section, Eyebrow, Heading, Card } from "../shared/primitives";
import { MarkdownText } from "../shared/MarkdownText";
import { safeArray } from "../shared/utils";

export function ProfileComponent({
  block,
  tenant,
  preset,
  studioMode,
  blockIndex,
  sectionField,
}: BlockProps<ProfileBlock>) {
  const variant = block.variant || preset.profile;

  return (
    <Section
      className={`block profile profile-${variant}`}
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div className="profile-info">
        <Eyebrow editPath={studioMode ? `blocks.${blockIndex}.kicker` : undefined}>
          {block.kicker || (tenant.tenantType === "doctor" ? "Expertise" : "About Us")}
        </Eyebrow>
        <Heading
          level={2}
          editPath={studioMode ? `blocks.${blockIndex}.title` : undefined}
        >
          {block.title || tenant.profile.displayName}
        </Heading>
        <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>
          {block.body || tenant.profile.bio}
        </MarkdownText>
        <div className="chip-row">
          {safeArray(tenant.profile.degrees).map((degree, index) => (
            <span className="chip" key={`${degree}-${index}`}>
              {degree}
            </span>
          ))}
        </div>
      </div>

      <Card className="profile-card">
        <div className="card-metric">
          <strong
            data-edit-path={studioMode ? `blocks.${blockIndex}.experienceYears` : undefined}
          >
            {block.experienceYears ?? tenant.profile.experienceYears}+
          </strong>
          <span
            data-edit-path={studioMode ? `blocks.${blockIndex}.experienceLabel` : undefined}
          >
            {block.experienceLabel ?? "Years Experience"}
          </span>
        </div>
        <hr style={{ margin: "16px 0", opacity: 0.1 }} />
        <small>
          <span
            data-edit-path={studioMode ? `blocks.${blockIndex}.registrationLabel` : undefined}
          >
            {block.registrationLabel ?? "Registration"}:{" "}
          </span>
          <span
            data-edit-path={studioMode ? `blocks.${blockIndex}.registrationNumber` : undefined}
          >
            {block.registrationNumber ?? tenant.profile.registrationNumber}
          </span>
        </small>
      </Card>
    </Section>
  );
}
