"use client";

/**
 * Location block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 1007–1069).
 * toGoogleEmbedUrl is kept private to this block.
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { LocationBlock } from "./types";
import { Section, BlockTitle } from "../shared/primitives";

// ── Embed URL converter ────────────────────────────────────────────────────

/**
 * Convert any Google Maps URL or "lat,lng" string into an embeddable iframe src.
 *
 * Handles:
 *   • "12.9716,77.5946"                                  lat,lng
 *   • https://www.google.com/maps/place/.../@lat,lng,...  standard share URL
 *   • https://maps.google.com/?q=lat,lng                  query param URL
 *   • https://maps.google.com/maps?...&output=embed       already an embed URL
 *   • Anything else is passed as a query string (best-effort)
 */
function toGoogleEmbedUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  if (trimmed.includes("output=embed")) return trimmed;

  if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) {
    return `https://maps.google.com/maps?q=${trimmed}&output=embed&z=15`;
  }

  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed&z=15`;
  }

  try {
    const url = new URL(trimmed);
    const q   = url.searchParams.get("q");
    if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=15`;
  } catch {
    // not a valid URL — fall through
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed&z=15`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function LocationComponent({
  block,
  sectionField,
}: BlockProps<LocationBlock>) {
  const embedSrc  = toGoogleEmbedUrl(block.mapUrl || "");
  const mapHeight = block.height || 400;

  return (
    <Section
      className="block location-block"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      {(block.kicker || block.title) && (
        <BlockTitle
          kicker={block.kicker || ""}
          title={block.title || ""}
        />
      )}
      {embedSrc ? (
        <div
          style={{
            width:        "100%",
            borderRadius: "12px",
            overflow:     "hidden",
            boxShadow:    "0 2px 16px rgba(0,0,0,0.10)",
            marginTop:    block.kicker || block.title ? "24px" : "0",
          }}
        >
          <iframe
            title={block.title || "Location Map"}
            src={embedSrc}
            width="100%"
            height={mapHeight}
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div
          style={{
            width:           "100%",
            height:          `${mapHeight}px`,
            background:      "#f1f5f9",
            borderRadius:    "12px",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            color:           "#94a3b8",
            fontSize:        "14px",
          }}
        >
          Paste a Google Maps URL or lat,lng in the editor to show the map
        </div>
      )}
    </Section>
  );
}
