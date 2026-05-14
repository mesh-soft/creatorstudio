"use client";

import { useTina } from "tinacms/dist/react";
import { SiteRenderer } from "@/platform/SiteRenderer";
import { unwrapSiteSettingsToFlat } from "@/platform/siteSettingsNormalize";
import type { Tenant, TenantBlock } from "@/platform/types";

type SitePageClientProps = {
  query: string;
  variables: {
    relativePath: string;
  };
  data: unknown;
};

type TinaDocument = {
  tenantId?: string;
  tenantType?: "doctor" | "hospital";
  status?: string;
  settings?: Array<Record<string, unknown>>;
  subscription?: Tenant["subscription"];
  domains?: Tenant["domains"];
  profile?: Tenant["profile"];
  business?: Tenant["business"];
  presentation?: Tenant["presentation"];
  header?: Tenant["header"];
  seo?: Tenant["seo"];
  content?: Tenant["content"] & {
    blocks?: Array<Record<string, unknown>>;
  };
};

export function SitePageClient({ query, variables, data }: SitePageClientProps) {
  const { data: liveData } = useTina({
    query,
    variables,
    data: (data ?? {}) as Record<string, unknown>,
  });

  const raw = ((liveData as { doctor?: TinaDocument; hospital?: TinaDocument }).doctor ??
    (liveData as { doctor?: TinaDocument; hospital?: TinaDocument }).hospital) as TinaDocument;

  const document = unwrapSiteSettingsToFlat(raw as Record<string, unknown>) as TinaDocument;

  const tenant = normalizeTenant(document);

  return <SiteRenderer tenant={tenant} tinaDocument={raw as Record<string, unknown>} />;
}

function normalizeTenant(document: TinaDocument): Tenant {
  return {
    tenantId: document.tenantId ?? "",
    tenantType: document.tenantType ?? "doctor",
    slug: "home",
    title: "Home",
    path: "/",
    isHome: true,
    status: document.status ?? "trial",
    subscription: document.subscription ?? {
      plan: "",
      billingCycle: "",
      validFrom: "",
      validUntil: "",
      graceUntil: "",
      paymentStatus: "",
    },
    domains: document.domains ?? {
      primary: "",
      aliases: [],
    },
    profile: document.profile ?? {
      displayName: "",
      specialty: "",
      degrees: [],
      registrationNumber: "",
      experienceYears: 0,
      bio: "",
      photo: "",
    },
    business: document.business ?? {
      clinicName: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      mapUrl: "",
    },
    presentation: document.presentation ?? {
      themeId: "",
      variantPresetId: "",
      styleId: "",
      style: {
        colors: {
          primary: "",
          secondary: "",
          accent: "",
          background: "",
          surface: "",
          text: "",
        },
        shape: {
          radius: "8px",
        },
        typography: {
          heading: "Inter, Arial, sans-serif",
          body: "Inter, Arial, sans-serif",
        },
      },
    },
    header: document.header ?? {
      show: true,
      logo: undefined,
      navLinks: [],
    },
    seo: document.seo ?? {
      title: "",
      description: "",
      keywords: [],
      ogImage: "",
    },
    content: {
      headline: document.content?.headline ?? "",
      subheadline: document.content?.subheadline ?? "",
      copy: document.content?.copy ?? {},
      services: document.content?.services ?? [],
      timings: document.content?.timings ?? [],
      gallery: document.content?.gallery ?? [],
      faqs: document.content?.faqs ?? [],
      testimonials: document.content?.testimonials ?? [],
      stats: document.content?.stats ?? [],
      blocks: normalizeBlocks(document.content?.blocks),
    },
  };
}

function normalizeBlocks(blocks?: Array<Record<string, unknown>>): TenantBlock[] {
  if (!blocks) return [];

  const templateMap: Record<string, TenantBlock["_template"]> = {
    DoctorContentBlocksHero: "hero",
    DoctorContentBlocksProfile: "profile",
    DoctorContentBlocksServices: "services",
    DoctorContentBlocksTimings: "timings",
    DoctorContentBlocksGallery: "gallery",
    DoctorContentBlocksFaq: "faq",
    DoctorContentBlocksCta: "cta",
    DoctorContentBlocksText: "text",
    HospitalContentBlocksHero: "hero",
    HospitalContentBlocksProfile: "profile",
    HospitalContentBlocksServices: "services",
    HospitalContentBlocksTimings: "timings",
    HospitalContentBlocksGallery: "gallery",
    HospitalContentBlocksFaq: "faq",
    HospitalContentBlocksCta: "cta",
    HospitalContentBlocksText: "text",
  };

  return blocks
    .map((block) => {
      const typename = typeof block.__typename === "string" ? block.__typename : "";
      const mappedTemplate = templateMap[typename];
      const template = (typeof block._template === "string" ? block._template : mappedTemplate) as
        | TenantBlock["_template"]
        | undefined;

      if (!template) return null;

      return {
        _template: template,
        enabled: typeof block.enabled === "boolean" ? block.enabled : true,
        kicker: typeof block.kicker === "string" ? block.kicker : undefined,
        title: typeof block.title === "string" ? block.title : undefined,
        body: typeof block.body === "string" ? block.body : undefined,
        heading: typeof block.heading === "string" ? block.heading : undefined,
      } as TenantBlock;
    })
    .filter((block): block is TenantBlock => block !== null);
}
