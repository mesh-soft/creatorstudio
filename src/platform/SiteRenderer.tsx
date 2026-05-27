"use client";

import React, { useEffect, useRef, useMemo } from "react";
import type { CSSProperties } from "react";
import { getPreset, getThemeBlocks, stylePresets } from "./catalog";
import type { Tenant, TenantBlock } from "./types";

// ── Block registry (side-effect: registers all 15 built-in blocks) ────────
import "../blocks/index";
import { registry } from "../blocks/registry";
import type { RegistryContext } from "../blocks/shared/types";

// Direct imports for global header/footer fallback (used outside renderBlocks)
import { HeaderComponent } from "../blocks/header/Header";
import { FooterComponent } from "../blocks/footer/Footer";

// ── Smooth scroll ─────────────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Animate scroll to `target` element over `duration` ms.
 * Accounts for the sticky header height via a 80px default.
 */
function smoothScrollTo(target: HTMLElement, duration = 680): void {
  const headerOffset = 80;
  const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ── Types ─────────────────────────────────────────────────────────────────

type SiteRendererProps = {
  tenant: Tenant;
  pageSlug?: string;
  previewLinks?: boolean;
  studioMode?: boolean;
};

// ── Theme / style helpers ─────────────────────────────────────────────────

const defaultStyle = {
  colors: {
    primary:    "#2296F3",
    secondary:  "#64748b",
    accent:     "#f59e0b",
    background: "#ffffff",
    surface:    "#f8fafc",
    text:       "#1e293b",
  },
  shape: {
    radius: "8px",
  },
  typography: {
    heading: "Inter, system-ui, sans-serif",
    body:    "Inter, system-ui, sans-serif",
  },
};

const SYSTEM_FONTS = new Set([
  "inter", "system-ui", "sans-serif", "serif", "monospace",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica neue",
  "arial", "verdana", "georgia",
]);

function buildGoogleFontsUrl(heading: string, body: string): string | null {
  const families = [...new Set([heading, body])]
    .flatMap(f => f.split(","))
    .map(f => f.trim().replace(/["']/g, ""))
    .filter(f => f && !SYSTEM_FONTS.has(f.toLowerCase()));

  if (families.length === 0) return null;
  const params = families
    .map(f => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,600;0,700;1,400`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// ── Main renderer ─────────────────────────────────────────────────────────

export function SiteRenderer({
  tenant,
  pageSlug = "home",
  previewLinks = false,
  studioMode = false,
}: SiteRendererProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Intercept anchor clicks and animate scroll.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, []);

  const preset = getPreset(tenant);
  const styleId = tenant.presentation?.styleId;
  const catalogStyle = styleId ? stylePresets[styleId] : undefined;

  const style      = catalogStyle ?? tenant.presentation?.style ?? defaultStyle;
  const colors     = style.colors     ?? defaultStyle.colors;
  const shape      = style.shape      ?? defaultStyle.shape;
  const typography = style.typography ?? defaultStyle.typography;

  const cssVars = {
    "--primary":   colors.primary,
    "--secondary": colors.secondary,
    "--accent":    colors.accent,
    "--site-bg":   colors.background,
    "--surface":   colors.surface,
    "--site-text": colors.text,
    "--radius":    shape.radius,
    "--heading":   typography.heading,
    "--body":      typography.body,
    "--background": colors.background,
  } as CSSProperties;

  const themeBlocks = getThemeBlocks(tenant);
  const pageBlocks =
    Array.isArray(tenant.blocks) && tenant.blocks.length > 0
      ? tenant.blocks
      : themeBlocks;

  const hasPageHeader  = pageBlocks.some(b => b._template === "header"  && b.enabled !== false);
  const showGlobalHeader = !hasPageHeader  && tenant.header != null && (tenant.header?.show  ?? true);

  const hasPageFooter  = pageBlocks.some(b => b._template === "footer"  && b.enabled !== false);
  const showGlobalFooter = !hasPageFooter  && tenant.footer != null && (tenant.footer?.show  ?? true);

  const googleFontsUrl = buildGoogleFontsUrl(typography.heading, typography.body);
  const analytics      = tenant.analytics;
  const customScripts: { code: string; inHead: boolean }[] =
    Array.isArray(analytics?.customScripts) ? analytics!.customScripts : [];

  return (
    <main ref={containerRef} className={`site-shell ${tenant.tenantType}`} style={cssVars}>
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsUrl} />
        </>
      )}

      {analytics?.gtmContainerId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.gtmContainerId}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analytics.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {analytics?.gaMeasurementId && !analytics?.gtmContainerId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${analytics.gaMeasurementId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.gaMeasurementId}');`,
            }}
          />
        </>
      )}

      {analytics?.metaPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.metaPixelId}');fbq('track','PageView');`,
          }}
        />
      )}

      {/* Custom scripts marked for <head> */}
      {customScripts.filter(s => s.inHead && s.code.trim()).map((s, i) => (
        <div key={`cs-head-${i}`} dangerouslySetInnerHTML={{ __html: s.code }} style={{ display: "none" }} />
      ))}

      {previewLinks ? <PreviewHeader tenant={tenant} /> : null}

      <article className="tenant-site">
        <SubscriptionBar tenant={tenant} />

        {/* Global header fallback — shown only when no header block is in page.blocks */}
        {showGlobalHeader && (
          <HeaderComponent
            block={{
              _template: "header",
              logo:      tenant.header?.logo,
              navLinks:  tenant.header?.navLinks as any,
            }}
            tenant={tenant}
            preset={preset}
          />
        )}

        {renderBlocks(tenant, preset, pageBlocks, studioMode)}

        {/* Global footer fallback — shown only when no footer block is in page.blocks */}
        {showGlobalFooter && (
          <FooterComponent
            block={{
              _template:       "footer",
              copyright:       tenant.footer?.copyright,
              socialLinks:     tenant.footer?.socialLinks as any,
              links:           tenant.footer?.links as any,
              linksHeading:    tenant.footer?.linksHeading,
              socialHeading:   tenant.footer?.socialHeading,
              showBusinessInfo: tenant.footer?.showBusinessInfo,
              allRightsReserved: tenant.footer?.allRightsReserved,
              address:         tenant.footer?.address,
              phone:           tenant.footer?.phone,
              email:           tenant.footer?.email,
            }}
            tenant={tenant}
            preset={preset}
          />
        )}
      </article>

      {/* Custom scripts marked for body (injected after content) */}
      {customScripts.filter(s => !s.inHead && s.code.trim()).map((s, i) => (
        <div key={`cs-body-${i}`} dangerouslySetInnerHTML={{ __html: s.code }} />
      ))}
    </main>
  );
}

// ── Block rendering ───────────────────────────────────────────────────────

/**
 * Wrap a block element with a scroll anchor so `#block-id` hash links work.
 * Header and footer are skipped — they don't need scroll targets.
 */
function withScrollAnchor(
  key: string,
  blockId: string,
  el: React.ReactElement,
): React.ReactElement {
  if (blockId === "header" || blockId === "footer") {
    return <React.Fragment key={key}>{el}</React.Fragment>;
  }
  return (
    <React.Fragment key={key}>
      <span
        id={blockId}
        aria-hidden="true"
        style={{ display: "block", height: 0, overflow: "hidden", scrollMarginTop: "80px" }}
      />
      {el}
    </React.Fragment>
  );
}

/**
 * Resolve and render every block in the page's block list.
 *
 * Uses the BlockRegistry to look up each block's site-renderer component.
 * Unknown block `_template` values are silently skipped.
 * The RegistryContext scopes the lookup to the current tenant so that
 * tenant-specific or tenant-type-specific blocks shadow global ones.
 */
function renderBlocks(
  tenant: Tenant,
  preset: ReturnType<typeof getPreset>,
  blocks: TenantBlock[],
  studioMode = false,
) {
  const ctx: RegistryContext = {
    tenantId:   tenant.tenantId,
    tenantType: tenant.tenantType as RegistryContext["tenantType"],
  };

  return blocks.map((block, index) => {
    if (block?.enabled === false || (block as any)?.enabled === "false") return null;

    const def = registry.resolve(block._template, ctx);
    if (!def) return null;

    const BlockComponent = def.component;
    const key            = `${block._template}-${index}`;
    const sectionField   = studioMode ? `blocks.${index}` : undefined;

    return withScrollAnchor(key, block._template, (
      <BlockComponent
        block={block as any}
        tenant={tenant}
        preset={preset}
        studioMode={studioMode}
        blockIndex={index}
        sectionField={sectionField}
      />
    ));
  });
}

// ── Non-block UI helpers ──────────────────────────────────────────────────

function PreviewHeader({ tenant }: { tenant: Tenant }) {
  return (
    <nav className="preview-header">
      <strong>{tenant.profile.displayName}</strong>
      <div className="flex gap-4">
        <a href={`/site/${tenant.tenantId}`}>View Site</a>
        <a href="/admin/index.html">Tina Admin</a>
      </div>
    </nav>
  );
}

function SubscriptionBar({ tenant }: { tenant: Tenant }) {
  const plan = tenant.subscription?.plan ?? "free";
  if (plan === "pro" || plan === "enterprise") return null;

  return (
    <div
      className="subscription-bar"
      style={{
        background:   "rgba(0,0,0,0.05)",
        color:        "var(--site-text)",
        padding:      "8px 20px",
        fontSize:     "12px",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      Built with <strong>Creator Studio</strong>
    </div>
  );
}
