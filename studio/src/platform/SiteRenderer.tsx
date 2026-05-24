"use client";

import React, { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";
import { getPreset, getThemeBlocks, stylePresets } from "./catalog";
import type { Tenant, TenantBlock } from "./types";
import { toSiteSettingsPathFromFlat } from "./siteSettingsNormalize";

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

export function SiteRenderer({ tenant, pageSlug = "home", previewLinks = false, tinaDocument, studioMode = false }: SiteRendererProps) {
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

  return (
    <main className={`site-shell ${tenant.tenantType}`} style={cssVars}>
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
            sectionField={
              studioMode
                ? siteAwareTinaField((tinaDocument ?? (tenant as Record<string, unknown>)) as Record<string, unknown>, "footer")
                : undefined
            }
          />
        )}
      </article>
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
          />
        ));
      case "footer":
        return withScrollAnchor(key, "footer", (
          <Footer
            tenant={tenant}
            copyright={activeBlock?.copyright || tenant.footer?.copyright}
            socialLinks={activeBlock?.socialLinks || tenant.footer?.socialLinks}
            sectionField={sectionField}
            studioMode={studioMode}
            css={activeBlock?.css}
          />
        ));
      case "awards":
        return withScrollAnchor(key, "awards", (
          <Awards
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        ));
      case "hero":
        return withScrollAnchor(key, "hero", (
          <Hero tenant={tenant} block={activeBlock} blockIndex={index} variant={preset.hero} sectionField={sectionField} tinaDocument={tinaDocument} studioMode={studioMode} />
        ));
      case "profile":
        return withScrollAnchor(key, "profile", (
          <Profile
            tenant={tenant}
            block={activeBlock}
            blockIndex={index}
            variant={preset.profile}
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
            variant={preset.services}
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
            variant={preset.timings}
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
            variant={preset.gallery}
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
            variant={preset.faq}
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
            variant={preset.cta}
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
            sectionField={sectionField}
            studioMode={studioMode}
          />
        ));
      case "text":
        return withScrollAnchor(key, "text", (
          <TextBlock block={activeBlock} blockIndex={index} sectionField={sectionField} studioMode={studioMode} />
        ));
      default:
        return null;
    }
  });
}
type NavLinkItem =
  | { _template: 'sectionLink'; label: string; sectionId: string }
  | { _template: 'pageLink'; label: string; pageSlug: string }
  | { _template: 'externalLink'; label: string; url: string };

function resolveNavLink(link: string | NavLinkItem): { label: string; href: string } {
  if (typeof link === 'string') {
    const [label, url] = link.includes('|') ? link.split('|') : [link, '#'];
    return { label, href: url };
  }
  if (link._template === 'sectionLink') return { label: link.label, href: `#${link.sectionId}` };
  if (link._template === 'pageLink') return { label: link.label, href: `/${link.pageSlug}` };
  if (link._template === 'externalLink') return { label: link.label, href: link.url };
  return { label: '', href: '#' };
}

function Header({
  tenant,
  logo,
  navLinks,
  sectionField,
  studioMode,
  css,
}: {
  tenant: Tenant;
  logo?: string;
  navLinks?: (string | NavLinkItem)[];
  sectionField?: string;
  studioMode?: boolean;
  css?: any;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayLogo = logo || tenant.profile.photo;
  const links = Array.isArray(navLinks) && navLinks.length > 0 ? navLinks : ["Services", "About", "Contact"];

  return (
    <Section tag="header" className="site-header" sectionField={sectionField} style={css}>
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
            const { label, href } = resolveNavLink(link);
            return (
              <a
                key={i}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: "14px", fontWeight: 600, color: "var(--site-text)", opacity: 0.8, textDecoration: "none" }}
              >
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
  sectionField,
  studioMode,
  css,
}: {
  tenant: Tenant;
  copyright?: string;
  socialLinks?: (string | NavLinkItem)[];
  sectionField?: string;
  studioMode?: boolean;
  css?: any;
}) {
  const displayCopyright = copyright || `© ${new Date().getFullYear()} ${tenant.profile.displayName}. All rights reserved.`;
  const links = Array.isArray(socialLinks) && socialLinks.length > 0 ? socialLinks : ["Facebook|#", "Twitter|#", "Instagram|#"];

  return (
    <Section tag="footer" className="site-footer" sectionField={sectionField} style={css}>
      <div style={{ padding: "40px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "40px" }}>
        <div style={{ maxWidth: "300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <img src={tenant.profile.photo} alt="Logo" style={{ height: "32px", width: "32px", borderRadius: "50%", objectFit: "cover" }} />
            <strong style={{ fontSize: "16px" }}>{tenant.profile.displayName}</strong>
          </div>
          <p style={{ fontSize: "14px", opacity: 0.6, lineHeight: 1.6 }}>{tenant.profile.bio?.slice(0, 100)}...</p>
        </div>
        
        <div>
          <h4 style={{ fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Connect</h4>
          <div style={{ display: "flex", gap: "16px" }}>
            {links.map((link, i) => {
              const { label, href } = resolveNavLink(link);
              return (
                <a key={i} href={href} style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: "12px", opacity: 0.5, textAlign: "center" }}>
        {displayCopyright}
      </div>
      </div>
    </Section>
  );
}

function Awards({
  tenant,
  block,
  blockIndex,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const awards = Array.isArray(block?.items) && block?.items.length > 0 ? block?.items : [
    { title: "Best Healthcare Provider", year: "2023", organization: "Global Health Awards" },
    { title: "Excellence in Surgery", year: "2022", organization: "National Medical Board" }
  ];

  return (
    <Section className="block awards-section" sectionField={sectionField} style={block?.css}>
      <BlockTitle kicker={block?.kicker ?? "Recognition"} title={block?.title ?? "Awards & Achievements"} />
      <div className="awards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
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
    <Section className={`hero hero-${variant}`} sectionField={sectionField} style={block?.css}>
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
    <Section className={`block profile profile-${variant}`} sectionField={sectionField} style={block?.css}>
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
        <Text 
          editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}
        >
          {block?.body || tenant.profile.bio}
        </Text>
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
    <Section className="block" sectionField={sectionField} style={block?.css}>
      <BlockTitle kicker={block?.kicker ?? "Services"} title={block?.title ?? "What We Offer"} />
      <div className={`services services-${variant}`}>
        {safeArray(block?.items).map((service: any, index: number) => (
          <Card key={`${service?.title ?? "service"}-${index}`} className="service-card">
            <span className="icon">{iconFor(service.icon)}</span>
            <h3 data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.title` : undefined}>{service.title}</h3>
            <Text editPath={studioMode ? `blocks.${blockIndex}.items.${index}.description` : undefined}>{service.description}</Text>
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
    <Section className="block" sectionField={sectionField} style={block?.css}>
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
    <Section className="block" sectionField={sectionField} style={block?.css}>
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
    <Section className="block" sectionField={sectionField} style={block?.css}>
      <BlockTitle kicker={block?.kicker ?? "FAQ"} title={block?.title ?? "Frequently Asked Questions"} />
      <div className={`faq faq-${variant}`}>
        {safeArray(block?.items).map((faq: any, index: number) => (
          <Card key={`${faq?.question ?? "faq"}-${index}`} className="faq-card">
            <h3 data-edit-path={studioMode ? `blocks.${blockIndex}.items.${index}.question` : undefined}>{faq.question}</h3>
            <Text editPath={studioMode ? `blocks.${blockIndex}.items.${index}.answer` : undefined}>{faq.answer}</Text>
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
    <Section className={`cta cta-${variant}`} sectionField={sectionField} style={block?.css}>
      <div className="cta-content">
        <Heading level={2} editPath={studioMode ? `blocks.${blockIndex}.title` : undefined}>
          {block?.title || "Ready to book?"}
        </Heading>
        <Text editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>{block?.body}</Text>
      </div>
      <ButtonGroup 
        buttons={block?.buttons}
        blockIndex={blockIndex} 
        studioMode={studioMode} 
      />
    </Section>
  );
}

function TextBlock({ block, blockIndex, sectionField, studioMode }: { block: any; blockIndex: number; sectionField?: string; studioMode?: boolean }) {
  if (!block?.heading && !block?.body) return null;

  return (
    <Section className="block text-block" sectionField={sectionField} style={block?.css}>
      {block?.heading ? <Heading level={2} editPath={studioMode ? `blocks.${blockIndex}.heading` : undefined}>{block?.heading}</Heading> : null}
      {block?.body ? <Text editPath={studioMode ? `blocks.${blockIndex}.body` : undefined}>{block?.body}</Text> : null}
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
}: {
  tag?: any;
  className?: string;
  children: ReactNode;
  sectionField?: string;
  style?: any;
}) {
  const reactId = typeof React !== "undefined" && (React as any).useId 
    ? (React as any).useId() 
    : useMemo(() => `s-${Math.random().toString(36).substring(2, 6)}`, []);

  const sectionId = useMemo(() => {
    if (!sectionField) return `section-${reactId.replace(/:/g, "")}`;
    return `tina-${sectionField.replace(/\./g, "-")}`;
  }, [sectionField, reactId]);

  const parsedStyle = useMemo(() => {
    if (typeof style === "string") {
      try {
        return JSON.parse(style);
      } catch (e) {
        return {};
      }
    }
    return style;
  }, [style]);

  const cssRules = useMemo(() => {
    if (!parsedStyle || typeof parsedStyle !== "object" || Object.keys(parsedStyle).length === 0) {
      return null;
    }
    return Object.entries(parsedStyle)
      .filter(([_, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v} !important;`)
      .join(" ");
  }, [parsedStyle]);

  return (
    <Tag id={sectionId} className={className} data-tina-field={sectionField} style={parsedStyle}>
      {cssRules && (
        <style
          dangerouslySetInnerHTML={{
            __html: `#${sectionId} { ${cssRules} }`,
          }}
        />
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

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function iconFor(icon?: string) {
  const icons: Record<string, string> = {
    heart: "♡",
    activity: "∿",
    scan: "⌖",
    cross: "+",
    users: "◎",
    phone: "📞",
    whatsapp: "💬",
    map: "📍",
    email: "✉",
    calendar: "📅",
    clock: "🕒",
    award: "🏆",
    star: "⭐",
    check: "✓",
    facebook: "fb",
    twitter: "tw",
    instagram: "ig",
    linkedin: "in",
    youtube: "yt",
  };

  return icons[icon ?? ""] ?? "";
}

function Testimonials({
  tenant,
  block,
  blockIndex,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const testimonials = safeArray(block?.items);
  if (testimonials.length === 0) return null;

  return (
    <Section className="block testimonials-section" sectionField={sectionField} style={block?.css}>
      <BlockTitle kicker={block?.kicker ?? "Testimonials"} title={block?.title ?? "What our patients say"} />
      <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
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
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  block: any;
  blockIndex: number;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const stats = safeArray(block?.items);
  if (stats.length === 0) return null;

  return (
    <Section 
      className="block stats-section" 
      sectionField={sectionField} 
      style={{ 
        background: "var(--primary)", 
        color: "white", 
        borderRadius: "var(--radius)",
        ...block?.css // Merge with overrides
      }}
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
