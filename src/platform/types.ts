export type TenantType = "doctor" | "hospital";

export type TenantBlock =
  | {
      _template: "hero";
      enabled?: boolean;
    }
  | {
      _template: "profile";
      enabled?: boolean;
    }
  | {
      _template: "services";
      enabled?: boolean;
      kicker?: string;
      title?: string;
    }
  | {
      _template: "timings";
      enabled?: boolean;
      kicker?: string;
      title?: string;
    }
  | {
      _template: "gallery";
      enabled?: boolean;
      kicker?: string;
      title?: string;
    }
  | {
      _template: "faq";
      enabled?: boolean;
      kicker?: string;
      title?: string;
    }
  | {
      _template: "cta";
      enabled?: boolean;
      title?: string;
      body?: string;
    }
  | {
      _template: "text";
      enabled?: boolean;
      heading?: string;
      body?: string;
    };

export type PageContent = {
  headline: string;
  subheadline: string;
  copy: Record<string, string>;
  services: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  timings: Array<{
    day: string;
    primary: string;
    secondary: string;
  }>;
  gallery: Array<{
    src: string;
    alt: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  blocks?: TenantBlock[];
};

export type Presentation = {
  themeId: string;
  variantPresetId: string;
  styleId: string;
};

export type SEO = {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
};

export type TenantPage = {
  slug: string;
  title: string;
  path: string;
  isHome?: boolean;
  presentation?: Presentation;
  seo?: SEO;
  content: PageContent;
};

export type TenantSite = {
  tenantId: string;
  tenantType: TenantType;
  status: string;
  subscription: {
    plan: string;
    billingCycle: string;
    validFrom: string;
    validUntil: string;
    graceUntil: string;
    paymentStatus: string;
  };
  domains: {
    primary: string;
    aliases?: string[];
  };
  profile: {
    displayName: string;
    specialty: string;
    degrees: string[];
    registrationNumber: string;
    experienceYears: number;
    bio: string;
    photo: string;
  };
  business: {
    clinicName: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    mapUrl: string;
  };
  presentation: Presentation & {
    style: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
      };
      shape: {
        radius: string;
      };
      typography: {
        heading: string;
        body: string;
      };
    };
  };
  seo: SEO;
  pages?: TenantPage[];
};

export type Tenant = TenantSite & TenantPage;

export type TenantFolderEntry = {
  tenantSlug: string;
  tenantType: TenantType;
  site: TenantSite;
  pages: TenantPage[];
};

export type VariantPreset = {
  hero: string;
  profile: string;
  services: string;
  timings: string;
  gallery: string;
  faq: string;
  cta: string;
};
