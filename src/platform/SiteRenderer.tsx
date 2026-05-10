 "use client";

import type { CSSProperties, ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";
import { getPreset } from "./catalog";
import type { Tenant, TenantBlock } from "./types";

type SiteRendererProps = {
  tenant: Tenant;
  previewLinks?: boolean;
  tinaDocument?: Record<string, unknown>;
  studioMode?: boolean;
};

export function SiteRenderer({ tenant, previewLinks = false, tinaDocument, studioMode = false }: SiteRendererProps) {
  const preset = getPreset(tenant);
  const style = tenant.presentation.style;
  const tinaContent = (tinaDocument?.content as Record<string, unknown> | undefined) ?? undefined;
  const cssVars = {
    "--primary": style.colors.primary,
    "--secondary": style.colors.secondary,
    "--accent": style.colors.accent,
    "--site-bg": style.colors.background,
    "--surface": style.colors.surface,
    "--site-text": style.colors.text,
    "--radius": style.shape.radius,
    "--heading": style.typography.heading,
    "--body": style.typography.body,
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
  const blocks = tenant.content.blocks ?? defaultBlocks;
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
  return (
    <div className="subscription-bar">
      <span>{tenant.status}</span>
      <strong>{tenant.subscription.plan}</strong>
      <span>Valid until {tenant.subscription.validUntil}</span>
      <span>{tenant.domains.primary}</span>
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
          field={tinaDocument ? tinaField(tinaDocument as object, "profile.specialty") : undefined}
          editPath={studioMode ? "profile.specialty" : undefined}
        >
          {tenant.profile.specialty}
        </Eyebrow>
        <Heading
          level={1}
          field={tinaContent ? tinaField(tinaContent as object, "headline") : undefined}
          editPath={studioMode ? "content.headline" : undefined}
        >
          {tenant.content.headline}
        </Heading>
        <Text
          field={tinaContent ? tinaField(tinaContent as object, "subheadline") : undefined}
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
          {tenant.profile.degrees.map((degree) => (
            <span className="chip" key={degree}>
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
        {tenant.content.services.map((service, index) => (
          <Card key={service.title}>
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
        {tenant.content.timings.map((timing, index) => (
          <Card key={timing.day}>
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
}: {
  tenant: Tenant;
  variant: string;
  kicker?: string;
  title?: string;
  sectionField?: string;
  tinaDocument?: Record<string, unknown>;
}) {
  return (
    <Section className="block" sectionField={sectionField}>
      <BlockTitle kicker={kicker ?? copy(tenant, "galleryKicker")} title={title ?? copy(tenant, "galleryTitle")} />
      <div className={`gallery gallery-${variant}`}>
        {tenant.content.gallery.map((image) => (
          <ImagePrimitive key={image.src} src={image.src} alt={image.alt} />
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
        {tenant.content.faqs.map((faq, index) => (
          <Card key={faq.question}>
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
  const whatsapp = tenant.business.whatsapp.replace(/\D/g, "");

  return (
    <div className="button-row">
      <a className="btn primary" href={`https://wa.me/${whatsapp}`}>
        {copy(tenant, "whatsappLabel")}
      </a>
      <a className="btn secondary" href={`tel:${tenant.business.phone}`}>
        {copy(tenant, "callLabel")}
      </a>
    </div>
  );
}

function copy(tenant: Tenant, key: string) {
  return tenant.content.copy[key] ?? key;
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
