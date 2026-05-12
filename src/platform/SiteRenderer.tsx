"use client";

import type { CSSProperties, ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";
import { getPreset, getThemeBlocks, stylePresets } from "./catalog";
import type { Tenant, TenantBlock } from "./types";

type SiteRendererProps = {
  tenant: Tenant;
  pageSlug?: string;
  previewLinks?: boolean;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
};

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
  const pageBlocks = Array.isArray(tenant.content.blocks) && tenant.content.blocks.length > 0 
    ? tenant.content.blocks 
    : themeBlocks;

  const hasPageHeader = pageBlocks.some(b => b._template === "header" && b.enabled !== false);
  const showGlobalHeader = !hasPageHeader && (tenant.header?.show ?? true);

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
            sectionField={studioMode ? tinaField(tenant as any, "header" as any) : undefined}
          />
        )}

        {renderBlocks(tenant, preset, pageBlocks, tinaDocument, studioMode)}
      </article>
    </main>
  );
}

function renderBlocks(
  tenant: Tenant,
  preset: ReturnType<typeof getPreset>,
  blocks: TenantBlock[],
  tinaDocument?: Record<string, unknown>,
  studioMode = false
) {
  const tinaBlocks = Array.isArray((tinaDocument?.content as { blocks?: unknown[] } | undefined)?.blocks)
    ? ((tinaDocument?.content as { blocks?: unknown[] }).blocks ?? [])
    : [];

  return blocks.map((block, index) => {
    if (block.enabled === false) return null;

    const key = `${block._template}-${index}`;
    const tinaBlock = (tinaBlocks[index] as Record<string, unknown> | undefined) ?? undefined;
    const sectionField = tinaBlock ? tinaField(tinaBlock) : undefined;

    switch (block._template) {
      case "header":
        return (
          <Header 
            key={key} 
            tenant={tenant} 
            logo={block.logo || tenant.header?.logo} 
            navLinks={block.navLinks || tenant.header?.navLinks} 
            sectionField={sectionField} 
            studioMode={studioMode} 
          />
        );
      case "awards":
        return (
          <Awards
            key={key}
            tenant={tenant}
            items={block.items}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        );
      case "hero":
        return <Hero key={key} tenant={tenant} variant={preset.hero} sectionField={sectionField} tinaDocument={tinaDocument} studioMode={studioMode} />;
      case "profile":
        return (
          <Profile
            key={key}
            tenant={tenant}
            variant={preset.profile}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "services":
        return (
          <Services
            key={key}
            tenant={tenant}
            variant={preset.services}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "timings":
        return (
          <Timings
            key={key}
            tenant={tenant}
            variant={preset.timings}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "gallery":
        return (
          <Gallery
            key={key}
            tenant={tenant}
            variant={preset.gallery}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "faq":
        return (
          <FAQ
            key={key}
            tenant={tenant}
            variant={preset.faq}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "cta":
        return (
          <CTA
            key={key}
            tenant={tenant}
            variant={preset.cta}
            title={block.title}
            body={block.body}
            sectionField={sectionField}
            tinaDocument={tinaDocument}
            studioMode={studioMode}
          />
        );
      case "testimonials":
        return (
          <Testimonials
            key={key}
            tenant={tenant}
            kicker={block.kicker}
            title={block.title}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        );
      case "stats":
        return (
          <Stats
            key={key}
            tenant={tenant}
            sectionField={sectionField}
            studioMode={studioMode}
          />
        );
      case "text":
        return <TextBlock key={key} heading={block.heading} body={block.body} sectionField={sectionField} />;
      default:
        return null;
    }
  });
}

function Header({
  tenant,
  logo,
  navLinks,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  logo?: string;
  navLinks?: string[];
  sectionField?: string;
  studioMode?: boolean;
}) {
  const displayLogo = logo || tenant.profile.photo;
  const links = Array.isArray(navLinks) && navLinks.length > 0 ? navLinks : ["Services", "About", "Contact"];

  return (
    <header className="site-header" data-tina-field={sectionField} style={{ padding: "20px 40px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img src={displayLogo} alt="Logo" style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "cover" }} />
        <strong style={{ fontSize: "18px" }}>{tenant.profile.displayName}</strong>
      </div>
      <nav style={{ display: "flex", gap: "24px" }}>
        {links.map((link, i) => {
          const [label, url] = link.includes("|") ? link.split("|") : [link, "#"];
          return (
            <a key={i} href={url} style={{ fontSize: "14px", fontWeight: 600, color: "var(--site-text)", opacity: 0.8, textDecoration: "none" }}>
              {label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

function Awards({
  tenant,
  items,
  kicker,
  title,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  items?: any[];
  kicker?: string;
  title?: string;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const awards = Array.isArray(items) && items.length > 0 ? items : [
    { title: "Best Healthcare Provider", year: "2023", organization: "Global Health Awards" },
    { title: "Excellence in Surgery", year: "2022", organization: "National Medical Board" }
  ];

  return (
    <Section className="block awards-section" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? "Recognition"} title={title ?? "Awards & Achievements"} />
      <div className="awards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        {awards.map((award, i) => (
          <Card key={i} className="award-card" style={{ textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🏆</div>
            <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>{award.title}</h3>
            <div style={{ fontSize: "14px", opacity: 0.6 }}>{award.organization} • {award.year}</div>
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
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  const tinaContent = tinaDocument?.content as Record<string, unknown> | undefined;
  return (
    <Section className={`hero hero-${variant}`} sectionField={sectionField}>
      <div className="hero-content">
        <Eyebrow
          field={tinaDocument ? tinaField(tinaDocument as any, "profile.specialty" as any) : undefined}
          editPath={studioMode ? "profile.specialty" : undefined}
        >
          {tenant.profile.specialty}
        </Eyebrow>
        <Heading
          level={1}
          field={tinaContent ? tinaField(tinaContent as any, "headline" as any) : undefined}
          editPath={studioMode ? "content.headline" : undefined}
        >
          {tenant.content.headline}
        </Heading>
        <Text
          field={tinaContent ? tinaField(tinaContent as any, "subheadline" as any) : undefined}
          editPath={studioMode ? "content.subheadline" : undefined}
        >
          {tenant.content.subheadline}
        </Text>
        <ButtonGroup tenant={tenant} />
      </div>
      <div className="hero-image-wrapper">
        <ImagePrimitive src={tenant.profile.photo} alt={tenant.profile.displayName} className="hero-photo" />
      </div>
    </Section>
  );
}

function Profile({
  tenant,
  variant,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className={`block profile profile-${variant}`} sectionField={sectionField}>
      <div className="profile-info">
        <Eyebrow>{tenant.tenantType === "doctor" ? "Expertise" : "About Us"}</Eyebrow>
        <Heading level={2} editPath={studioMode ? "profile.displayName" : undefined}>
          {tenant.profile.displayName}
        </Heading>
        <Text editPath={studioMode ? "profile.bio" : undefined}>{tenant.profile.bio}</Text>
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
          <strong>{tenant.profile.experienceYears}+</strong>
          <span>Years Experience</span>
        </div>
        <hr style={{ margin: "16px 0", opacity: 0.1 }} />
        <small>Registration: {tenant.profile.registrationNumber}</small>
      </Card>
    </Section>
  );
}

function Services({
  tenant,
  variant,
  kicker,
  title,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  kicker?: string;
  title?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? copy(tenant, "servicesKicker")} title={title ?? copy(tenant, "servicesTitle")} />
      <div className={`services services-${variant}`}>
        {safeArray(tenant.content.services).map((service, index) => (
          <Card key={`${service?.title ?? "service"}-${index}`} className="service-card">
            <span className="icon">{iconFor(service.icon)}</span>
            <h3 data-edit-path={studioMode ? `content.services.${index}.title` : undefined}>{service.title}</h3>
            <Text editPath={studioMode ? `content.services.${index}.description` : undefined}>{service.description}</Text>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Timings({
  tenant,
  variant,
  kicker,
  title,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  kicker?: string;
  title?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? copy(tenant, "timingsKicker")} title={title ?? copy(tenant, "timingsTitle")} />
      <div className={`timings timings-${variant}`}>
        {safeArray(tenant.content.timings).map((timing, index) => (
          <div key={`${timing?.day ?? "timing"}-${index}`} className="timing-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <strong data-edit-path={studioMode ? `content.timings.${index}.day` : undefined}>{timing.day}</strong>
            <div style={{ textAlign: "right" }}>
              <span data-edit-path={studioMode ? `content.timings.${index}.primary` : undefined}>{timing.primary}</span>
              <br />
              <small style={{ opacity: 0.6 }} data-edit-path={studioMode ? `content.timings.${index}.secondary` : undefined}>{timing.secondary}</small>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Gallery({
  tenant,
  variant,
  kicker,
  title,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  kicker?: string;
  title?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? copy(tenant, "galleryKicker")} title={title ?? copy(tenant, "galleryTitle")} />
      <div className={`gallery gallery-${variant}`}>
        {safeArray(tenant.content.gallery).map((image, index) => (
          <div key={`${image?.src ?? "image"}-${index}`} className="gallery-item" style={{ overflow: "hidden", borderRadius: "var(--radius)" }}>
            <ImagePrimitive src={image.src} alt={image.alt} style={{ transition: "transform 0.5s ease" }} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQ({
  tenant,
  variant,
  kicker,
  title,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  kicker?: string;
  title?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className="block" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? copy(tenant, "faqKicker")} title={title ?? copy(tenant, "faqTitle")} />
      <div className={`faq faq-${variant}`}>
        {safeArray(tenant.content.faqs).map((faq, index) => (
          <Card key={`${faq?.question ?? "faq"}-${index}`} className="faq-card">
            <h3 data-edit-path={studioMode ? `content.faqs.${index}.question` : undefined}>{faq.question}</h3>
            <Text editPath={studioMode ? `content.faqs.${index}.answer` : undefined}>{faq.answer}</Text>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function CTA({
  tenant,
  variant,
  title,
  body,
  sectionField,
  tinaDocument,
  studioMode,
}: {
  tenant: Tenant;
  variant: string;
  title?: string;
  body?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
}) {
  return (
    <Section className={`cta cta-${variant}`} sectionField={sectionField}>
      <div className="cta-content">
        <Heading level={2} editPath={studioMode ? "content.copy.ctaTitle" : undefined}>
          {title ?? copy(tenant, "ctaTitle")}
        </Heading>
        <Text editPath={studioMode ? "content.copy.ctaBody" : undefined}>{body ?? copy(tenant, "ctaBody")}</Text>
      </div>
      <ButtonGroup tenant={tenant} />
    </Section>
  );
}

function TextBlock({ heading, body, sectionField }: { heading?: string; body?: string; sectionField?: string }) {
  if (!heading && !body) return null;

  return (
    <Section className="block text-block" sectionField={sectionField}>
      {heading ? <Heading level={2}>{heading}</Heading> : null}
      {body ? <Text>{body}</Text> : null}
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
  className,
  children,
  sectionField,
}: {
  className: string;
  children: ReactNode;
  sectionField?: string;
}) {
  return (
    <section className={className} data-tina-field={sectionField}>
      {children}
    </section>
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

function ButtonGroup({ tenant }: { tenant: Tenant }) {
  const whatsapp = tenant.business?.whatsapp?.replace(/\D/g, "") ?? "";
  const phone = tenant.business?.phone ?? "";

  return (
    <div className="button-row">
      {whatsapp && (
        <a className="btn primary" href={`https://wa.me/${whatsapp}`}>
          {copy(tenant, "whatsappLabel")}
        </a>
      )}
      {phone && (
        <a className="btn secondary" href={`tel:${phone}`}>
          {copy(tenant, "callLabel")}
        </a>
      )}
    </div>
  );
}

function copy(tenant: Tenant, key: string) {
  return tenant.content.copy?.[key] ?? key;
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
  };

  return icons[icon ?? ""] ?? "•";
}

function Testimonials({
  tenant,
  kicker,
  title,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  kicker?: string;
  title?: string;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const testimonials = safeArray(tenant.content.testimonials);
  if (testimonials.length === 0) return null;

  return (
    <Section className="block testimonials-section" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? "Testimonials"} title={title ?? "What our patients say"} />
      <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {testimonials.map((t, i) => (
          <Card key={i} className="testimonial-card">
            <Text editPath={studioMode ? `content.testimonials.${i}.quote` : undefined}>"{t.quote}"</Text>
            <div style={{ marginTop: "16px", fontWeight: "bold" }}>
              <span data-edit-path={studioMode ? `content.testimonials.${i}.author` : undefined}>- {t.author || "Patient"}</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Stats({
  tenant,
  sectionField,
  studioMode,
}: {
  tenant: Tenant;
  sectionField?: string;
  studioMode?: boolean;
}) {
  const stats = safeArray(tenant.content.stats);
  if (stats.length === 0) return null;

  return (
    <Section className="block stats-section" sectionField={sectionField} style={{ background: "var(--primary)", color: "white", borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "24px", textAlign: "center" }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-item" style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "8px" }} data-edit-path={studioMode ? `content.stats.${i}.value` : undefined}>
              {s.value}
            </div>
            <div style={{ fontSize: "1rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }} data-edit-path={studioMode ? `content.stats.${i}.label` : undefined}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
