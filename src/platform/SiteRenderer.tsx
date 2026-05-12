 "use client";

import type { CSSProperties, ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";
import { getPreset, stylePresets } from "./catalog";
import type { Tenant, TenantBlock } from "./types";

type SiteRendererProps = {
  tenant: Tenant;
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

export function SiteRenderer({ tenant, previewLinks = false, tinaDocument, studioMode = false }: SiteRendererProps) {
  const preset = getPreset(tenant);
  const styleId = tenant.presentation?.styleId;
  const catalogStyle = styleId ? stylePresets[styleId] : undefined;
  
  // Priority: Catalog Preset -> Explicit Style Object -> Default Style
  const style = catalogStyle ?? tenant.presentation?.style ?? defaultStyle;
  const colors = style.colors ?? defaultStyle.colors;
  const shape = style.shape ?? defaultStyle.shape;
  const typography = style.typography ?? defaultStyle.typography;
  const tinaContent = (tinaDocument?.content as Record<string, unknown> | undefined) ?? undefined;
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
  } as CSSProperties;

  return (
    <main className={`site-shell ${tenant.tenantType}`} style={cssVars}>
      {previewLinks ? <PreviewHeader tenant={tenant} /> : null}
      <article className="tenant-site">
        <SubscriptionBar tenant={tenant} />
        {renderBlocks(tenant, preset, tinaDocument, studioMode)}
      </article>
    </main>
  );
}

function renderBlocks(
  tenant: Tenant,
  preset: ReturnType<typeof getPreset>,
  tinaDocument?: Record<string, unknown>,
  studioMode = false
) {
  const blocks = Array.isArray(tenant.content.blocks) && tenant.content.blocks.length > 0 ? tenant.content.blocks : defaultBlocks;
  const tinaBlocks = Array.isArray((tinaDocument?.content as { blocks?: unknown[] } | undefined)?.blocks)
    ? ((tinaDocument?.content as { blocks?: unknown[] }).blocks ?? [])
    : [];

  return blocks.map((block, index) => {
    if (block.enabled === false) return null;

    const key = `${block._template}-${index}`;
    const tinaBlock = (tinaBlocks[index] as Record<string, unknown> | undefined) ?? undefined;
    const sectionField = tinaBlock ? tinaField(tinaBlock) : undefined;

    switch (block._template) {
      case "hero":
        return <Hero key={key} tenant={tenant} variant={preset.hero} sectionField={sectionField} tinaDocument={tinaDocument} />;
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
      case "text":
        return <TextBlock key={key} heading={block.heading} body={block.body} sectionField={sectionField} />;
      default:
        return null;
    }
  });
}

const defaultBlocks: TenantBlock[] = [
  { _template: "hero", enabled: true },
  { _template: "profile", enabled: true },
  { _template: "services", enabled: true },
  { _template: "timings", enabled: true },
  { _template: "gallery", enabled: true },
  { _template: "faq", enabled: true },
  { _template: "cta", enabled: true },
];

function PreviewHeader({ tenant }: { tenant: Tenant }) {
  return (
    <nav className="preview-header">
      <strong>{tenant.profile.displayName}</strong>
      <a href={`/site/${tenant.tenantId}`}>Open final website</a>
      <a href="/admin/index.html">Open Tina admin</a>
    </nav>
  );
}

function SubscriptionBar({ tenant }: { tenant: Tenant }) {
  const status = tenant.status ?? "active";
  const plan = tenant.subscription?.plan ?? "free";
  const validUntil = tenant.subscription?.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const domain = tenant.domains?.primary ?? "localhost:3000";
  
  return (
    <div className="subscription-bar">
      <span>{status}</span>
      <strong>{plan}</strong>
      <span>Valid until {validUntil}</span>
      <span>{domain}</span>
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
      <div>
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
      <ImagePrimitive src={tenant.profile.photo} alt={tenant.profile.displayName} className="hero-photo" />
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
      <div>
        <Eyebrow>{tenant.tenantType === "doctor" ? "Profile" : "Overview"}</Eyebrow>
        <Heading level={2} editPath={studioMode ? "profile.displayName" : undefined}>
          {tenant.profile.displayName}
        </Heading>
        <Text editPath={studioMode ? "profile.bio" : undefined}>{tenant.profile.bio}</Text>
        <div className="chip-row">
          {(Array.isArray(tenant.profile.degrees) ? tenant.profile.degrees : []).map((degree, index) => (
            <span className="chip" key={`${degree}-${index}`}>
              {degree}
            </span>
          ))}
        </div>
      </div>
      <Card>
        <strong>{tenant.profile.specialty}</strong>
        <Text>{tenant.profile.experienceYears}+ years experience</Text>
        <small>Reg. {tenant.profile.registrationNumber}</small>
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
          <Card key={`${service?.title ?? "service"}-${index}`}>
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
          <Card key={`${timing?.day ?? "timing"}-${index}`}>
            <strong data-edit-path={studioMode ? `content.timings.${index}.day` : undefined}>{timing.day}</strong>
            <span data-edit-path={studioMode ? `content.timings.${index}.primary` : undefined}>{timing.primary}</span>
            <small data-edit-path={studioMode ? `content.timings.${index}.secondary` : undefined}>{timing.secondary}</small>
          </Card>
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
          <ImagePrimitive key={`${image?.src ?? "image"}-${index}`} src={image.src} alt={image.alt} />
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
          <Card key={`${faq?.question ?? "faq"}-${index}`}>
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
      <div>
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
    <Tag data-tina-field={field} data-edit-path={editPath}>
      {children}
    </Tag>
  );
}

function Text({ children, field, editPath }: { children: ReactNode; field?: string; editPath?: string }) {
  return (
    <p data-tina-field={field} data-edit-path={editPath}>
      {children}
    </p>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <article className="card">{children}</article>;
}

function ImagePrimitive({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <img className={className} src={src} alt={alt} loading="lazy" />;
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
