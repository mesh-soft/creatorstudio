"use client";

/**
 * Footer block — site renderer.
 * Extracted verbatim from SiteRenderer.tsx (lines 497–624).
 *
 * Also used directly by SiteRenderer for the global footer fallback
 * (when no footer block exists in page.blocks).
 */

import React from "react";
import type { BlockProps } from "../shared/types";
import type { FooterBlock } from "./types";
import { Section } from "../shared/primitives";
import { resolveNavLink, type NavLinkItem } from "../shared/navlinks";
import { iconToEmoji } from "../shared/utils";

export function FooterComponent({
  block,
  tenant,
  sectionField,
}: BlockProps<FooterBlock>) {
  const copyright =
    block.copyright ||
    `© ${new Date().getFullYear()} ${tenant.profile.displayName}. All rights reserved.`;

  const socialLinksRaw: NavLinkItem[] = Array.isArray(block.socialLinks) && block.socialLinks.length > 0
    ? (block.socialLinks as NavLinkItem[])
    : (tenant.footer?.socialLinks as NavLinkItem[] ?? []);

  const socials: NavLinkItem[] =
    socialLinksRaw.length > 0
      ? socialLinksRaw
      : (["Facebook|#", "Twitter|#", "Instagram|#"] as NavLinkItem[]);

  const navLinks: NavLinkItem[] =
    Array.isArray(block.links) && block.links.length > 0
      ? (block.links as NavLinkItem[])
      : ((tenant.footer?.links ?? []) as NavLinkItem[]);

  const linksHeading = block.linksHeading ?? tenant.footer?.linksHeading;
  const socialHeading = block.socialHeading ?? tenant.footer?.socialHeading;

  const showContact = (block.showBusinessInfo ?? tenant.footer?.showBusinessInfo) !== false;
  const showRights  = (block.allRightsReserved ?? tenant.footer?.allRightsReserved) !== false;

  const biz = tenant.business;
  const contactAddress = block.address || biz?.address;
  const contactPhone   = block.phone   || biz?.phone;
  const contactEmail   = block.email   || biz?.email;

  return (
    <Section
      tag="footer"
      className="site-footer"
      sectionField={sectionField}
      style={block.css}
      backgroundImage={block.backgroundImage}
    >
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <img
              src={tenant.profile.photo}
              alt="Logo"
              style={{ height: "32px", width: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <strong style={{ fontSize: "16px" }}>{tenant.profile.displayName}</strong>
          </div>
          {tenant.profile.bio && (
            <p className="footer-bio">{tenant.profile.bio.slice(0, 120)}…</p>
          )}
        </div>

        {/* Footer nav links */}
        {navLinks.length > 0 && (
          <div className="footer-connect-col">
            <h4 className="footer-links-heading">{linksHeading || "Links"}</h4>
            <div className="footer-social">
              {navLinks.map((link, i) => {
                const { label, href, icon } = resolveNavLink(link);
                return (
                  <a
                    key={i}
                    href={href}
                    style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {icon && <span style={{ fontSize: "15px" }}>{iconToEmoji(icon)}</span>}
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Social links */}
        <div className="footer-connect-col">
          <h4 className="footer-links-heading">{socialHeading || "Connect"}</h4>
          <div className="footer-social">
            {socials.map((link, i) => {
              const { label, href, icon } = resolveNavLink(link);
              return (
                <a
                  key={i}
                  href={href}
                  style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
                >
                  {icon && <span style={{ fontSize: "15px" }}>{iconToEmoji(icon)}</span>}
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Contact info */}
        {showContact && (contactAddress || contactPhone || contactEmail) && (
          <div className="footer-connect-col">
            <h4 className="footer-links-heading">Contact</h4>
            <div className="footer-social" style={{ flexDirection: "column", gap: "10px" }}>
              {contactAddress && (
                <span style={{ fontSize: "14px", display: "flex", alignItems: "flex-start", gap: 6, opacity: 0.85 }}>
                  <span style={{ flexShrink: 0 }}>📍</span>
                  <span>{contactAddress}</span>
                </span>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`}
                  style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📞</span>
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`}
                  style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✉️</span>
                  {contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {showRights && (
        <div className="footer-copyright">{copyright}</div>
      )}
    </Section>
  );
}
