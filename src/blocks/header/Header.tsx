"use client";

/**
 * Header block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 442–496).
 *
 * Also used directly by SiteRenderer for the global header fallback
 * (when no header block exists in page.blocks).
 */

import React, { useState } from "react";
import type { BlockProps } from "../shared/types";
import type { HeaderBlock } from "./types";
import { Section } from "../shared/primitives";
import { resolveNavLink, type NavLinkItem } from "../shared/navlinks";
import { iconToEmoji } from "../shared/utils";

// ── Component ──────────────────────────────────────────────────────────────

export function HeaderComponent({
  block,
  tenant,
  sectionField,
  studioMode,
}: BlockProps<HeaderBlock>) {
  const [menuOpen, setMenuOpen] = useState(false);

  const logo    = block.logo || tenant.header?.logo || tenant.profile.photo;
  const rawLinks: NavLinkItem[] =
    (Array.isArray(block.navLinks) && block.navLinks.length > 0
      ? block.navLinks
      : tenant.header?.navLinks ?? []) as NavLinkItem[];

  const links =
    rawLinks.length > 0 ? rawLinks : ["Services", "About", "Contact"];

  return (
    <Section
      tag="header"
      className="site-header"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div className="header-inner">
        <div className="header-brand">
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "40px",
              width: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <strong style={{ fontSize: "18px" }}>
            {tenant.profile.displayName}
          </strong>
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`header-nav${menuOpen ? " open" : ""}`}>
          {links.map((link, i) => {
            const { label, href, icon } = resolveNavLink(link as NavLinkItem);
            return (
              <a
                key={i}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize:      "14px",
                  fontWeight:    600,
                  color:         "var(--site-text)",
                  opacity:       0.8,
                  textDecoration: "none",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           6,
                }}
              >
                {icon && (
                  <span style={{ fontSize: "16px" }}>{iconToEmoji(icon)}</span>
                )}
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </Section>
  );
}
