"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";
import { getPreset, getThemeBlocks, stylePresets } from "./catalog";
import type { Tenant, TenantBlock } from "./types";
import { toSiteSettingsPathFromFlat } from "./siteSettingsNormalize";
import { iconElement } from "../lib/icons";

// ── Smooth scroll ────────────────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Animate scroll to `target` element over `duration` ms.
 * Accounts for the sticky header height via `scrollMarginTop` or a 80px default.
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

type SiteRendererProps = {
  tenant: Tenant;
  pageSlug?: string;
  previewLinks?: boolean;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
};

function siteAwareTinaField(doc: Record<string, unknown> | undefined, flatPath: string) {
  if (!doc) return undefined;
  const path = toSiteSettingsPathFromFlat(flatPath, doc);
  return tinaField(doc as any, path as any);
}

const defaultStyle = {
  colors: {
    primary: "#2296F3",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
  },
  shape: {
    radius: "8px",
  },
  typography: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
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

export function SiteRenderer({ tenant, pageSlug = "home", previewLinks = false, tinaDocument, studioMode = false }: SiteRendererProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Intercept all anchor clicks inside the site shell and animate scroll.
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
  
  const style = catalogStyle ?? tenant.presentation?.style ?? defaultStyle;
  const colors = style.colors ?? defaultStyle.colors;
  const shape = style.shape ?? defaultStyle.shape;
  const typography = style.typography ?? defaultStyle.typography;
  
  const cssVars = {
    "--primary": colors.primary,
    "--secondary": colors.secondary,
    "--accent": colors.accent,
    "--site-bg": colors.background,
    "--surface": colors.surface,
    "--site-text": colors.text,
    "--radius": shape.radius,
    "--heading": typography.heading,
    "--body": typography.body,
    "--background": colors.background,
  } as CSSProperties;

  const themeBlocks = getThemeBlocks(tenant);
  const pageBlocks = Array.isArray(tenant.blocks) && tenant.blocks.length > 0 
    ? tenant.blocks 
    : themeBlocks;

  const hasPageHeader = pageBlocks.some(b => b._template === "header" && b.enabled !== false);
  const showGlobalHeader = !hasPageHeader && tenant.header != null && (tenant.header?.show ?? true);

  const hasPageFooter = pageBlocks.some(b => b._template === "footer" && b.enabled !== false);
  const showGlobalFooter = !hasPageFooter && tenant.footer != null && (tenant.footer?.show ?? true);

  const googleFontsUrl = buildGoogleFontsUrl(typography.heading, typography.body);
  const analytics = tenant.analytics;
  const customScripts: {code:string;inHead:boolean}[] = Array.isArray(analytics?.customScripts) ? analytics!.customScripts : [];

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
      {/* Custom scripts marked for <head> — rendered inline here since we're inside <main> */}
      {customScripts.filter(s => s.inHead && s.code.trim()).map((s, i) => (
        <div key={`cs-head-${i}`} dangerouslySetInnerHTML={{ __html: s.code }} style={{display:"none"}} />
      ))}

      {previewLinks ? <PreviewHeader tenant={tenant} /> : null}
      <article className="tenant-site">
        <SubscriptionBar tenant={tenant} />
        
        {/* Global Header Fallback (only if no active header block is on the page) */}
        {showGlobalHeader && (
          <Header 
            tenant={tenant} 
            logo={tenant.header?.logo} 
            navLinks={tenant.header?.navLinks} 
            sectionField={
              studioMode
                ? siteAwareTinaField((tinaDocument ?? (tenant as Record<string, unknown>)) as Record<string, unknown>, "header")
                : undefined
            }
          />
        )}

        {renderBlocks(tenant, preset, pageBlocks, tinaDocument, studioMode)}

        {/* Global Footer Fallback (only if no active footer block is on the page) */}
        {showGlobalFooter && (
          <Footer
            tenant={tenant}
            copyright={tenant.footer?.copyright}
            socialLinks={tenant.footer?.socialLinks}
            footerLinks={tenant.footer?.links}
            linksHeading={tenant.footer?.linksHeading}
            socialHeading={tenant.footer?.socialHeading}
            sectionField={
              studioMode
                ? siteAwareTinaField((tinaDocument ?? (tenant as Record<string, unknown>)) as Record<string, unknown>, "footer")
                : undefined
            }
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

function withScrollAnchor(key: string, blockId: string, el: React.ReactElement): React.ReactElement {
  if (blockId === 'header' || blockId === 'footer') {
    return <React.Fragment key={key}>{el}</React.Fragment>;
  }
  return (
    <React.Fragment key={key}>
      <span
        id={blockId}
        aria-hidden="true"
        style={{ display: 'block', height: 0, overflow: 'hidden', scrollMarginTop: '80px' }}
      />
      {el}
    </React.Fragment>
  );
}

function renderBlocks(
  tenant: Tenant,
  preset: ReturnType<typeof getPreset>,
  blocks: TenantBlock[],
  tinaDocument?: Record<string, unknown>,
  studioMode = false
) {
  const tinaBlocks = Array.isArray((tinaDocument as { blocks?: unknown[] } | undefined)?.blocks)
    ? ((tinaDocument as { blocks?: unknown[] }).blocks ?? [])
    : [];

  const displayBlocks = studioMode && tinaBlocks.length > 0 ? tinaBlocks : blocks;

  return displayBlocks.map((block, index) => {
    const activeBlock = block;
    if (activeBlock?.enabled === false || activeBlock?.enabled === "false") return null;

    const key = `${activeBlock?._template}-${index}`;
    const sectionField = studioMode 
      ? (tinaDocument ? tinaField(tinaDocument as any, `blocks.${index}`) : `blocks.${index}`) 
      : undefined;

    const template = activeBlock?._template;
    switch (template) {
      case "header":
        return withScrollAnchor(key, "header", (
          <Header
            tenant={tenant}
            logo={activeBlock?.logo || tenant.header?.logo}
            navLinks={activeBlock?.navLinks || tenant.header?.navLinks}
            sectionField={sectionField}
            studioMode={studioMode}
            css={activeBlock?.css}
            backgroundImage={activeBlock?.backgroundImage}
          />
        ));
      case "footer":
        return withScrollAnchor(key, "footer", (
          <Footer
            tenant={tenant}
            copyright={activeBlock?.copyright || tenant.footer?.copyright}
            socialLinks={activeBlock?.socialLinks || tenant.footer?.socialLinks}
            footerLinks={activeBlock?.links || tenant.footer?.links}
            linksHeading={activeBlock?.linksHeading || tenant.footer?.linksHeading}
            socialHeading={activeBlock?.socialHeading || tenant.footer?.socialHeading}
            sectionField={sectionField}
            studioMode={studioMode}
            css={activeBlock?.css}
            backgroundImage={activeBlock?.backgroundImage}
          />
        ));
      case "awards":
        return withScrollAnchor(key, "awards", (
          <Awards
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || ""}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        ));
      case "hero":
        return withScrollAnchor(key, "hero", (
          <Hero tenant={tenant} block={activeBlock} blockIndex={index} variant={activeBlock?.variant || preset.hero} sectionField={sectionField} tinaDocument={tinaDocument} studioMode={studioMode} />
        ));
      case "profile":
        return withScrollAnchor(key, "profile", (
          <Profile
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.profile}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "services":
        return withScrollAnchor(key, "services", (
          <Services
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.services}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "timings":
        return withScrollAnchor(key, "timings", (
          <Timings
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.timings}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "gallery":
        return withScrollAnchor(key, "gallery", (
          <Gallery
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.gallery}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "faq":
        return withScrollAnchor(key, "faq", (
          <FAQ
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.faq}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "cta":
        return withScrollAnchor(key, "cta", (
          <CTA
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || preset.cta}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        ));
      case "testimonials":
        return withScrollAnchor(key, "testimonials", (
          <Testimonials
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || ""}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        ));
      case "stats":
        return withScrollAnchor(key, "stats", (
          <Stats
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={activeBlock?.variant || ""}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        ));
      case "text":
        return withScrollAnchor(key, "text", (
          <TextBlock block={activeBlock} blockIndex={index} variant={activeBlock?.variant || ""} sectionField={sectionField} studioMode={studioMode} />
        ));
      case "whatsapp":
        return (
          <React.Fragment key={key}>
            <WhatsAppButton block={activeBlock} tenant={tenant} sectionField={sectionField} />
          </React.Fragment>
        );
      case "location":
        return withScrollAnchor(key, "location", (
          <LocationBlock block={activeBlock} blockIndex={index} sectionField={sectionField} />
        ));
      default:
        return null;
    }
  });
}
type NavLinkItem =
  | { _template: 'sectionLink'; label: string; sectionId: string; icon?: string }
  | { _template: 'pageLink'; label: string; pageSlug: string; icon?: string }
  | { _template: 'externalLink'; label: string; url: string; icon?: string }
  | { type: 'section'; label: string; sectionId: string; icon?: string }
  | { type: 'page'; label: string; pageSlug: string; icon?: string }
  | { type: 'external'; label: string; url: string; icon?: string };

function resolveNavLink(link: string | NavLinkItem): { label: string; href: string; icon?: string } {
  if (typeof link === 'string') {
    const [label, url] = link.includes('|') ? link.split('|') : [link, '#'];
    return { label, href: url };
  }
  // Legacy _template format
  if ('_template' in link) {
    if (link._template === 'sectionLink') return { label: link.label, href: `#${link.sectionId}`, icon: (link as any).icon };
    if (link._template === 'pageLink') return { label: link.label, href: `/${(link as any).pageSlug}`, icon: (link as any).icon };
    if (link._template === 'externalLink') return { label: link.label, href: (link as any).url!, icon: (link as any).icon };
  }
  // New type-based format (from FNavLinks editor)
  const l = link as any;
  if (l.type === 'section') return { label: l.label, href: `#${l.sectionId}`, icon: l.icon };
  if (l.type === 'page') return { label: l.label, href: `/${l.pageSlug}`, icon: l.icon };
  if (l.type === 'external') return { label: l.label, href: l.url!, icon: l.icon };
  return { label: '', href: '#' };
}

function Header({
  tenant,
  logo,
  navLinks,
  sectionField,
  studioMode,
  css,
  backgroundImage,
}: {
  tenant: Tenant;
  logo?: string;
  navLinks?: (string | NavLinkItem)[];
  sectionField?: string;
  studioMode?: boolean;
  css?: any;
  backgroundImage?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayLogo = logo || tenant.profile.photo;
  const links = Array.isArray(navLinks) && navLinks.length > 0 ? navLinks : ["Services", "About", "Contact"];

  return (
    <Section tag="header" className="site-header" sectionField={sectionField} style={css} backgroundImage={backgroundImage}>
      <div className="header-inner">
        <div className="header-brand">
          <img src={displayLogo} alt="Logo" style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <strong style={{ fontSize: "18px" }}>{tenant.profile.displayName}</strong>
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
            const { label, href, icon } = resolveNavLink(link);
            return (
              <a
                key={i}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: "14px", fontWeight: 600, color: "var(--site-text)", opacity: 0.8, textDecoration: "none", display:"flex", alignItems:"center", gap:6 }}>
                {icon && <span style={{ fontSize:"16px" }}>{iconToEmoji(icon)}</span>}
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </Section>
  );
}
function Footer({
  tenant,
  copyright,
  socialLinks,
  footerLinks,
  linksHeading,
  socialHeading,
  sectionField,
  studioMode,
  css,
  backgroundImage,
}: {
  tenant: Tenant;
  copyright?: string;
  socialLinks?: (string | NavLinkItem)[];
  footerLinks?: (string | NavLinkItem)[];
  linksHeading?: string;
  socialHeading?: string;
  sectionField?: string;
  studioMode?: boolean;
  css?: any;
  backgroundImage?: string;
}) {
  const displayCopyright = copyright || `© ${new Date().getFullYear()} ${tenant.profile.displayName}. All rights reserved.`;
  const socials = Array.isArray(socialLinks) && socialLinks.length > 0 ? socialLinks : ["Facebook|#", "Twitter|#", "Instagram|#"];
  const navLinks = Array.isArray(footerLinks) && footerLinks.length > 0 ? footerLinks : [];

  return (
    <Section tag="footer" className="site-footer" sectionField={sectionField} style={css} backgroundImage={backgroundImage}>
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <img src={tenant.profile.photo} alt="Logo"
              style={{ height: "32px", width: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <strong style={{ fontSize: "16px" }}>{tenant.profile.displayName}</strong>
          </div>
          {tenant.profile.bio && (
            <p className="footer-bio">{tenant.profile.bio.slice(0, 120)}…</p>
          )}
        </div>

        {navLinks.length > 0 && (
          <div className="footer-connect-col">
            <h4 className="footer-links-heading">{linksHeading || "Links"}</h4>
            <div className="footer-social">
              {navLinks.map((link, i) => {
                const { label, href, icon } = resolveNavLink(link);
                return (
                  <a key={i} href={href}
                    style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display:"flex", alignItems:"center", gap:4 }}>
                    {icon && <span style={{ fontSize:"15px" }}>{iconToEmoji(icon)}</span>}
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="footer-connect-col">
          <h4 className="footer-links-heading">{socialHeading || "Connect"}</h4>
          <div className="footer-social">
            {socials.map((link, i) => {
              const { label, href, icon } = resolveNavLink(link);
              return (
                <a key={i} href={href}
                  style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500, display:"flex", alignItems:"center", gap:4 }}>
                  {icon && <span style={{ fontSize:"15px" }}>{iconToEmoji(icon)}</span>}
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        {displayCopyright}
      </div>
    </Section>
  );
}

function Awards({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant?: string;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const awards = Array.isArray(block?.items) && block?.items.length > 0 ? block?.items : [
    { title: "Best Healthcare Provider", year: "2023", organization: "Global Health Awards" },
    { title: "Excellence in Surgery", year: "2022", organization: "National Medical Board" }
  ];

  return (
    <Section className={`block awards-section${variant ? ` awards-${variant}` : ""}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "Recognition"} title={block?.title ?? "Awards & Achievements"} />
      <div className="awards-grid">
        {awards.map((award: any, i: number) => (
          <Card key={i} className="award-card" style={{ textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>{iconFor(award.icon) || "🏆"}</div>
            <h3 data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.title` : undefined} style={{ fontSize: "18px", marginBottom: "4px" }}>{award.title}</h3>
            <div style={{ fontSize: "14px", opacity: 0.6 }}>
              <span data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.organization` : undefined}>{award.organization}</span> • 
              <span data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.year` : undefined}>{award.year}</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

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
    <div className="subscription-bar" style={{ background: "rgba(0,0,0,0.05)", color: "var(--site-text)", padding: "8px 20px", fontSize: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      Built with <strong>Creator Studio</strong>
    </div>
  );
}

function Hero({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className={`hero hero-${variant}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <div className="hero-content">
        <Eyebrow
          field={tinaDocument ? siteAwareTinaField(tinaDocument, "profile.specialty") : undefined}
          editPath={studioMode ? "profile.specialty" : undefined}
        >
          {tenant.profile.specialty}
        </Eyebrow>
        <Heading
          level={1}
          editPath={studioMode ? `blocks.${blockIndex}.headline` : undefined}
        >
          {block?.headline}
        </Heading>
        <Text
          editPath={studioMode ? `blocks.${blockIndex}.subheadline` : undefined}
        >
          {block?.subheadline}
        </Text>
        <ButtonGroup 
          buttons={block?.buttons}
          blockIndex={blockIndex} 
          studioMode={studioMode}
        />
      </div>
      <div className="hero-image-wrapper">
        <ImagePrimitive src={block?.photo || tenant.profile.photo} alt={tenant.profile.displayName} className="hero-photo" />
      </div>
    </Section>
  );
}

function Profile({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className={`block profile profile-${variant}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <div className="profile-info">
        <Eyebrow editPath={studioMode ? `blocks.${blockIndex}.kicker` : undefined}>
          {block?.kicker || (tenant.tenantType === "doctor" ? "Expertise" : "About Us")}
        </Eyebrow>
        <Heading 
          level={2} 
          editPath={studioMode ? `blocks.${blockIndex}.title` : undefined}
        >
          {block?.title || tenant.profile.displayName}
        </Heading>
        <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>
          {block?.body || tenant.profile.bio}
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
          <strong data-edit-path={studioMode ? `blocks.${blockIndex}.experienceYears` : undefined}>
            {block?.experienceYears ?? tenant.profile.experienceYears}+
          </strong>
          <span data-edit-path={studioMode ? `blocks.${blockIndex}.experienceLabel` : undefined}>
            {block?.experienceLabel ?? "Years Experience"}
          </span>
        </div>
        <hr style={{ margin: "16px 0", opacity: 0.1 }} />
        <small>
          <span data-edit-path={studioMode ? `blocks.${blockIndex}.registrationLabel` : undefined}>
            {block?.registrationLabel ?? "Registration"}: 
          </span>
          <span data-edit-path={studioMode ? `blocks.${blockIndex}.registrationNumber` : undefined}>
            {block?.registrationNumber ?? tenant.profile.registrationNumber}
          </span>
        </small>
      </Card>
    </Section>
  );
}

function Services({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "Services"} title={block?.title ?? "What We Offer"} />
      <div className={`services services-${variant}`}>
        {safeArray(block?.items).map((service: any, index: number) => (
          <Card key={`${service?.title ?? "service"}-${index}`} className="service-card">
            <span className="icon">{iconFor(service.icon)}</span>
            <h3 data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.title` : undefined}>{service.title}</h3>
            <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.items.${index}.description` : undefined}>{service.description}</MarkdownText>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Timings({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "Schedule"} title={block?.title ?? "Visiting Hours"} />
      <div className={`timings timings-${variant}`}>
        {safeArray(block?.items).map((timing: any, index: number) => (
          <div key={`${timing?.day ?? "timing"}-${index}`} className="timing-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <strong data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.day` : undefined}>{timing.day}</strong>
            <div style={{ textAlign: "right" }}>
              <span data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.primary` : undefined}>{timing.primary}</span>
              <br />
              <small style={{ opacity: 0.6 }} data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.secondary` : undefined}>{timing.secondary}</small>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Gallery({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "Gallery"} title={block?.title ?? "Clinic Photos"} />
      <div className={`gallery gallery-${variant}`}>
        {safeArray(block?.items).map((image: any, index: number) => (
          <div key={`${image?.src ?? "image"}-${index}`} className="gallery-item" style={{ overflow: "hidden", borderRadius: "var(--radius)", aspectRatio: "1 / 1" }}>
            <ImagePrimitive src={image.src} alt={image.alt} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQ({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "FAQ"} title={block?.title ?? "Frequently Asked Questions"} />
      <div className={`faq faq-${variant}`}>
        {safeArray(block?.items).map((faq: any, index: number) => (
          <Card key={`${faq?.question ?? "faq"}-${index}`} className="faq-card">
            <h3 data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.question` : undefined}>{faq.question}</h3>
            <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.items.${index}.answer` : undefined}>{faq.answer}</MarkdownText>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function CTA({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className={`cta cta-${variant}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <div className="cta-content">
        <Heading level={2} editPath={studioMode ? `blocks.${blockIndex}.title` : undefined}>
          {block?.title || "Ready to book?"}
        </Heading>
        <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>{block?.body}</MarkdownText>
      </div>
      <ButtonGroup
        buttons={block?.buttons}
        blockIndex={blockIndex}
        studioMode={studioMode}
      />
    </Section>
  );
}

function TextBlock({ block, blockIndex, variant, sectionField, studioMode }: { block: any; blockIndex: number; variant?: string; sectionField?: string; studioMode?: boolean }) {
  if (!block?.heading && !block?.body) return null;

  return (
    <Section className={`block text-block${variant ? ` text-${variant}` : ""}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      {block?.heading ? <Heading level={2} editPath={studioMode ? `blocks.${blockIndex}.heading` : undefined}>{block?.heading}</Heading> : null}
      {block?.body ? <MarkdownText editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>{block?.body}</MarkdownText> : null}
    </Section>
  );
}

// ── Location / Map block ─────────────────────────────────────────────────────

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

  // Already an embed URL
  if (trimmed.includes("output=embed")) return trimmed;

  // Plain "lat,lng"
  if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) {
    return `https://maps.google.com/maps?q=${trimmed}&output=embed&z=15`;
  }

  // Google Maps share URL containing @lat,lng
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed&z=15`;
  }

  // URL with ?q= param
  try {
    const url = new URL(trimmed);
    const q = url.searchParams.get("q");
    if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=15`;
  } catch {
    // not a valid URL — fall through
  }

  // Fallback: treat the whole string as a query
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed&z=15`;
}

function LocationBlock({
  block,
  blockIndex,
  sectionField,
}: {
  block: any;
  blockIndex: number;
  sectionField?: string;
}) {
  const embedSrc = toGoogleEmbedUrl(block?.mapUrl || "");
  const mapHeight = block?.height || 400;

  return (
    <Section
      className="block location-block"
      sectionField={sectionField}
      style={block?.css}
      backgroundImage={block?.backgroundImage}
    >
      {(block?.kicker || block?.title) && (
        <BlockTitle kicker={block?.kicker || ""} title={block?.title || ""} />
      )}
      {embedSrc ? (
        <div
          style={{
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
            marginTop: block?.kicker || block?.title ? "24px" : "0",
          }}
        >
          <iframe
            title={block?.title || "Location Map"}
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
            width: "100%",
            height: `${mapHeight}px`,
            background: "#f1f5f9",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Paste a Google Maps URL or lat,lng in the editor to show the map
        </div>
      )}
    </Section>
  );
}

function BlockTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="block-title">
      <Eyebrow>{kicker}</Eyebrow>
      <Heading level={2}>{title}</Heading>
    </div>
  );
}

function Section({
  tag: Tag = "section",
  className,
  children,
  sectionField,
  style,
  backgroundImage,
}: {
  tag?: any;
  className?: string;
  children: ReactNode;
  sectionField?: string;
  style?: any;
  backgroundImage?: string;
}) {
  const reactId = typeof React !== "undefined" && (React as any).useId
    ? (React as any).useId()
    : useMemo(() => `s-${Math.random().toString(36).substring(2, 6)}`, []);

  const sectionId = useMemo(() => {
    if (!sectionField) return `section-${reactId.replace(/:/g, "")}`;
    return `tina-${sectionField.replace(/\./g, "-")}`;
  }, [sectionField, reactId]);

  const { finalStyle, cssBlock } = useMemo(() => {
    let raw: Record<string, any> = {};
    if (typeof style === "string") {
      try { raw = JSON.parse(style); } catch { raw = {}; }
    } else if (style && typeof style === "object") {
      raw = style as Record<string, any>;
    }

    // Detect new breakpoint format vs legacy flat format
    const isBreakpoint = "base" in raw || "mobile" in raw || "tablet" in raw;
    const base: Record<string, string> = isBreakpoint ? (raw.base || {}) : raw;
    const mobile: Record<string, string> = isBreakpoint ? (raw.mobile || {}) : {};
    const tablet: Record<string, string> = isBreakpoint ? (raw.tablet || {}) : {};

    const toCssDecls = (obj: Record<string, string>) =>
      Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v} !important;`)
        .join(" ");

    const baseDecls = toCssDecls(base);
    const mobileDecls = toCssDecls(mobile);
    const tabletDecls = toCssDecls(tablet);

    const parts: string[] = [];
    if (baseDecls) parts.push(`#${sectionId} { ${baseDecls} }`);
    if (mobileDecls) parts.push(`@media (max-width: 767px) { #${sectionId} { ${mobileDecls} } }`);
    if (tabletDecls) parts.push(`@media (min-width: 768px) and (max-width: 1023px) { #${sectionId} { ${tabletDecls} } }`);

    const resolvedStyle = backgroundImage
      ? { ...base, backgroundImage: `url("${backgroundImage}")`, backgroundSize: "cover", backgroundPosition: "center" }
      : base;

    return { finalStyle: resolvedStyle, cssBlock: parts.length > 0 ? parts.join("\n") : null };
  }, [style, sectionId, backgroundImage]);

  return (
    <Tag id={sectionId} className={className} data-tina-field={sectionField} style={finalStyle}>
      {cssBlock && (
        <style dangerouslySetInnerHTML={{ __html: cssBlock }} />
      )}
      {children}
    </Tag>
  );
}

function Eyebrow({ children, field, editPath }: { children: ReactNode; field?: string; editPath?: string }) {
  return (
    <span className="eyebrow" data-tina-field={field} data-edit-path={editPath}>
      {children}
    </span>
  );
}

function Heading({
  level,
  children,
  field,
  editPath,
}: {
  level: 1 | 2;
  children: ReactNode;
  field?: string;
  editPath?: string;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <Tag data-tina-field={field} data-edit-path={editPath} style={{ fontFamily: "var(--heading)" }}>
      {children}
    </Tag>
  );
}

function Text({ children, field, editPath }: { children: ReactNode; field?: string; editPath?: string }) {
  return (
    <p data-tina-field={field} data-edit-path={editPath} style={{ fontFamily: "var(--body)" }}>
      {children}
    </p>
  );
}

function Card({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <article className={`card ${className}`} style={style}>{children}</article>;
}

function ImagePrimitive({ src, alt, className = "", style = {} }: { src: string; alt: string; className?: string; style?: object }) {
  return <img className={className} src={src} alt={alt} loading="lazy" style={style} />;
}

function ButtonGroup({ 
  buttons,
  blockIndex,
  studioMode,
}: { 
  buttons?: any[];
  blockIndex?: number;
  studioMode?: boolean;
}) {
  const displayButtons = safeArray(buttons);
  
  if (displayButtons.length === 0) return null;

  return (
    <div className="button-row">
      {displayButtons.map((btn, i) => (
        <a 
          key={i}
          className={`btn ${btn.variant === "secondary" ? "secondary" : "primary"}`} 
          href={btn.url || "#"} 
          data-edit-path={studioMode && blockIndex !== undefined ? `blocks.${blockIndex}.buttons.${i}.label` : undefined}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          {btn.icon && <span className="btn-icon">{iconFor(btn.icon)}</span>}
          {btn.label}
        </a>
      ))}
    </div>
  );
}

function WhatsAppButton({
  block,
  tenant,
  sectionField,
}: {
  block: any;
  tenant: Tenant;
  sectionField?: string;
}) {
  const phone = block?.phone || tenant.business?.whatsapp?.replace(/\D/g, "");
  if (!phone) return null;

  const message = block?.message || `Hi Dr. ${tenant.profile.displayName}, I'd like to book an appointment.`;
  const label = block?.label || "Chat on WhatsApp";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-tina-field={sectionField}
      title={label}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        textDecoration: "none",
        fontSize: "28px",
        lineHeight: 1,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
    >
      💬
    </a>
  );
}

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Renders body/description/bio content.
 *
 * Supports two storage formats:
 *  - HTML string (from the richtext WYSIWYG editor) — used directly.
 *  - Plain text / markdown — converted via parseMarkdown().
 *
 * HTML detection: if the trimmed value starts with a tag (e.g. "<p", "<h2",
 * "<ul", "<strong") it is treated as HTML; otherwise as markdown/plain text.
 */
function MarkdownText({ children, editPath, style }: { children?: string; editPath?: string; style?: React.CSSProperties }) {
  if (!children) return null;

  const isHtml = /^<[a-zA-Z]/.test(children.trim());
  const html = isHtml ? children : parseMarkdown(children);
  return (
    <div
      data-edit-path={editPath}
      style={{ fontFamily: "var(--body)", lineHeight: 1.7, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safehref(url: string): string {
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed)) return "#";
  return trimmed;
}

function parseMarkdown(text: string): string {
  const paragraphs = text.split(/\n{2,}/);

  return paragraphs
    .map((para) => {
      const lines = para.split("\n");
      const listItems = lines.filter((l) => /^[-*]\s/.test(l));

      if (listItems.length === lines.length) {
        const lis = lines
          .map((l) => `<li>${inlineMarkdown(l.replace(/^[-*]\s/, ""))}</li>`)
          .join("");
        return `<ul style="padding-left:1.4em;margin:0.5em 0">${lis}</ul>`;
      }

      const content = lines.map(inlineMarkdown).join("<br>");
      return `<p style="margin:0 0 0.75em">${content}</p>`;
    })
    .join("");
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => `<a href="${escapeHtml(safehref(url))}" style="color:var(--primary)">${label}</a>`);
}

function iconToEmoji(icon: string): string {
  const map: Record<string, string> = {
    stethoscope:"🩺",'heart-pulse':"💗", syringe:"💉", bandage:"🩹", pill:"💊", thermometer:"🌡️",
    brain:"🧠", bone:"🦴", heart:"❤️", lungs:"🫁", tooth:"🦷", eye:"👁️", baby:"👶", dna:"🧬",
    microscope:"🔬", ambulance:"🚑", hospital:"🏥", ribbon:"🎗️", siren:"🚨", activity:"📈",
    users:"👥",'user-check':"🥼", smile:"😊", award:"🏆", certificate:"📜", shield:"🛡️",
    star:"⭐", check:"✅", lock:"🔒", verified:"✔️", calendar:"📅", clock:"⏰",
    phone:"📞", mail:"✉️",'map-pin':"📍", whatsapp:"💬", video:"📹", globe:"🌐",
    building:"🏢", home:"🏠", car:"🚗", chart:"📊", document:"📄", sparkles:"✨",
    zap:"⚡", leaf:"🌿", sun:"☀️", info:"ℹ️",'arrow-right':"→",
  };
  return map[icon] ?? "";
}

function iconFor(icon?: string): React.ReactElement | null {
  return iconElement(icon, { width: "1.1em", height: "1.1em" });
}

function Testimonials({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant?: string;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const testimonials = safeArray(block?.items);
  if (testimonials.length === 0) return null;

  return (
    <Section className={`block testimonials-section${variant ? ` testimonials-${variant}` : ""}`} sectionField={sectionField} style={block?.css} backgroundImage={block?.backgroundImage}>
      <BlockTitle kicker={block?.kicker ?? "Testimonials"} title={block?.title ?? "What our patients say"} />
      <div className="testimonials-grid">
        {testimonials.map((t: any, i: number) => (
          <Card key={i} className="testimonial-card">
            <Text editPath={studioMode ? `blocks.${blockIndex}.items.${i}.quote` : undefined}>"{t.quote}"</Text>
            <div style={{ marginTop: "16px", fontWeight: "bold" }}>
              <span data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.author` : undefined}>- {t.author || "Patient"}</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Stats({
  tenant,
  block,
  blockIndex,
  variant,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  variant?: string;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const stats = safeArray(block?.items);
  if (stats.length === 0) return null;

  return (
    <Section
      className={`block stats-section${variant ? ` stats-${variant}` : ""}`}
      sectionField={sectionField}
      style={block?.css}
      backgroundImage={block?.backgroundImage}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "24px", textAlign: "center" }}>
        {stats.map((s: any, i: number) => (
          <div key={i} className="stat-item" style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "8px" }} data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.value` : undefined}>
              {s.value}
            </div>
            <div style={{ fontSize: "1rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }} data-edit-path={studioMode ? `blocks.${blockIndex}.items.${i}.label` : undefined}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
