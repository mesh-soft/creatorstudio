import { defineConfig } from "tinacms";
import type { TinaField } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

function getTenantSlugFromSiteDocument(document: { _sys?: { breadcrumbs?: string[]; filename?: string } } | undefined) {
  const breadcrumbs = document?._sys?.breadcrumbs ?? [];
  const siteIndex = breadcrumbs.indexOf("site");
  return siteIndex > 0 ? breadcrumbs[siteIndex - 1] : breadcrumbs[breadcrumbs.length - 3] ?? document?._sys?.filename ?? "";
}

function getTenantSlugFromPageDocument(document: { _sys?: { breadcrumbs?: string[] } } | undefined) {
  const breadcrumbs = document?._sys?.breadcrumbs ?? [];
  const pagesIndex = breadcrumbs.indexOf("pages");
  return pagesIndex > 0 ? breadcrumbs[pagesIndex - 1] : breadcrumbs[breadcrumbs.length - 3] ?? "";
}

const siteFields: TinaField[] = [
  { type: "string", name: "tenantId", label: "Tenant ID", required: true },
  {
    type: "string",
    name: "tenantType",
    label: "Tenant Type",
    options: ["doctor", "hospital"],
    required: true,
  },
  {
    type: "string",
    name: "status",
    label: "Status",
    options: ["active", "trial", "past_due", "grace", "suspended", "cancelled", "archived"],
  },
  {
    type: "object",
    name: "settings",
    label: "Site Settings",
    list: true,
    ui: {
      disableDrag: true,
      defaultItem: () => [
        { _template: "subscription" },
        { _template: "domains" },
        { _template: "profile" },
        { _template: "business" },
        { _template: "presentation" },
        { _template: "header" },
        { _template: "seo" },
      ],
    },
    templates: [
      {
        name: "subscription",
        label: "Subscription",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "string", name: "plan", label: "Plan" },
          { type: "string", name: "billingCycle", label: "Billing Cycle", options: ["monthly", "yearly"] },
          { type: "string", name: "validFrom", label: "Valid From (YYYY-MM-DD)" },
          { type: "string", name: "validUntil", label: "Valid Until (YYYY-MM-DD)" },
          { type: "string", name: "graceUntil", label: "Grace Until (YYYY-MM-DD)" },
          { type: "string", name: "paymentStatus", label: "Payment Status" },
        ],
      },
      {
        name: "domains",
        label: "Domains",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "string", name: "primary", label: "Primary Domain" },
          { type: "string", name: "aliases", label: "Aliases", list: true },
        ],
      },
      {
        name: "profile",
        label: "Profile",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "string", name: "displayName", label: "Display Name", required: true },
          { type: "string", name: "specialty", label: "Specialty" },
          { type: "string", name: "degrees", label: "Degrees / Badges", list: true },
          { type: "string", name: "registrationNumber", label: "Registration Number" },
          { type: "number", name: "experienceYears", label: "Experience Years" },
          { type: "string", name: "bio", label: "Bio", ui: { component: "textarea" } },
          {
            type: "image",
            name: "photo",
            label: "Photo",
            description: "Upload to Media → content → doctors/hospitals → [tenant] folder",
          },
        ],
      },
      {
        name: "business",
        label: "Business",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "string", name: "clinicName", label: "Clinic / Hospital Name" },
          { type: "string", name: "phone", label: "Phone" },
          { type: "string", name: "whatsapp", label: "WhatsApp" },
          { type: "string", name: "email", label: "Email" },
          { type: "string", name: "address", label: "Address", ui: { component: "textarea" } },
          { type: "string", name: "mapUrl", label: "Map URL" },
        ],
      },
      {
        name: "presentation",
        label: "Presentation",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          {
            type: "string",
            name: "themeId",
            label: "Theme Layout",
            options: [
              { label: "Standard Practice", value: "doctor-standard" },
              { label: "Profile Intensive", value: "doctor-profile-heavy" },
              { label: "Service Focused", value: "doctor-service-heavy" },
              { label: "Hospital Standard", value: "hospital-standard" },
              { label: "Emergency First", value: "hospital-emergency-first" },
              { label: "Departmental", value: "hospital-departments" },
            ],
          },
          {
            type: "string",
            name: "variantPresetId",
            label: "Variant Preset",
            options: [
              { label: "Classic Medical", value: "doctor-classic" },
              { label: "Editorial Showcase", value: "doctor-editorial" },
              { label: "Compact Profile", value: "doctor-compact" },
              { label: "Premium Concierge", value: "doctor-premium" },
              { label: "Specialist Portfolio", value: "doctor-specialist" },
              { label: "Standard Institution", value: "hospital-standard" },
              { label: "Emergency Priority", value: "hospital-emergency" },
              { label: "Specialty Center", value: "hospital-specialty" },
              { label: "Community Health", value: "hospital-community" },
              { label: "Network Directory", value: "hospital-network" },
            ],
          },
          {
            type: "string",
            name: "styleId",
            label: "Style Preset",
            options: [
              { label: "Clinical Emerald", value: "doctor-teal-clean" },
              { label: "Warm Patient-Centric", value: "doctor-premium-warm" },
              { label: "Pediatric Playful", value: "doctor-bright-child" },
              { label: "Minimalist Aesthetic", value: "doctor-derma-minimal" },
              { label: "Modern Specialist", value: "doctor-slate-precision" },
              { label: "Trusted Institution", value: "hospital-blue-modern" },
              { label: "Wellness & Recovery", value: "hospital-green-trust" },
              { label: "High-Response Emergency", value: "hospital-red-emergency" },
              { label: "Corporate Specialty", value: "hospital-indigo-specialty" },
              { label: "Friendly Local Clinic", value: "hospital-community-soft" },
            ],
          },
          {
            type: "object",
            name: "style",
            label: "Style Overrides",
            fields: [
              {
                type: "object",
                name: "colors",
                label: "Colors",
                fields: [
                  { type: "string", name: "primary", label: "Primary" },
                  { type: "string", name: "secondary", label: "Secondary" },
                  { type: "string", name: "accent", label: "Accent" },
                  { type: "string", name: "background", label: "Background" },
                  { type: "string", name: "surface", label: "Surface" },
                  { type: "string", name: "text", label: "Text" },
                ],
              },
              {
                type: "object",
                name: "shape",
                label: "Shape",
                fields: [{ type: "string", name: "radius", label: "Radius" }],
              },
              {
                type: "object",
                name: "typography",
                label: "Typography",
                fields: [
                  { type: "string", name: "heading", label: "Heading Font" },
                  { type: "string", name: "body", label: "Body Font" },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "header",
        label: "Global Header",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "boolean", name: "show", label: "Show Header" },
          { type: "image", name: "logo", label: "Custom Logo" },
          { type: "string", name: "navLinks", label: "Navigation Links (Label|URL)", list: true },
        ],
      },
      {
        name: "seo",
        label: "SEO",
        fields: [
          { type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "string", name: "title", label: "Title" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "keywords", label: "Keywords", list: true },
          {
            type: "image",
            name: "ogImage",
            label: "Open Graph Image",
            description: "Upload to Media → content → doctors/hospitals → [tenant] folder",
          },
        ],
      },
    ],
  },
];

const pageFields: TinaField[] = [
  {
    type: "object",
    name: "blocks",
    label: "Page Blocks",
    list: true,
    ui: {
      itemProps: (item) => {
        const isEnabled = item?.enabled !== false;
        const status = isEnabled ? "" : "🔴 [HIDDEN] ";
        const name = item?.title || item?.headline || item?._template || "Block";
        return { label: `${status}${name}` };
      },
    },
    templates: [
      {
        name: "header",
        label: "Header",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled", ui: { component: "hidden" } },
          { type: "image", name: "logo", label: "Logo Override" },
          { type: "string", name: "navLinks", label: "Custom Links (Label|URL)", list: true },
        ],
      },
      {
        name: "awards",
        label: "Awards & Recognitions",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "Awards",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Award Name" },
              { type: "string", name: "year", label: "Year" },
              { type: "string", name: "organization", label: "Organization" },
            ],
          },
        ],
      },
      { 
        name: "hero", 
        label: "Hero", 
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "headline", label: "Headline" },
          { type: "string", name: "subheadline", label: "Subheadline", ui: { component: "textarea" } }
        ] 
      },
      { name: "profile", label: "Profile", fields: [{ type: "boolean", name: "enabled", label: "Enabled" }] },
      {
        name: "services",
        label: "Services",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "Services",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
              { type: "string", name: "icon", label: "Icon" },
            ],
          },
        ],
      },
      {
        name: "timings",
        label: "Timings",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "Timings",
            list: true,
            fields: [
              { type: "string", name: "day", label: "Day / Unit" },
              { type: "string", name: "primary", label: "Primary Slot" },
              { type: "string", name: "secondary", label: "Secondary Slot" },
            ],
          },
        ],
      },
      {
        name: "gallery",
        label: "Gallery",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "Gallery",
            list: true,
            fields: [
              { type: "image", name: "src", label: "Image" },
              { type: "string", name: "alt", label: "Alt Text" },
            ],
          },
        ],
      },
      {
        name: "faq",
        label: "FAQ",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "FAQs",
            list: true,
            fields: [
              { type: "string", name: "question", label: "Question" },
              { type: "string", name: "answer", label: "Answer", ui: { component: "textarea" } },
            ],
          },
        ],
      },
      {
        name: "testimonials",
        label: "Testimonials",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "kicker", label: "Kicker Override" },
          { type: "string", name: "title", label: "Title Override" },
          {
            type: "object",
            name: "items",
            label: "Testimonials",
            list: true,
            fields: [
              { type: "string", name: "quote", label: "Quote", ui: { component: "textarea" } },
              { type: "string", name: "author", label: "Author" },
            ],
          },
        ],
      },
      {
        name: "stats",
        label: "Stats",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          {
            type: "object",
            name: "items",
            label: "Stats",
            list: true,
            fields: [
              { type: "string", name: "value", label: "Value" },
              { type: "string", name: "label", label: "Label" },
            ],
          },
        ],
      },
      {
        name: "cta",
        label: "CTA",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "title", label: "Title Override" },
          { type: "string", name: "body", label: "Body Override", ui: { component: "textarea" } },
        ],
      },
      {
        name: "text",
        label: "Custom Text Block",
        fields: [{ type: "boolean", name: "enabled", label: "Enabled" },
          { type: "string", name: "heading", label: "Heading" },
          { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "settings",
    label: "Page Settings",
    list: true,
    ui: {
      disableDrag: true,
      min: 3,
      max: 3,
      defaultItem: () => [
        { _template: "urlSettings", slug: "new-page", title: "New Page", path: "new-page", isHome: false },
        { _template: "presentation" },
        { _template: "seo" },
      ],
    },
    templates: [
      {
        name: "urlSettings",
        label: "URL Settings",
        fields: [
          { type: "string", name: "slug", label: "Page Slug", required: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "path", label: "URL Path", required: true },
          { type: "boolean", name: "isHome", label: "Is Home Page" },
        ],
      },
      {
        name: "presentation",
        label: "Presentation (overrides site-level)",
        fields: [
          {
            type: "string",
            name: "themeId",
            label: "Theme Layout",
            options: [
              { label: "Standard Practice", value: "doctor-standard" },
              { label: "Profile Intensive", value: "doctor-profile-heavy" },
              { label: "Service Focused", value: "doctor-service-heavy" },
              { label: "Hospital Standard", value: "hospital-standard" },
              { label: "Emergency First", value: "hospital-emergency-first" },
              { label: "Departmental", value: "hospital-departments" },
            ],
          },
          {
            type: "string",
            name: "variantPresetId",
            label: "Variant Preset",
            options: [
              { label: "Classic Medical", value: "doctor-classic" },
              { label: "Editorial Showcase", value: "doctor-editorial" },
              { label: "Compact Profile", value: "doctor-compact" },
              { label: "Premium Concierge", value: "doctor-premium" },
              { label: "Specialist Portfolio", value: "doctor-specialist" },
              { label: "Standard Institution", value: "hospital-standard" },
              { label: "Emergency Priority", value: "hospital-emergency" },
              { label: "Specialty Center", value: "hospital-specialty" },
              { label: "Community Health", value: "hospital-community" },
              { label: "Network Directory", value: "hospital-network" },
            ],
          },
          {
            type: "string",
            name: "styleId",
            label: "Style Preset",
            options: [
              { label: "Clinical Emerald", value: "doctor-teal-clean" },
              { label: "Warm Patient-Centric", value: "doctor-premium-warm" },
              { label: "Pediatric Playful", value: "doctor-bright-child" },
              { label: "Minimalist Aesthetic", value: "doctor-derma-minimal" },
              { label: "Modern Specialist", value: "doctor-slate-precision" },
              { label: "Trusted Institution", value: "hospital-blue-modern" },
              { label: "Wellness & Recovery", value: "hospital-green-trust" },
              { label: "High-Response Emergency", value: "hospital-red-emergency" },
              { label: "Corporate Specialty", value: "hospital-indigo-specialty" },
              { label: "Friendly Local Clinic", value: "hospital-community-soft" },
            ],
          },
        ],
      },
      {
        name: "seo",
        label: "SEO (overrides site-level)",
        fields: [
          { type: "string", name: "title", label: "Title" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "keywords", label: "Keywords", list: true },
          {
            type: "image",
            name: "ogImage",
            label: "Open Graph Image",
            description: "Upload to Media → content → doctors/hospitals → [tenant] folder",
          },
        ],
      },
    ],
  },
];

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "content",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "doctorSite",
        label: "Doctor Sites",
        path: "content/doctors",
        match: {
          include: "**/*",
          exclude: "**/pages-backup/*",
        },
        format: "json",
        templates: [
          {
            name: "site",
            label: "Site Settings",
            fields: siteFields,
          },
          {
            name: "page",
            label: "Page",
            fields: pageFields,
          },
        ],
        ui: {
          allowedActions: {
            create: true,
            delete: false,
          },
          router: ({ document }) => {
            const breadcrumbs = document?._sys?.breadcrumbs ?? [];
            const pagesIndex = breadcrumbs.indexOf("pages");
            if (pagesIndex > 0) {
              const tenantSlug = breadcrumbs[pagesIndex - 1] ?? "";
              const pageSlug = document?._sys?.filename ?? "home";
              return `/site/${tenantSlug}/${pageSlug}/preview`;
            }
            const tenantSlug = getTenantSlugFromSiteDocument(document);
            return `/site/${tenantSlug}/home/preview?editing=site`;
          },
        },
      },
      {
        name: "hospitalSite",
        label: "Hospital Sites",
        path: "content/hospitals",
        match: {
          include: "**/*",
          exclude: "**/pages-backup/*",
        },
        format: "json",
        templates: [
          {
            name: "site",
            label: "Site Settings",
            fields: siteFields,
          },
          {
            name: "page",
            label: "Page",
            fields: pageFields,
          },
        ],
        ui: {
          allowedActions: {
            create: true,
            delete: false,
          },
          router: ({ document }) => {
            const breadcrumbs = document?._sys?.breadcrumbs ?? [];
            const pagesIndex = breadcrumbs.indexOf("pages");
            if (pagesIndex > 0) {
              const tenantSlug = breadcrumbs[pagesIndex - 1] ?? "";
              const pageSlug = document?._sys?.filename ?? "home";
              return `/site/${tenantSlug}/${pageSlug}/preview`;
            }
            const tenantSlug = getTenantSlugFromSiteDocument(document);
            return `/site/${tenantSlug}/home/preview?editing=site`;
          },
        },
      },
    ],
  },
});
