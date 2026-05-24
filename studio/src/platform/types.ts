export type TenantType = "doctor" | "hospital";

export type TenantBlock =
  | {
      _template: "header";
      enabled?: boolean;
      logo?: string;
      navLinks?: string[];
    }
  | {
      _template: "awards";
      enabled?: boolean;
      kicker?: string;
      title?: string;
      items?: Array<{ title: string; year: string; organization: string }>;
    }
  | {
      _template: "hero";
      enabled?: boolean;
      headline?: string;
      subheadline?: string;
      photo?: string;
      buttons?: Array<{ label: string; url: string; icon?: string; variant?: "primary" | "secondary" }>;
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
      items?: Array<{ title: string; description: string; icon?: string }>;
    }
  | {
      _template: "timings";
      enabled?: boolean;
      kicker?: string;
      title?: string;
      items?: Array<{ day: string; primary: string; secondary: string }>;
    }
  | {
      _template: "gallery";
      enabled?: boolean;
      kicker?: string;
      title?: string;
      items?: Array<{ src: string; alt: string }>;
    }
  | {
      _template: "faq";
      enabled?: boolean;
      kicker?: string;
      title?: string;
      items?: Array<{ question: string; answer: string }>;
    }
  | {
      _template: "testimonials";
      enabled?: boolean;
      kicker?: string;
      title?: string;
      items?: Array<{ quote: string; author: string }>;
    }
  | {
      _template: "stats";
      enabled?: boolean;
      items?: Array<{ value: string; label: string }>;
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
  slug?: string;
  title?: string;
  path?: string;
  isHome?: boolean;
  presentation?: Presentation;
  seo?: SEO;
  settings?: Array<
    | ({ _template: "urlSettings" } & { slug?: string; title?: string; path?: string; isHome?: boolean })
    | ({ _template: "presentation" } & Presentation)
    | ({ _template: "seo" } & SEO)
  >;
  blocks: TenantBlock[];
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
  analytics?: {
    gaMeasurementId?: string;
    gtmContainerId?: string;
    metaPixelId?: string;
  };
  header?: {
    show?: boolean;
    logo?: string;
    navLinks?: string[];
  };
  pages?: TenantPage[];
};

export type Tenant = TenantSite & TenantPage;

export type VariantPreset = {
  hero: string;
  profile: string;
  services: string;
  timings: string;
  gallery: string;
  faq: string;
  cta: string;
};

export type StylePreset = {
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
