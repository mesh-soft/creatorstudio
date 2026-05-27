"use client";

/**
 * WhatsApp block — site renderer.
 * Renders as a fixed floating button (bottom-right corner).
 * Extracted verbatim from SiteRenderer.tsx (lines 1222–1275).
 *
 * Note: This block intentionally does NOT use the Section primitive — it is
 * positioned fixed, outside the normal page flow.
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { WhatsappBlock } from "./types";

export function WhatsAppComponent({
  block,
  tenant,
}: BlockProps<WhatsappBlock>) {
  const phone =
    block.phone || tenant.business?.whatsapp?.replace(/\D/g, "");
  if (!phone) return null;

  const message =
    block.message ||
    `Hi Dr. ${tenant.profile.displayName}, I'd like to book an appointment.`;
  const label = block.label || "Chat on WhatsApp";
  const href  = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      style={{
        position:        "fixed",
        bottom:          "24px",
        right:           "24px",
        zIndex:          9999,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        width:           "56px",
        height:          "56px",
        borderRadius:    "50%",
        background:      "#25D366",
        color:           "#fff",
        boxShadow:       "0 4px 16px rgba(0,0,0,0.25)",
        textDecoration:  "none",
        fontSize:        "28px",
        lineHeight:      1,
        transition:      "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
    >
      💬
    </a>
  );
}
