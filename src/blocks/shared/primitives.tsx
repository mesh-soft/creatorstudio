"use client";

/**
 * @file src/blocks/shared/primitives.tsx
 *
 * Shared UI primitives used by block site renderers.
 * Extracted verbatim from SiteRenderer.tsx; behaviour is identical.
 *
 * Block authors can import these from `src/blocks/sdk.ts` to compose
 * their site renderer components.
 */

import React, { useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";

// ── Section ────────────────────────────────────────────────────────────────

/**
 * The standard block wrapper.
 *
 * Features:
 *   • Generates a unique element id used as the CSS anchor for overrides
 *   • Parses the block's `style` (JSON string or flat/breakpoint object)
 *     and injects a `<style>` tag with `!important` declarations
 *   • Applies a background-image when `backgroundImage` is provided
 *   • Accepts `tag` to render as `<header>`, `<footer>`, `<section>`, etc.
 */
export function Section({
  tag = "section",
  className,
  children,
  sectionField,
  style,
  backgroundImage,
}: {
  tag?: React.ElementType;
  className?: string;
  children: ReactNode;
  /** TinaCMS sectionField path (e.g. "blocks.2") for studio integration. */
  sectionField?: string;
  /** Block `css` field — JSON string or breakpoint object. */
  style?: any;
  backgroundImage?: string;
}) {
  // Generate a stable section id. React.useId is available in React 18+.
  const reactId =
    typeof React !== "undefined" && typeof (React as any).useId === "function"
      ? (React as any).useId()
      : useMemo(() => `s-${Math.random().toString(36).substring(2, 6)}`, []);

  const sectionId = useMemo(() => {
    if (!sectionField) return `section-${String(reactId).replace(/:/g, "")}`;
    return `tina-${sectionField.replace(/\./g, "-")}`;
  }, [sectionField, reactId]);

  const { finalStyle, cssBlock } = useMemo(() => {
    let raw: Record<string, any> = {};
    if (typeof style === "string") {
      try {
        raw = JSON.parse(style);
      } catch {
        raw = {};
      }
    } else if (style && typeof style === "object") {
      raw = style as Record<string, any>;
    }

    // Detect breakpoint format vs legacy flat format
    const isBreakpoint = "base" in raw || "mobile" in raw || "tablet" in raw;
    const base: Record<string, string>   = isBreakpoint ? (raw.base   ?? {}) : raw;
    const mobile: Record<string, string> = isBreakpoint ? (raw.mobile ?? {}) : {};
    const tablet: Record<string, string> = isBreakpoint ? (raw.tablet ?? {}) : {};

    const toCssDecls = (obj: Record<string, string>) =>
      Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(
          ([k, v]) =>
            `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v} !important;`,
        )
        .join(" ");

    const baseDecls   = toCssDecls(base);
    const mobileDecls = toCssDecls(mobile);
    const tabletDecls = toCssDecls(tablet);

    const parts: string[] = [];
    if (baseDecls)   parts.push(`#${sectionId} { ${baseDecls} }`);
    if (mobileDecls) parts.push(`@media (max-width: 767px) { #${sectionId} { ${mobileDecls} } }`);
    if (tabletDecls) parts.push(`@media (min-width: 768px) and (max-width: 1023px) { #${sectionId} { ${tabletDecls} } }`);

    const resolvedStyle: Record<string, string> = backgroundImage
      ? {
          ...base,
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : base;

    return {
      finalStyle: resolvedStyle,
      cssBlock: parts.length > 0 ? parts.join("\n") : null,
    };
  }, [style, sectionId, backgroundImage]);

  // Capitalise so TypeScript/React treats it as a component (not an intrinsic element).
  const Tag = tag;
  return (
    <Tag id={sectionId} className={className} style={finalStyle as CSSProperties}>
      {cssBlock && <style dangerouslySetInnerHTML={{ __html: cssBlock }} />}
      {children}
    </Tag>
  );
}

// ── Eyebrow ────────────────────────────────────────────────────────────────

/** Small labelling span styled with the `.eyebrow` CSS class. */
export function Eyebrow({
  children,
  editPath,
}: {
  children: ReactNode;
  editPath?: string;
}) {
  return (
    <span className="eyebrow" data-edit-path={editPath}>
      {children}
    </span>
  );
}

// ── Heading ────────────────────────────────────────────────────────────────

/** h1 or h2 heading using the `--heading` CSS variable for the font family. */
export function Heading({
  level,
  children,
  editPath,
}: {
  level: 1 | 2;
  children: ReactNode;
  editPath?: string;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <Tag data-edit-path={editPath} style={{ fontFamily: "var(--heading)" }}>
      {children}
    </Tag>
  );
}

// ── Text ───────────────────────────────────────────────────────────────────

/** Body paragraph using the `--body` CSS variable for the font family. */
export function Text({
  children,
  editPath,
}: {
  children: ReactNode;
  editPath?: string;
}) {
  return (
    <p data-edit-path={editPath} style={{ fontFamily: "var(--body)" }}>
      {children}
    </p>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

/** Generic card container rendered as an `<article>`. */
export function Card({
  children,
  className = "",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article className={`card ${className}`} style={style}>
      {children}
    </article>
  );
}

// ── ImagePrimitive ─────────────────────────────────────────────────────────

/** Lazy-loaded image. */
export function ImagePrimitive({
  src,
  alt,
  className = "",
  style = {},
}: {
  src: string;
  alt: string;
  className?: string;
  style?: object;
}) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      style={style as CSSProperties}
    />
  );
}

// ── BlockTitle ─────────────────────────────────────────────────────────────

/**
 * Standard block header: an eyebrow label above a heading.
 * Used at the top of Services, FAQ, Gallery, etc.
 */
export function BlockTitle({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="block-title">
      <Eyebrow>{kicker}</Eyebrow>
      <Heading level={2}>{title}</Heading>
    </div>
  );
}
