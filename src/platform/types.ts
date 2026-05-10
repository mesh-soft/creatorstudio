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

export type Tenant = {
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
  presentation: {
    themeId: string;
    variantPresetId: string;
    styleId: string;
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
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
  content: {
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
